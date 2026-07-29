/* eslint-disable */
/**
 * Captures loading states and form-validation states.
 *
 * Loading states are invisible on localhost, so every /api/** response is
 * held open while the shot is taken. Auth happens BEFORE the delay is
 * installed, otherwise logging in would hang too.
 *
 * Validation states are produced by submitting genuinely invalid input,
 * not by injecting error markup.
 */
const { chromium } = require("./techfix-frontend/node_modules/playwright");
const path = require("path");
const fs = require("fs");

const BASE = "http://localhost:3000";
const API = "http://localhost:5000/api";
const ROOT = "c:/Users/ADMIN/Desktop/techfix/screenshots";
const PASSWORD = "Seed@12345";
const HOLD_MS = 9000;

const ACCOUNTS = {
  customer: "customer@seed.techfix.dev",
  seller: "screensavvy@seed.techfix.dev",
  admin: "admin@seed.techfix.dev",
};

let n = 46; // continue numbering after the existing 46
const added = [];

async function shot(page, folder, name, note) {
  n += 1;
  const dir = path.join(ROOT, folder);
  fs.mkdirSync(dir, { recursive: true });
  const file = `${n}-${name}.png`;
  await page.screenshot({ path: path.join(dir, file), fullPage: true });
  added.push({ n, folder, file, note });
  console.log(`  [${n}] ${folder}/${file}`);
}

async function installDelay(page) {
  await page.route("**/api/**", async (route) => {
    await new Promise((r) => setTimeout(r, HOLD_MS));
    await route.continue().catch(() => {});
  });
}

/** Navigate without waiting for the deliberately-stalled network. */
async function gotoLoading(page, url) {
  await page
    .goto(`${BASE}${url}`, { waitUntil: "domcontentloaded", timeout: 20000 })
    .catch(() => {});
  await page.waitForTimeout(1800);
}

async function goto(page, url) {
  await page.goto(`${BASE}${url}`, { waitUntil: "networkidle", timeout: 45000 });
}

async function login(page, email) {
  await goto(page, "/login");
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3500);
}

async function fetchIds() {
  const [r, p] = await Promise.all([
    fetch(`${API}/repairs?limit=3`).then((x) => x.json()),
    fetch(`${API}/products?limit=3`).then((x) => x.json()),
  ]);
  const login = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: ACCOUNTS.customer, password: PASSWORD }),
  }).then((x) => x.json());
  const token = login.data.accessToken;
  const [b, o] = await Promise.all([
    fetch(`${API}/bookings/mine`, { headers: { Authorization: `Bearer ${token}` } }).then((x) => x.json()),
    fetch(`${API}/orders/mine`, { headers: { Authorization: `Bearer ${token}` } }).then((x) => x.json()),
  ]);
  return {
    repairs: r.data.items.map((i) => i._id),
    products: p.data.items.map((i) => i._id),
    bookings: (b.data.items || []).map((i) => i._id),
    orders: (o.data.items || []).map((i) => i._id),
  };
}

