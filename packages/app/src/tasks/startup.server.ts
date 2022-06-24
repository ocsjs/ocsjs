import express from 'express';
import Store from 'electron-store';
import getPort from 'get-port';
import { Logger } from '../logger';
const logger = Logger('server');

export async function startupServer() {
	const app = express();
	const store = new Store();

	app.get('/setting', (req, res) => {
		res.json(store.store.setting);
	});

	const port = await getPort({ port: [15319, 153120, 15321] });

	app.listen(port, () => {
		logger.info('服务启动成功，端口：', port);
	});
}
