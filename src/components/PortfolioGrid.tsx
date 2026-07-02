'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { Project, ProjectCategory } from '@/types/portfolio'
import { CATEGORY_LABELS } from '@/types/portfolio'
import { ProjectCard } from '@/components/ProjectCard'

gsap.registerPlugin(ScrollTrigger)

interface PortfolioGridProps {
  projects: Project[]
}

export function PortfolioGrid({ projects }: PortfolioGridProps) {
  const [activeCategory, setActiveCategory] = useState<ProjectCategory>('all')
  const gridRef = useRef<HTMLDivElement>(null)

  const categories: ProjectCategory[] = ['all', 'web', 'tool', 'design', 'other']

  const filteredProjects = useMemo(() => {
    if (activeCategory === 'all') return projects
    return projects.filter((p) => p.category === activeCategory)
  }, [projects, activeCategory])

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mediaQuery.matches || !gridRef.current) return

    const ctx = gsap.context(() => {
      const cards = gridRef.current?.querySelectorAll('.portfolio-card')
      if (!cards || cards.length === 0) return

      gsap.fromTo(
        cards,
        { y: 24, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.08,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: gridRef.current,
            start: 'top 85%',
          },
        }
      )
    }, gridRef)

    return () => ctx.revert()
  }, [filteredProjects])

  return (
    <div>
      {/* 分类筛选 — 博客风格卡片 */}
      <div className="mb-8 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          分类筛选
        </h2>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors duration-200 ${
                activeCategory === cat
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
      </div>

      {filteredProjects.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-gray-400 dark:text-gray-500 text-lg">该分类暂无项目</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">尝试其他分类筛选</p>
        </div>
      ) : (
        <div ref={gridRef} className="portfolio-grid grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredProjects.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} />
          ))}
        </div>
      )}
    </div>
  )
}
