const { ipcRenderer } = require('electron');

ipcRenderer.on('SET_SOURCE', async (event, sourceId) => {
	try {
		const stream = await navigator.mediaDevices.getUserMedia({
			audio: false,
			video: {
				mandatory: {
					chromeMediaSource: 'desktop',
					chromeMediaSourceId: sourceId,
					maxFrameRate: 240
				}
			}
		});
		handleStream(stream);
	} catch (e) {
		handleError(e);
	}
});

function handleStream(stream) {
	const video = document.createElement('video');
	video.srcObject = stream;
	video.onloadedmetadata = (e) => video.play();

	document.body.append(video);
}

function handleError(e) {
	console.log(e);
}
