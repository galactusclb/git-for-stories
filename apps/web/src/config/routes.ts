export const ROUTES = {
    home: '/',
    login: '/login',
    create: '/create',
    dashboard: '/dashboard',
    post: (id: string) => `/posts/${id}`,
} as const;

export const PROTECTED_ROUTES = [ROUTES.create, ROUTES.dashboard] as const;

export const AUTH_ROUTES = [ROUTES.login] as const;
