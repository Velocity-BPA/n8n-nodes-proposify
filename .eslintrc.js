module.exports = {
	root: true,
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaVersion: 2019,
		sourceType: 'module',
		project: './tsconfig.json',
	},
	plugins: ['@typescript-eslint', 'n8n-nodes-base'],
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:n8n-nodes-base/community',
	],
	env: {
		node: true,
		es6: true,
	},
	rules: {
		'@typescript-eslint/no-explicit-any': 'off',
		'@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
		'@typescript-eslint/explicit-function-return-type': 'off',
		'@typescript-eslint/explicit-module-boundary-types': 'off',
		'n8n-nodes-base/node-param-description-missing-final-period': 'off',
		'n8n-nodes-base/node-param-description-wrong-for-dynamic-options': 'off',
		'n8n-nodes-base/node-param-description-boolean-without-whether': 'off',
		'n8n-nodes-base/node-param-display-name-miscased': 'off',
		'n8n-nodes-base/node-class-description-missing-subtitle': 'off',
		'no-console': 'warn',
	},
	ignorePatterns: ['dist/**', 'node_modules/**', '*.js'],
};
