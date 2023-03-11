import { PlaywrightScript } from './script';
import { CXPhoneLoginScript, CXUnitLoginScript } from './automation/wk/cx';
import { ZHSPhoneLoginScript, ZHSUnitLoginScript } from './automation/wk/zhs';
import { NewPageScript } from './automation';

export const scripts: PlaywrightScript<any>[] = [
	CXPhoneLoginScript,
	CXUnitLoginScript,
	ZHSPhoneLoginScript,
	ZHSUnitLoginScript,
	NewPageScript
];
