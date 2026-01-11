/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IDataObject, INodeExecutionData } from 'n8n-workflow';

/**
 * Simplify the output data by removing nested structures
 */
export function simplifyOutput(items: IDataObject[], fields?: string[]): IDataObject[] {
	if (!fields || fields.length === 0) {
		return items;
	}

	return items.map((item) => {
		const simplified: IDataObject = {};
		for (const field of fields) {
			if (item[field] !== undefined) {
				simplified[field] = item[field];
			}
		}
		return simplified;
	});
}

/**
 * Convert execution data to array format
 */
export function toExecutionData(items: IDataObject[]): INodeExecutionData[] {
	return items.map((item) => ({
		json: item,
	}));
}

/**
 * Process additional fields from node parameters
 */
export function processAdditionalFields(additionalFields: IDataObject): IDataObject {
	const processed: IDataObject = {};

	for (const [key, value] of Object.entries(additionalFields)) {
		if (value !== undefined && value !== null && value !== '') {
			// Handle nested objects
			if (typeof value === 'object' && !Array.isArray(value)) {
				const nested = value as IDataObject;
				if (nested.values && Array.isArray(nested.values)) {
					processed[key] = nested.values;
				} else {
					processed[key] = value;
				}
			} else {
				processed[key] = value;
			}
		}
	}

	return processed;
}

/**
 * Format date for API requests
 */
export function formatDate(date: string | Date): string {
	if (typeof date === 'string') {
		return new Date(date).toISOString();
	}
	return date.toISOString();
}

/**
 * Parse filters from node parameters
 */
export function parseFilters(filters: IDataObject): IDataObject {
	const query: IDataObject = {};

	for (const [key, value] of Object.entries(filters)) {
		if (value !== undefined && value !== null && value !== '') {
			if (key === 'status' && Array.isArray(value)) {
				query.status = (value as string[]).join(',');
			} else if (key === 'dateFrom' || key === 'dateTo') {
				query[key === 'dateFrom' ? 'date_from' : 'date_to'] = formatDate(value as string);
			} else {
				// Convert camelCase to snake_case for API
				const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
				query[snakeKey] = value;
			}
		}
	}

	return query;
}

/**
 * Convert snake_case to camelCase
 */
export function snakeToCamel(str: string): string {
	return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Convert camelCase to snake_case
 */
export function camelToSnake(str: string): string {
	return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

/**
 * Transform object keys from snake_case to camelCase
 */
export function transformKeysToCase(
	obj: IDataObject,
	transform: 'camel' | 'snake',
): IDataObject {
	const result: IDataObject = {};
	const transformFn = transform === 'camel' ? snakeToCamel : camelToSnake;

	for (const [key, value] of Object.entries(obj)) {
		const newKey = transformFn(key);
		if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
			result[newKey] = transformKeysToCase(value as IDataObject, transform);
		} else if (Array.isArray(value)) {
			result[newKey] = value.map((item) =>
				typeof item === 'object' && item !== null
					? transformKeysToCase(item as IDataObject, transform)
					: item,
			);
		} else {
			result[newKey] = value;
		}
	}

	return result;
}
