'use client'

import { useRef, useEffect } from 'react'
import gsap from 'gsap'

interface WaveOverlayProps {
  /** 动画开始前的延迟（秒） */
  delay?: number
  /** 退潮进度达到该阈值时触发 onReveal（0~1），用于提前启动视频衔接 */
  revealAt?: number
  /** 退潮进度达到 revealAt 时的回调（视频可在此开始播放） */
  onReveal?: () => void
  /** 动画完全结束后的回调 */
  onComplete?: () => void
}

/**
 * P3R 风格海浪退潮动画
 *
 * 严格参考 https://asia.sega.com/p3r/cn/ 官网加载动画：
 *
 * 结构：蓝色 .p3r-wave-box 覆盖全屏，SVG 波浪在顶部边缘（向上突出 10vh）
 *       波浪以下 = 蓝色水体，波浪以上 = 透明（露出 loading 背景）
 *
 * 波浪：4 层 <use> 引用同一条 gentle-wave path，不同透明度 + 不同流速
 *       @keyframes p3r-move-waves 水平来回平移（-90px → 85px），视差效果
 *       4 层时长：3s / 5.5s / 13s / 20s（越深的层越慢）
 *
 * 退潮：.p3r-wave-box 整体 translateY(0 → 110%)，2.5s
 *       CSS transition: cubic-bezier(0.03, 0.1, 0.25, 1.02) — 略微过冲 = 水的惯性
 *       波浪形上边缘扫过屏幕 = 退潮效果
 *
 * 颜色：#029eeb（P3R 标志性亮蓝）+ rgba(2,158,235, 0.7/0.5/0.2)
 *
 * 与 P3R 原版的唯一区别：用 GSAP delayedCall 精确控制 onReveal/onComplete 回调时机
 */
export function WaveOverlay({
  delay = 0.6,
  revealAt = 0.5,
  onReveal,
  onComplete,
}: WaveOverlayProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const waveBoxRef = useRef<HTMLDivElement>(null)

  // 用 ref 保存回调避免 useEffect 重跑
  const onRevealRef = useRef(onReveal)
  const onCompleteRef = useRef(onComplete)
  useEffect(() => {
    onRevealRef.current = onReveal
    onCompleteRef.current = onComplete
  })

  useEffect(() => {
    const overlay = overlayRef.current
    const waveBox = waveBoxRef.current
    if (!overlay || !waveBox) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const SLIDE_DURATION = 2.5 // P3R 原版退潮时长（秒）

    // 退潮过渡时长：reduced-motion 时设为 0
    if (reduceMotion) {
      waveBox.style.transition = 'none'
    } else {
      waveBox.style.transition = `transform ${SLIDE_DURATION}s cubic-bezier(0.03, 0.1, 0.25, 1.02)`
    }

    // 用 GSAP delayedCall 精确控制时机
    const timers: gsap.core.Tween[] = []

    // 1. delay 后触发退潮：添加 .run 类 → CSS transition 驱动 translateY(110%)
    timers.push(
      gsap.delayedCall(delay, () => {
        waveBox.classList.add('run')
      })
    )

    // 2. 退潮进度达到 revealAt 时触发 onReveal（提前开始播放视频）
    if (!reduceMotion) {
      const revealTime = delay + SLIDE_DURATION * revealAt
      timers.push(
        gsap.delayedCall(revealTime, () => {
          onRevealRef.current?.()
        })
      )
    } else {
      // reduced-motion：立即触发 reveal
      onRevealRef.current?.()
    }

    // 3. 退潮完成后：隐藏 overlay + 触发 onComplete
    const completeTime = delay + (reduceMotion ? 0 : SLIDE_DURATION)
    timers.push(
      gsap.delayedCall(completeTime + 0.1, () => {
        if (overlay) {
          gsap.set(overlay, { autoAlpha: 0 })
        }
        onCompleteRef.current?.()
      })
    )

    return () => {
      timers.forEach((t) => t.kill())
    }
  }, [delay, revealAt])

  return (
    <div
      ref={overlayRef}
      className="hero-wave-overlay"
      style={{ position: 'fixed', inset: 0, zIndex: 999, pointerEvents: 'none' }}
      aria-hidden
    >
      {/*
        wave-box：蓝色水体，覆盖全屏
        退潮时整体向下滑出（CSS transition translateY 110%）
        顶部边缘有 SVG 波浪 = 潮线
      */}
      <div ref={waveBoxRef} className="p3r-wave-box">
        {/*
          SVG 波浪：viewBox="0 24 150 28" preserveAspectRatio="none"
          位置 top: -10vh（向上突出 10vh = 波浪区域）
          4 层 <use> 引用同一条 gentle-wave path，不同 y 偏移 + 透明度 + 流速
        */}
        <svg
          className="p3r-waves"
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
          viewBox="0 24 150 28"
          preserveAspectRatio="none"
          shapeRendering="auto"
        >
          <defs>
            <path
              id="gentle-wave"
              d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z"
            />
          </defs>
          <g className="p3r-parallax">
            <use xlinkHref="#gentle-wave" x="48" y="0" fill="rgba(2, 158, 235, 0.7)" />
            <use xlinkHref="#gentle-wave" x="48" y="3" fill="rgba(2, 158, 235, 0.5)" />
            <use xlinkHref="#gentle-wave" x="48" y="5" fill="rgba(2, 158, 235, 0.2)" />
            <use xlinkHref="#gentle-wave" x="48" y="7" fill="#029eeb" />
          </g>
        </svg>
      </div>
    </div>
  )
}
