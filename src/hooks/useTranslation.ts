import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';

interface TranslationCache {
  [key: string]: {
    [lang: string]: string;
  };
}

const translationCache: TranslationCache = {};

export const useTranslation = () => {
  const { language } = useLanguage();
  const [isTranslating, setIsTranslating] = useState(false);

  const translate = useCallback(async (text: string, targetLang?: string): Promise<string> => {
    const target = targetLang || language;
    
    // Don't translate if target is French (source language)
    if (target === 'fr' || !text || text.trim() === '') {
      return text;
    }

    // Check cache first
    const cacheKey = text.substring(0, 100); // Use first 100 chars as key
    if (translationCache[cacheKey]?.[target]) {
      return translationCache[cacheKey][target];
    }

    try {
      setIsTranslating(true);
      
      const { data, error } = await supabase.functions.invoke('translate', {
        body: { text, targetLang: target, sourceLang: 'fr' }
      });

      if (error) {
        console.error('Translation error:', error);
        return text;
      }

      const translatedText = data?.translatedText || text;

      // Cache the result
      if (!translationCache[cacheKey]) {
        translationCache[cacheKey] = {};
      }
      translationCache[cacheKey][target] = translatedText;

      return translatedText;
    } catch (err) {
      console.error('Translation failed:', err);
      return text;
    } finally {
      setIsTranslating(false);
    }
  }, [language]);

  const translateBatch = useCallback(async (texts: string[], targetLang?: string): Promise<string[]> => {
    const target = targetLang || language;
    
    if (target === 'fr') {
      return texts;
    }

    const results = await Promise.all(texts.map(text => translate(text, target)));
    return results;
  }, [language, translate]);

  return {
    translate,
    translateBatch,
    isTranslating,
    currentLanguage: language
  };
};
