import { test } from '@playwright/test';
import { CX } from '../../../src';

import config from '../../local.config';

test('school login', async ({ page }) => {
	await CX.schoolLogin(page, config.cx.login.school);
});

test('phone login', async ({ page }) => {
	await CX.phoneLogin(page, config.cx.login.phone);
});

test('other login', async ({ page }) => {
	await CX.otherLogin(page, config.cx.login.other);
});
