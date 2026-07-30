import { CreateJobDescriptionInterface, UpdateJobDescriptionInterface } from "./jobDescription.interface";
export declare const jobDescriptionService: {
    createJobDescriptionIntoDB: (userId: string, payload: CreateJobDescriptionInterface) => Promise<{
        id: string;
        created_at: Date;
        user_id: string;
        title: string;
        raw_text: string;
        interview_date: Date | null;
    }>;
    getAllJobDescriptionsFromDB: (userId: string) => Promise<{
        id: string;
        created_at: Date;
        user_id: string;
        title: string;
        raw_text: string;
        interview_date: Date | null;
    }[]>;
    getASingleJobDescription: (userId: string, id: string) => Promise<{
        id: string;
        created_at: Date;
        user_id: string;
        title: string;
        raw_text: string;
        interview_date: Date | null;
    }>;
    updateASingleJobDescriptionInDB: (userId: string, id: string, payload: UpdateJobDescriptionInterface) => Promise<{
        id: string;
        created_at: Date;
        user_id: string;
        title: string;
        raw_text: string;
        interview_date: Date | null;
    }>;
    deleteAJobDescriptionFromDB: (userId: string, id: string) => Promise<void>;
};
//# sourceMappingURL=jobDescription.service.d.ts.map