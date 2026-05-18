import type { Metadata } from 'next'
import { Suspense } from 'react'
import { getAllPosts, getAllTags } from '@/lib/posts'
import { siteConfig } from '@/lib/config'
import { BlogListClient } from '@/components/BlogListClient'

export const metadata: Metadata = {
  title: '文章列表',
  description: `浏览 ${siteConfig.name} 的所有技术文章`,
}

/** /blog 页面 — 完整文章列表，支持标签筛选（客户端筛选，兼容静态导出） */
export default function BlogListPage() {
  const allPosts = getAllPosts()
  const tags = getAllTags()

  return (
    <Suspense>
      <BlogListClient allPosts={allPosts} tags={tags} />
    </Suspense>
  )
}
