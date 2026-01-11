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
	const userId = this.getNodeParameter('userId', index) as string;
	const response = await proposifyApiRequest.call(this, 'GET', `/users/${userId}`);
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
		const items = await proposifyApiRequestAllItems.call(this, 'GET', '/users', {}, query);
		return toExecutionData(items);
	}

	const limit = this.getNodeParameter('limit', index) as number;
	query.limit = limit;
	const response = await proposifyApiRequest.call(this, 'GET', '/users', {}, query);
	return toExecutionData((response.data as IDataObject[]) || []);
}

export async function getCurrent(
	this: IExecuteFunctions,
	_index: number,
): Promise<INodeExecutionData[]> {
	const response = await proposifyApiRequest.call(this, 'GET', '/users/me');
	return [{ json: response }];
}

export async function getProposals(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const userId = this.getNodeParameter('userId', index) as string;
	const returnAll = this.getNodeParameter('returnAll', index) as boolean;

	if (returnAll) {
		const items = await proposifyApiRequestAllItems.call(this, 'GET', `/users/${userId}/proposals`);
		return toExecutionData(items);
	}

	const limit = this.getNodeParameter('limit', index) as number;
	const response = await proposifyApiRequest.call(this, 'GET', `/users/${userId}/proposals`, {}, { limit });
	return toExecutionData((response.data as IDataObject[]) || []);
}

export async function getActivity(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const userId = this.getNodeParameter('userId', index) as string;
	const filters = this.getNodeParameter('filters', index, {}) as IDataObject;

	const query: IDataObject = {};
	if (filters.dateFrom) query.date_from = filters.dateFrom;
	if (filters.dateTo) query.date_to = filters.dateTo;

	const response = await proposifyApiRequest.call(this, 'GET', `/users/${userId}/activity`, {}, query);
	return [{ json: response }];
}

export const userOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['user'] } },
		options: [
			{ name: 'Get', value: 'get', description: 'Get user details', action: 'Get a user' },
			{ name: 'Get Activity', value: 'getActivity', description: 'Get user activity log', action: 'Get user activity' },
			{ name: 'Get Current', value: 'getCurrent', description: 'Get current authenticated user', action: 'Get current user' },
			{ name: 'Get Many', value: 'getAll', description: 'List all users', action: 'Get many users' },
			{ name: 'Get Proposals', value: 'getProposals', description: 'Get proposals by user', action: 'Get user proposals' },
		],
		default: 'get',
	},
];

export const userFields: INodeProperties[] = [
	{
		displayName: 'User ID',
		name: 'userId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['user'], operation: ['get', 'getProposals', 'getActivity'] } },
		description: 'The unique identifier of the user',
	},
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: { show: { resource: ['user'], operation: ['getAll', 'getProposals'] } },
		description: 'Whether to return all results or only up to a given limit',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		default: 50,
		typeOptions: { minValue: 1, maxValue: 100 },
		displayOptions: { show: { resource: ['user'], operation: ['getAll', 'getProposals'], returnAll: [false] } },
		description: 'Max number of results to return',
	},
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: { show: { resource: ['user'], operation: ['getAll'] } },
		options: [
			{ displayName: 'Is Active', name: 'isActive', type: 'boolean', default: true, description: 'Filter by active status' },
			{ displayName: 'Role', name: 'role', type: 'string', default: '', description: 'Filter by user role' },
			{ displayName: 'Search', name: 'search', type: 'string', default: '', description: 'Search users' },
		],
	},
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: { show: { resource: ['user'], operation: ['getActivity'] } },
		options: [
			{ displayName: 'Date From', name: 'dateFrom', type: 'dateTime', default: '', description: 'Start date for activity' },
			{ displayName: 'Date To', name: 'dateTo', type: 'dateTime', default: '', description: 'End date for activity' },
		],
	},
];
