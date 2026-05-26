"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import styles from "./AiPopup.module.css";

type Post = {
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
};

type AiPopupProps = {
  posts?: Post[];
  embedded?: boolean;
  onClose?: () => void;
};

const quickActions = [
  { label: "博客有哪些文章", icon: "▣", prompt: "列出博客文章列表" },
  { label: "博客整体情况", icon: "▥", prompt: "统计博客文章总数和分类分布" },
  { label: "推荐音乐", icon: "♫", prompt: "推荐一首适合现在听的音乐" },
  { label: "摸鱼日报", icon: "☕", prompt: "来一份摸鱼日报" },
  { label: "今天天气", icon: "☁", prompt: "查询今天的天气" },
  { label: "来一句", icon: "“”", prompt: "来一句一言" },
];

function renderInlineText(text: string) {
  return text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g).map((segment, index) => {
    if (segment.startsWith("`") && segment.endsWith("`")) {
      return (
        <code className={styles.inlineCode} key={index}>
          {segment.slice(1, -1)}
        </code>
      );
    }

    if (segment.startsWith("**") && segment.endsWith("**")) {
      return <strong key={index}>{segment.slice(2, -2)}</strong>;
    }

    return <span key={index}>{segment}</span>;
  });
}

function isTableSeparator(line: string) {
  return /^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/.test(line);
}

