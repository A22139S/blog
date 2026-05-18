import Link from 'next/link'
import type { PostMeta } from '@/types'
import { formatDate, truncate } from '@/lib/utils'
import { TagBadge } from './TagBadge'

interface PostCardProps {
  post: PostMeta
}

/**
 * 文章卡片组件
 * 展示：标题、摘要、标签列表、发布日期、阅读时间
 */
export function PostCard({ post }: PostCardProps) {
  return (
    <article className="post-card">
      {/* 文章标题（链接） */}
      <h2 className="mb-2 text-xl font-bold leading-snug">
        <Link
          href={`/blog/${post.slug}`}
          className="text-gray-900 transition-colors hover:text-primary-600 dark:text-gray-50 dark:hover:text-primary-400"
        >
          {post.title}
        </Link>
      </h2>

      {/* 文章摘要 */}
      {post.summary && (
        <p className="mb-4 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
          {truncate(post.summary, 120)}
        </p>
      )}

      {/* 底部：标签 + 日期 + 阅读时间 */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* 标签组 */}
        <div className="flex flex-wrap gap-1.5">
          {post.tags.slice(0, 3).map((tag) => (
            <TagBadge key={tag} tag={tag} />
          ))}
          {post.tags.length > 3 && (
            <span className="text-xs text-gray-400 dark:text-gray-500">
              +{post.tags.length - 3}
            </span>
          )}
        </div>

        {/* 日期 + 阅读时间 */}
        <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500">
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          {post.readingTime && (
            <>
              <span>·</span>
              <span>{post.readingTime} 分钟阅读</span>
            </>
          )}
        </div>
      </div>

      {/* 悬浮时显示的箭头装饰 */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 text-primary-400 opacity-0 transition-opacity group-hover:opacity-100">
        →
      </div>
    </article>
  )
}
