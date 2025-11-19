import { useState } from "react";
import { Search } from "lucide-react";

interface AnimatedSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function AnimatedSearchBar({ value, onChange, onSubmit }: AnimatedSearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
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
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
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
  );
}
