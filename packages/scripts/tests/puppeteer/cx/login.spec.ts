import { test } from "@playwright/test";
import { CXLogin } from "../../../src";

import config from "../../local.config";

test("school login", async ({ page }) => {
    await CXLogin.schoolLogin(page, config.cx.login.school);
});

test("phone login", async ({ page }) => {
    await CXLogin.phoneLogin(page, config.cx.login.phone);
});

test("other login", async ({ page }) => {
    await CXLogin.otherLogin(page, config.cx.login.other);
});
