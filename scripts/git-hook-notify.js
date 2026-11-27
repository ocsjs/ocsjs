/**
 * Git 钩子原生弹窗通知（零依赖）
 *
 * 用途：VSCode 等 GUI 客户端执行 push 时，pre-push 钩子拦截失败只显示
 * 「Show Command Output」按钮，开发者看不到具体原因。
 * 此脚本在钩子失败时弹出系统原生对话框，直接告知失败原因。
 *
 * 用法: node scripts/git-hook-notify.js <title> <message>
 *
 * - Windows: 优先 WScript.Shell Popup（COM，全 Windows 版本可用、无需加载
 *   .NET 程序集/STA 线程，比 WPF MessageBox 可靠），失败回退 WPF MessageBox
 * - macOS: osascript 对话框
 * - Linux: notify-send / zenity
 *
 * 弹窗失败不影响钩子本身退出码，错误写入 .git/hook-notify-error.log 便于排查。
 */
const { spawn, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const title = process.argv[2] || 'Git Hook';
const message = process.argv[3] || '';

function logError(err) {
	try {
		const logPath = path.join(__dirname, '..', '.git', 'hook-notify-error.log');
		fs.appendFileSync(logPath, `[${new Date().toISOString()}] ${err}\n`);
	} catch {
		// 忽略日志写入失败
	}
}

if (process.platform === 'win32') {
	// PowerShell 单引号字符串支持字面换行，单引号以两个单引号转义
	const psStr = (s) => `'${String(s).replace(/'/g, "''")}'`;
	// 48 = 警告图标，0 = 不自动关闭
	const ps = `$w = New-Object -ComObject WScript.Shell; $w.Popup(${psStr(message)}, 0, ${psStr(title)}, 48) | Out-Null`;
	// 同步执行验证弹窗可用（对话框阻塞至用户点击，exit 0 即弹窗成功展示）
	const result = spawnSync('powershell', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', ps], {
		stdio: 'pipe'
	});
	if (result.status !== 0 || result.error) {
		logError(`WScript.Shell Popup 失败: status=${result.status} error=${result.error} stderr=${result.stderr}`);
		// 回退：WPF MessageBox（-STA 保证线程模型）
		try {
			spawn(
				'powershell',
				[
					'-NoProfile',
					'-STA',
					'-ExecutionPolicy',
					'Bypass',
					'-Command',
					`Add-Type -AssemblyName PresentationFramework; [System.Windows.MessageBox]::Show(${psStr(message)}, ${psStr(
						title
					)}, 'OK', 'Warning') | Out-Null`
				],
				{ detached: true, stdio: 'ignore' }
			).unref();
		} catch (e) {
			logError(`MessageBox 回退失败: ${e}`);
		}
	}
} else if (process.platform === 'darwin') {
	// AppleScript 字符串字面量不支持换行，用 return 拼接多行
	const asText = String(message)
		.split('\n')
		.map((line) => `"${line.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`)
		.join(' & return & ');
	try {
		spawn(
			'osascript',
			[
				'-e',
				`display dialog ${asText} with title "${String(title).replace(
					/"/g,
					'\\"'
				)}" buttons {"OK"} default button "OK" with icon caution`
			],
			{ detached: true, stdio: 'ignore' }
		).unref();
	} catch (e) {
		logError(`osascript 失败: ${e}`);
	}
} else {
	try {
		spawn(
			'sh',
			[
				'-c',
				`command -v notify-send >/dev/null && notify-send "$0" "$1" || zenity --warning --title="$0" --text="$1"`,
				title,
				message
			],
			{ detached: true, stdio: 'ignore' }
		).unref();
	} catch (e) {
		logError(`notify-send 失败: ${e}`);
	}
}
