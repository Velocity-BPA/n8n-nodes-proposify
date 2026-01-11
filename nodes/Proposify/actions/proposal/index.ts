/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

export { get } from './get';
export { getAll } from './getAll';
export { create } from './create';
export { update } from './update';
export { deleteProposal, duplicate, send, archive, restore } from './operations';
export { getMetrics, getContent, updateContent, downloadPdf, setWon, setLost } from './advanced';

import type { INodeProperties } from 'n8n-workflow';

export const proposalOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['proposal'],
			},
		},
		options: [
			{
				name: 'Archive',
				value: 'archive',
				description: 'Archive a proposal',
				action: 'Archive a proposal',
			},
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new proposal',
				action: 'Create a proposal',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a proposal',
				action: 'Delete a proposal',
			},
			{
				name: 'Download PDF',
				value: 'downloadPdf',
				description: 'Download proposal as PDF',
				action: 'Download proposal as PDF',
			},
			{
				name: 'Duplicate',
				value: 'duplicate',
				description: 'Duplicate an existing proposal',
				action: 'Duplicate a proposal',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Retrieve a specific proposal',
				action: 'Get a proposal',
			},
			{
				name: 'Get Content',
				value: 'getContent',
				description: 'Get proposal content blocks',
				action: 'Get proposal content',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Retrieve many proposals',
				action: 'Get many proposals',
			},
			{
				name: 'Get Metrics',
				value: 'getMetrics',
				description: 'Get engagement metrics for a proposal',
				action: 'Get proposal metrics',
			},
			{
				name: 'Restore',
				value: 'restore',
				description: 'Restore an archived proposal',
				action: 'Restore a proposal',
			},
			{
				name: 'Send',
				value: 'send',
				description: 'Send proposal to recipients',
				action: 'Send a proposal',
			},
			{
				name: 'Set Lost',
				value: 'setLost',
				description: 'Mark proposal as lost',
				action: 'Set proposal as lost',
			},
			{
				name: 'Set Won',
				value: 'setWon',
				description: 'Mark proposal as won',
				action: 'Set proposal as won',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a proposal',
				action: 'Update a proposal',
			},
			{
				name: 'Update Content',
				value: 'updateContent',
				description: 'Update proposal content blocks',
				action: 'Update proposal content',
			},
		],
		default: 'get',
	},
];

