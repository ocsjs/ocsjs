const { OCSApi } = require('@ocsjs/common');
const semver = require('semver');

(async () => {
	const infos = await OCSApi.getInfos();

	const versions = infos.versions || [];

	const newVersion = versions.find((version) => semver.lt('1.2.2', version.tag));

	console.log(newVersion);
})();
