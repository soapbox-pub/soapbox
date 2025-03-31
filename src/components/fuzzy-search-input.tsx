/* eslint-disable tailwindcss/no-custom-classname */
import FuzzySearch from 'fuzzy-search';
import React, { useState, useRef, useCallback, useEffect, useId } from 'react';

// (Keep the FuzzySearchInputProps interface and defaultSearch function as before)
interface FuzzySearchInputProps<T> {
  /** The array of objects or strings to search through. */
  data: T[];
  /** An array of keys within the objects in `data` to search against. Ignored if `data` is string[]. */
  keys: (keyof T)[];
  /** Callback function invoked when an item is selected from the suggestions. */
  onSelection: (selection: T | null) => void;
  /** Optional: The key to display in the suggestion list. Defaults to the first key in the `keys` prop or the item itself if data is string[]. */
  displayKey?: keyof T;
  /** Optional: Placeholder text for the input field. */
  placeholder?: string;
  /** Optional: Custom search function to override the default fuzzy search. */
  searchFn?: (data: T[], query: string, keys: (keyof T)[]) => T[];
  /** Optional: Custom class name for the main container div */
  className?: string;
  /** Optional: Custom class name for the input element */
  inputClassName?: string;
  /** Optional: Custom class name for the suggestions dropdown ul element */
  suggestionsClassName?: string;
  /** Optional: Custom class name for individual suggestion li elements */
  suggestionItemClassName?: string;
  /** Optional: Custom class name for the active suggestion li element */
  activeSuggestionItemClassName?: string;
  /** Optional: Base ID for accessibility attributes. A unique ID will be generated if not provided. */
  baseId?: string;
}

// Default fuzzy search implementation
const defaultSearch = <T,>(data: T[], query: string, keys: (keyof T)[]): T[] => {
  if (!query) {
    return [];
  }
  const searcher = new FuzzySearch(data as any[], keys as string[], {
    caseSensitive: false,
    sort: true,
  });
  return searcher.search(query);
};


