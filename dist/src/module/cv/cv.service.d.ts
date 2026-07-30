import type { UploadCVInput } from "./cv.interface";
export declare const cvService: {
    createCVInDB: (userId: string, file: UploadCVInput) => Promise<{
        id: string;
        user_id: string;
        raw_text: string;
        version_number: number;
        file_url: string;
        uploaded_at: Date;
    }>;
    getAllCVsFromDB: (userId: string) => Promise<{
        id: string;
        version_number: number;
        file_url: string;
        uploaded_at: Date;
    }[]>;
    getASingleCV: (userId: string, id: string) => Promise<{
        id: string;
        user_id: string;
        raw_text: string;
        version_number: number;
        file_url: string;
        uploaded_at: Date;
    }>;
    deleteCVFromDB: (userId: string, id: string) => Promise<void>;
};
//# sourceMappingURL=cv.service.d.ts.map