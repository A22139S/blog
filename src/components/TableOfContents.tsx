'use client'

import { useEffect, useRef, useState } from 'react'
import type { TocItem } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface TableOfContentsProps {
  items: TocItem[]
}

/**
 * 文章目录组件
 * - 固定在文章详情页右侧
 * - 自动跟踪滚动位置，高亮当前章节
 * - 点击条目平滑滚动到对应标题
 */
export function TableOfContents({ items }: TableOfContentsProps) {
  // 当前高亮的标题 id
  const [activeId, setActiveId] = useState<string>('')
  // 记录组件是否已挂载（避免 SSR 问题）
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    if (items.length === 0) return

    // 收集所有标题元素
    const headingIds = items.map((item) => item.id)

    // 使用 IntersectionObserver 跟踪可见标题
    observerRef.current = new IntersectionObserver(
      (entries) => {
        // 找到最靠近顶部且已进入视口的标题
        const visibleEntries = entries.filter((e) => e.isIntersecting)
        if (visibleEntries.length > 0) {
          // 优先选 rootBound 上方最近的那个
          const top = visibleEntries.sort(
            (a, b) => a.boundingClientRect.top - b.boundingClientRect.top
          )[0]
          setActiveId(top.target.id)
        }
      },
      {
        // 顶部留出导航栏高度（80px），底部取 -40%
        rootMargin: '-80px 0% -40% 0%',
        threshold: 0,
      }
    )

    // 观察所有标题元素
    headingIds.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observerRef.current?.observe(el)
    })

    return () => {
      observerRef.current?.disconnect()
    }
  }, [items])

  if (items.length === 0) return null

  /** 点击目录条目：平滑滚动 + 修正固定导航栏偏移 */
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()
    const target = document.getElementById(id)
    if (!target) return

    // scroll-mt-20 = 80px，与 CSS 一致
    const offset = 80
    const top = target.getBoundingClientRect().top + window.scrollY - offset
    window.scrollTo({ top, behavior: 'smooth' })
    setActiveId(id)
  }

  return (
    <nav aria-label="文章目录" className="toc-container">
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
        目录
      </p>
      <ul className="space-y-0.5">
        {items.map((item) => {
          const isActive = activeId === item.id
          // 根据标题级别设置缩进
          const indent =
            item.level === 1
              ? 'pl-0'
              : item.level === 2
              ? 'pl-0'
              : item.level === 3
              ? 'pl-3'
              : 'pl-6'

          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                onClick={(e) => handleClick(e, item.id)}
                className={cn(
                  'block rounded py-1 text-sm leading-snug transition-all duration-150',
                  indent,
                  isActive
                    ? 'font-medium text-primary-600 dark:text-primary-400'
                    : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
                )}
              >
                {item.text}
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
