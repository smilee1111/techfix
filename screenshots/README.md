# TechFix — Application Screenshots

46 full-page screenshots covering every page in the application and every
user flow, captured against the running app (Next.js on `:3000`, Express API
on `:5000`, MongoDB Atlas with seeded demo data).

Captured at 1440×900 viewport, full-page, using Playwright/Chromium.
Flows were driven as a real user would — forms filled, wizards stepped
through, real records created — rather than deep-linked to pre-baked states.

## 01 — Public pages (logged out)

| # | File | Page |
| --- | --- | --- |
| 01 | `01-landing-home.png` | Landing page |
| 02 | `02-login.png` | Login |
| 03 | `03-signup.png` | Sign up (customer/seller role toggle) |
| 04 | `04-forgot-password.png` | Forgot password |
| 05 | `05-reset-password.png` | Reset password |
| 06 | `06-help-center.png` | Help Center / FAQ |
| 07 | `07-help-center-answer-open.png` | FAQ accordion expanded |
| 08 | `08-global-search.png` | Global search across repairs + products |

## 02 — Repair discovery

| # | File | Page |
| --- | --- | --- |
| 09 | `09-repair-search-results.png` | Repair search with sidebar filters |
| 10 | `10-repair-service-detail.png` | Provider detail + repair options |
| 11 | `11-repair-comparison.png` | Side-by-side provider comparison |

## 03 — Price estimate wizard

| # | File | Page |
| --- | --- | --- |
| 12 | `12-estimate-step-1-device.png` | Step 1 — device brand + model |
| 13 | `13-estimate-step-2-issue.png` | Step 2 — issue type |
| 14 | `14-estimate-step-3-location.png` | Step 3 — city |
| 15 | `15-estimate-results.png` | Results — price range + shop breakdown |

## 04 — Product marketplace

| # | File | Page |
| --- | --- | --- |
| 16 | `16-product-listing.png` | Product listing with filters + sort |
| 17 | `17-product-compare-tray.png` | Compare tray with two selected |
| 18 | `18-product-detail-authenticity.png` | Product detail, gallery + authenticity panel |
| 19 | `19-compare-sellers.png` | Seller comparison, best match highlighted |

## 05 — Order flow (customer)

| # | File | Page |
| --- | --- | --- |
| 20 | `20-dashboard-logged-in.png` | Dashboard, authenticated |
| 21 | `21-product-added-to-cart.png` | Add-to-cart confirmation |
| 22 | `22-cart.png` | Cart with totals + free-shipping hint |
| 23 | `23-checkout-step-1-delivery.png` | Checkout step 1 — delivery |
| 24 | `24-checkout-delivery-filled.png` | Delivery details filled |
| 25 | `25-checkout-step-2-payment.png` | Checkout step 2 — payment method |
| 26 | `26-order-success.png` | Order confirmed |
| 27 | `27-order-history.png` | Order history |
| 28 | `28-order-tracking-timeline.png` | Order tracking — 5-stage timeline |

## 06 — Repair booking + tracking (customer)

| # | File | Page |
| --- | --- | --- |
| 29 | `29-my-repairs.png` | My Repairs list |
| 30 | `30-booking-detail-timeline.png` | Repair timeline (7 stages) + reported issue photos |
| 31 | `31-booking-timeline-completed.png` | Second booking's timeline |
| 32 | `32-booking-step-1-logistics.png` | Booking step 1 — logistics |
| 33 | `33-booking-step-1-filled.png` | Drop-off selected + issue described |
| 34 | `34-booking-step-2-contact.png` | Booking step 2 — contact |
| 35 | `35-booking-step-3-payment.png` | Booking step 3 — payment |
| 36 | `36-booking-success.png` | Booking confirmed |
| 37 | `37-account-profile.png` | Account profile with real repair stats |

## 07 — Seller

| # | File | Page |
| --- | --- | --- |
| 38 | `38-seller-incoming-bookings.png` | Incoming bookings + stage control |
| 39 | `39-seller-my-listings.png` | Own listings with edit / hide |
| 40 | `40-seller-listing-form.png` | Create listing form |

## 08 — Admin

| # | File | Page |
| --- | --- | --- |
| 41 | `41-admin-categories.png` | Category management |
| 42 | `42-admin-seller-verification.png` | Seller verification queue |

## 09 — Additional states

| # | File | State |
| --- | --- | --- |
| 43 | `43-not-found-404.png` | 404 / not found |
| 44 | `44-cart-empty.png` | Empty cart |
| 45 | `45-seller-listing-edit.png` | Listing form in edit mode, pre-filled |
| 46 | `46-admin-category-edit.png` | Category edit — type field locked |

## 10 — Loading states

Captured by holding every `/api/**` response open for 9 seconds, so the
loading branch stays on screen long enough to photograph. On localhost these
are otherwise invisible.

