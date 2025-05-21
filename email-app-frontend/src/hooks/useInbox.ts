import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { EmailThread, EmailMessage } from '@/types/email';

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

    const addTag = useCallback(async (messageId: string, tag: string) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/email/messages/${messageId}/tags`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ tag })
            });

            if (!response.ok) throw new Error('Failed to add tag');
            
            // Update local state
            setThreads(prevThreads => 
                prevThreads.map(thread => ({
                    ...thread,
                    messages: thread.messages.map((msg: EmailMessage) => 
                        msg.id === messageId 
                            ? { ...msg, tags: [...(msg.tags || []), tag] }
                            : msg
                    )
                }))
            );
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add tag');
        }
    }, [token]);

    const removeTag = useCallback(async (messageId: string, tag: string) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/email/messages/${messageId}/tags/${encodeURIComponent(tag)}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Failed to remove tag');
            
            // Update local state
            setThreads(prevThreads => 
                prevThreads.map(thread => ({
                    ...thread,
                    messages: thread.messages.map((msg: EmailMessage) => 
                        msg.id === messageId 
                            ? { ...msg, tags: (msg.tags || []).filter((t: string) => t !== tag) }
                            : msg
                    )
                }))
            );
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to remove tag');
        }
    }, [token]);

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