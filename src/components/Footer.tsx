import Link from 'next/link'
import { siteConfig } from '@/lib/config'

/**
 * 全局底部版权栏
 */
export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-950">
      <div className="container mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          {/* 版权信息 */}
          <p className="text-sm text-gray-500 dark:text-gray-400">
            © {currentYear}{' '}
            <Link
              href="/"
              className="font-medium text-gray-700 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400"
            >
              {siteConfig.author.name}
            </Link>
            。保留所有权利。
          </p>

          {/* 快捷链接 */}
          <nav className="flex items-center gap-4 text-sm">
            {siteConfig.author.github && (
              <a
                href={siteConfig.author.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                GitHub
              </a>
            )}
            <Link
              href="/sitemap.xml"
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              站点地图
            </Link>
            <Link
              href="/about"
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              关于
            </Link>
          </nav>
        </div>

        {/* 技术说明（可选） */}
        <p className="mt-4 text-center text-xs text-gray-400 dark:text-gray-600">
          由{' '}
          <a
            href="https://nextjs.org"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-600 dark:hover:text-gray-400"
          >
            Next.js
          </a>{' '}
          和{' '}
          <a
            href="https://tailwindcss.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-600 dark:hover:text-gray-400"
          >
            Tailwind CSS
          </a>{' '}
          强力驱动
        </p>
      </div>
    </footer>
  )
}
