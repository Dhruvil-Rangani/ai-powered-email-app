'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import TagChip from './TagChip';

interface TagPickerProps {
    messageId: string;
    existingTags: string[];
    onAddTag: (label: string) => void;
    onRemoveTag: (label: string) => void;
    className?: string;
}

export default function TagPicker({
    messageId,
    existingTags,
    onAddTag,
    onRemoveTag,
    className = '',
}: TagPickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [newTag, setNewTag] = useState('');
    const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);

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

    // Handle adding a new tag
    const handleAddTag = () => {
        const tag = newTag.trim();
        if (tag && !existingTags.includes(tag)) {
            onAddTag(tag);
            setNewTag('');
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
            {/* Tag list */}
            <div className="flex flex-wrap gap-1">
                {existingTags.map((tag) => (
                    <TagChip
                        key={tag}
                        label={tag}
                        onRemove={() => onRemoveTag(tag)}
                        isRemovable
                    />
                ))}
                <button
                    onClick={() => setIsOpen(true)}
                    className="inline-flex items-center gap-1 rounded-full bg-slate-700/50 px-2 py-0.5 text-xs font-medium text-slate-300 hover:bg-slate-700"
                >
                    <PlusIcon className="h-3 w-3" />
                    Add tag
                </button>
            </div>

            {/* Tag picker popover */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute left-0 top-full z-50 mt-2 w-64 rounded-lg bg-slate-800 p-2 shadow-lg ring-1 ring-slate-700/50"
                    >
                        <div className="mb-2 flex items-center justify-between">
                            <h3 className="text-sm font-medium text-slate-200">Add tags</h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="rounded-full p-1 hover:bg-slate-700"
                            >
                                <XMarkIcon className="h-4 w-4 text-slate-400" />
                            </button>
                        </div>

                        {/* New tag input */}
                        <div className="mb-2 flex gap-1">
                            <input
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
                                className="rounded-md bg-indigo-500 px-2 py-1 text-sm font-medium text-white hover:bg-indigo-600 disabled:opacity-50"
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