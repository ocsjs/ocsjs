import { $store } from 'easy-us';

/**
 * 智慧树学习脚本旧版命名空间。
 *
 * 历史版本中，智慧树平台的每个学习脚本都使用独立的命名空间，例如：
 *   - 共享课：    zhs.gxk.study
 *   - 新形态课程： zhs.smart.study
 *   - 校内课：    zhs.xnk.study
 *   - 新智慧学习： zhs.wisdom.study
 *   - AI 教学空间： zhs.hike.study / zhs.hike_v2.study
 * 导致倍速/音量/清晰度等配置需要在每个脚本中重复设置。
 */
const legacyZhsStudyNamespaces = [
	'zhs.gxk.study',
	'zhs.smart.study',
	'zhs.xnk.study',
	'zhs.wisdom.study',
	'zhs.hike.study',
	'zhs.hike_v2.study'
];

/**
 * 智慧树学习脚本统一命名空间。
 *
 * 所有智慧树学习脚本共用同一命名空间后，任意脚本中修改的配置都会在全部学习脚本中生效，
 * 只需设置一次。各脚本独有的配置（如定时停止/跳转模式/忽略习惯分弹窗）仍按各自 key 存储，
 * 因各学习脚本按页面互斥运行，不会互相干扰。
 */
export const zhsStudyNamespace = 'zhs.study';

/**
 * 智慧树作业考试脚本旧版命名空间。
 *
 * 历史版本同样存在多个独立命名空间：
 *   - 共享课作业考试： zhs.gxk.work
 *   - 新形态课程：     zhs.smart.work
 *   - 校内课：        zhs.xnk.work
 *   - AI 教学空间：    zhs.hike.work / zhs.hike.homework
 */
const legacyZhsWorkNamespaces = [
	'zhs.gxk.work',
	'zhs.smart.work',
	'zhs.xnk.work',
	'zhs.hike.work',
	'zhs.hike.homework'
];

/**
 * 智慧树作业考试脚本统一命名空间。
 *
 * 所有作业/考试/掌握度脚本共用 `zhs.work`，`workDelay`、`readNotes` 等配置只需设置一次。
 */
export const zhsWorkNamespace = 'zhs.work';

/**
 * 将源命名空间下的 key 迁移到目标命名空间。
 * - 仅迁移真实存在于存储中的 key（不会写入默认值）。
 * - 若目标 key 已存在则保留目标值，避免覆盖用户新设置。
 * - 迁移完成后删除旧 key，因此幂等可重复调用。
 */
function migrateNamespace(sourceNamespaces: string[], targetNamespace: string) {
	for (const ns of sourceNamespaces) {
		for (const key of $store.list()) {
			if (!key.startsWith(ns + '.')) continue;
			const newKey = targetNamespace + key.slice(ns.length);
			if ($store.get(newKey) === undefined) {
				$store.set(newKey, $store.get(key));
			}
			$store.delete(key);
		}
	}
}

/**
 * 将旧命名空间下已存在的用户配置迁移到统一命名空间，并清理旧 key。
 *
 * 说明：
 * - 配置值仅在用户显式修改后才会写入存储，因此迁移不会把默认值错误地写入新 key。
 * - 仅当新 key 尚不存在时才复制，避免覆盖迁移期间用户的新修改。
 * - 每次智慧树学习脚本启动时调用；已迁移过的旧 key 会被删除，因此本函数是幂等的。
 */
export function migrateZhsStudyConfigs() {
	migrateNamespace(legacyZhsStudyNamespaces, zhsStudyNamespace);
}

/**
 * 将旧命名空间下已存在的作业考试配置迁移到统一的 `zhs.work` 命名空间。
 *
 * 说明：与学习脚本迁移相同，幂等可重复调用。
 */
export function migrateZhsWorkConfigs() {
	migrateNamespace(legacyZhsWorkNamespaces, zhsWorkNamespace);
}
