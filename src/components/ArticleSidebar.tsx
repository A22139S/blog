import Link from 'next/link'
import type { PostMeta } from '@/types'
import { formatDate } from '@/lib/utils'

interface ArticleSidebarProps {
  /** 全部文章列表 */
  posts: PostMeta[]
  /** 当前文章的 slug，用于高亮当前文章 */
  currentSlug: string
}

/**
 * 全部文章目录侧边栏组件（服务端组件）
 * 展示所有文章标题+日期，当前文章高亮标记，点击跳转对应文章详情页
 */
export function ArticleSidebar({ posts, currentSlug }: ArticleSidebarProps) {
  if (posts.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
        <p className="text-sm text-gray-400 dark:text-gray-500">暂无文章</p>
      </div>
    )
  }

  return (
    <nav aria-label="全部文章目录">
      <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
          全部文章
        </p>
        <ul className="space-y-1">
          {posts.map((post) => {
            const isActive = post.slug === currentSlug
            return (
              <li key={post.slug}>
                <Link
                  href={`/blog/${post.slug}`}
                  className={`block rounded-md px-3 py-2 text-sm transition-colors ${
                    isActive
                      ? 'bg-primary-50 font-medium text-primary-600 dark:bg-primary-900/20 dark:text-primary-400'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700/50 dark:hover:text-gray-200'
                  }`}
                >
                  <span className="line-clamp-2 leading-snug">{post.title}</span>
                  <span className={`mt-0.5 block text-xs ${isActive ? 'text-primary-500 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500'}`}>
                    {formatDate(post.date)}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}
