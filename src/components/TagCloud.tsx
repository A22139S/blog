import Link from 'next/link'
import type { TagCount } from '@/types'
import { tagToSlug } from '@/lib/utils'

interface TagCloudProps {
  tags: TagCount[]
  /** 当前选中的标签 slug（用于高亮） */
  activeTag?: string
}

/**
 * 标签云组件
 * 根据标签文章数量决定字体大小（视觉权重）
 * 点击跳转到全部文章页并按标签筛选
 */
export function TagCloud({ tags, activeTag }: TagCloudProps) {
  if (tags.length === 0) {
    return <p className="text-sm text-gray-400 dark:text-gray-500">暂无标签</p>
  }

  // 计算字体大小范围（0.75rem ~ 1.125rem）
  const maxCount = Math.max(...tags.map((t) => t.count))
  const minCount = Math.min(...tags.map((t) => t.count))
  const range = maxCount - minCount || 1

  const getFontSize = (count: number) => {
    const ratio = (count - minCount) / range
    return 0.75 + ratio * 0.375 // 12px ~ 18px
  }

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map(({ tag, count }) => {
        const tagSlug = tagToSlug(tag)
        const isActive = activeTag === tagSlug
        return (
          <Link
            key={tag}
            href={`/blog?tag=${tagSlug}`}
            title={`${tag}（${count} 篇）`}
            className={`transition-colors ${
              isActive
                ? 'font-semibold text-primary-600 dark:text-primary-400'
                : 'text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400'
            }`}
            style={{ fontSize: `${getFontSize(count)}rem` }}
          >
            #{tag}
          </Link>
        )
      })}
    </div>
  )
}
