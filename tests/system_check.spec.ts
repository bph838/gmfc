import { test, expect } from "@playwright/test";

test("@Smoke Verify page opens", async ({ page }) => {
  await page.goto("/");

  const header = page.getByRole("heading", { level: 1 });

  await expect(header).toBeVisible();
  await expect(header).toHaveText("Gordano Model Flying Club");
});

test("@Cookie Check cookie warning appears and can be declined", async ({
  page,
}) => {
  await page.goto("/");

  const cookie_holder = page.locator(".cookie_warning");
  await expect(cookie_holder).toBeVisible();

  await cookie_holder.getByRole("button", { name: "Decline" }).click();

  await page.waitForURL(/google.com/);

  await expect(page).toHaveURL(/google\.com/);
});

test("@Cookie Check cookie warning appears and can be accepted", async ({
  page,
}) => {
  await page.goto("/");

  const cookie_holder = page.locator(".cookie_warning");
  await expect(cookie_holder).toBeVisible();

  await cookie_holder.getByRole("button", { name: "Accept" }).click();

  await expect(cookie_holder).toBeHidden();
});
