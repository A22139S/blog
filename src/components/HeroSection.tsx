'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { siteConfig } from '@/lib/config'
import { AvatarWithFallback } from './AvatarWithFallback'
import { ThemeToggle } from './ThemeToggle'
import { WaveOverlay } from './WaveOverlay'

// 静态资源路径前缀：通过 NEXT_PUBLIC_BASE_PATH 环境变量配置
// GitHub Pages 构建时设为 /blog；腾讯云动态部署时为空
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

/**
 * P3RE 风格 Hero 区域
 * 动画序列：蓝色波浪下滑（GSAP） → 中心文字淡出（GSAP） → 视频1自动播放 → 视频1结束 → 视频2循环
 */
export function HeroSection() {
  const [centerTextGone, setCenterTextGone] = useState(false)
  const [authorVisible, setAuthorVisible] = useState(false)
  const [video1Playing, setVideo1Playing] = useState(false)
  const [video2Playing, setVideo2Playing] = useState(false)
  const video1Ref = useRef<HTMLVideoElement>(null)
  const video2Ref = useRef<HTMLVideoElement>(null)
  const centerTextRef = useRef<HTMLDivElement>(null)
  const authorCardRef = useRef<HTMLDivElement>(null)
  const scrollIndicatorRef = useRef<HTMLDivElement>(null)

  const authorInitial = siteConfig.author.name.charAt(0)

  // 安全播放视频（捕获 Promise rejection）
  const safePlay = useCallback(async (video: HTMLVideoElement | null) => {
    if (!video) return
    try {
      await video.play()
    } catch (err) {
      console.warn('Video play failed, retrying with muted:', err)
      video.muted = true
      try {
        await video.play()
      } catch (retryErr) {
        console.warn('Video play still failed after mute retry:', retryErr)
      }
    }
  }, [])

  // 退潮中途（潮线已下移约 55%，视频上半部分露出）→ 开始播放视频1
  // 视频在波浪还在退去的过程中就开始播放，被波浪遮挡的部分用户看不到，
  // 随着潮线下沉，视频逐渐露出且已在播放中 = 自然衔接，无空白
  // 同时预加载视频2，确保切换时 readyState 已就绪，避免黑屏
  const handleWaveReveal = useCallback(() => {
    const v1 = video1Ref.current
    if (v1) {
      if (v1.readyState >= 3) {
        safePlay(v1)
        setVideo1Playing(true)
      } else {
        v1.load()
        v1.addEventListener('canplay', () => {
          safePlay(v1)
          setVideo1Playing(true)
        }, { once: true })
      }
    }

    // 提前预加载视频2（与视频1播放并行），确保切换时无需等待
    const v2 = video2Ref.current
    if (v2 && v2.readyState < 3) {
      v2.load()
    }
  }, [safePlay])

  // 波浪完全退去后：中心文字淡出 + 作者卡片淡入 + 滚动指示器淡入
  const handleWaveComplete = useCallback(() => {
    // GSAP 中心文字淡出
    if (centerTextRef.current) {
      gsap.to(centerTextRef.current, {
        autoAlpha: 0,
        duration: 1.2,
        ease: 'power2.out',
      })
      setCenterTextGone(true)
    }

    // GSAP 作者卡片淡入
    if (authorCardRef.current) {
      gsap.fromTo(
        authorCardRef.current,
        { autoAlpha: 0, x: 40 },
        { autoAlpha: 1, x: 0, duration: 1.4, ease: 'power3.out', delay: 0.2 }
      )
      setAuthorVisible(true)
    }

    // 滚动指示器淡入
    if (scrollIndicatorRef.current) {
      gsap.fromTo(
        scrollIndicatorRef.current,
        { autoAlpha: 0, y: 10 },
        { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power2.out', delay: 1.5 }
      )
    }
  }, [])

  // 视频2无缝循环：用 requestVideoFrameCallback 检测接近结尾时提前 seek 到 0
  // 避免原生 loop 属性在 6.667s→0s 重置时的 1 帧黑屏（实测 brt:0 闪帧）
  useEffect(() => {
    const v2 = video2Ref.current
    if (!v2 || !video2Playing) return

    let handle: number
    const checkLoop = (_now: number, metadata: { mediaTime: number }) => {
      if (metadata.mediaTime > v2.duration - 0.08) {
        v2.currentTime = 0
      }
      handle = (v2 as any).requestVideoFrameCallback(checkLoop)
    }
    handle = (v2 as any).requestVideoFrameCallback(checkLoop)
    return () => (v2 as any).cancelVideoFrameCallback?.(handle)
  }, [video2Playing])

  // 视频1播放完毕后切换到视频2
  // 关键防黑屏措施（三重保障）：
  //   1. 禁用 CSS transition（避免与 GSAP opacity 动画冲突导致 1 帧闪屏）
  //   2. 在 setVideo2Playing(true) 移除 hero-video-hidden 类之前，先设置 v2.style.opacity='0'
  //      否则类移除后 CSS 默认 opacity=1，GSAP 会把 1 当作起始值 → v2 瞬间全显（非渐变）
  //   3. safePlay(v2) 后用 requestVideoFrameCallback + setTimeout 回退等待首帧渲染
  //      requestVideoFrameCallback 在 video opacity:0 时可能不触发（浏览器优化），
  //      用 100ms setTimeout 保底确保 beginFade 一定会被调用
  //   4. video1 延迟 0.2s 才开始淡出，此时 video2 已有较高 opacity，绝不会同时透明
  const handleVideo1Ended = useCallback(() => {
    const v1 = video1Ref.current
    const v2 = video2Ref.current
    if (!v1 || !v2) return

    // 禁用 CSS transition，让 GSAP 完全接管 opacity 动画
    v1.style.transition = 'none'
    v2.style.transition = 'none'

    const startCrossFade = () => {
      // video2 开始播放（此时 video2 opacity 仍为 0，不可见）
      safePlay(v2)

      let fadeStarted = false
      const beginFade = () => {
        if (fadeStarted) return
        fadeStarted = true

        // 关键：在 setVideo2Playing(true) 移除 hero-video-hidden 类之前，
        // 先设置内联 opacity:0。否则类移除后 CSS 默认 opacity 变为 1，
        // GSAP 会把 1 当作起始值，导致 v2 瞬间全显（而非从 0 渐变到 1）
        v2.style.opacity = '0'

        // GSAP 交叉淡入淡出：
        // v2: opacity 0 → 1 (0.5s, power2.out 先快后慢)
        // v1: opacity 1 → 0 (0.5s, delay 0.2s, power2.in 先慢后快)
        gsap.to(v2, {
          opacity: 1,
          duration: 0.5,
          ease: 'power2.out',
          onStart: () => { v2.style.pointerEvents = 'auto' },
        })
        gsap.to(v1, {
          opacity: 0,
          duration: 0.5,
          ease: 'power2.in',
          delay: 0.2,
          onComplete: () => {
            v1.pause()
            v1.style.display = 'none'
            setVideo1Playing(false)
          },
        })
        setVideo2Playing(true)
      }

      // 混合策略：requestVideoFrameCallback + setTimeout 回退
      // requestVideoFrameCallback 在 video opacity:0 时可能不触发（浏览器优化）
      // 用 100ms setTimeout 作为保底，确保 beginFade 一定会被调用
      if ('requestVideoFrameCallback' in v2) {
        const rvfcHandle = (v2 as any).requestVideoFrameCallback(() => beginFade())
        setTimeout(() => {
          if (!fadeStarted) {
            (v2 as any).cancelVideoFrameCallback?.(rvfcHandle)
            beginFade()
          }
        }, 100)
      } else {
        setTimeout(beginFade, 50)
      }
    }

    // video2 应已预加载（preload=auto），检查 readyState
    if (v2.readyState >= 3) {
      startCrossFade()
    } else {
      // 兜底：极少数情况下 video2 还没就绪，load 后等 canplay
      // 此时 video1 仍显示最后一帧（不 display:none），不会黑屏
      v2.load()
      v2.addEventListener('canplay', startCrossFade, { once: true })
    }
  }, [safePlay])

  return (
    <section className="hero-section relative h-screen w-full overflow-hidden">
      {/* ===== 蓝色波浪遮罩（GSAP 驱动） ===== */}
      <WaveOverlay
        delay={0.4}
        revealAt={0.5}
        onReveal={handleWaveReveal}
        onComplete={handleWaveComplete}
      />

      {/* ===== 视频背景 ===== */}
      <div className="hero-video-bg">
        <video
          ref={video1Ref}
          className={`hero-video ${!video1Playing ? 'hero-video-hidden' : ''}`}
          muted
          playsInline
          preload="auto"
          poster={`${basePath}/images/hero-poster.webp`}
          onEnded={handleVideo1Ended}
        >
          <source src={`${basePath}/videos/fv_movie1.mp4`} type="video/mp4" />
        </video>
        <video
          ref={video2Ref}
          className={`hero-video ${!video2Playing ? 'hero-video-hidden' : ''}`}
          muted
          playsInline
          preload="auto"
          poster={`${basePath}/images/hero-poster.webp`}
        >
          <source src={`${basePath}/videos/fv_movie2.mp4`} type="video/mp4" />
        </video>

        <div className="hero-video-mask" />
      </div>

      {/* ===== 中心文字 ===== */}
      <div ref={centerTextRef} className="hero-center-text">
        <h1 className="text-5xl font-bold tracking-wider text-white sm:text-7xl">
          {siteConfig.name}
        </h1>
        <p className="mt-4 text-lg text-white/80 sm:text-xl">
          {siteConfig.tagline}
        </p>
      </div>

      {/* ===== 右侧作者信息卡片 ===== */}
      <div ref={authorCardRef} className="hero-author-card" style={{ visibility: 'hidden' }}>
        <div className="hero-author-glass">
          <nav className="hero-nav">
            <Link href="/" className="hero-nav-logo">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 text-sm font-bold text-white backdrop-blur-sm">
                B
              </span>
            </Link>
            <div className="flex items-center gap-1">
              {siteConfig.nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-lg px-3 py-1.5 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
              <ThemeToggle />
            </div>
          </nav>

          <div className="hero-author-content">
            <div className="mb-5 flex justify-center">
              <div className="h-28 w-28 overflow-hidden rounded-full ring-4 ring-white/20">
                <AvatarWithFallback
                  src={`${basePath}${siteConfig.author.avatar}`}
                  fallback={authorInitial}
                  alt={siteConfig.author.name}
                />
              </div>
            </div>

            <h2 className="mb-2 text-center text-xl font-bold text-white">
              {siteConfig.author.name}
            </h2>

            <p className="mb-5 text-center text-sm leading-relaxed text-white/70">
              {siteConfig.author.bio}
            </p>

            <div className="mb-5 flex justify-center gap-3">
              {siteConfig.author.github && (
                <a
                  href={siteConfig.author.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/70 transition-colors hover:bg-white/20 hover:text-white"
                  aria-label="GitHub"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                </a>
              )}
              {siteConfig.author.email && (
                <a
                  href={`mailto:${siteConfig.author.email}`}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/70 transition-colors hover:bg-white/20 hover:text-white"
                  aria-label="Email"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="M22 7l-10 7L2 7" />
                  </svg>
                </a>
              )}
            </div>

            <Link
              href="/about"
              className="inline-block w-full rounded-lg bg-white/15 py-2.5 text-center text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/25"
            >
              了解更多 →
            </Link>
          </div>
        </div>
      </div>

      {/* ===== 滚动指示器 ===== */}
      <div ref={scrollIndicatorRef} className="hero-scroll-indicator" style={{ visibility: 'hidden' }}>
        <div className="hero-scroll-arrow">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M19 12l-7 7-7-7" />
          </svg>
        </div>
        <span className="text-xs text-white/50">向下滚动</span>
      </div>
    </section>
  )
}
