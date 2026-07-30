export declare const paymentReceiptTemplate: (data: {
    name: string;
    amount: string;
    currency: string;
    date: string;
    transaction_id: string;
}) => string;
export declare const studyReminderTemplate: (data: {
    name: string;
    current_streak: number;
    longest_streak: number;
    frontend_url: string;
}) => string;
export declare const subscriptionExpiryTemplate: (data: {
    name: string;
    days_left: number;
    plan: string;
    frontend_url: string;
}) => string;
//# sourceMappingURL=templates.d.ts.map