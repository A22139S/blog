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
 * 蓝色波浪遮罩：全屏蓝色海洋 + 底部 5 层 SVG 波浪叠加
 * 由 GSAP 驱动整体下滑（海洋下沉），露出后面的视频和首页
 * 自动 cleanup，支持 prefers-reduced-motion
 */
export function WaveOverlay({
  delay = 0.6,
  duration = 1.4,
  onComplete,
}: WaveOverlayProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const overlay = overlayRef.current
    if (!overlay) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // 浅色/深色模式渐变色（自上而下：浅→深，模拟海面到海底）
    const isDark = document.documentElement.classList.contains('dark')
    const gradientBg = isDark
      ? 'linear-gradient(180deg, #1a3868 0%, #0f1d3a 60%, #0a1530 100%)'
      : 'linear-gradient(180deg, #7ab8e8 0%, #469ce5 60%, #1e6bbf 100%)'

    overlay.style.background = gradientBg
    // 初始位置：完整覆盖屏幕（yPercent: 0）
    gsap.set(overlay, { yPercent: 0 })

    // 5 层波浪在底部小幅起伏（持续动画）
    const waveEls = overlay.querySelectorAll<HTMLElement>('.wave-layer')
    const waveTweens: gsap.core.Tween[] = []
    waveEls.forEach((el, i) => {
      // 每层错开相位与幅度，制造层次感
      const tween = gsap.to(el, {
        y: `${-8 - i * 2}`,
        duration: 3 + i * 0.5,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        delay: i * 0.2,
      })
      waveTweens.push(tween)
    })

    // 整体下滑动画：海洋向下沉，露出后面的视频和首页
    const tl = gsap.timeline({
      delay,
      onComplete: () => onComplete?.(),
    })

    tl.to(overlay, {
      yPercent: 110,
      duration,
      ease: 'power3.inOut',
    })

    // 尊重 prefers-reduced-motion：直接跳到结束状态
    if (reduceMotion) {
      tl.progress(1)
      waveTweens.forEach((t) => t.kill())
    }

    return () => {
      tl.kill()
      waveTweens.forEach((t) => t.kill())
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
        {/* 5 层 SVG 波浪贴底叠加：保持原始 1920x200 比例，呈现真实水面波浪 */}
        <img src={`${basePath}/waves/wave-5.svg`} alt="" className="wave-layer" style={{ opacity: 0.5 }} />
        <img src={`${basePath}/waves/wave-4.svg`} alt="" className="wave-layer" style={{ opacity: 0.6 }} />
        <img src={`${basePath}/waves/wave-3.svg`} alt="" className="wave-layer" style={{ opacity: 0.7 }} />
        <img src={`${basePath}/waves/wave-2.svg`} alt="" className="wave-layer" style={{ opacity: 0.8 }} />
        <img src={`${basePath}/waves/wave-1.svg`} alt="" className="wave-layer" style={{ opacity: 0.9 }} />
      </div>
    </div>
  )
}