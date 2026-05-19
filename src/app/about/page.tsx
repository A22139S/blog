import type { Metadata } from 'next'
import { siteConfig } from '@/lib/config'

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

  return (
    <div className="container mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      {/* 作者信息 */}
      <header className="mb-12 flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
        <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-4xl text-white shadow-lg">
          {author.name.charAt(0)}
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">{author.name}</h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">{author.bio}</p>
          {/* 社交链接 */}
          <div className="mt-4 flex flex-wrap justify-center gap-3 sm:justify-start">
            {author.github && (
              <a
                href={author.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                GitHub
              </a>
            )}
            {author.email && (
              <a
                href={`mailto:${author.email}`}
                className="inline-flex items-center gap-1.5 rounded-lg bg-orange-50 px-3 py-1.5 text-sm font-medium text-orange-700 hover:bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400 dark:hover:bg-orange-900/40"
              >
                邮件联系
              </a>
            )}
          </div>
        </div>
      </header>

      {/* 关于内容（可在此自定义） */}
      <div className="prose prose-lg dark:prose-dark max-w-none">
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
    </div>
  )
}
