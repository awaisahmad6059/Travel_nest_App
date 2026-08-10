# TravelNest API Handoff — Mobile App Team

**Audience:** React Native (Expo) Customer + Supplier app developers  
**Backend:** NestJS shared API (same as website)  
**Rule:** No separate mobile database. Website + apps read/write the same data via this API.

| Item | Value |
|------|--------|
| Local base URL | `http://localhost:4000/api/v1` |
| Content-Type | `application/json` |
| Auth (planned) | `Authorization: Bearer <access_token>` |
| Web frontend | Next.js → same base URL |
| Mobile stack (SRS) | Expo + TypeScript + Expo Router + TanStack Query + Zustand |

> **Current backend status:** Prototype with in-memory mock DB. Contracts below match live NestJS routes today. Real PostgreSQL + Auth will keep the same paths/shapes where possible.

---

## 1. Architecture (must follow)

```
┌─────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  Next.js Web    │  │ Customer App     │  │ Supplier App     │
│  (port 3000)    │  │ (Expo / RN)      │  │ (Expo / RN)      │
└────────┬────────┘  └────────┬─────────┘  └────────┬─────────┘
         │                    │                     │
         └────────────────────┼─────────────────────┘
                              ▼
                 NestJS API  /api/v1  (port 4000)
                              ▼
                 Shared DB (mock now → PostgreSQL)
```

- Booking on app → visible on web Supplier Portal (and vice versa).
- Do **not** invent local-only business logic for prices, inventory, or vouchers.
- Blog / Admin / Affiliate = **web only** — do not build those screens in the app.

---

## 2. How to run backend locally

```bash
cd backend
npm install
npm run build
npm start
# or for hot reload:
npm run dev
```

Health check: open `http://localhost:4000/api/v1/listings` — should return JSON array.

**Android emulator note:** use `http://10.0.2.2:4000/api/v1` instead of `localhost`.  
**iOS simulator:** `http://localhost:4000/api/v1` is fine.  
**Physical device:** use your machine LAN IP, e.g. `http://192.168.x.x:4000/api/v1`.

---

## 3. Suggested API client (Expo)

