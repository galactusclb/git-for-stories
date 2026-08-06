export const authQueries = {
    me: {
        key: () => ['me'] as const,
        endpoint: '/auth/me',
    },
};
