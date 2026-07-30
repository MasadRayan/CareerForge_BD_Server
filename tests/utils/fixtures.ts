export const sampleUser = {
  id: "user-1",
  name: "Test User",
  email: "test@example.com",
  role: "free_user" as const,
  target_role: "fullstack",
  experience_level: "mid",
  created_at: new Date("2025-01-01"),
  updated_at: new Date("2025-01-01"),
};

export const sampleQuizQuestion = {
  id: "q-1",
  role_category: "frontend",
  question_text: "What does HTML stand for?",
  options: {
    a: "HyperText Markup Language",
    b: "High Text Machine Language",
    c: "HyperText Machine Link",
    d: "Hyper Transfer Markup Language",
  },
  correct_answer: "a",
  difficulty: "easy" as const,
};

export const sampleQuizQuestions = [
  sampleQuizQuestion,
  {
    id: "q-2",
    role_category: "frontend",
    question_text: "What does CSS stand for?",
    options: {
      a: "Creative Style Sheets",
      b: "Cascading Style Sheets",
      c: "Coloured Style Scripts",
      d: "Computer Style System",
    },
    correct_answer: "b",
    difficulty: "easy" as const,
  },
  {
    id: "q-3",
    role_category: "backend",
    question_text: "What does SQL stand for?",
    options: {
      a: "Structured Query Language",
      b: "Sequential Query Logic",
      c: "Simple Queue Language",
      d: "Standard Query Library",
    },
    correct_answer: "a",
    difficulty: "easy" as const,
  },
];

export const sampleAttempt = {
  id: "attempt-1",
  question_id: "q-1",
  user_id: "user-1",
  selected_answer: "a",
  is_correct: true,
  attempted_at: new Date(),
};

export const mockToken = "mock-firebase-token";
