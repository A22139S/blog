import Link from 'next/link'

/**
 * 全局 404 页面
 */
export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 text-8xl font-bold text-gray-200 dark:text-gray-700">404</div>
      <h1 className="mb-3 text-2xl font-bold text-gray-900 dark:text-gray-50">页面不见了</h1>
      <p className="mb-8 text-gray-500 dark:text-gray-400">
        你要找的页面可能已被删除，或者从未存在。
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600"
        >
          返回首页
        </Link>
        <Link
          href="/blog"
          className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
        >
          浏览文章
        </Link>
      </div>
    </div>
  )
}
