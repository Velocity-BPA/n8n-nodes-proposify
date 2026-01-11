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
	const commentId = this.getNodeParameter('commentId', index) as string;
	const response = await proposifyApiRequest.call(this, 'GET', `/proposals/${proposalId}/comments/${commentId}`);
	return [{ json: response }];
}

export async function getAll(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const proposalId = this.getNodeParameter('proposalId', index) as string;
	const returnAll = this.getNodeParameter('returnAll', index) as boolean;
	const filters = this.getNodeParameter('filters', index, {}) as IDataObject;

	const query: IDataObject = {};
	if (filters.isResolved !== undefined) query.is_resolved = filters.isResolved;
	if (filters.sectionId) query.section_id = filters.sectionId;

	if (returnAll) {
		const items = await proposifyApiRequestAllItems.call(this, 'GET', `/proposals/${proposalId}/comments`, {}, query);
		return toExecutionData(items);
	}

	const limit = this.getNodeParameter('limit', index) as number;
	query.limit = limit;
	const response = await proposifyApiRequest.call(this, 'GET', `/proposals/${proposalId}/comments`, {}, query);
	return toExecutionData((response.data as IDataObject[]) || []);
}

export async function create(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const proposalId = this.getNodeParameter('proposalId', index) as string;
	const content = this.getNodeParameter('content', index) as string;
	const additionalFields = this.getNodeParameter('additionalFields', index, {}) as IDataObject;

	const body: IDataObject = { content };

	if (additionalFields.sectionId) body.section_id = additionalFields.sectionId;
	if (additionalFields.parentId) body.parent_id = additionalFields.parentId;

	const response = await proposifyApiRequest.call(this, 'POST', `/proposals/${proposalId}/comments`, body);
	return [{ json: response }];
}

export async function update(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const proposalId = this.getNodeParameter('proposalId', index) as string;
	const commentId = this.getNodeParameter('commentId', index) as string;
	const content = this.getNodeParameter('content', index) as string;

	const body: IDataObject = { content };

	const response = await proposifyApiRequest.call(this, 'PUT', `/proposals/${proposalId}/comments/${commentId}`, body);
	return [{ json: response }];
}

export async function deleteComment(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const proposalId = this.getNodeParameter('proposalId', index) as string;
	const commentId = this.getNodeParameter('commentId', index) as string;
	await proposifyApiRequest.call(this, 'DELETE', `/proposals/${proposalId}/comments/${commentId}`);
	return [{ json: { success: true, proposalId, commentId } }];
}

export async function resolve(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const proposalId = this.getNodeParameter('proposalId', index) as string;
	const commentId = this.getNodeParameter('commentId', index) as string;
	const response = await proposifyApiRequest.call(this, 'POST', `/proposals/${proposalId}/comments/${commentId}/resolve`);
	return [{ json: response }];
}

export async function reply(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const proposalId = this.getNodeParameter('proposalId', index) as string;
	const commentId = this.getNodeParameter('commentId', index) as string;
	const content = this.getNodeParameter('replyContent', index) as string;

	const body: IDataObject = { content, parent_id: commentId };

	const response = await proposifyApiRequest.call(this, 'POST', `/proposals/${proposalId}/comments`, body);
	return [{ json: response }];
}

export const commentOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['comment'] } },
		options: [
			{ name: 'Create', value: 'create', description: 'Add comment to proposal', action: 'Create a comment' },
			{ name: 'Delete', value: 'delete', description: 'Delete comment', action: 'Delete a comment' },
			{ name: 'Get', value: 'get', description: 'Get comment details', action: 'Get a comment' },
			{ name: 'Get Many', value: 'getAll', description: 'List comments on proposal', action: 'Get many comments' },
			{ name: 'Reply', value: 'reply', description: 'Reply to a comment', action: 'Reply to comment' },
			{ name: 'Resolve', value: 'resolve', description: 'Mark comment as resolved', action: 'Resolve comment' },
			{ name: 'Update', value: 'update', description: 'Update comment', action: 'Update a comment' },
		],
		default: 'get',
	},
];

export const commentFields: INodeProperties[] = [
	{
		displayName: 'Proposal ID',
		name: 'proposalId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['comment'], operation: ['get', 'getAll', 'create', 'update', 'delete', 'resolve', 'reply'] } },
		description: 'The proposal containing the comments',
	},
	{
		displayName: 'Comment ID',
		name: 'commentId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['comment'], operation: ['get', 'update', 'delete', 'resolve', 'reply'] } },
		description: 'The unique identifier of the comment',
	},
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: { show: { resource: ['comment'], operation: ['getAll'] } },
		description: 'Whether to return all results or only up to a given limit',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		default: 50,
		typeOptions: { minValue: 1, maxValue: 100 },
		displayOptions: { show: { resource: ['comment'], operation: ['getAll'], returnAll: [false] } },
		description: 'Max number of results to return',
	},
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: { show: { resource: ['comment'], operation: ['getAll'] } },
		options: [
			{ displayName: 'Is Resolved', name: 'isResolved', type: 'boolean', default: false, description: 'Filter by resolved status' },
			{ displayName: 'Section ID', name: 'sectionId', type: 'string', default: '', description: 'Filter by section' },
		],
	},
	{
		displayName: 'Content',
		name: 'content',
		type: 'string',
		typeOptions: { rows: 4 },
		required: true,
		default: '',
		displayOptions: { show: { resource: ['comment'], operation: ['create', 'update'] } },
		description: 'The comment text',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['comment'], operation: ['create'] } },
		options: [
			{ displayName: 'Parent Comment ID', name: 'parentId', type: 'string', default: '', description: 'ID of parent comment (for replies)' },
			{ displayName: 'Section ID', name: 'sectionId', type: 'string', default: '', description: 'Section to attach comment to' },
		],
	},
	{
		displayName: 'Reply Content',
		name: 'replyContent',
		type: 'string',
		typeOptions: { rows: 4 },
		required: true,
		default: '',
		displayOptions: { show: { resource: ['comment'], operation: ['reply'] } },
		description: 'The reply text',
	},
];
