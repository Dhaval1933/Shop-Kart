# ShopKart: Engineering Labs 01, 02, 03, 04 & 05

Welcome to **ShopKart**, a production-style full-stack e-commerce application built with Node.js, Express, MongoDB Atlas, React, and Vite.

This repository implements the end-to-end curriculum across all five engineering labs:
1. **Lab-01 (ShopKart)**: Customer Authentication Backend Service (bcrypt, JWT, HttpOnly cookies)
2. **Lab-02 (Client-Server Auth)**: React Authentication UI & Protected Routes flow
3. **Lab-03 (Product Catalog)**: Product Catalog, Dynamic Search, Category Filtering & Price Sorting
4. **Lab-04 (Wishlist Experience)**: Persistent MongoDB Wishlist relationships (`ObjectId` refs to `Product`) & Protected APIs
5. **Lab-05 (Shopping Cart Experience)**: Shopping Cart with Global State (`CartContext`), derived calculations, stock validations & MongoDB persistence

---

## 📁 Project Structure

```
lab1/
├── backend/
│   ├── controllers/
│   │   ├── customer.controller.js  # Lab-01: register, login, me, logout, change-password
│   │   ├── product.controller.js   # Lab-03: createProduct, getAllProducts, getProductById
│   │   ├── wishlist.controller.js  # Lab-04: addToWishlist, getWishlist, removeFromWishlist, toggle, count
│   │   └── cart.controller.js      # Lab-05: addToCart, getCart, updateQuantity, removeFromCart
│   ├── middlewares/
│   │   └── auth.middleware.js      # Lab-01: JWT verification (supports cookies & Bearer tokens)
│   ├── models/
│   │   ├── customer.model.js       # Lab-01, 04, 05: Customer Schema (with wishlist & cart sub-arrays)
│   │   ├── user.model.js           # Alias model for backward compatibility
│   │   └── product.model.js        # Lab-03: Product Mongoose Schema
│   ├── routes/
│   │   ├── customer.routes.js      # Lab-01: /customers endpoints
│   │   ├── product.routes.js       # Lab-03: /products endpoints
│   │   ├── wishlist.routes.js      # Lab-04: /wishlist endpoints
│   │   └── cart.routes.js          # Lab-05: /cart endpoints
│   ├── utils/
│   │   └── generateToken.js        # Lab-01: JWT signing & cookie configuration
│   ├── postman/
│   │   ├── ShopKart_Lab04_Wishlist.postman_collection.json  # Postman collection for Lab 04
│   │   └── ShopKart_Lab05_Cart.postman_collection.json      # Postman collection for Lab 05
│   ├── index.js                    # Express app, CORS configuration & MongoDB connection
│   ├── seed.js                     # MongoDB seeding script (12 realistic catalog products)
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx          # Navigation with live Wishlist & Cart badges, auth state
│   │   │   ├── ProductCard.jsx     # Product cards with Wishlist heart & Add to Cart controls
│   │   │   ├── SearchBar.jsx       # Real-time search, category dropdown & price sorting
│   │   │   ├── WishlistCard.jsx    # Lab-04: Dedicated Wishlist card with remove action
│   │   │   └── CartItem.jsx        # Lab-05: Dedicated Cart item with [+] / [-] quantity controls
│   │   ├── context/
│   │   │   └── CartContext.jsx     # Lab-05: Global cart state & derived calculations (count, subtotal)
│   │   ├── pages/
│   │   │   ├── Login.jsx           # Lab-02: Customer login form with cookie handling
│   │   │   ├── Register.jsx        # Lab-02: Registration form with live validation
│   │   │   ├── Home.jsx            # Lab-02: Protected profile dashboard (GET /customers/me)
│   │   │   ├── Products.jsx        # Lab-03: Product catalog listing with loading/error/empty states
│   │   │   ├── ProductDetails.jsx  # Lab-03: Single product view (/products/:id)
│   │   │   ├── Wishlist.jsx        # Lab-04: User wishlist page with empty/loading states
│   │   │   └── Cart.jsx            # Lab-05: Cart page with 2-column layout & Order Summary sidebar
│   │   ├── services/
│   │   │   └── api.js              # Axios instances with withCredentials: true
│   │   ├── App.jsx                 # React Router v6 setup & CartProvider wrapper
│   │   ├── index.css               # Modern design system (glassmorphism, vibrant colors, responsive)
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── LAB3_VIVA_PREP.md               # Lab 03 viva questions & answers
├── LAB4_VIVA_PREP.md               # Lab 04 viva questions & answers
├── LAB5_VIVA_PREP.md               # Lab 05 viva questions & answers
├── VIVA_PREP_LAB_4_AND_5.md        # Combined Lab 04 & 05 viva revision sheet
└── VIVA_PREP_ALL_LABS.md           # Master viva preparation for all 5 labs
```

