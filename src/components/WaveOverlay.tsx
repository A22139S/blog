'use client'

import { useRef, useEffect } from 'react'
import gsap from 'gsap'

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

interface WaveOverlayProps {
  /** 动画开始前的延迟（秒） */
  delay?: number
  /** 下滑动画总时长（秒） */
  duration?: number
  /** 动画结束后的回调 */
  onComplete?: () => void
}

/**
 * 蓝色波浪遮罩：5 层 SVG 波浪叠加，从顶部滑出屏幕
 * 由 GSAP 驱动，自动 cleanup，支持 prefers-reduced-motion
 */
export function WaveOverlay({
  delay = 1,
  duration = 1.2,
  onComplete,
}: WaveOverlayProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const overlay = overlayRef.current
    if (!overlay) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // 浅色/深色模式颜色
    const isDark = document.documentElement.classList.contains('dark')
    const bgColor = isDark ? '#0f1d3a' : '#469ce5'

    // 用 CSS 渐变替代纯色，制造海平面层次的视觉
    const gradientBg = isDark
      ? 'linear-gradient(180deg, #0a1530 0%, #0f1d3a 50%, #1a3868 100%)'
      : 'linear-gradient(180deg, #1e6bbf 0%, #469ce5 50%, #7ab8e8 100%)'

    overlay.style.background = gradientBg
    gsap.set(overlay, {
      yPercent: -8,
    })

    // 5 层波浪独立浮动（持续动画）
    const waveEls = overlay.querySelectorAll<HTMLElement>('.wave-layer')
    waveEls.forEach((el, i) => {
      gsap.to(el, {
        y: `${10 - i * 2}`,
        duration: 3 + i * 0.5,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      })
    })

    // 整体下滑动画
    const tl = gsap.timeline({
      delay,
      onComplete: () => onComplete?.(),
    })

    tl.to(overlay, {
      yPercent: 110,
      duration,
      ease: 'power3.inOut',
    })

    if (reduceMotion) {
      tl.duration(0)
      waveEls.forEach((el) => gsap.killTweensOf(el))
    }

    return () => {
      tl.kill()
      waveEls.forEach((el) => gsap.killTweensOf(el))
    }
  }, [delay, duration, onComplete])

  return (
    <div
      ref={overlayRef}
      className="hero-wave-overlay"
      style={{ position: 'fixed', inset: 0, zIndex: 999, pointerEvents: 'none' }}
      aria-hidden
    >
      <div className="hero-waves">
        {/* SVG 翻转 180°：原始设计是水面波纹（贴底边），翻转后变为贴顶边的下滑边缘 */}
        <img src={`${basePath}/waves/wave-5.svg`} alt="" className="wave-layer wave-flip" style={{ opacity: 0.5 }} />
        <img src={`${basePath}/waves/wave-4.svg`} alt="" className="wave-layer wave-flip" style={{ opacity: 0.6 }} />
        <img src={`${basePath}/waves/wave-3.svg`} alt="" className="wave-layer wave-flip" style={{ opacity: 0.7 }} />
        <img src={`${basePath}/waves/wave-2.svg`} alt="" className="wave-layer wave-flip" style={{ opacity: 0.8 }} />
        <img src={`${basePath}/waves/wave-1.svg`} alt="" className="wave-layer wave-flip" style={{ opacity: 0.9 }} />
      </div>
    </div>
  )
}