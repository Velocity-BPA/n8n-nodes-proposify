/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IDataObject, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { proposifyApiRequest, proposifyApiRequestAllItems } from '../../transport';
import { parseFilters, toExecutionData } from '../../utils/helpers';

export async function getAll(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const returnAll = this.getNodeParameter('returnAll', index) as boolean;
	const filters = this.getNodeParameter('filters', index, {}) as IDataObject;

	const query = parseFilters(filters);

	if (returnAll) {
		const items = await proposifyApiRequestAllItems.call(this, 'GET', '/proposals', {}, query);
		return toExecutionData(items);
	}

	const limit = this.getNodeParameter('limit', index) as number;
	query.limit = limit;
	query.page = 1;

	const response = await proposifyApiRequest.call(this, 'GET', '/proposals', {}, query);
	const items = (response.data as IDataObject[]) || [];

	return toExecutionData(items);
}
