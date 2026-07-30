import { Request, Response, NextFunction } from 'express';
export declare const subscriptionController: {
    createCheckOutSession: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    webhookController: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getSubscriptionStatus: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getPaymentHistory: (req: Request, res: Response, next: NextFunction) => Promise<void>;
};
//# sourceMappingURL=payment.controller.d.ts.map