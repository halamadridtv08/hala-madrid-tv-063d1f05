import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MediaUploader } from "./MediaUploader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Bold, Italic, AlignLeft, AlignCenter, AlignRight, Link, Video, Image as ImageIcon, Table, Twitter, Instagram, Youtube, Quote, List, ListOrdered } from "lucide-react";
import DOMPurify from "dompurify";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minRows?: number;
  showPreview?: boolean;
}

// Extracted toolbar component to avoid duplication
interface ToolbarProps {
  onBold: () => void;
  onItalic: () => void;
  onLeftAlign: () => void;
  onCenterAlign: () => void;
  onRightAlign: () => void;
  onLink: () => void;
  onUnorderedList: () => void;
  onOrderedList: () => void;
  onTable: () => void;
  onBlockquote: () => void;
  onMedia: () => void;
  onTwitter: () => void;
  onInstagram: () => void;
  onTikTok: () => void;
}

function EditorToolbar({ onBold, onItalic, onLeftAlign, onCenterAlign, onRightAlign, onLink, onUnorderedList, onOrderedList, onTable, onBlockquote, onMedia, onTwitter, onInstagram, onTikTok }: ToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-1 p-1 border rounded-md bg-muted/30">
      <Button type="button" variant="ghost" size="sm" onClick={onBold} className="h-8 px-2" title="Gras">
        <Bold className="h-4 w-4" />
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={onItalic} className="h-8 px-2" title="Italique">
        <Italic className="h-4 w-4" />
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={onLeftAlign} className="h-8 px-2" title="Aligner à gauche">
        <AlignLeft className="h-4 w-4" />
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={onCenterAlign} className="h-8 px-2" title="Centrer">
        <AlignCenter className="h-4 w-4" />
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={onRightAlign} className="h-8 px-2" title="Aligner à droite">
        <AlignRight className="h-4 w-4" />
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={onLink} className="h-8 px-2" title="Insérer un lien">
        <Link className="h-4 w-4" />
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={onUnorderedList} className="h-8 px-2" title="Liste à puces">
        <List className="h-4 w-4" />
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={onOrderedList} className="h-8 px-2" title="Liste numérotée">
        <ListOrdered className="h-4 w-4" />
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={onTable} className="h-8 px-2" title="Tableau">
        <Table className="h-4 w-4" />
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={onBlockquote} className="h-8 px-2" title="Citation">
        <Quote className="h-4 w-4" />
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={onMedia} className="h-8 px-2" title="Image/Vidéo">
        <ImageIcon className="h-4 w-4" />
      </Button>
      <div className="h-6 w-px bg-border mx-1" />
      <Button type="button" variant="ghost" size="sm" onClick={onTwitter} className="h-8 px-2" title="Twitter/X">
        <Twitter className="h-4 w-4" />
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={onInstagram} className="h-8 px-2" title="Instagram">
        <Instagram className="h-4 w-4" />
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={onTikTok} className="h-8 px-2" title="TikTok">
        <Youtube className="h-4 w-4" />
      </Button>
    </div>
  );
}

// URL input dialog for links and embeds
interface UrlDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  placeholder: string;
  onSubmit: (url: string) => void;
  error?: string;
}

