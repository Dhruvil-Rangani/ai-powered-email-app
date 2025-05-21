import { useState, useCallback } from 'react';
import { enhancedApi } from '@/lib/api';
import { AxiosError } from 'axios';

export interface Tag {
  id: string;
  label: string;
  messageId: string;
  createdAt: string;
}

interface ApiError {
  error: string;
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
      const data = await enhancedApi.post<Tag>('/api/email/tags', { messageId, label });
      setTags(prev => [...prev, data]);
      return data;
    } catch (err) {
      const error = err as AxiosError<ApiError>;
      const errorMessage = error.response?.data?.error ?? 'Failed to add tag';
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
      const tags = await enhancedApi.get<Tag[]>(`/api/email/tags/${encodeURIComponent(messageId)}`);
      const tagToRemove = tags.find((t: Tag) => t.label === label);
      
      if (!tagToRemove) {
        const errorMessage = `Tag "${label}" not found`;
        setError(errorMessage);
        throw new Error(errorMessage);
      }

      await enhancedApi.delete(`/api/email/tags/${encodeURIComponent(messageId)}/${tagToRemove.id}`);
      setTags(prev => prev.filter(tag => tag.id !== tagToRemove.id));
    } catch (err) {
      const error = err as AxiosError<ApiError>;
      const errorMessage = error.response?.data?.error ?? 'Failed to remove tag';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getTags = useCallback(async (messageId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await enhancedApi.get<Tag[]>(`/api/email/tags/${encodeURIComponent(messageId)}`);
      setTags(data);
      return data;
    } catch (err) {
      const error = err as AxiosError<ApiError>;
      const errorMessage = error.response?.data?.error ?? 'Failed to fetch tags';
      setError(errorMessage);
      console.error('Failed to fetch tags:', error);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getEmailsByTag = useCallback(async (label: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await enhancedApi.get<{ messageIds: string[] }>(`/api/email/tags/by/${encodeURIComponent(label)}`);
      return data.messageIds;
    } catch (err) {
      const error = err as AxiosError<ApiError>;
      const errorMessage = error.response?.data?.error ?? 'Failed to fetch emails by tag';
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