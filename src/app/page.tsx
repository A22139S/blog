import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllPosts } from '@/lib/posts'
import { siteConfig } from '@/lib/config'
import { PostCard } from '@/components/PostCard'
import { AvatarWithFallback } from '@/components/AvatarWithFallback'

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

  // 获取作者首字母用于头像 fallback
  const authorInitial = siteConfig.author.name.charAt(0)

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      {/* 头部欢迎语 */}
      <section className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-50 sm:text-5xl">
          {siteConfig.name}
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-400">
          {siteConfig.tagline}
        </p>
        <p className="mt-3 text-sm text-gray-500 dark:text-gray-500">
          共 <span className="font-semibold text-primary-600 dark:text-primary-400">{allPosts.length}</span> 篇文章
        </p>
      </section>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* 左侧：关于博主 + 头像 */}
        <aside className="lg:col-span-4 xl:col-span-3">
          <div className="sticky top-24 space-y-6">
            <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              {/* 头像 */}
              <div className="mb-4 flex justify-center">
                <div className="h-24 w-24 overflow-hidden rounded-full">
                  <AvatarWithFallback
                    src={siteConfig.author.avatar}
                    fallback={authorInitial}
                    alt={siteConfig.author.name}
                  />
                </div>
              </div>

              {/* 作者名 */}
              <h2 className="mb-1 text-center text-base font-semibold text-gray-900 dark:text-gray-100">
                {siteConfig.author.name}
              </h2>

              {/* 简介 */}
              <p className="mb-4 text-center text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                {siteConfig.author.bio}
              </p>

              {/* 了解更多链接 */}
              <div className="text-center">
                <Link
                  href="/about"
                  className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                >
                  了解更多 →
                </Link>
              </div>
            </div>
          </div>
        </aside>

        {/* 右侧：最近3篇文章 */}
        <div className="lg:col-span-8 xl:col-span-9">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              最近文章
            </h2>
            {allPosts.length > 3 && (
              <Link
                href="/blog"
                className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
              >
                查看全部 →
              </Link>
            )}
          </div>

          {recentPosts.length === 0 ? (
            <div className="py-20 text-center text-gray-500 dark:text-gray-400">
              <p className="text-lg">暂无文章</p>
              <p className="mt-2 text-sm">在 content/posts 目录下创建 .mdx 文件来发布你的第一篇文章吧！</p>
            </div>
          ) : (
            <div className="space-y-6">
              {recentPosts.map((post) => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
