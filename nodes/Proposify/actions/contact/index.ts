/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IDataObject, IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { proposifyApiRequest, proposifyApiRequestAllItems } from '../../transport';
import { toExecutionData, parseFilters } from '../../utils/helpers';

export async function get(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const contactId = this.getNodeParameter('contactId', index) as string;
	const response = await proposifyApiRequest.call(this, 'GET', `/contacts/${contactId}`);
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
		const items = await proposifyApiRequestAllItems.call(this, 'GET', '/contacts', {}, query);
		return toExecutionData(items);
	}

	const limit = this.getNodeParameter('limit', index) as number;
	query.limit = limit;
	const response = await proposifyApiRequest.call(this, 'GET', '/contacts', {}, query);
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
	if (additionalFields.title) body.title = additionalFields.title;
	if (additionalFields.phone) body.phone = additionalFields.phone;
	if (additionalFields.prospectId) body.prospect_id = additionalFields.prospectId;
	if (additionalFields.isPrimary !== undefined) body.is_primary = additionalFields.isPrimary;

	const response = await proposifyApiRequest.call(this, 'POST', '/contacts', body);
	return [{ json: response }];
}

export async function update(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const contactId = this.getNodeParameter('contactId', index) as string;
	const updateFields = this.getNodeParameter('updateFields', index, {}) as IDataObject;

	const body: IDataObject = {};

	if (updateFields.email) body.email = updateFields.email;
	if (updateFields.firstName) body.first_name = updateFields.firstName;
	if (updateFields.lastName) body.last_name = updateFields.lastName;
	if (updateFields.title) body.title = updateFields.title;
	if (updateFields.phone) body.phone = updateFields.phone;
	if (updateFields.isPrimary !== undefined) body.is_primary = updateFields.isPrimary;

	const response = await proposifyApiRequest.call(this, 'PUT', `/contacts/${contactId}`, body);
	return [{ json: response }];
}

export async function deleteContact(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const contactId = this.getNodeParameter('contactId', index) as string;
	await proposifyApiRequest.call(this, 'DELETE', `/contacts/${contactId}`);
	return [{ json: { success: true, contactId } }];
}

export async function addToProspect(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const contactId = this.getNodeParameter('contactId', index) as string;
	const prospectId = this.getNodeParameter('prospectId', index) as string;

	const body: IDataObject = { prospect_id: prospectId };
	const response = await proposifyApiRequest.call(this, 'POST', `/contacts/${contactId}/prospect`, body);
	return [{ json: response }];
}

export async function removeFromProspect(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const contactId = this.getNodeParameter('contactId', index) as string;
	const prospectId = this.getNodeParameter('prospectId', index) as string;

	const response = await proposifyApiRequest.call(this, 'DELETE', `/contacts/${contactId}/prospect/${prospectId}`);
	return [{ json: response }];
}

export const contactOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['contact'] } },
		options: [
			{ name: 'Add to Prospect', value: 'addToProspect', description: 'Add contact to prospect', action: 'Add contact to prospect' },
			{ name: 'Create', value: 'create', description: 'Create a contact', action: 'Create a contact' },
			{ name: 'Delete', value: 'delete', description: 'Delete a contact', action: 'Delete a contact' },
			{ name: 'Get', value: 'get', description: 'Get a contact', action: 'Get a contact' },
			{ name: 'Get Many', value: 'getAll', description: 'Get many contacts', action: 'Get many contacts' },
			{ name: 'Remove from Prospect', value: 'removeFromProspect', description: 'Remove contact from prospect', action: 'Remove contact from prospect' },
			{ name: 'Update', value: 'update', description: 'Update a contact', action: 'Update a contact' },
		],
		default: 'get',
	},
];

export const contactFields: INodeProperties[] = [
	{
		displayName: 'Contact ID',
		name: 'contactId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['contact'], operation: ['get', 'update', 'delete', 'addToProspect', 'removeFromProspect'] } },
		description: 'The unique identifier of the contact',
	},
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: { show: { resource: ['contact'], operation: ['getAll'] } },
		description: 'Whether to return all results or only up to a given limit',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		default: 50,
		typeOptions: { minValue: 1, maxValue: 100 },
		displayOptions: { show: { resource: ['contact'], operation: ['getAll'], returnAll: [false] } },
		description: 'Max number of results to return',
	},
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: { show: { resource: ['contact'], operation: ['getAll'] } },
		options: [
			{ displayName: 'Email', name: 'email', type: 'string', placeholder: 'name@email.com', default: '', description: 'Filter by email' },
			{ displayName: 'Prospect ID', name: 'prospectId', type: 'string', default: '', description: 'Filter by prospect ID' },
			{ displayName: 'Search', name: 'search', type: 'string', default: '', description: 'Search contacts' },
		],
	},
	{
		displayName: 'Email',
		name: 'email',
		type: 'string',
		placeholder: 'name@email.com',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['contact'], operation: ['create'] } },
		description: 'The contact email address',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['contact'], operation: ['create'] } },
		options: [
			{ displayName: 'First Name', name: 'firstName', type: 'string', default: '', description: 'First name' },
			{ displayName: 'Is Primary', name: 'isPrimary', type: 'boolean', default: false, description: 'Whether this is the primary contact' },
			{ displayName: 'Last Name', name: 'lastName', type: 'string', default: '', description: 'Last name' },
			{ displayName: 'Phone', name: 'phone', type: 'string', default: '', description: 'Phone number' },
			{ displayName: 'Prospect ID', name: 'prospectId', type: 'string', default: '', description: 'Associate with a prospect' },
			{ displayName: 'Title', name: 'title', type: 'string', default: '', description: 'Job title' },
		],
	},
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['contact'], operation: ['update'] } },
		options: [
			{ displayName: 'Email', name: 'email', type: 'string', placeholder: 'name@email.com', default: '', description: 'Email address' },
			{ displayName: 'First Name', name: 'firstName', type: 'string', default: '', description: 'First name' },
			{ displayName: 'Is Primary', name: 'isPrimary', type: 'boolean', default: false, description: 'Whether this is the primary contact' },
			{ displayName: 'Last Name', name: 'lastName', type: 'string', default: '', description: 'Last name' },
			{ displayName: 'Phone', name: 'phone', type: 'string', default: '', description: 'Phone number' },
			{ displayName: 'Title', name: 'title', type: 'string', default: '', description: 'Job title' },
		],
	},
	{
		displayName: 'Prospect ID',
		name: 'prospectId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['contact'], operation: ['addToProspect', 'removeFromProspect'] } },
		description: 'The prospect ID to add/remove the contact to/from',
	},
];
