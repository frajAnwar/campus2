"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import CodeBlock from "@tiptap/extension-code-block";
import { Bold, Italic, Code, List, ListOrdered, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
}

export function RichTextEditor({
  value,
  onChange,
  className,
}: Props) {
  const editor = useEditor({
    extensions: [StarterKit, CodeBlock],
    content: value,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "prose dark:prose-invert max-w-none min-h-[120px] px-3 py-2 focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  if (!editor) return null;

  return (
    <div className={cn("border rounded-lg overflow-hidden", className)}>
      <div className="flex gap-1 p-2 border-b bg-muted/50">
        {[
          {
            action: () => editor.chain().focus().toggleBold().run(),
            icon: Bold,
            label: "Bold",
          },
          {
            action: () => editor.chain().focus().toggleItalic().run(),
            icon: Italic,
            label: "Italic",
          },
          {
            action: () => editor.chain().focus().toggleCode().run(),
            icon: Code,
            label: "Code",
          },
          {
            action: () => editor.chain().focus().toggleBulletList().run(),
            icon: List,
            label: "List",
          },
          {
            action: () => editor.chain().focus().toggleOrderedList().run(),
            icon: ListOrdered,
            label: "Ordered list",
          },
          {
            action: () => editor.chain().focus().toggleBlockquote().run(),
            icon: Quote,
            label: "Quote",
          },
        ].map(({ action, icon: Icon, label }) => (
          <Button
            key={label}
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={action}
            type="button"
          >
            <Icon className="h-3.5 w-3.5" />
          </Button>
        ))}
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
