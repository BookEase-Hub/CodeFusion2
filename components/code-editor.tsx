"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Highlight, themes } from "prism-react-renderer"
import { useTheme } from "next-themes"

interface CodeEditorProps {
  value: string
  language: string
  height?: string
  readOnly?: boolean
  onChange?: (value: string) => void
}

export function CodeEditor({ value, language, height = "300px", readOnly = false, onChange }: CodeEditorProps) {
  const [code, setCode] = useState(value)
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    setCode(value)
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    setCode(newValue)
    onChange?.(newValue)
  }

  if (!mounted) {
    return <div className="rounded-md border bg-muted" style={{ height }} />
  }

  return (
    <div className="relative overflow-hidden rounded-md" style={{ height }}>
      <Highlight theme={theme === "dark" ? themes.nightOwl : themes.github} code={code} language={language}>
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <>
            {!readOnly && (
              <textarea
                value={code}
                onChange={handleChange}
                className="absolute inset-0 w-full h-full resize-none font-mono p-4 text-transparent bg-transparent z-10 outline-none"
                style={{ caretColor: theme === "dark" ? "white" : "black" }}
              />
            )}
            <pre
              className={`${className} overflow-auto p-4 code-editor`}
              style={{
                ...style,
                height,
                margin: 0,
                background: "transparent",
                pointerEvents: "none",
              }}
            >
              {tokens.map((line, lineIndex) => {
                // Extract props safely without the key
                const { key: lineKey, ...lineProps } = getLineProps({ line, key: lineIndex })
                return (
                  <div key={lineIndex} {...lineProps}>
                    {line.map((token, tokenIndex) => {
                      // Extract props safely without the key
                      const { key: tokenKey, ...tokenProps } = getTokenProps({ token, key: tokenIndex })
                      return <span key={tokenIndex} {...tokenProps} />
                    })}
                  </div>
                )
              })}
            </pre>
          </>
        )}
      </Highlight>
    </div>
  )
}

