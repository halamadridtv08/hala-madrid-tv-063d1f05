import React, { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Bold, Italic, AlignLeft, AlignCenter, List, ListOrdered, Link, Heading2, Heading3 } from "lucide-react";
import DOMPurify from "dompurify";

interface SimpleRichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minRows?: number;
}

export function SimpleRichTextEditor({
  value,
  onChange,
  placeholder = "Écrivez votre contenu ici...",
  minRows = 8
}: SimpleRichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isUpdatingRef = useRef(false);

  // Sync editor content with value prop
  useEffect(() => {
    if (editorRef.current && !isUpdatingRef.current) {
      const sanitized = DOMPurify.sanitize(value, {
        ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li', 'h2', 'h3', 'h4', 'div', 'span'],
        ALLOWED_ATTR: ['href', 'target', 'rel', 'class']
      });
      
      if (editorRef.current.innerHTML !== sanitized) {
        editorRef.current.innerHTML = sanitized;
      }
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current && !isUpdatingRef.current) {
      isUpdatingRef.current = true;
      const content = editorRef.current.innerHTML;
      onChange(content);
      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 0);
    }
  };

  const execCommand = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  const insertBold = () => execCommand('bold');
  const insertItalic = () => execCommand('italic');
  const insertLeftAlign = () => execCommand('justifyLeft');
  const insertCenterAlign = () => execCommand('justifyCenter');
  const insertUnorderedList = () => execCommand('insertUnorderedList');
  const insertOrderedList = () => execCommand('insertOrderedList');

  const escapeHtml = (text: string): string => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  };

  const validateUrl = (url: string): boolean => {
    try {
      const trimmed = url.trim();
      if (/^(javascript|data|vbscript|file):/i.test(trimmed)) {
        return false;
      }
      const parsed = new URL(trimmed);
      return ['http:', 'https:'].includes(parsed.protocol);
    } catch {
      return false;
    }
  };

  const insertLink = () => {
    const url = prompt("Entrez l'URL du lien:", "https://");
    if (url) {
      const trimmedUrl = url.trim();
      if (!validateUrl(trimmedUrl)) {
        alert("URL invalide. Veuillez utiliser une URL commençant par http:// ou https://");
        return;
      }
      const escapedUrl = escapeHtml(trimmedUrl);
      execCommand('createLink', escapedUrl);
    }
  };

  const insertHeading = (level: 'h2' | 'h3') => {
    const selection = window.getSelection();
    if (selection && selection.toString()) {
      const tag = level === 'h2' ? 'h2' : 'h3';
      document.execCommand('insertHTML', false, `<${tag}>${selection.toString()}</${tag}>`);
    } else {
      const tag = level === 'h2' ? 'h2' : 'h3';
      document.execCommand('insertHTML', false, `<${tag}>Titre</${tag}>`);
    }
    handleInput();
  };

  const minHeight = `${minRows * 24}px`;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-1 p-2 border rounded-md bg-muted/30">
        <Button type="button" variant="ghost" size="sm" onClick={() => insertHeading('h2')} className="h-8 px-2" title="Titre principal">
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => insertHeading('h3')} className="h-8 px-2" title="Sous-titre">
          <Heading3 className="h-4 w-4" />
        </Button>
        <div className="h-6 w-px bg-border mx-1" />
        <Button type="button" variant="ghost" size="sm" onClick={insertBold} className="h-8 px-2" title="Gras">
          <Bold className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={insertItalic} className="h-8 px-2" title="Italique">
          <Italic className="h-4 w-4" />
        </Button>
        <div className="h-6 w-px bg-border mx-1" />
        <Button type="button" variant="ghost" size="sm" onClick={insertLeftAlign} className="h-8 px-2" title="Aligner à gauche">
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={insertCenterAlign} className="h-8 px-2" title="Centrer">
          <AlignCenter className="h-4 w-4" />
        </Button>
        <div className="h-6 w-px bg-border mx-1" />
        <Button type="button" variant="ghost" size="sm" onClick={insertUnorderedList} className="h-8 px-2" title="Liste à puces">
          <List className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={insertOrderedList} className="h-8 px-2" title="Liste numérotée">
          <ListOrdered className="h-4 w-4" />
        </Button>
        <div className="h-6 w-px bg-border mx-1" />
        <Button type="button" variant="ghost" size="sm" onClick={insertLink} className="h-8 px-2" title="Insérer un lien">
          <Link className="h-4 w-4" />
        </Button>
      </div>
      
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        data-placeholder={placeholder}
        className="w-full p-4 border rounded-md bg-background prose dark:prose-invert max-w-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground"
        style={{ minHeight }}
        suppressContentEditableWarning
      />
    </div>
  );
}
