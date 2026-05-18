import Link from 'next/link'
import { tagToSlug } from '@/lib/utils'

interface TagBadgeProps {
  tag: string
}

/**
 * 标签徽章组件
 * 点击后跳转到全部文章页并按标签筛选
 */
export function TagBadge({ tag }: TagBadgeProps) {
  return (
    <Link
      href={`/blog?tag=${tagToSlug(tag)}`}
      className="tag-badge"
    >
      #{tag}
    </Link>
  )
}
