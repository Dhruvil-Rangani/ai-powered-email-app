'use client'

import { motion } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useForm } from 'react-hook-form';
import api from '@/lib/api';
import { useState } from 'react';
import { AxiosError } from 'axios';

interface Props {
    onClose?: () => void;
    afterSend?: () => void;
}

interface ComposeForm {
    to: string;
    subject: string;
    body: string;
    attachments: FileList | null;
}

export default function ComposeCard({ onClose, afterSend }: Props) {
    const {
        register,
        handleSubmit,
        reset,
        formState: { isSubmitting },
    } = useForm<ComposeForm>();
    const [error, setError] = useState<string | null>(null);

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
            onClose?.();
        } catch (err) {
            const error = err as AxiosError<{ message: string }>;
            setError(error.response?.data?.message ?? 'Failed to send email');
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="fixed bottom-4 right-4 z-50 w-96 rounded-lg bg-slate-900 p-4 shadow-xl ring-1 ring-slate-700"
        >
            <header className="mb-2 flex items-center justify-between">
                <h2 className="text-lg font-semibold"> New Message </h2>
                <button onClick={onClose}>
                    <XMarkIcon className="h-5 w-5 text-slate-400 hover:text-red-400 cursor-pointer" />
                </button>
            </header>

            {error && <p className="mb-2 text-xs text-red-500">{error}</p>}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-2 text-sm">
                <input
                    type="email"
                    placeholder="To"
                    {...register('to', { required: true })}
                    className="w-full rounded border border-slate-700 bg-slate-800 p-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <input
                    type="text"
                    placeholder="Subject"
                    {...register('subject')}
                    className="w-full rounded border border-slate-700 bg-slate-800 p-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <textarea
                    rows={6}
                    placeholder="Body"
                    {...register('body')}
                    className="w-full resize-y rounded border border-slate-700 bg-slate-800 p-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <input
                    type="file"
                    multiple
                    {...register('attachments')}
                    className="w-full text-slate-400 file:mr-2 file:rounded file:border-none file:bg-indigo-600 file:px-3 file:py-1 file:text-sm file:text-white file:hover:bg-indigo-500 cursor-pointer"
                />
                <div className="mt-2 flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded border px-3 py-1 cursor-pointer"
                    >
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="rounded bg-indigo-600 px-4 py-1 text-white hover:bg-indigo-500 disabled:opacity-50 cursor-pointer"
                    >
                        {isSubmitting ? 'Sending…' : 'Send'}
                    </button>
                </div>
            </form>
        </motion.div>
    );
}