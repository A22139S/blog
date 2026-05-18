import Link from 'next/link'
import type { PaginationData } from '@/types'
import { cn } from '@/lib/utils'

interface PaginationProps {
  pagination: PaginationData
  /** URL 基础路径，分页参数会以 ?page=N 形式追加 */
  basePath: string
}

/**
 * 分页导航组件
 * 展示：上一页、页码列表（含省略号）、下一页
 */
export function Pagination({ pagination, basePath }: PaginationProps) {
  const { currentPage, totalPages, hasPrevPage, hasNextPage } = pagination

  /**
   * 生成要显示的页码列表
   * 规则：始终显示首页和末页，当前页前后各显示 1 页，其余用省略号代替
   */
  const getPageNumbers = (): (number | 'ellipsis')[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    const pages: (number | 'ellipsis')[] = [1]

    if (currentPage > 3) pages.push('ellipsis')

    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i)
    }

    if (currentPage < totalPages - 2) pages.push('ellipsis')

    pages.push(totalPages)
    return pages
  }

  const buildUrl = (page: number) => {
    if (page === 1) return basePath
    return `${basePath}?page=${page}`
  }

  return (
    <nav aria-label="分页导航" className="flex items-center justify-center gap-1">
      {/* 上一页按钮 */}
      {hasPrevPage ? (
        <Link href={buildUrl(currentPage - 1)} className="pagination-btn">
          ← 上一页
        </Link>
      ) : (
        <span className="pagination-btn cursor-not-allowed opacity-40">← 上一页</span>
      )}

      {/* 页码列表 */}
      <div className="flex items-center gap-1">
        {getPageNumbers().map((page, idx) =>
          page === 'ellipsis' ? (
            <span key={`ellipsis-${idx}`} className="px-2 text-gray-400">
              …
            </span>
          ) : (
            <Link
              key={page}
              href={buildUrl(page)}
              aria-current={page === currentPage ? 'page' : undefined}
              className={cn(
                'pagination-btn',
                page === currentPage && 'pagination-btn-active'
              )}
            >
              {page}
            </Link>
          )
        )}
      </div>

      {/* 下一页按钮 */}
      {hasNextPage ? (
        <Link href={buildUrl(currentPage + 1)} className="pagination-btn">
          下一页 →
        </Link>
      ) : (
        <span className="pagination-btn cursor-not-allowed opacity-40">下一页 →</span>
      )}
    </nav>
  )
}
