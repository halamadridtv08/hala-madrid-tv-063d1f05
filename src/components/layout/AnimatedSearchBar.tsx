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
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
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

  // Charger l'historique de recherche depuis localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('searchHistory');
    if (savedHistory) {
      try {
        setSearchHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error("Erreur lors du chargement de l'historique:", error);
      }
    }
  }, []);

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
        // Afficher l'historique si pas de recherche
        if (value.trim().length === 0 && searchHistory.length > 0) {
          const historyItems: Suggestion[] = searchHistory.slice(0, 5).map((term, index) => ({
            id: `history-${index}`,
            name: term,
            type: "player" as const,
            subtitle: "Recherche récente",
            url: `/search?q=${encodeURIComponent(term)}`,
            score: 1,
          }));
          setSuggestions(historyItems);
        } else {
          setSuggestions([]);
        }
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
          if (score > 0.25) {
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
  }, [value, searchHistory]);

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
    setSelectedIndex(-1);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const saveToHistory = (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    
    const newHistory = [searchTerm, ...searchHistory.filter(term => term !== searchTerm)].slice(0, 10);
    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
  };

  const handleSuggestionClick = (url: string, searchTerm: string) => {
    setShowSuggestions(false);
    saveToHistory(searchTerm);
    onChange("");
    navigate(url);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          const selected = suggestions[selectedIndex];
          handleSuggestionClick(selected.url, selected.name);
        } else if (value.trim()) {
          saveToHistory(value.trim());
          navigate(`/search?q=${encodeURIComponent(value)}`);
          setShowSuggestions(false);
          onChange("");
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
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
          onChange={(e) => {
            onChange(e.target.value);
            setSelectedIndex(-1);
          }}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
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
              {suggestions.map((suggestion, index) => (
                <button
                  key={`${suggestion.type}-${suggestion.id}`}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSuggestionClick(suggestion.url, suggestion.name);
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full text-left px-4 py-3 transition-colors border-b border-border last:border-b-0 group ${
                    selectedIndex === index ? 'bg-accent' : 'hover:bg-accent'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium truncate transition-colors ${
                        selectedIndex === index ? 'text-primary' : 'text-foreground group-hover:text-primary'
                      }`}>
                        {suggestion.name}
                      </p>
                      {suggestion.subtitle && (
                        <p className="text-sm text-muted-foreground truncate">{suggestion.subtitle}</p>
                      )}
                    </div>
                     <div className="flex items-center gap-2 flex-shrink-0">
                      {suggestion.score && suggestion.score < 0.7 && suggestion.subtitle !== "Recherche récente" && (
                        <span className="text-xs text-muted-foreground italic">Suggestion</span>
                      )}
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                        {suggestion.subtitle === "Recherche récente" ? "Historique" : getTypeLabel(suggestion.type)}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
              {value.trim().length >= 2 && (
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSuggestionClick(`/search?q=${encodeURIComponent(value)}`, value);
                  }}
                  className="w-full px-4 py-3 text-center text-sm text-primary hover:bg-accent transition-colors font-medium"
                >
                  Voir tous les résultats pour "{value}"
                </button>
              )}
            </>
          ) : value.trim().length >= 2 ? (
            <div className="px-4 py-6 text-center text-muted-foreground">
              <p className="text-sm">Aucun résultat trouvé pour "{value}"</p>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSuggestionClick(`/search?q=${encodeURIComponent(value)}`, value);
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
