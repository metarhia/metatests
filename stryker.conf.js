'use strict';

module.exports = config => {
  config.set({
    mutator: 'javascript',
    packageManager: 'npm',
    reporters: ['html', 'clear-text', 'progress'],
    testRunner: 'command',
    commandRunner: { command: 'npm run test:unit' },
    transpilers: [],
    coverageAnalysis: 'all',
    mutate: ['lib/*.js', '!lib/speed.js', '!lib/report.js', '!lib/utils.js'],
  });
};
