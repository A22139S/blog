'use client'

import { useEffect, useState } from 'react'
import { ThemeToggle } from './ThemeToggle'

/**
 * 右下角浮动工具栏
 * 包含：返回顶部按钮（滚动 400px 后显示）、深色模式切换
 */
export function FloatingToolbar() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 400)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="fixed right-6 bottom-8 z-40 flex flex-col gap-3">
      {/* 返回顶部 */}
      <button
        onClick={scrollToTop}
        aria-label="返回顶部"
        className={`flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-md transition-all duration-300 hover:border-primary-300 hover:text-primary-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:border-primary-600 dark:hover:text-primary-400 ${
          visible
            ? 'translate-y-0 opacity-100'
            : 'translate-y-4 opacity-0 pointer-events-none'
        }`}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 19V5M5 12l7-7 7 7" />
        </svg>
      </button>

      {/* 深色模式切换 */}
      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800">
        <ThemeToggle />
      </div>
    </div>
  )
}