```ts
const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

export async function api<T>(
  path: string,
  options: RequestInit = {},
  token?: string,
): Promise<T> {
  const res = await fetch(`${API_BASE}${path.startsWith('/') ? path : `/${path}`}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `API ${res.status}`);
  }
  return res.json();
}
```

Store refresh/access tokens in **`expo-secure-store`**, never plain AsyncStorage.

---

## 4. Endpoints READY NOW

### 4.1 Listings & discovery

| Method | Path | Query / params | Notes |
|--------|------|----------------|-------|
| `GET` | `/listings` | `destination`, `category`, `search` | `search` triggers hybrid/vector search |
| `GET` | `/listings/:slug` | slug or id | Detail + `available_slots` |
| `GET` | `/listings/categories` | — | Category list |
| `GET` | `/listings/destinations` | — | Destination list |
| `GET` | `/listings/destinations/:slug` | e.g. `bali` | Destination + `top_listings` + blogs stub |

**Examples**

```http
GET /api/v1/listings
GET /api/v1/listings?destination=bali
GET /api/v1/listings?search=sunset%20cruise
GET /api/v1/listings/luxury-bali-sunset-catamaran-cruise
GET /api/v1/listings/categories
GET /api/v1/listings/destinations
GET /api/v1/listings/destinations/bali
```

**Sample listing fields**

```json
{
  "id": "list-bali-sunset",
  "slug": "luxury-bali-sunset-catamaran-cruise",
  "title": "...",
  "base_price": 89,
  "currency": "USD",
  "confirmation_type": "INSTANT",
  "cancellation_policy": "FREE_24H",
  "cached_rating_avg": 4.9,
  "images": [{ "url": "...", "alt": "..." }],
  "options": [
    { "id": "opt-101-adult", "name": "Adult", "price": 89, "currency": "USD", "age_group": "ADULT" }
  ],
  "meeting_point": { "address": "...", "latitude": 0, "longitude": 0 },
  "available_slots": []
}
```

Useful sample IDs:

| Listing ID | Slug |
|------------|------|
| `list-bali-sunset` | `luxury-bali-sunset-catamaran-cruise` |
| `list-paris-louvre` | `louvre-museum-masterpieces-guided-tour` |
| `list-dubai-desert-safari` | `dubai-vip-red-dune-desert-safari` |
| `list-lahore-walled-city` | `lahore-walled-city-heritage-food-walk` |

---

### 4.2 Availability (inventory hold)

| Method | Path | Body |
|--------|------|------|
| `GET` | `/availability/slots/:listingId` | — (`listingId` = id or slug) |
| `POST` | `/availability/hold` | see below |

**Hold request**

```json
{
  "slot_id": "slot-101",
  "option_id": "opt-101-adult",
  "quantity": 2
}
```

**Hold response**

```json
{
  "hold_id": "hold_a1b2c3d4",
  "expires_at": 1723020000000
}
```

- Hold TTL ≈ **900 seconds (15 min)**.
- If capacity insufficient → `409 Conflict`.
- Pass `hold_id` into checkout before expiry.

**Sample slot**

```json
{
  "id": "slot-101",
  "listing_id": "list-bali-sunset",
  "start_time": "2026-08-05T16:30:00Z",
  "end_time": "2026-08-05T20:30:00Z",
  "total_capacity": 20,
  "booked_capacity": 14,
  "held_capacity": 2
}
```

Remaining seats ≈ `total_capacity - booked_capacity - held_capacity`.

---

### 4.3 Bookings (checkout)

| Method | Path | Body / notes |
|--------|------|--------------|
| `POST` | `/bookings` | Checkout after successful hold |
| `GET` | `/bookings/:ref` | By `booking_reference` or booking `id` |
| `GET` | `/bookings/supplier/list` | `?supplier_id=` (supplier inbox) |

**Checkout request**

```json
{
  "hold_id": "hold_a1b2c3d4",
  "lead_name": "Ayesha Khan",
  "lead_email": "ayesha.khan@example.com",
  "lead_phone": "+92 300 1234567",
  "special_requirements": "Vegetarian meal",
  "payment_token": "tok_stripe_sim_xxx"
}
```

**Checkout / booking response (shape)**

```json
{
  "id": "book-...",
  "booking_reference": "TN-2026-1234",
  "listing_id": "list-bali-sunset",
  "option_id": "opt-101-adult",
  "option_name": "Adult",
  "slot_id": "slot-101",
  "slot_start_time": "2026-08-05T16:30:00Z",
  "total_travelers": 2,
  "gross_amount": 178,
  "platform_fee": 26.7,
  "supplier_payout": 151.3,
  "currency": "USD",
  "status": "CONFIRMED",
  "confirmation_type": "INSTANT",
  "qr_voucher_code": "TN-QR-LUXU-12345",
  "traveler_details": {
    "lead_name": "Ayesha Khan",
    "lead_email": "ayesha.khan@example.com",
    "lead_phone": "+92 300 1234567"
  },
  "created_at": "2026-08-07T06:00:00.000Z"
}
```

**Statuses you may see:**  
`PENDING_PAYMENT` | `AWAITING_SUPPLIER_CONFIRMATION` | `CONFIRMED` | `CANCELLED` | `COMPLETED` | `REFUNDED`

**Offline voucher:** after checkout, cache `booking_reference` + `qr_voucher_code` + traveler/slot fields locally so My Bookings works offline (SRS requirement).

---

### 4.4 Canonical booking flow (Customer App)

```
1. GET  /listings/:slug
2. GET  /availability/slots/:listingId
3. User picks option + quantity + date/slot
4. POST /availability/hold          → hold_id, expires_at
5. Show countdown + payment UI
6. POST /bookings                   → booking + qr_voucher_code
7. Cache voucher offline
8. GET  /bookings/:ref              → refresh when online
```

Do **not** skip the hold step — inventory locking depends on it (same as website).

---

### 4.5 KYC (mostly web; supplier may read status)

| Method | Path | Body |
|--------|------|------|
| `GET` | `/kyc/:supplierId` | — |
| `POST` | `/kyc/submit` | company fields (see below) |
| `POST` | `/kyc/override` | admin only — web |

```json
POST /kyc/submit
{
  "supplier_id": "sup-oceanic-tours",
  "company_name": "Oceanic Tours Pvt Ltd",
  "business_reg": "REG-12345",
  "tax_id": "TAX-9988",
  "document_name": "trade_license.pdf"
}
```

> SRS: full KYC document upload stays on **web Supplier Portal**. App can show status only.

Sample supplier id used in mock: `sup-oceanic-tours`.

---

### 4.6 Payouts (Supplier App — read)

| Method | Path | Body |
|--------|------|------|
| `GET` | `/payouts/ledger/:supplierId` | Balance summary |
| `GET` | `/payouts/history/:supplierId` | Payout history |
| `POST` | `/payouts/trigger-run` | `{ "supplier_id": "sup-oceanic-tours" }` (dev/demo) |

**Ledger response shape**

```json
{
  "supplier_id": "sup-oceanic-tours",
  "gross_booking_value": 0,
  "total_platform_commission": 0,
  "net_earned_balance": 0,
  "total_paid_out": 0,
  "pending_payout_balance": 0,
  "currency": "USD"
}
```

---

### 4.7 AI (mobile v1 subset — use these)

| Method | Path | Body / query | Mobile use |
|--------|------|--------------|------------|
| `GET` | `/ai/personalized-recommendations` | `?userId=` | Home “For You” rail |
| `GET` | `/ai/review-summary/:listingId` | — | Listing pros/cons |
| `POST` | `/ai/chat` | `{ "message": "...", "locale": "en" }` | Help / concierge |
| `POST` | `/ai/review-check` | `{ "review_text", "rating" }` | Call on review submit (silent) |
| `POST` | `/ai/contextual-qa` | `{ "listing_id", "question" }` | Ask about this place |

**Chat example**

```http
POST /api/v1/ai/chat
{ "message": "How do I cancel?", "locale": "en" }
```

```json
{
  "response": "Free cancellation is available up to 24 hours...",
  "confidence": 0.98
}
```

**Personalization example**

```http
GET /api/v1/ai/personalized-recommendations?userId=cust-1
```

```json
{
  "personalized_rail_title": "Recommended For You Based on Your Travel Preferences",
  "listings": [ /* Listing[] */ ]
}
```

#### AI available but **deferred for mobile v1** (web / later phase)

| Method | Path | Why deferred |
|--------|------|--------------|
| `POST` | `/ai/trip-planner` | Better on large screen |
| `POST` | `/ai/search` | Semantic search Phase 3 |
| `GET` | `/ai/dynamic-pricing/:listingId` | Supplier desktop |
| `GET` | `/ai/forecast/:supplierId` | Supplier desktop |
| `POST` | `/ai/seo-assistant` | No blog in app |
| `POST` | `/ai/photo-analysis` | Listing creation is web |
| `POST` | `/ai/translate` | Optional later |
| `POST` | `/ai/support-priority` | Support triage backend |

---

### 4.8 Affiliate (web only — do not use in app)

| Method | Path |
|--------|------|
| `GET` | `/affiliate/dashboard/:code` |
| `POST` | `/affiliate/apply` |
| `GET` | `/affiliate/partner-catalog` |

---

## 5. Endpoints NOT BUILT YET (needed for full SRS apps)

Backend team must add these. App can stub UI, but do not invent fake local DBs for production data.

### 5.1 Auth (blocking for real apps)

| Method | Planned path | Purpose |
|--------|--------------|---------|
| `POST` | `/auth/register` | Email/password signup |
| `POST` | `/auth/login` | Login → access + refresh JWT |
| `POST` | `/auth/refresh` | Rotate tokens |
| `POST` | `/auth/otp/send` | Phone OTP |
| `POST` | `/auth/otp/verify` | Verify OTP |
| `POST` | `/auth/social` | Google / Apple / Facebook |
| `GET` | `/users/me` | Profile |
| `PATCH` | `/users/me` | Profile, locale, currency, notif prefs |

Biometric login is **client-side** (unlock stored tokens after first login).

### 5.2 Customer features missing

| Area | Planned endpoints (illustrative) |
|------|----------------------------------|
| Reviews | `GET/POST /listings/:id/reviews`, reply |
| Wishlist | `GET/POST/DELETE /wishlist` |
| My bookings list | `GET /bookings?status=UPCOMING\|COMPLETED\|...` |
| Cancel / reschedule | `POST /bookings/:id/cancel`, `.../reschedule` |
| Coupons / loyalty | `POST /checkout/apply-coupon`, `GET /loyalty` |
| Messaging | `GET/POST /bookings/:id/messages` |
| Support / FAQ | `GET /support/faq` |

### 5.3 Supplier features missing

| Area | Planned endpoints (illustrative) |
|------|----------------------------------|
| Dashboard | `GET /supplier/dashboard` |
| Confirm / reject | `POST /bookings/:id/confirm`, `.../reject` |
| QR check-in | `POST /bookings/check-in` `{ qr_voucher_code }` or `{ booking_reference }` |
| Check-in history | `GET /bookings/check-ins?listing_id=&date=` |
| Availability quick edit | `PATCH /availability/slots/:id` (block / capacity) |
| Review reply | `POST /reviews/:id/reply` |

### 5.4 Mobile-support module (SRS Section 3)

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/mobile/devices` | Register FCM/APNs token |
| `GET` | `/mobile/config` | Min version, force update, maintenance, feature flags |

