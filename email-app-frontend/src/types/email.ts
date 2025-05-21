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