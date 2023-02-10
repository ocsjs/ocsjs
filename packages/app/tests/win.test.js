// const { createWindow } = require('../lib/src/main');
const { app, BrowserWindow, desktopCapturer } = require('electron');

const path = require('path');

app.commandLine.appendSwitch('webrtc-max-cpu-consumption-percentage', '100');

app
	.whenReady()
	.then(async (result) => {
		const win = new BrowserWindow({
			width: 800,
			height: 600,
			webPreferences: { preload: path.join(__dirname, 'preload.js') }
		});

		win.loadFile(path.join(__dirname, './test.html'));

		win.webContents.openDevTools({ mode: 'right', activate: true });

		desktopCapturer.getSources({ types: ['window'] }).then(async (sources) => {});
	})
	.catch(console.error);
