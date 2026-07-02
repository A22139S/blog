import type { Metadata } from 'next'
import { projects } from '@/lib/portfolio-data'
import { PortfolioGrid } from '@/components/PortfolioGrid'

export const metadata: Metadata = {
  title: '作品集',
  description: '项目作品展示 - 涵盖 Web 应用、自动化工具、数据可视化等领域',
}

export default function PortfolioPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">作品集</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          共 <span className="font-semibold text-gray-700 dark:text-gray-300">{projects.length}</span> 个项目
        </p>
      </header>

      <PortfolioGrid projects={projects} />
    </div>
  )
}
