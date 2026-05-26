import type { Metadata } from 'next'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { getAllPosts } from '@/lib/posts'
import { siteConfig } from '@/lib/config'
import { PostCard } from '@/components/PostCard'

/** Hero 区域动态加载 — 延迟非首屏 JS，减少初始包体积 */
const HeroSection = dynamic(
  () => import('@/components/HeroSection').then((mod) => mod.HeroSection),
  {
    ssr: false,
    loading: () => (
      <div className="hero-section relative h-screen w-full overflow-hidden bg-gray-950">
        <div className="flex h-full items-center justify-center">
          <span className="animate-pulse text-5xl font-bold tracking-wider text-white/60 sm:text-7xl">
            {siteConfig.name}
          </span>
        </div>
      </div>
    ),
  }
)

/** 首页 metadata */
export const metadata: Metadata = {
  title: {
    absolute: siteConfig.name,
  },
  description: siteConfig.description,
}

export default function HomePage() {
  const allPosts = getAllPosts()
  const recentPosts = allPosts.slice(0, 3)

  return (
    <>
      {/* P3RE 风格全屏 Hero 区域 */}
      <HeroSection />

      {/* 下方最近文章区域 */}
      <section className="bg-white py-16 dark:bg-gray-950">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {/* 区域标题 */}
          <div className="mb-10 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                最近文章
              </h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                共 <span className="font-semibold text-primary-600 dark:text-primary-400">{allPosts.length}</span> 篇文章
              </p>
            </div>
            {allPosts.length > 3 && (
              <Link
                href="/blog"
                className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
              >
                查看全部 →
              </Link>
            )}
          </div>

          {/* 文章列表 */}
          {recentPosts.length === 0 ? (
            <div className="py-20 text-center text-gray-500 dark:text-gray-400">
              <p className="text-lg">暂无文章</p>
              <p className="mt-2 text-sm">在 content/posts 目录下创建 .mdx 文件来发布你的第一篇文章吧！</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {recentPosts.map((post) => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