function parseTableRow(line: string) {
  return line
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function renderTextBlock(block: string, blockIndex: number) {
  const lines = block
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const nodes = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    const key = `${blockIndex}-${index}`;

    if (
      line.includes("|") &&
      lines[index + 1] &&
      isTableSeparator(lines[index + 1])
    ) {
      const headers = parseTableRow(line);
      const rows = [];
      index += 2;

      while (lines[index]?.includes("|")) {
        rows.push(parseTableRow(lines[index]));
        index += 1;
      }

      nodes.push(
        <div className={styles.tableScroll} key={key}>
          <table className={styles.replyTable}>
            <thead>
              <tr>
                {headers.map((header, headerIndex) => (
                  <th key={headerIndex}>{renderInlineText(header)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {headers.map((_, cellIndex) => (
                    <td key={cellIndex}>{renderInlineText(row[cellIndex] || "")}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }

    if (/^#{1,3}\s+/.test(line)) {
      const level = line.match(/^#{1,3}/)?.[0].length || 3;
      const HeadingTag = `h${level}` as "h1" | "h2" | "h3";

      nodes.push(
        <HeadingTag
          className={`${styles.replyHeading} ${styles[`replyHeading${level}`]}`}
          key={key}
        >
          {renderInlineText(line.replace(/^#{1,3}\s+/, ""))}
        </HeadingTag>,
      );
      index += 1;
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      nodes.push(
        <div className={styles.replyListItem} key={key}>
          <span className={styles.replyBullet}>•</span>
          <span>{renderInlineText(line.replace(/^[-*]\s+/, ""))}</span>
        </div>,
      );
      index += 1;
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      const number = line.match(/^\d+/)?.[0] || "";

      nodes.push(
        <div className={styles.replyListItem} key={key}>
          <span className={styles.replyNumber}>{number}.</span>
          <span>{renderInlineText(line.replace(/^\d+\.\s+/, ""))}</span>
        </div>,
      );
      index += 1;
      continue;
    }

    if (/^>\s+/.test(line)) {
      nodes.push(
        <blockquote className={styles.replyQuote} key={key}>
          {renderInlineText(line.replace(/^>\s+/, ""))}
        </blockquote>,
      );
      index += 1;
      continue;
    }

    nodes.push(
      <p className={styles.replyParagraph} key={key}>
        {renderInlineText(line)}
      </p>,
    );
    index += 1;
  }

  return nodes;
}

function renderFormattedText(text: string) {
  const blocks = text.split(/```([\s\S]*?)```/g);

  return (
    <div className={styles.formattedText}>
      {blocks.map((block, blockIndex) => {
        if (blockIndex % 2 === 1) {
          return (
            <pre className={styles.codeBlock} key={blockIndex}>
              <code>{block.trim()}</code>
            </pre>
          );
        }

        return renderTextBlock(block, blockIndex);
      })}
    </div>
  );
}

export default function AiPopup({ posts = [], embedded = false, onClose }: AiPopupProps) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const messagesRef = useRef<HTMLElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const shouldAutoScrollRef = useRef(true);

  const articleContext = useMemo(
    () =>
      posts
        .map((post) =>
          [
            `标题：${post.title}`,
            `链接：${post.slug}`,
            post.excerpt ? `摘要：${post.excerpt}` : null,
            post.content ? `内容：${post.content}` : null,
          ]
            .filter(Boolean)
            .join("\n"),
        )
        .join("\n\n"),
    [posts],
  );

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/ai",
      }),
    [],
  );

  const { messages, sendMessage, status, error } = useChat({ transport });
  const isLoading = status === "submitted" || status === "streaming";

  useEffect(() => {
    if (shouldAutoScrollRef.current) {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [messages, status]);

  function handleMessagesScroll() {
    const messagesElement = messagesRef.current;
    if (!messagesElement) return;

    const distanceToBottom =
      messagesElement.scrollHeight -
      messagesElement.scrollTop -
      messagesElement.clientHeight;

    shouldAutoScrollRef.current = distanceToBottom < 80;
  }

  function submitMessage(content: string) {
    const text = content.trim();
    if (!text || isLoading) return;

    void sendMessage(
      { text },
      {
        body: {
          article: articleContext,
        },
      },
    );
    shouldAutoScrollRef.current = true;
    setInput("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submitMessage(input);
  }

  const dialog = (
    <section className={embedded ? styles.embeddedDialog : styles.floatingDialog}>
      <header className={styles.header}>
        <h2 className={styles.title}>Skaura AI助手</h2>
        {(!embedded || onClose) && (
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose || (() => setOpen(false))}
            aria-label="关闭 AI 助手"
          >
            ×
          </button>
        )}
      </header>

      <main
        className={styles.messages}
        onScroll={handleMessagesScroll}
        ref={messagesRef}
      >
        {messages.length === 0 && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon} aria-hidden="true">
              ♧
            </div>
            <h3>你好，我是博客 AI 助手</h3>
            <p>我可以陪你日常聊天，也可以从博客内容中检索相关信息回答你。</p>
            <div className={styles.actionGrid}>
              {quickActions.map((action) => (
                <button
                  type="button"
                  className={styles.actionButton}
                  key={action.label}
                  onClick={() => submitMessage(action.prompt)}
                >
                  <span className={styles.actionIcon}>{action.icon}</span>
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => {
          const isUser = message.role === "user";

          return (
            <div
              className={`${styles.messageRow} ${
                isUser ? styles.userRow : styles.assistantRow
              }`}
              key={message.id}
            >
              <div
                className={`${styles.messageBubble} ${
                  isUser ? styles.userBubble : styles.assistantBubble
                }`}
              >
                {message.parts.map((part, index) => {
                  if (part.type !== "text") return null;

                  return isUser ? (
                    <span key={index}>{part.text}</span>
                  ) : (
                    <div key={index}>{renderFormattedText(part.text)}</div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {isLoading && <div className={styles.thinking}>AI 正在思考...</div>}

        {error && (
          <div className={styles.errorMessage}>
            AI 回复失败：{error.message}
          </div>
        )}
        <div ref={messagesEndRef} />
      </main>

      <form className={styles.inputBar} onSubmit={handleSubmit}>
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="输入你的问题..."
        />

        <button type="submit" disabled={isLoading}>
          发送
        </button>
      </form>
    </section>
  );

  if (embedded) {
    return dialog;
  }

  return (
    <>
      <button
        type="button"
        className={styles.floatingButton}
        onClick={() => setOpen(true)}
      >
        AI
      </button>

      {open && dialog}
    </>
  );
}
