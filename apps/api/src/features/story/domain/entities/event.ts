export interface Event {
    id: string;
    type: string;
    description: string;
    subject: string;
    object?: string;
}
