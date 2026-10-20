"use client";

import { useRef, useState } from "react";
import {
  Bold,
  Eye,
  Italic,
  List,
  ListOrdered,
  Pencil,
  Underline,
} from "lucide-react";
import { MarkdownContent } from "@/components/projekte/markdown-content";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type MarkdownEditorProps = Omit<React.ComponentProps<"textarea">, "value">;

type InlineFormat = { before: string; after: string; placeholder: string };

const INLINE_FORMATS = {
  bold: { before: "**", after: "**", placeholder: "fetter Text" },
  italic: { before: "*", after: "*", placeholder: "kursiver Text" },
  underline: { before: "<u>", after: "</u>", placeholder: "unterstrichener Text" },
} satisfies Record<string, InlineFormat>;

const LIST_PREFIX = /^(\s*)(?:[-*+]|\d+\.)\s+/;

function applyInline(textarea: HTMLTextAreaElement, format: InlineFormat) {
  const { selectionStart: start, selectionEnd: end, value } = textarea;
  const selected = value.slice(start, end);
  const isWrapped =
    value.slice(start - format.before.length, start) === format.before &&
    value.slice(end, end + format.after.length) === format.after;

  if (isWrapped) {
    textarea.setRangeText(
      selected,
      start - format.before.length,
      end + format.after.length,
      "select",
    );
    return;
  }

  const text = selected || format.placeholder;
  textarea.setRangeText(
    `${format.before}${text}${format.after}`,
    start,
    end,
    "end",
  );
  const innerStart = start + format.before.length;
  textarea.setSelectionRange(innerStart, innerStart + text.length);
}

function applyList(textarea: HTMLTextAreaElement, ordered: boolean) {
  const { selectionStart, selectionEnd, value } = textarea;
  const lineStart = value.lastIndexOf("\n", selectionStart - 1) + 1;
  const nextBreak = value.indexOf("\n", selectionEnd);
  const lineEnd = nextBreak === -1 ? value.length : nextBreak;

  const lines = value.slice(lineStart, lineEnd).split("\n");
  const marker = (index: number) => (ordered ? `${index + 1}. ` : "- ");
  const filled = lines.filter((line) => line.trim() !== "");
  const isEmpty = filled.length === 0;
  const alreadyFormatted =
    !isEmpty &&
    filled.every((line) =>
      ordered ? /^\s*\d+\.\s+/.test(line) : /^\s*[-*+]\s+/.test(line),
    );

  let counter = 0;
  const next = lines
    .map((line) => {
      if (line.trim() === "" && !isEmpty) return line;
      const content = line.replace(LIST_PREFIX, "$1");
      if (alreadyFormatted) return content;
      return `${marker(counter++)}${content}`;
    })
    .join("\n");

  // Listen brauchen eine Leerzeile davor, sonst hängt Markdown sie an den Absatz an.
  const previousLine =
    lineStart > 0
      ? value.slice(value.lastIndexOf("\n", lineStart - 2) + 1, lineStart - 1)
      : "";
  const needsBlankLine =
    !alreadyFormatted &&
    previousLine.trim() !== "" &&
    !LIST_PREFIX.test(previousLine);
  const replacement = needsBlankLine ? `\n${next}` : next;

  textarea.setRangeText(replacement, lineStart, lineEnd, "end");
  textarea.setSelectionRange(
    lineStart + replacement.length,
    lineStart + replacement.length,
  );
}

function continueList(textarea: HTMLTextAreaElement): boolean {
  const { selectionStart, selectionEnd, value } = textarea;
  if (selectionStart !== selectionEnd) return false;

  const lineStart = value.lastIndexOf("\n", selectionStart - 1) + 1;
  const line = value.slice(lineStart, selectionStart);
  const match = line.match(/^(\s*)([-*+]|(\d+)\.)\s+/);
  if (!match) return false;

  // Leerer Listenpunkt + Enter beendet die Liste.
  if (line.trim() === match[0].trim()) {
    textarea.setRangeText("", lineStart, selectionStart, "end");
    return true;
  }

  const marker = match[3] ? `${Number(match[3]) + 1}.` : match[2];
  textarea.setRangeText(`\n${match[1]}${marker} `, selectionStart, selectionEnd, "end");
  return true;
}

const TOOLS: Array<{
  label: string;
  icon: typeof Bold;
  action: (textarea: HTMLTextAreaElement) => void;
}> = [
  { label: "Fett (Strg+B)", icon: Bold, action: (t) => applyInline(t, INLINE_FORMATS.bold) },
  { label: "Kursiv (Strg+I)", icon: Italic, action: (t) => applyInline(t, INLINE_FORMATS.italic) },
  { label: "Unterstrichen (Strg+U)", icon: Underline, action: (t) => applyInline(t, INLINE_FORMATS.underline) },
  { label: "Aufzählung", icon: List, action: (t) => applyList(t, false) },
  { label: "Nummerierte Liste", icon: ListOrdered, action: (t) => applyList(t, true) },
];

export function MarkdownEditor({
  className,
  defaultValue,
  onKeyDown,
  ...props
}: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  function run(action: (textarea: HTMLTextAreaElement) => void) {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.focus();
    action(textarea);
    textarea.dispatchEvent(new Event("input", { bubbles: true }));
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;

    const textarea = event.currentTarget;
    if (event.key === "Enter" && !event.shiftKey && continueList(textarea)) {
      event.preventDefault();
      return;
    }

    if (!(event.ctrlKey || event.metaKey) || event.altKey) return;
    const shortcut = {
      b: INLINE_FORMATS.bold,
      i: INLINE_FORMATS.italic,
      u: INLINE_FORMATS.underline,
    }[event.key.toLowerCase()];
    if (shortcut) {
      event.preventDefault();
      applyInline(textarea, shortcut);
    }
  }


  const showPreview = preview !== null;

  return (
    <div className="overflow-hidden rounded-lg border border-input bg-background shadow-xs focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
      <div
        role="toolbar"
        aria-label="Textformatierung"
        className="flex flex-wrap items-center gap-0.5 border-b border-input bg-muted/40 px-1.5 py-1"
      >
        {TOOLS.map(({ label, icon: Icon, action }) => (
          <button
            key={label}
            type="button"
            title={label}
            aria-label={label}
            onClick={() => run(action)}
            disabled={showPreview || props.disabled}
            className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
          >
            <Icon className="size-4" />
          </button>
        ))}
        <button
          type="button"
          onClick={() =>
            setPreview(showPreview ? null : (textareaRef.current?.value ?? ""))
          }
          aria-pressed={showPreview}
          className="ml-auto inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          {showPreview ? (
            <>
              <Pencil className="size-3.5" /> Bearbeiten
            </>
          ) : (
            <>
              <Eye className="size-3.5" /> Vorschau
            </>
          )}
        </button>
      </div>
      <Textarea
        ref={textareaRef}
        defaultValue={defaultValue}
        onKeyDown={handleKeyDown}
        className={cn(
          "rounded-none border-0 shadow-none focus-visible:ring-0",
          showPreview && "hidden",
          className,
        )}
        {...props}
      />
      {showPreview ? (
        <div className={cn("min-h-24 px-3 py-2", className)}>
          {preview.trim() ? (
            <MarkdownContent content={preview} />
          ) : (
            <p className="text-sm text-muted-foreground">Noch kein Text.</p>
          )}
        </div>
      ) : null}
    </div>
  );
}
