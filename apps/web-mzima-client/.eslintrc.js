module.exports = {
  extends: ['../../.eslintrc.js'],
  ignorePatterns: ['!**/*'],
  overrides: [
    {
      files: ['*.ts'],
      parserOptions: {
        project: ['apps/web-mzima-client/tsconfig.json'],
        createDefaultProgram: true,
      },
      extends: [
        'plugin:@nrwl/nx/angular',
        'plugin:@angular-eslint/template/process-inline-templates',
        'plugin:@angular-eslint/recommended',
      ],
      rules: {
        '@angular-eslint/directive-selector': [
          'error',
          {
            type: 'attribute',
            prefix: 'app',
            style: 'camelCase',
          },
        ],
        '@angular-eslint/component-selector': [
          'error',
          {
            type: 'element',
            prefix: 'app',
            style: 'kebab-case',
          },
        ],
        '@typescript-eslint/no-unused-expressions': 'off',
        '@typescript-eslint/lines-between-class-members': 'off',
        '@typescript-eslint/dot-notation': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/ban-ts-comment': 'off',
        '@typescript-eslint/member-ordering': 'off',
        '@typescript-eslint/no-non-null-asserted-optional-chain': 'off',
      },
    },
    {
      files: ['*.html'],
      extends: ['plugin:@nrwl/nx/angular-template'],
      rules: {},
    },
  ],
};
