'use client'

import { useRef, useEffect } from 'react'
import gsap from 'gsap'

/**
 * App Router 路由切换动画包装
 * 每次路由变化时此组件重新挂载，触发淡入淡出过渡
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const el = containerRef.current

    if (reduceMotion) {
      gsap.set(el, { autoAlpha: 1 })
      return
    }

    gsap.fromTo(
      el,
      { autoAlpha: 0, y: 8 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.5,
        ease: 'power2.out',
        clearProps: 'transform',
      }
    )
  }, [])

  return <div ref={containerRef}>{children}</div>
}