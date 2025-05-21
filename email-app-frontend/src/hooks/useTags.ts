import { useState, useCallback } from 'react';
import api from '@/lib/api';

export interface Tag {
  id: string;
  label: string;
  messageId: string;
  createdAt: string;
}

interface ApiError {
  message: string;
  details?: string;
}

interface UseTagsReturn {
  tags: Tag[];
  isLoading: boolean;
  error: string | null;
  addTag: (messageId: string, label: string) => Promise<Tag>;
  removeTag: (messageId: string, label: string) => Promise<void>;
  getTags: (messageId: string) => Promise<Tag[]>;
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
      return data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to add tag';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeTag = useCallback(async (messageId: string, label: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // First get the tag ID for the label
      const { data: tags } = await api.get(`/api/email/tags/${messageId}`);
      const tagToRemove = tags.find((t: Tag) => t.label === label);
      
      if (!tagToRemove) {
        const errorMessage = `Tag "${label}" not found`;
        setError(errorMessage);
        throw new Error(errorMessage);
      }

      // Then delete using the tag ID (which is a number)
      try {
        await api.delete(`/api/email/tags/${messageId}/${tagToRemove.id}`);
        // Update local state only after successful deletion
        setTags(prev => prev.filter(tag => tag.id !== tagToRemove.id));
      } catch (deleteErr: any) {
        console.error('Delete tag error:', deleteErr.response?.data || deleteErr);
        const errorMessage = deleteErr.response?.data?.error || deleteErr.message || 'Failed to delete tag';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    } catch (err: any) {
      // If it's not already an Error object, create one
      if (!(err instanceof Error)) {
        console.error('Remove tag error:', err.response?.data || err);
        const errorMessage = err.response?.data?.error || err.message || 'Failed to remove tag';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
      // If it's already an Error, just rethrow it
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getTags = useCallback(async (messageId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get(`/api/email/${messageId}/tags`);
      const data = response.data as { tags: Tag[] };
      setTags(data.tags);
      return data.tags;
    } catch (err) {
      const error = err as { response?: { data?: ApiError } };
      setError(error.response?.data?.message ?? 'Failed to fetch tags');
      console.error('Failed to fetch tags:', error);
      throw new Error(error.response?.data?.message ?? 'Failed to fetch tags');
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
      console.error('Get emails by tag error:', err.response?.data || err);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch emails by tag';
      setError(errorMessage);
      throw new Error(errorMessage);
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