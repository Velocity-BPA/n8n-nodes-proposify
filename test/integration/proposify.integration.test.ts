/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * Integration tests for n8n-nodes-proposify
 *
 * These tests verify the integration between node components.
 * For full API integration tests, configure PROPOSIFY_API_KEY environment variable.
 *
 * Run with: npm run test:integration
 */

import { Proposify } from '../../nodes/Proposify/Proposify.node';
import { ProposifyTrigger } from '../../nodes/Proposify/ProposifyTrigger.node';
import { ProposifyApi } from '../../credentials/ProposifyApi.credentials';

describe('Proposify Integration Tests', () => {
	describe('Node and Credential Integration', () => {
		it('should use the correct credential name in main node', () => {
			const node = new Proposify();
			const credentials = new ProposifyApi();

			const nodeCredentials = node.description.credentials;
			expect(nodeCredentials).toBeDefined();
			expect(nodeCredentials![0].name).toBe(credentials.name);
		});

		it('should use the correct credential name in trigger node', () => {
			const trigger = new ProposifyTrigger();
			const credentials = new ProposifyApi();

			const triggerCredentials = trigger.description.credentials;
			expect(triggerCredentials).toBeDefined();
			expect(triggerCredentials![0].name).toBe(credentials.name);
		});
	});

	describe('Resource and Operation Coverage', () => {
		const node = new Proposify();

		const expectedResources = [
			{ resource: 'proposal', minOperations: 15 },
			{ resource: 'template', minOperations: 10 },
			{ resource: 'prospect', minOperations: 7 },
			{ resource: 'contact', minOperations: 7 },
			{ resource: 'section', minOperations: 8 },
			{ resource: 'fee', minOperations: 7 },
			{ resource: 'signature', minOperations: 8 },
			{ resource: 'comment', minOperations: 7 },
			{ resource: 'user', minOperations: 5 },
			{ resource: 'analytics', minOperations: 7 },
		];

		expectedResources.forEach(({ resource, minOperations }) => {
			it(`should have at least ${minOperations} operations for ${resource}`, () => {
				const operationProperty = node.description.properties.find(
					(p) =>
						p.name === 'operation' &&
						p.displayOptions?.show?.resource?.includes(resource)
				);

				expect(operationProperty).toBeDefined();
				const options = operationProperty!.options as Array<{ value: string }>;
				expect(options.length).toBeGreaterThanOrEqual(minOperations);
			});
		});
	});

	describe('Trigger Event Coverage', () => {
		const trigger = new ProposifyTrigger();

		const expectedEvents = [
			'proposal.created',
			'proposal.sent',
			'proposal.viewed',
			'proposal.won',
			'proposal.lost',
			'proposal.expired',
			'signature.completed',
			'signature.declined',
			'comment.added',
			'prospect.created',
			'fee.accepted',
			'fee.declined',
		];

		expectedEvents.forEach((event) => {
			it(`should support ${event} event`, () => {
				const eventProperty = trigger.description.properties.find(
					(p) => p.name === 'event'
				);
				const options = eventProperty!.options as Array<{ value: string }>;
				const eventValues = options.map((o) => o.value);

				expect(eventValues).toContain(event);
			});
		});
	});

	describe('Icon Configuration', () => {
		it('should use SVG icon in main node', () => {
			const node = new Proposify();
			expect(node.description.icon).toBe('file:proposify.svg');
		});

		it('should use SVG icon in trigger node', () => {
			const trigger = new ProposifyTrigger();
			expect(trigger.description.icon).toBe('file:proposify.svg');
		});
	});

	describe('Node Metadata', () => {
		it('should have valid subtitle for main node', () => {
			const node = new Proposify();
			expect(node.description.subtitle).toBeDefined();
			expect(node.description.subtitle).toContain('resource');
			expect(node.description.subtitle).toContain('operation');
		});

		it('should have valid subtitle for trigger node', () => {
			const trigger = new ProposifyTrigger();
			expect(trigger.description.subtitle).toBeDefined();
			expect(trigger.description.subtitle).toContain('event');
		});
	});
});
