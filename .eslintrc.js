// File: alabflow-spa/.eslintrc.js
module.exports = {
    env: {
        browser: true,
        es2021: true,
        node: true,
        mocha: true,
        'cypress/globals': true
    },
    plugins: [
        'cypress',
        'react-hooks' // Dodaj plugin react-hooks
    ],
    extends: [
        'plugin:cypress/recommended',
        'plugin:react-hooks/recommended' // Dodaj zalecane reguły react-hooks
    ],
    rules: {
        'no-undef': 'off'
    }
};
