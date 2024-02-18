const { resolve } = require('node:path');

const rootDir = resolve(process.cwd());

module.exports = {
  verbose: true,
  preset: 'ts-jest',
  testEnvironment: 'jest-environment-jsdom',
  rootDir: rootDir,
  transform: {
    '^.+\\.test.ts?$': [
      'ts-jest',
      {
        useESM: true,
      },
    ],
  },
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  testPathIgnorePatterns: [
    `${rootDir}/node_modules`,
    `${rootDir}/coverage`,
    `${rootDir}/dist`,
    `${rootDir}/build`,
  ],
  collectCoverageFrom: ['**/*.ts', '!**/node_modules/**'],
  collectCoverage: true,
  coverageDirectory: `${rootDir}/coverage`,
  coveragePathIgnorePatterns: [
    `${rootDir}/node_modules`,
    `${rootDir}/coverage`,
    `${rootDir}/dist`,
    `${rootDir}/build`,
    `${rootDir}/test`,
  ],
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80,
    },
  },
};
