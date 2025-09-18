export interface Question {
  id: string;
  module: string;
  text: string;
  options: string[];
}

export interface QuizResult {
  questionId: string;
  userAnswer: number[]; // indexes selected by user
  correctAnswer: number[]; // indexes of all correct options
  isCorrect: boolean;
  explanation: string;
  questionText: string;
  options: string[];
}

export interface GradeResponse {
  score: number;
  total: number;
  percentage: number;
  results: QuizResult[];
}

export interface Module {
  name: string;
  id: string;
}
