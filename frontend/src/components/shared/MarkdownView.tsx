"use client";

import React from "react";
import ReactMarkdown from "react-markdown";

interface MarkdownViewProps {
  content: string;
  isDark?: boolean;
  className?: string;
}

/**
 * Universal Markdown renderer with LeetCode typography and contrast.
 * Ensures *hello* (single asterisk) and **hello** (double asterisk) both render as bold and prominent,
 * preventing raw unparsed markdown symbols from appearing like "words inside asterisks".
 */
export function MarkdownView({
  content,
  isDark = true,
  className = "",
}: MarkdownViewProps) {
  if (!content) return null;

  return (
    <div
      className={`leading-relaxed text-sm ${
        isDark ? "text-zinc-300" : "text-zinc-700"
      } ${className}`}
    >
      <ReactMarkdown
        components={{
          strong: ({ children }) => (
            <strong
              className={`font-bold ${
                isDark ? "text-white" : "text-zinc-900"
              }`}
            >
              {children}
            </strong>
          ),
          em: ({ children }) => (
            // Both *hello* and **hello** render with bold emphasis so text doesn't look un-styled
            <strong
              className={`font-bold italic ${
                isDark ? "text-white" : "text-zinc-900"
              }`}
            >
              {children}
            </strong>
          ),
          code: ({ children }) => (
            <code
              className={`font-mono text-[12px] px-1.5 py-0.5 rounded border transition-colors ${
                isDark
                  ? "bg-[#27272a] text-[#00b8a3] border-[#3f3f46]"
                  : "bg-zinc-100 text-[#008f7e] border-zinc-200 font-semibold"
              }`}
            >
              {children}
            </code>
          ),
          p: ({ children }) => (
            <p className="mb-3 leading-relaxed last:mb-0">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc pl-5 mb-3 space-y-1">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-5 mb-3 space-y-1">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed">{children}</li>
          ),
          blockquote: ({ children }) => (
            <blockquote
              className={`border-l-2 pl-3 py-1 my-2 italic ${
                isDark
                  ? "border-[#6a5ed9] text-zinc-400"
                  : "border-indigo-400 text-zinc-600"
              }`}
            >
              {children}
            </blockquote>
          ),
          h1: ({ children }) => (
            <h1
              className={`text-lg font-bold my-3 ${
                isDark ? "text-white" : "text-zinc-900"
              }`}
            >
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2
              className={`text-base font-bold my-2.5 ${
                isDark ? "text-white" : "text-zinc-900"
              }`}
            >
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3
              className={`text-sm font-semibold my-2 ${
                isDark ? "text-zinc-200" : "text-zinc-800"
              }`}
            >
              {children}
            </h3>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
