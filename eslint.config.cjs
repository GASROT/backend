const tseslint = require('typescript-eslint');

module.exports = tseslint.config(
  {
    ignores: ['coverage/**', 'dist/**', 'dist-prisma/**', 'node_modules/**'],
  },
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.ts', 'test/**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
);
