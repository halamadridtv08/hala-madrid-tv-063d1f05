import { useEffect, useState } from 'react';

export const MediaProtectionProvider = () => {
  const [devToolsDetected, setDevToolsDetected] = useState(false);

  useEffect(() => {
    // Block ALL right-click globally
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // Disable drag on media elements
    const handleDragStart = (e: DragEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'IMG' ||
        target.tagName === 'VIDEO' ||
        target.tagName === 'AUDIO'
      ) {
        e.preventDefault();
        return false;
      }
    };

    // Helper to check if target is an input field
    const isInputField = (target: HTMLElement): boolean => {
      return (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable ||
        target.closest('input') !== null ||
        target.closest('textarea') !== null ||
        target.closest('[contenteditable="true"]') !== null
      );
    };

    // Block keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      
      // Ctrl+U - View Source
      if ((e.ctrlKey || e.metaKey) && (e.key === 'u' || e.key === 'U')) {
        e.preventDefault();
        return false;
      }
      
      // Ctrl+S - Save page
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        return false;
      }
      
      // Ctrl+C - Copy (except in input fields)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'C')) {
        if (!isInputField(target)) {
          e.preventDefault();
          return false;
        }
      }
      
      // Ctrl+A - Select all (except in input fields)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'a' || e.key === 'A')) {
        if (!isInputField(target)) {
          e.preventDefault();
          return false;
        }
      }
      
      // Ctrl+Shift+I - DevTools
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'I' || e.key === 'i')) {
        e.preventDefault();
        return false;
      }
      
      // Ctrl+Shift+J - Console
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'J' || e.key === 'j')) {
        e.preventDefault();
        return false;
      }
      
      // Ctrl+Shift+C - Inspector
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'C' || e.key === 'c')) {
        e.preventDefault();
        return false;
      }
      
      // F12 - DevTools
      if (e.key === 'F12') {
        e.preventDefault();
        return false;
      }
    };

    // Block copy event (except in input fields)
    const handleCopy = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement;
      if (!isInputField(target)) {
        e.preventDefault();
        return false;
      }
    };

    // Block paste event (except in input fields)
    const handlePaste = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement;
      if (!isInputField(target)) {
        e.preventDefault();
        return false;
      }
    };

    // Block cut event (except in input fields)
    const handleCut = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement;
      if (!isInputField(target)) {
        e.preventDefault();
        return false;
      }
    };

    // DevTools detection via window size
    let devToolsOpen = false;
    const checkDevTools = () => {
      const threshold = 160;
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;
      
      if (widthThreshold || heightThreshold) {
        if (!devToolsOpen) {
          devToolsOpen = true;
          setDevToolsDetected(true);
        }
      } else {
        if (devToolsOpen) {
          devToolsOpen = false;
          setDevToolsDetected(false);
        }
      }
    };

    // Add global CSS to prevent selection
    const style = document.createElement('style');
    style.id = 'media-protection-styles';
    style.textContent = `
      body {
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
        -webkit-touch-callout: none !important;
      }
      input, textarea, [contenteditable="true"], .allow-select {
        -webkit-user-select: text !important;
        -moz-user-select: text !important;
        -ms-user-select: text !important;
        user-select: text !important;
      }
      img, video, audio {
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
        -webkit-touch-callout: none !important;
        pointer-events: auto;
      }
      img {
        -webkit-user-drag: none !important;
        -khtml-user-drag: none !important;
        -moz-user-drag: none !important;
        -o-user-drag: none !important;
        user-drag: none !important;
      }
    `;
    document.head.appendChild(style);

    // Add event listeners
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('dragstart', handleDragStart);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('paste', handlePaste);
    document.addEventListener('cut', handleCut);
    
    // Start DevTools detection
    const devToolsInterval = setInterval(checkDevTools, 500);
    window.addEventListener('resize', checkDevTools);
    checkDevTools();

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('dragstart', handleDragStart);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('cut', handleCut);
      window.removeEventListener('resize', checkDevTools);
      clearInterval(devToolsInterval);
      const existingStyle = document.getElementById('media-protection-styles');
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, []);

  // Show warning overlay when DevTools is detected
  if (devToolsDetected) {
    return (
      <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-background">
        <div className="text-center p-8 max-w-md">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Accès non autorisé
          </h1>
          <p className="text-muted-foreground mb-2">
            Les outils de développement ne sont pas autorisés sur ce site.
          </p>
          <p className="text-muted-foreground">
            Veuillez les fermer pour continuer.
          </p>
        </div>
      </div>
    );
  }

  return null;
};
