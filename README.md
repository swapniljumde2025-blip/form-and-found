# Fresh Modern 3D Store

A full-stack React + Express + MongoDB storefront for selling **physical 3D-printed products**. Buyers order finished products; STL/3MF files are not sold or exposed to customers.

## Overview
This package is the clean new storefront direction. It uses the same production-ready API and admin workflow but a distinct brand presentation. Change the brand text and theme in client/src/App.jsx and client/src/styles.css as desired.

## Features
- Responsive storefront, product search, category filtering, product detail, cart and checkout
- Physical product fields: material, dimensions, colour options, stock / made-to-order
- Admin sign-in using a hashed password and signed JWT (8-hour session)
- Admin product create/edit/delete and image upload (up to 6 images, 5 MB each)
- Order placement with Cash on Delivery / manual payment placeholder
- Admin order list and order status updates
- Server-calculated prices and shipping; customer cannot submit their own product prices
- MongoDB persistence, basic security headers, API rate limit and input validation

## Requirements
Node.js 18+, MongoDB Atlas (or local MongoDB).

## Run locally
1. Open a terminal in `server`, run `npm install`.
2. Copy `.env.example` to `.env`; fill in MongoDB URI, a long random JWT secret, admin email and password.
3. Run `npm run seed:admin` once to create the owner account.
4. Run `npm run dev` to start the API at `http://localhost:5000`.
5. Open another terminal in `client`, run `npm install`.
6. Copy `client/.env.example` to `client/.env` and keep the API URL as `http://localhost:5000/api`.
7. Run `npm run dev`, then open the Vite URL shown (normally `http://localhost:5173`).

## Admin
Click **Owner login** in the storefront. Use `ADMIN_EMAIL` and `ADMIN_PASSWORD` from server `.env`.

## Before going live
- Change all example secrets/passwords. Never commit `.env`.
- Use MongoDB Atlas network access restrictions and a database user with least privilege.
- Deploy API and frontend over HTTPS. Set `CLIENT_URL` to the exact production frontend origin(s).
- Use persistent file storage or a managed image service (Cloudinary/S3) for uploads. Render's local filesystem may be ephemeral.
- Configure backups, transactional email, shipping rates, GST/invoice details, privacy/returns policies and order notifications.
- Payment gateway is intentionally not connected yet. Add Razorpay/Stripe only after creating merchant account and configuring server-side signature verification and webhooks.
- This starter does not calculate live courier rates or send SMS/email. Order placement is a working COD/manual placeholder.
- Review legal rights before selling fan art or copyrighted characters (e.g. cartoon characters); only list designs you own or are licensed to sell.

## API overview
`GET /api/health`, `GET /api/products`, `POST /api/orders`
Admin JWT: `POST /api/auth/login`, `GET /api/products/admin/all`, `POST /api/products`, `PUT /api/products/:id`, `DELETE /api/products/:id`, `POST /api/products/upload`, `GET /api/orders`, `PATCH /api/orders/:id/status`.

## Project layout
- `client/` React + Vite frontend
- `server/` Express API, Mongoose models and uploads
