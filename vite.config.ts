import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";
import { writeFileSync, mkdirSync, readFileSync } from "fs";
import { resolve } from "path";

const SUPABASE_URL = "https://qjnppcfbywfazwolfppo.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqbnBwY2ZieXdmYXp3b2xmcHBvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYxNDA0MzksImV4cCI6MjA2MTcxNjQzOX0.1dPuqM42ASnYsfdBs4d2bLRgHxJQzmCSEW2dIUbcJOI";
const BASE_URL = "https://hala-madrid-tv.com";
const SITE_NAME = "HALA MADRID TV";
const DEFAULT_IMAGE = "https://storage.googleapis.com/gpt-engineer-file-uploads/XQxJnbbi65bFpQPLSgRozceUApi1/social-images/social-1759705280620-logo hala madrid tv.png";

const escapeHtml = (str: string) =>
  String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const stripHtml = (html: string) =>
  String(html).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

/**
 * Build-time prerender: generates dist/news/<slug>/index.html for every
 * published article with article-specific <title>, meta, OG, Twitter and
 * NewsArticle JSON-LD baked into the HTML. Crawlers (Google, LinkedIn,
 * Slack, Facebook) see the right tags without executing JS.
 */
function articleSEOPrerender() {
  return {
    name: "article-seo-prerender",
    apply: "build" as const,
    async closeBundle() {
      try {
        const distDir = resolve(__dirname, "dist");
        const templatePath = resolve(distDir, "index.html");
        let template: string;
        try {
          template = readFileSync(templatePath, "utf-8");
        } catch {
          console.warn("[article-seo-prerender] dist/index.html introuvable, skip");
          return;
        }

        console.log("[article-seo-prerender] Récupération des articles...");
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/articles?select=id,slug,title,description,image_url,category,published_at,updated_at,author_name,content&is_published=eq.true`,
          {
            headers: {
              apikey: SUPABASE_ANON_KEY,
              Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            },
          },
        );
        if (!res.ok) {
          console.warn(`[article-seo-prerender] HTTP ${res.status}, skip`);
          return;
        }
        const articles = (await res.json()) as any[];
        console.log(`[article-seo-prerender] ${articles.length} articles à prérendre`);

        let count = 0;
        for (const article of articles) {
          const slug = article.slug || article.id;
          if (!slug) continue;
          const url = `${BASE_URL}/news/${slug}`;
          const title = `${article.title} | ${SITE_NAME}`;
          const description = stripHtml(article.description || "").slice(0, 160);
          const image = article.image_url || DEFAULT_IMAGE;
          const body = stripHtml(article.content || "");
          const wordCount = body ? body.split(/\s+/).filter(Boolean).length : undefined;
          const keywords = [
            article.title,
            article.category,
            "Real Madrid",
            "Hala Madrid",
            "actualité Real Madrid",
            "football",
            "La Liga",
            "Champions League",
            "Merengues",
          ]
            .filter(Boolean)
            .join(", ");

          const articleJsonLd = {
            "@context": "https://schema.org",
            "@type": "NewsArticle",
            headline: article.title,
            description,
            image: { "@type": "ImageObject", url: image, width: 1200, height: 630 },
            url,
            datePublished: article.published_at,
            dateModified: article.updated_at || article.published_at,
            inLanguage: "fr-FR",
            isAccessibleForFree: true,
            keywords,
            articleSection: article.category,
            ...(wordCount ? { wordCount } : {}),
            ...(body ? { articleBody: body.slice(0, 5000) } : {}),
            author: { "@type": "Person", name: article.author_name || SITE_NAME },
            publisher: {
              "@type": "Organization",
              name: SITE_NAME,
              url: BASE_URL,
              logo: { "@type": "ImageObject", url: DEFAULT_IMAGE, width: 512, height: 512 },
            },
            mainEntityOfPage: { "@type": "WebPage", "@id": url },
          };

          const breadcrumbJsonLd = {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Accueil", item: BASE_URL },
              { "@type": "ListItem", position: 2, name: "Actualités", item: `${BASE_URL}/news` },
              { "@type": "ListItem", position: 3, name: article.title, item: url },
            ],
          };

          const seoBlock = `
    <title>${escapeHtml(title)}</title>
    <meta name="title" content="${escapeHtml(title)}" />
    <meta name="description" content="${escapeHtml(description)}" />
    <meta name="keywords" content="${escapeHtml(keywords)}" />
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
    <meta name="googlebot" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
    <link rel="canonical" href="${escapeHtml(url)}" />
    <meta property="og:type" content="article" />
    <meta property="og:url" content="${escapeHtml(url)}" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:image" content="${escapeHtml(image)}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${escapeHtml(article.title)}" />
    <meta property="og:site_name" content="${SITE_NAME}" />
    <meta property="og:locale" content="fr_FR" />
    <meta property="article:published_time" content="${escapeHtml(article.published_at || "")}" />
    <meta property="article:modified_time" content="${escapeHtml(article.updated_at || article.published_at || "")}" />
    <meta property="article:author" content="${escapeHtml(article.author_name || SITE_NAME)}" />
    <meta property="article:section" content="${escapeHtml(article.category || "")}" />
    <meta property="twitter:card" content="summary_large_image" />
    <meta property="twitter:url" content="${escapeHtml(url)}" />
    <meta property="twitter:title" content="${escapeHtml(title)}" />
    <meta property="twitter:description" content="${escapeHtml(description)}" />
    <meta property="twitter:image" content="${escapeHtml(image)}" />
    <meta property="twitter:site" content="@HalaMadrid360" />
    <script type="application/ld+json">${JSON.stringify(articleJsonLd)}</script>
    <script type="application/ld+json">${JSON.stringify(breadcrumbJsonLd)}</script>`;

          // Remove existing title + meta description + canonical + og + twitter + ld+json from template
          let html = template
            .replace(/<title>[^<]*<\/title>/i, "")
            .replace(/<meta\s+name=["'](?:title|description|keywords|robots|googlebot)["'][^>]*>/gi, "")
            .replace(/<link\s+rel=["']canonical["'][^>]*>/gi, "")
            .replace(/<meta\s+property=["'](?:og:[^"']+|twitter:[^"']+|article:[^"']+)["'][^>]*>/gi, "")
            .replace(/<meta\s+name=["']twitter:[^"']+["'][^>]*>/gi, "")
            .replace(/<script\s+type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi, "");

          html = html.replace(/<\/head>/i, `${seoBlock}\n  </head>`);

          const outDir = resolve(distDir, "news", slug);
          mkdirSync(outDir, { recursive: true });
          writeFileSync(resolve(outDir, "index.html"), html, "utf-8");
          count++;
        }
        console.log(`[article-seo-prerender] ✓ ${count} pages d'articles prérendues`);
      } catch (err) {
        console.error("[article-seo-prerender] Erreur:", err);
      }
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
    articleSEOPrerender(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'pwa-192x192.png', 'pwa-512x512.png'],
      manifest: {
        name: 'HALA MADRID TV',
        short_name: 'HalaMadrid',
        description: 'Toute l\'actualité du Real Madrid : matchs, joueurs, statistiques et transferts',
        theme_color: '#1a56db',
        background_color: '#0a0f1c',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        id: '/',
        categories: ['sports', 'news', 'entertainment'],
        lang: 'fr',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        screenshots: [
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            form_factor: 'wide',
            label: 'HALA MADRID TV'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5 MiB
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api/, /\.json$/, /^\/supabase/, /^\/~oauth/],
        runtimeCaching: [
          {
            // Force fresh JS/CSS bundles - always check network first
            urlPattern: /\.(?:js|css)$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'static-resources',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 // 24 hours
              },
              networkTimeoutSeconds: 3
            }
          },
          {
            urlPattern: /^https:\/\/qjnppcfbywfazwolfppo\.supabase\.co\/storage\/.*/i,
            handler: 'NetworkOnly',
          },
          {
            urlPattern: /^https:\/\/qjnppcfbywfazwolfppo\.supabase\.co\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 // 24 hours
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              }
            }
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
              }
            }
          }
        ]
      }
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-tabs'],
          charts: ['recharts'],
          motion: ['framer-motion']
        }
      }
    }
  }
}));
