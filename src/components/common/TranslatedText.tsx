import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import DOMPurify from 'dompurify';

interface TranslationCache {
  [key: string]: {
    [lang: string]: string;
  };
}

// Global cache to persist translations across component instances
const globalCache: TranslationCache = {};

interface TranslatedTextProps {
  text: string;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  html?: boolean;
}

export function TranslatedText({ text, as: Component = 'span', className, html = false }: TranslatedTextProps) {
  const { language } = useLanguage();
  const [translatedText, setTranslatedText] = useState(text);
  const [isLoading, setIsLoading] = useState(false);
  const originalTextRef = useRef(text);

  useEffect(() => {
    // Update original text reference if it changes
    if (text !== originalTextRef.current) {
      originalTextRef.current = text;
      setTranslatedText(text);
    }
  }, [text]);

  useEffect(() => {
    const translateText = async () => {
      // Don't translate if French (source language) or empty text
      if (language === 'fr' || !text || text.trim() === '') {
        setTranslatedText(text);
        return;
      }

      // Create cache key from first 100 chars
      const cacheKey = text.substring(0, 100);

      // Check cache first
      if (globalCache[cacheKey]?.[language]) {
        setTranslatedText(globalCache[cacheKey][language]);
        return;
      }

      setIsLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke('translate', {
          body: { text, targetLang: language, sourceLang: 'fr' }
        });

        if (error) {
          console.error('Translation error:', error);
          setTranslatedText(text);
          return;
        }

        const translated = data?.translatedText || text;

        // Cache the result
        if (!globalCache[cacheKey]) {
          globalCache[cacheKey] = {};
        }
        globalCache[cacheKey][language] = translated;

        setTranslatedText(translated);
      } catch (err) {
        console.error('Translation failed:', err);
        setTranslatedText(text);
      } finally {
        setIsLoading(false);
      }
    };

    translateText();
  }, [text, language]);

  if (html) {
    const sanitizedHtml = DOMPurify.sanitize(translatedText, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li', 'span', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
      ALLOWED_ATTR: ['href', 'target', 'rel', 'class']
    });
    return (
      <Component 
        className={`${className || ''} ${isLoading ? 'opacity-70' : ''}`}
        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      />
    );
  }

  return (
    <Component className={`${className || ''} ${isLoading ? 'opacity-70' : ''}`}>
      {translatedText}
    </Component>
  );
}

// Hook for programmatic translation
export function useAutoTranslate() {
  const { language } = useLanguage();
  const [isTranslating, setIsTranslating] = useState(false);

  const translate = async (text: string): Promise<string> => {
    if (language === 'fr' || !text || text.trim() === '') {
      return text;
    }

    const cacheKey = text.substring(0, 100);
    if (globalCache[cacheKey]?.[language]) {
      return globalCache[cacheKey][language];
    }

    setIsTranslating(true);
    try {
      const { data, error } = await supabase.functions.invoke('translate', {
        body: { text, targetLang: language, sourceLang: 'fr' }
      });

      if (error) {
        return text;
      }

      const translated = data?.translatedText || text;

      if (!globalCache[cacheKey]) {
        globalCache[cacheKey] = {};
      }
      globalCache[cacheKey][language] = translated;

      return translated;
    } catch {
      return text;
    } finally {
      setIsTranslating(false);
    }
  };

  return { translate, isTranslating, language };
}
