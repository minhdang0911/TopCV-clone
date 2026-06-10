export const PLAN_LIMITS: Record<string, { cv: number; cl: number }> = {
  FREE: { cv: 6, cl: 6 },
  PRO: { cv: 12, cl: 12 },
  PREMIUM: { cv: 20, cl: 20 },
};

export const PLAN_CONFIG: Record<string, { amount: number; durationMonths: number; label: string }> = {
  PRO: { amount: 50000, durationMonths: 1, label: 'Nâng cấp tài khoản Pro' },
  PREMIUM: { amount: 500000, durationMonths: 12, label: 'Nâng cấp tài khoản Premium' },
};
