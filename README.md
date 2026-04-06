# ✅ Checked In
### "Has your family checked in today?"

A dedicated countertop touchscreen companion for elderly parents that notifies their adult children when daily tasks are completed — starting with medications.

Live at [checked-in.app](https://checked-in.app)

---

## What It Does

Checked In sits on a countertop and gives elderly parents a simple, large-tile interface for confirming their daily tasks. When they check in, their adult children get notified — peace of mind delivered every morning.

**Phase 1 (current):** Medication check-in with family email notification.

---

## Tech Stack

- **Frontend:** React + Vite (PWA → React Native)
- **Backend:** Node.js / Express on DigitalOcean *(Phase 2)*
- **Database:** PostgreSQL *(Phase 2)*
- **Domain/DNS:** Cloudflare — checked-in.app

---

## Setup

```bash
npm install
npm run dev
```

Edit the `DEFAULT_CONFIG` block at the top of `src/App.jsx` to set medications, names, and notification email addresses.

**Kiosk mode (tablet/countertop display):**
```bash
open -a "Google Chrome" --args --kiosk http://localhost:5173
```

---

## Roadmap

| Phase | Feature | Status |
|-------|---------|--------|
| 1 | Medication check-in + email notification | ✅ Done |
| 2 | Node.js backend + PostgreSQL on DigitalOcean | 🔄 In Progress |
| 3 | Admin portal + PWA for family + additional tiles | 📋 Planned |
| 4 | Raspberry Pi hardware kit option | 📋 Planned |
| 5 | React Native iOS + Android apps | 📋 Planned |

---

*Previously named `med-tracker`. Rebranded to Checked In — April 2026.*
