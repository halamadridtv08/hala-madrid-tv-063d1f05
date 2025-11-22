
import React, { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MediaUploader } from "./MediaUploader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bold, Italic, AlignLeft, AlignCenter, AlignRight, Link, Video, Image as ImageIcon, Table, Twitter, Instagram, Youtube, Quote } from "lucide-react";
import DOMPurify from "dompurify";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minRows?: number;
  showPreview?: boolean;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Contenu de l'article...",
  minRows = 10,
  showPreview = true
}: RichTextEditorProps) {
  const [showMediaUploader, setShowMediaUploader] = useState(false);
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
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
  
  const insertTable = () => {
    const rows = prompt("Nombre de lignes:", "3");
    const cols = prompt("Nombre de colonnes:", "3");
    
    if (!rows || !cols) return;
    
    const numRows = parseInt(rows);
    const numCols = parseInt(cols);
    
    if (isNaN(numRows) || isNaN(numCols) || numRows < 1 || numCols < 1) {
      alert("Veuillez entrer des nombres valides");
      return;
    }
    
    let tableHTML = '\n<table style="width: 100%; border-collapse: collapse; margin: 1rem 0;">\n';
    
    // Header row
    tableHTML += '  <thead>\n    <tr>\n';
    for (let j = 0; j < numCols; j++) {
      tableHTML += '      <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">En-tête ' + (j + 1) + '</th>\n';
    }
    tableHTML += '    </tr>\n  </thead>\n';
    
    // Body rows
    tableHTML += '  <tbody>\n';
    for (let i = 1; i < numRows; i++) {
      tableHTML += '    <tr>\n';
      for (let j = 0; j < numCols; j++) {
        tableHTML += '      <td style="border: 1px solid #ddd; padding: 8px;">Cellule ' + i + '-' + (j + 1) + '</td>\n';
      }
      tableHTML += '    </tr>\n';
    }
    tableHTML += '  </tbody>\n';
    tableHTML += '</table>\n';
    
    insertAtCursor(tableHTML);
  };
  
  const insertTwitterEmbed = () => {
    const url = prompt("Entrez l'URL du tweet:", "https://twitter.com/");
    if (!url || !url.includes('twitter.com') && !url.includes('x.com')) {
      if (url) alert("URL Twitter/X invalide");
      return;
    }
    
    const embedHTML = `\n<blockquote class="twitter-tweet" data-theme="dark"><a href="${url}"></a></blockquote>\n<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>\n`;
    insertAtCursor(embedHTML);
  };
  
  const insertInstagramEmbed = () => {
    const url = prompt("Entrez l'URL du post Instagram:", "https://www.instagram.com/p/");
    if (!url || !url.includes('instagram.com')) {
      if (url) alert("URL Instagram invalide");
      return;
    }
    
    const embedUrl = url.endsWith('/') ? url + 'embed' : url + '/embed';
    const embedHTML = `\n<iframe src="${embedUrl}" width="100%" height="600" frameborder="0" scrolling="no" allowtransparency="true" style="max-width: 540px; margin: 1rem auto; display: block;"></iframe>\n`;
    insertAtCursor(embedHTML);
  };
  
  const insertTikTokEmbed = () => {
    const url = prompt("Entrez l'URL de la vidéo TikTok:", "https://www.tiktok.com/@");
    if (!url || !url.includes('tiktok.com')) {
      if (url) alert("URL TikTok invalide");
      return;
    }
    
    const embedHTML = `\n<blockquote class="tiktok-embed" cite="${url}" data-video-id="" style="max-width: 605px; min-width: 325px; margin: 1rem auto;"><section><a href="${url}">Voir sur TikTok</a></section></blockquote>\n<script async src="https://www.tiktok.com/embed.js"></script>\n`;
    insertAtCursor(embedHTML);
  };
  
  const insertBlockquote = () => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      
      if (start === end) {
        // No text selected
        insertAtCursor(`\n<blockquote>\n  <p>Votre citation ici...</p>\n</blockquote>\n`);
      } else {
        // Wrap selected text in blockquote
        const selectedText = value.substring(start, end);
        insertTag(`<blockquote>\n  <p>`, `</p>\n</blockquote>`);
      }
    }
  };
  
  const renderPreview = () => {
    // Convert newlines to HTML paragraphs if no HTML tags are present
    let content = value;
    
    // If content has no HTML tags, convert newlines to <p> tags
    if (!/<[^>]+>/.test(content)) {
      content = content
        .split('\n\n')
        .filter(p => p.trim())
        .map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`)
        .join('');
    }
    
    const sanitized = DOMPurify.sanitize(content, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'img', 'video', 'iframe', 'blockquote', 'div', 'span', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'script', 'section'],
      ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'width', 'height', 'controls', 'class', 'target', 'rel', 'style', 'frameborder', 'allow', 'allowfullscreen', 'scrolling', 'allowtransparency', 'data-theme', 'cite', 'data-video-id', 'async', 'charset']
    });
    
    return { __html: sanitized };
  };
  
  if (!showPreview) {
    return (
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-1 p-1 border rounded-md bg-muted/30">
          <Button type="button" variant="ghost" size="sm" onClick={insertBold} className="h-8 px-2">
            <Bold className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={insertItalic} className="h-8 px-2">
            <Italic className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={insertLeftAlign} className="h-8 px-2">
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={insertCenterAlign} className="h-8 px-2">
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={insertRightAlign} className="h-8 px-2">
            <AlignRight className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={insertLink} className="h-8 px-2">
            <Link className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={insertTable} className="h-8 px-2">
            <Table className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={insertBlockquote} className="h-8 px-2" title="Citation">
            <Quote className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => setShowMediaUploader(prev => !prev)} className="h-8 px-2">
            <ImageIcon className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => setShowMediaUploader(prev => !prev)} className="h-8 px-2">
            <Video className="h-4 w-4" />
          </Button>
          <div className="h-6 w-px bg-border mx-1" />
          <Button type="button" variant="ghost" size="sm" onClick={insertTwitterEmbed} className="h-8 px-2" title="Twitter/X">
            <Twitter className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={insertInstagramEmbed} className="h-8 px-2" title="Instagram">
            <Instagram className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={insertTikTokEmbed} className="h-8 px-2" title="TikTok">
            <Youtube className="h-4 w-4" />
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

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-1 p-1 border rounded-md bg-muted/30">
        <Button type="button" variant="ghost" size="sm" onClick={insertBold} className="h-8 px-2" title="Gras">
          <Bold className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={insertItalic} className="h-8 px-2" title="Italique">
          <Italic className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={insertLeftAlign} className="h-8 px-2" title="Aligner à gauche">
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={insertCenterAlign} className="h-8 px-2" title="Centrer">
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={insertRightAlign} className="h-8 px-2" title="Aligner à droite">
          <AlignRight className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={insertLink} className="h-8 px-2" title="Insérer un lien">
          <Link className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={insertTable} className="h-8 px-2" title="Insérer un tableau">
          <Table className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={insertBlockquote} className="h-8 px-2" title="Insérer une citation">
          <Quote className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => setShowMediaUploader(prev => !prev)} className="h-8 px-2" title="Image/Vidéo">
          <ImageIcon className="h-4 w-4" />
        </Button>
        <div className="h-6 w-px bg-border mx-1" />
        <Button type="button" variant="ghost" size="sm" onClick={insertTwitterEmbed} className="h-8 px-2" title="Embed Twitter/X">
          <Twitter className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={insertInstagramEmbed} className="h-8 px-2" title="Embed Instagram">
          <Instagram className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={insertTikTokEmbed} className="h-8 px-2" title="Embed TikTok">
          <Youtube className="h-4 w-4" />
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
      
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "edit" | "preview")} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="edit">Édition</TabsTrigger>
          <TabsTrigger value="preview">Prévisualisation</TabsTrigger>
        </TabsList>
        
        <TabsContent value="edit" className="mt-2">
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={minRows}
            className="font-mono"
          />
        </TabsContent>
        
        <TabsContent value="preview" className="mt-2">
          <div 
            className="min-h-[300px] p-4 border rounded-md bg-background prose dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={renderPreview()}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
