import { useState, useEffect, useRef, useMemo } from "react";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface AnimatedSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

interface Suggestion {
  id: string;
  name: string;
  type: "player" | "article" | "match";
  subtitle?: string;
  url: string;
  score?: number;
}

// Normalisation des chaînes pour ignorer les accents et la casse
const normalizeString = (str: string): string => {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, "");
};

// Distance de Levenshtein optimisée
const levenshteinDistance = (str1: string, str2: string): number => {
  const len1 = str1.length;
  const len2 = str2.length;
  
  if (len1 === 0) return len2;
  if (len2 === 0) return len1;
  
  const matrix: number[][] = Array(len1 + 1)
    .fill(null)
    .map(() => Array(len2 + 1).fill(0));
  
  for (let i = 0; i <= len1; i++) matrix[i][0] = i;
  for (let j = 0; j <= len2; j++) matrix[0][j] = j;
  
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  
  return matrix[len1][len2];
};

// Calcul du score de similarité (0-1, plus élevé = plus similaire)
const calculateSimilarity = (search: string, target: string): number => {
  const normalizedSearch = normalizeString(search);
  const normalizedTarget = normalizeString(target);
  
  // Correspondance exacte
  if (normalizedTarget === normalizedSearch) return 1.0;
  
  // Commence par
  if (normalizedTarget.startsWith(normalizedSearch)) return 0.9;
  
  // Contient
  if (normalizedTarget.includes(normalizedSearch)) return 0.8;
  
  // Distance de Levenshtein
  const distance = levenshteinDistance(normalizedSearch, normalizedTarget);
  const maxLength = Math.max(normalizedSearch.length, normalizedTarget.length);
  const similarity = 1 - distance / maxLength;
  
  // Bonus pour les mots qui commencent pareil
  const searchWords = normalizedSearch.split(/\s+/);
  const targetWords = normalizedTarget.split(/\s+/);
  let wordMatchBonus = 0;
  
  for (const searchWord of searchWords) {
    for (const targetWord of targetWords) {
      if (targetWord.startsWith(searchWord) && searchWord.length >= 3) {
        wordMatchBonus += 0.1;
      }
    }
  }
  
  return Math.min(1.0, similarity + wordMatchBonus);
};

