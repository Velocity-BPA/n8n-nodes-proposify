/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IDataObject, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { proposifyApiRequest } from '../../transport';

export async function deleteProposal(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const proposalId = this.getNodeParameter('proposalId', index) as string;

	await proposifyApiRequest.call(this, 'DELETE', `/proposals/${proposalId}`);

	return [{ json: { success: true, proposalId } }];
}

export async function duplicate(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const proposalId = this.getNodeParameter('proposalId', index) as string;
	const additionalFields = this.getNodeParameter('additionalFields', index, {}) as IDataObject;

	const body: IDataObject = {};

	if (additionalFields.name) {
		body.name = additionalFields.name;
	}

	const response = await proposifyApiRequest.call(
		this,
		'POST',
		`/proposals/${proposalId}/duplicate`,
		body,
	);

	return [{ json: response }];
}

export async function send(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const proposalId = this.getNodeParameter('proposalId', index) as string;
	const recipients = this.getNodeParameter('recipients', index) as IDataObject;
	const additionalFields = this.getNodeParameter('additionalFields', index, {}) as IDataObject;

	const body: IDataObject = {
		recipients: recipients.recipientValues || [],
	};

	if (additionalFields.subject) {
		body.subject = additionalFields.subject;
	}
	if (additionalFields.message) {
		body.message = additionalFields.message;
	}
	if (additionalFields.sendAt) {
		body.send_at = additionalFields.sendAt;
	}

	const response = await proposifyApiRequest.call(
		this,
		'POST',
		`/proposals/${proposalId}/send`,
		body,
	);

	return [{ json: response }];
}

export async function archive(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const proposalId = this.getNodeParameter('proposalId', index) as string;

	const response = await proposifyApiRequest.call(
		this,
		'POST',
		`/proposals/${proposalId}/archive`,
	);

	return [{ json: response }];
}

export async function restore(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const proposalId = this.getNodeParameter('proposalId', index) as string;

	const response = await proposifyApiRequest.call(
		this,
		'POST',
		`/proposals/${proposalId}/restore`,
	);

	return [{ json: response }];
}
