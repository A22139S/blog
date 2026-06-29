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
 * 逼真海浪退潮动画 —— GSAP 时间轴驱动 SVG path 实时重算
 *
 * 三阶段时间轴：
 *   1. 涨潮 (surge)   ：潮水从屏幕底部涌上，覆盖全屏，振幅大、频率密
 *   2. 退潮 (recede)  ：潮水向下退出，振幅逐渐减小、频率变疏（波长变长）
 *   3. 泡沫消散 (foam)：白色泡沫线 + 湿沙拖尾淡出，露出视频
 *
 * 波形生成：sin 基波 + 二次谐波叠加 + 预生成噪声扰动
 *   - 多控制点（每 18 viewBox px 一个点），保证波形平滑
 *   - 噪声表预生成 20 个随机值，避免每帧 Math.random() 抖动
 *
 * 横向流动：flowPhase 持续累加，所有波浪线向右流动
 * 颜色：深蓝（底）→ 浅蓝（中）→ 白色泡沫（顶），CSS 变量响应深色模式
 */
export function WaveOverlay({
  delay = 0.4,
  revealAt = 0.5,
  onReveal,
  onComplete,
}: WaveOverlayProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const waterRef = useRef<SVGPathElement>(null)
  const foam1Ref = useRef<SVGPathElement>(null)
  const foam2Ref = useRef<SVGPathElement>(null)
  const wetSandRef = useRef<SVGRectElement>(null)

  // 用 ref 保存回调避免 useEffect 重跑（动画中断）
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

    gsap.set(overlay, { yPercent: 0 })

    // ===== 状态对象：由 GSAP timeline 驱动 =====
    const state = {
      waterLevel: 1180,    // 起始潮水在屏幕底部下方（不可见）
      amplitude: 18,       // 起始小振幅（涨潮前平静）
      frequency: 220,      // 起始低频（涨潮前波长长）
      foamAlpha: 0,        // 起始无泡沫
      wetSandAlpha: 0,     // 起始无湿沙
      flowPhase: 0,        // 横向流动相位（持续累加）
      randomness: 1.5,     // 噪声扰动幅度
    }

    // 预生成噪声表（20 个 [-1, 1] 随机数），避免每帧 Math.random() 抖动
    const NOISE_SIZE = 24
    const noiseTable = Array.from({ length: NOISE_SIZE }, () => Math.random() * 2 - 1)

    // ===== 波形 path 生成器 =====
    // 多控制点拟合 sin 基波 + 二次谐波 + 噪声扰动
    function buildWave(
      yBase: number,
      amp: number,
      freq: number,
      phase: number,
      close: boolean,
      noiseAmp: number = state.randomness
    ): string {
      const leftX = -240
      const rightX = 2160
      const step = 18
      const parts: string[] = []
      let isFirst = true
      for (let x = leftX; x <= rightX; x += step) {
        // 基波
        let y = yBase + Math.sin((x / freq) * Math.PI * 2 + phase) * amp
        // 二次谐波（频率 ×2，振幅 ×1/3）—— 让波形不对称、更自然
        y += Math.sin((x / (freq / 2)) * Math.PI * 2 + phase * 1.7) * (amp / 3)
        // 噪声扰动（基于位置查表，相位偏移制造"流动的扰动"）
        const noiseIdx = Math.floor(Math.abs(x + phase * 60) / 90) % NOISE_SIZE
        y += noiseTable[noiseIdx] * noiseAmp

        if (isFirst) {
          parts.push(`M ${x},${y.toFixed(2)}`)
          isFirst = false
        } else {
          parts.push(`L ${x},${y.toFixed(2)}`)
        }
      }
      if (close) {
        parts.push(`L ${rightX},1280`)
        parts.push(`L ${leftX},1280`)
        parts.push('Z')
      }
      return parts.join(' ')
    }

    // ===== 渲染函数：每帧重算所有 path =====
    function render() {
      // 主水体（闭合）
      if (waterRef.current) {
        waterRef.current.setAttribute(
          'd',
          buildWave(state.waterLevel, state.amplitude, state.frequency, state.flowPhase, true)
        )
      }
      // 泡沫线 1（贴近水位上方，振幅略小，相位偏移）
      if (foam1Ref.current) {
        foam1Ref.current.setAttribute(
          'd',
          buildWave(
            state.waterLevel - 4,
            state.amplitude * 0.78,
            state.frequency * 0.92,
            state.flowPhase * 1.35,
            false,
            state.randomness * 1.4
          )
        )
        foam1Ref.current.setAttribute('opacity', String(state.foamAlpha))
      }
      // 泡沫线 2（贴近水位下方，更浅的次级波纹）
      if (foam2Ref.current) {
        foam2Ref.current.setAttribute(
          'd',
          buildWave(
            state.waterLevel + 12,
            state.amplitude * 0.55,
            state.frequency * 1.18,
            state.flowPhase * 0.72,
            false,
            state.randomness * 1.8
          )
        )
        foam2Ref.current.setAttribute('opacity', String(state.foamAlpha * 0.6))
      }
      // 湿沙带（拖尾）：紧贴水位下方
      if (wetSandRef.current) {
        const sandY = state.waterLevel + state.amplitude + 24
        wetSandRef.current.setAttribute('y', String(Math.max(-200, sandY)))
        wetSandRef.current.setAttribute('opacity', String(state.wetSandAlpha))
      }
    }

    // ===== 横向流动循环（独立于主时间轴，持续到组件卸载）=====
    const flowTween = gsap.to(state, {
      flowPhase: Math.PI * 2, // 一个完整周期（与起点形状一致 → 无缝循环）
      duration: 3.5,
      ease: 'none',
      repeat: -1,
      onUpdate: render,
    })

    // ===== 主时间轴：涨潮 → 退潮 → 泡沫消散 =====
    let revealFired = false
    const tl = gsap.timeline({
      delay,
      onComplete: () => onCompleteRef.current?.(),
      onUpdate: function () {
        // 退潮进度达到阈值时触发 onReveal（只触发一次）
        // 退潮从 t=0.9s 开始，总时长 1.8s，所以退潮进度 = (totalProgress - 0.9/3.4) / (1.8/3.4)
        const totalDur = 3.4
        const recedeStart = 0.9 / totalDur
        const recedeEnd = 2.7 / totalDur
        const recedeProgress = (this.progress() - recedeStart) / (recedeEnd - recedeStart)
        if (!revealFired && recedeProgress >= revealAt) {
          revealFired = true
          onRevealRef.current?.()
        }
      },
    })

    // 阶段 1：涨潮（0 ~ 0.9s）—— 潮水从底部涌上覆盖全屏
    //   水位 1180 → -60，振幅放大 18 → 75，频率变密 220 → 105
    tl.to(
      state,
      {
        waterLevel: -60,
        amplitude: 75,
        frequency: 105,
        foamAlpha: 0.85,
        randomness: 2.5,
        duration: 0.9,
        ease: 'power4.inOut',
      },
      0
    )

    // 阶段 2：退潮（0.9 ~ 2.7s）—— 潮水向下退出，振幅衰减、频率变疏
    //   水位 -60 → 1250，振幅 75 → 8，频率 105 → 340（波长变长，波纹变疏）
    //   泡沫逐渐变淡，湿沙显现
    tl.to(
      state,
      {
        waterLevel: 1250,
        amplitude: 8,
        frequency: 340,
        foamAlpha: 0.35,
        wetSandAlpha: 0.7,
        randomness: 3.5,
        duration: 1.8,
        ease: 'power4.inOut',
      },
      0.9
    )

    // 阶段 3：泡沫消散（2.4 ~ 3.4s）—— 与退潮末段重叠
    //   泡沫和湿沙完全淡出，振幅归零
    tl.to(
      state,
      {
        foamAlpha: 0,
        wetSandAlpha: 0,
        amplitude: 1.5,
        randomness: 0.5,
        duration: 1.0,
        ease: 'power2.out',
      },
      2.4
    )

    // 整体容器轻微下沉，确保最后阶段完全退出屏幕
    tl.to(
      overlay,
      {
        yPercent: 4,
        duration: 0.6,
        ease: 'power2.in',
      },
      2.8
    )

    // 尊重 prefers-reduced-motion：直接跳到结束状态
    if (reduceMotion) {
      tl.progress(1)
      flowTween.kill()
    }

    return () => {
      tl.kill()
      flowTween.kill()
    }
  }, [delay, revealAt])

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
          {/* 海洋渐变：绑定到 userSpaceOnUse，水位下移时渐变保持全局分布 */}
          <linearGradient id="oceanGrad" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="1080">
            <stop offset="0%" style={{ stopColor: 'var(--ocean-foam)' }} />
            <stop offset="15%" style={{ stopColor: 'var(--ocean-top)' }} />
            <stop offset="55%" style={{ stopColor: 'var(--ocean-mid)' }} />
            <stop offset="100%" style={{ stopColor: 'var(--ocean-bottom)' }} />
          </linearGradient>
          {/* 湿沙渐变：上实下虚，模拟海水退去后的湿痕 */}
          <linearGradient id="wetSandGrad" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="120">
            <stop offset="0%" stopColor="rgba(255,255,255,0.45)" />
            <stop offset="60%" stopColor="rgba(255,255,255,0.15)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
        </defs>

        {/* 湿沙带（拖尾）：位于潮水下方，潮水退去后显现 */}
        <rect ref={wetSandRef} x="-240" width="2400" height="120" fill="url(#wetSandGrad)" opacity="0" />

        {/* 主水体（闭合 path，含波浪上边缘 + 渐变填充）*/}
        <path ref={waterRef} fill="url(#oceanGrad)" />

        {/* 泡沫线 1（贴近水位上方，主泡沫）*/}
        <path
          ref={foam1Ref}
          fill="none"
          stroke="rgba(255,255,255,0.9)"
          strokeWidth="2.5"
          vectorEffect="non-scaling-stroke"
          strokeLinecap="round"
        />

        {/* 泡沫线 2（贴近水位下方，次级泡沫）*/}
        <path
          ref={foam2Ref}
          fill="none"
          stroke="rgba(255,255,255,0.55)"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
          strokeLinecap="round"
        />
      </svg>
    </div>
  )
}