export function AnimatedSearchBar({ value, onChange, onSubmit }: AnimatedSearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const navigate = useNavigate();

  // Cache pour toutes les données
  const allDataCache = useRef<{
    players: any[];
    articles: any[];
    matches: any[];
    loaded: boolean;
  }>({ players: [], articles: [], matches: [], loaded: false });

  // Charger toutes les données une seule fois au montage
  useEffect(() => {
    const loadAllData = async () => {
      try {
        const [playersResponse, articlesResponse, matchesResponse] = await Promise.all([
          supabase
            .from("players")
            .select("id, name, position, image_url")
            .eq("is_active", true),
          supabase
            .from("articles")
            .select("id, title, category")
            .eq("is_published", true),
          supabase
            .from("matches")
            .select("id, home_team, away_team, competition")
        ]);

        allDataCache.current = {
          players: playersResponse.data || [],
          articles: articlesResponse.data || [],
          matches: matchesResponse.data || [],
          loaded: true
        };
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
      }
    };

    loadAllData();
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!value.trim() || value.length < 2) {
        setSuggestions([]);
        setIsLoading(false);
        return;
      }

      // Attendre que les données soient chargées
      if (!allDataCache.current.loaded) {
        setIsLoading(true);
        return;
      }

      setIsLoading(true);

      try {

        const allResults: Suggestion[] = [];

        // Traiter les joueurs avec score de similarité
        allDataCache.current.players.forEach((p) => {
          const score = calculateSimilarity(value, p.name);
          if (score > 0.25) { // Seuil réduit pour plus de tolérance
            allResults.push({
              id: p.id,
              name: p.name,
              type: "player",
              subtitle: p.position,
              url: `/players/${p.id}`,
              score,
            });
          }
        });

        // Traiter les articles
        allDataCache.current.articles.forEach((a) => {
          const score = calculateSimilarity(value, a.title);
          if (score > 0.25) {
            allResults.push({
              id: a.id,
              name: a.title,
              type: "article",
              subtitle: a.category,
              url: `/news/${a.id}`,
              score,
            });
          }
        });

        // Traiter les matchs
        allDataCache.current.matches.forEach((m) => {
          const matchName = `${m.home_team} vs ${m.away_team}`;
          const homeScore = calculateSimilarity(value, m.home_team);
          const awayScore = calculateSimilarity(value, m.away_team);
          const score = Math.max(homeScore, awayScore);
          
          if (score > 0.25) {
            allResults.push({
              id: m.id,
              name: matchName,
              type: "match",
              subtitle: m.competition || undefined,
              url: "/matches",
              score,
            });
          }
        });

        // Trier par score et prendre les 8 meilleurs
        const sortedResults = allResults
          .sort((a, b) => (b.score || 0) - (a.score || 0))
          .slice(0, 8);

        setSuggestions(sortedResults);
      } catch (error: any) {
        console.error("Erreur lors de la recherche:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(fetchSuggestions, 150);
    return () => clearTimeout(debounce);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFocus = () => {
    setIsFocused(true);
    setShowSuggestions(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const handleSuggestionClick = (url: string) => {
    setShowSuggestions(false);
    onChange("");
    navigate(url);
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "player":
        return "Joueur";
      case "article":
        return "Article";
      case "match":
        return "Match";
      default:
        return "";
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <form onSubmit={onSubmit} className="relative flex items-center justify-center w-full">
        <div className="relative flex items-center justify-center">
        {/* Gradient border effects */}
        <div className="absolute inset-[-1px] rounded-full pointer-events-none transition-all duration-800 bg-gradient-to-tr from-[hsl(var(--muted-foreground)/0.13)] via-transparent to-[hsl(var(--muted-foreground)/0.35)]" />
        
        <div className="absolute inset-[-2px] rounded-full pointer-events-none transition-all duration-800 blur-[10px] bg-gradient-to-tr from-[hsl(var(--primary))] via-transparent to-[hsl(var(--secondary))]" />
        
        <div className="absolute inset-[-1px] rounded-full pointer-events-none transition-all duration-800 bg-gradient-to-tr from-[hsl(var(--primary))] via-transparent to-[hsl(var(--secondary))] -z-10" />

        {/* Background span */}
        <span className="absolute inset-0 bg-background rounded-full pointer-events-none" />

        {/* Input */}
        <input
          type="text"
          placeholder="Rechercher..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={`
            relative z-10 h-[50px] rounded-full border-none px-5 
            font-normal text-base
            bg-gradient-to-b from-[hsl(var(--card))] via-[hsl(var(--background))] to-[hsl(var(--background))]
            text-foreground
            placeholder:text-muted-foreground
            focus:outline-none
            transition-all duration-800 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]
            ${isFocused ? 'w-[300px]' : 'w-[50px]'}
            ${isFocused ? 'text-foreground' : 'text-transparent'}
          `}
        />

        {/* Search icon */}
        <button
          type="submit"
          className="absolute right-0 w-[50px] h-[50px] p-[15px] rounded-full pointer-events-auto transition-all duration-800"
          aria-label="Rechercher"
        >
          <Search className="w-full h-full text-muted-foreground" />
        </button>
        </div>
      </form>

      {/* Suggestions dropdown */}
      {showSuggestions && isFocused && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-50 animate-fade-in max-h-[400px] overflow-y-auto">
          {isLoading ? (
            <div className="px-4 py-6 text-center text-muted-foreground">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <p className="mt-2 text-sm">Recherche en cours...</p>
            </div>
          ) : suggestions.length > 0 ? (
            <>
              {suggestions.map((suggestion) => (
                <button
                  key={`${suggestion.type}-${suggestion.id}`}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSuggestionClick(suggestion.url);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-accent transition-colors border-b border-border last:border-b-0 group"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
                        {suggestion.name}
                      </p>
                      {suggestion.subtitle && (
                        <p className="text-sm text-muted-foreground truncate">{suggestion.subtitle}</p>
                      )}
                    </div>
                     <div className="flex items-center gap-2 flex-shrink-0">
                      {suggestion.score && suggestion.score < 0.7 && (
                        <span className="text-xs text-muted-foreground italic">Suggestion</span>
                      )}
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                        {getTypeLabel(suggestion.type)}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSuggestionClick(`/search?q=${encodeURIComponent(value)}`);
                }}
                className="w-full px-4 py-3 text-center text-sm text-primary hover:bg-accent transition-colors font-medium"
              >
                Voir tous les résultats pour "{value}"
              </button>
            </>
          ) : value.trim().length >= 2 ? (
            <div className="px-4 py-6 text-center text-muted-foreground">
              <p className="text-sm">Aucun résultat trouvé pour "{value}"</p>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSuggestionClick(`/search?q=${encodeURIComponent(value)}`);
                }}
                className="mt-2 text-sm text-primary hover:underline"
              >
                Rechercher quand même
              </button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
