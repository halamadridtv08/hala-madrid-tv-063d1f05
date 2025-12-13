import { useEffect } from 'react';

export const MediaProtectionProvider = () => {
  useEffect(() => {
    // Disable right-click context menu on media elements
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'IMG' ||
        target.tagName === 'VIDEO' ||
        target.tagName === 'AUDIO' ||
        target.closest('img') ||
        target.closest('video') ||
        target.closest('audio') ||
        target.closest('[data-protected="true"]')
      ) {
        e.preventDefault();
        return false;
      }
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

    // Disable keyboard shortcuts for saving
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+S, Ctrl+Shift+S
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        return false;
      }
    };

    // Add global CSS to prevent selection on images
    const style = document.createElement('style');
    style.id = 'media-protection-styles';
    style.textContent = `
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

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('dragstart', handleDragStart);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('dragstart', handleDragStart);
      document.removeEventListener('keydown', handleKeyDown);
      const existingStyle = document.getElementById('media-protection-styles');
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, []);

  return null;
};
