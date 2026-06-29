'use client'

import { useRef, useEffect } from 'react'
import gsap from 'gsap'

interface WaveOverlayProps {
  /** 动画开始前的延迟（秒） */
  delay?: number
  /** 下滑动画总时长（秒） */
  duration?: number
  /** 动画结束后的回调 */
  onComplete?: () => void
}

/**
 * 蓝色潮水遮罩：SVG 波浪形上边缘（潮线）+ 渐变水体 + 水面涟漪
 * GSAP 驱动整体下滑（退潮），露出后面的视频和首页
 * 上方（波浪线以上）透明，下方（波浪线以下）蓝色 —— 真正的潮水形状而非方块
 */
export function WaveOverlay({
  delay = 0.6,
  duration = 1.4,
  onComplete,
}: WaveOverlayProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const ripple1Ref = useRef<SVGPathElement>(null)
  const ripple2Ref = useRef<SVGPathElement>(null)

  useEffect(() => {
    const overlay = overlayRef.current
    if (!overlay) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // 初始：完整覆盖屏幕（yPercent: 0）
    gsap.set(overlay, { yPercent: 0 })

    // 水面涟漪：横向流动 + 上下浮动，模拟水面波纹
    const rippleTweens: gsap.core.Tween[] = []
    ;[ripple1Ref.current, ripple2Ref.current].forEach((el, i) => {
      if (!el) return
      // 横向缓慢流动
      rippleTweens.push(
        gsap.to(el, {
          x: -45 - i * 10,
          duration: 5 + i,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
        })
      )
      // 上下轻微浮动
      rippleTweens.push(
        gsap.to(el, {
          y: 6 + i * 2,
          duration: 3 + i * 0.5,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
        })
      )
    })

    // 退潮：整体下滑，潮线从顶部下移至屏幕外
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
      rippleTweens.forEach((t) => t.kill())
    }

    return () => {
      tl.kill()
      rippleTweens.forEach((t) => t.kill())
    }
  }, [delay, duration, onComplete])

  return (
    <div
      ref={overlayRef}
      className="hero-wave-overlay"
      style={{ position: 'fixed', inset: 0, zIndex: 999, pointerEvents: 'none' }}
      aria-hidden
    >
      <svg
        className="wave-body-svg"
        viewBox="0 0 1920 1080"
        preserveAspectRatio="none"
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          display: 'block',
        }}
      >
        <defs>
          <linearGradient id="oceanGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" style={{ stopColor: 'var(--ocean-top)' }} />
            <stop offset="50%" style={{ stopColor: 'var(--ocean-mid)' }} />
            <stop offset="100%" style={{ stopColor: 'var(--ocean-bottom)' }} />
          </linearGradient>
        </defs>

        {/*
          主水体：波浪形上边缘（潮线）+ 渐变填充至底部
          波浪在 y=50（峰）到 y=230（谷）之间起伏，中线 y=140
          上方（y < 波浪线）透明，露出视频；下方蓝色 = 潮水
        */}
        <path
          d="M 0,140 Q 160,50 320,140 Q 480,230 640,140 Q 800,50 960,140 Q 1120,230 1280,140 Q 1440,50 1600,140 Q 1760,230 1920,140 L 1920,1080 L 0,1080 Z"
          fill="url(#oceanGrad)"
        />

        {/* 水面涟漪 1：贴近潮线的浅色波浪线，GSAP 横向流动 */}
        <path
          ref={ripple1Ref}
          d="M -60,150 Q 120,70 300,150 Q 480,230 660,150 Q 840,70 1020,150 Q 1200,230 1380,150 Q 1560,70 1740,150 Q 1920,230 2100,150"
          fill="none"
          stroke="rgba(255,255,255,0.30)"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />

        {/* 水面涟漪 2：稍低、更浅的次级波纹 */}
        <path
          ref={ripple2Ref}
          d="M -80,180 Q 140,110 360,180 Q 580,250 800,180 Q 1020,110 1240,180 Q 1460,250 1680,180 Q 1900,110 2120,180"
          fill="none"
          stroke="rgba(255,255,255,0.16)"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  )
}
