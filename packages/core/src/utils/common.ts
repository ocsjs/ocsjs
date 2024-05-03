import debounce from 'lodash/debounce';

/**
 * 公共的工具库
 */
export const $ = {
	/** 创建唯一id ， 不带横杠 */
	uuid() {
		return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
			const r = (Math.random() * 16) | 0;
			const v = c === 'x' ? r : (r & 0x3) | 0x8;
			return v.toString(16);
		});
	},

	/**
	 * 生成随机数， 使用 Math.round 取整
	 * @param min 最小值
	 * @param max 最大值
	 */
	random(min: number, max: number) {
		return Math.round(Math.random() * (max - min)) + min;
	},

	/**
	 * 暂停
	 * @param period 毫秒
	 */
	async sleep(period: number): Promise<void> {
		return new Promise((resolve) => {
			setTimeout(resolve, period);
		});
	},

	/**
	 * 当前是否处于浏览器环境
	 */
	isInBrowser(): boolean {
		return typeof window !== 'undefined' && typeof window.document !== 'undefined';
	},

	/**
	 * 使元素变成纯文本对象，（跨域时对象上下文会被销毁）
	 * @param el 元素
	 */
	elementToRawObject(el: HTMLElement | undefined | null) {
		return {
			innerText: el?.innerText,
			innerHTML: el?.innerHTML,
			textContent: el?.textContent
		} as any;
	},

	/**
	 * 监听页面宽度变化
	 * @param el 任意元素，如果此元素被移除，则不执行 resize 回调
	 * @param handler resize 回调
	 */
	onresize<E extends HTMLElement>(el: E, handler: (el: E) => void) {
		const resize = debounce(() => {
			/**
			 * 如果元素被删除，则移除监听器
			 * 不使用 el.parentElement 是因为如果是顶级元素，例如 shadowRoot 中的一级子元素， el.parentNode 不为空，但是 el.parentElement 为空
			 */
			if (el.parentNode === null) {
				window.removeEventListener('resize', resize);
			} else {
				handler(el);
			}
		}, 200);
		resize();
		window.addEventListener('resize', resize);
	},
	/** 是否处于顶级 window ，而不是子 iframe */
	isInTopWindow() {
		return self === top;
	},
	/**
	 * 创建弹出窗口
	 * @param url 地址
	 * @param winName 窗口名
	 * @param w 宽
	 * @param h 高
	 * @param scroll 滚动条
	 */
	createCenteredPopupWindow(
		url: string,
		winName: string,
		opts: {
			width: number;
			height: number;
			scrollbars: boolean;
			resizable: boolean;
		}
	) {
		const { width, height, scrollbars, resizable } = opts;
		const LeftPosition = screen.width ? (screen.width - width) / 2 : 0;
		const TopPosition = screen.height ? (screen.height - height) / 2 : 0;

		const settings =
			'height=' +
			height +
			',width=' +
			width +
			',top=' +
			TopPosition +
			',left=' +
			LeftPosition +
			',scrollbars=' +
			(scrollbars ? 'yes' : 'no') +
			',resizable=' +
			(resizable ? 'yes' : 'no');

		return window.open(url, winName, settings);
	}
};
