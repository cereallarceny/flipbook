module.exports = {
  extends: ['custom/library'],
  overrides: [
    {
      files: ['**/*.test.ts'],
      plugins: ['jest'],
      extends: ['plugin:jest/recommended'],
      rules: {
        'jest/prefer-expect-assertions': 'off',
        'eslint-comments/require-description': [
          'error',
          { ignore: ['eslint-disable-next-line'] },
        ],
      },
    },
  ],
};
