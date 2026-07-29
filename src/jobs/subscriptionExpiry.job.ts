import { prisma } from "../lib/prisma.js";
import { sendSubscriptionExpiry } from "../module/notification/email.service.js";

export const subscriptionExpiryJob = async (): Promise<void> => {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const in7Days = new Date(todayStart);
  in7Days.setDate(in7Days.getDate() + 7);
  const in1Day = new Date(todayStart);
  in1Day.setDate(in1Day.getDate() + 1);

  // ─── Expire subscriptions that have passed ─────────────────
  const expired = await prisma.subscriptions.updateMany({
    where: { status: "active", expires_at: { lt: todayStart } },
    data: { status: "expired" },
  });

  if (expired.count > 0) {
    // Downgrade expired users to free_user
    const expiredSubs = await prisma.subscriptions.findMany({
      where: { status: "expired", expires_at: { lt: todayStart } },
      select: { user_id: true },
    });
    const expiredUserIds = [...new Set(expiredSubs.map((s) => s.user_id))];
    for (const userId of expiredUserIds) {
      await prisma.users.update({
        where: { id: userId },
        data: { role: "free_user" },
      }).catch(() => {});
    }
    console.log(`⏰ Subscription expiry: ${expired.count} subscription(s) expired, ${expiredUserIds.length} user(s) downgraded`);
  }

  // ─── Send 7-day warning ────────────────────────────────────
  // Find subscriptions expiring in exactly 7 days
  const expiringIn7Days = await prisma.subscriptions.findMany({
    where: {
      status: "active",
      expires_at: { gte: in7Days, lt: new Date(in7Days.getTime() + 86400000) },
    },
    select: { user_id: true },
  });

  for (const sub of expiringIn7Days) {
    try {
      await sendSubscriptionExpiry(sub.user_id, 7);
    } catch (err) {
      console.error(`⚠️ Failed to send 7-day expiry email to ${sub.user_id}:`, err);
    }
  }

  // ─── Send 1-day warning ────────────────────────────────────
  const expiringIn1Day = await prisma.subscriptions.findMany({
    where: {
      status: "active",
      expires_at: { gte: in1Day, lt: new Date(in1Day.getTime() + 86400000) },
    },
    select: { user_id: true },
  });

  for (const sub of expiringIn1Day) {
    try {
      await sendSubscriptionExpiry(sub.user_id, 1);
    } catch (err) {
      console.error(`⚠️ Failed to send 1-day expiry email to ${sub.user_id}:`, err);
    }
  }

  const totalWarnings = expiringIn7Days.length + expiringIn1Day.length;
  if (totalWarnings > 0) {
    console.log(`📧 Subscription expiry warnings: ${totalWarnings} email(s) sent (${expiringIn7Days.length} at 7 days, ${expiringIn1Day.length} at 1 day)`);
  }
};
