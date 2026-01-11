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
	const sectionId = this.getNodeParameter('sectionId', index) as string;
	const response = await proposifyApiRequest.call(this, 'GET', `/sections/${sectionId}`);
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
		const items = await proposifyApiRequestAllItems.call(this, 'GET', '/sections', {}, query);
		return toExecutionData(items);
	}

	const limit = this.getNodeParameter('limit', index) as number;
	query.limit = limit;
	const response = await proposifyApiRequest.call(this, 'GET', '/sections', {}, query);
	return toExecutionData((response.data as IDataObject[]) || []);
}

export async function create(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const name = this.getNodeParameter('name', index) as string;
	const content = this.getNodeParameter('content', index) as string;
	const additionalFields = this.getNodeParameter('additionalFields', index, {}) as IDataObject;

	const body: IDataObject = { name, content };

	if (additionalFields.category) body.category = additionalFields.category;
	if (additionalFields.isLocked !== undefined) body.is_locked = additionalFields.isLocked;
	if (additionalFields.tags) body.tags = (additionalFields.tags as string).split(',').map((t) => t.trim());

	const response = await proposifyApiRequest.call(this, 'POST', '/sections', body);
	return [{ json: response }];
}

export async function update(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const sectionId = this.getNodeParameter('sectionId', index) as string;
	const updateFields = this.getNodeParameter('updateFields', index, {}) as IDataObject;

	const body: IDataObject = {};

	if (updateFields.name) body.name = updateFields.name;
	if (updateFields.content) body.content = updateFields.content;
	if (updateFields.category) body.category = updateFields.category;
	if (updateFields.isLocked !== undefined) body.is_locked = updateFields.isLocked;
	if (updateFields.tags) body.tags = (updateFields.tags as string).split(',').map((t) => t.trim());

	const response = await proposifyApiRequest.call(this, 'PUT', `/sections/${sectionId}`, body);
	return [{ json: response }];
}

export async function deleteSection(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const sectionId = this.getNodeParameter('sectionId', index) as string;
	await proposifyApiRequest.call(this, 'DELETE', `/sections/${sectionId}`);
	return [{ json: { success: true, sectionId } }];
}

export async function duplicate(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const sectionId = this.getNodeParameter('sectionId', index) as string;
	const additionalFields = this.getNodeParameter('additionalFields', index, {}) as IDataObject;

	const body: IDataObject = {};
	if (additionalFields.name) body.name = additionalFields.name;

	const response = await proposifyApiRequest.call(this, 'POST', `/sections/${sectionId}/duplicate`, body);
	return [{ json: response }];
}

export async function addToLibrary(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const sectionId = this.getNodeParameter('sectionId', index) as string;
	const response = await proposifyApiRequest.call(this, 'POST', `/sections/${sectionId}/library`);
	return [{ json: response }];
}

export async function getVersions(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const sectionId = this.getNodeParameter('sectionId', index) as string;
	const response = await proposifyApiRequest.call(this, 'GET', `/sections/${sectionId}/versions`);
	return [{ json: response }];
}

export const sectionOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['section'] } },
		options: [
			{ name: 'Add to Library', value: 'addToLibrary', description: 'Add section to content library', action: 'Add section to library' },
			{ name: 'Create', value: 'create', description: 'Create a section', action: 'Create a section' },
			{ name: 'Delete', value: 'delete', description: 'Delete a section', action: 'Delete a section' },
			{ name: 'Duplicate', value: 'duplicate', description: 'Duplicate a section', action: 'Duplicate a section' },
			{ name: 'Get', value: 'get', description: 'Get a section', action: 'Get a section' },
			{ name: 'Get Many', value: 'getAll', description: 'Get many sections', action: 'Get many sections' },
			{ name: 'Get Versions', value: 'getVersions', description: 'Get section version history', action: 'Get section versions' },
			{ name: 'Update', value: 'update', description: 'Update a section', action: 'Update a section' },
		],
		default: 'get',
	},
];

export const sectionFields: INodeProperties[] = [
	{
		displayName: 'Section ID',
		name: 'sectionId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['section'], operation: ['get', 'update', 'delete', 'duplicate', 'addToLibrary', 'getVersions'] } },
		description: 'The unique identifier of the section',
	},
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: { show: { resource: ['section'], operation: ['getAll'] } },
		description: 'Whether to return all results or only up to a given limit',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		default: 50,
		typeOptions: { minValue: 1, maxValue: 100 },
		displayOptions: { show: { resource: ['section'], operation: ['getAll'], returnAll: [false] } },
		description: 'Max number of results to return',
	},
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: { show: { resource: ['section'], operation: ['getAll'] } },
		options: [
			{ displayName: 'Category', name: 'category', type: 'string', default: '', description: 'Filter by category' },
			{ displayName: 'Is Locked', name: 'isLocked', type: 'boolean', default: false, description: 'Filter by locked status' },
			{ displayName: 'Search', name: 'search', type: 'string', default: '', description: 'Search sections' },
			{ displayName: 'Tags', name: 'tags', type: 'string', default: '', description: 'Filter by tags (comma-separated)' },
		],
	},
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['section'], operation: ['create'] } },
		description: 'The name of the section',
	},
	{
		displayName: 'Content',
		name: 'content',
		type: 'string',
		typeOptions: { rows: 6 },
		required: true,
		default: '',
		displayOptions: { show: { resource: ['section'], operation: ['create'] } },
		description: 'The HTML content of the section',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['section'], operation: ['create'] } },
		options: [
			{ displayName: 'Category', name: 'category', type: 'string', default: '', description: 'Section category' },
			{ displayName: 'Is Locked', name: 'isLocked', type: 'boolean', default: false, description: 'Whether the section is locked' },
			{ displayName: 'Tags', name: 'tags', type: 'string', default: '', description: 'Tags (comma-separated)' },
		],
	},
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['section'], operation: ['update'] } },
		options: [
			{ displayName: 'Category', name: 'category', type: 'string', default: '', description: 'Section category' },
			{ displayName: 'Content', name: 'content', type: 'string', typeOptions: { rows: 6 }, default: '', description: 'The HTML content' },
			{ displayName: 'Is Locked', name: 'isLocked', type: 'boolean', default: false, description: 'Whether the section is locked' },
			{ displayName: 'Name', name: 'name', type: 'string', default: '', description: 'Section name' },
			{ displayName: 'Tags', name: 'tags', type: 'string', default: '', description: 'Tags (comma-separated)' },
		],
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['section'], operation: ['duplicate'] } },
		options: [
			{ displayName: 'New Name', name: 'name', type: 'string', default: '', description: 'Name for the duplicated section' },
		],
	},
];
