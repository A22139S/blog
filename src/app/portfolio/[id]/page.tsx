import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { projects } from '@/lib/portfolio-data'
import { CATEGORY_LABELS } from '@/types/portfolio'
import type { ProjectCategory } from '@/types/portfolio'
import CodeHighlighter from '@/components/CodeHighlighter'
import ArticleDetail from '@/components/ArticleDetail'

interface Props {
  params: { id: string }
}

export function generateStaticParams() {
  return projects.map((p) => ({ id: p.id }))
}

export function generateMetadata({ params }: Props): Metadata {
  const project = projects.find((p) => p.id === params.id)
  if (!project) return { title: 'Project not found' }
  return {
    title: `${project.title} - 作品集`,
    description: project.description,
  }
}

export default function PortfolioDetailPage({ params }: Props) {
  const project = projects.find((p) => p.id === params.id)

  if (!project) {
    notFound()
  }

  const cat = project.category as ProjectCategory

  return (
    <ArticleDetail
      title={project.title}
      description={project.description}
      tags={project.tags}
      contentSelector=".ad-content"
      breadcrumb={
        <Link
          href="/portfolio"
          className="inline-flex items-center gap-1.5 text-sm hover:underline"
          style={{ color: '#999' }}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          返回作品集
        </Link>
      }
      headerExtra={
        <div>
          {/* 分类标签 + 精选标记 */}
          <div className="flex flex-wrap items-center gap-2.5 mb-6">
            <span
              className="inline-flex text-xs font-medium tracking-wide uppercase px-2.5 py-1 rounded"
              style={{ color: '#2563eb', background: '#eff6ff' }}
            >
              {CATEGORY_LABELS[cat]}
            </span>
            {project.featured && (
              <span
                className="inline-flex text-xs font-medium tracking-wide uppercase px-2.5 py-1 rounded"
                style={{ color: '#d97706', background: '#fffbeb' }}
              >
                精选项目
              </span>
            )}
          </div>

          {/* 封面图 */}
          <div className="overflow-hidden rounded-xl mb-2" style={{ background: '#f5f5f3' }}>
            <img
              src={project.imageUrl}
              alt={project.title}
              className="w-full object-cover max-h-[420px]"
              style={{ borderRadius: '10px' }}
            />
          </div>
        </div>
      }
      footerExtra={
        (project.demoUrl || project.githubUrl) ? (
          <div className="flex flex-wrap gap-4">
            {project.demoUrl && (
              <a
                href={project.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium text-white transition-colors hover:opacity-90"
                style={{ background: '#1a1a1a' }}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
                在线演示
              </a>
            )}
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-gray-50"
                style={{ borderColor: '#ddd', color: '#555' }}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                GitHub
              </a>
            )}
          </div>
        ) : undefined
      }
    >
      {project.contentHtml ? (
        <CodeHighlighter contentHtml={project.contentHtml} />
      ) : (
        <p style={{ color: '#888' }}>详情内容稍后更新。</p>
      )}
    </ArticleDetail>
  )
}
