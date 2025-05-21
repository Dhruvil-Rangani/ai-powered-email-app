'use client'

import { motion, useDragControls } from 'framer-motion';
import { useForm } from 'react-hook-form';
import api from '@/lib/api';
import { useState, useRef, useEffect } from 'react';
import { useCompose } from '@/contexts/ComposeContext';
import { AnimatePresence } from 'framer-motion';

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

export default function ComposeCard({ windowId, afterSend }: Props) {
    const {
        register,
        handleSubmit,
        reset,
        formState: { isSubmitting },
    } = useForm<ComposeForm>();
    const [error, setError] = useState<string | null>(null);
    const { removeWindow, updateWindow, bringToFront, windows } = useCompose();
    const windowRef = useRef<HTMLDivElement>(null);
    const dragControls = useDragControls();
    const [mounted, setMounted] = useState(false);
    const window = windows.find((w) => w.id === windowId);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!window || !mounted) return null;

    const handleDragStart = (event: MouseEvent | TouchEvent | PointerEvent) => {
        if (event.target instanceof HTMLElement && event.target.closest('.window-header')) {
            if (event instanceof PointerEvent) {
                dragControls.start(event);
            }
            bringToFront(windowId);
        }
    };

    const handleMinimize = () => {
        updateWindow(windowId, { isMinimized: !window.isMinimized });
    };

    const handleMaximize = () => {
        updateWindow(windowId, { isMaximized: !window.isMaximized });
    };

    const handleClose = () => {
        removeWindow(windowId);
    };

    const onSubmit = async (data: ComposeForm) => {
        try {
            setError(null);
            await api.post('/api/email/send', data);
            reset();
            if (afterSend) afterSend();
            removeWindow(windowId);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to send email');
        }
    };

    return (
        <motion.div
            ref={windowRef}
            drag
            dragControls={dragControls}
            dragMomentum={false}
            dragElastic={0}
            onDragStart={handleDragStart}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className={`fixed z-50 overflow-hidden rounded-lg bg-slate-900 shadow-xl ${
                window.isMaximized ? 'inset-4' : 'w-[600px]'
            }`}
            style={{
                top: window.position.y,
                left: window.position.x,
            }}
        >
            <div className="window-header flex items-center justify-between bg-slate-800 px-4 py-2">
                <div className="flex items-center space-x-2">
                    <button
                        onClick={handleMinimize}
                        className="h-3 w-3 rounded-full bg-yellow-500 hover:bg-yellow-400"
                    />
                    <button
                        onClick={handleMaximize}
                        className="h-3 w-3 rounded-full bg-green-500 hover:bg-green-400"
                    />
                    <button
                        onClick={handleClose}
                        className="h-3 w-3 rounded-full bg-red-500 hover:bg-red-400"
                    />
                </div>
                <div className="text-sm font-medium text-slate-300">New Message</div>
                <div className="w-20" /> {/* Spacer for alignment */}
            </div>

            <AnimatePresence>
                {!window.isMinimized && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <form onSubmit={handleSubmit(onSubmit)} className="flex h-full flex-col p-4">
                            {error && <p className="mb-2 text-xs text-red-500">{error}</p>}
                            
                            <div className="flex-1 space-y-3 overflow-y-auto">
                                <input
                                    type="email"
                                    placeholder="To"
                                    {...register('to', { required: true })}
                                    className="w-full rounded border border-slate-700 bg-slate-800 p-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    autoComplete="email"
                                />
                                <input
                                    type="text"
                                    placeholder="Subject"
                                    {...register('subject')}
                                    className="w-full rounded border border-slate-700 bg-slate-800 p-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    autoComplete="off"
                                />
                                <textarea
                                    placeholder="Write your message..."
                                    {...register('body', { required: true })}
                                    className="h-64 w-full rounded border border-slate-700 bg-slate-800 p-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    autoComplete="off"
                                />
                            </div>

                            <div className="mt-4 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Sending...' : 'Send'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}