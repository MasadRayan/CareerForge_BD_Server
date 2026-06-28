export interface CreateJobDescriptionInterface {
    title: string;
    raw_text: string;
    interview_date?: string; // ISO 8601 date string from the client
}

export interface UpdateJobDescriptionInterface {
    title?: string;
    raw_text?: string;
    interview_date?: string; // ISO 8601 date string from the client
}
