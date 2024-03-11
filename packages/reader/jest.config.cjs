const sharedConfig = require('jest-config');

module.exports = { ...sharedConfig, setupFiles: ['jest-canvas-mock'] };
