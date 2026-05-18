/** @type {import('next').NextConfig} */
const nextConfig = {
  // 允许 .mdx 扩展名
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  // 静态导出（GitHub Pages 必需）
  output: 'export',
  // GitHub Pages 部署时需要设置 basePath（仓库名）
  basePath: process.env.NODE_ENV === 'production' ? '/blog' : '',
  // 静态导出不支持 Next.js 图片优化，需禁用
  images: {
    unoptimized: true,
  },
  // 确保 trailingSlash 一致，避免 GitHub Pages 404
  trailingSlash: true,
}

export default nextConfig
