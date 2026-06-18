import api from '@/lib/axios';

export const quizService = {
  // Employer — Quiz CRUD
  create: (data) => api.post('/quiz', data),
  list: () => api.get('/quiz'),
  getOne: (id) => api.get(`/quiz/${id}`),
  update: (id, data) => api.patch(`/quiz/${id}`, data),
  remove: (id) => api.delete(`/quiz/${id}`),

  // Questions
  addQuestion: (quizId, data) => api.post(`/quiz/${quizId}/questions`, data),
  updateQuestion: (questionId, data) => api.patch(`/quiz/questions/${questionId}`, data),
  deleteQuestion: (questionId) => api.delete(`/quiz/questions/${questionId}`),
  reorderQuestions: (quizId, orders) => api.patch(`/quiz/${quizId}/questions/reorder`, { orders }),

  // Image uploads
  uploadQuestionImage: (questionId, file) => {
    const form = new FormData();
    form.append('file', file);
    return api.post(`/quiz/questions/${questionId}/upload`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  uploadOptionImage: (optionId, file) => {
    const form = new FormData();
    form.append('file', file);
    return api.post(`/quiz/options/${optionId}/upload`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },

  // Assignments (send to candidates)
  assign: (quizId, data) => api.post(`/quiz/${quizId}/assign`, data),
  getAssignments: (quizId) => api.get(`/quiz/${quizId}/assignments`),

  // Candidate
  getCandidateAssignments: () => api.get('/quiz/candidate/assignments'),
  startAttempt: (assignmentId) => api.post(`/quiz/attempt/start/${assignmentId}`),
  submitAttempt: (attemptId, answers) => api.post(`/quiz/attempt/${attemptId}/submit`, { answers }),
  getResult: (attemptId) => api.get(`/quiz/attempt/${attemptId}/result`),
};
