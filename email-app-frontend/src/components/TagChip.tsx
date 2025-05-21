'use client';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

interface TagChipProps {
    label: string;
    onRemove?: () => void;
    onClick?: () => void;
    className?: string;
    isRemovable?: boolean;
    isClickable?: boolean;
}

// Generate a consistent color based on the label
function getTagColor(label: string): string {
    const colors = [
        'bg-blue-500/20 text-blue-300',
        'bg-purple-500/20 text-purple-300',
        'bg-green-500/20 text-green-300',
        'bg-yellow-500/20 text-yellow-300',
        'bg-red-500/20 text-red-300',
        'bg-pink-500/20 text-pink-300',
    ];
    
    // Simple hash function
    const hash = label.split('').reduce((acc, char) => {
        return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    
    return colors[Math.abs(hash) % colors.length];
}

export default function TagChip({
    label,
    onRemove,
    onClick,
    className = '',
    isRemovable = false,
    isClickable = false,
}: TagChipProps) {
    const colorClass = getTagColor(label);

    return (
        <motion.span
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className={`
                inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium
                ${colorClass}
                ${isClickable ? 'cursor-pointer hover:opacity-80' : ''}
                ${className}
            `}
            onClick={onClick}
            role={isClickable ? 'button' : undefined}
            tabIndex={isClickable ? 0 : undefined}
        >
            {label}
            {isRemovable && onRemove && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemove();
                    }}
                    className="ml-1 rounded-full p-0.5 hover:bg-white/10 cursor-pointer"
                    title="Remove tag"
                >
                    <XMarkIcon className="h-3 w-3" />
                </button>
            )}
        </motion.span>
    );
} 