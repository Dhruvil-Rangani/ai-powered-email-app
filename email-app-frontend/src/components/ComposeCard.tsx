'use client'

import { motion, useDragControls, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import api from '@/lib/api';
import { useState, useRef, useEffect, useCallback, memo } from 'react';
import { useCompose } from '@/contexts/ComposeContext';

interface Props {
    windowId: string;
    afterSend?: () => void;
}

interface ComposeForm {
    to: string;
    subject: string;
    body: string;
    attachments: FileList | null;
}

const ComposeCard = memo(function ComposeCard({ windowId, afterSend }: Props) {
    const form = useForm<ComposeForm>();
    const [error, setError] = useState<string | null>(null);
    const compose = useCompose();
    const windowRef = useRef<HTMLDivElement>(null);
    const dragControls = useDragControls();
    const [mounted, setMounted] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
    const [isDragging, setIsDragging] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Find window data early to avoid reference issues
    const composeWindow = compose.windows.find(w => w.id === windowId);

    // Check if device is mobile
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 640); // sm breakpoint
        };
        
        // Initial check
        checkMobile();
        
        // Update on resize
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Force maximize on mobile
    useEffect(() => {
        if (isMobile && composeWindow && !composeWindow.isMaximized) {
            compose.updateWindow(windowId, { 
                isMaximized: true,
                position: { x: 0, y: 0 }
            });
        }
    }, [isMobile, composeWindow, compose, windowId]);

    const handleDragStart = useCallback((event: MouseEvent | TouchEvent | PointerEvent) => {
        // Only allow drag from header when not maximized and not on mobile
        if (composeWindow?.isMaximized || isMobile) return;
        
        if (event.target instanceof HTMLElement && event.target.closest('.window-header')) {
            if (event instanceof PointerEvent && !event.target.closest('button')) {
                // Start drag with the current event
                dragControls.start(event);
                setIsDragging(true);
            }
            compose.bringToFront(windowId);
        }
    }, [dragControls, compose, windowId, composeWindow?.isMaximized, isMobile]);

    const handleDragEnd = useCallback(() => {
        setIsDragging(false);
        // Update position after drag ends (only on desktop)
        if (!isMobile && windowRef.current) {
            const rect = windowRef.current.getBoundingClientRect();
            compose.updateWindow(windowId, {
                position: { x: rect.left, y: rect.top }
            });
        }
    }, [compose, windowId, isMobile]);

    const handleMinimize = useCallback(() => {
        if (composeWindow && !isMobile) {
            compose.updateWindow(windowId, { isMinimized: !composeWindow.isMinimized });
        }
    }, [compose, windowId, composeWindow, isMobile]);

    const handleMaximize = useCallback(() => {
        if (composeWindow && !isMobile) {
            // Cancel any ongoing drag before maximizing
            setIsDragging(false);
            compose.updateWindow(windowId, { isMaximized: !composeWindow.isMaximized });
            // Reset position when maximizing
            if (!composeWindow.isMaximized) {
                compose.updateWindow(windowId, { 
                    position: { x: 0, y: 0 } // Center in viewport
                });
            }
        }
    }, [compose, windowId, composeWindow, isMobile]);

    const handleClose = useCallback(() => {
        // Cancel any ongoing drag before closing
        setIsDragging(false);
        compose.removeWindow(windowId);
    }, [compose, windowId]);

    const onSubmit = useCallback(async (data: ComposeForm) => {
        try {
            setError(null);
            await api.post('/api/email/send', data);
            form.reset();
            if (afterSend) afterSend();
            compose.removeWindow(windowId);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to send email');
        }
    }, [afterSend, compose, form, windowId]);

    useEffect(() => {
        // Use a shorter timeout for mounting
        timeoutRef.current = setTimeout(() => setMounted(true), 50);
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            // Cancel any ongoing drag on unmount
            setIsDragging(false);
        };
    }, []);

    if (!composeWindow || !mounted) return null;

    const maximizedClass = composeWindow.isMaximized || isMobile
        ? 'fixed z-50 bg-slate-900 shadow-xl transition-all duration-200 ' +
          'w-full h-full top-0 left-0 right-0 bottom-0 rounded-none m-0 sm:inset-4 sm:rounded-2xl sm:max-w-3xl sm:max-h-[90vh] sm:mx-auto sm:my-auto'
        : 'fixed z-50 overflow-hidden rounded-lg bg-slate-900 shadow-xl w-full max-w-full sm:max-w-lg sm:w-[600px]';

    return (
        <motion.div
            ref={windowRef}
            drag={!composeWindow.isMaximized && !isMobile} // Only enable drag on desktop when not maximized
            dragControls={dragControls}
            dragMomentum={false}
            dragElastic={0}
            dragConstraints={{
                top: 0,
                left: 0,
                right: window.innerWidth - (windowRef.current?.offsetWidth || 600),
                bottom: window.innerHeight - (windowRef.current?.offsetHeight || 400)
            }}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ 
                type: "spring", 
                stiffness: 400, 
                damping: 35,
                mass: 0.8,
                duration: 0.2
            }}
            className={maximizedClass}
            style={composeWindow.isMaximized || isMobile ? {} : {
                position: 'fixed',
                top: composeWindow.position.y,
                left: composeWindow.position.x,
                touchAction: 'none' // Prevent touch scrolling while dragging
            }}
        >
            <div
                className={`window-header flex items-center justify-between bg-slate-800 px-4 py-2 ${!composeWindow.isMaximized && !isMobile ? 'cursor-move' : ''} select-none`}
                onPointerDown={(e) => {
                    if (!composeWindow.isMaximized && !isMobile && e.target instanceof HTMLElement && !e.target.closest('button')) {
                        // Start drag with the current event
                        dragControls.start(e);
                        setIsDragging(true);
                    }
                }}
            >
                <div className="flex items-center space-x-2">
                    {!isMobile && (
                        <button
                            onClick={handleMinimize}
                            className="h-3 w-3 rounded-full bg-yellow-500 hover:bg-yellow-400"
                            aria-label="Minimize"
                        />
                    )}
                    {!isMobile && (
                        <button
                            onClick={handleMaximize}
                            className="h-3 w-3 rounded-full bg-green-500 hover:bg-green-400"
                            aria-label="Maximize"
                        />
                    )}
                    <button
                        onClick={handleClose}
                        className="h-3 w-3 rounded-full bg-red-500 hover:bg-red-400"
                        aria-label="Close"
                    />
                </div>
                <div className="text-sm font-medium text-slate-300">New Message</div>
                <div className="w-20" /> {/* Spacer for alignment */}
            </div>

            <AnimatePresence mode="wait">
                {!composeWindow.isMinimized && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ 
                            type: "spring",
                            stiffness: 400,
                            damping: 35,
                            mass: 0.8,
                            duration: 0.2
                        }}
                        className="overflow-hidden"
                    >
                        <form onSubmit={form.handleSubmit(onSubmit)} className="flex h-full flex-col p-2 sm:p-4">
                            {error && <p className="mb-2 text-xs text-red-500">{error}</p>}
                            <div className="flex-1 space-y-2 sm:space-y-3 overflow-y-auto">
                                <input
                                    type="email"
                                    placeholder="To"
                                    {...form.register('to', { required: true })}
                                    className="w-full rounded border border-slate-700 bg-slate-800 p-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    autoComplete="email"
                                />
                                <input
                                    type="text"
                                    placeholder="Subject"
                                    {...form.register('subject')}
                                    className="w-full rounded border border-slate-700 bg-slate-800 p-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    autoComplete="off"
                                />
                                <textarea
                                    placeholder="Write your message..."
                                    {...form.register('body', { required: true })}
                                    className="h-40 sm:h-64 w-full rounded border border-slate-700 bg-slate-800 p-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    autoComplete="off"
                                />
                            </div>
                            <div className="mt-2 sm:mt-4 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={form.formState.isSubmitting}
                                    className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                                >
                                    {form.formState.isSubmitting ? 'Sending...' : 'Send'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
});

export default ComposeCard;