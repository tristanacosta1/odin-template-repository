import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";

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
                window: "readonly",
                document: "readonly",
                console: "readonly",
            },
        },

        rules: {
            "no-unused-vars": "warn",
        },
    },
];
