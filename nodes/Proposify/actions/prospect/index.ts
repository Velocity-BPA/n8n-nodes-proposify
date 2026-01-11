/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IDataObject, IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { proposifyApiRequest, proposifyApiRequestAllItems } from '../../transport';
import { toExecutionData, parseFilters, processAdditionalFields } from '../../utils/helpers';

export async function get(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const prospectId = this.getNodeParameter('prospectId', index) as string;
	const response = await proposifyApiRequest.call(this, 'GET', `/prospects/${prospectId}`);
	return [{ json: response }];
}

export async function getAll(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const returnAll = this.getNodeParameter('returnAll', index) as boolean;
	const filters = this.getNodeParameter('filters', index, {}) as IDataObject;
	const query = parseFilters(filters);

	if (returnAll) {
		const items = await proposifyApiRequestAllItems.call(this, 'GET', '/prospects', {}, query);
		return toExecutionData(items);
	}

	const limit = this.getNodeParameter('limit', index) as number;
	query.limit = limit;
	const response = await proposifyApiRequest.call(this, 'GET', '/prospects', {}, query);
	return toExecutionData((response.data as IDataObject[]) || []);
}

export async function create(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const email = this.getNodeParameter('email', index) as string;
	const additionalFields = this.getNodeParameter('additionalFields', index, {}) as IDataObject;

	const body: IDataObject = { email };

	if (additionalFields.firstName) body.first_name = additionalFields.firstName;
	if (additionalFields.lastName) body.last_name = additionalFields.lastName;
	if (additionalFields.company) body.company = additionalFields.company;
	if (additionalFields.phone) body.phone = additionalFields.phone;
	if (additionalFields.address) body.address = additionalFields.address;
	if (additionalFields.tags) body.tags = additionalFields.tags;
	if (additionalFields.customFields) body.custom_fields = additionalFields.customFields;

	const response = await proposifyApiRequest.call(this, 'POST', '/prospects', body);
	return [{ json: response }];
}

export async function update(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const prospectId = this.getNodeParameter('prospectId', index) as string;
	const updateFields = this.getNodeParameter('updateFields', index, {}) as IDataObject;

	const body: IDataObject = {};

	if (updateFields.email) body.email = updateFields.email;
	if (updateFields.firstName) body.first_name = updateFields.firstName;
	if (updateFields.lastName) body.last_name = updateFields.lastName;
	if (updateFields.company) body.company = updateFields.company;
	if (updateFields.phone) body.phone = updateFields.phone;
	if (updateFields.address) body.address = updateFields.address;
	if (updateFields.tags) body.tags = updateFields.tags;
	if (updateFields.customFields) body.custom_fields = updateFields.customFields;

	const response = await proposifyApiRequest.call(this, 'PUT', `/prospects/${prospectId}`, body);
	return [{ json: response }];
}

export async function deleteProspect(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const prospectId = this.getNodeParameter('prospectId', index) as string;
	await proposifyApiRequest.call(this, 'DELETE', `/prospects/${prospectId}`);
	return [{ json: { success: true, prospectId } }];
}

export async function getProposals(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const prospectId = this.getNodeParameter('prospectId', index) as string;
	const response = await proposifyApiRequest.call(this, 'GET', `/prospects/${prospectId}/proposals`);
	return [{ json: response }];
}

export async function merge(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const prospectId = this.getNodeParameter('prospectId', index) as string;
	const mergeWithId = this.getNodeParameter('mergeWithId', index) as string;

	const body: IDataObject = { merge_with_id: mergeWithId };
	const response = await proposifyApiRequest.call(this, 'POST', `/prospects/${prospectId}/merge`, body);
	return [{ json: response }];
}

