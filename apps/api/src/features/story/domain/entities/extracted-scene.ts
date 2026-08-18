export interface ExtractedScene {
    id: string;
    sequence_id: number;
    title: string;
    summary: string;
    characters: string[];
    location?: string;
    events: ExtractedEvent[];
}

export interface ExtractedEvent {
    id: string;
    type: string;
    description: string;
    subject: string;
    object?: string;
}
