import assert from 'node:assert/strict';
import { playMediaWithAbortRetry } from '../packages/scripts/src/utils/study';

function fakeMedia(play: () => Promise<void>): HTMLMediaElement {
	return {
		play,
		paused: true,
		ended: false,
		isConnected: true
	} as unknown as HTMLMediaElement;
}

async function main() {
	let calls = 0;
	const successful = fakeMedia(async () => {
		calls++;
	});
	await playMediaWithAbortRetry(successful, [0]);
	assert.equal(calls, 1, 'successful play should not be repeated');

	calls = 0;
	const onceAborted = fakeMedia(async () => {
		calls++;
		if (calls === 1) throw new DOMException('Media loading interrupted', 'AbortError');
	});
	await playMediaWithAbortRetry(onceAborted, [0, 0]);
	assert.equal(calls, 2, 'AbortError should be retried');

	calls = 0;
	const alwaysAborted = fakeMedia(async () => {
		calls++;
		throw new DOMException('Media loading interrupted', 'AbortError');
	});
	await assert.rejects(playMediaWithAbortRetry(alwaysAborted, [0, 0]), { name: 'AbortError' });
	assert.equal(calls, 3, 'retries must be bounded');

	calls = 0;
	const denied = fakeMedia(async () => {
		calls++;
		throw new DOMException('User interaction required', 'NotAllowedError');
	});
	await assert.rejects(playMediaWithAbortRetry(denied, [0, 0]), { name: 'NotAllowedError' });
	assert.equal(calls, 1, 'autoplay permissions must not be bypassed');

	calls = 0;
	const detached = fakeMedia(async () => {
		calls++;
		(detached as unknown as { isConnected: boolean }).isConnected = false;
		throw new DOMException('Media loading interrupted', 'AbortError');
	});
	await assert.rejects(playMediaWithAbortRetry(detached, [0]), { name: 'AbortError' });
	assert.equal(calls, 1, 'removed players must not be restarted');

	calls = 0;
	const startedElsewhere = fakeMedia(async () => {
		calls++;
		throw new DOMException('Media loading interrupted', 'AbortError');
	});
	setTimeout(() => {
		(startedElsewhere as unknown as { paused: boolean }).paused = false;
	}, 0);
	await playMediaWithAbortRetry(startedElsewhere, [10]);
	assert.equal(calls, 1, 'an already playing element must not be restarted');

	console.log('PASS: 6 Chaoxing media playback recovery tests');
}

void main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
