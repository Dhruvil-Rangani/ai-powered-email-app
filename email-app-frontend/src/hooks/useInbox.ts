import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { EmailThread, EmailMessage } from '@/types/email';
import api from '@/lib/api';

export interface SearchFilters {
    from?: string;
    subject?: string;
    body?: string;
    after?: string;
    before?: string;
    tag?: string;
}

interface SearchRequest {
    q: string;
}

interface SearchResponse {
    filters: SearchFilters;
    suggestedAnswer?: string;
}

export const useInbox = () => {
    const { token } = useAuth();
    const [threads, setThreads] = useState<EmailThread[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchFilters, setSearchFilters] = useState<SearchFilters>({});
    const [isAISearch, setIsAISearch] = useState(false);
    const [aiSearchLoading, setAiSearchLoading] = useState(false);
    const [suggestedAnswer, setSuggestedAnswer] = useState<string | null>(null);

    const fetchThreads = useCallback(async (filters: SearchFilters = {}) => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value) queryParams.append(key, value);
            });

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/email/threads?${queryParams}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Failed to fetch threads');
            const data = await response.json();
            setThreads(data);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch threads');
        } finally {
            setLoading(false);
        }
    }, [token]);

    const handleSearch = useCallback(async (query: string, useAI: boolean = false) => {
        setSearchQuery(query);
        setIsAISearch(useAI);

        if (!query.trim()) {
            setSearchFilters({});
            setSuggestedAnswer(null);
            await fetchThreads();
            return;
        }

        if (useAI) {
            try {
                setAiSearchLoading(true);
                const request: SearchRequest = { q: query };
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ai/search`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(request)
                });

                if (!response.ok) throw new Error('AI search failed');
                const data: SearchResponse = await response.json();
                setSearchFilters(data.filters);
                setSuggestedAnswer(data.suggestedAnswer || null);
                await fetchThreads(data.filters);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'AI search failed');
            } finally {
                setAiSearchLoading(false);
            }
        } else {
            // Regular search - just search in subject and body
            const filters = {
                subject: query,
                body: query
            };
            setSearchFilters(filters);
            setSuggestedAnswer(null);
            await fetchThreads(filters);
        }
    }, [token, fetchThreads]);

    const addTag = useCallback(async (messageId: string, label: string) => {
        try {
            const response = await api.post('/api/email/tags', { 
                messageId, 
                label 
            });

            if (!response.data) throw new Error('Failed to add tag');
            
            // Update local state with the new tag
            setThreads(prevThreads => 
                prevThreads.map(thread => ({
                    ...thread,
                    messages: thread.messages.map((msg: EmailMessage) => 
                        msg.id === messageId 
                            ? { ...msg, tags: [...(msg.tags || []), label] }
                            : msg
                    )
                }))
            );
            return response.data;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to add tag';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    }, []);

    const removeTag = useCallback(async (messageId: string, label: string) => {
        try {
            // First get the tag ID for the label
            const { data: tags } = await api.get(`/api/email/tags/${messageId}`);
            const tagToRemove = tags.find((t: { label: string }) => t.label === label);
            
            if (!tagToRemove) {
                throw new Error('Tag not found');
            }

            // Then delete using the tag ID
            await api.delete(`/api/email/tags/${messageId}/${tagToRemove.id}`);
            
            // Update local state
            setThreads(prevThreads => 
                prevThreads.map(thread => ({
                    ...thread,
                    messages: thread.messages.map((msg: EmailMessage) => 
                        msg.id === messageId 
                            ? { ...msg, tags: (msg.tags || []).filter(t => t !== label) }
                            : msg
                    )
                }))
            );
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to remove tag';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    }, []);

    // Initial fetch
    useEffect(() => {
        fetchThreads();
    }, [fetchThreads]);

    return {
        threads,
        loading,
        error,
        searchQuery,
        searchFilters,
        isAISearch,
        aiSearchLoading,
        suggestedAnswer,
        handleSearch,
        addTag,
        removeTag
    };
}; 