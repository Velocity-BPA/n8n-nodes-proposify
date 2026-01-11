/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IDataObject, IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { proposifyApiRequest, proposifyApiDownload } from '../../transport';

export async function getProposalViews(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const proposalId = this.getNodeParameter('proposalId', index) as string;
	const filters = this.getNodeParameter('filters', index, {}) as IDataObject;

	const query: IDataObject = {};
	if (filters.dateFrom) query.date_from = filters.dateFrom;
	if (filters.dateTo) query.date_to = filters.dateTo;
	if (filters.groupBy) query.group_by = filters.groupBy;

	const response = await proposifyApiRequest.call(this, 'GET', `/proposals/${proposalId}/analytics/views`, {}, query);
	return [{ json: response }];
}

export async function getViewerDetails(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const proposalId = this.getNodeParameter('proposalId', index) as string;
	const viewerId = this.getNodeParameter('viewerId', index, '') as string;

	const endpoint = viewerId
		? `/proposals/${proposalId}/analytics/viewers/${viewerId}`
		: `/proposals/${proposalId}/analytics/viewers`;

	const response = await proposifyApiRequest.call(this, 'GET', endpoint);
	return [{ json: response }];
}

export async function getEngagement(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const proposalId = this.getNodeParameter('proposalId', index) as string;
	const response = await proposifyApiRequest.call(this, 'GET', `/proposals/${proposalId}/analytics/engagement`);
	return [{ json: response }];
}

export async function getPageViews(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const proposalId = this.getNodeParameter('proposalId', index) as string;
	const response = await proposifyApiRequest.call(this, 'GET', `/proposals/${proposalId}/analytics/pages`);
	return [{ json: response }];
}

export async function getTimeSpent(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const proposalId = this.getNodeParameter('proposalId', index) as string;
	const filters = this.getNodeParameter('filters', index, {}) as IDataObject;

	const query: IDataObject = {};
	if (filters.viewerId) query.viewer_id = filters.viewerId;

	const response = await proposifyApiRequest.call(this, 'GET', `/proposals/${proposalId}/analytics/time`, {}, query);
	return [{ json: response }];
}

export async function getDeviceInfo(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const proposalId = this.getNodeParameter('proposalId', index) as string;
	const response = await proposifyApiRequest.call(this, 'GET', `/proposals/${proposalId}/analytics/devices`);
	return [{ json: response }];
}

export async function exportReport(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const proposalId = this.getNodeParameter('proposalId', index) as string;
	const format = this.getNodeParameter('format', index, 'pdf') as string;
	const binaryPropertyName = this.getNodeParameter('binaryPropertyName', index, 'data') as string;

	const buffer = await proposifyApiDownload.call(this, `/proposals/${proposalId}/analytics/export?format=${format}`);

	const fileName = `analytics_${proposalId}.${format}`;
	const mimeType = format === 'pdf' ? 'application/pdf' : 'text/csv';

	return [
		{
			json: { proposalId, format, fileName },
			binary: {
				[binaryPropertyName]: await this.helpers.prepareBinaryData(buffer, fileName, mimeType),
			},
		},
	];
}

export const analyticsOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['analytics'] } },
		options: [
			{ name: 'Export Report', value: 'exportReport', description: 'Export analytics report', action: 'Export analytics report' },
			{ name: 'Get Device Info', value: 'getDeviceInfo', description: 'Get viewer device information', action: 'Get device info' },
			{ name: 'Get Engagement', value: 'getEngagement', description: 'Get engagement metrics', action: 'Get engagement' },
			{ name: 'Get Page Views', value: 'getPageViews', description: 'Get per-page view data', action: 'Get page views' },
			{ name: 'Get Proposal Views', value: 'getProposalViews', description: 'Get view analytics for proposal', action: 'Get proposal views' },
			{ name: 'Get Time Spent', value: 'getTimeSpent', description: 'Get time spent on proposal', action: 'Get time spent' },
			{ name: 'Get Viewer Details', value: 'getViewerDetails', description: 'Get details of who viewed', action: 'Get viewer details' },
		],
		default: 'getProposalViews',
	},
];

export const analyticsFields: INodeProperties[] = [
	{
		displayName: 'Proposal ID',
		name: 'proposalId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['analytics'], operation: ['getProposalViews', 'getViewerDetails', 'getEngagement', 'getPageViews', 'getTimeSpent', 'getDeviceInfo', 'exportReport'] } },
		description: 'The proposal to get analytics for',
	},
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: { show: { resource: ['analytics'], operation: ['getProposalViews'] } },
		options: [
			{ displayName: 'Date From', name: 'dateFrom', type: 'dateTime', default: '', description: 'Start date for analytics' },
			{ displayName: 'Date To', name: 'dateTo', type: 'dateTime', default: '', description: 'End date for analytics' },
			{
				displayName: 'Group By',
				name: 'groupBy',
				type: 'options',
				options: [
					{ name: 'Day', value: 'day' },
					{ name: 'Month', value: 'month' },
					{ name: 'Week', value: 'week' },
				],
				default: 'day',
				description: 'Group data by time period',
			},
		],
	},
	{
		displayName: 'Viewer ID',
		name: 'viewerId',
		type: 'string',
		default: '',
		displayOptions: { show: { resource: ['analytics'], operation: ['getViewerDetails'] } },
		description: 'Specific viewer ID (leave empty to get all viewers)',
	},
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: { show: { resource: ['analytics'], operation: ['getTimeSpent'] } },
		options: [
			{ displayName: 'Viewer ID', name: 'viewerId', type: 'string', default: '', description: 'Filter by specific viewer' },
		],
	},
	{
		displayName: 'Format',
		name: 'format',
		type: 'options',
		options: [
			{ name: 'CSV', value: 'csv' },
			{ name: 'PDF', value: 'pdf' },
		],
		default: 'pdf',
		displayOptions: { show: { resource: ['analytics'], operation: ['exportReport'] } },
		description: 'Export format',
	},
	{
		displayName: 'Binary Property',
		name: 'binaryPropertyName',
		type: 'string',
		default: 'data',
		displayOptions: { show: { resource: ['analytics'], operation: ['exportReport'] } },
		description: 'Name of the binary property to store the exported file',
	},
];
