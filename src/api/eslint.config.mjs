import neostandard from 'neostandard'

export default [
  ...neostandard({
    files: ['src/api/**/*.js'],
    env: ['node', 'jest'],
    ignores: ['**/coverage', '**/data', '**/node_modules'],
  }),
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    rules: {
      '@stylistic/comma-dangle': ['error', 'always-multiline'],
      '@stylistic/space-before-function-paren': ['error', {
        anonymous: 'always',
        named: 'never',
        asyncArrow: 'always',
      }],
      'brace-style': ['error', '1tbs', {
        allowSingleLine: false,
      }],
      curly: ['error', 'all'],
      'prefer-destructuring': ['error', {
        array: true,
        object: true,
      }, {
        enforceForRenamedProperties: true,
      }],
      quotes: ['error', 'single'],
    },
  },
]
