// Flat config equivalent of the existing .eslintrc.json to support ESLint v9+
export default [
  {
    ignores: [
      'node_modules/',
      'coverage/',
      'dist/',
      '*.test.js',
      '*.spec.js',
      '__tests__/',
      'jest.config.mjs',
      'start.js',
      'eslint.config.js'
    ]
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module'
    },
    rules: {
      'indent': ['error', 2],
      'linebreak-style': ['error', 'windows'],
      'quotes': ['error', 'single', { allowTemplateLiterals: true }],
      'semi': ['error', 'always'],
      'no-console': 'warn',
      'no-unused-vars': 'error'
    }
  },
  // Relax some stylistic rules for test files and mocks to avoid noise
  {
    files: ['**/tests/**', '**/*.test.js', '**/*.spec.js'],
    rules: {
      indent: 'off'
    }
  }
];
