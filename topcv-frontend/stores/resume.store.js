import { create } from 'zustand';

const DEFAULT_CONTENT = {
    personalInfo: {
        fullName: '',
        title: '',
        email: '',
        phone: '',
        address: '',
        website: '',
        linkedin: '',
        github: '',
        avatarUrl: null,
    },
    objective: '',
    experiences: [],
    education: [],
    skills: [],
    certifications: [],
    languages: [],
    activities: [],
};

const useResumeStore = create((set, get) => ({
    resume: null,
    isDirty: false,
    saving: false,

    setResume: (resume) => set({ resume, isDirty: false }),

    updateContent: (path, value) => {
        const { resume } = get();
        if (!resume) return;
        const content = { ...resume.content };
        const keys = path.split('.');
        let obj = content;
        for (let i = 0; i < keys.length - 1; i++) {
            obj[keys[i]] = { ...obj[keys[i]] };
            obj = obj[keys[i]];
        }
        obj[keys[keys.length - 1]] = value;
        set({ resume: { ...resume, content }, isDirty: true });
    },

    updateMeta: (data) => {
        const { resume } = get();
        if (!resume) return;
        set({ resume: { ...resume, ...data }, isDirty: true });
    },

    setSaving: (saving) => set({ saving }),

    reset: () => set({ resume: null, isDirty: false, saving: false }),

    getDefaultContent: () => DEFAULT_CONTENT,
}));

export default useResumeStore;
