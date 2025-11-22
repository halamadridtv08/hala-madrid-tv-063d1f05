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

  // Synchronize editor content when switching back to edit tab
  useEffect(() => {
    if (editorRef.current && activeTab === "edit" && !isUpdatingRef.current) {
      const sanitized = DOMPurify.sanitize(value || '', {
        ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'img', 'video', 'iframe', 'blockquote', 'div', 'span', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'script', 'section'],
        ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'width', 'height', 'controls', 'class', 'target', 'rel', 'style', 'frameborder', 'allow', 'allowfullscreen', 'scrolling', 'allowtransparency', 'data-theme', 'cite', 'data-video-id', 'async', 'charset']
      });
      
      // Always update content when returning to edit tab
      if (editorRef.current.innerHTML !== sanitized) {
        const selection = window.getSelection();
        const range = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
        const startOffset = range?.startOffset || 0;
        
        editorRef.current.innerHTML = sanitized;
        
        // Restore cursor position if possible
        if (range && editorRef.current.firstChild) {
          try {
            const newRange = document.createRange();
            newRange.setStart(editorRef.current.firstChild, Math.min(startOffset, editorRef.current.firstChild.textContent?.length || 0));
            newRange.collapse(true);
            selection?.removeAllRanges();
            selection?.addRange(newRange);
          } catch (e) {
            // Cursor restoration failed, ignore
          }
        }
      }
    }
  }, [value, activeTab]);

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

  const validateUrl = (url: string): boolean => {
    const urlPattern = /^https?:\/\/.+/i;
    return urlPattern.test(url.trim());
  };

  const insertLink = () => {
    const url = prompt("Entrez l'URL du lien:", "https://");
    if (url) {
      const trimmedUrl = url.trim();
      if (!validateUrl(trimmedUrl)) {
        alert("URL invalide. Veuillez utiliser une URL commençant par http:// ou https://");
        return;
      }
      execCommand('createLink', trimmedUrl);
    }
  };

  const handleMediaUploadSuccess = (url: string, type: string) => {
    if (editorRef.current) {
      let html = '';
      if (type === 'image') {
        html = `<img src="${url}" alt="Image" style="max-width: 100%; height: auto;" />`;
      } else if (type === 'video') {
        html = `<video controls src="${url}" style="max-width: 100%;"></video>`;
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
    if (!url || (!url.includes('twitter.com') && !url.includes('x.com'))) {
      if (url) alert("URL Twitter/X invalide");
      return;
    }
    
    const embedHTML = `<blockquote class="twitter-tweet" data-theme="dark"><a href="${url}"></a></blockquote><script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>`;
    document.execCommand('insertHTML', false, embedHTML);
    handleInput();
  };

  const insertInstagramEmbed = () => {
    const url = prompt("Entrez l'URL du post Instagram:", "https://www.instagram.com/p/");
    if (!url || !url.includes('instagram.com')) {
      if (url) alert("URL Instagram invalide");
      return;
    }
    
    const embedUrl = url.endsWith('/') ? url + 'embed' : url + '/embed';
    const embedHTML = `<iframe src="${embedUrl}" width="100%" height="600" frameborder="0" scrolling="no" allowtransparency="true" style="max-width: 540px; margin: 1rem auto; display: block;"></iframe>`;
    document.execCommand('insertHTML', false, embedHTML);
    handleInput();
  };

  const insertTikTokEmbed = () => {
    const url = prompt("Entrez l'URL de la vidéo TikTok:", "https://www.tiktok.com/@");
    if (!url || !url.includes('tiktok.com')) {
      if (url) alert("URL TikTok invalide");
      return;
    }
    
    const embedHTML = `<blockquote class="tiktok-embed" cite="${url}" data-video-id="" style="max-width: 605px; min-width: 325px; margin: 1rem auto;"><section><a href="${url}">Voir sur TikTok</a></section></blockquote><script async src="https://www.tiktok.com/embed.js"></script>`;
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
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'img', 'video', 'iframe', 'blockquote', 'div', 'span', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'script', 'section'],
      ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'width', 'height', 'controls', 'class', 'target', 'rel', 'style', 'frameborder', 'allow', 'allowfullscreen', 'scrolling', 'allowtransparency', 'data-theme', 'cite', 'data-video-id', 'async', 'charset']
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
        
        <TabsContent value="edit" className="mt-2">
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            className="w-full p-3 border rounded-md bg-background prose dark:prose-invert max-w-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            style={{ minHeight }}
            suppressContentEditableWarning
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
