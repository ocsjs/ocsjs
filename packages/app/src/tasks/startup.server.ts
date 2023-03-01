import express from 'express';
import getPort from 'get-port';
import { Logger } from '../logger';
import path from 'path';
import axios from 'axios';
import { store } from '../store';
import os from 'os';
import { getProjectPath } from '../utils';
import { canOCR, det, ocr } from '../utils/ocr';

const logger = Logger('server');

interface Folder {
	uid: string;
	children: Record<string, Folder>;
	store: any;
}

export async function startupServer() {
	const app = express();

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

	app.get('/state', (req, res) => {
		res.json({
			public: path.join(getProjectPath(), './public'),
			project: getProjectPath()
		});
	});

	app.get('/ocs-global-setting', (req, res) => {
		res.json(store.store.render.setting.ocs);
	});

	/** 获取 browser 数据 */
	app.get('/browser', (req, res) => {
		const uid = req.headers['browser-uid']?.toString();
		if (uid) {
			// @ts-ignore
			const folder: Folder = store.store.render.browser.root;
			let temp: Folder | undefined;
			const list: any[] = [folder];
			while (list.length > 0) {
				temp = list.shift();
				if (temp && temp.uid === uid) {
					// 当独立配置为空的时候使用全局配置
					if (Object.keys(temp.store).length === 0) {
						temp.store = store?.store?.render?.setting?.ocs?.store || {};
					}
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

	// ocr 验证码破解
	app.post('/ocr', async (req, res) => {
		const base64 = req.body.ocr?.toString();
		const det_target = req.body.det_target?.toString();
		const det_bg = req.body.det_bg?.toString();

		if (canOCR()) {
			try {
				if (base64) {
					res.json({ canOCR: true, ocr: await ocr(base64) });
				} else if (det_target && det_bg) {
					res.json({ canOCR: true, det: await det(det_target, det_bg) });
				}
			} catch (err) {
				res.json({ canOCR: true, error: err });
			}
		} else {
			res.json({ canOCR: false });
		}
	});

	// 静态资源
	app.use(express.static(path.join(getProjectPath(), './public')));

	const port = await getPort({ port: [15319, 15320, 15321] });

	store.store.server = store.store.server || {};
	store.store.server.port = port;

	app.listen(port, () => {
		logger.info('服务启动成功，端口：', port);
	});

	/** 为后续多主机控制做准备 */
	const localIP = getLocalIP();
	if (localIP) {
		app.listen(port, localIP, () => {
			logger.info(`局域网服务启动成功 : ${localIP}:${port}`);
		});
	}
}
/** 获取局域网IP */
function getLocalIP() {
	const interfaces = os.networkInterfaces();
	for (const devName in interfaces) {
		for (const iface of interfaces[devName] || []) {
			if (iface.family === 'IPv4' && iface.address !== '127.0.0.1' && !iface.internal) {
				return iface.address;
			}
		}
	}
}
