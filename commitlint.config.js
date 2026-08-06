/** @type {import('@commitlint/types').UserConfig} */
export default {
    extends: ['@commitlint/config-conventional'],
    rules: {
        'scope-enum': [2, 'always', ['api', 'web', 'infra', 'cicd', 'db', 'config', 'deps']],
        'scope-empty': [2, 'never'],
    },
};