---

## 🚀 How to Run the Application

### 1. Start the Backend Server
```bash
cd backend
npm install
npm run dev
# or: npm start
```
- Server starts on **`http://localhost:5000`**
- Connects automatically to MongoDB Atlas via `MONGODB_URI` in `.env`

### 2. (First-time only) Seed the Catalog Database
```bash
cd backend
npm run seed
```
- Populates MongoDB with 12 diverse sample products across Electronics, Fashion, Books, and Home categories with high-quality images and stock quantities.

### 3. Start the Frontend Application
```bash
cd frontend
npm install
npm run dev
```
- Vite dev server starts on **`http://localhost:5173`**
- Open **`http://localhost:5173`** in your browser.

---

## 🧪 Manual Evaluation & Testing Guide (For Examiner / TA)

All features are designed for seamless **manual evaluation** through both the **Browser UI** and **Postman**. Follow the steps below for complete demonstration.

### Flow A: End-to-End Browser UI Testing Walkthrough

#### 1. Authentication (Lab 01 & 02)
1. Open `http://localhost:5173/register` in your browser.
2. Fill in Full Name, Email, Password (min 6 chars), and Phone. Click **Create Account**.
3. You will be redirected to `/login` with a success notice.
4. Log in using your email and password.
5. You will land on the **Home Dashboard (`/home`)** displaying your name, email, phone number, and member date.

#### 2. Product Catalog, Search & Filtering (Lab 03)
1. Click **Products** in the Navbar (`/products`).
2. **Search**: Type `Headphones` into the search bar. The list instantly filters to matching products.
3. **Category Filter**: Select `Fashion` or `Books` from the Category dropdown.
4. **Sort Filter**: Select `Price: Low to High` or `Price: High to Low`. Products reorder immediately.
5. Click **Reset Filters** to restore the full catalog.
6. Click **View Details** on any product to navigate to `/products/:id` to inspect full details, stock availability, and high-resolution images.

#### 3. Wishlist Journey (Lab 04)
1. On `/products`, locate any product card.
2. Click the heart button `[ ♡ Wishlist ]` (or floating heart icon on the image).
   - Button briefly shows `⏳ Saving...` (preventing double clicks).
   - Changes to `♥ Wishlisted` with an active highlight.
   - The Navbar dynamically updates to show `Wishlist (1)`.
3. Wishlist another product — Navbar updates to `Wishlist (2)`.
4. Click **Wishlist** in the Navbar to open `/wishlist`.
   - See your wishlisted items rendered via `WishlistCard` with image, title, price (₹), stock status, and category.
5. Click `[ Remove ♥ ]` on an item:
   - The item disappears immediately from the list (optimistic UI update).
   - The Navbar count drops from `(2)` to `(1)`.
6. Remove the remaining item:
   - The page smoothly transitions into the **Empty State**: `Your wishlist is empty ❤️`.
   - Click the `[ Browse Products ]` button to return to `/products`.
7. **Persistence check**: Refresh the browser page (`F5`). Your wishlist state remains intact because it is saved in MongoDB.

#### 4. Shopping Cart Journey (Lab 05)
1. Navigate to `/products`.
2. Click `[ Add to Cart ]` on a product:
   - Button transitions to `[ Adding... ]` then updates to `[ Add Another (1 in Cart) ]`.
   - The Navbar dynamically displays `Cart (1)`.
3. Click `[ Add Another ]` again or add a different product:
   - Navbar updates to `Cart (2)`.
4. Click **Cart** in the Navbar to navigate to `/cart`.
5. **Inspect the Two-Column Layout**:
   - **Left column**: List of cart items with thumbnail, title, price, category, subtotal, and `[-] [quantity] [+]` stepper controls.
   - **Right column**: Order Summary card showing Items count, Item Subtotal, Free Shipping badge, Estimated Tax, and Total Amount.
