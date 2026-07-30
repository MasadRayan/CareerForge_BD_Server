import { prisma } from "../../lib/prisma.js";
import AppError from "../../utils/AppError.js";
import { sendEmail } from "../../config/email.js";
import { paymentReceiptTemplate, studyReminderTemplate, subscriptionExpiryTemplate, } from "./templates.js";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
export const sendPaymentReceipt = async (userId, transactionId) => {
    const user = await prisma.users.findUnique({
        where: { id: userId },
        select: { name: true, email: true },
    });
    if (!user)
        throw new AppError("User not found", 404);
    const transaction = await prisma.transactions.findUnique({
        where: { id: transactionId },
        select: { amount: true, currency: true, created_at: true },
    });
    if (!transaction)
        throw new AppError("Transaction not found", 404);
    const html = paymentReceiptTemplate({
        name: user.name,
        amount: transaction.amount.toString(),
        currency: transaction.currency,
        date: transaction.created_at.toISOString().split("T")[0],
        transaction_id: transactionId,
    });
    await sendEmail(user.email, "Payment Receipt — CareerForge BD", html);
};
export const sendStudyReminder = async (userId) => {
    const user = await prisma.users.findUnique({
        where: { id: userId },
        select: { name: true, email: true },
    });
    if (!user)
        throw new AppError("User not found", 404);
    const streak = await prisma.streaks.findUnique({
        where: { user_id: userId },
        select: { current_streak: true, longest_streak: true },
    });
    const current_streak = streak?.current_streak ?? 0;
    const longest_streak = streak?.longest_streak ?? 0;
    const html = studyReminderTemplate({
        name: user.name,
        current_streak,
        longest_streak,
        frontend_url: FRONTEND_URL,
    });
    await sendEmail(user.email, "Don't lose your streak — CareerForge BD", html);
};
export const sendSubscriptionExpiry = async (userId, daysLeft) => {
    const user = await prisma.users.findUnique({
        where: { id: userId },
        select: { name: true, email: true },
    });
    if (!user)
        throw new AppError("User not found", 404);
    const subscription = await prisma.subscriptions.findFirst({
        where: { user_id: userId, status: "active" },
        orderBy: { created_at: "desc" },
        select: { plan: true },
    });
    if (!subscription)
        return;
    const html = subscriptionExpiryTemplate({
        name: user.name,
        days_left: daysLeft,
        plan: subscription.plan,
        frontend_url: FRONTEND_URL,
    });
    await sendEmail(user.email, `Subscription expiring in ${daysLeft} day(s) — CareerForge BD`, html);
};
//# sourceMappingURL=email.service.js.map