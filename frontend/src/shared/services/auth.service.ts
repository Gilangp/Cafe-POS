import { authRepository } from '@shared/repositories/auth.repository';

export const authService = {
  login: async (email: string, password: string) => {
    const res = await authRepository.login({ email, password });
    return res.data;
  },
  logout: async () => {
    await authRepository.logout();
  },
  getMe: async () => {
    const res = await authRepository.me();
    return res.data;
  },
};

