import axios from "axios";
import type { GradeResponse } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";
export const api = axios.create({ 
  baseURL: API_BASE ? `${API_BASE}/api` : '/api', 
  timeout: 60000 
});

export async function fetchModules() { 
  try {
    const r = await api.get("/modules"); 
    return r.data; 
  } catch (error) {
    console.error('Error fetching modules:', error);
    throw error;
  }
}

export async function fetchQuestions(module: string = 'all', seed?: number) {
  try {
    const params: { module: string; seed?: number } = { module };
    if (seed !== undefined) {
      params.seed = seed;
    }
    const r = await api.get('/questions', { params });
    return r.data;
  } catch (error) {
    console.error('Error fetching questions:', error);
    throw error;
  }
}

export async function gradeQuiz(answers: Record<string, number | number[]>, module: string, seed?: number) {
  try {
    const r = await api.post('/grade', {
      answers,
      module,
      seed,
    });
    return r.data as GradeResponse;
  } catch (error) {
    console.error('Error grading quiz:', error);
    throw error;
  }
}

export async function healthCheck() {
  try {
    const r = await api.get('/health');
    return r.data;
  } catch (error) {
    console.error('Error checking health:', error);
    throw error;
  }
}

// Legacy export for backward compatibility
export const quizApi = {
  getModules: fetchModules,
  getQuestions: fetchQuestions,
  gradeQuiz: gradeQuiz,
  healthCheck: healthCheck,
};
