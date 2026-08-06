export const userQueries = {
    myPosts: {
        key: () => ['users', 'me', 'posts'] as const,
        endpoint: '/posts',
    },
};
