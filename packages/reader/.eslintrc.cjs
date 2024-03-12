module.exports = {
  extends: ['custom/library'],
  overrides: [
    {
      files: ['*.ts'],
      rules: {
        '@typescript-eslint/unbound-method': 'off',
        'jest/unbound-method': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-argument': 'off',
      },
    },
  ],
};
