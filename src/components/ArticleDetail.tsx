'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type { TocItem } from '@/lib/utils'

export interface ArticleDetailProps {
  /** 文章标题 */
  title: string
  /** 发布日期（已格式化） */
  date?: string
  /** 作者 */
  author?: string
  /** 阅读时间（分钟） */
  readingTime?: number
  /** 标签 */
  tags?: string[]
  /** 摘要/描述 */
  description?: string
  /** 服务端已提取的目录项（博客使用） */
  tocItems?: TocItem[]
  /** 客户端 DOM 提取目录的选择器（作品集使用） */
  contentSelector?: string
  /** 头部额外内容（封面图、分类标签、面包屑等） */
  headerExtra?: React.ReactNode
  /** 正文内容（MDX 或 HTML） */
  children: React.ReactNode
  /** 底部额外内容（上一篇/下一篇、外链等） */
  footerExtra?: React.ReactNode
  /** 面包屑导航 */
  breadcrumb?: React.ReactNode
}

/**
 * 文章详情统一布局组件
 *
 * 布局：左侧固定 TOC + 右侧滚动正文
 * - 博客文章和作品集项目共用此组件
 * - 博客：传入 tocItems（服务端提取），children 为 MDXRemote
 * - 作品集：传入 contentSelector，children 为 HTML
 */
export default function ArticleDetail({
  title,
  date,
  author,
  readingTime,
  tags,
  description,
  tocItems,
  contentSelector,
  headerExtra,
  children,
  footerExtra,
  breadcrumb,
}: ArticleDetailProps) {
  const [activeId, setActiveId] = useState<string>('')
  const [mobileTocOpen, setMobileTocOpen] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)

  // 作品集模式：从 DOM 提取标题
  const [domItems, setDomItems] = useState<TocItem[]>([])

  useEffect(() => {
    if (tocItems && tocItems.length > 0) return
    if (!contentSelector) return

    const timer = setTimeout(() => {
      const container = document.querySelector(contentSelector)
      if (!container) return

      const headings = container.querySelectorAll('h2, h3')
      const extracted: TocItem[] = []
      headings.forEach((el) => {
        const h = el as HTMLElement
        const level = h.tagName === 'H2' ? 2 : 3
        const text = h.textContent || ''
        let id = h.id
        if (!id) {
          id = text
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^\w\u4e00-\u9fa5-]/g, '')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '')
          h.id = id
        }
        extracted.push({ level, text, id })
      })
      setDomItems(extracted)
    }, 300)

    return () => clearTimeout(timer)
  }, [tocItems, contentSelector])

  const allItems = tocItems && tocItems.length > 0 ? tocItems : domItems

  // IntersectionObserver — 跟踪当前阅读章节
  useEffect(() => {
    if (allItems.length === 0) return
    if (observerRef.current) observerRef.current.disconnect()

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting)
        if (visible.length > 0) {
          // 取最靠近视口顶部的可见标题
          const top = visible.sort(
            (a, b) => a.boundingClientRect.top - b.boundingClientRect.top
          )[0]
          setActiveId(top.target.id)
        }
      },
      {
        rootMargin: '-80px 0px -60% 0px',
        threshold: 0,
      }
    )

    allItems.forEach((item) => {
      const el = document.getElementById(item.id)
      if (el) observerRef.current?.observe(el)
    })

    return () => observerRef.current?.disconnect()
  }, [allItems])

  // TOC 点击 — 平滑滚动
  const handleTocClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
      e.preventDefault()
      const el = document.getElementById(id)
      if (!el) return
      const offset = 80
      const top = el.getBoundingClientRect().top + window.scrollY - offset
      window.scrollTo({ top, behavior: 'smooth' })
      setActiveId(id)
      setMobileTocOpen(false)
    },
    []
  )

  const hasToc = allItems.length > 0

  const tocContent = (
    <nav className="ad-toc" aria-label="文章目录">
      <div className="ad-toc-title">本文导览</div>
      <ul className="ad-toc-list">
        {allItems.map((item) => {
          const isActive = activeId === item.id
          const isH3 = item.level === 3
          return (
            <li key={`${item.level}-${item.id}`}>
              <a
                href={`#${item.id}`}
                onClick={(e) => handleTocClick(e, item.id)}
                className={
                  'ad-toc-link' +
                  (isActive ? ' ad-toc-active' : '') +
                  (isH3 ? ' ad-toc-h3' : ' ad-toc-h2')
                }
              >
                {item.text}
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )

  return (
    <div className="ad-page">
      <div className="ad-wrapper">
        {/* ========== 左侧固定目录 ========== */}
        <aside className="ad-sidebar" aria-label="文章目录侧边栏">
          {hasToc && tocContent}
        </aside>

        {/* ========== 右侧滚动正文 ========== */}
        <main className="ad-main">
          <article className="ad-article">
            {/* 面包屑 */}
            {breadcrumb && <div className="ad-breadcrumb">{breadcrumb}</div>}

            {/* 头部额外（封面图、分类等） */}
            {headerExtra && <div className="ad-header-extra">{headerExtra}</div>}

            {/* 标题 */}
            <h1 className="ad-title">{title}</h1>

            {/* 元信息 */}
            {(date || author || (readingTime !== undefined)) && (
              <div className="ad-meta">
                {author && <span className="ad-meta-author">{author}</span>}
                {date && (
                  <time dateTime={date} className="ad-meta-date">
                    {date}
                  </time>
                )}
                {readingTime !== undefined && (
                  <span className="ad-meta-reading">阅读约 {readingTime} 分钟</span>
                )}
              </div>
            )}

            {/* 摘要 */}
            {description && <div className="ad-desc">{description}</div>}

            {/* 标签 */}
            {tags && tags.length > 0 && (
              <div className="ad-tags">
                {tags.map((tag) => (
                  <span key={tag} className="ad-tag">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* 正文 */}
            <div className="ad-content">{children}</div>

            {/* 底部 */}
            {footerExtra && <div className="ad-footer">{footerExtra}</div>}
          </article>
        </main>
      </div>

      {/* ========== 移动端目录按钮 ========== */}
      {hasToc && (
        <>
          <button
            className="ad-toc-mobile-btn"
            onClick={() => setMobileTocOpen(true)}
            aria-label="打开目录"
            title="目录"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          {mobileTocOpen && (
            <div
              className="ad-toc-overlay"
              onClick={() => setMobileTocOpen(false)}
              role="dialog"
              aria-modal="true"
              aria-label="文章目录"
            >
              <div
                className="ad-toc-drawer"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="ad-toc-drawer-header">
                  <span className="ad-toc-title">本文导览</span>
                  <button
                    onClick={() => setMobileTocOpen(false)}
                    aria-label="关闭目录"
                    className="ad-toc-close-btn"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
                <ul className="ad-toc-list">
                  {allItems.map((item) => {
                    const isActive = activeId === item.id
                    const isH3 = item.level === 3
                    return (
                      <li key={`m-${item.level}-${item.id}`}>
                        <a
                          href={`#${item.id}`}
                          onClick={(e) => handleTocClick(e, item.id)}
                          className={
                            'ad-toc-link' +
                            (isActive ? ' ad-toc-active' : '') +
                            (isH3 ? ' ad-toc-h3' : ' ad-toc-h2')
                          }
                        >
                          {item.text}
                        </a>
                      </li>
                    )
                  })}
                </ul>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
