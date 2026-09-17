# ShopKart: Engineering Labs 01, 02 & 03

Welcome to **ShopKart**, a full-stack e-commerce platform built with Node.js, Express, MongoDB Atlas, React, and Vite.

This repository covers **all three problem statements** from the [Lab-2029-Problem-Statements](https://github.com/mrinal1224/Lab-2029-Problem-Statements) repository:
1. **Lab-01 (ShopKart)**: Customer Authentication Backend Service
2. **Lab-02 (client Server Auth)**: React Authentication UI & Protected Home Flow
3. **Lab-03 (Product Catalog)**: Product Catalog, Discovery, Dynamic Search & Filtering

---

## Project Structure

```
lab1/
├── backend/
│   ├── controllers/
│   │   ├── customer.controller.js  # Lab-01: register, login, me, logout, change-password
│   │   └── product.controller.js   # Lab-03: createProduct, getAllProducts, getProductById
│   ├── middlewares/
│   │   └── auth.middleware.js      # Lab-01: JWT cookie verification
│   ├── models/
│   │   ├── customer.model.js       # Lab-01: Customer Mongoose Schema + bcrypt
│   │   └── product.model.js        # Lab-03: Product Mongoose Schema
│   ├── routes/
│   │   ├── customer.routes.js      # Lab-01: /customers endpoints
│   │   └── product.routes.js       # Lab-03: /products endpoints
│   ├── utils/
│   │   └── generateToken.js        # Lab-01: JWT creation & HttpOnly cookie config
│   ├── index.js                    # Express application & MongoDB connection
│   ├── seed.js                     # Lab-03: MongoDB seed script with realistic catalog
│   ├── test_products.js            # Lab-03: Automated test suite for Product APIs
│   ├── package.json
│   └── .env
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx          # Global navigation with brand, auth state & logout
    │   │   ├── ProductCard.jsx     # Lab-03: Dynamic product cards with badges & pricing
    │   │   └── SearchBar.jsx       # Lab-03: Search input, category & sort filters
    │   ├── pages/
    │   │   ├── Login.jsx           # Lab-02: Controlled login form with HttpOnly cookie handling
    │   │   ├── Register.jsx        # Lab-02: Customer registration with validation
    │   │   ├── Home.jsx            # Lab-02: Protected profile dashboard (GET /customers/me)
    │   │   ├── Products.jsx        # Lab-03: Dynamic catalog listing with loading/error/empty states
    │   │   └── ProductDetails.jsx  # Lab-03: Single product view (/products/:id) + Add to Cart UI
    │   ├── services/
    │   │   └── api.js              # Axios instances with withCredentials: true
    │   ├── App.jsx                 # React Router configuration
    │   ├── index.css               # Modern design system & responsive styling
    │   └── main.jsx
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── VIVA_QUESTIONS.md           # TA Viva preparation answers
```

---

## How to Run

### 1. Start the Backend Server
```bash
cd backend
npm install
npm run dev
# or npm start
```
*Backend runs on `http://localhost:5000` and connects to MongoDB Atlas.*

### 2. Start the Frontend Application
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`.*

### 3. (Optional) Run Automated Product API Tests
```bash
cd backend
node test_products.js
```

---

## Detailed Lab Coverage Breakdown

### 🛒 Lab-01: Customer Authentication Service (Backend)
- [x] **Task 1: Register Customer (`POST /customers/register`)**
  - Validation: All fields mandatory, email format, duplicate email prevention (409), password length >= 6 (400).
  - Passwords securely hashed with `bcrypt`.
  - Excludes password from return payload.
- [x] **Task 2: Login (`POST /customers/login`)**
  - Authenticates via bcrypt comparison.
  - Issues JWT token stored in an `HttpOnly` cookie.
  - Returns `401 Unauthorized` with generic "Invalid email or password" on failure.
- [x] **Task 3: My Profile (`GET /customers/me`)**
  - Protected route via `auth.middleware.js`.
  - Reads and cryptographically verifies token from cookie.
  - Attaches customer to `req.user` without password.
- [x] **Task 4: Logout (`POST /customers/logout`)**
  - Clears `token` cookie with `expires: new Date(0)` and `httpOnly: true`.
- [x] **Bonus Challenge (+10 Marks)**:
  - `PATCH /customers/change-password` verifies current password and hashes new password before saving.

---

### 🎨 Lab-02: Client-Server Auth (Frontend)
- [x] **Task 1: Registration Page (`/register`)**
  - Controlled inputs for Full Name, Email, Password, and Phone.
  - Live client-side validation and backend duplicate error display.
  - On success, redirects to `/login` with success banner and pre-filled email.
- [x] **Task 2: Login Page (`/login`)**
  - Controlled inputs sending credentials with `withCredentials: true`.
  - Displays "Invalid Credentials" on authentication failure.
  - On success, redirects to `/home`.
- [x] **Task 3: Protected Home Page (`/home`)**
  - Automatically verifies session on mount by calling `GET /customers/me`.
  - Redirects unauthenticated visitors to `/login`.
  - Displays customer name, email, phone number, and member-since date.
- [x] **Task 4: Logout**
  - Logout buttons in Navbar and Home page.
  - Calls `POST /customers/logout`, clears user state, and redirects to `/login`.
- [x] **TA Viva Questions**:
  - Fully answered in `frontend/VIVA_QUESTIONS.md`.

---

### 📦 Lab-03: Product Catalog & Discovery (Fullstack)
#### Part 1 — Backend Product APIs
- [x] **Task 1: Product Model (`backend/models/product.model.js`)**
  - Mongoose schema with `name`, `description`, `price` (> 0), `category`, `image`, `stock` (>= 0), `createdAt`.
- [x] **Task 2: Create Product (`POST /products`)**
  - Validates all fields, price > 0, stock >= 0; returns `201 Created`.
- [x] **Task 3: Get All Products (`GET /products`)**
  - Returns `{ success: true, count, products }`.
- [x] **Task 4: Get Single Product (`GET /products/:id`)**
  - Validates MongoDB ObjectId; returns `400` for invalid ID, `404` for not found, `200` with product on success.
- [x] **Task 5: Search & Category Filtering**
  - Case-insensitive regex name search (`?search=...`).
  - Category filter (`?category=...`).
  - Combined filters (`?search=...&category=...`).
- [x] **Bonus Challenge (+10 Marks)**:
  - Dynamic sorting by price: `?sort=price_asc` and `?sort=price_desc`.

#### Part 2 — Frontend Product Discovery
- [x] **Task 6: Product Listing Page (`/products`)**
  - Dynamic listing rendered with `.map()` from backend API.
  - Custom `ProductCard` component with image, name, price (in INR format), category badge, stock status badge, and "View Details" button.
- [x] **Task 7: Search & Filter UI (`SearchBar.jsx`)**
  - Debounced real-time search bar with clear button.
  - Category dropdown filter (All Categories, Electronics, Fashion, Books, Home).
  - Price sorting dropdown filter.
  - Reset filters button.
- [x] **Task 8: Product Details Page (`/products/:id`)**
  - Dynamic routing with `useParams()`.
  - Fetches product details via `GET /products/:id`.
  - Displays large image, title, price, description, category, stock availability.
  - "Add to Cart" interactive button with notification toast.
- [x] **State Handling**:
  - **Loading State**: Custom spinner and skeleton loading cards.
  - **Error State**: Friendly error alert with a "Retry Request" button.
  - **Empty State**: Friendly "No products found" banner with "Reset All Filters" button.

