import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import globals from "globals";

export default [
    {
        ignores: ["dist/", "node_modules/"],
    },

    js.configs.recommended,
    eslintConfigPrettier,

    {
        files: ["**/*.js"],

        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",

            globals: {
                ...globals.browser,
            },
        },

        rules: {
            "no-unused-vars": "warn",
        },
    },
];
