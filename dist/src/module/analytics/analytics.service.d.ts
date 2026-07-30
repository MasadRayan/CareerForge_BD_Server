export declare const analyticsService: {
    getUserStatus: (userId: string) => Promise<{
        subscription: {
            plan: import("../../../generated/prisma/enums.js").Plan;
            status: import("../../../generated/prisma/enums.js").SubStatus;
            currentPeriodEnd: Date;
            startedAt: Date;
        } | null;
        usage: {
            analysesUsedThisMonth: number;
            analysesLimit: number;
            resetDate: Date | null;
        };
        streak: {
            current: number;
            longest: number;
            lastActive: Date;
        } | null;
        content: {
            totalCvs: number;
            totalAnalyses: number;
            totalRoadmaps: number;
            totalQuizAttempts: number;
            quizAccuracy: number;
            totalBehavioralAnswers: number;
        };
        readinessScore: number | null;
    }>;
    getAdminAnalytics: () => Promise<{
        mrr: number;
        activeSubscribers: number;
        totalRevenue: number;
        churnRate: number;
        totalUsers: number;
        userSplit: {
            [k: string]: number;
        };
        revenueByMonth: {
            month: string;
            revenue: number;
        }[];
        newSignupsThisMonth: number;
        newSubscriptionsThisMonth: number;
        totalAnalyses: number;
        totalCvs: number;
        totalRoadmaps: number;
    }>;
};
//# sourceMappingURL=analytics.service.d.ts.map