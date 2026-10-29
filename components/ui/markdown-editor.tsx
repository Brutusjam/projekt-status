"use client";

import { useState } from "react";
import { Markdown } from "@tiptap/markdown";
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Heading2,
  Heading3,
  IndentDecrease,
  IndentIncrease,
  Italic,
  Link,
  List,
  ListOrdered,
  Minus,
  Pilcrow,
  Quote,
  Redo2,
  Strikethrough,
  Underline,
  Undo2,
} from "lucide-react";
import { cn } from "@/lib/utils";

type MarkdownEditorProps = {
  id?: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
};

type Tool = {
  label: string;
  icon: typeof Bold;
  run: (editor: Editor) => void;
  isActive?: (editor: Editor) => boolean;
  canRun?: (editor: Editor) => boolean;
};

function toggleLink(editor: Editor) {
  if (editor.isActive("link")) {
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    return;
  }
  const url = window.prompt("Link-Adresse (z. B. https://www.example.ch)");
  if (!url?.trim()) return;
  const href = /^[a-z]+:/i.test(url.trim()) ? url.trim() : `https://${url.trim()}`;
  editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
}

const TOOL_GROUPS: Tool[][] = [
  [
    {
      label: "Absatz",
      icon: Pilcrow,
      run: (e) => e.chain().focus().setParagraph().run(),
      isActive: (e) => e.isActive("paragraph"),
    },
    {
      label: "Überschrift",
      icon: Heading2,
      run: (e) => e.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: (e) => e.isActive("heading", { level: 2 }),
    },
    {
      label: "Zwischentitel",
      icon: Heading3,
      run: (e) => e.chain().focus().toggleHeading({ level: 3 }).run(),
      isActive: (e) => e.isActive("heading", { level: 3 }),
    },
  ],
  [
    {
      label: "Fett (Strg+B)",
      icon: Bold,
      run: (e) => e.chain().focus().toggleBold().run(),
      isActive: (e) => e.isActive("bold"),
    },
    {
      label: "Kursiv (Strg+I)",
      icon: Italic,
      run: (e) => e.chain().focus().toggleItalic().run(),
      isActive: (e) => e.isActive("italic"),
    },
    {
      label: "Unterstrichen (Strg+U)",
      icon: Underline,
      run: (e) => e.chain().focus().toggleUnderline().run(),
      isActive: (e) => e.isActive("underline"),
    },
    {
      label: "Durchgestrichen",
      icon: Strikethrough,
      run: (e) => e.chain().focus().toggleStrike().run(),
      isActive: (e) => e.isActive("strike"),
    },
    {
      label: "Link",
      icon: Link,
      run: toggleLink,
      isActive: (e) => e.isActive("link"),
    },
  ],
  [
    {
      label: "Aufzählung",
      icon: List,
      run: (e) => e.chain().focus().toggleBulletList().run(),
      isActive: (e) => e.isActive("bulletList"),
    },
    {
      label: "Nummerierte Liste",
      icon: ListOrdered,
      run: (e) => e.chain().focus().toggleOrderedList().run(),
      isActive: (e) => e.isActive("orderedList"),
    },
    {
      label: "Einzug vergrössern (Tab)",
      icon: IndentIncrease,
      run: (e) => e.chain().focus().sinkListItem("listItem").run(),
      canRun: (e) => e.can().sinkListItem("listItem"),
    },
    {
      label: "Einzug verkleinern (Shift+Tab)",
      icon: IndentDecrease,
      run: (e) => e.chain().focus().liftListItem("listItem").run(),
      canRun: (e) => e.can().liftListItem("listItem"),
    },
  ],
  [
    {
      label: "Zitat",
      icon: Quote,
      run: (e) => e.chain().focus().toggleBlockquote().run(),
      isActive: (e) => e.isActive("blockquote"),
    },
    {
      label: "Trennlinie",
      icon: Minus,
      run: (e) => e.chain().focus().setHorizontalRule().run(),
    },
  ],
  [
    {
      label: "Rückgängig (Strg+Z)",
      icon: Undo2,
      run: (e) => e.chain().focus().undo().run(),
      canRun: (e) => e.can().undo(),
    },
    {
      label: "Wiederholen (Strg+Y)",
      icon: Redo2,
      run: (e) => e.chain().focus().redo().run(),
      canRun: (e) => e.can().redo(),
    },
  ],
];

const TOOLS = TOOL_GROUPS.flat();

function Toolbar({ editor, disabled }: { editor: Editor; disabled?: boolean }) {
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) =>
      TOOLS.map((tool) => ({
        active: tool.isActive?.(e) ?? false,
        enabled: tool.canRun?.(e) ?? true,
      })),
  });

  let index = 0;
  return (
    <div
      role="toolbar"
      aria-label="Textformatierung"
      className="flex flex-wrap items-center gap-0.5 border-b border-input bg-muted/40 px-1.5 py-1"
    >
      {TOOL_GROUPS.map((group, groupIndex) => (
        <div key={groupIndex} className="flex items-center gap-0.5">
          {groupIndex > 0 ? (
            <span aria-hidden className="mx-1 h-5 w-px bg-border" />
          ) : null}
          {group.map((tool) => {
            const { active, enabled } = state[index++];
            const Icon = tool.icon;
            return (
              <button
                key={tool.label}
                type="button"
                title={tool.label}
                aria-label={tool.label}
                aria-pressed={tool.isActive ? active : undefined}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => tool.run(editor)}
                disabled={disabled || !enabled}
                className={cn(
                  "inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40",
                  active && "bg-muted text-foreground",
                )}
              >
                <Icon className="size-4" />
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

export function MarkdownEditor({
  id,
  name,
  defaultValue = "",
  required,
  disabled,
  className,
}: MarkdownEditorProps) {
  const [value, setValue] = useState(defaultValue);

  const editor = useEditor({
    immediatelyRender: false,
    editable: !disabled,
    extensions: [
      StarterKit.configure({
        code: false,
        codeBlock: false,
        heading: { levels: [2, 3] },
        link: { openOnClick: false, autolink: true },
      }),
      Markdown.configure({ markedOptions: { gfm: true, breaks: true } }),
    ],
    content: defaultValue,
    contentType: "markdown",
    editorProps: {
      attributes: {
        class: cn(
          "markdown-content markdown-content--editor min-h-24 px-3 py-2 outline-none",
          className,
        ),
        role: "textbox",
        "aria-multiline": "true",
        ...(id ? { "aria-labelledby": `${id}-label` } : {}),
      },
    },
    onUpdate: ({ editor: e }) => setValue(e.isEmpty ? "" : e.getMarkdown()),
  });

  return (
    <div className="relative overflow-hidden rounded-lg border border-input bg-background shadow-xs focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
      {editor ? (
        <Toolbar editor={editor} disabled={disabled} />
      ) : (
        <div className="h-[41px] border-b border-input bg-muted/40" />
      )}
      {editor ? (
        <EditorContent editor={editor} />
      ) : (
        <div className={cn("min-h-24 px-3 py-2", className)} />
      )}
      {/*
        Trägt den Markdown-Text ins Formular und zeigt die Pflichtfeld-Meldung des Browsers.
        Bewusst <textarea>: ein <input> würde die Zeilenumbrüche entfernen.
      */}
      <textarea
        id={id}
        name={name}
        value={value}
        required={required}
        disabled={disabled}
        onChange={() => {}}
        onFocus={() => editor?.commands.focus()}
        tabIndex={-1}
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-4 h-px w-px opacity-0"
      />
    </div>
  );
}
