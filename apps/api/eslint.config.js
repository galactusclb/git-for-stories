import tseslint from 'typescript-eslint';
import boundaries from "eslint-plugin-boundaries";
import importX from 'eslint-plugin-import-x';

export default tseslint.config(tseslint.configs.recommended, {
    files: ['src/**/*.ts'],
    plugins: {
        boundaries,
        'import-x': importX,
    },
    settings: {
        "boundaries/elements": [
            {
                type: "feature",
                pattern: "src/features/*",
                mode: "folder",
                capture: ["elementName"],
            },
        ]
    },
    rules: {
        'boundaries/dependencies': [
            'error',
            {
                // disallow all cross-element imports by default
                default: "disallow",
                rules: [
                    {
                        // ✅ features can import their local files
                        from: { type: "feature" },
                        allow: {
                            to: { type: "feature", captured: { elementName: "{{ elementName }}" } },
                        },
                    },
                ]
            }
        ],
        "no-restricted-imports": ["error", {
            patterns: [
                {
                    // Force feature access through the barrel (@/features/<name>),
                    // block deep paths like @/features/post/post.service
                    group: ["@/features/*/**"],
                    message: "Import features through their barrel (@/features/<name>), not deep paths.",
                },
            ],
        }],
        'import-x/order': [
            'warn',
            {
                groups: [
                    'builtin',
                    'external',
                    'internal',
                    'parent',
                    'sibling',
                    'index',
                    'object',
                    'type',
                ],
                pathGroups: [{ pattern: '@/**', group: 'internal', position: 'after' }],
                pathGroupsExcludedImportTypes: ['builtin'],
                'newlines-between': 'always',
                alphabetize: { order: 'asc', caseInsensitive: true },
            },
        ],
        'import-x/no-restricted-paths': [
            'error',
            {
                zones: [
                    // route → cannot skip to service or repository
                    {
                        target: './src/features/**/*.route.ts',
                        from: './src/features/**/*.service.ts',
                        message:
                            'Routes must not import services directly. Go through a controller.',
                    },
                    {
                        target: './src/features/**/*.route.ts',
                        from: './src/features/**/*.repository.ts',
                        message: 'Routes must not import repositories directly.',
                    },

                    // controller → cannot skip to repository
                    {
                        target: './src/features/**/*.controller.ts',
                        from: './src/features/**/*.repository.ts',
                        message:
                            'Controllers must not import repositories directly. Go through a service.',
                    },

                    // service → no upward imports
                    {
                        target: './src/features/**/*.service.ts',
                        from: './src/features/**/*.route.ts',
                        message: 'Services must not import from routes.',
                    },
                    {
                        target: './src/features/**/*.service.ts',
                        from: './src/features/**/*.controller.ts',
                        message: 'Services must not import from controllers.',
                    },

                    // repository → nothing above it
                    {
                        target: './src/features/**/*.repository.ts',
                        from: './src/features/**/*.route.ts',
                        message: 'Repositories are the bottom layer — no upward imports allowed.',
                    },
                    {
                        target: './src/features/**/*.repository.ts',
                        from: './src/features/**/*.controller.ts',
                        message: 'Repositories are the bottom layer — no upward imports allowed.',
                    },
                    {
                        target: './src/features/**/*.repository.ts',
                        from: './src/features/**/*.service.ts',
                        message: 'Repositories are the bottom layer — no upward imports allowed.',
                    },
                ],
            },
        ],

        '@typescript-eslint/no-unused-vars': [
            'error',
            {
                argsIgnorePattern: '^_',
                varsIgnorePattern: '^_',
            },
        ],
    },
    ignores : ['dist/**']
});
