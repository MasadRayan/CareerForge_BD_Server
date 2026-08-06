const createMockModel = () => ({
  findUnique: jest.fn(),
  findMany: jest.fn(),
  findFirst: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  upsert: jest.fn(),
  delete: jest.fn(),
  count: jest.fn(),
  findUniqueOrThrow: jest.fn(),
  aggregate: jest.fn(),
  groupBy: jest.fn(),
});

export const mockPrisma = {
  users: createMockModel(),
  quizQuestions: createMockModel(),
  quizAttempts: createMockModel(),
  analyses: createMockModel(),
  roadmaps: createMockModel(),
  roadmapWeeks: createMockModel(),
  dailyTasks: createMockModel(),
  resources: createMockModel(),
  subscriptions: createMockModel(),
  transactions: createMockModel(),
  cVs: createMockModel(),
  jobDescriptions: createMockModel(),
  readinessScores: createMockModel(),
  behavioralQuestions: createMockModel(),
  behavioralAnswers: createMockModel(),
  codingProblems: createMockModel(),
  codeSubmissions: createMockModel(),
  usageQuotas: createMockModel(),
  streaks: createMockModel(),
  systemLogs: createMockModel(),
  w3schoolsLinks: createMockModel(),
  bdjobsJobs: createMockModel(),
  reportedIssues: createMockModel(),
  $queryRaw: jest.fn(),
  $disconnect: jest.fn(),
  $connect: jest.fn(),
  $transaction: jest.fn(),
};

export const resetPrismaMocks = (): void => {
  for (const model of Object.values(mockPrisma)) {
    if (typeof model === "object" && model !== null) {
      for (const method of Object.values(model as Record<string, unknown>)) {
        if (typeof method === "function" && jest.isMockFunction(method)) {
          method.mockReset();
        }
      }
    }
  }
};
