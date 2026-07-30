import cron from "node-cron";
import { streakResetJob } from "./streakReset.job.js";
import { subscriptionExpiryJob } from "./subscriptionExpiry.job.js";

export const startScheduler = (): void => {
  // Daily at midnight: reset stale streaks
  cron.schedule("0 0 * * *", () => {
    console.log("🕛 Running streak reset job...");
    streakResetJob().catch((err) =>
      console.error("❌ Streak reset job failed:", err),
    );
  });

  // Daily at 6 AM: expire subscriptions + send warnings
  cron.schedule("0 6 * * *", () => {
    console.log("🕕 Running subscription expiry job...");
    subscriptionExpiryJob().catch((err) =>
      console.error("❌ Subscription expiry job failed:", err),
    );
  });

  console.log("⏰ Scheduler started — cron jobs registered");
};
