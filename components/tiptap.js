"use client";
// Tiptap.js
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";

export default function Tiptap({ content, onChange }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      // Add other extensions as needed
    ],
    content: content,
    onUpdate: () => onChange(editor.getHTML()),
  });

  // Update editor content when 'content' prop changes
  useEffect(() => {
    if (editor) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  useEffect(() => {
    if (editor) {
      editor.focus();
    }
  }, [editor]);

  return (
    <>
      <EditorContent editor={editor} />
    </>
  );
}
