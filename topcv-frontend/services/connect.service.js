import api from '@/lib/axios';

export const connectService = {
    // Employer
    getSuggestions: (params) => api.get('/connect/suggestions', { params }),
    skip: (candidateUserId) => api.post(`/connect/skip/${candidateUserId}`),
    request: (candidateUserId) => api.post(`/connect/request/${candidateUserId}`),
    getSent: (params) => api.get('/connect/sent', { params }),

    // Candidate
    getMyRequests: (params) => api.get('/connect/my-requests', { params }),
    accept: (connectId) => api.post(`/connect/accept/${connectId}`),
    reject: (connectId) => api.post(`/connect/reject/${connectId}`),
    getProfileViewers: (params) => api.get('/connect/profile-viewers', { params }),

    // Employer records view when expanding a candidate card
    recordView: (candidateUserId) => api.post(`/connect/view/${candidateUserId}`),

    // Employer fetches full candidate profile detail
    getCandidateDetail: (candidateUserId) => api.get(`/connect/candidate/${candidateUserId}`),
};
