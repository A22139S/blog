'use client'

import { useRef, useEffect } from 'react'
import gsap from 'gsap'

interface WaveOverlayProps {
  /** 动画开始前的延迟（秒） */
  delay?: number
  /** 下滑动画总时长（秒） */
  duration?: number
  /** 退潮进度达到该阈值时触发 onReveal（0~1），用于提前启动视频衔接 */
  revealAt?: number
  /** 退潮进度达到 revealAt 时的回调（视频可在此开始播放） */
  onReveal?: () => void
  /** 动画结束后的回调 */
  onComplete?: () => void
}

/**
 * 蓝色潮水遮罩：SVG 波浪形上边缘（潮线）+ 渐变水体 + 水面涟漪
 *
 * 流动机制：所有 path 在 x 方向上以 320（一个完整波浪周期）为单位向右平移，
 * 平移满一个周期后形状与起点完全一致 → GSAP linear repeat 无缝循环。
 *
 * 退潮机制：GSAP timeline 驱动整个 overlay 容器 yPercent 0→110（向下退出）。
 * 退潮进度达到 revealAt 时触发 onReveal，让视频提前开始播放实现自然衔接。
 *
 * 上方（波浪线以上）透明露出视频，下方蓝色渐变 = 真正的潮水形状而非方块。
 */
export function WaveOverlay({
  delay = 0.6,
  duration = 2.6,
  revealAt = 0.55,
  onReveal,
  onComplete,
}: WaveOverlayProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const waterPathRef = useRef<SVGPathElement>(null)
  const ripple1Ref = useRef<SVGPathElement>(null)
  const ripple2Ref = useRef<SVGPathElement>(null)
  // 用 ref 保存回调，避免回调变化导致 useEffect 重新执行（动画中断）
  const onRevealRef = useRef(onReveal)
  const onCompleteRef = useRef(onComplete)
  useEffect(() => {
    onRevealRef.current = onReveal
    onCompleteRef.current = onComplete
  })

  useEffect(() => {
    const overlay = overlayRef.current
    if (!overlay) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // 初始：完整覆盖屏幕
    gsap.set(overlay, { yPercent: 0 })

    // 波浪周期 = 320（viewBox 单位）。所有 path 范围 [-640, 2560]，
    // 平移 [0, 320] 时 [0, 1920] 可视区始终被覆盖，无缝衔接。
    const WAVE_PERIOD = 320
    const flowTweens: gsap.core.Tween[] = []

    // 主水体潮线向右流动（4s 一个周期 —— 加快流速，更有水流质感）
    if (waterPathRef.current) {
      flowTweens.push(
        gsap.fromTo(
          waterPathRef.current,
          { attr: { transform: 'translate(0,0)' } },
          {
            attr: { transform: `translate(${WAVE_PERIOD},0)` },
            duration: 4,
            ease: 'none',
            repeat: -1,
          }
        )
      )
    }

    // 涟漪向右流动（比主水体更快，制造层次感）
    ;[ripple1Ref.current, ripple2Ref.current].forEach((el, i) => {
      if (!el) return
      flowTweens.push(
        gsap.fromTo(
          el,
          { attr: { transform: 'translate(0,0)' } },
          {
            attr: { transform: `translate(${WAVE_PERIOD},0)` },
            duration: 3 - i * 0.5,
            ease: 'none',
            repeat: -1,
          }
        )
      )
    })

    // 退潮：整体下滑，潮线从顶部下移至屏幕外
    // 用 power2.inOut 让退潮更柔和缓慢，避免突兀
    let revealFired = false
    const tl = gsap.timeline({
      delay,
      onComplete: () => onCompleteRef.current?.(),
      onUpdate: function () {
        // 退潮进度达到阈值时触发 onReveal（只触发一次）
        if (!revealFired && this.progress() >= revealAt) {
          revealFired = true
          onRevealRef.current?.()
        }
      },
    })
    tl.to(overlay, {
      yPercent: 110,
      duration,
      ease: 'power2.inOut',
    })

    // 尊重 prefers-reduced-motion：直接跳到结束状态
    if (reduceMotion) {
      tl.progress(1)
      flowTweens.forEach((t) => t.kill())
    }

    return () => {
      tl.kill()
      flowTweens.forEach((t) => t.kill())
    }
  }, [delay, duration, revealAt])

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
          周期 T=320，振幅 90（峰 y=50 / 谷 y=230，中线 y=140）
          path 范围 x∈[-640, 2560]（10 个周期），保证平移 320 时可视区 [0,1920] 无缝
        */}
        <path
          ref={waterPathRef}
          d="M -640,140 Q -480,50 -320,140 Q -160,230 0,140 Q 160,50 320,140 Q 480,230 640,140 Q 800,50 960,140 Q 1120,230 1280,140 Q 1440,50 1600,140 Q 1760,230 1920,140 Q 2080,50 2240,140 Q 2400,230 2560,140 L 2560,1080 L -640,1080 Z"
          fill="url(#oceanGrad)"
        />

        {/* 水面涟漪 1：贴近潮线的浅色波浪线，向右流动 */}
        <path
          ref={ripple1Ref}
          d="M -640,150 Q -480,60 -320,150 Q -160,240 0,150 Q 160,60 320,150 Q 480,240 640,150 Q 800,60 960,150 Q 1120,240 1280,150 Q 1440,60 1600,150 Q 1760,240 1920,150 Q 2080,60 2240,150 Q 2400,240 2560,150"
          fill="none"
          stroke="rgba(255,255,255,0.30)"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />

        {/* 水面涟漪 2：稍低、更浅的次级波纹，向右流动 */}
        <path
          ref={ripple2Ref}
          d="M -640,175 Q -480,95 -320,175 Q -160,255 0,175 Q 160,95 320,175 Q 480,255 640,175 Q 800,95 960,175 Q 1120,255 1280,175 Q 1440,95 1600,175 Q 1760,255 1920,175 Q 2080,95 2240,175 Q 2400,255 2560,175"
          fill="none"
          stroke="rgba(255,255,255,0.16)"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  )
}
