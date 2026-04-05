"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Search, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MAX_SUGGESTIONS_EMPTY = 12;
const MAX_SUGGESTIONS_FILTERED = 50;

export interface SearchBarProps {
  onSearch: (locality: string) => void;
  className?: string;
  /** Distinct localities from DB (sorted). */
  suggestions: string[];
  /** Synced when URL `locality` changes (server navigation). */
  defaultValue?: string;
}

const SearchBar = ({
  onSearch,
  className = "",
  suggestions,
  defaultValue = "",
}: SearchBarProps) => {
  const [query, setQuery] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(defaultValue);
  }, [defaultValue]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return suggestions.slice(0, MAX_SUGGESTIONS_EMPTY);
    }
    return suggestions
      .filter((s) => s.toLowerCase().includes(q))
      .slice(0, MAX_SUGGESTIONS_FILTERED);
  }, [query, suggestions]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setHighlighted(-1);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const commit = useCallback(
    (value: string) => {
      const v = value.trim();
      setQuery(v);
      setOpen(false);
      setHighlighted(-1);
      onSearch(v);
    },
    [onSearch]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (open && highlighted >= 0 && filtered[highlighted]) {
      commit(filtered[highlighted]);
      return;
    }
    commit(query);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp") && filtered.length > 0) {
      setOpen(true);
      setHighlighted(e.key === "ArrowDown" ? 0 : filtered.length - 1);
      e.preventDefault();
      return;
    }
    if (!open) return;

    if (e.key === "Escape") {
      setOpen(false);
      setHighlighted(-1);
      e.preventDefault();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((i) => (i < filtered.length - 1 ? i + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((i) => (i > 0 ? i - 1 : filtered.length - 1));
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("flex items-center gap-2", className)}
    >
      <div ref={rootRef} className="relative flex-1">
        <MapPin className="absolute left-3 top-1/2 z-10 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setHighlighted(-1);
          }}
          onFocus={() => {
            if (filtered.length > 0) setOpen(true);
          }}
          onKeyDown={onKeyDown}
          placeholder="Search by area / locality…"
          autoComplete="off"
          role="combobox"
          aria-expanded={open}
          aria-controls="locality-suggestions"
          aria-autocomplete="list"
          className="pl-10 h-12 bg-card border-border text-card-foreground placeholder:text-muted-foreground rounded-lg"
        />
        {open && filtered.length > 0 ? (
          <ul
            id="locality-suggestions"
            role="listbox"
            className="absolute left-0 right-0 top-full z-50 mt-1 max-h-56 overflow-auto rounded-lg border border-border bg-card py-1 shadow-lg"
          >
            {filtered.map((s, i) => (
              <li key={s} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={i === highlighted}
                  className={cn(
                    "w-full px-3 py-2 text-left text-sm text-card-foreground hover:bg-muted",
                    i === highlighted && "bg-muted"
                  )}
                  onMouseEnter={() => setHighlighted(i)}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => commit(s)}
                >
                  {s}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      <Button
        type="submit"
        className="h-12 px-6 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg font-medium"
      >
        <Search className="h-4 w-4 mr-2" />
        Search
      </Button>
    </form>
  );
};

export default SearchBar;
