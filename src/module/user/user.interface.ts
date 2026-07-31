export interface CreateUserInterFace {
    name: string;
    email: string;
    experience_level ?: string;
    target_role ?: string;
    photoURL ?: string
}

export interface UpdateUserInterFace {
    name ?: string;
    experience_level ?: string;
    photoURL ?: string
}

export type UserRole = 'free_user' | 'premium_user' | 'admin';

export interface UpdateUserRoleInterFace {
    role: UserRole;
}