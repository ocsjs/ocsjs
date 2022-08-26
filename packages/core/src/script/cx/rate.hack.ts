/* eslint-disable no-undef */
// @ts-nocheck

import { logger } from '../../logger';

/**
 * 屏蔽倍速限制
 */
export function rateHack() {
	try {
		hack();
		window.document.addEventListener('readystatechange', hack);
		window.addEventListener('load', hack);
	} catch (e) {
		console.error(e.message);
	}
}

function hack() {
	if (typeof videojs !== 'undefined' && typeof Ext !== 'undefined') {
		logger('debug', '倍速破解启动');

		Ext.define('ans.VideoJs', {
			override: 'ans.VideoJs',
			constructor: function (b) {
				b = b || {};
				const e = this;
				e.addEvents(['seekstart']);
				e.mixins.observable.constructor.call(e, b);
				const c = videojs(b.videojs, e.params2VideoOpt(b.params), function () {});
				Ext.fly(b.videojs).on('contextmenu', function (f) {
					f.preventDefault();
				});
				Ext.fly(b.videojs).on('keydown', function (f) {
					if (f.keyCode === 32 || f.keyCode === 37 || f.keyCode === 39 || f.keyCode === 107) {
						f.preventDefault();
					}
				});
				if (c.videoJsResolutionSwitcher) {
					c.on('resolutionchange', function () {
						const g = c.currentResolution();
						const f = g.sources ? g.sources[0].res : false;
						Ext.setCookie('resolution', f);
					});
				}
			}
		});
	}
}
