/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
	IHookFunctions,
	IWebhookFunctions,
	IDataObject,
	INodeType,
	INodeTypeDescription,
	IWebhookResponseData,
	NodeApiError,
	JsonObject,
} from 'n8n-workflow';

import * as crypto from 'crypto';

export class ProposifyTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Proposify Trigger',
		name: 'proposifyTrigger',
		icon: 'file:proposify.svg',
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["event"]}}',
		description: 'Starts the workflow when Proposify events occur',
		defaults: {
			name: 'Proposify Trigger',
		},
		inputs: [],
		outputs: ['main'],
		credentials: [
			{
				name: 'proposifyApi',
				required: true,
			},
		],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'webhook',
			},
		],
		properties: [
			{
				displayName: 'Event',
				name: 'event',
				type: 'options',
				noDataExpression: true,
				required: true,
				default: 'proposal.created',
				options: [
					{
						name: 'Comment Added',
						value: 'comment.added',
						description: 'Triggered when a new comment is added to a proposal',
					},
					{
						name: 'Fee Accepted',
						value: 'fee.accepted',
						description: 'Triggered when a fee item is accepted by prospect',
					},
					{
						name: 'Fee Declined',
						value: 'fee.declined',
						description: 'Triggered when an optional fee is declined',
					},
					{
						name: 'Proposal Created',
						value: 'proposal.created',
						description: 'Triggered when a new proposal is created',
					},
					{
						name: 'Proposal Expired',
						value: 'proposal.expired',
						description: 'Triggered when a proposal expires',
					},
					{
						name: 'Proposal Lost',
						value: 'proposal.lost',
						description: 'Triggered when a proposal is marked as lost',
					},
					{
						name: 'Proposal Sent',
						value: 'proposal.sent',
						description: 'Triggered when a proposal is sent to prospect',
					},
					{
						name: 'Proposal Viewed',
						value: 'proposal.viewed',
						description: 'Triggered when a proposal is viewed by recipient',
					},
					{
						name: 'Proposal Won',
						value: 'proposal.won',
						description: 'Triggered when a proposal is marked as won',
					},
					{
						name: 'Prospect Created',
						value: 'prospect.created',
						description: 'Triggered when a new prospect is created',
					},
					{
						name: 'Signature Completed',
						value: 'signature.completed',
						description: 'Triggered when all signatures are collected',
					},
					{
						name: 'Signature Declined',
						value: 'signature.declined',
						description: 'Triggered when a signature is declined',
					},
				],
			},
			{
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				options: [
					{
						displayName: 'Webhook Secret',
						name: 'webhookSecret',
						type: 'string',
						typeOptions: {
							password: true,
						},
						default: '',
						description: 'Secret key for verifying webhook signatures (optional but recommended)',
					},
				],
			},
		],
	};

	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				const webhookUrl = this.getNodeWebhookUrl('default');
				const event = this.getNodeParameter('event') as string;
				const credentials = await this.getCredentials('proposifyApi');

				try {
					const response = await this.helpers.request({
						method: 'GET',
						uri: 'https://api.proposify.com/v1/webhooks',
						headers: {
							'Authorization': `Bearer ${credentials.apiKey}`,
							'Content-Type': 'application/json',
						},
						json: true,
					});

					if (response.data && Array.isArray(response.data)) {
						for (const webhook of response.data) {
							if (webhook.url === webhookUrl && webhook.event === event) {
								const webhookData = this.getWorkflowStaticData('node');
								webhookData.webhookId = webhook.id;
								return true;
							}
						}
					}
				} catch (error) {
					// Webhook endpoint might not exist yet
					return false;
				}

				return false;
			},

			async create(this: IHookFunctions): Promise<boolean> {
				const webhookUrl = this.getNodeWebhookUrl('default');
				const event = this.getNodeParameter('event') as string;
				const options = this.getNodeParameter('options') as IDataObject;
				const credentials = await this.getCredentials('proposifyApi');

				const body: IDataObject = {
					url: webhookUrl,
					event: event,
					active: true,
				};

				if (options.webhookSecret) {
					body.secret = options.webhookSecret;
				}

				try {
					const response = await this.helpers.request({
						method: 'POST',
						uri: 'https://api.proposify.com/v1/webhooks',
						headers: {
							'Authorization': `Bearer ${credentials.apiKey}`,
							'Content-Type': 'application/json',
						},
						body,
						json: true,
					});

					if (response.data?.id) {
						const webhookData = this.getWorkflowStaticData('node');
						webhookData.webhookId = response.data.id;
						return true;
					}

					return false;
				} catch (error) {
					throw new NodeApiError(this.getNode(), error as unknown as JsonObject);
				}
			},

			async delete(this: IHookFunctions): Promise<boolean> {
				const webhookData = this.getWorkflowStaticData('node');
				const credentials = await this.getCredentials('proposifyApi');

				if (webhookData.webhookId) {
					try {
						await this.helpers.request({
							method: 'DELETE',
							uri: `https://api.proposify.com/v1/webhooks/${webhookData.webhookId}`,
							headers: {
								'Authorization': `Bearer ${credentials.apiKey}`,
								'Content-Type': 'application/json',
							},
							json: true,
						});
					} catch (error) {
						// Webhook might already be deleted
						return false;
					}

					delete webhookData.webhookId;
				}

				return true;
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const req = this.getRequestObject();
		const body = this.getBodyData() as IDataObject;
		const options = this.getNodeParameter('options') as IDataObject;

		// Verify webhook signature if secret is configured
		if (options.webhookSecret) {
			const signature = req.headers['x-proposify-signature'] as string;
			
			if (signature) {
				const payload = JSON.stringify(body);
				const expectedSignature = crypto
					.createHmac('sha256', options.webhookSecret as string)
					.update(payload)
					.digest('hex');

				if (signature !== expectedSignature) {
					return {
						webhookResponse: {
							status: 401,
							body: { error: 'Invalid signature' },
						},
					};
				}
			}
		}

		// Extract relevant data from the webhook payload
		const webhookData: IDataObject = {
			event: body.event || this.getNodeParameter('event'),
			timestamp: body.timestamp || new Date().toISOString(),
			data: body.data || body,
		};

		// Add proposal data if present
		if (body.proposal) {
			webhookData.proposal = body.proposal;
		}

		// Add prospect data if present
		if (body.prospect) {
			webhookData.prospect = body.prospect;
		}

		// Add signature data if present
		if (body.signature) {
			webhookData.signature = body.signature;
		}

		// Add comment data if present
		if (body.comment) {
			webhookData.comment = body.comment;
		}

		// Add fee data if present
		if (body.fee) {
			webhookData.fee = body.fee;
		}

		return {
			workflowData: [this.helpers.returnJsonArray([webhookData])],
		};
	}
}
