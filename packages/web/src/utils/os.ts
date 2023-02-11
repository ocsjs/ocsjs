import { remote } from './remote';

/** 获取 windows 版本号 */
export async function getWindowsRelease() {
	const release = await remote.os.call('release');

	if (release.startsWith('6.1')) {
		return 'win7';
	} else if (parseInt(release.split('.').at(-1) || '0') > 22000) {
		return 'win11';
	} else {
		return 'win10';
	}
}
