# 🌸 Carol's Baby Shower — Potluck Sign-up

A hosted potluck sign-up form with a real backend, built for Netlify.

---

## Deploy in 5 minutes

### Step 1 — Create a Netlify account
Go to [netlify.com](https://netlify.com) and sign up free. No credit card needed.

### Step 2 — Install the Netlify CLI
Open your terminal and run:
```
npm install -g netlify-cli
```

### Step 3 — Deploy
In your terminal, navigate to this folder and run:
```
netlify deploy --prod
```
Follow the prompts — log in, create a new site, and it will deploy automatically.

Your site will be live at a URL like: `https://carol-potluck.netlify.app`

---

## Set your host key (important!)

The host key protects the "remove a slot" feature so only you can undo assignments.

1. In your Netlify dashboard, go to **Site Configuration → Environment Variables**
2. Add a new variable:
   - **Key:** `HOST_KEY`
   - **Value:** choose any password (e.g. `carol2024`)
3. Click Save and redeploy

When you use the Host View tab on the site, enter this same password to unlock it.

---

## How it works

| Feature | How |
|---|---|
| Guest sign-up | Tap a dish card, enter name + details, submit |
| Duplicate prevention | Server checks the slot before saving — no double-booking |
| Host view | Password-protected tab showing all assignments + allergen flags |
| Remove a slot | Host view → click ✕ next to any assignment |
| Data storage | Netlify Blobs (built-in, no external database needed) |

---

## File structure

```
potluck-app/
├── index.html                    ← The full frontend
├── netlify/
│   └── functions/
│       └── assignments.js        ← The backend API
├── netlify.toml                  ← Netlify config
├── package.json                  ← Dependencies
└── README.md                     ← This file
```

---

## Sharing with guests

Once deployed, just send the URL in your WhatsApp group. It works perfectly on mobile.
