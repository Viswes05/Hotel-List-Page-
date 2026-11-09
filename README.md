# Hotel List Page – CRUD with Responsive UI

Full-stack hotel management app.

- **Frontend:** React 18, Redux Toolkit, React Router (SPA), React Helmet (SEO), Leaflet/OpenStreetMap, plain HTML/CSS
- **Backend:** Node.js + Express, PostgreSQL via native SQL (`pg`, no ORM), Multer for image uploads (stored on the server's disk)

## Features

- Add / Edit using **one reusable `HotelForm`** component, with client- and server-side validation (image upload with live preview, title, description, latitude, longitude, price)
- Card-style list with image, title, price and description snippet
- Search by title, filter by price range, server-side pagination (`offset` / `limit`)
- Edit and delete buttons per card; confirmation dialog and a **success popup** after delete
- Detail page with full info and a map of the hotel's location; uses the browser **Geolocation API** to show your distance to the hotel (and a "use my location" button in the form)
- `react-helmet-async` for dynamic titles / meta tags; every image has an `alt` attribute
- Reusable components: `HotelForm`, `HotelCard`, `Pagination`, plus `FilterSidebar`, `ConfirmDialog`, `SuccessPopup`, `HotelMap`

## Project structure

```
hotel-app/
├── backend/
│   ├── schema.sql              # hotels table
│   └── src/
│       ├── server.js           # Express app
│       ├── db.js               # pg Pool
│       ├── initDb.js           # applies schema.sql
│       ├── middleware/         # upload.js (multer), validate.js
│       └── routes/hotels.js    # CRUD + filters (native SQL)
└── frontend/
    └── src/
        ├── api/                # fetch helpers
        ├── store/              # Redux slice + store
        ├── components/         # reusable UI
        └── pages/              # list, detail, add/edit
```

## Setup

Prerequisites: Node 18+, PostgreSQL 13+.

### 1. Database + backend

```bash
createdb hotels_db                     # or create it with pgAdmin / psql
cd backend
cp .env.example .env                   # edit DATABASE_URL if needed
npm install
npm run db:init                        # creates the table
npm run dev                            # http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev                            # http://localhost:5173
```

The Vite dev server proxies `/api` and `/uploads` to the backend, so no extra config is needed.

## API

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/hotels` | Create (multipart: `image`, `title`, `description`, `latitude`, `longitude`, `price`) |
| PUT | `/api/hotels/:id` | Update; `image` optional – a new one replaces (and deletes) the old file |
| DELETE | `/api/hotels/:id` | Delete record and its image file |
| GET | `/api/hotels` | List. Query: `search`, `minPrice`, `maxPrice`, `offset`, `limit` → `{ data, total, offset, limit }` |
| GET | `/api/hotels/:id` | Single hotel (used by the detail page) |

Validation errors return `400` with `{ message, errors: { field: "..." } }`.
Images: JPG/PNG/WEBP/GIF, max 5 MB, saved in `backend/uploads/` and served from `/uploads/...`.
