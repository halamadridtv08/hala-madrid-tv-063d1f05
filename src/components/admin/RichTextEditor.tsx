
import React, { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MediaUploader } from "./MediaUploader";
import { Bold, Italic, AlignLeft, AlignCenter, AlignRight, Link, Video, Image as ImageIcon } from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minRows?: number;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Contenu de l'article...",
  minRows = 10
}: RichTextEditorProps) {
  const [showMediaUploader, setShowMediaUploader] = useState(false);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  
  const insertAtCursor = (textToInsert: string) => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    const textBefore = value.substring(0, start);
    const textAfter = value.substring(end);
    
    onChange(textBefore + textToInsert + textAfter);
    
    // Reposition cursor after the inserted text
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = start + textToInsert.length;
      textarea.selectionEnd = start + textToInsert.length;
    }, 0);
  };
  
  const insertTag = (openTag: string, closeTag: string) => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    if (start === end) {
      // No selection, just insert the tags
      insertAtCursor(openTag + closeTag);
    } else {
      // Wrap the selection with tags
      const selectedText = value.substring(start, end);
      const textBefore = value.substring(0, start);
      const textAfter = value.substring(end);
      
      onChange(textBefore + openTag + selectedText + closeTag + textAfter);
    }
  };
  
  const insertBold = () => insertTag("<strong>", "</strong>");
  const insertItalic = () => insertTag("<em>", "</em>");
  const insertParagraph = () => insertTag("<p>", "</p>");
  const insertCenterAlign = () => insertTag('<div style="text-align: center;">', '</div>');
  const insertLeftAlign = () => insertTag('<div style="text-align: left;">', '</div>');
  const insertRightAlign = () => insertTag('<div style="text-align: right;">', '</div>');
  
  const validateUrl = (url: string): boolean => {
    // Only allow http:// and https:// protocols
    const urlPattern = /^https?:\/\/.+/i;
    return urlPattern.test(url.trim());
  };
  
  const insertLink = () => {
    const url = prompt("Entrez l'URL du lien:", "https://");
    if (url) {
      const trimmedUrl = url.trim();
      
      // Validate URL to prevent XSS attacks
      if (!validateUrl(trimmedUrl)) {
        alert("URL invalide. Veuillez utiliser une URL commençant par http:// ou https://");
        return;
      }
      
      if (textareaRef.current) {
        const textarea = textareaRef.current;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        
        if (start === end) {
          // No text selected
          insertAtCursor(`<a href="${trimmedUrl}" target="_blank">lien</a>`);
        } else {
          // Use selected text as link text
          const selectedText = value.substring(start, end);
          insertTag(`<a href="${trimmedUrl}" target="_blank">`, `</a>`);
        }
      }
    }
  };
  
  const handleMediaUploadSuccess = (url: string, type: string) => {
    if (type === 'image') {
      insertAtCursor(`\n<img src="${url}" alt="Image" style="max-width: 100%; height: auto;" />\n`);
    } else if (type === 'video') {
      insertAtCursor(`\n<video controls src="${url}" style="max-width: 100%;"></video>\n`);
    }
    setShowMediaUploader(false);
  };
  
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-1 p-1 border rounded-md bg-muted/30">
        <Button 
          type="button" 
          variant="ghost" 
          size="sm" 
          onClick={insertBold}
          className="h-8 px-2"
        >
          <Bold className="h-4 w-4" />
        </Button>
        
        <Button 
          type="button" 
          variant="ghost" 
          size="sm" 
          onClick={insertItalic}
          className="h-8 px-2"
        >
          <Italic className="h-4 w-4" />
        </Button>
        
        <Button 
          type="button" 
          variant="ghost" 
          size="sm" 
          onClick={insertLeftAlign}
          className="h-8 px-2"
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        
        <Button 
          type="button" 
          variant="ghost" 
          size="sm" 
          onClick={insertCenterAlign}
          className="h-8 px-2"
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        
        <Button 
          type="button" 
          variant="ghost" 
          size="sm" 
          onClick={insertRightAlign}
          className="h-8 px-2"
        >
          <AlignRight className="h-4 w-4" />
        </Button>
        
        <Button 
          type="button" 
          variant="ghost" 
          size="sm" 
          onClick={insertLink}
          className="h-8 px-2"
        >
          <Link className="h-4 w-4" />
        </Button>
        
        <Button 
          type="button" 
          variant="ghost" 
          size="sm" 
          onClick={() => setShowMediaUploader(prev => !prev)}
          className="h-8 px-2"
        >
          <ImageIcon className="h-4 w-4" />
        </Button>
        
        <Button 
          type="button" 
          variant="ghost" 
          size="sm" 
          onClick={() => setShowMediaUploader(prev => !prev)}
          className="h-8 px-2"
        >
          <Video className="h-4 w-4" />
        </Button>
      </div>
      
      {showMediaUploader && (
        <div className="p-4 border rounded-md bg-muted/10">
          <MediaUploader 
            onSuccess={handleMediaUploadSuccess} 
            acceptTypes="image/*,video/*" 
            buttonText="Télécharger un média"
          />
        </div>
      )}
      
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={minRows}
        className="font-mono"
      />
    </div>
  );
}
