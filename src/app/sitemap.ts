import { MetadataRoute } from 'next'
import { getAllPosts, getAllTags } from '@/lib/posts'
import { siteConfig } from '@/lib/config'

/**
 * 自动生成 sitemap.xml
 * Next.js 会在构建时将此文件输出为 /sitemap.xml
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts()
  const tags = getAllTags()
  const baseUrl = siteConfig.url

  // 静态页面
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/tags`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ]

  // 文章页面
  const postPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // 标签页面
  const tagPages: MetadataRoute.Sitemap = tags.map(({ tag }) => ({
    url: `${baseUrl}/tags/${encodeURIComponent(tag.toLowerCase())}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.5,
  }))

  return [...staticPages, ...postPages, ...tagPages]
}
