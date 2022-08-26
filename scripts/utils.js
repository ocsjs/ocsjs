const { exec } = require('child_process');

/** 将 exec 错误信息输出到 stdout */
function execOut(command, ...opts) {
	const cmd = exec(command, ...opts);
	cmd.stdout.pipe(process.stdout);
	cmd.stderr.pipe(process.stdout);
	return cmd;
}

exports.execOut = execOut;
