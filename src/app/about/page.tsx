import type { Metadata } from 'next'
import { siteConfig } from '@/lib/config'
import { getAllPosts, getAllTags } from '@/lib/posts'

export const metadata: Metadata = {
  title: '关于',
  description: `了解更多关于 ${siteConfig.author.name} 和这个博客的故事`,
  openGraph: {
    title: `关于 | ${siteConfig.name}`,
    description: `了解更多关于 ${siteConfig.author.name} 和这个博客的故事`,
  },
}

export default function AboutPage() {
  const { author } = siteConfig
  const allPosts = getAllPosts()
  const allTags = getAllTags()
  const postCount = allPosts.length
  const tagCount = allTags.length

  return (
    <div className="min-h-screen">
      {/* ===== 第一段：Hero 风格渐变头部 + 毛玻璃头像卡片 ===== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#001B83] via-[#00106a] to-[#001B83]">
        {/* 背景装饰 */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-400/15 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-blue-300/10 via-transparent to-transparent" />

        <div className="container relative mx-auto max-w-screen-xl px-4 py-20 sm:px-6 lg:px-8">
          {/* 毛玻璃头像卡片 */}
          <div className="mx-auto max-w-lg rounded-2xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-xl">
            {/* 头像 */}
            <div className="mx-auto mb-5 h-28 w-28 overflow-hidden rounded-full ring-4 ring-white/20 shadow-2xl">
              <img
                src={author.avatar}
                alt={author.name}
                width={112}
                height={112}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
            </div>
            <h1 className="text-3xl font-bold text-white">{author.name}</h1>
            <p className="mt-3 text-base text-gray-300 leading-relaxed">{author.bio}</p>

            {/* 社交链接 */}
            <div className="mt-6 flex justify-center gap-3">
              {author.github && (
                <a
                  href={author.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20 transition-colors"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  GitHub
                </a>
              )}
              {author.email && (
                <a
                  href={`mailto:${author.email}`}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20 transition-colors"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                  邮件联系
                </a>
              )}
            </div>
          </div>
        </div>

        </section>

      {/* ===== 第二段：数据卡片 ===== */}
      <section className="container mx-auto max-w-screen-xl px-4 -mt-6 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-lg grid-cols-2 gap-4">
          <div className="rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">{postCount}</p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">文章</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">{tagCount}</p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">标签</p>
          </div>
        </div>
      </section>

      {/* ===== 第三段：Prose 内容区 ===== */}
      <section className="container mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <h2>关于这个博客</h2>
          <p>
            欢迎来到我的个人博客。这里是我记录技术思考、分享实践经验的地方。
            内容涵盖前端开发、系统设计、工程实践等方向。
          </p>

          <h2>技术栈</h2>
          <p>本博客使用以下技术构建：</p>
          <ul>
            <li><strong>Next.js 14</strong> — React 全栈框架，采用 App Router</li>
            <li><strong>TypeScript</strong> — 强类型 JavaScript</li>
            <li><strong>Tailwind CSS</strong> — 原子化 CSS 框架</li>
            <li><strong>MDX</strong> — 在 Markdown 中使用 React 组件</li>
            <li><strong>rehype-pretty-code</strong> — 语法高亮（Shiki 驱动）</li>
          </ul>

          <h2>写作理念</h2>
          <p>
            我相信好的技术文章应该：清晰表达核心思想、提供可落地的实践建议、
            承认不确定性而非过度自信。写作对我来说既是输出，也是深化理解的过程。
          </p>

          <h2>联系方式</h2>
          <p>
            如果你有任何问题、建议或合作意向，欢迎通过
            <a href={`mailto:${author.email}`}>邮件</a>联系我，
            也可以在 GitHub 上找到我。
          </p>
        </div>
      </section>
    </div>
  )
}