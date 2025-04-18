import neostandard, { plugins } from 'neostandard'

export default [
  ...neostandard({
    files: ['src/client/**/*.js'],
    env: ['node', 'browser', 'jest'],
    ignores: ['**/coverage', '**/node_modules', 'public/dist'],
  }),
  plugins.react.configs.flat.recommended,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    plugins: {
      react: plugins.react,
    },
    rules: {
      '@stylistic/comma-dangle': ['error', 'always-multiline'],
      '@stylistic/jsx-closing-bracket-location': [1, {
        nonEmpty: 'tag-aligned',
        selfClosing: 'line-aligned',
      }],
      '@stylistic/jsx-quotes': ['error', 'prefer-double'],
      '@stylistic/multiline-ternary': 'off',
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
      'react/prop-types': ['error', {
        ignore: ['location', 'query', 'code'],
      }],
    },
  },
]
