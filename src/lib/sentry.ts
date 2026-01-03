import * as Sentry from "@sentry/react";

// Initialize Sentry for error monitoring
export const initSentry = () => {
  // Only initialize in production
  if (import.meta.env.PROD) {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN || "",
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration({
          maskAllText: false,
          blockAllMedia: false,
        }),
      ],
      // Performance Monitoring
      tracesSampleRate: 0.1, // 10% of transactions
      // Session Replay
      replaysSessionSampleRate: 0.1, // 10% of sessions
      replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors
      // Environment
      environment: import.meta.env.MODE,
      // Release tracking
      release: `hala-madrid-tv@${import.meta.env.VITE_APP_VERSION || '1.0.0'}`,
      // Ignore specific errors
      ignoreErrors: [
        // Network errors
        "Failed to fetch",
        "NetworkError",
        "Load failed",
        // Browser extensions
        "ResizeObserver loop",
        // Third-party scripts
        "Script error",
      ],
      // Before sending event
      beforeSend(event, hint) {
        // Filter out non-critical errors in development
        if (import.meta.env.DEV) {
          return null;
        }
        return event;
      },
    });
  }
};

// Capture custom error
export const captureError = (error: Error, context?: Record<string, unknown>) => {
  if (import.meta.env.PROD) {
    Sentry.captureException(error, {
      extra: context,
    });
  } else {
    console.error("Sentry would capture:", error, context);
  }
};

// Set user context for error tracking
export const setUserContext = (user: { id: string; email?: string; username?: string } | null) => {
  if (import.meta.env.PROD) {
    if (user) {
      Sentry.setUser({
        id: user.id,
        email: user.email,
        username: user.username,
      });
    } else {
      Sentry.setUser(null);
    }
  }
};

// Add breadcrumb for user actions
export const addBreadcrumb = (
  category: string,
  message: string,
  level: "debug" | "info" | "warning" | "error" = "info"
) => {
  if (import.meta.env.PROD) {
    Sentry.addBreadcrumb({
      category,
      message,
      level,
    });
  }
};

export { Sentry };
