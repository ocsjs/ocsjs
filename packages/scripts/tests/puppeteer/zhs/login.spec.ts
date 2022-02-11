import { test } from "@playwright/test";
import { ZHSLogin } from "../../../src";
import config from "../../local.config";

test("phone login", async ({ page }) => {
    await ZHSLogin.phoneLogin(page, config.zhs.login.phone);
});

test("school login", async ({ page }) => {
    await ZHSLogin.schoolLogin(page, config.zhs.login.school);
});

test("other login", async ({ page }) => {
    await ZHSLogin.otherLogin(page, config.zhs.login.other);
});
