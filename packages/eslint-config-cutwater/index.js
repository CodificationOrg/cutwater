module.exports = {
  extends: [
    'eslint:recommended',
    "plugin:react/recommended",
    'plugin:@typescript-eslint/recommended',
    'prettier'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  settings: {
    react: {
      version: "latest"
    }
  },
  rules: {
    "no-extra-boolean-cast": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-non-null-assertion": "off"
  },
  plugins: ['@typescript-eslint']
}