import api from '@/lib/axios';

export const cvScoringService = {
  score: (resumeId) => api.post(`/cv-scoring/${resumeId}`),

  scoreFile: (file) => {
    const form = new FormData();
    form.append('file', file);
    return api.post('/cv-scoring/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  matchJd: (resumeId, jobId) =>
    api.post('/cv-scoring/match-jd', { resumeId, jobId }),

  matchJdFile: (file, jobId) => {
    const form = new FormData();
    form.append('file', file);
    return api.post(`/cv-scoring/match-jd/upload?jobId=${jobId}`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
