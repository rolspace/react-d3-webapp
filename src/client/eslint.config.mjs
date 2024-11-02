import react from 'eslint-plugin-react'
import globals from 'globals'
import neostandard from 'neostandard'

export default [
  ...neostandard(),
  {
    ignores: ['**/coverage', '**/node_modules', 'public/dist'],
  },
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest,
      },
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    plugins: {
      react,
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
