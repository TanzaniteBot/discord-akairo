//@ts-check
import eslint from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
//@ts-expect-error: no types
import importPlugin from "eslint-plugin-import";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
	eslint.configs.recommended,
	tseslint.configs.recommended,
	eslintConfigPrettier,
	importPlugin.flatConfigs.recommended,
	importPlugin.flatConfigs.typescript,
	{
		languageOptions: {
			globals: {
				...globals.node
			},

			ecmaVersion: 13,
			sourceType: "module",
			parserOptions: { project: "./tsconfig.eslint.json" }
		},

		rules: {
			"no-await-in-loop": "off",
			"no-template-curly-in-string": "error",
			"no-unsafe-negation": "error",
			"accessor-pairs": "warn",
			"array-callback-return": "error",
			complexity: ["warn", 25],
			"consistent-return": "error",
			eqeqeq: ["error", "smart"],
			"no-console": "warn",
			"no-empty-function": "off",
			"no-implied-eval": "error",
			"no-lone-blocks": "error",
			"no-new-func": "error",
			"no-new-wrappers": "error",
			"no-new": "error",
			"no-octal-escape": "error",
			"no-return-assign": "error",
			"no-return-await": "off",
			"no-self-compare": "error",
			"no-sequences": "error",
			"no-unmodified-loop-condition": "error",
			"no-unused-expressions": "error",
			"no-useless-call": "error",
			"no-useless-concat": "error",
			"no-useless-escape": "error",
			"no-useless-return": "error",
			"no-void": "error",
			"no-warning-comments": "warn",
			"require-await": "warn",
			yoda: "error",
			"no-label-var": "error",
			"no-undef-init": "error",
			"callback-return": "error",
			"handle-callback-err": "error",
			"no-mixed-requires": "error",
			"no-new-require": "error",
			"no-path-concat": "error",
			"func-names": "error",
			"func-name-matching": "error",

			"func-style": [
				"error",
				"declaration",
				{
					allowArrowFunctions: true
				}
			],

			"max-depth": ["error", 7],

			"max-nested-callbacks": [
				"error",
				{
					max: 4
				}
			],

			"max-statements-per-line": [
				"error",
				{
					max: 2
				}
			],

			"new-cap": "off",
			"no-array-constructor": "error",
			"no-inline-comments": "off",
			"no-lonely-if": "error",
			"no-new-object": "error",
			"no-spaced-func": "error",
			"no-unneeded-ternary": "error",
			"operator-assignment": "error",
			"spaced-comment": "error",
			"no-duplicate-imports": "error",
			"no-useless-computed-key": "error",
			"no-useless-constructor": "error",
			"prefer-const": "error",
			"prefer-arrow-callback": "error",
			"prefer-numeric-literals": "error",
			"prefer-rest-params": "error",
			"prefer-spread": "error",
			"prefer-template": "error",
			"no-throw-literal": "off",
			"@typescript-eslint/only-throw-error": "error",
			"@typescript-eslint/no-explicit-any": "off",
			"@typescript-eslint/ban-ts-comment": "off",
			"@typescript-eslint/explicit-module-boundary-types": "off",
			"no-shadow": "off",
			"@typescript-eslint/no-shadow": "error",
			"@typescript-eslint/prefer-namespace-keyword": "off",
			"@typescript-eslint/no-namespace": "off",
			"@typescript-eslint/no-inferrable-types": "off",
			"@typescript-eslint/no-empty-function": "off",
			"@typescript-eslint/no-non-null-assertion": "off",
			"@typescript-eslint/no-deprecated": "warn",

			"@typescript-eslint/explicit-member-accessibility": [
				"warn",
				{
					accessibility: "explicit"
				}
			],

			"@typescript-eslint/switch-exhaustiveness-check": "warn",
			"consistent-this": ["error", "$this"],

			"@typescript-eslint/no-this-alias": [
				"error",
				{
					allowedNames: ["$this"]
				}
			],

			"import/no-unresolved": "off",
			"import/extensions": ["error", "ignorePackages"],
			"import/no-cycle": "error",

			"@typescript-eslint/no-unused-vars": [
				"warn",
				{
					varsIgnorePattern: "^_"
				}
			],

			"@typescript-eslint/no-unsafe-declaration-merging": "off",

			"@typescript-eslint/consistent-type-imports": [
				"warn",
				{
					prefer: "type-imports",
					fixStyle: "inline-type-imports"
				}
			]
		}
	}
);