6. **Quantity Stepper (`+` / `-`)**:
   - Click `[ + ]`: quantity increases, Item subtotal updates, and Order Summary recalculates instantly.
   - Click `[ - ]`: quantity decreases.
7. **Stock Limit Validation**:
   - Keep clicking `[ + ]` until the product's max available stock is reached.
   - The `[ + ]` button automatically disables, preventing requests that exceed MongoDB stock.
8. **Remove Item**:
   - Click the red trash icon `[ Remove ]` on an item.
   - The item is removed and Order Summary recalculates.
9. **Empty Cart State**:
   - Remove the last item.
   - The page displays the **Empty State**: `Your cart is empty 🛒` with a `[ Browse Products ]` button.
10. **Persistence check**: Add an item to cart and refresh the page (`F5`). Cart items and quantities persist from MongoDB.

#### 5. Logout
1. Click `[ Logout ]` in the Navbar.
2. The `token` cookie is cleared, auth state resets, and you are redirected to `/login`.
3. Try accessing `/wishlist` or `/cart` directly in the address bar: you are safely redirected to `/login`.

---

### Flow B: Postman API Testing Walkthrough

Pre-configured Postman collections are included in `backend/postman/`:
- `backend/postman/ShopKart_Lab04_Wishlist.postman_collection.json`
- `backend/postman/ShopKart_Lab05_Cart.postman_collection.json`

#### How to Import & Run in Postman:
1. Open Postman.
2. Click **Import** (top-left) -> Choose File -> Select either collection JSON file.
3. The collection includes pre-configured collection variables:
   - `baseUrl`: `http://localhost:5000`
   - `token`: (Automatically populated upon login)
   - `productId`: `6a9ec400eda8eb1f54723d02` (pre-filled with a valid seeded product ID)
4. Execute the requests in sequence:

| Step | Request Name | Method | Endpoint | Expected Status | Description |
|---|---|---|---|---|---|
| **0** | Setup - Login & Save Token | `POST` | `/customers/login` | `200 OK` | Logs in and auto-saves JWT token to collection variable |
| **1** | Add to Wishlist | `POST` | `/wishlist/{{productId}}` | `201 Created` | Adds product to authenticated user's wishlist |
| **2** | Duplicate Prevention | `POST` | `/wishlist/{{productId}}` | `409 Conflict` | Prevents duplicate product entries |
| **3** | Get Wishlist | `GET` | `/wishlist` | `200 OK` | Returns populated wishlist array & item count |
| **4** | Get Wishlist Count | `GET` | `/wishlist/count` | `200 OK` | Fast lightweight count endpoint (Bonus +5) |
| **5** | Toggle Wishlist | `PATCH` | `/wishlist/{{productId}}/toggle` | `200 OK` | Toggles item in/out of wishlist (Bonus +10) |
| **6** | Remove from Wishlist | `DELETE` | `/wishlist/{{productId}}` | `200 OK` | Removes product from user's wishlist |
| **7** | Unauthorized Request | `GET` | `/wishlist` | `401 Unauthorized` | Rejects requests without authentication |
| **8** | Add to Cart | `POST` | `/cart/{{productId}}` | `200 OK` | Adds product to cart with quantity = 1 |
| **9** | Add Same Item Again | `POST` | `/cart/{{productId}}` | `200 OK` | Increments quantity to 2 |
| **10** | Get Cart | `GET` | `/cart` | `200 OK` | Returns populated cart items & quantities |
| **11** | Update Quantity | `PATCH` | `/cart/{{productId}}` | `200 OK` | Updates quantity (e.g. quantity = 3) |
| **12** | Exceed Stock Limit | `PATCH` | `/cart/{{productId}}` | `400 Bad Request` | Rejects quantity higher than available stock |
| **13** | Remove from Cart | `DELETE` | `/cart/{{productId}}` | `200 OK` | Deletes item from user's cart |
| **14** | Unauthorized Cart | `GET` | `/cart` | `401 Unauthorized` | Rejects unauthenticated requests |

---

## 📋 Comprehensive Feature Checklist

