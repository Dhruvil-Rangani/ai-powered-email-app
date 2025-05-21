export interface EmailMessage {
    id: string;
    from: string;
    subject: string;
    body: string;
    date: string;
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