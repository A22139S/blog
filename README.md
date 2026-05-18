# 个人博客模板

基于 **Next.js 14 App Router** + **TypeScript** + **Tailwind CSS** 构建的现代化个人博客模板。

## 特性

- ✅ **App Router** — 服务端组件优先，更快的首屏加载
- ✅ **MDX 内容源** — 本地 `.mdx` 文件，无需数据库
- ✅ **代码高亮** — rehype-pretty-code + Shiki，支持明暗双主题
- ✅ **深色模式** — 系统偏好自动检测 + 手动切换
- ✅ **响应式布局** — 移动端完全友好
- ✅ **SEO 优化** — metadata / OpenGraph / JSON-LD / sitemap / robots
- ✅ **分页** — 首页和文章列表均支持 URL 分页参数
- ✅ **标签系统** — 标签筛选页 + 标签云组件
- ✅ **TypeScript 全覆盖** — 严格类型检查

## 目录结构

```
blog-template/
├── content/
│   └── posts/              # MDX 文章文件（在此新增文章）
├── src/
│   ├── app/
│   │   ├── layout.tsx      # 根布局（含 metadata 配置）
│   │   ├── page.tsx        # 首页（文章列表 + 侧边栏）
│   │   ├── not-found.tsx   # 404 页面
│   │   ├── error.tsx       # 全局错误边界
│   │   ├── sitemap.ts      # 自动生成 sitemap.xml
│   │   ├── robots.ts       # 自动生成 robots.txt
│   │   ├── blog/
│   │   │   ├── page.tsx            # /blog 文章列表页
│   │   │   └── [slug]/page.tsx     # 文章详情页（MDX 渲染）
│   │   ├── tags/
│   │   │   ├── page.tsx            # 所有标签页
│   │   │   └── [tag]/page.tsx      # 单标签筛选页
│   │   └── about/page.tsx          # 关于页
│   ├── components/
│   │   ├── Header.tsx      # 顶部导航（含移动端菜单）
│   │   ├── Footer.tsx      # 页脚
│   │   ├── PostCard.tsx    # 文章卡片
│   │   ├── TagBadge.tsx    # 标签徽章
│   │   ├── TagCloud.tsx    # 标签云（侧边栏）
│   │   ├── ThemeProvider.tsx  # 深色模式提供者
│   │   ├── ThemeToggle.tsx    # 主题切换按钮
│   │   └── ui/
│   │       └── Pagination.tsx  # 分页组件
│   ├── lib/
│   │   ├── posts.ts        # 文章读取 / 筛选 / 分页工具函数
│   │   ├── config.ts       # 站点全局配置
│   │   └── utils.ts        # 日期格式化 / className 合并等工具
│   └── types/
│       └── index.ts        # TypeScript 类型定义
├── package.json
├── tailwind.config.ts
├── next.config.ts
└── tsconfig.json
```

## 快速开始

### 1. 安装依赖

```bash
npm install
# 还需安装 Tailwind Typography 插件
npm install @tailwindcss/typography
```

### 2. 启动开发服务器

```bash
npm run dev
# 访问 http://localhost:3000
```

### 3. 修改站点配置

编辑 `src/lib/config.ts`，更改站点名称、作者信息、URL 等：

```typescript
export const siteConfig = {
  name: '你的博客名称',
  url: 'https://your-domain.com',
  author: {
    name: '你的名字',
    // ...
  }
}
```

### 4. 写你的第一篇文章

在 `content/posts/` 目录下新建 `.mdx` 文件：

```markdown
---
title: "我的第一篇博客文章"
date: "2024-03-20"
summary: "这是文章摘要，会显示在列表页和 SEO description 中。"
tags: ["随笔", "技术"]
author: "你的名字"
---

## 正文从这里开始

支持所有 Markdown 语法，以及 React 组件！
```

## 部署到 Vercel

```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署
vercel --prod
```

部署前记得在 `src/lib/config.ts` 中更新 `url` 字段，或设置环境变量：

```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
```

## Frontmatter 字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `title` | string | ✅ | 文章标题 |
| `date` | string | ✅ | 发布日期（ISO 8601 格式） |
| `summary` | string | ✅ | 文章摘要（用于列表页和 SEO） |
| `tags` | string[] | ✅ | 标签数组 |
| `author` | string | ❌ | 作者名（默认使用配置中的作者名） |
| `coverImage` | string | ❌ | 封面图路径（用于 OpenGraph） |
| `draft` | boolean | ❌ | 设为 `true` 则不在列表中显示 |
