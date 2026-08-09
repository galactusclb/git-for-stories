export interface Scene {
    id: string;
    sequence: number;
    title: string;
    summary: string;
    characters: string[];
    location?: string;
}
