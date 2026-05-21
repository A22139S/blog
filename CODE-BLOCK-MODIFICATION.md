# 博客代码块「黑底彩色语法高亮」修改方案

> 目标：无论浅色/深色模式，代码块统一黑底 + 彩色语法高亮。

---

## 一、当前状态分析

| 项目 | 当前值 | 问题 |
|------|--------|------|
| 语法高亮引擎 | `rehype-pretty-code` v0.14 + `shiki` v1.6 | 引擎本身完好 |
| 主题配置 | `github-light` / `github-dark` 双主题 | 可用但需调整 |
| `keepBackground` | `false` | 背景由 CSS 控制 |
| `pre` 背景 | `background: transparent !important` | 导致 theme 背景不生效 |
| `code` 颜色 | `color: inherit !important` | **严重问题：覆盖所有语法颜色** |
| 浅色模式背景 | `bg-gray-50`（灰白） | 不是黑底 |
| 深色模式背景 | `bg-gray-900`（深灰） | 接近黑底但不够黑 |

**根因**：`globals.css` 里的 `color: inherit !important` 强制所有代码文字继承父元素颜色，Shiki 生成的 `<span style="color:#xxx">` 全部失效，代码全部同色。

---

## 二、修改步骤

### Step 1：修复 `color: inherit !important`（关键）

**文件**：`src/app/globals.css`

删除 `[data-rehype-pretty-code-figure] code` 中的 `color: inherit !important`：

```css
/* 修改前 */
[data-rehype-pretty-code-figure] code {
  @apply font-mono;
  background: transparent !important;
  color: inherit !important;      /* ← 删除这行 */
  padding: 0 !important;
}

/* 修改后 */
[data-rehype-pretty-code-figure] code {
  @apply font-mono;
  background: transparent !important;
  padding: 0 !important;
}
```

> 同时删除 `[data-rehype-pretty-code-figure] pre` 上的 `background: transparent !important`，让背景色生效。

### Step 2：统一黑底背景

**方案 A（推荐）**：单主题强制暗色

修改 `src/app/blog/[slug]/page.tsx` 中的 `prettyCodeOptions`：

```ts
const prettyCodeOptions = {
  theme: 'github-dark',           // ← 单一暗色主题，不再区分浅/深
  keepBackground: false,
  onVisitHighlightedLine(node: { properties: { className: string[] } }) {
    node.properties.className.push('highlighted')
  },
}
```

修改 `globals.css` 中的背景规则：

```css
/* 统一黑底，删除 data-theme 条件 */
[data-rehype-pretty-code-figure] {
  @apply my-6 overflow-hidden rounded-lg border border-gray-700;
  background: #0d1117;            /* GitHub Dark 真实背景色 */
}

[data-rehype-pretty-code-figure] pre {
  @apply overflow-x-auto p-4 text-sm leading-relaxed;
  /* 删除 background: transparent !important */
}

[data-rehype-pretty-code-figure] code {
  @apply font-mono;
  /* 删除 background: transparent !important */
  /* 删除 color: inherit !important */
  padding: 0 !important;
}
```

**方案 B（已实施）**：双主题但浅色模式也用暗色背景 ✓

保留双主题切换，但把浅色模式的背景也改为暗色：

```css
/* 浅色模式也黑底 */
pre[data-theme='github-light'],
code[data-theme='github-light'] {
  background: #161b22;        /* 原来是 bg-gray-50 */
}

pre[data-theme='github-dark'],
code[data-theme='github-dark'] {
  background: #0d1117;        /* 原来是 bg-gray-900 */
}
```

### Step 3：调整边框 ✓

配合黑底，边框统一改为深色：

```css
[data-rehype-pretty-code-figure] {
  @apply my-6 overflow-hidden rounded-lg;
  border: 1px solid #21262d;    /* 微妙深色边框 */
}
```

### Step 4：代码块标题适配黑底 ✓

```css
[data-rehype-pretty-code-title] {
  background: #161b22;
  @apply text-gray-300;
}
```

### Step 5：高亮行样式适配黑底 ✓

```css
[data-highlighted-line] {
  @apply bg-white/10 dark:bg-white/5;
  border-left: 3px solid #58a6ff;    /* 左侧蓝色指示条 */
}
```

### Step 5：构建验证

```bash
cd blog-template
npx next build
```

确认无报错，检查 `/blog/[slug]` 页面代码块渲染效果。

---

## 三、效果预期

| 项目 | 修改前 | 修改后 |
|------|--------|--------|
| 背景色 | 浅色模式灰白 / 深色模式深灰 | 浅色 `#161b22` / 深色 `#0d1117`（统一黑底） |
| 语法颜色 | 全部同色（被 `inherit` 覆盖） | 关键字/字符串/注释等各有颜色 |
| 代码块边框 | `border-gray-200` / `dark:border-gray-700` | 统一 `#21262d` 深色边框 |
| 代码高亮行 | 无明显标识 | 左侧蓝色指示条 `#58a6ff` + 半透明背景 |
| 代码块标题 | 浅灰/深灰背景 | 统一 `#161b22` 黑底 + 浅色文字 |

---

## 四、影响范围

| 文件 | 改动类型 |
|------|----------|
| `src/app/globals.css` | 修改代码块样式（~15 行） |
| `src/app/blog/[slug]/page.tsx` | **未修改**（保留双主题配置） |

- 不影响文章内容/MDX 源文件
- 不影响其他页面
- 构建产物大小无实质变化

---

## 五、回滚方法

如需恢复当前效果，将 `page.tsx` 和 `globals.css` 改回原样即可：

```ts
// page.tsx 恢复
const prettyCodeOptions = {
  theme: {
    dark: 'github-dark',
    light: 'github-light',
  },
  keepBackground: false,
  ...
}
```

```css
/* globals.css 恢复 */
[data-rehype-pretty-code-figure] code {
  color: inherit !important;
}
pre[data-theme='github-light'] {
  @apply bg-gray-50;
}
pre[data-theme='github-dark'] {
  @apply bg-gray-900;
}
```
