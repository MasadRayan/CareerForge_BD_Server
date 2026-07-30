import { prisma } from "../lib/prisma.js";
export const streakResetJob = async () => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 1);
    cutoff.setHours(0, 0, 0, 0);
    const result = await prisma.streaks.updateMany({
        where: { last_active_date: { lt: cutoff }, current_streak: { gt: 0 } },
        data: { current_streak: 0 },
    });
    if (result.count > 0) {
        console.log(`🧹 Streak reset: ${result.count} user(s) had their streak reset to 0`);
    }
};
//# sourceMappingURL=streakReset.job.js.map