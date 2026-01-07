import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { injectAuthButtons } from './utils/navbarInjection';
import { initSentry } from './lib/sentry';

// Initialize Sentry error monitoring
initSentry();

createRoot(document.getElementById("root")!).render(<App />);

// PWA: Check for updates but don't auto-reload
if ('serviceWorker' in navigator) {
  // Only reload on controller change if the page was just loaded (not on window focus)
  let isInitialLoad = true;
  setTimeout(() => {
    isInitialLoad = false;
  }, 5000);

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    // Only reload if this is happening during initial page load
    if (isInitialLoad) {
      window.location.reload();
    }
  });

  // Check for updates immediately on page load
  navigator.serviceWorker.ready.then(registration => {
    registration.update();
  });
}

// Inject auth buttons when the app loads
document.addEventListener('DOMContentLoaded', () => {
  injectAuthButtons();
});

// Re-inject when theme changes or navigation occurs
window.addEventListener('popstate', () => {
  setTimeout(injectAuthButtons, 300);
});

// Listen for theme changes
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (
      mutation.type === 'attributes' &&
      mutation.attributeName === 'class' &&
      (mutation.target as Element).tagName === 'HTML'
    ) {
      setTimeout(injectAuthButtons, 300);
    }
  });
});

// Start observing
observer.observe(document.documentElement, { attributes: true });
