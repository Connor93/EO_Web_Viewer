/**
 * SearchBar component - global search for items and NPCs
 */
import { useState, useCallback } from 'react';
import './SearchBar.css';

interface SearchBarProps {
    onSearch: (query: string) => void;
    placeholder?: string;
}

export function SearchBar({ onSearch, placeholder = 'Search items and NPCs...' }: SearchBarProps) {
    const [value, setValue] = useState('');

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setValue(newValue);
        onSearch(newValue);
    }, [onSearch]);

    const handleClear = useCallback(() => {
        setValue('');
        onSearch('');
    }, [onSearch]);

    return (
        <div className="search-bar">
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
                type="text"
                value={value}
                onChange={handleChange}
                placeholder={placeholder}
                className="search-input"
            />
            {value && (
                <button onClick={handleClear} className="clear-button" aria-label="Clear search">
                    ×
                </button>
            )}
        </div>
    );
}