export const prospectOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['prospect'] } },
		options: [
			{ name: 'Create', value: 'create', description: 'Create a prospect', action: 'Create a prospect' },
			{ name: 'Delete', value: 'delete', description: 'Delete a prospect', action: 'Delete a prospect' },
			{ name: 'Get', value: 'get', description: 'Get a prospect', action: 'Get a prospect' },
			{ name: 'Get Many', value: 'getAll', description: 'Get many prospects', action: 'Get many prospects' },
			{ name: 'Get Proposals', value: 'getProposals', description: 'Get proposals for prospect', action: 'Get prospect proposals' },
			{ name: 'Merge', value: 'merge', description: 'Merge duplicate prospects', action: 'Merge prospects' },
			{ name: 'Update', value: 'update', description: 'Update a prospect', action: 'Update a prospect' },
		],
		default: 'get',
	},
];

export const prospectFields: INodeProperties[] = [
	{
		displayName: 'Prospect ID',
		name: 'prospectId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['prospect'], operation: ['get', 'update', 'delete', 'getProposals', 'merge'] } },
		description: 'The unique identifier of the prospect',
	},
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: { show: { resource: ['prospect'], operation: ['getAll'] } },
		description: 'Whether to return all results or only up to a given limit',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		default: 50,
		typeOptions: { minValue: 1, maxValue: 100 },
		displayOptions: { show: { resource: ['prospect'], operation: ['getAll'], returnAll: [false] } },
		description: 'Max number of results to return',
	},
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: { show: { resource: ['prospect'], operation: ['getAll'] } },
		options: [
			{ displayName: 'Company', name: 'company', type: 'string', default: '', description: 'Filter by company name' },
			{ displayName: 'Email', name: 'email', type: 'string', placeholder: 'name@email.com', default: '', description: 'Filter by email' },
			{ displayName: 'Search', name: 'search', type: 'string', default: '', description: 'Search prospects' },
			{ displayName: 'Tags', name: 'tags', type: 'string', default: '', description: 'Filter by tags (comma-separated)' },
		],
	},
	{
		displayName: 'Email',
		name: 'email',
		type: 'string',
		placeholder: 'name@email.com',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['prospect'], operation: ['create'] } },
		description: 'The prospect email address',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['prospect'], operation: ['create'] } },
		options: [
			{ displayName: 'Address', name: 'address', type: 'json', default: '{}', description: 'Address details as JSON' },
			{ displayName: 'Company', name: 'company', type: 'string', default: '', description: 'Company name' },
			{ displayName: 'Custom Fields', name: 'customFields', type: 'json', default: '{}', description: 'Custom field values as JSON' },
			{ displayName: 'First Name', name: 'firstName', type: 'string', default: '', description: 'First name' },
			{ displayName: 'Last Name', name: 'lastName', type: 'string', default: '', description: 'Last name' },
			{ displayName: 'Phone', name: 'phone', type: 'string', default: '', description: 'Phone number' },
			{ displayName: 'Tags', name: 'tags', type: 'string', default: '', description: 'Tags (comma-separated)' },
		],
	},
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['prospect'], operation: ['update'] } },
		options: [
			{ displayName: 'Address', name: 'address', type: 'json', default: '{}', description: 'Address details as JSON' },
			{ displayName: 'Company', name: 'company', type: 'string', default: '', description: 'Company name' },
			{ displayName: 'Custom Fields', name: 'customFields', type: 'json', default: '{}', description: 'Custom field values as JSON' },
			{ displayName: 'Email', name: 'email', type: 'string', placeholder: 'name@email.com', default: '', description: 'Email address' },
			{ displayName: 'First Name', name: 'firstName', type: 'string', default: '', description: 'First name' },
			{ displayName: 'Last Name', name: 'lastName', type: 'string', default: '', description: 'Last name' },
			{ displayName: 'Phone', name: 'phone', type: 'string', default: '', description: 'Phone number' },
			{ displayName: 'Tags', name: 'tags', type: 'string', default: '', description: 'Tags (comma-separated)' },
		],
	},
	{
		displayName: 'Merge With Prospect ID',
		name: 'mergeWithId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['prospect'], operation: ['merge'] } },
		description: 'The ID of the prospect to merge into the primary prospect',
	},
];
