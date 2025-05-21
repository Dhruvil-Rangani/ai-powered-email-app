'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusIcon, XMarkIcon, TagIcon } from '@heroicons/react/24/outline';
import TagChip from './TagChip';

interface TagPickerProps {
    messageId: string;
    existingTags: string[];
    onAddTag: (label: string) => void;
    className?: string;
}

export default function TagPicker({
    messageId,
    existingTags,
    onAddTag,
    className = '',
}: TagPickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [newTag, setNewTag] = useState('');
    const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Update suggested tags when input changes
    useEffect(() => {
        if (newTag.trim()) {
            // Filter out existing tags and find matches
            const suggestions = ['Important', 'Work', 'Personal', 'Follow-up', 'Urgent']
                .filter(tag => 
                    tag.toLowerCase().includes(newTag.toLowerCase()) && 
                    !existingTags.includes(tag)
                );
            setSuggestedTags(suggestions);
        } else {
            setSuggestedTags([]);
        }
    }, [newTag, existingTags]);

    // Close picker when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Focus input when opening
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    // Handle adding a new tag
    const handleAddTag = () => {
        const tag = newTag.trim();
        if (tag && !existingTags.includes(tag)) {
            onAddTag(tag);
            setNewTag('');
            setIsOpen(false);
        }
    };

    // Handle keyboard events
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddTag();
        } else if (e.key === 'Escape') {
            setIsOpen(false);
        }
    };

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            <button
                onClick={() => setIsOpen(true)}
                className="inline-flex items-center gap-1 rounded-md bg-slate-700/50 px-2 py-1 text-xs font-medium text-slate-300 hover:bg-slate-700 transition-colors cursor-pointer"
            >
                <TagIcon className="h-3 w-3" />
                <span className="hidden sm:inline">Add tag</span>
                <PlusIcon className="h-3 w-3" />
            </button>

            {/* Tag picker popover */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 top-full z-50 mt-1 w-72 rounded-lg bg-slate-800 p-3 shadow-lg ring-1 ring-slate-700/50"
                        style={{ transform: 'translateX(0)' }}
                    >
                        <div className="mb-2 flex items-center justify-between">
                            <h3 className="text-sm font-medium text-slate-200">Add tag</h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="rounded-full p-1 hover:bg-slate-700"
                            >
                                <XMarkIcon className="h-4 w-4 text-slate-400 cursor-pointer" />
                            </button>
                        </div>

                        {/* New tag input */}
                        <div className="flex gap-2">
                            <input
                                ref={inputRef}
                                type="text"
                                value={newTag}
                                onChange={(e) => setNewTag(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Type and press Enter"
                                className="flex-1 rounded-md bg-slate-700/50 px-2 py-1 text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                            <button
                                onClick={handleAddTag}
                                disabled={!newTag.trim()}
                                className="flex-shrink-0 rounded-md bg-indigo-500 px-3 py-1 text-sm font-medium text-white hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            >
                                Add
                            </button>
                        </div>

                        {/* Suggested tags */}
                        {suggestedTags.length > 0 && (
                            <div className="mt-2">
                                <h4 className="mb-1 text-xs font-medium text-slate-400">
                                    Suggested tags
                                </h4>
                                <div className="flex flex-wrap gap-1">
                                    {suggestedTags.map((tag) => (
                                        <TagChip
                                            key={tag}
                                            label={tag}
                                            onClick={() => {
                                                onAddTag(tag);
                                                setIsOpen(false);
                                            }}
                                            isClickable
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
} 