export const proposalFields: INodeProperties[] = [
	// ----------------------------------
	//         proposal: get
	// ----------------------------------
	{
		displayName: 'Proposal ID',
		name: 'proposalId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['proposal'],
				operation: [
					'get',
					'update',
					'delete',
					'duplicate',
					'send',
					'archive',
					'restore',
					'getMetrics',
					'getContent',
					'updateContent',
					'downloadPdf',
					'setWon',
					'setLost',
				],
			},
		},
		description: 'The unique identifier of the proposal',
	},
	// ----------------------------------
	//         proposal: getAll
	// ----------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['proposal'],
				operation: ['getAll'],
			},
		},
		description: 'Whether to return all results or only up to a given limit',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		default: 50,
		typeOptions: {
			minValue: 1,
			maxValue: 100,
		},
		displayOptions: {
			show: {
				resource: ['proposal'],
				operation: ['getAll'],
				returnAll: [false],
			},
		},
		description: 'Max number of results to return',
	},
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				resource: ['proposal'],
				operation: ['getAll'],
			},
		},
		options: [
			{
				displayName: 'Status',
				name: 'status',
				type: 'multiOptions',
				options: [
					{ name: 'Archived', value: 'archived' },
					{ name: 'Draft', value: 'draft' },
					{ name: 'Lost', value: 'lost' },
					{ name: 'Sent', value: 'sent' },
					{ name: 'Viewed', value: 'viewed' },
					{ name: 'Won', value: 'won' },
				],
				default: [],
				description: 'Filter by proposal status',
			},
			{
				displayName: 'Prospect ID',
				name: 'prospectId',
				type: 'string',
				default: '',
				description: 'Filter by prospect ID',
			},
			{
				displayName: 'Created By',
				name: 'createdBy',
				type: 'string',
				default: '',
				description: 'Filter by user who created the proposal',
			},
			{
				displayName: 'Date From',
				name: 'dateFrom',
				type: 'dateTime',
				default: '',
				description: 'Filter proposals created after this date',
			},
			{
				displayName: 'Date To',
				name: 'dateTo',
				type: 'dateTime',
				default: '',
				description: 'Filter proposals created before this date',
			},
		],
	},
	// ----------------------------------
	//         proposal: create
	// ----------------------------------
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['proposal'],
				operation: ['create'],
			},
		},
		description: 'The name/title of the proposal',
	},
	{
		displayName: 'Template ID',
		name: 'templateId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['proposal'],
				operation: ['create'],
			},
		},
		description: 'The template to use for creating the proposal',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['proposal'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Currency',
				name: 'currency',
				type: 'string',
				default: 'USD',
				description: 'Currency code (e.g., USD, EUR, GBP)',
			},
			{
				displayName: 'Expires At',
				name: 'expiresAt',
				type: 'dateTime',
				default: '',
				description: 'When the proposal expires',
			},
			{
				displayName: 'Prospect ID',
				name: 'prospectId',
				type: 'string',
				default: '',
				description: 'The prospect to associate with this proposal',
			},
			{
				displayName: 'Value',
				name: 'value',
				type: 'number',
				default: 0,
				description: 'The monetary value of the proposal',
			},
		],
	},
	// ----------------------------------
	//         proposal: update
	// ----------------------------------
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['proposal'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'Currency',
				name: 'currency',
				type: 'string',
				default: '',
				description: 'Currency code (e.g., USD, EUR, GBP)',
			},
			{
				displayName: 'Expires At',
				name: 'expiresAt',
				type: 'dateTime',
				default: '',
				description: 'When the proposal expires',
			},
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'The name/title of the proposal',
			},
			{
				displayName: 'Prospect ID',
				name: 'prospectId',
				type: 'string',
				default: '',
				description: 'The prospect to associate with this proposal',
			},
			{
				displayName: 'Value',
				name: 'value',
				type: 'number',
				default: 0,
				description: 'The monetary value of the proposal',
			},
		],
	},
	// ----------------------------------
	//         proposal: duplicate
	// ----------------------------------
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['proposal'],
				operation: ['duplicate'],
			},
		},
		options: [
			{
				displayName: 'New Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'Name for the duplicated proposal',
			},
		],
	},
	// ----------------------------------
	//         proposal: send
	// ----------------------------------
	{
		displayName: 'Recipients',
		name: 'recipients',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		required: true,
		default: {},
		displayOptions: {
			show: {
				resource: ['proposal'],
				operation: ['send'],
			},
		},
		options: [
			{
				displayName: 'Recipient',
				name: 'recipientValues',
				values: [
					{
						displayName: 'Email',
						name: 'email',
						type: 'string',
						placeholder: 'name@email.com',
						default: '',
						description: 'Recipient email address',
					},
					{
						displayName: 'Name',
						name: 'name',
						type: 'string',
						default: '',
						description: 'Recipient name',
					},
				],
			},
		],
		description: 'Recipients to send the proposal to',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['proposal'],
				operation: ['send'],
			},
		},
		options: [
			{
				displayName: 'Message',
				name: 'message',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				description: 'Custom message to include in the email',
			},
			{
				displayName: 'Schedule Send',
				name: 'sendAt',
				type: 'dateTime',
				default: '',
				description: 'Schedule the proposal to be sent at a specific time',
			},
			{
				displayName: 'Subject',
				name: 'subject',
				type: 'string',
				default: '',
				description: 'Custom email subject line',
			},
		],
	},
	// ----------------------------------
	//         proposal: downloadPdf
	// ----------------------------------
	{
		displayName: 'Binary Property',
		name: 'binaryPropertyName',
		type: 'string',
		default: 'data',
		displayOptions: {
			show: {
				resource: ['proposal'],
				operation: ['downloadPdf'],
			},
		},
		description: 'Name of the binary property to store the PDF',
	},
	// ----------------------------------
	//         proposal: setWon
	// ----------------------------------
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['proposal'],
				operation: ['setWon'],
			},
		},
		options: [
			{
				displayName: 'Notes',
				name: 'notes',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				description: 'Notes about why the proposal was won',
			},
			{
				displayName: 'Won Value',
				name: 'wonValue',
				type: 'number',
				default: 0,
				description: 'The actual value of the won deal',
			},
		],
	},
	// ----------------------------------
	//         proposal: setLost
	// ----------------------------------
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['proposal'],
				operation: ['setLost'],
			},
		},
		options: [
			{
				displayName: 'Lost Reason',
				name: 'lostReason',
				type: 'string',
				default: '',
				description: 'Reason the proposal was lost',
			},
			{
				displayName: 'Notes',
				name: 'notes',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				description: 'Additional notes about the lost proposal',
			},
		],
	},
	// ----------------------------------
	//         proposal: updateContent
	// ----------------------------------
	{
		displayName: 'Content Blocks',
		name: 'contentBlocks',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		required: true,
		default: {},
		displayOptions: {
			show: {
				resource: ['proposal'],
				operation: ['updateContent'],
			},
		},
		options: [
			{
				displayName: 'Block',
				name: 'blocks',
				values: [
					{
						displayName: 'Block ID',
						name: 'blockId',
						type: 'string',
						default: '',
						description: 'The ID of the content block to update',
					},
					{
						displayName: 'Content',
						name: 'content',
						type: 'string',
						typeOptions: {
							rows: 4,
						},
						default: '',
						description: 'The new content for the block (HTML)',
					},
				],
			},
		],
		description: 'Content blocks to update',
	},
];
