"use client";

import { useSyncExternalStore } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { remarkUnderline } from "@/lib/markdown/remark-underline";
import { cn } from "@/lib/utils";

type MarkdownContentProps = {
  content: string;
  className?: string;
};

function subscribe() {
  return () => {};
}

function getClientSnapshot() {
  return true;
}

function getServerSnapshot() {
  return false;
}

export function MarkdownContent({ content, className }: MarkdownContentProps) {
  const ready = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot,
  );

  if (!ready) {
    return (
      <div className={cn("markdown-content whitespace-pre-wrap", className)}>
        {content}
      </div>
    );
  }

  return (
    <div className={cn("markdown-content", className)}>
      <Markdown remarkPlugins={[remarkGfm, remarkUnderline]}>{content}</Markdown>
    </div>
  );
}
