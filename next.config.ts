/**
 * Next.js 配置文件
 * 
 * - pageExtensions: 支持 .mdx 文件作为页面/组件
 * - images.unoptimized: 禁用图片优化（使用原始图片，适合静态部署）
 * - withMDX: 启用 MDX 支持，配置 remark/rehype 插件
 *   - remarkGfm: 支持 GitHub 风格 Markdown（表格、删除线等）
 *   - rehypeHighlight: 代码块语法高亮
 */
import type { NextConfig } from "next";
import createMDX from "@next/mdx";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // 允许这些扩展名作为页面文件
  pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdx"],
  images: {
    // 禁用 Next.js 图片优化，直接使用原始图片
    unoptimized: true,
  },
};

// 创建 MDX 插件，配置 Markdown 处理管道
const withMDX = createMDX({
  options: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [rehypeHighlight],
  },
});

export default withMDX(nextConfig);
