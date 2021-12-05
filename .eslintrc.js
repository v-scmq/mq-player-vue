module.exports = {
    root: true,
    env: {node: true, es6: true},

    parserOptions: {
        ecmaVersion: 2020,
        parser: '@typescript-eslint/parser'
    },

    rules: {
        'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
        'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off'
    },

    extends: [
        'plugin:vue/vue3-essential',
        'eslint:recommended',
        '@vue/typescript'
    ]
}
