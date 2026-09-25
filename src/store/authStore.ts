import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthCredentials } from '../types/api';

type AuthState = {
    credentials: AuthCredentials | null;
    isAuthenticated: boolean;
    setCredentials: (credentials: AuthCredentials) => void;
    logout: () => void;
};

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            credentials: null,
            isAuthenticated: false,
            setCredentials: (credentials) => set({ credentials, isAuthenticated: true }),
            logout: () => set({ credentials: null, isAuthenticated: false }),
        }),
        {
            name: 'green-api-auth', // ключ в localStorage
        }
    )
);