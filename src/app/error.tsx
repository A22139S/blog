/**
 * 全局错误边界页面
 * 捕获渲染过程中的意外错误，展示友好提示
 */
'use client'

import { useEffect } from 'react'

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // 在生产环境中可以上报错误到监控平台
    console.error('页面渲染出错：', error)
  }, [error])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 text-6xl">⚠️</div>
      <h1 className="mb-3 text-2xl font-bold text-gray-900 dark:text-gray-50">
        出了点儿小问题
      </h1>
      <p className="mb-2 text-gray-500 dark:text-gray-400">
        页面渲染时遇到了意外错误，请尝试刷新页面。
      </p>
      {error.digest && (
        <p className="mb-6 font-mono text-xs text-gray-400 dark:text-gray-600">
          错误码：{error.digest}
        </p>
      )}
      <button
        onClick={reset}
        className="rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-700"
      >
        重新加载
      </button>
    </div>
  )
}
