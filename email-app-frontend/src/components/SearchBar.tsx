'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MagnifyingGlassIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { useHotkeys } from 'react-hotkeys-hook';
import api from '@/lib/api';
import { SearchFilters } from '@/hooks/useInbox';

interface SearchBarProps {
    onSearch: (filters: SearchFilters) => void;
    className?: string;
}

export default function SearchBar({ onSearch, className = '' }: SearchBarProps) {
    const [query, setQuery] = useState('');
    const [isAIMode, setIsAIMode] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Ctrl+K shortcut to focus search
    useHotkeys('ctrl+k', (e) => {
        e.preventDefault();
        inputRef.current?.focus();
    });

    // Debounced search
    const debouncedSearch = useCallback(
        async (searchQuery: string) => {
            if (!searchQuery.trim()) {
                onSearch({});
                return;
            }

            if (isAIMode) {
                try {
                    setIsLoading(true);
                    const { data } = await api.post('/api/ai/search', { q: searchQuery });
                    onSearch(data.filters);
                } catch (err) {
                    console.error('AI search failed:', err);
                    // Fallback to regular search
                    onSearch({ subject: searchQuery, body: searchQuery });
                } finally {
                    setIsLoading(false);
                }
            } else {
                onSearch({ subject: searchQuery, body: searchQuery });
            }
        },
        [isAIMode, onSearch]
    );

    useEffect(() => {
        const timer = setTimeout(() => {
            debouncedSearch(query);
        }, 300);

        return () => clearTimeout(timer);
    }, [query, debouncedSearch]);

    return (
        <div className={`relative ${className}`}>
            <div className="relative flex items-center">
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search emails (Ctrl+K)"
                    className="w-full rounded-full bg-slate-800/50 px-4 py-2 pl-10 pr-20 text-sm text-slate-200 placeholder-slate-400 backdrop-blur-sm ring-1 ring-slate-700/50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <MagnifyingGlassIcon className="absolute left-3 h-5 w-5 text-slate-400" />
                
                <button
                    onClick={() => setIsAIMode(!isAIMode)}
                    className={`absolute right-2 flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium transition-colors ${
                        isAIMode
                            ? 'bg-indigo-500 text-white hover:bg-indigo-600'
                            : 'text-slate-400 hover:text-slate-300'
                    }`}
                    title={isAIMode ? 'AI Search Mode' : 'Regular Search Mode'}
                >
                    <SparklesIcon className="h-4 w-4" />
                    <span className="hidden sm:inline">AI</span>
                </button>
            </div>

            <AnimatePresence>
                {isLoading && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute left-0 right-0 top-full mt-2 rounded-lg bg-slate-800/90 p-2 text-center text-sm text-slate-300 backdrop-blur-sm"
                    >
                        Thinking...
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
} 