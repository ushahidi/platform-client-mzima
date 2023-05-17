module.exports = {
  root: true,
  ignorePatterns: ['**/*'],
  plugins: ['@nx'],
  overrides: [
    {
      files: ['*.ts', '*.tsx', '*.js', '*.jsx'],
      settings: {
        'import/extensions': ['.js', '.ts'],
        'import/parsers': {
          '@typescript-eslint/parser': ['.js', '.ts'],
        },
        'import/resolver': {
          node: {
            extensions: ['.js', '.ts'],
          },
        },
      },
      rules: {
        '@nx/enforce-module-boundaries': [
          'error',
          {
            enforceBuildableLibDependency: true,
            allow: ['@capacitor/*'] ,
            depConstraints: [
              {
                sourceTag: '*',
                onlyDependOnLibsWithTags: ['*'],
              },
            ],
          },
        ],
      },
    },
    {
      files: ['*.ts', '*.tsx'],
      extends: [
        'plugin:@nx/typescript',
        'airbnb-typescript/base',
        'plugin:prettier/recommended',
        'prettier',
      ],
      plugins: ['import'],
      rules: {
        'no-unsafe-optional-chaining': 'off',
        'no-case-declarations': 'off',
        'no-useless-escape': 'off',
        'no-prototype-builtins': 'off',
        'no-restricted-syntax': 'off',
        'import/no-unresolved': 'off',
        'import/prefer-default-export': 'off',
        'import/no-extraneous-dependencies': 'off',
        'class-methods-use-this': 'off',
        'lines-between-class-members': 'off',
      },
    },
    {
      files: ['*.js', '*.jsx'],
      extends: ['plugin:@nx/javascript'],
      rules: {},
    },
    {
      files: ['*.spec.ts', '*.spec.tsx', '*.spec.js', '*.spec.jsx'],
      env: {
        jest: true,
      },
      rules: {},
    },
  ],
};
