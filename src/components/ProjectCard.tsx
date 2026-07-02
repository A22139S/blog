'use client'

import Link from 'next/link'
import type { Project } from '@/types/portfolio'

interface ProjectCardProps {
  project: Project
  index: number
}

export function ProjectCard({ project, index }: ProjectCardProps) {
  return (
    <Link
      href={`/portfolio/${project.id}`}
      className="portfolio-card group block rounded-xl border border-gray-200 bg-white overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-primary-300 active:scale-[0.98] dark:bg-gray-800/60 dark:border-gray-700/50 dark:hover:border-primary-500/40"
      data-portfolio-index={index}
    >
      <div className="aspect-video bg-gray-100 dark:bg-gray-700 overflow-hidden">
        <img
          src={project.imageUrl}
          alt={project.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            ;(e.target as HTMLImageElement).style.display = 'none'
          }}
        />
      </div>
      <div className="p-5">
        <div className="flex flex-wrap gap-2 mb-3">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-300"
            >
              {tag}
            </span>
          ))}
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          {project.title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2 mb-4">
          {project.description}
        </p>
        <div className="flex gap-4">
          {project.demoUrl && (
            <span
              role="link"
              tabIndex={0}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                window.open(project.demoUrl, '_blank', 'noopener noreferrer')
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  e.stopPropagation()
                  window.open(project.demoUrl, '_blank', 'noopener noreferrer')
                }
              }}
              className="text-sm font-medium text-primary-600 hover:underline dark:text-primary-400 cursor-pointer"
            >
              在线演示
            </span>
          )}
          {project.githubUrl && (
            <span
              role="link"
              tabIndex={0}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                window.open(project.githubUrl, '_blank', 'noopener noreferrer')
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  e.stopPropagation()
                  window.open(project.githubUrl, '_blank', 'noopener noreferrer')
                }
              }}
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer"
            >
              GitHub
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