### 🛒 Lab-01: Customer Authentication Backend Service
- [x] `POST /customers/register` — Validates mandatory fields, email uniqueness, bcrypt password hashing (10 salt rounds).
- [x] `POST /customers/login` — Verifies password with `bcrypt.compare`, issues JWT in `HttpOnly` cookie.
- [x] `GET /customers/me` — Protected endpoint via `auth.middleware.js`, returns user profile without password.
- [x] `POST /customers/logout` — Clears `token` cookie with `expires: new Date(0)`.
- [x] Bonus Challenge (+10): `PATCH /customers/change-password` with current password verification.

### 🎨 Lab-02: Client-Server Auth (Frontend)
- [x] Controlled forms for Registration (`/register`) and Login (`/login`).
- [x] Live client-side error handling and backend error messages.
- [x] Axios instances configured with `withCredentials: true` for cookie handling.
- [x] Protected routes with session verification via `GET /customers/me`.
- [x] Automatic redirects between unauthenticated and authenticated views.

### 📦 Lab-03: Product Catalog & Discovery
- [x] Product Mongoose schema with name, description, price (> 0), category, image, stock (>= 0).
- [x] Endpoints: `POST /products`, `GET /products`, `GET /products/:id`.
- [x] Query filters: Case-insensitive regex search (`?search=`), category filter (`?category=`).
- [x] Bonus Challenge (+10): Dynamic price sorting (`?sort=price_asc` and `?sort=price_desc`).
- [x] Frontend catalog with `ProductCard`, debounced `SearchBar`, loading spinner, empty states, and product details view (`/products/:id`).

### ❤️ Lab-04: ShopKart Wishlist Experience
- [x] Extended Customer Schema with `wishlist: [{ type: ObjectId, ref: 'Product' }]`.
- [x] `POST /wishlist/:productId` — Protected endpoint, validates ObjectId (`400`), product existence (`404`), duplicate check (`409`).
- [x] `GET /wishlist` — Protected endpoint, returns populated products with count.
- [x] `DELETE /wishlist/:productId` — Protected endpoint, removes item reference.
- [x] Bonus Challenge (+10): `PATCH /wishlist/:productId/toggle`.
- [x] Bonus Challenge (+5): `GET /wishlist/count` for fast live counts.
- [x] Frontend Wishlist page (`/wishlist`) with `WishlistCard`, optimistic updates, empty states, and dynamic Navbar badge.

### 🛒 Lab-05: ShopKart Shopping Cart Experience
- [x] Extended Customer Schema with `cart: [{ product: ObjectId, quantity: Number }]`.
- [x] `POST /cart/:productId` — Protected, adds item with quantity 1 or increments existing quantity; enforces stock limits.
- [x] `GET /cart` — Protected, returns populated product data and quantities.
- [x] `PATCH /cart/:productId` — Protected, updates quantity with min 1 and stock limit validation.
- [x] `DELETE /cart/:productId` — Protected, removes item from cart.
- [x] Frontend Global State via `CartContext` with `useCart()` custom hook.
- [x] Derived calculations: total item count `Σ(quantity)` and subtotal `Σ(price * quantity)`.
- [x] Product card integration: `[ Add to Cart ]` with live feedback and quantity in cart indicator.
- [x] Full Cart page (`/cart`) with two-column layout, quantity steppers `[-] [+]`, Order Summary sidebar, and live Navbar `Cart (X)` badge.

---

## 🎓 Viva Preparation Resources

Detailed viva questions, answers, architectural explanations, and interview cheat sheets are available in the repository:
- **[`VIVA_PREP_LAB_4_AND_5.md`](./VIVA_PREP_LAB_4_AND_5.md)**: Combined viva revision guide for Labs 04 & 05 (Schema design, Population, Context API, Optimistic UI, Stock validations).
- **[`VIVA_PREP_ALL_LABS.md`](./VIVA_PREP_ALL_LABS.md)**: Master viva guide covering Labs 01 through 05.
- **[`LAB4_VIVA_PREP.md`](./LAB4_VIVA_PREP.md)**: Dedicated Lab 04 deep-dive.
- **[`LAB5_VIVA_PREP.md`](./LAB5_VIVA_PREP.md)**: Dedicated Lab 05 deep-dive.
- **[`LAB3_VIVA_PREP.md`](./LAB3_VIVA_PREP.md)**: Dedicated Lab 03 deep-dive.
