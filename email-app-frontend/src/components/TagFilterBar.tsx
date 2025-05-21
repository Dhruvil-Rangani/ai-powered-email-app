'use client';
import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';
import TagChip from './TagChip';
import { EmailThread, EmailMessage } from '@/types/email';

interface TagFilterBarProps {
    threads: EmailThread[];
    selectedTag: string | null;
    onSelectTag: (tag: string | null) => void;
    className?: string;
}

export default function TagFilterBar({
    threads,
    selectedTag,
    onSelectTag,
    className = '',
}: TagFilterBarProps) {
    // Get unique tags from all threads
    const uniqueTags = useMemo(() => {
        const tagSet = new Set<string>();
        threads.forEach(thread => {
            thread.messages.forEach((message: EmailMessage) => {
                (message.tags || []).forEach((tag: string) => tagSet.add(tag));
            });
        });
        return Array.from(tagSet).sort();
    }, [threads]);

    if (uniqueTags.length === 0) return null;

    return (
        <div className={`flex flex-wrap items-center gap-2 ${className}`}>
            <span className="text-sm font-medium text-slate-400">Filter by tag:</span>
            
            {/* Clear filter button */}
            {selectedTag && (
                <motion.button
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    onClick={() => onSelectTag(null)}
                    className="inline-flex items-center gap-1 rounded-full bg-slate-700/50 px-2 py-0.5 text-xs font-medium text-slate-300 hover:bg-slate-700"
                >
                    <XMarkIcon className="h-3 w-3" />
                    Clear filter
                </motion.button>
            )}

            {/* Tag chips */}
            <AnimatePresence mode="popLayout">
                {uniqueTags.map(tag => (
                    <motion.div
                        key={tag}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        layout
                    >
                        <TagChip
                            label={tag}
                            onClick={() => onSelectTag(tag === selectedTag ? null : tag)}
                            isClickable
                            className={tag === selectedTag ? 'ring-2 ring-indigo-500' : ''}
                        />
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
} 