function FuzzySearchInput<T extends Record<string, any> | string>({
  data,
  keys,
  onSelection,
  displayKey,
  placeholder = 'Search...',
  searchFn = defaultSearch,
  className = '',
  inputClassName = '',
  suggestionsClassName = '',
  suggestionItemClassName = '',
  activeSuggestionItemClassName = 'active',
  baseId, // Optional base ID from props
}: FuzzySearchInputProps<T>) {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<T[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  // Generate unique IDs for ARIA attributes if no baseId is provided
  const generatedId = useId();
  const componentBaseId = baseId ?? generatedId;
  const inputId = `${componentBaseId}-input`;
  const listboxId = `${componentBaseId}-listbox`;
  const getOptionId = (index: number) => `${componentBaseId}-option-${index}`;

  const getDisplayText = useCallback((item: T): string => {
    if (typeof item === 'string') {
      return item;
    }
    const key = displayKey ?? keys[0];
    return key ? String(item[key]) : 'Invalid displayKey';
  }, [displayKey, keys]);


  // --- Event Handlers ---

  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setInputValue(query);
    setActiveIndex(-1);

    if (query.trim()) {
      const results = searchFn(data, query, keys);
      setSuggestions(results);
      // Only show suggestions if there are results
      setShowSuggestions(results.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
      onSelection(null);
    }
  }, [searchFn, data, keys, onSelection]);

  const handleSelectSuggestion = useCallback((suggestion: T) => {
    setInputValue(getDisplayText(suggestion));
    setSuggestions([]);
    setShowSuggestions(false);
    setActiveIndex(-1);
    onSelection(suggestion);
    // Optionally focus the input again if needed, though blur might occur naturally
    // containerRef.current?.querySelector('input')?.focus();
  }, [getDisplayText, onSelection]);

  // This function now primarily handles keyboard navigation *within* the list
  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    const listIsVisible = showSuggestions && suggestions.length > 0;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (!listIsVisible) {
        // If list isn't visible but there's input, try searching/showing
        if (inputValue.trim()) {
          const results = searchFn(data, inputValue.trim(), keys);
          if (results.length > 0) {
            setSuggestions(results);
            setShowSuggestions(true);
            setActiveIndex(0); // Start at the first item
          }
        }
      } else {
        setActiveIndex((prevIndex) =>
          prevIndex >= suggestions.length - 1 ? 0 : prevIndex + 1,
        );
      }
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (!listIsVisible) return;
      setActiveIndex((prevIndex) =>
        prevIndex <= 0 ? suggestions.length - 1 : prevIndex - 1,
      );
    } else if (event.key === 'Enter') {
      if (!listIsVisible || activeIndex < 0) return;
      event.preventDefault();
      handleSelectSuggestion(suggestions[activeIndex]);
    } else if (event.key === 'Escape') {
      if (!listIsVisible) return;
      event.preventDefault();
      setShowSuggestions(false);
      setActiveIndex(-1);
      setSuggestions([]); // Clear suggestions on escape
    }
  }, [showSuggestions, suggestions, activeIndex, handleSelectSuggestion, inputValue, searchFn, data, keys]);

  const handleBlur = useCallback(() => {
    // Delay hiding to allow clicks on options
    setTimeout(() => {
      // Check if focus is still somehow within the container (e.g., clicked an option)
      // If focus moved outside, hide the list.
      if (containerRef.current && !containerRef.current.contains(document.activeElement)) {
        setShowSuggestions(false);
        // Don't reset activeIndex here, selection might have happened
      }
    }, 150);
  }, []);

  // --- Click Outside Detection ---
  // (Keep the useEffect for handleClickOutside as before)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        // Don't reset activeIndex here, allows inspection if needed
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // --- Rendering ---
  const listIsVisible = showSuggestions && suggestions.length > 0;

  return (
    <div
      ref={containerRef}
      className={`fuzzy-search-input-container ${className}`}
      style={{ position: 'relative' }}
    >
      <input
        id={inputId} // ID for input
        type='text'
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown} // Keyboard interactions handled here
        onBlur={handleBlur}
        placeholder={placeholder}
        autoComplete='off'
        className={`fuzzy-search-input ${inputClassName}`}
        style={{ width: '100%' }}
        // ARIA attributes for Combobox pattern
        role='combobox'
        aria-autocomplete='list'
        aria-controls={listIsVisible ? listboxId : undefined} // Control listbox only when visible
        aria-expanded={listIsVisible}
        aria-haspopup='listbox'
        aria-activedescendant={activeIndex > -1 ? getOptionId(activeIndex) : undefined} // Point to active option
      />
      {listIsVisible && (
        <ul
          id={listboxId} // ID for listbox
          role='listbox' // Role for the suggestions container
          className={`fuzzy-search-suggestions ${suggestionsClassName}`}
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            border: '1px solid #ccc',
            background: 'white',
            listStyle: 'none',
            margin: 0,
            padding: 0,
            maxHeight: '200px',
            overflowY: 'auto',
            zIndex: 1000,
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          }}
        // tabIndex={-1} // List itself shouldn't be directly tabbable usually
        >
          {suggestions.map((item, index) => {
            const displayText = getDisplayText(item);
            const isActive = index === activeIndex;
            const optionId = getOptionId(index);

            return (
              <li
                key={optionId} // Use unique generated ID as key
                id={optionId}  // ID for this option
                role='option'  // Role for each suggestion item
                aria-selected={isActive} // Indicate selection state for screen readers
                // onClick IS appropriate here for mouse users selecting an option
                onClick={() => handleSelectSuggestion(item)}
                // onMouseEnter helps sync visual hover with keyboard activeIndex for usability
                onMouseEnter={() => setActiveIndex(index)}
                className={`${suggestionItemClassName} ${isActive ? activeSuggestionItemClassName : ''}`}
                style={{
                  padding: '8px 12px',
                  cursor: 'pointer',
                  backgroundColor: isActive ? '#eee' : 'transparent',
                }}
              >
                {displayText}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default FuzzySearchInput;
