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
	const feeId = this.getNodeParameter('feeId', index) as string;
	const response = await proposifyApiRequest.call(this, 'GET', `/proposals/${proposalId}/fees/${feeId}`);
	return [{ json: response }];
}

export async function getAll(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const proposalId = this.getNodeParameter('proposalId', index) as string;
	const returnAll = this.getNodeParameter('returnAll', index) as boolean;

	if (returnAll) {
		const items = await proposifyApiRequestAllItems.call(this, 'GET', `/proposals/${proposalId}/fees`);
		return toExecutionData(items);
	}

	const limit = this.getNodeParameter('limit', index) as number;
	const response = await proposifyApiRequest.call(this, 'GET', `/proposals/${proposalId}/fees`, {}, { limit });
	return toExecutionData((response.data as IDataObject[]) || []);
}

export async function create(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const proposalId = this.getNodeParameter('proposalId', index) as string;
	const name = this.getNodeParameter('name', index) as string;
	const unitPrice = this.getNodeParameter('unitPrice', index) as number;
	const additionalFields = this.getNodeParameter('additionalFields', index, {}) as IDataObject;

	const body: IDataObject = {
		name,
		unit_price: unitPrice,
	};

	if (additionalFields.description) body.description = additionalFields.description;
	if (additionalFields.quantity !== undefined) body.quantity = additionalFields.quantity;
	if (additionalFields.discount !== undefined) body.discount = additionalFields.discount;
	if (additionalFields.tax !== undefined) body.tax = additionalFields.tax;
	if (additionalFields.isOptional !== undefined) body.is_optional = additionalFields.isOptional;

	const response = await proposifyApiRequest.call(this, 'POST', `/proposals/${proposalId}/fees`, body);
	return [{ json: response }];
}

export async function update(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const proposalId = this.getNodeParameter('proposalId', index) as string;
	const feeId = this.getNodeParameter('feeId', index) as string;
	const updateFields = this.getNodeParameter('updateFields', index, {}) as IDataObject;

	const body: IDataObject = {};

	if (updateFields.name) body.name = updateFields.name;
	if (updateFields.description) body.description = updateFields.description;
	if (updateFields.unitPrice !== undefined) body.unit_price = updateFields.unitPrice;
	if (updateFields.quantity !== undefined) body.quantity = updateFields.quantity;
	if (updateFields.discount !== undefined) body.discount = updateFields.discount;
	if (updateFields.tax !== undefined) body.tax = updateFields.tax;
	if (updateFields.isOptional !== undefined) body.is_optional = updateFields.isOptional;

	const response = await proposifyApiRequest.call(this, 'PUT', `/proposals/${proposalId}/fees/${feeId}`, body);
	return [{ json: response }];
}

export async function deleteFee(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const proposalId = this.getNodeParameter('proposalId', index) as string;
	const feeId = this.getNodeParameter('feeId', index) as string;
	await proposifyApiRequest.call(this, 'DELETE', `/proposals/${proposalId}/fees/${feeId}`);
	return [{ json: { success: true, proposalId, feeId } }];
}

export async function reorder(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const proposalId = this.getNodeParameter('proposalId', index) as string;
	const feeIds = this.getNodeParameter('feeIds', index) as string;

	const body: IDataObject = {
		fee_ids: feeIds.split(',').map((id) => id.trim()),
	};

	const response = await proposifyApiRequest.call(this, 'POST', `/proposals/${proposalId}/fees/reorder`, body);
	return [{ json: response }];
}

export async function calculate(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const proposalId = this.getNodeParameter('proposalId', index) as string;
	const response = await proposifyApiRequest.call(this, 'POST', `/proposals/${proposalId}/fees/calculate`);
	return [{ json: response }];
}

export const feeOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['fee'] } },
		options: [
			{ name: 'Calculate', value: 'calculate', description: 'Recalculate fee totals', action: 'Calculate fees' },
			{ name: 'Create', value: 'create', description: 'Add fee item to proposal', action: 'Create a fee' },
			{ name: 'Delete', value: 'delete', description: 'Remove fee from proposal', action: 'Delete a fee' },
			{ name: 'Get', value: 'get', description: 'Get fee details', action: 'Get a fee' },
			{ name: 'Get Many', value: 'getAll', description: 'Get fee tables in proposal', action: 'Get many fees' },
			{ name: 'Reorder', value: 'reorder', description: 'Reorder fee items', action: 'Reorder fees' },
			{ name: 'Update', value: 'update', description: 'Update fee details', action: 'Update a fee' },
		],
		default: 'get',
	},
];

export const feeFields: INodeProperties[] = [
	{
		displayName: 'Proposal ID',
		name: 'proposalId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['fee'], operation: ['get', 'getAll', 'create', 'update', 'delete', 'reorder', 'calculate'] } },
		description: 'The proposal containing the fees',
	},
	{
		displayName: 'Fee ID',
		name: 'feeId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['fee'], operation: ['get', 'update', 'delete'] } },
		description: 'The unique identifier of the fee',
	},
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: { show: { resource: ['fee'], operation: ['getAll'] } },
		description: 'Whether to return all results or only up to a given limit',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		default: 50,
		typeOptions: { minValue: 1, maxValue: 100 },
		displayOptions: { show: { resource: ['fee'], operation: ['getAll'], returnAll: [false] } },
		description: 'Max number of results to return',
	},
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['fee'], operation: ['create'] } },
		description: 'The name of the fee item',
	},
	{
		displayName: 'Unit Price',
		name: 'unitPrice',
		type: 'number',
		required: true,
		default: 0,
		typeOptions: { numberPrecision: 2 },
		displayOptions: { show: { resource: ['fee'], operation: ['create'] } },
		description: 'The unit price of the fee item',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['fee'], operation: ['create'] } },
		options: [
			{ displayName: 'Description', name: 'description', type: 'string', default: '', description: 'Fee description' },
			{ displayName: 'Discount', name: 'discount', type: 'number', typeOptions: { numberPrecision: 2 }, default: 0, description: 'Discount percentage or amount' },
			{ displayName: 'Is Optional', name: 'isOptional', type: 'boolean', default: false, description: 'Whether the fee is optional' },
			{ displayName: 'Quantity', name: 'quantity', type: 'number', default: 1, description: 'Quantity of the item' },
			{ displayName: 'Tax', name: 'tax', type: 'number', typeOptions: { numberPrecision: 2 }, default: 0, description: 'Tax rate' },
		],
	},
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['fee'], operation: ['update'] } },
		options: [
			{ displayName: 'Description', name: 'description', type: 'string', default: '', description: 'Fee description' },
			{ displayName: 'Discount', name: 'discount', type: 'number', typeOptions: { numberPrecision: 2 }, default: 0, description: 'Discount percentage or amount' },
			{ displayName: 'Is Optional', name: 'isOptional', type: 'boolean', default: false, description: 'Whether the fee is optional' },
			{ displayName: 'Name', name: 'name', type: 'string', default: '', description: 'Fee name' },
			{ displayName: 'Quantity', name: 'quantity', type: 'number', default: 1, description: 'Quantity of the item' },
			{ displayName: 'Tax', name: 'tax', type: 'number', typeOptions: { numberPrecision: 2 }, default: 0, description: 'Tax rate' },
			{ displayName: 'Unit Price', name: 'unitPrice', type: 'number', typeOptions: { numberPrecision: 2 }, default: 0, description: 'Unit price' },
		],
	},
	{
		displayName: 'Fee IDs',
		name: 'feeIds',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['fee'], operation: ['reorder'] } },
		description: 'Comma-separated list of fee IDs in the desired order',
	},
];
