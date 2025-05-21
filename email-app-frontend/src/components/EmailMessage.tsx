'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
  PaperClipIcon,
  ArrowUturnLeftIcon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/outline';
import { formatRelativeTime, getFileIcon, formatEmailAddress, extractEmailAddress, formatFileSize } from '@/utils/format';
import EmailHTMLContent from './EmailHTMLContent';
import md5 from 'crypto-js/md5';
import { useTags, Tag } from '@/hooks/useTags';
import TagChip from './TagChip';
import TagPicker from './TagPicker';

interface Attachment {
  filename: string;
  size?: number;
}

interface EmailMessageProps {
  message: {
    subject: string;
    from: string;
    to?: string;
    cc?: string;
    date: string;
    text: string;
    html?: string;
    messageId: string;
    inReplyTo?: string;
    references?: string[];
    attachments?: Attachment[];
  };
  onReply: (content: string) => Promise<void>;
  onDownload: (messageId: string, filename: string) => Promise<void>;
  isLastInThread?: boolean;
}

function getGravatarUrl(email: string): string {
  const hash = md5(email.trim().toLowerCase()).toString();
  return `https://www.gravatar.com/avatar/${hash}?d=identicon`;
}

interface TagPickerProps {
  messageId: string;
  existingTags: Tag[];
  onAddTag: (messageId: string, label: string) => Promise<void>;
  onRemoveTag: (messageId: string, tagId: string) => Promise<void>;
  className?: string;
}

export default function EmailMessage({ message, onReply, onDownload, isLastInThread = false }: EmailMessageProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const { tags, isLoading: tagsLoading, error: tagsError, getTags, addTag, removeTag } = useTags();

  useEffect(() => {
    getTags(message.messageId).catch(console.error);
  }, [message.messageId, getTags]);

  const handleReply = async () => {
    if (!replyContent.trim()) return;
    setIsSending(true);
    try {
      await onReply(replyContent);
      setReplyContent('');
      setIsReplying(false);
    } catch (error) {
      console.error('Failed to send reply:', error);
    } finally {
      setIsSending(false);
    }
  };

  const emailAddress = extractEmailAddress(message.from);
  const formattedDate = formatRelativeTime(message.date);

  return (
    <article className={`rounded-lg border border-slate-700 bg-slate-900 shadow-md transition-all ${
      isLastInThread ? 'mb-0' : 'mb-4'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between border-b border-slate-700 p-4">
        <div className="flex items-start gap-4">
          <Image
            src={getGravatarUrl(emailAddress)}
            alt="avatar"
            width={40}
            height={40}
            className="rounded-full"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-white truncate">
                {message.subject || '(no subject)'}
              </h2>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex-shrink-0 p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors cursor-pointer"
              >
                {isExpanded ? (
                  <ChevronUpIcon className="h-5 w-5" />
                ) : (
                  <ChevronDownIcon className="h-5 w-5" />
                )}
              </button>
            </div>
            <div className="mt-1 space-y-1 text-sm">
              <p className="text-slate-300">
                <span className="text-slate-400">From: </span>
                {formatEmailAddress(message.from)}
              </p>
              {message.to && (
                <p className="text-slate-300">
                  <span className="text-slate-400">To: </span>
                  {formatEmailAddress(message.to)}
                </p>
              )}
              {message.cc && (
                <p className="text-slate-300">
                  <span className="text-slate-400">Cc: </span>
                  {formatEmailAddress(message.cc)}
                </p>
              )}
              <p className="text-slate-400 text-xs">{formattedDate}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {Array.isArray(message.attachments) && message.attachments.length > 0 && (
            <span className="text-slate-400 text-sm">
              {message.attachments.length} attachment{message.attachments.length !== 1 ? 's' : ''}
            </span>
          )}
          <button
            onClick={() => setIsReplying(!isReplying)}
            className="flex items-center gap-1 rounded-md px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowUturnLeftIcon className="h-4 w-4" />
            Reply
          </button>
        </div>
      </div>

      {/* Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4">
              {message.html ? (
                <EmailHTMLContent html={message.html} />
              ) : (
                <pre className="whitespace-pre-wrap rounded bg-slate-800 p-4 text-sm text-white font-sans">
                  {message.text}
                </pre>
              )}

              {Array.isArray(message.attachments) && message.attachments.length > 0 && (
                <div className="mt-6 rounded-lg border border-slate-700 bg-slate-800 p-4">
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-300">
                    <PaperClipIcon className="h-4 w-4" />
                    Attachments
                  </h3>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {message.attachments.map((att) => (
                      <button
                        key={att.filename}
                        onClick={() => onDownload(message.messageId, att.filename)}
                        className="flex items-center gap-2 rounded-md p-2 text-left text-sm text-slate-300 hover:bg-slate-700 transition-colors cursor-pointer"
                      >
                        <span className="text-lg">{getFileIcon(att.filename)}</span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium">{att.filename}</p>
                          {att.size && (
                            <p className="text-xs text-slate-400">{formatFileSize(att.size)}</p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reply Box */}
      <AnimatePresence>
        {isReplying && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-slate-700"
          >
            <div className="p-4">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-medium text-slate-300">
                  Reply to {formatEmailAddress(message.from)}
                </h3>
                <button
                  onClick={() => setIsReplying(false)}
                  className="rounded p-1 text-slate-400 hover:bg-slate-700 hover:text-white cursor-pointer"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write your reply..."
                className="w-full rounded-lg bg-slate-800 p-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows={4}
              />
              <div className="mt-3 flex items-center justify-between">
                <p className="text-xs text-slate-400">
                  {replyContent.length} characters
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsReplying(false)}
                    className="rounded-md px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReply}
                    disabled={isSending || !replyContent.trim()}
                    className="rounded-md bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isSending ? 'Sending...' : 'Send Reply'}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tags Section */}
      <div className="flex flex-col items-end gap-2">
        <div className="flex flex-wrap gap-1">
          {tags.map((tag) => (
            <TagChip
              key={tag.id}
              label={tag.label}
              onRemove={() => removeTag(message.messageId, tag.id)}
              isRemovable
            />
          ))}
        </div>
        <TagPicker
          messageId={message.messageId}
          existingTags={tags.map(t => t.label)}
          onAddTag={(label) => addTag(message.messageId, label)}
          onRemoveTag={(label) => {
            const tag = tags.find(t => t.label === label);
            if (tag) removeTag(message.messageId, tag.id);
          }}
        />
      </div>

      {/* Error Display */}
      {tagsError && (
        <div className="mt-4 rounded-md bg-red-500/10 p-3 text-sm text-red-400">
          {tagsError}
        </div>
      )}
    </article>
  );
} 