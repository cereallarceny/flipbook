module.exports = {
  extends: ['custom/library'],
  overrides: [
    {
      files: ['*test.ts'],
      rules: {
        '@typescript-eslint/unbound-method': 'off',
        'jest/unbound-method': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
      },
    },
  ],
};
