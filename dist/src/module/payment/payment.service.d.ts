/// <reference types="node" />
/// <reference types="node" />
export declare const subscriptionService: {
    createCheckOutSession: (userId: string) => Promise<{
        paymentURL: string | null;
    }>;
    webhookService: (payload: Buffer, signature: string) => Promise<void>;
    getSubscriptionStatus: (userId: string) => Promise<{
        status: null;
        isSubscribed: boolean;
        currentPeriodEnd: null;
    } | {
        status: import("../../../generated/prisma/enums.js").SubStatus;
        isSubscribed: boolean;
        currentPeriodEnd: Date;
    }>;
    getPaymentHistory: (userId: string) => Promise<{
        id: string;
        plan: import("../../../generated/prisma/enums.js").Plan;
        status: import("../../../generated/prisma/enums.js").SubStatus;
        startedAt: Date;
        currentPeriodEnd: Date;
        stripeSubscriptionId: string;
        createdAt: Date;
    }[]>;
};
//# sourceMappingURL=payment.service.d.ts.map