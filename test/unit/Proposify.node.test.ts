/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { Proposify } from '../../nodes/Proposify/Proposify.node';

describe('Proposify Node', () => {
	let proposifyNode: Proposify;

	beforeEach(() => {
		proposifyNode = new Proposify();
	});

	describe('Node Description', () => {
		it('should have the correct display name', () => {
			expect(proposifyNode.description.displayName).toBe('Proposify');
		});

		it('should have the correct name', () => {
			expect(proposifyNode.description.name).toBe('proposify');
		});

		it('should have the correct version', () => {
			expect(proposifyNode.description.version).toBe(1);
		});

		it('should require proposifyApi credentials', () => {
			const credentials = proposifyNode.description.credentials;
			expect(credentials).toBeDefined();
			expect(credentials).toHaveLength(1);
			expect(credentials![0].name).toBe('proposifyApi');
			expect(credentials![0].required).toBe(true);
		});

		it('should have the correct group', () => {
			expect(proposifyNode.description.group).toContain('transform');
		});
	});

	describe('Resource Options', () => {
		it('should have all required resources', () => {
			const resourceProperty = proposifyNode.description.properties.find(
				(p) => p.name === 'resource'
			);
			expect(resourceProperty).toBeDefined();
			expect(resourceProperty!.type).toBe('options');

			const options = resourceProperty!.options as Array<{ name: string; value: string }>;
			const resourceValues = options.map((o) => o.value);

			expect(resourceValues).toContain('proposal');
			expect(resourceValues).toContain('template');
			expect(resourceValues).toContain('prospect');
			expect(resourceValues).toContain('contact');
			expect(resourceValues).toContain('section');
			expect(resourceValues).toContain('fee');
			expect(resourceValues).toContain('signature');
			expect(resourceValues).toContain('comment');
			expect(resourceValues).toContain('user');
			expect(resourceValues).toContain('analytics');
		});

		it('should have 10 resources', () => {
			const resourceProperty = proposifyNode.description.properties.find(
				(p) => p.name === 'resource'
			);
			const options = resourceProperty!.options as Array<{ name: string; value: string }>;
			expect(options).toHaveLength(10);
		});
	});

	describe('Proposal Operations', () => {
		it('should have all proposal operations', () => {
			const operationProperty = proposifyNode.description.properties.find(
				(p) => p.name === 'operation' && p.displayOptions?.show?.resource?.includes('proposal')
			);
			expect(operationProperty).toBeDefined();

			const options = operationProperty!.options as Array<{ name: string; value: string }>;
			const operationValues = options.map((o) => o.value);

			expect(operationValues).toContain('get');
			expect(operationValues).toContain('getAll');
			expect(operationValues).toContain('create');
			expect(operationValues).toContain('update');
			expect(operationValues).toContain('delete');
			expect(operationValues).toContain('duplicate');
			expect(operationValues).toContain('send');
			expect(operationValues).toContain('archive');
			expect(operationValues).toContain('restore');
			expect(operationValues).toContain('getMetrics');
			expect(operationValues).toContain('getContent');
			expect(operationValues).toContain('updateContent');
			expect(operationValues).toContain('downloadPdf');
			expect(operationValues).toContain('setWon');
			expect(operationValues).toContain('setLost');
		});
	});

	describe('Template Operations', () => {
		it('should have all template operations', () => {
			const operationProperty = proposifyNode.description.properties.find(
				(p) => p.name === 'operation' && p.displayOptions?.show?.resource?.includes('template')
			);
			expect(operationProperty).toBeDefined();

			const options = operationProperty!.options as Array<{ name: string; value: string }>;
			const operationValues = options.map((o) => o.value);

			expect(operationValues).toContain('get');
			expect(operationValues).toContain('getAll');
			expect(operationValues).toContain('create');
			expect(operationValues).toContain('update');
			expect(operationValues).toContain('delete');
			expect(operationValues).toContain('duplicate');
			expect(operationValues).toContain('getContent');
			expect(operationValues).toContain('updateContent');
			expect(operationValues).toContain('getSections');
			expect(operationValues).toContain('getVariables');
		});
	});

	describe('Prospect Operations', () => {
		it('should have all prospect operations', () => {
			const operationProperty = proposifyNode.description.properties.find(
				(p) => p.name === 'operation' && p.displayOptions?.show?.resource?.includes('prospect')
			);
			expect(operationProperty).toBeDefined();

			const options = operationProperty!.options as Array<{ name: string; value: string }>;
			const operationValues = options.map((o) => o.value);

			expect(operationValues).toContain('get');
			expect(operationValues).toContain('getAll');
			expect(operationValues).toContain('create');
			expect(operationValues).toContain('update');
			expect(operationValues).toContain('delete');
			expect(operationValues).toContain('getProposals');
			expect(operationValues).toContain('merge');
		});
	});

	describe('Analytics Operations', () => {
		it('should have all analytics operations', () => {
			const operationProperty = proposifyNode.description.properties.find(
				(p) => p.name === 'operation' && p.displayOptions?.show?.resource?.includes('analytics')
			);
			expect(operationProperty).toBeDefined();

			const options = operationProperty!.options as Array<{ name: string; value: string }>;
			const operationValues = options.map((o) => o.value);

			expect(operationValues).toContain('getProposalViews');
			expect(operationValues).toContain('getViewerDetails');
			expect(operationValues).toContain('getEngagement');
			expect(operationValues).toContain('getPageViews');
			expect(operationValues).toContain('getTimeSpent');
			expect(operationValues).toContain('getDeviceInfo');
			expect(operationValues).toContain('exportReport');
		});
	});
});