function UrlInputDialog({ open, onOpenChange, title, placeholder, onSubmit, error }: UrlDialogProps) {
  const [url, setUrl] = useState("");

  const handleSubmit = () => {
    if (url.trim()) {
      onSubmit(url.trim());
      setUrl("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) setUrl(""); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>URL</Label>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={placeholder}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              autoFocus
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => { onOpenChange(false); setUrl(""); }}>Annuler</Button>
          <Button onClick={handleSubmit} disabled={!url.trim()}>Insérer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Table dialog
function TableDialog({ open, onOpenChange, onSubmit }: { open: boolean; onOpenChange: (v: boolean) => void; onSubmit: (rows: number, cols: number) => void }) {
  const [rows, setRows] = useState("3");
  const [cols, setCols] = useState("3");

  const handleSubmit = () => {
    const r = parseInt(rows);
    const c = parseInt(cols);
    if (!isNaN(r) && !isNaN(c) && r >= 1 && c >= 1) {
      onSubmit(r, c);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Insérer un tableau</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Lignes</Label>
            <Input type="number" min="1" value={rows} onChange={(e) => setRows(e.target.value)} />
          </div>
          <div>
            <Label>Colonnes</Label>
            <Input type="number" min="1" value={cols} onChange={(e) => setCols(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button onClick={handleSubmit}>Insérer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
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

  // Dialog states
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkError, setLinkError] = useState("");
  const [twitterDialogOpen, setTwitterDialogOpen] = useState(false);
  const [twitterError, setTwitterError] = useState("");
  const [instagramDialogOpen, setInstagramDialogOpen] = useState(false);
  const [instagramError, setInstagramError] = useState("");
  const [tiktokDialogOpen, setTiktokDialogOpen] = useState(false);
  const [tiktokError, setTiktokError] = useState("");
  const [tableDialogOpen, setTableDialogOpen] = useState(false);

  // Sync editor content with value prop
  useEffect(() => {
    if (editorRef.current && !isUpdatingRef.current) {
      const sanitized = DOMPurify.sanitize(value, {
        ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'img', 'video', 'iframe', 'blockquote', 'div', 'span', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'section'],
        ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'width', 'height', 'controls', 'class', 'target', 'rel', 'style', 'frameborder', 'allow', 'allowfullscreen', 'scrolling', 'allowtransparency', 'data-theme', 'cite', 'data-video-id']
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
      setTimeout(() => { isUpdatingRef.current = false; }, 0);
    }
  };

  const execCommand = (command: string, val: string | undefined = undefined) => {
    document.execCommand(command, false, val);
    editorRef.current?.focus();
    handleInput();
  };

  const escapeHtml = (text: string): string => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  };

  const validateUrl = (url: string): boolean => {
    try {
      const trimmed = url.trim();
      if (/^(javascript|data|vbscript|file):/i.test(trimmed)) return false;
      const parsed = new URL(trimmed);
      return ['http:', 'https:'].includes(parsed.protocol);
    } catch { return false; }
  };

  const validateSocialUrl = (url: string, allowedDomains: string[]): boolean => {
    if (!validateUrl(url)) return false;
    try {
      const parsed = new URL(url.trim());
      const hostname = parsed.hostname.toLowerCase();
      return allowedDomains.some(domain => hostname === domain || hostname.endsWith('.' + domain));
    } catch { return false; }
  };

  const handleInsertLink = (url: string) => {
    if (!validateUrl(url)) {
      setLinkError("URL invalide. Utilisez http:// ou https://");
      return;
    }
    setLinkError("");
    execCommand('createLink', escapeHtml(url));
  };

  const handleMediaUploadSuccess = (url: string, type: string) => {
    if (editorRef.current) {
      if (!validateUrl(url)) return;
      const escapedUrl = escapeHtml(url);
      let html = '';
      if (type === 'image') html = `<img src="${escapedUrl}" alt="Image" style="max-width: 100%; height: auto;" />`;
      else if (type === 'video') html = `<video controls src="${escapedUrl}" style="max-width: 100%;"></video>`;
      document.execCommand('insertHTML', false, html);
      handleInput();
    }
    setShowMediaUploader(false);
  };

  const handleInsertTable = (numRows: number, numCols: number) => {
    let tableHTML = '<table style="width: 100%; border-collapse: collapse; margin: 1rem 0;">';
    tableHTML += '<thead><tr>';
    for (let j = 0; j < numCols; j++) tableHTML += '<th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">En-tête ' + (j + 1) + '</th>';
    tableHTML += '</tr></thead><tbody>';
    for (let i = 1; i < numRows; i++) {
      tableHTML += '<tr>';
      for (let j = 0; j < numCols; j++) tableHTML += '<td style="border: 1px solid #ddd; padding: 8px;">Cellule ' + i + '-' + (j + 1) + '</td>';
      tableHTML += '</tr>';
    }
    tableHTML += '</tbody></table>';
    document.execCommand('insertHTML', false, tableHTML);
    handleInput();
  };

  const handleInsertTwitter = (url: string) => {
    if (!validateSocialUrl(url, ['twitter.com', 'x.com'])) {
      setTwitterError("URL Twitter/X invalide");
      return;
    }
    setTwitterError("");
    const escapedUrl = escapeHtml(url);
    const embedHTML = `<blockquote class="twitter-tweet" data-theme="dark"><a href="${escapedUrl}"></a></blockquote><script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>`;
    document.execCommand('insertHTML', false, embedHTML);
    handleInput();
  };

  const handleInsertInstagram = (url: string) => {
    if (!validateSocialUrl(url, ['instagram.com'])) {
      setInstagramError("URL Instagram invalide");
      return;
    }
    setInstagramError("");
    const embedUrl = url.endsWith('/') ? url + 'embed' : url + '/embed';
    const escapedEmbedUrl = escapeHtml(embedUrl);
    const embedHTML = `<iframe src="${escapedEmbedUrl}" width="100%" height="600" frameborder="0" scrolling="no" allowtransparency="true" style="max-width: 540px; margin: 1rem auto; display: block;"></iframe>`;
    document.execCommand('insertHTML', false, embedHTML);
    handleInput();
  };

  const handleInsertTikTok = (url: string) => {
    if (!validateSocialUrl(url, ['tiktok.com'])) {
      setTiktokError("URL TikTok invalide");
      return;
    }
    setTiktokError("");
    const escapedUrl = escapeHtml(url);
    const embedHTML = `<blockquote class="tiktok-embed" cite="${escapedUrl}" data-video-id="" style="max-width: 605px; min-width: 325px; margin: 1rem auto;"><section><a href="${escapedUrl}">Voir sur TikTok</a></section></blockquote><script async src="https://www.tiktok.com/embed.js"></script>`;
    document.execCommand('insertHTML', false, embedHTML);
    handleInput();
  };

  const insertBlockquote = () => {
    const selection = window.getSelection();
    if (selection && selection.toString()) {
      document.execCommand('insertHTML', false, `<blockquote><p>${selection.toString()}</p></blockquote>`);
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

  const toolbarProps: ToolbarProps = {
    onBold: () => execCommand('bold'),
    onItalic: () => execCommand('italic'),
    onLeftAlign: () => execCommand('justifyLeft'),
    onCenterAlign: () => execCommand('justifyCenter'),
    onRightAlign: () => execCommand('justifyRight'),
    onLink: () => { setLinkError(""); setLinkDialogOpen(true); },
    onUnorderedList: () => execCommand('insertUnorderedList'),
    onOrderedList: () => execCommand('insertOrderedList'),
    onTable: () => setTableDialogOpen(true),
    onBlockquote: insertBlockquote,
    onMedia: () => setShowMediaUploader(prev => !prev),
    onTwitter: () => { setTwitterError(""); setTwitterDialogOpen(true); },
    onInstagram: () => { setInstagramError(""); setInstagramDialogOpen(true); },
    onTikTok: () => { setTiktokError(""); setTiktokDialogOpen(true); },
  };

  const dialogs = (
    <>
      <UrlInputDialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen} title="Insérer un lien" placeholder="https://" onSubmit={handleInsertLink} error={linkError} />
      <UrlInputDialog open={twitterDialogOpen} onOpenChange={setTwitterDialogOpen} title="Embed Twitter/X" placeholder="https://twitter.com/..." onSubmit={handleInsertTwitter} error={twitterError} />
      <UrlInputDialog open={instagramDialogOpen} onOpenChange={setInstagramDialogOpen} title="Embed Instagram" placeholder="https://www.instagram.com/p/..." onSubmit={handleInsertInstagram} error={instagramError} />
      <UrlInputDialog open={tiktokDialogOpen} onOpenChange={setTiktokDialogOpen} title="Embed TikTok" placeholder="https://www.tiktok.com/@..." onSubmit={handleInsertTikTok} error={tiktokError} />
      <TableDialog open={tableDialogOpen} onOpenChange={setTableDialogOpen} onSubmit={handleInsertTable} />
    </>
  );

  const mediaUploader = showMediaUploader && (
    <div className="p-4 border rounded-md bg-muted/10">
      <MediaUploader 
        onSuccess={handleMediaUploadSuccess} 
        acceptTypes="image/*,video/*" 
        buttonText="Télécharger un média"
      />
    </div>
  );

  if (!showPreview) {
    return (
      <div className="space-y-2">
        <EditorToolbar {...toolbarProps} />
        {mediaUploader}
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          className="w-full p-3 border rounded-md bg-background prose dark:prose-invert max-w-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          style={{ minHeight }}
          suppressContentEditableWarning
        />
        {dialogs}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <EditorToolbar {...toolbarProps} />
      {mediaUploader}
      
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "edit" | "preview")} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="edit">Édition</TabsTrigger>
          <TabsTrigger value="preview">Prévisualisation</TabsTrigger>
        </TabsList>
        
        <div className="mt-2">
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
          
          {activeTab === "preview" && (
            <div 
              className="min-h-[300px] p-4 border rounded-md bg-background prose dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={renderPreview()}
            />
          )}
        </div>
      </Tabs>
      {dialogs}
    </div>
  );
}
