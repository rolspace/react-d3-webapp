module.exports = {
  env: {
    es2021: true,
    jest: true,
    node: true,
  },
  extends: ['standard'],
  parserOptions: {
    ecmaVersion: 2021,
  },
  plugins: ['jest'],
  rules: {
    'brace-style': ['error', '1tbs', { allowSingleLine: false }],
    'comma-dangle': ['error', 'always-multiline'],
    curly: ['error', 'all'],
    'prefer-destructuring': 'error',
    quotes: ['error', 'single'],
    'space-before-function-paren': [
      'error',
      { anonymous: 'always', named: 'never', asyncArrow: 'always' },
    ],
  },
}
