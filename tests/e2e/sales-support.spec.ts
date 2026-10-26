import { expect, test } from "@playwright/test";

test("protected dashboard sends signed-out users to login", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
});

test("login shows a clear message for invalid credentials", async ({ page }) => {
  await page.route("**/api/auth/login", (route) =>
    route.fulfill({ status: 401, json: { detail: "Invalid credentials." } }),
  );
  await page.goto("/login");
  await page.getByLabel("Username or Email").fill("wrong@example.test");
  await page.getByLabel("Password", { exact: true }).fill("wrong-password");
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page.getByRole("status")).toContainText(
    "Invalid username/email or password.",
  );
  await expect(page).toHaveURL(/\/login$/);
});

test("successful login saves the access token", async ({ page }) => {
  await page.route("**/api/auth/login", (route) =>
    route.fulfill({
      json: {
        access_token: "header.eyJleHAiOjE5MDAwMDAwMDB9.signature",
        token_type: "bearer",
      },
    }),
  );
  await page.goto("/login");
  await page.getByLabel("Username or Email").fill("e2e@example.test");
  await page.getByLabel("Password", { exact: true }).fill("test-password");
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page.getByRole("status")).toContainText("Signed in successfully");
  await expect
    .poll(() =>
      page.evaluate(() =>
        Boolean(window.sessionStorage.getItem("ai-sales-support-hub.access-token")),
      ),
    )
    .toBe(true);
});

test("registration rejects mismatched passwords and accepts a valid form", async ({ page }) => {
  await page.route("**/api/auth/register", (route) =>
    route.fulfill({ status: 201, json: { id: 1 } }),
  );
  await page.goto("/register");
  await page.getByLabel("Username").fill("e2e-user");
  await page.getByLabel("Work email").fill("e2e@example.test");
  await page.getByLabel("Password", { exact: true }).fill("strong-test-password");
  await page.getByLabel("Confirm password").fill("different-test-password");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page.getByRole("status")).toContainText("Your passwords don’t match");

  await page.getByLabel("Confirm password").fill("strong-test-password");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page.getByRole("status")).toContainText(
    "Your account has been created successfully.",
  );
  await expect(page.getByRole("link", { name: "Continue to sign in" })).toBeVisible();
});
