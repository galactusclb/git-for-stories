import { Event } from './event';
export interface Scene {
    id: string;
    sequence_id: number;
    title: string;
    summary: string;

    characters: string[];
    location?: string;

    events: Event[];
}
