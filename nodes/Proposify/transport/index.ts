/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
	IDataObject,
	IExecuteFunctions,
	IHookFunctions,
	IHttpRequestMethods,
	ILoadOptionsFunctions,
	IRequestOptions,
	IWebhookFunctions,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

const BASE_URL = 'https://api.proposify.com/v1';

/**
 * Make an authenticated API request to Proposify
 */
export async function proposifyApiRequest(
	this: IExecuteFunctions | IWebhookFunctions | IHookFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body?: IDataObject,
	query?: IDataObject,
): Promise<IDataObject> {
	const options: IRequestOptions = {
		method,
		uri: `${BASE_URL}${endpoint}`,
		json: true,
	};

	if (body && Object.keys(body).length > 0) {
		options.body = body;
	}

	if (query && Object.keys(query).length > 0) {
		options.qs = query;
	}

	try {
		const response = await this.helpers.requestWithAuthentication.call(
			this,
			'proposifyApi',
			options,
		);
		return response as IDataObject;
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject);
	}
}

/**
 * Make an API request and return all items using pagination
 */
export async function proposifyApiRequestAllItems(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body?: IDataObject,
	query?: IDataObject,
): Promise<IDataObject[]> {
	const returnData: IDataObject[] = [];
	let page = 1;
	const limit = 50;

	query = query || {};
	query.limit = limit;

	while (true) {
		query.page = page;

		const response = await proposifyApiRequest.call(this, method, endpoint, body, query);

		if (response.data && Array.isArray(response.data)) {
			returnData.push(...(response.data as IDataObject[]));

			if ((response.data as IDataObject[]).length < limit) {
				break;
			}
		} else {
			break;
		}

		page++;
	}

	return returnData;
}

/**
 * Download a file (PDF) from Proposify
 */
export async function proposifyApiDownload(
	this: IExecuteFunctions,
	endpoint: string,
): Promise<Buffer> {
	const options: IRequestOptions = {
		method: 'GET',
		uri: `${BASE_URL}${endpoint}`,
		encoding: null,
		resolveWithFullResponse: true,
	};

	try {
		const response = await this.helpers.requestWithAuthentication.call(
			this,
			'proposifyApi',
			options,
		);
		return response.body as Buffer;
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject);
	}
}

/**
 * Handle rate limiting by checking headers
 */
export function checkRateLimit(headers: IDataObject): { remaining: number; resetIn: number } {
	const remaining = parseInt((headers['x-ratelimit-remaining'] as string) || '100', 10);
	const resetIn = parseInt((headers['x-ratelimit-reset'] as string) || '60', 10);
	return { remaining, resetIn };
}

/**
 * Simple delay helper for rate limiting
 */
export function delay(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
