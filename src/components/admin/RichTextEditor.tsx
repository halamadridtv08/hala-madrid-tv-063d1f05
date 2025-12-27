import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MediaUploader } from "./MediaUploader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bold, Italic, AlignLeft, AlignCenter, AlignRight, Link, Video, Image as ImageIcon, Table, Twitter, Instagram, Youtube, Quote, List, ListOrdered } from "lucide-react";
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
  const editorRef = useRef<HTMLDivElement>(null);
  const isUpdatingRef = useRef(false);

  // Initialize editor content on mount
  useEffect(() => {
    if (editorRef.current && !isUpdatingRef.current && value) {
      const sanitized = DOMPurify.sanitize(value, {
        ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'img', 'video', 'iframe', 'blockquote', 'div', 'span', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'section'],
        ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'width', 'height', 'controls', 'class', 'target', 'rel', 'style', 'frameborder', 'allow', 'allowfullscreen', 'scrolling', 'allowtransparency', 'data-theme', 'cite', 'data-video-id']
      });
      
      // Only update if empty (initial load)
      if (editorRef.current.innerHTML === '' || editorRef.current.innerHTML === '<br>') {
        editorRef.current.innerHTML = sanitized;
      }
    }
  }, []);

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
  const insertUnderline = () => execCommand('underline');
  const insertLeftAlign = () => execCommand('justifyLeft');
  const insertCenterAlign = () => execCommand('justifyCenter');
  const insertRightAlign = () => execCommand('justifyRight');
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
      // Block common XSS vectors
      if (/^(javascript|data|vbscript|file):/i.test(trimmed)) {
        return false;
      }
      const parsed = new URL(trimmed);
      return ['http:', 'https:'].includes(parsed.protocol);
    } catch {
      return false;
    }
  };

  // Validate URLs for specific social media platforms with strict domain checking
  const validateSocialUrl = (url: string, allowedDomains: string[]): boolean => {
    if (!validateUrl(url)) return false;
    
    try {
      const parsed = new URL(url.trim());
      const hostname = parsed.hostname.toLowerCase();
      // Check if hostname matches or is a subdomain of allowed domains
      return allowedDomains.some(domain => 
        hostname === domain || hostname.endsWith('.' + domain)
      );
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

  const handleMediaUploadSuccess = (url: string, type: string) => {
    if (editorRef.current) {
      if (!validateUrl(url)) {
        alert("URL de média invalide");
        return;
      }
      const escapedUrl = escapeHtml(url);
      let html = '';
      if (type === 'image') {
        html = `<img src="${escapedUrl}" alt="Image" style="max-width: 100%; height: auto;" />`;
      } else if (type === 'video') {
        html = `<video controls src="${escapedUrl}" style="max-width: 100%;"></video>`;
      }
      
      document.execCommand('insertHTML', false, html);
      handleInput();
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
    
    let tableHTML = '<table style="width: 100%; border-collapse: collapse; margin: 1rem 0;">';
    tableHTML += '<thead><tr>';
    for (let j = 0; j < numCols; j++) {
      tableHTML += '<th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">En-tête ' + (j + 1) + '</th>';
    }
    tableHTML += '</tr></thead>';
    
    tableHTML += '<tbody>';
    for (let i = 1; i < numRows; i++) {
      tableHTML += '<tr>';
      for (let j = 0; j < numCols; j++) {
        tableHTML += '<td style="border: 1px solid #ddd; padding: 8px;">Cellule ' + i + '-' + (j + 1) + '</td>';
      }
      tableHTML += '</tr>';
    }
    tableHTML += '</tbody></table>';
    
    document.execCommand('insertHTML', false, tableHTML);
    handleInput();
  };

  const insertTwitterEmbed = () => {
    const url = prompt("Entrez l'URL du tweet:", "https://twitter.com/");
    if (!url) return;
    
    // Validate URL with strict domain checking
    if (!validateSocialUrl(url, ['twitter.com', 'x.com'])) {
      alert("URL Twitter/X invalide. Veuillez utiliser une URL valide de twitter.com ou x.com");
      return;
    }
    
    // Escape the URL for safe HTML insertion
    const escapedUrl = escapeHtml(url.trim());
    const embedHTML = `<blockquote class="twitter-tweet" data-theme="dark"><a href="${escapedUrl}"></a></blockquote><script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>`;
    document.execCommand('insertHTML', false, embedHTML);
    handleInput();
  };

  const insertInstagramEmbed = () => {
    const url = prompt("Entrez l'URL du post Instagram:", "https://www.instagram.com/p/");
    if (!url) return;
    
    // Validate URL with strict domain checking
    if (!validateSocialUrl(url, ['instagram.com'])) {
      alert("URL Instagram invalide. Veuillez utiliser une URL valide de instagram.com");
      return;
    }
    
    // Escape the URL for safe HTML insertion
    const trimmedUrl = url.trim();
    const embedUrl = trimmedUrl.endsWith('/') ? trimmedUrl + 'embed' : trimmedUrl + '/embed';
    const escapedEmbedUrl = escapeHtml(embedUrl);
    const embedHTML = `<iframe src="${escapedEmbedUrl}" width="100%" height="600" frameborder="0" scrolling="no" allowtransparency="true" style="max-width: 540px; margin: 1rem auto; display: block;"></iframe>`;
    document.execCommand('insertHTML', false, embedHTML);
    handleInput();
  };

  const insertTikTokEmbed = () => {
    const url = prompt("Entrez l'URL de la vidéo TikTok:", "https://www.tiktok.com/@");
    if (!url) return;
    
    // Validate URL with strict domain checking
    if (!validateSocialUrl(url, ['tiktok.com'])) {
      alert("URL TikTok invalide. Veuillez utiliser une URL valide de tiktok.com");
      return;
    }
    
    // Escape the URL for safe HTML insertion
    const escapedUrl = escapeHtml(url.trim());
    const embedHTML = `<blockquote class="tiktok-embed" cite="${escapedUrl}" data-video-id="" style="max-width: 605px; min-width: 325px; margin: 1rem auto;"><section><a href="${escapedUrl}">Voir sur TikTok</a></section></blockquote><script async src="https://www.tiktok.com/embed.js"></script>`;
    document.execCommand('insertHTML', false, embedHTML);
    handleInput();
  };

  const insertBlockquote = () => {
    const selection = window.getSelection();
    if (selection && selection.toString()) {
      const html = `<blockquote><p>${selection.toString()}</p></blockquote>`;
      document.execCommand('insertHTML', false, html);
    } else {
      document.execCommand('insertHTML', false, '<blockquote><p>Votre citation ici...</p></blockquote>');
    }
    handleInput();
  };

  const renderPreview = () => {
    const sanitized = DOMPurify.sanitize(value, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'img', 'video', 'iframe', 'blockquote', 'div', 'span', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'section'],
      ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'width', 'height', 'controls', 'class', 'target', 'rel', 'style', 'frameborder', 'allow', 'allowfullscreen', 'scrolling', 'allowtransparency', 'data-theme', 'cite', 'data-video-id']
    });
    
    return { __html: sanitized };
  };

  const minHeight = `${minRows * 24}px`;

  if (!showPreview) {
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
          <Button type="button" variant="ghost" size="sm" onClick={insertUnorderedList} className="h-8 px-2" title="Liste à puces">
            <List className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={insertOrderedList} className="h-8 px-2" title="Liste numérotée">
            <ListOrdered className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={insertTable} className="h-8 px-2" title="Tableau">
            <Table className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={insertBlockquote} className="h-8 px-2" title="Citation">
            <Quote className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => setShowMediaUploader(prev => !prev)} className="h-8 px-2" title="Image/Vidéo">
            <ImageIcon className="h-4 w-4" />
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
        
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          className="w-full p-3 border rounded-md bg-background prose dark:prose-invert max-w-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          style={{ minHeight }}
          suppressContentEditableWarning
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
        <Button type="button" variant="ghost" size="sm" onClick={insertUnorderedList} className="h-8 px-2" title="Liste à puces">
          <List className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={insertOrderedList} className="h-8 px-2" title="Liste numérotée">
          <ListOrdered className="h-4 w-4" />
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
        
        <div className="mt-2">
          {/* Editor - always mounted but hidden when not active */}
          <div style={{ display: activeTab === "edit" ? "block" : "none" }}>
            <div
              ref={editorRef}
              contentEditable
              onInput={handleInput}
              className="w-full p-3 border rounded-md bg-background prose dark:prose-invert max-w-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              style={{ minHeight }}
              suppressContentEditableWarning
            />
          </div>
          
          {/* Preview - only shown when active */}
          {activeTab === "preview" && (
            <div 
              className="min-h-[300px] p-4 border rounded-md bg-background prose dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={renderPreview()}
            />
          )}
        </div>
      </Tabs>
    </div>
  );
}
