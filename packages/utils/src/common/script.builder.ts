import { readFileSync, writeFileSync } from 'fs';
import fetch from 'node-fetch';

export type MetaDataType = string | string[];

/**
 * 脚本头部信息格式
 */
export interface MetaDataFormatter {
	header: string;
	footer: string;
	prefix: string;
	symbol: string;
	gap: string;
}

/**
 * 脚本头部信息
 */
export interface Metadata {
	[x: string]: any;
	name: string;
	version: string;
	description: string;
	author: MetaDataType;
	license: string;
	namespace: string;
	homepage: string;
	source: string;
	icon: string;
	connect: MetaDataType;
	match: MetaDataType;
	grant: MetaDataType;
	require: MetaDataType;
	resource: MetaDataType;
	'run-at': 'document-start' | 'document-end' | 'document-idle' | 'document-body' | 'document-body';
}

/**
 * 创建脚本参数
 */
export interface CreateOptions {
	parseRequire: boolean;
	parseResource: boolean;
	resourceBuilder: (key: string, value: string) => string;
	metaDataFormatter: MetaDataFormatter;
	entry: string;
	dist: string;
	metadata: Metadata;
}

export const DEFAULT_METADATA: Partial<Metadata> = {
	name: 'New Userscript',
	version: '0.1',
	description: 'try to take over the world!',
	author: ['You'],
	license: 'MIT',
	match: ['http://*/*'],
	grant: 'none',
	'run-at': 'document-idle'
};

/**
 * 创建脚本头部信息
 * @param metadata
 * @returns
 */
export function createUserScriptMetadata(formatter: MetaDataFormatter, metadata: Metadata) {
	const contents = [];
	// 最长字段
	const maxLength = Object.keys(metadata).reduce<number>((pre, cur) => Math.max(cur.length, pre), 0);

	const lineBuilder = (key: string, value: string) =>
		[formatter.symbol, key.padEnd(maxLength, ' '), formatter.gap, value || ''].join('');

	for (const key in metadata) {
		if (Object.prototype.hasOwnProperty.call(metadata, key)) {
			const element = metadata[key];
			if (Array.isArray(element)) {
				contents.push(...element.map((el) => lineBuilder(key, el)));
			} else {
				contents.push(lineBuilder(key, element));
			}
		}
	}
	return [formatter.header, ...contents, formatter.footer].map((line) => formatter.prefix + line).join('\n');
}

/**
 * 解析脚本头部信息
 * @param require 外部依赖
 */
export async function parseMetaDataRequires(require: Metadata['require'] = []) {
	const requires: string[] = [];
	for (const value of Array.isArray(require) ? require : [require]) {
		if (value) {
			const text = value.startsWith('http')
				? await fetch(value).then((res) => res.text())
				: readFileSync(value).toString();
			requires.push(text);
		}
	}
	return requires.join('\n');
}

/**
 * 解析脚本头部信息
 * @param resource 资源信息
 * @param resourceBuilder 变量声明器
 */
export async function parseMetaDataResources(
	resource: Metadata['resource'] = [],
	resourceBuilder: (key: string, value: string) => string
) {
	const resources: string[] = [];
	for (const line of Array.isArray(resource) ? resource : [resource]) {
		const values = line.replace(/ /g, ' ').split(' ');

		const text = values[1].startsWith('http')
			? await fetch(values[1]).then((res) => res.text())
			: readFileSync(values[1]).toString();
		resources.push(resourceBuilder(values[0], text));
	}
	return resources.join('\n');
}

/**
 * 创建用户脚本
 */
export async function createUserScript(opts: CreateOptions) {
	let requires = '';
	let resources = '';

	if (opts.parseRequire) {
		// 解析外部依赖
		requires = await parseMetaDataRequires(opts.metadata.require);
		opts.metadata.require = [];
	}
	if (opts.parseResource) {
		// 解析资源文件
		resources = await parseMetaDataResources(opts.metadata.resource, opts.resourceBuilder);
		opts.metadata.resource = [];
	}
	const content = [
		// 创建脚本头部信息
		createUserScriptMetadata(opts.metaDataFormatter, Object.assign(DEFAULT_METADATA, opts.metadata)),
		requires,
		resources,
		// 合并入口文件
		readFileSync(opts.entry).toString()
	].join('\n'.repeat(2));

	return writeFileSync(opts.dist, content);
}
