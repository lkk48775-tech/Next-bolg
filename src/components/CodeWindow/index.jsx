/**
 * 代码窗口组件（Client Component - 通过 memo 优化）
 * 
 * 用于 MDX 文章中展示代码块，模拟 macOS 终端窗口样式。
 * 功能：
 * 1. 自定义语法高亮（不依赖外部库，手写 tokenizer）
 * 2. 行号显示
 * 3. 一键复制代码
 * 4. 懒加载：使用 IntersectionObserver，进入视口 420px 范围内才渲染高亮
 * 5. 支持 JS 和 CSS 两种语法的 token 分类
 * 
 * Props:
 * - lang: 语言标识（显示在窗口标题栏）
 * - code: 代码文本内容
 */
import { memo, useEffect, useMemo, useRef, useState } from 'react'
import styles from './Codewindow.module.css'

const jsKeywords = new Set([
  'async',
  'await',
  'break',
  'case',
  'catch',
  'class',
  'const',
  'continue',
  'default',
  'else',
  'export',
  'for',
  'from',
  'function',
  'if',
  'import',
  'let',
  'new',
  'return',
  'switch',
  'throw',
  'try',
  'while'
])

const tokenRules = [
  { type: 'comment', pattern: /^\/\*.*?\*\/|^\/\/.*/ },
  { type: 'string', pattern: /^(['"`])(?:\\.|(?!\1).)*\1/ },
  { type: 'number', pattern: /^-?\d*\.?\d+(?:px|rem|em|fr|vw|vh|%|s|ms)?/ },
  { type: 'color', pattern: /^#[0-9a-fA-F]{3,8}\b/ },
  { type: 'punctuation', pattern: /^[{}()[\]:;,]/ },
  { type: 'operator', pattern: /^[+\-*/=<>!&|?.]+/ },
  { type: 'word', pattern: /^[$_a-zA-Z\u4e00-\u9fa5][\w$\-\u4e00-\u9fa5]*/ },
  { type: 'space', pattern: /^\s+/ },
  { type: 'plain', pattern: /^./ }
]

function getTokenClass(type, value, index, tokens, normalizedLang) {
  if (type === 'word' && jsKeywords.has(value)) {
    return styles.tokenKeyword
  }

  if (type === 'word' && normalizedLang === 'css') {
    const next = tokens[index + 1]
    const previous = tokens[index - 1]

    if (next?.value === ':') {
      return styles.tokenProperty
    }

    if (!previous || previous.value === '}' || previous.value === '{' || previous.value === ',') {
      return styles.tokenSelector
    }
  }

  const classMap = {
    color: styles.tokenColor,
    comment: styles.tokenComment,
    number: styles.tokenNumber,
    operator: styles.tokenOperator,
    punctuation: styles.tokenPunctuation,
    property: styles.tokenProperty,
    selector: styles.tokenSelector,
    string: styles.tokenString
  }

  return classMap[type] || ''
}

function tokenizeLine(line) {
  const tokens = []
  let rest = line || ' '

  while (rest) {
    const rule = tokenRules.find(({ pattern }) => pattern.test(rest))
    const value = rest.match(rule.pattern)[0]
    tokens.push({ type: rule.type, value })
    rest = rest.slice(value.length)
  }

  return tokens
}

function tokenizeCssLine(line) {
  if (!line) {
    return [{ type: 'space', value: ' ' }]
  }

  const trimmed = line.trim()
  const indent = line.match(/^\s*/)?.[0] || ''
  const tokens = []

  if (indent) {
    tokens.push({ type: 'space', value: indent })
  }

  if (trimmed.startsWith('//') || trimmed.startsWith('/*')) {
    tokens.push({ type: 'comment', value: line.slice(indent.length) })
    return tokens
  }

  if (trimmed === '{' || trimmed === '}') {
    tokens.push({ type: 'punctuation', value: trimmed })
    return tokens
  }

  if (trimmed.includes('{')) {
    const text = line.slice(indent.length)
    const braceIndex = text.indexOf('{')

    tokens.push({ type: 'selector', value: text.slice(0, braceIndex).trimEnd() })
    tokens.push({ type: 'space', value: ' ' })
    tokens.push({ type: 'punctuation', value: '{' })
    return tokens
  }

  const colonIndex = trimmed.indexOf(':')
  if (colonIndex > -1) {
    const property = trimmed.slice(0, colonIndex)
    const valueText = trimmed.slice(colonIndex + 1)
    const semiIndex = valueText.lastIndexOf(';')
    const value = semiIndex > -1 ? valueText.slice(0, semiIndex) : valueText

    tokens.push({ type: 'property', value: property })
    tokens.push({ type: 'punctuation', value: ':' })
    tokens.push(...tokenizeLine(value))

    if (semiIndex > -1) {
      tokens.push({ type: 'punctuation', value: ';' })
    }

    return tokens
  }

  return tokenizeLine(line)
}

function getTokens(line, normalizedLang) {
  if (normalizedLang === 'css') {
    return tokenizeCssLine(line)
  }

  return tokenizeLine(line)
}

function CodeWindow({ lang = 'CODE', code = '' }) {
  const [copied, setCopied] = useState(false)
  const [shouldRenderCode, setShouldRenderCode] = useState(false)
  const rootRef = useRef(null)

  const codeText = useMemo(() => code.trim(), [code])
  const lines = useMemo(() => codeText.split('\n'), [codeText])
  const normalizedLang = useMemo(() => lang.toLowerCase(), [lang])
  const highlightedLines = useMemo(() => {
    if (!shouldRenderCode) {
      return []
    }

    return lines.map((line) => getTokens(line, normalizedLang))
  }, [lines, normalizedLang, shouldRenderCode])

  useEffect(() => {
    const rootNode = rootRef.current

    if (!rootNode) {
      return undefined
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setShouldRenderCode(true)
        observer.disconnect()
      }
    }, {
      rootMargin: '420px 0px'
    })

    observer.observe(rootNode)

    return () => {
      observer.disconnect()
    }
  }, [])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeText)
      setCopied(true)

      setTimeout(() => {
        setCopied(false)
      }, 1500)
    } catch (error) {
      console.log('复制失败', error)
    }
  }

  return (
    <div className={styles.codeWindow} ref={rootRef}>
      <div className={styles.codeHeader}>
        <div className={styles.dots}>
          <span></span>
          <span></span>
          <span></span>
        </div>

        <div className={styles.lang}>{lang}</div>

        <button
          className={`${styles.copyBtn} ${copied ? styles.copied : ''}`}
          onClick={handleCopy}
          aria-label="复制代码"
          title="复制代码"
        >
          <svg viewBox="0 0 1024 1024" className={styles.copyIcon}>
            <path
              d="M672 128H256c-35.3 0-64 28.7-64 64v512h64V192h416v-64z"
              fill="currentColor"
            />
            <path
              d="M768 256H384c-35.3 0-64 28.7-64 64v512c0 35.3 28.7 64 64 64h384c35.3 0 64-28.7 64-64V320c0-35.3-28.7-64-64-64z m0 576H384V320h384v512z"
              fill="currentColor"
            />
          </svg>

          <span className={styles.copyTip}>
            {copied ? 'Copied' : 'Copy'}
          </span>
        </button>
      </div>

      <pre className={styles.codeBody}>
        {shouldRenderCode ? (
          lines.map((line, index) => (
            <div className={styles.codeLine} key={index}>
              <span className={styles.lineNumber}>{index + 1}</span>
              <code>
                {highlightedLines[index].map((token, tokenIndex, tokens) => (
                  <span
                    className={getTokenClass(token.type, token.value, tokenIndex, tokens, normalizedLang)}
                    key={`${index}-${tokenIndex}`}
                  >
                    {token.value}
                  </span>
                ))}
              </code>
            </div>
          ))
        ) : (
          <div className={styles.codeSkeleton}>
            {lines.slice(0, 4).map((line, index) => (
              <div className={styles.codeLine} key={index}>
                <span className={styles.lineNumber}>{index + 1}</span>
                <code>{line}</code>
              </div>
            ))}
          </div>
        )}
      </pre>
    </div>
  )
}

export default memo(CodeWindow)
