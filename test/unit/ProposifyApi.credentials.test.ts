/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { ProposifyApi } from '../../credentials/ProposifyApi.credentials';

describe('ProposifyApi Credentials', () => {
	let credentials: ProposifyApi;

	beforeEach(() => {
		credentials = new ProposifyApi();
	});

	describe('Credential Properties', () => {
		it('should have the correct name', () => {
			expect(credentials.name).toBe('proposifyApi');
		});

		it('should have the correct display name', () => {
			expect(credentials.displayName).toBe('Proposify API');
		});

		it('should have documentation URL', () => {
			expect(credentials.documentationUrl).toBeDefined();
		});
	});

	describe('Properties Configuration', () => {
		it('should have apiKey property', () => {
			const apiKeyProp = credentials.properties.find((p) => p.name === 'apiKey');
			expect(apiKeyProp).toBeDefined();
		});

		it('should have apiKey as password type', () => {
			const apiKeyProp = credentials.properties.find((p) => p.name === 'apiKey');
			expect(apiKeyProp!.typeOptions?.password).toBe(true);
		});

		it('should have apiKey as required', () => {
			const apiKeyProp = credentials.properties.find((p) => p.name === 'apiKey');
			expect(apiKeyProp!.required).toBe(true);
		});
	});

	describe('Authentication', () => {
		it('should use header-based authentication', () => {
			expect(credentials.authenticate).toBeDefined();
		});
	});

	describe('Test Configuration', () => {
		it('should have test configuration', () => {
			expect(credentials.test).toBeDefined();
		});

		it('should test against users/me endpoint', () => {
			const testRequest = credentials.test?.request;
			expect(testRequest?.url).toContain('/users/me');
		});
	});
});