async function main() {
  const id = await fetchIds();
  const browser = await chromium.launch();
  const mk = () => browser.newContext({ viewport: { width: 1440, height: 900 } });

  /* ══════════════ 10 — LOADING STATES ══════════════ */
  console.log("\n== 10-loading-states (public) ==");
  let ctx = await mk();
  let page = await ctx.newPage();
  await installDelay(page);

  await gotoLoading(page, "/products");
  await shot(page, "10-loading-states", "loading-product-listing", "Product listing — loading");

  await gotoLoading(page, `/products/${id.products[0]}`);
  await shot(page, "10-loading-states", "loading-product-detail", "Product detail — loading");

  await gotoLoading(page, `/products/compare?ids=${id.products[0]},${id.products[1]}`);
  await shot(page, "10-loading-states", "loading-compare-sellers", "Compare sellers — loading");

  await gotoLoading(page, "/repairs");
  await shot(page, "10-loading-states", "loading-repair-search", "Repair search — loading");

  await gotoLoading(page, `/repairs/${id.repairs[0]}`);
  await shot(page, "10-loading-states", "loading-repair-detail", "Repair detail — loading");

  await gotoLoading(page, `/repairs/compare?ids=${id.repairs[0]},${id.repairs[1]}`);
  await shot(page, "10-loading-states", "loading-repair-comparison", "Repair comparison — loading");

  await gotoLoading(page, "/search?q=screen");
  await shot(page, "10-loading-states", "loading-global-search", "Global search — searching");
  await ctx.close();

  console.log("== 10-loading-states (customer) ==");
  ctx = await mk();
  page = await ctx.newPage();
  await login(page, ACCOUNTS.customer);
  await installDelay(page);

  await gotoLoading(page, "/my-repairs");
  await shot(page, "10-loading-states", "loading-my-repairs", "My Repairs — loading");

  if (id.bookings.length) {
    await gotoLoading(page, `/bookings/${id.bookings[0]}`);
    await shot(page, "10-loading-states", "loading-booking-timeline", "Repair timeline — loading");
  }

  await gotoLoading(page, "/orders");
  await shot(page, "10-loading-states", "loading-order-history", "Order history — loading");

  if (id.orders.length) {
    await gotoLoading(page, `/orders/${id.orders[0]}`);
    await shot(page, "10-loading-states", "loading-order-tracking", "Order tracking — loading");
  }

  await gotoLoading(page, "/account");
  await shot(page, "10-loading-states", "loading-account", "Account profile — loading");
  await ctx.close();

  console.log("== 10-loading-states (seller / admin) ==");
  ctx = await mk();
  page = await ctx.newPage();
  await login(page, ACCOUNTS.seller);
  await installDelay(page);
  await gotoLoading(page, "/seller/dashboard");
  await shot(page, "10-loading-states", "loading-seller-dashboard", "Seller dashboard — loading");
  await ctx.close();

  ctx = await mk();
  page = await ctx.newPage();
  await login(page, ACCOUNTS.admin);
  await installDelay(page);
  await gotoLoading(page, "/admin");
  await shot(page, "10-loading-states", "loading-admin-panel", "Admin panel — loading");
  await ctx.close();

  /* ══════════════ 11 — FORM VALIDATION ══════════════ */
  console.log("\n== 11-form-validation ==");
  ctx = await mk();
  page = await ctx.newPage();

  // Login — wrong password (server-side rejection).
  await goto(page, "/login");
  await page.fill('input[type="email"]', ACCOUNTS.customer);
  await page.fill('input[type="password"]', "definitely-not-the-password");
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);
  await shot(page, "11-form-validation", "login-invalid-credentials", "Login — wrong credentials");

  // Login — empty submit (client-side required).
  await goto(page, "/login");
  await page.click('button[type="submit"]');
  await page.waitForTimeout(1200);
  await shot(page, "11-form-validation", "login-empty-fields", "Login — empty fields");

  // Signup — mismatched passwords + bad email.
  await goto(page, "/signup");
  const su = page.locator('input:not(.navbar__search-input):visible');
  const suCount = await su.count();
  for (let i = 0; i < suCount; i += 1) {
    const type = await su.nth(i).getAttribute("type");
    if (type === "email") await su.nth(i).fill("not-an-email").catch(() => {});
    else if (type === "password") await su.nth(i).fill(i % 2 === 0 ? "abc123" : "different456").catch(() => {});
    else await su.nth(i).fill("A").catch(() => {});
  }
  await page.locator('button[type="submit"]').first().click().catch(() => {});
  await page.waitForTimeout(2000);
  await shot(page, "11-form-validation", "signup-invalid-input", "Signup — invalid email / password mismatch");

  // Forgot password — invalid email format.
  await goto(page, "/forgot-password");
  await page.locator('input[type="email"]').first().fill("bad-email").catch(() => {});
  await page.locator('button[type="submit"]').first().click().catch(() => {});
  await page.waitForTimeout(1800);
  await shot(page, "11-form-validation", "forgot-password-invalid-email", "Forgot password — invalid email");
  await ctx.close();

  // Checkout — submit with empty delivery fields.
  console.log("== 11-form-validation (checkout) ==");
  ctx = await mk();
  page = await ctx.newPage();
  await login(page, ACCOUNTS.customer);

  await goto(page, `/products/${id.products[0]}`);
  const add = page.locator("button", { hasText: /add to cart/i }).first();
  if ((await add.count()) && (await add.isEnabled())) {
    await add.click();
    await page.waitForTimeout(800);
  }
  await goto(page, "/checkout");
  await page.locator("button", { hasText: /continue to payment/i }).first().click().catch(() => {});
  await page.waitForTimeout(1500);
  await shot(page, "11-form-validation", "checkout-missing-fields", "Checkout — required fields missing");

  // Checkout — invalid email specifically.
  const nameField = page.locator('label:has-text("Full name") input').first();
  if (await nameField.count()) await nameField.fill("Demo Customer");
  const phoneField = page.locator('label:has-text("Phone") input').first();
  if (await phoneField.count()) await phoneField.fill("+977-9800000099");
  const emailField = page.locator('label:has-text("Email") input').first();
  if (await emailField.count()) await emailField.fill("not-a-valid-email");
  await page.locator("button", { hasText: /continue to payment/i }).first().click().catch(() => {});
  await page.waitForTimeout(1500);
  await shot(page, "11-form-validation", "checkout-invalid-email", "Checkout — invalid email address");
  await ctx.close();

  // Seller listing form — several rule violations.
  console.log("== 11-form-validation (seller) ==");
  ctx = await mk();
  page = await ctx.newPage();
  await login(page, ACCOUNTS.seller);
  await goto(page, "/seller/dashboard");
  const tab = page.locator('button[role="tab"]', { hasText: /my listings/i }).first();
  if (await tab.count()) {
    await tab.click();
    await page.waitForTimeout(1000);
  }
  const newBtn = page.locator("button", { hasText: /new listing/i }).first();
  if (await newBtn.count()) {
    await newBtn.click();
    await page.waitForTimeout(1200);

    // Empty submit — first rule that fails is the title.
    await page.locator("button", { hasText: /create listing/i }).first().click().catch(() => {});
    await page.waitForTimeout(1200);
    await shot(page, "11-form-validation", "listing-empty-required", "Listing — required fields missing");

    // Fill everything except make min > max, to hit the price rule.
    const setField = async (label, value) => {
      const el = page.locator(`label:has-text("${label}") input`).first();
      if (await el.count()) await el.fill(value).catch(() => {});
    };
    await setField("Title", "Test Listing");
    await setField("Device type", "Smartphone");
    const desc = page.locator("textarea").first();
    if (await desc.count()) await desc.fill("A description for validation testing.").catch(() => {});
    await setField("Address", "Putalisadak, Kathmandu");
    const cat = page.locator("select").first();
    if (await cat.count()) await cat.selectOption({ index: 1 }).catch(() => {});
    await setField("Price from ($)", "500");
    await setField("Price to ($)", "100");
    await page.locator("button", { hasText: /create listing/i }).first().click().catch(() => {});
    await page.waitForTimeout(1200);
    await shot(page, "11-form-validation", "listing-price-range-invalid", "Listing — min price exceeds max");

    // Fix the range but leave repair options empty.
    await setField("Price from ($)", "100");
    await setField("Price to ($)", "500");
    await page.locator("button", { hasText: /create listing/i }).first().click().catch(() => {});
    await page.waitForTimeout(1200);
    await shot(page, "11-form-validation", "listing-no-repair-option", "Listing — no repair option added");
  }
  await ctx.close();

  await browser.close();
  fs.writeFileSync(
    path.join(ROOT, "states-manifest.json"),
    JSON.stringify(added, null, 2),
    "utf8"
  );
  console.log(`\nCaptured ${added.length} additional screenshots.`);
}

main().catch((e) => {
  console.error("FAILED:", e);
  process.exit(1);
});
