import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import { type User } from '@/models/user.schema';

type AuthState = {
    user: User | null;
    isLoading: boolean;
    setUser: (user: User) => void;
    clearUser: () => void;
    setLoading: (loading: boolean) => void;
};

export const useAuthStore = create<AuthState>()(
    devtools(
        (set) => ({
            user: null,
            isLoading: true,
            setUser: (user) => set({ user }, false, 'setUser'),
            clearUser: () => set({ user: null }, false, 'clearUser'),
            setLoading: (isLoading) => set({ isLoading }, false, 'setLoading'),
        }),
        { name: 'AuthStore', trace: true, traceLimit: 25 }
    )
);
