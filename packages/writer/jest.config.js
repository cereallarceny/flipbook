const sharedConfig = require('jest-config');

module.exports = {
  ...sharedConfig,
  coverageThreshold: {
    global: {
      functions: 65,
      lines: 80,
      statements: 80,
    },
  },
};
