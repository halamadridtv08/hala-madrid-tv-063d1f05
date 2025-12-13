import { useEffect } from 'react';

export const useMediaProtection = () => {
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
        target.closest('audio')
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
      // Ctrl+Shift+I (DevTools) - optional, can be annoying
      // if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'I') {
      //   e.preventDefault();
      //   return false;
      // }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('dragstart', handleDragStart);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('dragstart', handleDragStart);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
};
