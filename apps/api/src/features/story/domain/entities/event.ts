export interface Event {
    id: string;
    type: string;
    description: string;
    subjectId: string;
    objectId?: string;
}
