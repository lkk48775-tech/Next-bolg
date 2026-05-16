/**
 * 文章路径映射工具
 * 
 * 根据文章的 slug 生成对应的 URL 路径。
 * 如果 slug 已经包含 '/'（说明是完整路径如 'css/css-flex'），直接返回。
 * 否则根据前缀推断分类目录。
 * 
 * 注意：新增分类时只需确保数据库中 category.name 小写后与目录名一致即可，
 * 后端返回的数据会直接用 category_name.toLowerCase() + '/' + slug 拼接路径。
 */
export const getArticlePath = (slug) => {
  // 如果已经是完整路径（包含 /），直接返回
  if (slug.includes('/')) return slug

  // 根据前缀推断分类（兼容旧的本地数据）
  if (slug.startsWith('css-')) return `css/${slug}`
  if (slug.startsWith('js-')) return `javascript/${slug}`
  if (slug.startsWith('vue-')) return `vue/${slug}`
  if (slug.startsWith('react-')) return `react/${slug}`
  if (slug === 'dynamic-breadcrumb' || slug === 'virtual-list') return `react/${slug}`
  if (slug === 'file-md5' || slug === 'large-file-upload') return `browser/${slug}`

  // 未知分类，直接返回 slug
  return slug
}
