module.exports = {
  // extends: [require.resolve('@umijs/fabric/dist/eslint')],
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2015
  },
  rules: {
    'import/no-extraneous-dependencies': 0,
    'import/no-unresolved': 0,
    'import/no-useless-constructor': 0,
  },
};
