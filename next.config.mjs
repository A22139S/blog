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
  // 隐藏 X-Powered-By 头，减少信息泄露
  poweredByHeader: false,
  // 生产环境关闭 SourceMap，减小构建产物
  productionBrowserSourceMaps: false,
  // 启用 Gzip 压缩（静态导出下在 Web 服务器层生效）
  compress: true,
  // React 严格模式
  reactStrictMode: true,
}

export default nextConfig
