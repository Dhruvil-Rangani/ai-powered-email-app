'use client'

import { motion, useDragControls, PanInfo } from 'framer-motion';
import { XMarkIcon, MinusIcon, ArrowsPointingOutIcon, ArrowsPointingInIcon } from '@heroicons/react/24/outline';
import { useForm } from 'react-hook-form';
import api from '@/lib/api';
import { useState, useRef } from 'react';
import { AxiosError } from 'axios';
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

const MAX_WIDTH = 800;
const MAX_HEIGHT = 800;

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
    const [isFormFocused, setIsFormFocused] = useState(false);
    const window = windows.find((w) => w.id === windowId);

    if (!window) return null;

    const handleDragStart = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        // Always allow dragging from the header
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

    async function onSubmit(data: ComposeForm) {
        try {
            const formData = new FormData();
            formData.append('to', data.to);
            formData.append('subject', data.subject);
            formData.append('body', data.body);
            if (data.attachments) {
                Array.from(data.attachments).forEach((file) => formData.append('attachments', file));
            }
            await api.post('/api/emails/send', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            reset();
            afterSend?.();
            handleClose();
        } catch (err) {
            const error = err as AxiosError<{ message: string }>;
            setError(error.response?.data?.message ?? 'Failed to send email');
        }
    }

    return (
        <motion.div
            ref={windowRef}
            drag={!isFormFocused}
            dragControls={dragControls}
            dragMomentum={false}
            dragElastic={0}
            onDragStart={handleDragStart}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{
                opacity: 1,
                scale: 1,
                x: window.position.x,
                y: window.position.y,
                width: window.isMaximized ? MAX_WIDTH : '400px',
                height: window.isMaximized ? MAX_HEIGHT : window.isMinimized ? 'auto' : '500px',
            }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            style={{
                position: 'fixed',
                zIndex: window.zIndex,
                top: window.isMaximized ? '50%' : undefined,
                left: window.isMaximized ? '50%' : undefined,
                transform: window.isMaximized ? 'translate(-50%, -50%)' : undefined,
            }}
            className="rounded-lg bg-slate-900 shadow-xl ring-1 ring-slate-700"
        >
            {/* Window Header */}
            <div
                onPointerDown={(e) => {
                    const target = e.target as HTMLElement;
                    if (target === e.currentTarget || target.closest('.window-header')) {
                        dragControls.start(e);
                        bringToFront(windowId);
                    }
                }}
                className="window-header flex cursor-move items-center justify-between border-b border-slate-700 bg-slate-800 px-4 py-2"
            >
                <h2 className="text-sm font-medium text-slate-300">New Message</h2>
                <div className="flex items-center gap-1">
                    <button
                        onClick={handleMinimize}
                        className="rounded p-1 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors cursor-pointer"
                    >
                        <MinusIcon className="h-4 w-4" />
                    </button>
                    <button
                        onClick={handleMaximize}
                        className="rounded p-1 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors cursor-pointer"
                    >
                        {window.isMaximized ? (
                            <ArrowsPointingInIcon className="h-4 w-4" />
                        ) : (
                            <ArrowsPointingOutIcon className="h-4 w-4" />
                        )}
                    </button>
                    <button
                        onClick={handleClose}
                        className="rounded p-1 text-slate-400 hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
                    >
                        <XMarkIcon className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Window Content */}
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
                                    onFocus={() => setIsFormFocused(true)}
                                    onBlur={() => setIsFormFocused(false)}
                                />
                                <input
                                    type="text"
                                    placeholder="Subject"
                                    {...register('subject')}
                                    className="w-full rounded border border-slate-700 bg-slate-800 p-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    onFocus={() => setIsFormFocused(true)}
                                    onBlur={() => setIsFormFocused(false)}
                                />
                                <textarea
                                    rows={6}
                                    placeholder="Write your message..."
                                    {...register('body')}
                                    className="w-full resize-none rounded border border-slate-700 bg-slate-800 p-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    onFocus={() => setIsFormFocused(true)}
                                    onBlur={() => setIsFormFocused(false)}
                                />
                                <input
                                    type="file"
                                    multiple
                                    {...register('attachments')}
                                    className="w-full text-sm text-slate-400 file:mr-2 file:rounded file:border-none file:bg-indigo-600 file:px-3 file:py-1 file:text-sm file:text-white file:hover:bg-indigo-500 cursor-pointer"
                                    onFocus={() => setIsFormFocused(true)}
                                    onBlur={() => setIsFormFocused(false)}
                                />
                            </div>

                            <div className="mt-4 flex items-center justify-between border-t border-slate-700 pt-4">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="rounded px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-700 cursor-pointer"
                                >
                                    Discard
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="rounded bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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