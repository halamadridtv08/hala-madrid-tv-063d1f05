import { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

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
}

export function AnimatedSearchBar({ value, onChange, onSubmit }: AnimatedSearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!value.trim() || value.length < 2) {
        setSuggestions([]);
        return;
      }

      const searchTerm = `%${value}%`;
      const results: Suggestion[] = [];

      try {
        // Rechercher les joueurs
        const { data: players } = await supabase
          .from("players")
          .select("id, name, position")
          .ilike("name", searchTerm)
          .eq("is_active", true)
          .limit(3);

        if (players) {
          results.push(
            ...players.map((p) => ({
              id: p.id,
              name: p.name,
              type: "player" as const,
              subtitle: p.position,
              url: `/players/${p.id}`,
            }))
          );
        }

        // Rechercher les articles
        const { data: articles } = await supabase
          .from("articles")
          .select("id, title, category")
          .or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`)
          .eq("is_published", true)
          .limit(3);

        if (articles) {
          results.push(
            ...articles.map((a) => ({
              id: a.id,
              name: a.title,
              type: "article" as const,
              subtitle: a.category,
              url: `/news/${a.id}`,
            }))
          );
        }

        // Rechercher les matchs
        const { data: matches } = await supabase
          .from("matches")
          .select("id, home_team, away_team, competition")
          .or(`home_team.ilike.${searchTerm},away_team.ilike.${searchTerm}`)
          .limit(2);

        if (matches) {
          results.push(
            ...matches.map((m) => ({
              id: m.id,
              name: `${m.home_team} vs ${m.away_team}`,
              type: "match" as const,
              subtitle: m.competition || undefined,
              url: "/matches",
            }))
          );
        }

        setSuggestions(results.slice(0, 8));
      } catch (error) {
        console.error("Erreur lors de la recherche:", error);
      }
    };

    const debounce = setTimeout(fetchSuggestions, 300);
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
    // Délai pour permettre le clic sur les suggestions
    setTimeout(() => setShowSuggestions(false), 200);
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
      {showSuggestions && suggestions.length > 0 && isFocused && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-50 animate-fade-in">
          {suggestions.map((suggestion) => (
            <Link
              key={`${suggestion.type}-${suggestion.id}`}
              to={suggestion.url}
              className="block px-4 py-3 hover:bg-accent transition-colors border-b border-border last:border-b-0"
              onClick={() => {
                setShowSuggestions(false);
                onChange("");
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{suggestion.name}</p>
                  {suggestion.subtitle && (
                    <p className="text-sm text-muted-foreground">{suggestion.subtitle}</p>
                  )}
                </div>
                <span className="ml-2 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                  {getTypeLabel(suggestion.type)}
                </span>
              </div>
            </Link>
          ))}
          <Link
            to={`/search?q=${encodeURIComponent(value)}`}
            className="block px-4 py-3 text-center text-sm text-primary hover:bg-accent transition-colors font-medium"
            onClick={() => {
              setShowSuggestions(false);
              onChange("");
            }}
          >
            Voir tous les résultats pour "{value}"
          </Link>
        </div>
      )}
    </div>
  );
}
