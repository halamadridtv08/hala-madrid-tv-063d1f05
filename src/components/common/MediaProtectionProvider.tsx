import { useEffect, useState } from "react";
import { useSiteVisibility } from "@/hooks/useSiteVisibility";

export const MediaProtectionProvider = () => {
  const [devToolsDetected, setDevToolsDetected] = useState(false);
  const { isVisible, loading } = useSiteVisibility();
  
  // Check if main protection is enabled
  const protectionEnabled = isVisible('devtools_protection');
  
  // Granular protection options
  const rightClickEnabled = isVisible('protection_right_click');
  const copyEnabled = isVisible('protection_copy');
  const keyboardEnabled = isVisible('protection_keyboard');

  useEffect(() => {
    // Don't run protection if all disabled or still loading
    if (loading || !protectionEnabled) {
      return;
    }

    // Prevent right-click on the entire page
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // Prevent dragging of media elements
    const handleDragStart = (e: DragEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'IMG' || target.tagName === 'VIDEO' || target.tagName === 'AUDIO') {
        e.preventDefault();
        return false;
      }
    };

    // Helper function to check if element is an input field
    const isInputField = (element: HTMLElement): boolean => {
      return element.tagName === 'INPUT' || 
             element.tagName === 'TEXTAREA' || 
             element.isContentEditable ||
             element.closest('[contenteditable="true"]') !== null;
    };

    // Block various keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = isInputField(target);
      
      // Ctrl+U - View Source
      if ((e.ctrlKey || e.metaKey) && (e.key === 'u' || e.key === 'U')) {
        e.preventDefault();
        return false;
      }
      
      // Ctrl+S - Save
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        return false;
      }
      
      // Ctrl+C - Copy (except in input fields)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'C') && !isInput) {
        e.preventDefault();
        return false;
      }
      
      // Ctrl+A - Select All (except in input fields)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'a' || e.key === 'A') && !isInput) {
        e.preventDefault();
        return false;
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

    // DevTools detection using window size difference
    const checkDevTools = () => {
      const threshold = 160;
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;
      
      if (widthThreshold || heightThreshold) {
        setDevToolsDetected(true);
      } else {
        setDevToolsDetected(false);
      }
    };

    // Add event listeners based on granular settings
    if (rightClickEnabled) {
      document.addEventListener('contextmenu', handleContextMenu);
      document.addEventListener('dragstart', handleDragStart);
    }
    
    if (keyboardEnabled) {
      document.addEventListener('keydown', handleKeyDown);
    }
    
    if (copyEnabled) {
      document.addEventListener('copy', handleCopy);
      document.addEventListener('paste', handlePaste);
      document.addEventListener('cut', handleCut);
    }
    
    // Check DevTools periodically (always when main protection is on)
    const devToolsInterval = setInterval(checkDevTools, 500);
    window.addEventListener('resize', checkDevTools);
    checkDevTools(); // Initial check

    // Add CSS to prevent text selection
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
      
      input, 
      textarea, 
      [contenteditable="true"],
      .allow-select {
        -webkit-user-select: text !important;
        -moz-user-select: text !important;
        -ms-user-select: text !important;
        user-select: text !important;
      }
      
      img, video, audio {
        -webkit-user-drag: none !important;
        user-drag: none !important;
        pointer-events: auto;
      }
    `;
    document.head.appendChild(style);

    // Cleanup
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
  }, [loading, protectionEnabled, rightClickEnabled, copyEnabled, keyboardEnabled]);

  // Show blocking overlay when DevTools detected and protection is enabled
  if (protectionEnabled && devToolsDetected) {
    return (
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'hsl(var(--background))',
          color: 'hsl(var(--foreground))',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 999999,
          fontFamily: 'system-ui, sans-serif',
          textAlign: 'center',
          padding: '20px'
        }}
      >
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'hsl(var(--destructive))' }}>
            Accès non autorisé
          </h1>
          <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
            Les outils de développement ne sont pas autorisés sur ce site.
          </p>
          <p style={{ fontSize: '1rem', opacity: 0.7 }}>
            Veuillez les fermer pour continuer.
          </p>
        </div>
      </div>
    );
  }

  return null;
};
