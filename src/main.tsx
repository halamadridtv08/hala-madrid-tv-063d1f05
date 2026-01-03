import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { injectAuthButtons } from './utils/navbarInjection';
import { initSentry } from './lib/sentry';

// Initialize Sentry error monitoring
initSentry();

createRoot(document.getElementById("root")!).render(<App />);

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
