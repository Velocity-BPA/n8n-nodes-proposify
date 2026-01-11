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
	const templateId = this.getNodeParameter('templateId', index) as string;
	const response = await proposifyApiRequest.call(this, 'GET', `/templates/${templateId}`);
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
		const items = await proposifyApiRequestAllItems.call(this, 'GET', '/templates', {}, query);
		return toExecutionData(items);
	}

	const limit = this.getNodeParameter('limit', index) as number;
	query.limit = limit;
	const response = await proposifyApiRequest.call(this, 'GET', '/templates', {}, query);
	return toExecutionData((response.data as IDataObject[]) || []);
}

export async function create(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const name = this.getNodeParameter('name', index) as string;
	const additionalFields = this.getNodeParameter('additionalFields', index, {}) as IDataObject;

	const body: IDataObject = { name, ...processAdditionalFields(additionalFields) };

	const response = await proposifyApiRequest.call(this, 'POST', '/templates', body);
	return [{ json: response }];
}

export async function update(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const templateId = this.getNodeParameter('templateId', index) as string;
	const updateFields = this.getNodeParameter('updateFields', index, {}) as IDataObject;

	const body = processAdditionalFields(updateFields);
	const response = await proposifyApiRequest.call(this, 'PUT', `/templates/${templateId}`, body);
	return [{ json: response }];
}

export async function deleteTemplate(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const templateId = this.getNodeParameter('templateId', index) as string;
	await proposifyApiRequest.call(this, 'DELETE', `/templates/${templateId}`);
	return [{ json: { success: true, templateId } }];
}

export async function duplicate(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const templateId = this.getNodeParameter('templateId', index) as string;
	const additionalFields = this.getNodeParameter('additionalFields', index, {}) as IDataObject;

	const body: IDataObject = {};
	if (additionalFields.name) body.name = additionalFields.name;

	const response = await proposifyApiRequest.call(this, 'POST', `/templates/${templateId}/duplicate`, body);
	return [{ json: response }];
}

export async function getContent(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const templateId = this.getNodeParameter('templateId', index) as string;
	const response = await proposifyApiRequest.call(this, 'GET', `/templates/${templateId}/content`);
	return [{ json: response }];
}

export async function updateContent(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const templateId = this.getNodeParameter('templateId', index) as string;
	const contentBlocks = this.getNodeParameter('contentBlocks', index) as IDataObject;

	const body: IDataObject = { blocks: contentBlocks.blocks || [] };
	const response = await proposifyApiRequest.call(this, 'PUT', `/templates/${templateId}/content`, body);
	return [{ json: response }];
}

export async function getSections(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const templateId = this.getNodeParameter('templateId', index) as string;
	const response = await proposifyApiRequest.call(this, 'GET', `/templates/${templateId}/sections`);
	return [{ json: response }];
}

export async function getVariables(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const templateId = this.getNodeParameter('templateId', index) as string;
	const response = await proposifyApiRequest.call(this, 'GET', `/templates/${templateId}/variables`);
	return [{ json: response }];
}

export const templateOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['template'] } },
		options: [
			{ name: 'Create', value: 'create', description: 'Create a new template', action: 'Create a template' },
			{ name: 'Delete', value: 'delete', description: 'Delete a template', action: 'Delete a template' },
			{ name: 'Duplicate', value: 'duplicate', description: 'Duplicate a template', action: 'Duplicate a template' },
			{ name: 'Get', value: 'get', description: 'Get a template', action: 'Get a template' },
			{ name: 'Get Content', value: 'getContent', description: 'Get template content', action: 'Get template content' },
			{ name: 'Get Many', value: 'getAll', description: 'Get many templates', action: 'Get many templates' },
			{ name: 'Get Sections', value: 'getSections', description: 'Get template sections', action: 'Get template sections' },
			{ name: 'Get Variables', value: 'getVariables', description: 'Get template variables', action: 'Get template variables' },
			{ name: 'Update', value: 'update', description: 'Update a template', action: 'Update a template' },
			{ name: 'Update Content', value: 'updateContent', description: 'Update template content', action: 'Update template content' },
		],
		default: 'get',
	},
];

export const templateFields: INodeProperties[] = [
	{
		displayName: 'Template ID',
		name: 'templateId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['template'],
				operation: ['get', 'update', 'delete', 'duplicate', 'getContent', 'updateContent', 'getSections', 'getVariables'],
			},
		},
		description: 'The unique identifier of the template',
	},
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: { show: { resource: ['template'], operation: ['getAll'] } },
		description: 'Whether to return all results or only up to a given limit',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		default: 50,
		typeOptions: { minValue: 1, maxValue: 100 },
		displayOptions: { show: { resource: ['template'], operation: ['getAll'], returnAll: [false] } },
		description: 'Max number of results to return',
	},
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: { show: { resource: ['template'], operation: ['getAll'] } },
		options: [
			{ displayName: 'Category', name: 'category', type: 'string', default: '', description: 'Filter by category' },
			{ displayName: 'Is Default', name: 'isDefault', type: 'boolean', default: false, description: 'Filter by default templates only' },
		],
	},
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['template'], operation: ['create'] } },
		description: 'The name of the template',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['template'], operation: ['create'] } },
		options: [
			{ displayName: 'Category', name: 'category', type: 'string', default: '', description: 'Template category' },
			{ displayName: 'Description', name: 'description', type: 'string', default: '', description: 'Template description' },
			{ displayName: 'Is Default', name: 'isDefault', type: 'boolean', default: false, description: 'Set as default template' },
		],
	},
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['template'], operation: ['update'] } },
		options: [
			{ displayName: 'Category', name: 'category', type: 'string', default: '', description: 'Template category' },
			{ displayName: 'Description', name: 'description', type: 'string', default: '', description: 'Template description' },
			{ displayName: 'Is Default', name: 'isDefault', type: 'boolean', default: false, description: 'Set as default template' },
			{ displayName: 'Name', name: 'name', type: 'string', default: '', description: 'Template name' },
		],
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['template'], operation: ['duplicate'] } },
		options: [
			{ displayName: 'New Name', name: 'name', type: 'string', default: '', description: 'Name for the duplicated template' },
		],
	},
	{
		displayName: 'Content Blocks',
		name: 'contentBlocks',
		type: 'fixedCollection',
		typeOptions: { multipleValues: true },
		required: true,
		default: {},
		displayOptions: { show: { resource: ['template'], operation: ['updateContent'] } },
		options: [
			{
				displayName: 'Block',
				name: 'blocks',
				values: [
					{ displayName: 'Block ID', name: 'blockId', type: 'string', default: '', description: 'The ID of the content block' },
					{ displayName: 'Content', name: 'content', type: 'string', typeOptions: { rows: 4 }, default: '', description: 'The content (HTML)' },
				],
			},
		],
		description: 'Content blocks to update',
	},
];
