/** @type {import('next').NextConfig} */
const nextConfig = {
  // 允许 .mdx 扩展名
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],

  // ===== 静态导出已移除（改为动态服务，路线 B）=====
  // output: 'export',            // ← 已删除：服务器使用 next start 启动
  // basePath: '/blog',           // ← 已删除：服务器部署到根路径
  // images.unoptimized,          // ← 已删除：保留动态图片优化

  // 确保 trailingSlash 兼容，避免路径 404
  trailingSlash: true,

  // 隐藏 X-Powered-By 头
  poweredByHeader: false,

  // 生产环境关闭 SourceMap
  productionBrowserSourceMaps: false,

  // 启用 Gzip 压缩
  compress: true,

  // React 严格模式
  reactStrictMode: true,

  // 服务器环境变量（部署时可覆盖）
  env: {
    PORT: process.env.PORT || '3000',
    HOSTNAME: '0.0.0.0',
  },
}

export default nextConfig