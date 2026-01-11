/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IDataObject, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { proposifyApiRequest } from '../../transport';
import { processAdditionalFields } from '../../utils/helpers';

export async function update(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const proposalId = this.getNodeParameter('proposalId', index) as string;
	const updateFields = this.getNodeParameter('updateFields', index, {}) as IDataObject;

	const body: IDataObject = {};

	if (updateFields.name) {
		body.name = updateFields.name;
	}
	if (updateFields.prospectId) {
		body.prospect_id = updateFields.prospectId;
	}
	if (updateFields.value !== undefined) {
		body.value = updateFields.value;
	}
	if (updateFields.currency) {
		body.currency = updateFields.currency;
	}
	if (updateFields.expiresAt) {
		body.expires_at = updateFields.expiresAt;
	}

	const processed = processAdditionalFields(updateFields);
	Object.assign(body, processed);

	const response = await proposifyApiRequest.call(
		this,
		'PUT',
		`/proposals/${proposalId}`,
		body,
	);

	return [{ json: response }];
}
