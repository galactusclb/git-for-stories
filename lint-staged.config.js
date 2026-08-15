import path from 'node:path';

export default {
    'apps/api/**/*.{js,ts}': (filenames) => {
        const relative = filenames.map((f) => path.relative('apps/api', f));
        return [
            `pnpm --filter api exec eslint --fix ${relative.join(' ')}`,
            `prettier --write ${filenames.join(' ')}`,
        ];
    },
    'apps/web/**/*.{js,ts,tsx}': (filenames) => {
        const relative = filenames.map((f) => path.relative('apps/web', f));
        return [
            `pnpm --filter web exec eslint --fix ${relative.join(' ')}`,
            `prettier --write ${filenames.join(' ')}`,
        ];
    },
};
