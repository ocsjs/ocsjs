import * as Core from './src/index';

declare global {
	export declare const OCS: typeof Core;
	export declare const STYLE: string;
	export declare const __OCS_MATCH_LOCALHOST__: boolean;
}

declare module 'dom-to-image-more' {
	import domToImage = require('dom-to-image');
	export = domToImage;
}
