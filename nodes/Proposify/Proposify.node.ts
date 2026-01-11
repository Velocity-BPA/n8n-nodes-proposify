/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';

// Proposal imports
import {
	proposalOperations,
	proposalFields,
	get as proposalGet,
	getAll as proposalGetAll,
	create as proposalCreate,
	update as proposalUpdate,
	deleteProposal,
	duplicate as proposalDuplicate,
	send as proposalSend,
	archive as proposalArchive,
	restore as proposalRestore,
	getMetrics as proposalGetMetrics,
	getContent as proposalGetContent,
	updateContent as proposalUpdateContent,
	downloadPdf as proposalDownloadPdf,
	setWon as proposalSetWon,
	setLost as proposalSetLost,
} from './actions/proposal';

// Template imports
import {
	templateOperations,
	templateFields,
	get as templateGet,
	getAll as templateGetAll,
	create as templateCreate,
	update as templateUpdate,
	deleteTemplate,
	duplicate as templateDuplicate,
	getContent as templateGetContent,
	updateContent as templateUpdateContent,
	getSections as templateGetSections,
	getVariables as templateGetVariables,
} from './actions/template';

// Prospect imports
import {
	prospectOperations,
	prospectFields,
	get as prospectGet,
	getAll as prospectGetAll,
	create as prospectCreate,
	update as prospectUpdate,
	deleteProspect,
	getProposals as prospectGetProposals,
	merge as prospectMerge,
} from './actions/prospect';

// Contact imports
import {
	contactOperations,
	contactFields,
	get as contactGet,
	getAll as contactGetAll,
	create as contactCreate,
	update as contactUpdate,
	deleteContact,
	addToProspect as contactAddToProspect,
	removeFromProspect as contactRemoveFromProspect,
} from './actions/contact';

// Section imports
import {
	sectionOperations,
	sectionFields,
	get as sectionGet,
	getAll as sectionGetAll,
	create as sectionCreate,
	update as sectionUpdate,
	deleteSection,
	duplicate as sectionDuplicate,
	addToLibrary as sectionAddToLibrary,
	getVersions as sectionGetVersions,
} from './actions/section';

// Fee imports
import {
	feeOperations,
	feeFields,
	get as feeGet,
	getAll as feeGetAll,
	create as feeCreate,
	update as feeUpdate,
	deleteFee,
	reorder as feeReorder,
	calculate as feeCalculate,
} from './actions/fee';

// Signature imports
import {
	signatureOperations,
	signatureFields,
	get as signatureGet,
	getAll as signatureGetAll,
	create as signatureCreate,
	update as signatureUpdate,
	deleteSignature,
	getStatus as signatureGetStatus,
	sendReminder as signatureSendReminder,
	revoke as signatureRevoke,
} from './actions/signature';

// Comment imports
import {
	commentOperations,
	commentFields,
	get as commentGet,
	getAll as commentGetAll,
	create as commentCreate,
	update as commentUpdate,
	deleteComment,
	resolve as commentResolve,
	reply as commentReply,
} from './actions/comment';

// User imports
import {
	userOperations,
	userFields,
	get as userGet,
	getAll as userGetAll,
	getCurrent as userGetCurrent,
	getProposals as userGetProposals,
	getActivity as userGetActivity,
} from './actions/user';

// Analytics imports
import {
	analyticsOperations,
	analyticsFields,
	getProposalViews,
	getViewerDetails,
	getEngagement,
	getPageViews,
	getTimeSpent,
	getDeviceInfo,
	exportReport,
} from './actions/analytics';

// Log licensing notice once on load
const LICENSING_NOTICE = `[Velocity BPA Licensing Notice]

This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).

Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.

For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.`;

let licensingLogged = false;

