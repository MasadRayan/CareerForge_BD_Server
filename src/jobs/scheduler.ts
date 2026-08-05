import cron from "node-cron";
import { streakResetJob } from "./streakReset.job.js";
import { subscriptionExpiryJob } from "./subscriptionExpiry.job.js";
import { refreshW3SchoolsCatalog } from "./w3schools.job.js";

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

  // Weekly at 4 AM: refresh the W3Schools tutorial catalog
  cron.schedule("0 4 * * 1", () => {
    console.log("🕓 Refreshing W3Schools catalog...");
    refreshW3SchoolsCatalog()
      .then((count) => console.log(`✅ W3Schools catalog refreshed (${count} links)`))
      .catch((err) => console.error("❌ W3Schools catalog refresh failed:", err));
  });

  console.log("⏰ Scheduler started — cron jobs registered");
};
