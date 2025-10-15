# Sustain Bottles — demo storefront

This is a small demo Node.js + Express + MongoDB project for a sustainable water bottle startup. It includes:

- Static frontend (HTML/CSS/JS) in `public/`
- API endpoints for signup/login, contact, products
- Admin-only product creation
- MongoDB for persistence

Quick start

1. Copy `.env.example` to `.env` and edit values (MongoDB connection string, JWT secret):

   - On Windows PowerShell:

```powershell
cp .env.example .env
# then edit .env in your editor
```

2. Install dependencies and start:

```powershell
npm install
npm run dev
```

3. Open http://localhost:3000

Admin user

To create an admin user, either:

- Register via the signup form, then mark the user as admin in MongoDB manually (set `isAdmin: true`), or
- Insert a user via a script and set `isAdmin: true`.

Notes

- This is a simple demo and skips many production concerns (input validation, file uploads, rate-limiting, CSRF protection, email verification).
- Feel free to ask me to add features: product images upload, stripe payments, pagination, or deploy instructions.
