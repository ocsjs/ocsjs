import { test } from "@playwright/test";
import { CXScript } from "../../../src";
import config from "../../local.config";

test("school login", async ({ page }) => {
    await CXScript.login.schoolLogin(page, config.cx.login.school);
});

test("phone login", async ({ page }) => {
    await CXScript.login.phoneLogin(page, config.cx.login.phone);
});

test("other login", async ({ page }) => {
    await CXScript.login.otherLogin(page, config.cx.login.other);
});