**Suggested bodies**

```json
POST /mobile/devices
{
  "platform": "ios",
  "fcm_token": "...",
  "app_version": "1.0.0"
}
```

```json
GET /mobile/config →
{
  "min_supported_version_ios": "1.0.0",
  "min_supported_version_android": "1.0.0",
  "force_update": false,
  "maintenance_mode": false,
  "feature_flags": {}
}
```

**Additive DB tables only:** `device_tokens`, `app_config` — no redesign of core tables.

---

## 6. Scope matrix (quick)

| Feature | Web | Customer App | Supplier App |
|---------|-----|--------------|--------------|
| Browse / search / book / pay | ✅ | ✅ | — |
| Reviews | ✅ | ✅ | Reply ✅ |
| Wishlist | ✅ | Save/unsave ✅ | — |
| AI Trip Planner / Semantic Search | ✅ | ❌ v1 | — |
| Blog / Admin / Affiliate | ✅ | ❌ | ❌ |
| Listing create / full pricing / KYC upload | ✅ | ❌ | ❌ (web) |
| Booking inbox + QR check-in | ✅ | — | ✅ |
| Payouts view | ✅ | — | Read-only ✅ |
| Push notifications | Optional | ✅ Core | ✅ Core |
| Offline voucher | — | ✅ | — |

