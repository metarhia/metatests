'use strict';

const init = require('eslint-config-metarhia');

module.exports = [
  ...init,
  {
    files: ['**/*.js'],
    rules: {
      'class-methods-use-this': 'off',
    },
  },
  {
    files: ['**/*.mjs'],
    languageOptions: {
      sourceType: 'module',
    },
  },
  {
    files: ['**/*.cjs'],
    rules: {
      strict: 'off',
    },
  },
];
