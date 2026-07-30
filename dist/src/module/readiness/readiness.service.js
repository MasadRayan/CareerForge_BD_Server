import { prisma } from "../../lib/prisma.js";
const getAtsComponent = async (userId) => {
    const latest = await prisma.analyses.findFirst({
        where: { cv: { user_id: userId } },
        orderBy: { created_at: "desc" },
        select: { ats_score: true },
    });
    return latest?.ats_score ?? 0;
};
const getRoadmapComponent = async (userId) => {
    const active = await prisma.roadmaps.findFirst({
        where: { user_id: userId, status: "active" },
        select: { id: true },
    });
    if (!active)
        return 0;
    const tasks = await prisma.dailyTasks.findMany({
        where: { roadmapWeek: { roadmap_id: active.id } },
        select: { is_completed: true },
    });
    if (tasks.length === 0)
        return 0;
    const completed = tasks.filter((t) => t.is_completed).length;
    return Math.round((completed / tasks.length) * 100);
};
const getInterviewComponent = async (userId) => {
    const [quizAttempts, behavioralAnswers] = await Promise.all([
        prisma.quizAttempts.findMany({
            where: { user_id: userId },
            select: { is_correct: true },
        }),
        prisma.behavioralAnswers.findMany({
            where: { user_id: userId },
            select: { ai_feedback: true },
        }),
    ]);
    const sub_scores = {
        quiz_accuracy: null,
        behavioral_score: null,
    };
    const available = [];
    if (quizAttempts.length > 0) {
        const correct = quizAttempts.filter((a) => a.is_correct).length;
        sub_scores.quiz_accuracy = Math.round((correct / quizAttempts.length) * 100);
        available.push(sub_scores.quiz_accuracy);
    }
    if (behavioralAnswers.length > 0) {
        const scores = [];
        for (const a of behavioralAnswers) {
            const feedback = a.ai_feedback;
            if (feedback && typeof feedback.structure_score === "number") {
                scores.push(feedback.structure_score);
            }
        }
        if (scores.length > 0) {
            const avg = scores.reduce((s, v) => s + v, 0) / scores.length;
            sub_scores.behavioral_score = Math.round((avg / 10) * 100);
            available.push(sub_scores.behavioral_score);
        }
    }
    const interview = available.length > 0
        ? Math.round(available.reduce((s, v) => s + v, 0) / available.length)
        : 0;
    return { score: interview, sub_scores };
};
const calculateScore = async (userId) => {
    const [ats, roadmap, interview] = await Promise.all([
        getAtsComponent(userId),
        getRoadmapComponent(userId),
        getInterviewComponent(userId),
    ]);
    const composite = Math.round(ats * 0.35 + roadmap * 0.35 + interview.score * 0.30);
    const record = await prisma.readinessScores.create({
        data: {
            user_id: userId,
            ats_component: ats,
            roadmap_component: roadmap,
            interview_component: interview.score,
            composite_score: composite,
        },
    });
    return {
        id: record.id,
        ats_component: record.ats_component,
        roadmap_component: record.roadmap_component,
        interview_component: record.interview_component,
        sub_scores: interview.sub_scores,
        composite_score: record.composite_score,
        calculated_at: record.calculated_at,
    };
};
const getHistory = async (userId) => {
    const records = await prisma.readinessScores.findMany({
        where: { user_id: userId },
        orderBy: { calculated_at: "desc" },
        take: 20,
        select: {
            id: true,
            composite_score: true,
            ats_component: true,
            roadmap_component: true,
            interview_component: true,
            calculated_at: true,
        },
    });
    return records;
};
export const readinessService = { calculateScore, getHistory };
//# sourceMappingURL=readiness.service.js.map