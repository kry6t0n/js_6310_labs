export default {
  testEnvironment: 'node',
  transform: {},
  collectCoverageFrom: [
    'server.js',
    '!**/node_modules/**',
    '!**/tests/**'
  ],
  coverageDirectory: './coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  testTimeout: 10000
};