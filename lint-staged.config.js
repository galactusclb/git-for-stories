export default {
    'apps/api/**/*.{js,ts}': [
        () => 'pnpm --filter api lint --fix',
        'prettier --write',
    ],
    'apps/web/**/*.{js,ts,tsx}': [
        () => 'pnpm --filter web lint --fix',
        'prettier --write',
    ],
};