---

## 7. Error handling

| HTTP | Typical meaning |
|------|-----------------|
| `400` | Bad request (missing `slot_id` / quantity) |
| `404` | Listing / booking / slot not found |
| `409` | Hold conflict / expired hold / sold out |
| `5xx` | Server error — show retry UI |

Nest often returns:

```json
{ "statusCode": 409, "message": "Only 2 slots remaining...", "error": "Conflict" }
```

Surface `message` to the user.

---

## 8. Quick cURL smoke tests

```bash
# Listings
curl http://localhost:4000/api/v1/listings

# Detail
curl http://localhost:4000/api/v1/listings/luxury-bali-sunset-catamaran-cruise

# Slots
curl http://localhost:4000/api/v1/availability/slots/list-bali-sunset

# Hold
curl -X POST http://localhost:4000/api/v1/availability/hold \
  -H "Content-Type: application/json" \
  -d "{\"slot_id\":\"slot-101\",\"option_id\":\"opt-101-adult\",\"quantity\":1}"

# Checkout (replace HOLD_ID)
curl -X POST http://localhost:4000/api/v1/bookings \
  -H "Content-Type: application/json" \
  -d "{\"hold_id\":\"HOLD_ID\",\"lead_name\":\"Test User\",\"lead_email\":\"t@example.com\",\"lead_phone\":\"+92000\",\"payment_token\":\"tok_test\"}"

# AI chat
curl -X POST http://localhost:4000/api/v1/ai/chat \
  -H "Content-Type: application/json" \
  -d "{\"message\":\"Where is my voucher?\"}"
```

---

## 9. Recommended build order (app team)

Per mobile SRS roadmap:

1. **Foundation** — Expo monorepo (customer + supplier targets), API client, env, Sentry  
2. **Integrate ready APIs** — listings, detail, hold → checkout, voucher QR screen  
3. **Wait / parallel for Auth + mobile/devices + mobile/config**  
4. **Customer depth** — My Bookings, reviews, wishlist, push  
5. **Supplier** — inbox, confirm/reject, camera QR check-in, payouts read  
6. **AI polish** — personalization rail, review summary, concierge chat  

---

## 10. Contacts / source map

| Area | Path |
|------|------|
| Backend entry | `backend/src/main.ts` (port `4000`) |
| Nest module wiring | `backend/src/app.module.ts` |
| Mock data / shapes | `backend/src/mock-db/db.store.ts` |
| Controllers | `backend/src/*/ *.controller.ts` |
| Web API client (reference) | `frontend/src/lib/api-client.ts` |
| This handoff | `API_HANDOFF.md` (repo root) |

---

## 11. One-liner for the team

> Call **`http://<host>:4000/api/v1`**. Same API as the website. Start with **listings → hold → bookings**. Cache **`qr_voucher_code`** offline. Do not use Blog/Admin/Affiliate. Auth, wishlist, reviews CRUD, QR check-in, and `/mobile/*` are next backend deliverables — keep client ready for JWT Bearer auth.

---

*Document generated for TravelNest mobile handoff · aligns with TravelNest Mobile App SRS v1.0 (Aug 2026) and current NestJS routes.*