| # | File | State |
| --- | --- | --- |
| 47 | `47-loading-product-listing.png` | Product listing |
| 48 | `48-loading-product-detail.png` | Product detail |
| 49 | `49-loading-compare-sellers.png` | Compare sellers |
| 50 | `50-loading-repair-search.png` | Repair search |
| 51 | `51-loading-repair-detail.png` | Repair detail |
| 52 | `52-loading-repair-comparison.png` | Repair comparison |
| 53 | `53-loading-global-search.png` | Global search |
| 54 | `54-loading-my-repairs.png` | My Repairs |
| 55 | `55-loading-booking-timeline.png` | Repair timeline |
| 56 | `56-loading-order-history.png` | Order history |
| 57 | `57-loading-order-tracking.png` | Order tracking |
| 58 | `58-loading-account.png` | Account profile |
| 59 | `59-loading-seller-dashboard.png` | Seller dashboard |
| 60 | `60-loading-admin-panel.png` | Admin panel |

## 11 — Form validation

Produced by submitting genuinely invalid input, not by injecting error
markup. Covers both client-side rules and server-side rejections.

| # | File | Rule demonstrated |
| --- | --- | --- |
| 61 | `61-login-invalid-credentials.png` | Wrong password — server rejection |
| 62 | `62-login-empty-fields.png` | Required fields empty |
| 63 | `63-signup-invalid-input.png` | Invalid email / password mismatch |
| 64 | `64-forgot-password-invalid-email.png` | Invalid email format |
| 65 | `65-checkout-missing-fields.png` | Required delivery fields missing |
| 66 | `66-checkout-invalid-email.png` | Invalid email address |
| 67 | `67-listing-empty-required.png` | Required listing fields missing |
| 68 | `68-listing-price-range-invalid.png` | Minimum price exceeds maximum |
| 69 | `69-listing-no-repair-option.png` | No bookable repair option added |

## 12 — Empty / no-results states

| # | File | State |
| --- | --- | --- |
| 70 | `70-search-no-results.png` | Global search — nothing matched |
| 71 | `71-products-no-results.png` | Product search — no matches |
| 72 | `72-products-no-results-price-filter.png` | Price filter excludes everything |
| 73 | `73-help-no-results.png` | Help Center — no articles match |
| 74 | `74-repairs-no-results.png` | Repair search — no providers match |

Note: `/repairs` reads its query from the URL (`?q=`) rather than an on-page
text box — its sidebar is checkbox filters only.

## Route coverage

All 28 page routes under `src/app/**/page.tsx` are captured, plus the
built-in 404.

| Route | Screenshots |
| --- | --- |
| `/` | 01 |
| `/login`, `/signup` | 02, 03 |
| `/forgot-password`, `/reset-password` | 04, 05 |
| `/help` | 06, 07 |
| `/search` | 08 |
| `/repairs`, `/repairs/[id]`, `/repairs/compare` | 09, 10, 11 |
| `/estimate`, `/estimate/results/[id]` | 12–14, 15 |
| `/products`, `/products/[id]`, `/products/compare` | 16–17, 18, 19 |
| `/dashboard` | 20 |
| `/cart`, `/checkout` | 22, 44, 23–25 |
| `/orders`, `/orders/[id]`, `/orders/[id]/success` | 27, 28, 26 |
| `/my-repairs`, `/bookings/[id]`, `/bookings/[id]/success` | 29, 30–31, 36 |
| `/repairs/[id]/book` | 32–35 |
| `/account` | 37 |
| `/seller/dashboard` | 38–40, 45 |
| `/admin` | 41, 42, 46 |
| 404 | 43 |

## Images

Product and issue photography is real, and reached the app the way a
seller's would:

1. Five device shots were cropped from `techfix-frontend/public/product-imagery.png`
   (the hero image from the Figma design) using `sharp`.
2. They were uploaded through the application's own endpoint —
   `POST /api/uploads/repair-photos`, authenticated as a seller — so they
   live in Cloudinary under `techfix/repair-issues/`, exactly as a genuine
   upload would.
3. The returned Cloudinary URLs were attached to the five seeded products
   (a lead image plus a gallery shot each) and to the demo customer's
   bookings as issue photos.

Pages that consequently show real imagery: product listing, product detail
(hero + thumbnail strip), cart, order items on the tracking page, and the
"Reported Issue" panel on booking detail.

Repair search cards are text-only **by design** — `RepairService.images` is
never rendered by the repair listing UI, so populating it has no visible
effect there.

## Accounts used

All seeded accounts share the password `Seed@12345`.

| Role | Email |
| --- | --- |
| Customer | `customer@seed.techfix.dev` |
| Seller | `screensavvy@seed.techfix.dev` |
| Admin | `admin@seed.techfix.dev` |

## Reproducing

```bash
cd techfix-backend && npx ts-node seed-data.ts -i   # seed demo data
cd techfix-backend && npm run dev                   # API on :5000
cd techfix-frontend && npm run dev                  # app on :3000
```

Then re-run the capture script against the running pair.

## Notes

- Pages requiring a selection (`/repairs/[id]/book`) are reached with the
  same query parameters the detail page's CTA sends; visiting them bare
  shows a "no option selected" error by design.
- The order and booking flows created **real records** in the database, so
  order history, tracking and account stats show genuine data rather than
  empty states.
- `manifest.json` lists every capture with its folder, filename and caption.
