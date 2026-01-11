/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IDataObject, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { proposifyApiRequest } from '../../transport';
import { processAdditionalFields } from '../../utils/helpers';

export async function create(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const name = this.getNodeParameter('name', index) as string;
	const templateId = this.getNodeParameter('templateId', index) as string;
	const additionalFields = this.getNodeParameter('additionalFields', index, {}) as IDataObject;

	const body: IDataObject = {
		name,
		template_id: templateId,
		...processAdditionalFields(additionalFields),
	};

	// Handle prospect_id separately if provided
	if (additionalFields.prospectId) {
		body.prospect_id = additionalFields.prospectId;
		delete body.prospectId;
	}

	// Handle value and currency
	if (additionalFields.value !== undefined) {
		body.value = additionalFields.value;
	}
	if (additionalFields.currency) {
		body.currency = additionalFields.currency;
	}

	// Handle expiration date
	if (additionalFields.expiresAt) {
		body.expires_at = additionalFields.expiresAt;
	}

	const response = await proposifyApiRequest.call(this, 'POST', '/proposals', body);

	return [{ json: response }];
}
