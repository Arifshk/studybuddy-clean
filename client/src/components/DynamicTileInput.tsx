import { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface DynamicTileInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  suggestions: string[];
  placeholder: string;
  className?: string;
  maxItems?: number;
  onInputChange?: (input: string) => void;
}

export function DynamicTileInput({
  value,
  onChange,
  suggestions,
  placeholder,
  className,
  maxItems = 5,
  onInputChange
}: DynamicTileInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputValue.trim()) {
      const filtered = suggestions.filter(
        (suggestion) =>
          suggestion.toLowerCase().includes(inputValue.toLowerCase()) &&
          !(Array.isArray(value) ? value : []).includes(suggestion)
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setFilteredSuggestions([]);
      setShowSuggestions(false);
    }
  }, [inputValue, suggestions, value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onInputChange?.(newValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      if (inputValue.trim() && value.length < maxItems) {
        addTile(inputValue.trim());
      }
    } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
      // Remove the last tile if backspace is pressed and input is empty
      removeTile(value[value.length - 1]);
    }
  };

  const addTile = (tile: string) => {
    const currentValue = Array.isArray(value) ? value : [];
    if (!currentValue.includes(tile) && currentValue.length < maxItems) {
      onChange([...currentValue, tile]);
      setInputValue("");
      setShowSuggestions(false);
    }
  };

  const removeTile = (tileToRemove: string) => {
    const currentValue = Array.isArray(value) ? value : [];
    onChange(currentValue.filter(tile => tile !== tileToRemove));
  };

  const handleSuggestionClick = (suggestion: string) => {
    addTile(suggestion);
    inputRef.current?.focus();
  };

  return (
    <div className={`relative ${className}`}>
      {/* Container for tiles and input */}
      <div className="min-h-[40px] border border-input rounded-md p-2 flex flex-wrap gap-2 items-center bg-background focus-within:ring-1 focus-within:ring-ring">
        {/* Render existing tiles */}
        {(Array.isArray(value) ? value : []).map((tile, index) => (
          <Badge
            key={index}
            variant="secondary"
            className="bg-primary text-primary-foreground hover:bg-primary/80 cursor-default"
          >
            {tile}
            <button
              type="button"
              onClick={() => removeTile(tile)}
              className="ml-1 hover:bg-primary/20 rounded-full p-0.5 transition-colors"
              data-testid={`remove-tile-${tile}`}
            >
              <X size={12} />
            </button>
          </Badge>
        ))}
        
        {/* Input field */}
        {(Array.isArray(value) ? value : []).length < maxItems && (
          <Input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => inputValue && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder={(Array.isArray(value) ? value : []).length === 0 ? placeholder : ""}
            className="border-none shadow-none p-0 h-auto bg-transparent focus-visible:ring-0 flex-1 min-w-[120px]"
            data-testid="tile-input"
          />
        )}
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 bg-background border border-input rounded-md shadow-md mt-1 max-h-48 overflow-y-auto">
          {filteredSuggestions.slice(0, 8).map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full px-3 py-2 text-left hover:bg-muted transition-colors text-sm"
              data-testid={`suggestion-${suggestion}`}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}