import { useState, useCallback } from 'react';
import api from '@/lib/api';

export interface Tag {
  id: string;
  label: string;
  messageId: string;
  createdAt: string;
}

interface UseTagsReturn {
  tags: Tag[];
  isLoading: boolean;
  error: string | null;
  addTag: (messageId: string, label: string) => Promise<void>;
  removeTag: (messageId: string, tagId: string) => Promise<void>;
  getTags: (messageId: string) => Promise<void>;
  getEmailsByTag: (label: string) => Promise<string[]>;
}

export function useTags(): UseTagsReturn {
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addTag = useCallback(async (messageId: string, label: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/api/email/tags', { messageId, label });
      setTags(prev => [...prev, data]);
    } catch (err: any) {
      setError(err.message || 'Failed to add tag');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeTag = useCallback(async (messageId: string, tagId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await api.delete(`/api/email/tags/${messageId}/${tagId}`);
      setTags(prev => prev.filter(tag => tag.id !== tagId));
    } catch (err: any) {
      setError(err.message || 'Failed to remove tag');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getTags = useCallback(async (messageId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await api.get(`/api/email/tags/${messageId}`);
      setTags(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch tags');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getEmailsByTag = useCallback(async (label: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await api.get(`/api/email/tags/by/${encodeURIComponent(label)}`);
      return data.messageIds;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch emails by tag');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    tags,
    isLoading,
    error,
    addTag,
    removeTag,
    getTags,
    getEmailsByTag,
  };
} 