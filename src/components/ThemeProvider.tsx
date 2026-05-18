/**
 * 深色模式主题提供者
 * 仅作为语义容器使用。实际的主题初始化通过 layout.tsx 中的
 * 内联 <script> 完成，在 HTML 解析阶段即生效，彻底避免 hydration 闪烁。
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
