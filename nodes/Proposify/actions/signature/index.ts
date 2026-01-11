/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IDataObject, IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { proposifyApiRequest, proposifyApiRequestAllItems } from '../../transport';
import { toExecutionData } from '../../utils/helpers';

export async function get(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const proposalId = this.getNodeParameter('proposalId', index) as string;
	const signatureId = this.getNodeParameter('signatureId', index) as string;
	const response = await proposifyApiRequest.call(this, 'GET', `/proposals/${proposalId}/signatures/${signatureId}`);
	return [{ json: response }];
}

export async function getAll(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const proposalId = this.getNodeParameter('proposalId', index) as string;
	const returnAll = this.getNodeParameter('returnAll', index) as boolean;

	if (returnAll) {
		const items = await proposifyApiRequestAllItems.call(this, 'GET', `/proposals/${proposalId}/signatures`);
		return toExecutionData(items);
	}

	const limit = this.getNodeParameter('limit', index) as number;
	const response = await proposifyApiRequest.call(this, 'GET', `/proposals/${proposalId}/signatures`, {}, { limit });
	return toExecutionData((response.data as IDataObject[]) || []);
}

export async function create(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const proposalId = this.getNodeParameter('proposalId', index) as string;
	const signerId = this.getNodeParameter('signerId', index) as string;
	const additionalFields = this.getNodeParameter('additionalFields', index, {}) as IDataObject;

	const body: IDataObject = { signer_id: signerId };

	if (additionalFields.order !== undefined) body.order = additionalFields.order;

	const response = await proposifyApiRequest.call(this, 'POST', `/proposals/${proposalId}/signatures`, body);
	return [{ json: response }];
}

export async function update(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const proposalId = this.getNodeParameter('proposalId', index) as string;
	const signatureId = this.getNodeParameter('signatureId', index) as string;
	const updateFields = this.getNodeParameter('updateFields', index, {}) as IDataObject;

	const body: IDataObject = {};

	if (updateFields.signerId) body.signer_id = updateFields.signerId;
	if (updateFields.order !== undefined) body.order = updateFields.order;

	const response = await proposifyApiRequest.call(this, 'PUT', `/proposals/${proposalId}/signatures/${signatureId}`, body);
	return [{ json: response }];
}

export async function deleteSignature(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const proposalId = this.getNodeParameter('proposalId', index) as string;
	const signatureId = this.getNodeParameter('signatureId', index) as string;
	await proposifyApiRequest.call(this, 'DELETE', `/proposals/${proposalId}/signatures/${signatureId}`);
	return [{ json: { success: true, proposalId, signatureId } }];
}

export async function getStatus(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const proposalId = this.getNodeParameter('proposalId', index) as string;
	const signatureId = this.getNodeParameter('signatureId', index) as string;
	const response = await proposifyApiRequest.call(this, 'GET', `/proposals/${proposalId}/signatures/${signatureId}/status`);
	return [{ json: response }];
}

export async function sendReminder(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const proposalId = this.getNodeParameter('proposalId', index) as string;
	const signatureId = this.getNodeParameter('signatureId', index) as string;
	const additionalFields = this.getNodeParameter('additionalFields', index, {}) as IDataObject;

	const body: IDataObject = {};
	if (additionalFields.message) body.message = additionalFields.message;

	const response = await proposifyApiRequest.call(this, 'POST', `/proposals/${proposalId}/signatures/${signatureId}/remind`, body);
	return [{ json: response }];
}

export async function revoke(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const proposalId = this.getNodeParameter('proposalId', index) as string;
	const signatureId = this.getNodeParameter('signatureId', index) as string;
	const response = await proposifyApiRequest.call(this, 'POST', `/proposals/${proposalId}/signatures/${signatureId}/revoke`);
	return [{ json: response }];
}

export const signatureOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['signature'] } },
		options: [
			{ name: 'Create', value: 'create', description: 'Add signature field', action: 'Create a signature' },
			{ name: 'Delete', value: 'delete', description: 'Remove signature field', action: 'Delete a signature' },
			{ name: 'Get', value: 'get', description: 'Get signature details', action: 'Get a signature' },
			{ name: 'Get Many', value: 'getAll', description: 'List signatures on proposal', action: 'Get many signatures' },
			{ name: 'Get Status', value: 'getStatus', description: 'Get signing status', action: 'Get signature status' },
			{ name: 'Revoke', value: 'revoke', description: 'Revoke signature request', action: 'Revoke signature' },
			{ name: 'Send Reminder', value: 'sendReminder', description: 'Send signing reminder', action: 'Send signature reminder' },
			{ name: 'Update', value: 'update', description: 'Update signature settings', action: 'Update a signature' },
		],
		default: 'get',
	},
];

export const signatureFields: INodeProperties[] = [
	{
		displayName: 'Proposal ID',
		name: 'proposalId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['signature'], operation: ['get', 'getAll', 'create', 'update', 'delete', 'getStatus', 'sendReminder', 'revoke'] } },
		description: 'The proposal containing the signatures',
	},
	{
		displayName: 'Signature ID',
		name: 'signatureId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['signature'], operation: ['get', 'update', 'delete', 'getStatus', 'sendReminder', 'revoke'] } },
		description: 'The unique identifier of the signature',
	},
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: { show: { resource: ['signature'], operation: ['getAll'] } },
		description: 'Whether to return all results or only up to a given limit',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		default: 50,
		typeOptions: { minValue: 1, maxValue: 100 },
		displayOptions: { show: { resource: ['signature'], operation: ['getAll'], returnAll: [false] } },
		description: 'Max number of results to return',
	},
	{
		displayName: 'Signer ID',
		name: 'signerId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['signature'], operation: ['create'] } },
		description: 'The contact ID of the person who should sign',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['signature'], operation: ['create'] } },
		options: [
			{ displayName: 'Order', name: 'order', type: 'number', default: 1, description: 'Signing order (for sequential signing)' },
		],
	},
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['signature'], operation: ['update'] } },
		options: [
			{ displayName: 'Order', name: 'order', type: 'number', default: 1, description: 'Signing order' },
			{ displayName: 'Signer ID', name: 'signerId', type: 'string', default: '', description: 'Contact ID of the signer' },
		],
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['signature'], operation: ['sendReminder'] } },
		options: [
			{ displayName: 'Message', name: 'message', type: 'string', typeOptions: { rows: 4 }, default: '', description: 'Custom reminder message' },
		],
	},
];
