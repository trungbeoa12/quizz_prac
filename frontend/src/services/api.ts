import axios from 'axios';
import { Question, GradeResponse } from '../types';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const quizApi = {
  // Get available modules
  getModules: async () => {
    const response = await api.get('/modules');
    return response.data;
  },

  // Get questions with optional module filter and seed
  getQuestions: async (module: string = 'all', seed?: number) => {
    const params: { module: string; seed?: number } = { module };
    if (seed !== undefined) {
      params.seed = seed;
    }
    
    const response = await api.get('/questions', { params });
    return response.data;
  },

  // Grade the quiz
  gradeQuiz: async (answers: Record<string, number | number[]>, module: string, seed?: number) => {
    const response = await api.post('/grade', {
      answers,
      module,
      seed,
    });
    return response.data as GradeResponse;
  },

  // Health check
  healthCheck: async () => {
    const response = await api.get('/health');
    return response.data;
  },
};
