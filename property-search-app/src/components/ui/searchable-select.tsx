"use client";

import { cn } from "@/lib/utils";
import { useCallback, useEffect, useRef, useState } from "react";

export type SearchableSelectOption<T = string> = {
  value: T;
  label: string;
};

type SearchableSelectProps<T = string> = {
  options: SearchableSelectOption<T>[];
  value: T | null;
  onValueChange: (value: T | null) => void;
  placeholder?: string;
  emptyMessage?: string;
  className?: string;
  disabled?: boolean;
  getOptionLabel?: (option: SearchableSelectOption<T>) => string;
};

export function SearchableSelect<T = string>({
  options,
  value,
  onValueChange,
  placeholder = "Search and select...",
  emptyMessage = "No results found",
  className,
  disabled = false,
  getOptionLabel = (o) => o.label,
}: SearchableSelectProps<T>) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((o) => o.value === value);
  const displayLabel = selectedOption ? getOptionLabel(selectedOption) : "";

  const filtered = query.trim()
    ? options.filter((o) =>
        getOptionLabel(o).toLowerCase().includes(query.toLowerCase().trim())
      )
    : options;

  const handleSelect = useCallback(
    (option: SearchableSelectOption<T>) => {
      onValueChange(option.value);
      setQuery("");
      setOpen(false);
    },
    [onValueChange]
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setOpen(false);
      setQuery("");
    }
  };

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <div
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        className={cn(
          "flex min-h-8 w-full cursor-pointer items-center rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none transition-colors",
          "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
          "hover:border-input/80",
          disabled && "pointer-events-none opacity-50",
          open && "border-ring ring-3 ring-ring/50"
        )}
        onClick={() => {
          if (disabled) return;
          setOpen((o) => !o);
          if (!open) {
            setQuery("");
            setTimeout(() => inputRef.current?.focus(), 0);
          }
        }}
      >
        {open ? (
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="min-w-0 flex-1 border-0 bg-transparent p-0 text-sm outline-none placeholder:text-muted-foreground"
            aria-autocomplete="list"
            aria-controls="searchable-select-listbox"
          />
        ) : (
          <span className={cn("flex-1 truncate", !displayLabel && "text-muted-foreground")}>
            {displayLabel || placeholder}
          </span>
        )}
        <svg
          className={cn("ml-1 size-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {open && (
        <ul
          id="searchable-select-listbox"
          role="listbox"
          className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-input bg-popover py-1 shadow-md"
        >
          {filtered.length === 0 ? (
            <li className="px-3 py-2 text-sm text-muted-foreground">{emptyMessage}</li>
          ) : (
            filtered.map((option) => {
              const isSelected = option.value === value;
              return (
                <li
                  key={String(option.value)}
                  role="option"
                  aria-selected={isSelected}
                  className={cn(
                    "cursor-pointer px-3 py-2 text-sm",
                    isSelected && "bg-accent text-accent-foreground",
                    !isSelected && "hover:bg-muted"
                  )}
                  onClick={() => handleSelect(option)}
                >
                  {getOptionLabel(option)}
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
}
