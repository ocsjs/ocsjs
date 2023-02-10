import express from 'express';
import Store from 'electron-store';
import getPort from 'get-port';
import { Logger } from '../logger';
import { appStore } from '../store';
import path from 'path';
import axios from 'axios';
import { app as electronApp } from 'electron';
const logger = Logger('server');

interface Folder {
	uid: string;
	children: Record<string, Folder>;
}

export async function startupServer() {
	const app = express();
	const store = new Store<typeof appStore & { [x: string]: any }>();

	app.use((req, res, next) => {
		res.setHeader('Access-Control-Allow-Origin', req.headers.origin || 'unknown');
		res.setHeader('Access-Control-Allow-Credentials', 'true');
		res.setHeader('Access-Control-Allow-Headers', 'Content-Type, request-id, if-none-match');
		res.setHeader('Access-Control-Allow-Methods', '*');
		if (req.method === 'OPTIONS') {
			res.sendStatus(204);
			return;
		}
		next();
	});
	// 解析 post 数据
	app.use(express.urlencoded({ extended: false }));
	app.use(express.json());

	app.get('/ocs-global-setting', (req, res) => {
		// @ts-ignore
		res.json(store.store.render.setting.ocs);
	});

	/** 获取 browser 数据 */
	app.get('/browser', (req, res) => {
		const uid = req.query.uid?.toString();
		if (uid) {
			// @ts-ignore
			const folder: Folder = store.store.render.browser.root;
			let temp: Folder | undefined;
			const list = [folder];
			while (list.length > 0) {
				temp = list.shift();
				if (temp && temp.uid === uid) {
					return res.json(temp);
				}

				list.push(...(temp?.children ? Object.keys(temp.children).map((k) => temp!.children[k]) : []));
			}
		} else {
			res.json({});
		}
	});

	/** 请求转发 */
	app.post('/proxy', async (req, res) => {
		const { method, url, data, headers } = req.body || {};
		axios
			.request({
				method,
				url,
				data,
				headers
			})
			.then(({ data }) => {
				res.send(data);
			})
			.catch((err) => {
				res.send(err);
			});
	});

	app.get(/\/ocs-action_.+/, (req, res) => {
		res.send('正在执行脚本 : ' + req.path + ' 请勿操作。');
	});

	// 静态资源
	app.use(
		express.static(electronApp.isPackaged ? path.resolve(__dirname, '../../../public') : path.resolve('./public/'))
	);

	const port = await getPort({ port: [15319, 153120, 15321] });

	store.store.server = store.store.server || {};
	store.store.server.port = port;

	app.listen(port, () => {
		logger.info('服务启动成功，端口：', port);
	});
}
