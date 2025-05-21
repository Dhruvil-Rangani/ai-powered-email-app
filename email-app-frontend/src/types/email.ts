export interface EmailMessage {
    id: string;
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
    attachments?: { filename: string; size?: number }[];
    tags?: string[];
}

export interface EmailThread {
    id: string;
    subject: string;
    messages: EmailMessage[];
    unread: boolean;
}

export interface ThreadMsg {
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
    attachments?: { filename: string; size?: number }[];
}

export interface ApiResponse<T> {
    data: T;
    message?: string;
}

export interface ThreadsResponse {
    threads: ThreadMsg[][];
    total?: number;
    page?: number;
    limit?: number;
}

export interface SearchRequest {
    q: string;
}

export interface SearchResponse {
    filters: {
        subject?: string;
        body?: string;
        from?: string;
        after?: string;
        before?: string;
        tag?: string;
    };
    suggestedAnswer?: string;
}

export interface TagResponse {
    id: string;
    label: string;
    messageId: string;
    createdAt: string;
} 