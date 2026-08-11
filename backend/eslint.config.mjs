import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig(
  {
    ignores: ['dist/**', 'coverage/**'],
  },
  {
    files: ['src/**/*.ts'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
    ],
    rules: {
      '@typescript-eslint/no-namespace': ['error', { allowDeclarations: true }],
    },
  },
);
