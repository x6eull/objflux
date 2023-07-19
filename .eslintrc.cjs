/*eslint-env node*/
module.exports = {
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': 'warn',
    semi: [1, 'always', { omitLastInOneLineBlock: true }],
    quotes: [1, 'single', { avoidEscape: true }],
    '@typescript-eslint/no-explicit-any': 'off'
  },
};