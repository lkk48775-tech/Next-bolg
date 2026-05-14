/**
 * 文章路径映射工具
 * 
 * 根据文章的 slug（标识符）生成对应的文件路径。
 * MDX 文章按技术方向分目录存放：css/、js/、vue/、react/、browser/
 * 
 * 例如：
 * - 'css-flex' → 'css/css-flex'
 * - 'js-debounce' → 'js/js-debounce'
 * - 'virtual-list' → 'react/virtual-list'
 * - 'file-md5' → 'browser/file-md5'
 */
export const getArticlePath = (slug) => {
  if (slug.startsWith('css-')) return `css/${slug}`
  if (slug.startsWith('js-')) return `js/${slug}`
  if (slug.startsWith('vue-')) return `vue/${slug}`
  if (slug.startsWith('react-')) return `react/${slug}`
  if (slug === 'dynamic-breadcrumb' || slug === 'virtual-list') return `react/${slug}`
  if (slug === 'file-md5' || slug === 'large-file-upload') return `browser/${slug}`
  return slug
}