export class Proposify implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Proposify',
		name: 'proposify',
		icon: 'file:proposify.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with Proposify API for proposal management, templates, and e-signatures',
		defaults: {
			name: 'Proposify',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'proposifyApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Analytics', value: 'analytics' },
					{ name: 'Comment', value: 'comment' },
					{ name: 'Contact', value: 'contact' },
					{ name: 'Fee', value: 'fee' },
					{ name: 'Proposal', value: 'proposal' },
					{ name: 'Prospect', value: 'prospect' },
					{ name: 'Section', value: 'section' },
					{ name: 'Signature', value: 'signature' },
					{ name: 'Template', value: 'template' },
					{ name: 'User', value: 'user' },
				],
				default: 'proposal',
			},
			// Operations
			...proposalOperations,
			...templateOperations,
			...prospectOperations,
			...contactOperations,
			...sectionOperations,
			...feeOperations,
			...signatureOperations,
			...commentOperations,
			...userOperations,
			...analyticsOperations,
			// Fields
			...proposalFields,
			...templateFields,
			...prospectFields,
			...contactFields,
			...sectionFields,
			...feeFields,
			...signatureFields,
			...commentFields,
			...userFields,
			...analyticsFields,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		// Log licensing notice once
		if (!licensingLogged) {
			console.warn(LICENSING_NOTICE);
			licensingLogged = true;
		}

		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				let result: INodeExecutionData[] = [];

				// Proposal operations
				if (resource === 'proposal') {
					switch (operation) {
						case 'get':
							result = await proposalGet.call(this, i);
							break;
						case 'getAll':
							result = await proposalGetAll.call(this, i);
							break;
						case 'create':
							result = await proposalCreate.call(this, i);
							break;
						case 'update':
							result = await proposalUpdate.call(this, i);
							break;
						case 'delete':
							result = await deleteProposal.call(this, i);
							break;
						case 'duplicate':
							result = await proposalDuplicate.call(this, i);
							break;
						case 'send':
							result = await proposalSend.call(this, i);
							break;
						case 'archive':
							result = await proposalArchive.call(this, i);
							break;
						case 'restore':
							result = await proposalRestore.call(this, i);
							break;
						case 'getMetrics':
							result = await proposalGetMetrics.call(this, i);
							break;
						case 'getContent':
							result = await proposalGetContent.call(this, i);
							break;
						case 'updateContent':
							result = await proposalUpdateContent.call(this, i);
							break;
						case 'downloadPdf':
							result = await proposalDownloadPdf.call(this, i);
							break;
						case 'setWon':
							result = await proposalSetWon.call(this, i);
							break;
						case 'setLost':
							result = await proposalSetLost.call(this, i);
							break;
					}
				}

				// Template operations
				if (resource === 'template') {
					switch (operation) {
						case 'get':
							result = await templateGet.call(this, i);
							break;
						case 'getAll':
							result = await templateGetAll.call(this, i);
							break;
						case 'create':
							result = await templateCreate.call(this, i);
							break;
						case 'update':
							result = await templateUpdate.call(this, i);
							break;
						case 'delete':
							result = await deleteTemplate.call(this, i);
							break;
						case 'duplicate':
							result = await templateDuplicate.call(this, i);
							break;
						case 'getContent':
							result = await templateGetContent.call(this, i);
							break;
						case 'updateContent':
							result = await templateUpdateContent.call(this, i);
							break;
						case 'getSections':
							result = await templateGetSections.call(this, i);
							break;
						case 'getVariables':
							result = await templateGetVariables.call(this, i);
							break;
					}
				}

				// Prospect operations
				if (resource === 'prospect') {
					switch (operation) {
						case 'get':
							result = await prospectGet.call(this, i);
							break;
						case 'getAll':
							result = await prospectGetAll.call(this, i);
							break;
						case 'create':
							result = await prospectCreate.call(this, i);
							break;
						case 'update':
							result = await prospectUpdate.call(this, i);
							break;
						case 'delete':
							result = await deleteProspect.call(this, i);
							break;
						case 'getProposals':
							result = await prospectGetProposals.call(this, i);
							break;
						case 'merge':
							result = await prospectMerge.call(this, i);
							break;
					}
				}

				// Contact operations
				if (resource === 'contact') {
					switch (operation) {
						case 'get':
							result = await contactGet.call(this, i);
							break;
						case 'getAll':
							result = await contactGetAll.call(this, i);
							break;
						case 'create':
							result = await contactCreate.call(this, i);
							break;
						case 'update':
							result = await contactUpdate.call(this, i);
							break;
						case 'delete':
							result = await deleteContact.call(this, i);
							break;
						case 'addToProspect':
							result = await contactAddToProspect.call(this, i);
							break;
						case 'removeFromProspect':
							result = await contactRemoveFromProspect.call(this, i);
							break;
					}
				}

				// Section operations
				if (resource === 'section') {
					switch (operation) {
						case 'get':
							result = await sectionGet.call(this, i);
							break;
						case 'getAll':
							result = await sectionGetAll.call(this, i);
							break;
						case 'create':
							result = await sectionCreate.call(this, i);
							break;
						case 'update':
							result = await sectionUpdate.call(this, i);
							break;
						case 'delete':
							result = await deleteSection.call(this, i);
							break;
						case 'duplicate':
							result = await sectionDuplicate.call(this, i);
							break;
						case 'addToLibrary':
							result = await sectionAddToLibrary.call(this, i);
							break;
						case 'getVersions':
							result = await sectionGetVersions.call(this, i);
							break;
					}
				}

				// Fee operations
				if (resource === 'fee') {
					switch (operation) {
						case 'get':
							result = await feeGet.call(this, i);
							break;
						case 'getAll':
							result = await feeGetAll.call(this, i);
							break;
						case 'create':
							result = await feeCreate.call(this, i);
							break;
						case 'update':
							result = await feeUpdate.call(this, i);
							break;
						case 'delete':
							result = await deleteFee.call(this, i);
							break;
						case 'reorder':
							result = await feeReorder.call(this, i);
							break;
						case 'calculate':
							result = await feeCalculate.call(this, i);
							break;
					}
				}

				// Signature operations
				if (resource === 'signature') {
					switch (operation) {
						case 'get':
							result = await signatureGet.call(this, i);
							break;
						case 'getAll':
							result = await signatureGetAll.call(this, i);
							break;
						case 'create':
							result = await signatureCreate.call(this, i);
							break;
						case 'update':
							result = await signatureUpdate.call(this, i);
							break;
						case 'delete':
							result = await deleteSignature.call(this, i);
							break;
						case 'getStatus':
							result = await signatureGetStatus.call(this, i);
							break;
						case 'sendReminder':
							result = await signatureSendReminder.call(this, i);
							break;
						case 'revoke':
							result = await signatureRevoke.call(this, i);
							break;
					}
				}

				// Comment operations
				if (resource === 'comment') {
					switch (operation) {
						case 'get':
							result = await commentGet.call(this, i);
							break;
						case 'getAll':
							result = await commentGetAll.call(this, i);
							break;
						case 'create':
							result = await commentCreate.call(this, i);
							break;
						case 'update':
							result = await commentUpdate.call(this, i);
							break;
						case 'delete':
							result = await deleteComment.call(this, i);
							break;
						case 'resolve':
							result = await commentResolve.call(this, i);
							break;
						case 'reply':
							result = await commentReply.call(this, i);
							break;
					}
				}

				// User operations
				if (resource === 'user') {
					switch (operation) {
						case 'get':
							result = await userGet.call(this, i);
							break;
						case 'getAll':
							result = await userGetAll.call(this, i);
							break;
						case 'getCurrent':
							result = await userGetCurrent.call(this, i);
							break;
						case 'getProposals':
							result = await userGetProposals.call(this, i);
							break;
						case 'getActivity':
							result = await userGetActivity.call(this, i);
							break;
					}
				}

				// Analytics operations
				if (resource === 'analytics') {
					switch (operation) {
						case 'getProposalViews':
							result = await getProposalViews.call(this, i);
							break;
						case 'getViewerDetails':
							result = await getViewerDetails.call(this, i);
							break;
						case 'getEngagement':
							result = await getEngagement.call(this, i);
							break;
						case 'getPageViews':
							result = await getPageViews.call(this, i);
							break;
						case 'getTimeSpent':
							result = await getTimeSpent.call(this, i);
							break;
						case 'getDeviceInfo':
							result = await getDeviceInfo.call(this, i);
							break;
						case 'exportReport':
							result = await exportReport.call(this, i);
							break;
					}
				}

				returnData.push(...result);
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({ json: { error: (error as Error).message }, pairedItem: { item: i } });
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
