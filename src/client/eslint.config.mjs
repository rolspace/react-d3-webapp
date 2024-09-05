import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import react from "eslint-plugin-react";
import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default [{
    ignores: ["**/coverage", "**/node_modules", "public/dist"],
}, ...compat.extends("plugin:react/recommended", "standard"), {
    plugins: {
        react,
    },

    languageOptions: {
        globals: {
            ...globals.browser,
            ...globals.node,
            ...globals.jest,
        },

        ecmaVersion: "latest",
        sourceType: "module",
    },

    settings: {
        react: {
            version: "detect",
        },
    },

    rules: {
        "brace-style": ["error", "1tbs", {
            allowSingleLine: false,
        }],

        "comma-dangle": ["error", "always-multiline"],
        curly: ["error", "all"],
        "multiline-ternary": "off",

        "prefer-destructuring": ["error", {
            array: true,
            object: true,
        }, {
            enforceForRenamedProperties: true,
        }],

        quotes: ["error", "single"],

        "react/prop-types": ["error", {
            ignore: ["location", "query", "code"],
        }],

        "space-before-function-paren": ["error", {
            anonymous: "always",
            named: "never",
            asyncArrow: "always",
        }],
    },
}];
