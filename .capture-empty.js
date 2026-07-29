/* eslint-disable */
/**
 * Captures empty / no-results states.
 *
 * The listing pages hold their filters in component state rather than the
 * URL, so a query string won't reproduce a no-results view — the search
 * box has to actually be typed into and submitted.
 */
const { chromium } = require("./techfix-frontend/node_modules/playwright");
const path = require("path");
const fs = require("fs");

const BASE = "http://localhost:3000";
const ROOT = "c:/Users/ADMIN/Desktop/techfix/screenshots";
const FOLDER = "12-empty-states";
const NONSENSE = "qwertyzzz-no-such-thing";

let n = 69; // continue after the loading/validation runs
const added = [];

async function shot(page, name, note) {
  n += 1;
  const dir = path.join(ROOT, FOLDER);
  fs.mkdirSync(dir, { recursive: true });
  const file = `${n}-${name}.png`;
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(dir, file), fullPage: true });
  added.push({ n, folder: FOLDER, file, note });
  console.log(`  [${n}] ${FOLDER}/${file}`);
}

async function goto(page, url) {
  await page.goto(`${BASE}${url}`, { waitUntil: "networkidle", timeout: 45000 });
}

/** Types into a page's own search box and submits, then waits for the refetch. */
async function searchFor(page, inputSelector, term) {
  const input = page.locator(inputSelector).first();
  if (!(await input.count())) return false;
  await input.fill(term);
  await input.press("Enter").catch(() => {});
  await page.waitForTimeout(2500);
  return true;
}

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  // Global search — reads its term straight from the URL.
  await goto(page, `/search?q=${encodeURIComponent(NONSENSE)}`);
  await page.waitForTimeout(2500);
  await shot(page, "search-no-results", "Global search — nothing matched");

  // Product listing — submit a nonsense term through its own search form.
  await goto(page, "/products");
  await searchFor(page, ".plist__search-input", NONSENSE);
  await shot(page, "products-no-results", "Product listing — no products match");

  // Product listing — impossible price filter (different empty path).
  await goto(page, "/products");
  const min = page.locator('input[aria-label="Minimum price"]').first();
  if (await min.count()) {
    await min.fill("99999");
    await page.waitForTimeout(2500);
    await shot(page, "products-no-results-price-filter", "Product listing — price filter excludes everything");
  }

  // Repair search — find whatever search input the page exposes.
  await goto(page, "/repairs");
  const repairInputs = page.locator('input[type="text"]:not(.navbar__search-input):visible, input[type="search"]:visible');
  if (await repairInputs.count()) {
    await repairInputs.first().fill(NONSENSE);
    await repairInputs.first().press("Enter").catch(() => {});
    await page.waitForTimeout(2800);
    await shot(page, "repairs-no-results", "Repair search — no providers match");
  } else {
    console.log("  ! no repair search input found");
  }

  // Help Center — FAQ search with no match.
  await goto(page, "/help");
  await searchFor(page, ".help__search", NONSENSE);
  await shot(page, "help-no-results", "Help Center — no articles match");

  await browser.close();
  fs.writeFileSync(
    path.join(ROOT, "empty-manifest.json"),
    JSON.stringify(added, null, 2),
    "utf8"
  );
  console.log(`\nCaptured ${added.length} empty states.`);
})().catch((e) => {
  console.error("FAILED:", e);
  process.exit(1);
});
