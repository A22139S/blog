'use client'

import { useEffect, useState, useRef } from 'react'

/**
 * 阅读进度指示器
 * 方案一：文章顶部固定细进度条（scaleX 变换）
 * 方案二：TOC 高亮当前章节（IntersectionObserver）
 */
export function ReadingProgress() {
  const [progress, setProgress] = useState(0)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const handleScroll = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(() => {
        const article = document.querySelector('article')
        if (!article) return
        const rect = article.getBoundingClientRect()
        const articleTop = rect.top
        const articleHeight = rect.height
        const viewportHeight = window.innerHeight

        if (articleTop > 0) {
          setProgress(0)
          return
        }

        const scrolled = Math.abs(articleTop)
        const scrollable = articleHeight - viewportHeight
        if (scrollable <= 0) {
          setProgress(100)
          return
        }

        const pct = Math.min(100, Math.max(0, (scrolled / scrollable) * 100))
        setProgress(pct)
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-[2px] bg-transparent pointer-events-none">
      <div
        className="h-full bg-gradient-to-r from-primary-400 to-primary-600 transition-transform duration-150 ease-linear origin-left"
        style={{ transform: `scaleX(${progress / 100})` }}
      />
    </div>
  )
}

/**
 * TOC 当前章节高亮
 * 使用 IntersectionObserver 监听文章中的 h2/h3 标题元素
 * 在 TableOfContents 组件中通过 data-toc-highlight 属性标记当前项
 */
export function TocHighlighter() {
  useEffect(() => {
    const headings = document.querySelectorAll('article h2[id], article h3[id]')
    if (headings.length === 0) return

    const tocLinks = document.querySelectorAll('.toc-container a[href]')
    if (tocLinks.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // 清除所有高亮
            tocLinks.forEach((link) => {
              link.classList.remove('text-primary-600', 'dark:text-primary-400')
              link.classList.add('text-gray-500', 'dark:text-gray-400')
            })
            // 高亮当前项
            const targetLink = document.querySelector(
              `.toc-container a[href="#${entry.target.id}"]`
            )
            if (targetLink) {
              targetLink.classList.remove('text-gray-500', 'dark:text-gray-400')
              targetLink.classList.add('text-primary-600', 'dark:text-primary-400', 'font-medium')
            }
          }
        })
      },
      {
        rootMargin: '-80px 0px -60% 0px',
        threshold: 0,
      }
    )

    headings.forEach((h) => observer.observe(h))
    return () => observer.disconnect()
  }, [])

  return null
}