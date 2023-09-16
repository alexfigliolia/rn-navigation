module.exports = {
	root: true,
	env: {
		browser: true,
		es2021: true
	},
	ignorePatterns: ["node_modules", ".eslintrc.js", "dist", "jest.config.js", "coverage"],
	extends: [
		"eslint:recommended",
		"plugin:@typescript-eslint/recommended",
		"eslint:recommended",
		"prettier",
		"plugin:@typescript-eslint/recommended-requiring-type-checking",
		"plugin:react-hooks/recommended"
	],
	overrides: [
		{
			files: ["**/*.jsx", "**/*.js", "**/*.ts", "**/*.tsx"],
		},
	],
	parser: "@typescript-eslint/parser",
	parserOptions: {
		ecmaVersion: 12,
		sourceType: "module",
		tsconfigRootDir: __dirname,
		project: "./tsconfig.json",
	},
	plugins: ["simple-import-sort", "@typescript-eslint", "prettier"],
	rules: {
		"radix": 0,
		"no-new": 0,
		"no-void": 0,
		"no-shadow": 0,
		"no-bitwise": 0,
		"no-unused-vars": 0,
		"prettier/prettier": ["error"],
		"linebreak-style": ["error", "unix"],
		"no-prototype-builtins": 0,
		"prefer-rest-params": 0,
		"no-mixed-spaces-and-tabs": 0,
		"react-hooks/rules-of-hooks": "error",
		"react-hooks/exhaustive-deps": "warn",
		"@typescript-eslint/unbound-method": 0,
		"@typescript-eslint/no-unsafe-argument": 0,
		"@typescript-eslint/no-unsafe-return": 0,
		"@typescript-eslint/no-non-null-assertion": 0,
		"@typescript-eslint/no-empty-function": 0,
		"@typescript-eslint/ban-ts-comment": 0,
		"@typescript-eslint/no-var-requires": 0,
		"eslint-comments/no-unlimited-disable": 0,
		"@typescript-eslint/explicit-module-boundary-types": 0,
		"@typescript-eslint/no-explicit-any": 0,
		"@typescript-eslint/no-unsafe-call": 0,
		"@typescript-eslint/no-unused-vars": 1,
		"@typescript-eslint/no-shadow": 0,
		"@typescript-eslint/no-unnecessary-type-constraint": 0,
		"@typescript-eslint/restrict-plus-operands": 0,
		"@typescript-eslint/no-unsafe-assignment": 0,
		"@typescript-eslint/restrict-plus-operands": 2,
		"@typescript-eslint/consistent-type-imports": "error",
		"@typescript-eslint/no-unsafe-member-access": 0,
		"@typescript-eslint/no-floating-promises": [
			"error",
			{ ignoreVoid: true, ignoreIIFE: true },
		],
	},
};