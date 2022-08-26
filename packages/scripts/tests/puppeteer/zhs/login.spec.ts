import { test } from '@playwright/test';
import { ZHS } from '../../../src';
import config from '../../local.config';

test('phone login', async ({ page }) => {
	await ZHS.phoneLogin(page, config.zhs.login.phone);
});

test('school login', async ({ page }) => {
	await ZHS.schoolLogin(page, config.zhs.login.school);
});

test('other login', async ({ page }) => {
	await ZHS.otherLogin(page, config.zhs.login.other);
});
