import { test } from "@playwright/test";
import { ZHScript } from "../../../src";
import config from "../../local.config";
test("phone login", async ({ page }) => {
    await ZHScript.login.phoneLogin(page, config.zhs.login.phone);
});

test("school login", async ({ page }) => {
    await ZHScript.login.schoolLogin(page, config.zhs.login.school);
});

test("other login", async ({ page }) => {
    await ZHScript.login.otherLogin(page, config.zhs.login.other);
});
