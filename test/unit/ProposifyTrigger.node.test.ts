/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { ProposifyTrigger } from '../../nodes/Proposify/ProposifyTrigger.node';

describe('ProposifyTrigger Node', () => {
	let triggerNode: ProposifyTrigger;

	beforeEach(() => {
		triggerNode = new ProposifyTrigger();
	});

	describe('Node Description', () => {
		it('should have the correct display name', () => {
			expect(triggerNode.description.displayName).toBe('Proposify Trigger');
		});

		it('should have the correct name', () => {
			expect(triggerNode.description.name).toBe('proposifyTrigger');
		});

		it('should have the correct version', () => {
			expect(triggerNode.description.version).toBe(1);
		});

		it('should be in the trigger group', () => {
			expect(triggerNode.description.group).toContain('trigger');
		});

		it('should require proposifyApi credentials', () => {
			const credentials = triggerNode.description.credentials;
			expect(credentials).toBeDefined();
			expect(credentials).toHaveLength(1);
			expect(credentials![0].name).toBe('proposifyApi');
			expect(credentials![0].required).toBe(true);
		});

		it('should have no inputs', () => {
			expect(triggerNode.description.inputs).toEqual([]);
		});

		it('should have one output', () => {
			expect(triggerNode.description.outputs).toEqual(['main']);
		});
	});

	describe('Webhook Configuration', () => {
		it('should have webhook configured', () => {
			expect(triggerNode.description.webhooks).toBeDefined();
			expect(triggerNode.description.webhooks).toHaveLength(1);
		});

		it('should use POST method', () => {
			const webhook = triggerNode.description.webhooks![0];
			expect(webhook.httpMethod).toBe('POST');
		});

		it('should respond on received', () => {
			const webhook = triggerNode.description.webhooks![0];
			expect(webhook.responseMode).toBe('onReceived');
		});
	});

	describe('Event Options', () => {
		it('should have all required events', () => {
			const eventProperty = triggerNode.description.properties.find((p) => p.name === 'event');
			expect(eventProperty).toBeDefined();
			expect(eventProperty!.type).toBe('options');

			const options = eventProperty!.options as Array<{ name: string; value: string }>;
			const eventValues = options.map((o) => o.value);

			// Proposal events
			expect(eventValues).toContain('proposal.created');
			expect(eventValues).toContain('proposal.sent');
			expect(eventValues).toContain('proposal.viewed');
			expect(eventValues).toContain('proposal.won');
			expect(eventValues).toContain('proposal.lost');
			expect(eventValues).toContain('proposal.expired');

			// Signature events
			expect(eventValues).toContain('signature.completed');
			expect(eventValues).toContain('signature.declined');

			// Other events
			expect(eventValues).toContain('comment.added');
			expect(eventValues).toContain('prospect.created');
			expect(eventValues).toContain('fee.accepted');
			expect(eventValues).toContain('fee.declined');
		});

		it('should have 12 event options', () => {
			const eventProperty = triggerNode.description.properties.find((p) => p.name === 'event');
			const options = eventProperty!.options as Array<{ name: string; value: string }>;
			expect(options).toHaveLength(12);
		});

		it('should default to proposal.created event', () => {
			const eventProperty = triggerNode.description.properties.find((p) => p.name === 'event');
			expect(eventProperty!.default).toBe('proposal.created');
		});
	});

	describe('Webhook Methods', () => {
		it('should have webhook methods defined', () => {
			expect(triggerNode.webhookMethods).toBeDefined();
			expect(triggerNode.webhookMethods.default).toBeDefined();
		});

		it('should have checkExists method', () => {
			expect(triggerNode.webhookMethods.default.checkExists).toBeDefined();
			expect(typeof triggerNode.webhookMethods.default.checkExists).toBe('function');
		});

		it('should have create method', () => {
			expect(triggerNode.webhookMethods.default.create).toBeDefined();
			expect(typeof triggerNode.webhookMethods.default.create).toBe('function');
		});

		it('should have delete method', () => {
			expect(triggerNode.webhookMethods.default.delete).toBeDefined();
			expect(typeof triggerNode.webhookMethods.default.delete).toBe('function');
		});
	});

	describe('Options', () => {
		it('should have options property', () => {
			const optionsProperty = triggerNode.description.properties.find(
				(p) => p.name === 'options'
			);
			expect(optionsProperty).toBeDefined();
			expect(optionsProperty!.type).toBe('collection');
		});

		it('should include webhook secret option', () => {
			const optionsProperty = triggerNode.description.properties.find(
				(p) => p.name === 'options'
			);
			const options = optionsProperty!.options as Array<{ name: string }>;
			const secretOption = options.find((o) => o.name === 'webhookSecret');
			expect(secretOption).toBeDefined();
		});
	});
});
