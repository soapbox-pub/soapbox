import FuzzySearch from 'fuzzy-search';
import React, { useState, useRef, useCallback, useEffect, useId } from 'react';

import Input from 'soapbox/components/ui/input.tsx';

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
  /**
   * Optional: Custom search function to override the default fuzzy search. */
  searchFn?: SearchImpl;
  /** Optional: Custom class name for the main container div */
  className?: string;
  baseId?: string;
  /** Component to use to optionally override suggestion rendering. */
  renderSuggestion?: React.ComponentType<{ item: T }>;
}

interface SearchImpl {
  /**
   * @param data The data to search through. Should be an array of Records
   * @param query The query to search for.
   * @param keys The keys in the record to search through
   * @returns A list of search results.
   */
  <T extends Record<string, any> | string>(data: T[], query: string, keys: (keyof T)[]): T[];
}

const defaultSearch: SearchImpl = (data, query, keys) => {
  const searcher = new FuzzySearch(data as any[], keys as string[], {
    caseSensitive: false,
    sort: true,
  });
  return query ? searcher.search(query) : data;
};

function FuzzySearchInput<T extends Record<string, any> | string>({
  data,
  keys,
  onSelection,
  displayKey,
  placeholder = 'Search...',
  searchFn = defaultSearch,
  className = '',
  baseId,
  renderSuggestion: FuzzySearchSuggestion,
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

  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setInputValue(query);
    setActiveIndex(-1);

    const results = searchFn(data, query, keys);
    setSuggestions(results);
    setShowSuggestions(results.length > 0 || query.trim() === '');
  }, [searchFn, data, keys]);

  const handleSelectSuggestion = useCallback((suggestion: T) => {
    setInputValue(getDisplayText(suggestion));
    setSuggestions([]);
    setShowSuggestions(false);
    setActiveIndex(-1);
    onSelection(suggestion);
    // Optionally focus the input again if needed, though blur might occur naturally
    // containerRef.current?.querySelector('input')?.focus();
  }, [getDisplayText, onSelection]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    const listIsVisible = showSuggestions && suggestions.length > 0;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (!listIsVisible && inputValue.trim()) {
        // If list isn't visible but there's input, try searching/showing
        const results = searchFn(data, inputValue.trim(), keys);
        if (results.length > 0) {
          setSuggestions(results);
          setShowSuggestions(true);
          setActiveIndex(0); // Start at the first item
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

  const handleFocus = useCallback(() => {
    if (inputValue.trim() === '') {
      const results = searchFn(data, '', keys);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
    }
  }, [inputValue, searchFn, data, keys]);

  const handleBlur = useCallback(() => {

    // Delay hiding to allow clicking on options
    setTimeout(() => {
      // Check if focus is still somehow within the container (e.g., clicked an option)
      // If focus moved outside, hide the list.
      if (containerRef.current && !containerRef.current.contains(document.activeElement)) {
        setShowSuggestions(false);
        // Don't reset activeIndex here, selection might have happened
      }
    }, 150);
  }, []);

  // Check if user clicked outside
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

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <Input
        id={inputId}
        type='text'
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        autoComplete='off'
        aria-autocomplete='list'
        aria-controls={showSuggestions && suggestions.length > 0 ? listboxId : undefined}
        aria-expanded={showSuggestions && suggestions.length > 0}
        aria-haspopup='listbox'
        aria-activedescendant={activeIndex > -1 ? getOptionId(activeIndex) : undefined}
      />
      {showSuggestions && suggestions.length > 0 && (
        <ul
          id={listboxId}
          role='listbox'
          className='absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-md border border-gray-300 bg-white shadow-lg dark:border-gray-600 dark:bg-gray-800'
        >
          {suggestions.map((item, index) => {
            const isActive = index === activeIndex;
            const optionId = getOptionId(index);

            return (
              <li
                key={optionId} // Use unique generated ID as key
                id={optionId} // ID for this option
                role='option' // Role for each suggestion item
                aria-selected={isActive}
                onClick={() => handleSelectSuggestion(item)}
                // onMouseEnter helps sync visual hover with keyboard activeIndex for usability
                onMouseEnter={() => setActiveIndex(index)}
                className={`cursor-pointer p-2 ${isActive ? 'bg-gray-100 dark:bg-gray-700' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              >
                {FuzzySearchSuggestion ? <FuzzySearchSuggestion item={item} /> : getDisplayText(item)}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default FuzzySearchInput;
