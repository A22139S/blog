'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { siteConfig } from '@/lib/config'
import { AvatarWithFallback } from './AvatarWithFallback'
import { ThemeToggle } from './ThemeToggle'

/**
 * P3RE 风格 Hero 区域
 * 动画序列：蓝色波浪下滑 → 中心文字淡出 → 视频播放 → 右侧作者信息淡入
 */
export function HeroSection() {
  const [waveDone, setWaveDone] = useState(false)
  const [centerTextGone, setCenterTextGone] = useState(false)
  const [authorVisible, setAuthorVisible] = useState(false)
  const video1Ref = useRef<HTMLVideoElement>(null)
  const video2Ref = useRef<HTMLVideoElement>(null)

  const authorInitial = siteConfig.author.name.charAt(0)

  // 波浪动画结束后触发视频播放
  useEffect(() => {
    const timer = setTimeout(() => {
      setWaveDone(true)
      // 播放视频1
      video1Ref.current?.play()
    }, 4000) // 波浪下滑动画 3s + 1s delay

    return () => clearTimeout(timer)
  }, [])

  // 中心文字淡出
  useEffect(() => {
    const timer = setTimeout(() => {
      setCenterTextGone(true)
    }, 3000) // 3s 后开始淡出
    return () => clearTimeout(timer)
  }, [])

  // 作者信息淡入
  useEffect(() => {
    const timer = setTimeout(() => {
      setAuthorVisible(true)
    }, 4500) // 4.5s 后开始显示
    return () => clearTimeout(timer)
  }, [])

  // 视频1播放完毕后切换到视频2
  const handleVideo1Ended = () => {
    if (video1Ref.current) {
      video1Ref.current.style.display = 'none'
    }
    video2Ref.current?.play()
  }

  return (
    <section className="hero-section relative h-screen w-full overflow-hidden">
      {/* ===== 蓝色波浪遮罩 ===== */}
      <div
        className="hero-wave-overlay"
        onAnimationEnd={() => {
          // 波浪下滑动画结束后隐藏遮罩
          const el = document.getElementById('wave-overlay')
          if (el) el.style.display = 'none'
        }}
        id="wave-overlay"
      >
        <div className="hero-waves">
          <img src="/waves/wave-1.svg" alt="" className="hero-wave-1" />
          <img src="/waves/wave-2.svg" alt="" className="hero-wave-2" />
          <img src="/waves/wave-3.svg" alt="" className="hero-wave-3" />
          <img src="/waves/wave-4.svg" alt="" className="hero-wave-4" />
          <img src="/waves/wave-5.svg" alt="" className="hero-wave-5" />
        </div>
      </div>

      {/* ===== 视频背景 ===== */}
      <div className="hero-video-bg">
        <video
          ref={video2Ref}
          className="hero-video"
          muted
          loop
          playsInline
          preload="auto"
        >
          <source src="/videos/fv_movie2.mp4" type="video/mp4" />
        </video>
        <video
          ref={video1Ref}
          className="hero-video"
          muted
          playsInline
          onEnded={handleVideo1Ended}
          preload="auto"
        >
          <source src="/videos/fv_movie1.mp4" type="video/mp4" />
        </video>

        {/* 深色遮罩 - 增加文字可读性 */}
        <div className="hero-video-mask" />
      </div>

      {/* ===== 中心文字（站名 + 标语，渐隐） ===== */}
      <div
        className={`hero-center-text ${centerTextGone ? 'hero-center-text-out' : ''}`}
      >
        <h1 className="text-5xl font-bold tracking-wider text-white sm:text-7xl">
          {siteConfig.name}
        </h1>
        <p className="mt-4 text-lg text-white/80 sm:text-xl">
          {siteConfig.tagline}
        </p>
      </div>

      {/* ===== 右侧作者信息卡片 ===== */}
      <div className={`hero-author-card ${authorVisible ? 'hero-author-visible' : ''}`}>
        <div className="hero-author-glass">
          {/* 导航栏（浮动在 Hero 顶部） */}
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

          {/* 作者信息 */}
          <div className="hero-author-content">
            <div className="mb-5 flex justify-center">
              <div className="h-28 w-28 overflow-hidden rounded-full ring-4 ring-white/20">
                <AvatarWithFallback
                  src={siteConfig.author.avatar}
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

            {/* 社交链接 */}
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
      <div className={`hero-scroll-indicator ${authorVisible ? 'hero-scroll-visible' : ''}`}>
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
