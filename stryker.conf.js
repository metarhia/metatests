'use strict';

module.exports = {
  packageManager: 'npm',
  reporters: ['html', 'clear-text', 'progress'],
  testRunner: 'command',
  commandRunner: { command: 'npm run test:unit' },
  coverageAnalysis: 'all',
  mutate: ['lib/*.js', '!lib/speed.js', '!lib/report.js', '!lib/utils.js'],
};
