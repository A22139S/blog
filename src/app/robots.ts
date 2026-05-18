import { MetadataRoute } from 'next'
import { siteConfig } from '@/lib/config'

/**
 * 生成 robots.txt，告知搜索引擎爬虫规则
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // 禁止爬取 Next.js 内部路径
      disallow: ['/api/', '/_next/'],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  }
}
