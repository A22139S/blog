'use client'

import { useEffect, useState } from 'react'

interface TOCItem {
  id: string
  text: string
  level: number
}

export default function PortfolioTOC({ contentHtml }: { contentHtml?: string }) {
  const [headings, setHeadings] = useState<TOCItem[]>([])
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    if (!contentHtml) return

    const timer = setTimeout(() => {
      const article = document.querySelector('.portfolio-detail-content')
      if (!article) return

      const h2h3 = article.querySelectorAll('h2, h3')
      const items: TOCItem[] = []
      h2h3.forEach((el) => {
        const id = el.id || el.textContent?.replace(/\s+/g, '-').toLowerCase() || ''
        if (!el.id) el.id = id
        items.push({
          id,
          text: el.textContent || '',
          level: el.tagName === 'H2' ? 2 : 3,
        })
      })
      setHeadings(items)
    }, 300)

    return () => clearTimeout(timer)
  }, [contentHtml])

  useEffect(() => {
    if (headings.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        }
      },
      {
        rootMargin: '-80px 0px -70% 0px',
        threshold: 0,
      }
    )

    headings.forEach((h) => {
      const el = document.getElementById(h.id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [headings])

  if (headings.length === 0) {
    return null
  }

  return (
    <nav aria-label="目录" className="toc-sidebar">
      <ul className="space-y-0.5">
        {headings.map((h) => (
          <li key={h.id} className={h.level === 3 ? 'pl-4' : ''}>
            <a
              href={`#${h.id}`}
              className={[
                'block text-sm py-1.5 transition-colors duration-150 border-l-2',
                h.level === 3 ? 'pl-3' : 'pl-3',
                activeId === h.id
                  ? 'text-primary-600 dark:text-primary-400 font-medium border-primary-500'
                  : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 border-transparent hover:border-gray-300 dark:hover:border-gray-600',
              ].join(' ')}
              onClick={(e) => {
                e.preventDefault()
                const el = document.getElementById(h.id)
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  history.pushState(null, '', `#${h.id}`)
                }
              }}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
