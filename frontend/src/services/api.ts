import axios from "axios";
import type { GradeResponse } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";
export const api = axios.create({ baseURL: `${API_BASE}/api`, timeout: 60000 });

export async function fetchModules() { 
  const r = await api.get("/modules"); 
  return r.data; 
}

export async function fetchQuestions(module: string = 'all', seed?: number) {
  const params: { module: string; seed?: number } = { module };
  if (seed !== undefined) {
    params.seed = seed;
  }
  const r = await api.get('/questions', { params });
  return r.data;
}

export async function gradeQuiz(answers: Record<string, number | number[]>, module: string, seed?: number) {
  const r = await api.post('/grade', {
    answers,
    module,
    seed,
  });
  return r.data as GradeResponse;
}

export async function healthCheck() {
  const r = await api.get('/health');
  return r.data;
}

// Legacy export for backward compatibility
export const quizApi = {
  getModules: fetchModules,
  getQuestions: fetchQuestions,
  gradeQuiz: gradeQuiz,
  healthCheck: healthCheck,
};
