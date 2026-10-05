# 🥤 Blendr — Build-Your-Own Smoothie

A QR-triggered smoothie customization app. Customers scan a QR code at the counter, pick their cup, fruits, liquid base, and nutrition add-ons, watch an ingredient-accurate preparation animation, then check out — all in one flow. Owners manage the entire menu (ingredients, pricing, stock, blend rules) from a built-in admin panel, no code changes required.

## ✨ Features

- **Step-by-step build flow** — cup size → fruits (with a live thickness meter) → liquid base → nutrition add-ons → review → animated prep → order confirmation
- **Smart thickness guard** — checkout is blocked until enough fruit is added relative to cup size, so orders can't come out watery
- **Ingredient-accurate prep animation** — each ingredient category (fruit chunks, liquid drizzle, protein/vitamin powder, seed/nut sprinkle) animates differently, assembled live from the customer's actual order — no per-order video generation needed
- **Live blend-glass preview** — a glass widget fills with real ingredient colors as the customer builds their smoothie
- **Full admin panel** (`/admin`) — add, edit, delete, and stock-toggle fruits/liquids/add-ons; tune the thickness formula and cup sizes without touching code
- **MongoDB-backed** — menu and orders persist in a real database, so the admin panel and customer page always stay in sync

## 🛠 Tech stack

| Layer      | Choice                                   |
|------------|-------------------------------------------|
| Framework  | Next.js 14 (App Router)                   |
| UI         | React, plain CSS (no component library)   |
| Database   | MongoDB + Mongoose                        |
| Hosting    | Vercel (recommended) + MongoDB Atlas      |
| Payments   | Razorpay (not yet wired — see Roadmap)    |

## 📂 Project structure

```
blendr-app/
├── lib/mongodb.js              # DB connection helper
├── models/
│   ├── Ingredient.js           # fruits, liquids & add-ons — one flexible schema
│   ├── Settings.js             # cup sizes + thickness ratio (owner-tunable)
│   └── Order.js                # saved customer orders
├── scripts/seed.js             # populates starter ingredients + settings
└── app/
    ├── page.js                 # customer build flow
    ├── admin/page.js           # owner dashboard
    ├── globals.css             # styling + prep animation keyframes
    └── api/
        ├── ingredients/        # GET/POST/PUT/DELETE menu items
        ├── settings/           # GET/PUT thickness ratio & cups
        └── orders/             # POST new order, GET order history
```

## 🚀 Getting started

```bash
git clone <your-repo-url>
cd blendr-app
npm install
cp .env.example .env.local      # paste in your MongoDB connection string
npm run seed                    # loads starter fruits/liquids/add-ons
npm run dev                     # http://localhost:3000
```

Admin panel: `http://localhost:3000/admin`
> ⚠️ Not password-protected yet — add an auth check before deploying publicly (see Roadmap).

## 🔐 Environment variables

| Variable         | Description                                  |
|------------------|-----------------------------------------------|
| `MONGODB_URI`    | MongoDB Atlas (or local) connection string    |
| `ADMIN_PASSWORD` | Reserved for admin auth (not yet enforced)    |

## 🧪 How thickness is decided

Instead of a flat "40g of fruit" rule, thickness scales with cup size:

```
requiredGrams = cup.ml × thicknessRatio
```

`thicknessRatio` (default `0.15`) lives in the `Settings` collection and is editable from `/admin` — if smoothies come out watery, the owner raises the number, no redeploy needed.

## 🎬 How the prep animation works

Each ingredient has an `animationType`: `chunk` (fruit), `drizzle` (liquids/syrups), `powder` (protein/vitamin/zinc boosts), or `sprinkle` (seeds/nuts/toppings). The prep screen plays the matching animation for every item in the customer's real order, in the order they picked it — giving a bespoke "watching my smoothie get made" feel without generating video per order.

## 🗺 Roadmap

- [ ] Password-protect `/admin` (middleware or simple auth)
- [ ] Wire up Razorpay checkout + payment webhook
- [ ] `/kitchen` staff view with order status (received → preparing → ready)
- [ ] QR code generation pointing at the deployed URL
- [ ] Swap CSS particle animation for Lottie/Canvas for richer visuals

## 📄 License

Private project — all rights reserved (update this once you decide on a license).