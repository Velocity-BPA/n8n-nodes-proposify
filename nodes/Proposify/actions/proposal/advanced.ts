/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IDataObject, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { proposifyApiRequest, proposifyApiDownload } from '../../transport';

export async function getMetrics(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const proposalId = this.getNodeParameter('proposalId', index) as string;

	const response = await proposifyApiRequest.call(
		this,
		'GET',
		`/proposals/${proposalId}/metrics`,
	);

	return [{ json: response }];
}

export async function getContent(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const proposalId = this.getNodeParameter('proposalId', index) as string;

	const response = await proposifyApiRequest.call(
		this,
		'GET',
		`/proposals/${proposalId}/content`,
	);

	return [{ json: response }];
}

export async function updateContent(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const proposalId = this.getNodeParameter('proposalId', index) as string;
	const contentBlocks = this.getNodeParameter('contentBlocks', index) as IDataObject;

	const body: IDataObject = {
		blocks: contentBlocks.blocks || [],
	};

	const response = await proposifyApiRequest.call(
		this,
		'PUT',
		`/proposals/${proposalId}/content`,
		body,
	);

	return [{ json: response }];
}

export async function downloadPdf(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const proposalId = this.getNodeParameter('proposalId', index) as string;
	const binaryPropertyName = this.getNodeParameter('binaryPropertyName', index, 'data') as string;

	const buffer = await proposifyApiDownload.call(this, `/proposals/${proposalId}/pdf`);

	const fileName = `proposal_${proposalId}.pdf`;

	return [
		{
			json: { proposalId, fileName },
			binary: {
				[binaryPropertyName]: await this.helpers.prepareBinaryData(
					buffer,
					fileName,
					'application/pdf',
				),
			},
		},
	];
}

export async function setWon(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const proposalId = this.getNodeParameter('proposalId', index) as string;
	const additionalFields = this.getNodeParameter('additionalFields', index, {}) as IDataObject;

	const body: IDataObject = {};

	if (additionalFields.wonValue !== undefined) {
		body.won_value = additionalFields.wonValue;
	}
	if (additionalFields.notes) {
		body.notes = additionalFields.notes;
	}

	const response = await proposifyApiRequest.call(
		this,
		'POST',
		`/proposals/${proposalId}/won`,
		body,
	);

	return [{ json: response }];
}

export async function setLost(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const proposalId = this.getNodeParameter('proposalId', index) as string;
	const additionalFields = this.getNodeParameter('additionalFields', index, {}) as IDataObject;

	const body: IDataObject = {};

	if (additionalFields.lostReason) {
		body.lost_reason = additionalFields.lostReason;
	}
	if (additionalFields.notes) {
		body.notes = additionalFields.notes;
	}

	const response = await proposifyApiRequest.call(
		this,
		'POST',
		`/proposals/${proposalId}/lost`,
		body,
	);

	return [{ json: response }];
}
