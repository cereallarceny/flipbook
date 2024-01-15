module.exports = {
  extends: ['custom/library'],
  overrides: [
    {
      files: ['**/*.test.ts'],
      plugins: ['jest'],
      extends: ['plugin:jest/recommended'],
      rules: {
        'jest/prefer-expect-assertions': 'off',
        '@typescript-eslint/dot-notation': 'off',
      },
    },
  ],
};
