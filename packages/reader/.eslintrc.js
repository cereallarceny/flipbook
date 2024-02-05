module.exports = {
  extends: ['custom/library'],
  overrides: [
    {
      files: ['*test.ts'],
      rules: {
        '@typescript-eslint/unbound-method': 'off',
        'jest/unbound-method': 'off',
      },
    },
  ],
};
