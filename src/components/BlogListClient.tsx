'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { PostCard } from '@/components/PostCard'
import { TagCloud } from '@/components/TagCloud'
import { tagToSlug } from '@/lib/utils'
import type { PostMeta, TagCount } from '@/types'

interface BlogListClientProps {
  allPosts: PostMeta[]
  tags: TagCount[]
}

/** 博客列表客户端组件 — 处理 searchParams 实现标签筛选（兼容静态导出） */
export function BlogListClient({ allPosts, tags }: BlogListClientProps) {
  const searchParams = useSearchParams()
  const tagSlug = searchParams.get('tag') ?? ''

  // 通过 slug 查找原始标签名
  const activeTagInfo = tagSlug
    ? tags.find((t) => tagToSlug(t.tag) === tagSlug)
    : null

  // 获取文章列表：有标签筛选时用筛选结果，否则全部
  const posts = activeTagInfo
    ? allPosts.filter((post) =>
        post.tags.map((t) => t.toLowerCase()).includes(activeTagInfo.tag.toLowerCase())
      )
    : allPosts

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">所有文章</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          共 <span className="font-semibold text-gray-700 dark:text-gray-300">{posts.length}</span> 篇文章
        </p>
      </header>

      {/* 标签云区域 */}
      <div className="mb-8 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          标签筛选
        </h2>
        <TagCloud tags={tags} activeTag={tagSlug} />
      </div>

      {/* 当前筛选提示 */}
      {activeTagInfo && (
        <div className="mb-6 flex items-center gap-3 rounded-lg bg-primary-50 px-4 py-3 dark:bg-primary-900/20">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            当前筛选：<span className="font-semibold text-primary-600 dark:text-primary-400">#{activeTagInfo.tag}</span>
          </span>
          <Link
            href="/blog"
            className="rounded-md bg-white px-3 py-1 text-xs font-medium text-gray-600 shadow-sm transition-colors hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            清除筛选
          </Link>
        </div>
      )}

      {/* 文章列表 */}
      {posts.length === 0 ? (
        <div className="py-20 text-center text-gray-500 dark:text-gray-400">
          <p className="text-lg">暂无文章</p>
          {activeTagInfo && (
            <p className="mt-2 text-sm">该标签下暂无文章，试试其他标签？</p>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </div>
  )
}
