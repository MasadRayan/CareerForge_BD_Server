import { CreateUserInterFace, UpdateUserInterFace } from "./user.interface";
export declare const userService: {
    registerUserIntoDB: (payload: CreateUserInterFace) => Promise<{
        id: string;
        email: string;
        name: string;
        role: import("../../../generated/prisma/enums").Role;
        photoURL: string;
        target_role: string | null;
        experience_level: string | null;
        created_at: Date;
        updated_at: Date;
    }>;
    getAllUserFromDB: (page: number) => Promise<{
        id: string;
        email: string;
        name: string;
        role: import("../../../generated/prisma/enums").Role;
        photoURL: string;
        target_role: string | null;
        experience_level: string | null;
        created_at: Date;
        updated_at: Date;
    }[]>;
    getASingleUser: (email: string) => Promise<{
        id: string;
        email: string;
        name: string;
        role: import("../../../generated/prisma/enums").Role;
        photoURL: string;
        target_role: string | null;
        experience_level: string | null;
        created_at: Date;
        updated_at: Date;
    }>;
    updateASingleUserInDB: (email: string, payload: UpdateUserInterFace) => Promise<void>;
    deleteAUserFromDB: (email: string) => Promise<void>;
    getRoleOfUserFromDB: (id: string) => Promise<{
        role: import("../../../generated/prisma/enums").Role;
    } | null>;
};
//# sourceMappingURL=user.service.d.ts.map