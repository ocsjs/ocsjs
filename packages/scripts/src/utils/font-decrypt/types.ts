/**
 * 字体解密框架 - 类型定义
 *
 * 背景：部分网课平台使用"字形置换"加密——页面下发的字体中，
 * 码点 X 的字形轮廓实际画的是另一个字 Y。浏览器渲染正常，
 * 但直接读取 HTML 文本得到的是乱码（通常是生僻字/繁体字）。
 *
 * 本框架通过"位图特征匹配"解密：把密文字符用加密字体渲染成位图，
 * 与预计算的参考特征表（由官方原版字体生成）做最近邻匹配，
 * 找出每个密文字形"实际画的是哪个字"。
 */

/** 参考特征表（FRB2 格式，位打包二值特征） */
export interface RefTable {
	/** 候选字数量 */
	count: number;
	/** 候选字码点表（长度 = count） */
	cps: Uint32Array;
	/** 粗特征（二值 0/1，长度 = count × gc × gc），用于快速粗筛 */
	coarse: Uint8Array;
	/** 精特征（二值 0/1，长度 = count × gf × gf），用于精确排序 */
	fine: Uint8Array;
	/** 粗特征网格边长 */
	gc: number;
	/** 精特征网格边长 */
	gf: number;
	/** 查询端二值化阈值（与生成端一致，写在表头中） */
	threshold: number;
}

/** 平台解密配置 */
export interface FontDecryptConfig {
	/**
	 * 参考特征表 URL（FRB2 格式）。
	 * 不同平台的加密字体可能基于不同字重设计，需使用对应字重生成的表：
	 * - 超星 font-cxsecret：Source Han Sans Normal(wght350) 设计 -> 用 350/400 字重表
	 * - 考试平台可变字体：Source Han Sans SC VF 默认实例(wght250) -> 用 250 字重表
	 */
	refTableUrl: string;
	/**
	 * FontFace 加载字体时的 weight 描述符。
	 *
	 * 【可变字体必须设置】浏览器默认按 font-weight:400 实例化可变字体，
	 * 若特征表按其他字重（如 250）生成，笔画粗细不一致会导致匹配失败。
	 * 静态字体（如超星 cxsecret）只有一个字重，此设置无实际影响，可省略。
	 */
	fontWeight?: string;
	/** 破解进度回调（可用于在页面上显示进度） */
	onProgress?: (done: number, total: number) => void;
	/**
	 * 是否在 Web Worker 中执行破解（默认 true）。
	 * Worker 内使用 OffscreenCanvas 渲染，不阻塞主线程；
	 * 若环境不支持（无 OffscreenCanvas、CSP 拦截 worker-src 等）自动回退主线程。
	 */
	useWorker?: boolean;
}

/** 单个字符的匹配详情 */
export interface CrackDetail {
	/** 密文字（HTML 中的乱码字符） */
	from: string;
	/** 真实字（肉眼看到的字符） */
	to: string;
	/**
	 * 匹配置信度 = 1 - 最优距离/次优距离。
	 * 越接近 1 区分度越高；低于 0.3 时建议人工复核（多为形近字）。
	 */
	margin: number;
}

/** 破解结果 */
export interface CrackResult {
	/** 密文字 -> 真实字 的映射表 */
	map: Record<string, string>;
	/** 每个字符的匹配详情 */
	details: CrackDetail[];
}
