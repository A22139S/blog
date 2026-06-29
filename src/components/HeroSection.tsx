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

  // 视频1播放完毕后切换到视频2
  const handleVideo1Ended = useCallback(() => {
    setVideo1Playing(false)
    if (video1Ref.current) {
      video1Ref.current.style.display = 'none'
    }
    const v2 = video2Ref.current
    if (v2) {
      if (v2.readyState >= 3) {
        safePlay(v2)
        setVideo2Playing(true)
      } else {
        v2.load()
        v2.addEventListener('canplay', () => {
          safePlay(v2)
          setVideo2Playing(true)
        }, { once: true })
      }
    }
  }, [safePlay])

  return (
    <section className="hero-section relative h-screen w-full overflow-hidden">
      {/* ===== 蓝色波浪遮罩（GSAP 驱动） ===== */}
      <WaveOverlay
        delay={0.6}
        duration={2.6}
        revealAt={0.55}
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
          loop
          playsInline
          preload="none"
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
