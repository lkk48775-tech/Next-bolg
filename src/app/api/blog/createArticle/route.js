/**
 * 创建文章 MDX 文件 API
 * 
 * 当管理员在后台添加新文章时，除了写入数据库，还会调用这个接口
 * 在本地 src/content/articles/{分类}/{slug}.mdx 创建对应的 MDX 文件。
 * 
 * 为什么需要创建本地文件？
 * - Next.js 的 Webpack 在构建时会扫描本地 MDX 文件
 * - 有了本地文件，文章就能通过 import() 加载，样式和组件都能正常工作
 * - 开发模式下 Next.js 热更新会自动检测到新文件
 * - 生产环境需要重新 build 才能加载新文件
 * 
 * 请求方式：POST /api/blog/createArticle
 * 请求体：{ slug: "css-flex", category: "CSS", content: "MDX内容" }
 * 返回：{ code: 200, msg: "文件创建成功", data: { path: "..." } }
 */
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(req) {
  try {
    // 读取前端传来的数据
    const body = await req.json();
    const { slug, category, content } = body;

    // 参数校验：三个字段都必须有值
    if (!slug || !category || !content) {
      return Response.json({ code: 400, msg: '缺少 slug、category 或 content' });
    }

    // 分类名转小写作为目录名
    // 比如 "CSS" → "css"，"JavaScript" → "javascript"
    const categoryDir = category.toLowerCase();

    // 拼接文件路径：项目根目录/src/content/articles/{分类}/{slug}.mdx
    const articlesDir = path.join(process.cwd(), 'src', 'content', 'articles', categoryDir);
    const filePath = path.join(articlesDir, `${slug}.mdx`);

    // 确保目录存在（如果是新分类，目录可能还不存在）
    // recursive: true 表示会递归创建所有不存在的父目录
    await mkdir(articlesDir, { recursive: true });

    // 把 MDX 内容写入文件
    await writeFile(filePath, content, 'utf-8');

    // 返回成功信息和文件路径
    return Response.json({
      code: 200,
      msg: '文件创建成功',
      data: { path: `src/content/articles/${categoryDir}/${slug}.mdx` }
    });
  } catch (err) {
    console.error('创建文章文件失败：', err);
    return Response.json({ code: 500, msg: err.message });
  }
}
