import axios from "axios";

/**
 * Axios instance configured for ShopKart authentication.
 *
 * CRITICAL SETTING:
 * `withCredentials: true` ensures that HttpOnly cookies (such as our JWT token)
 * are automatically sent with every request and stored by the browser upon receiving
 * Set-Cookie headers from the backend.
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || "";

export const authApi = axios.create({
  baseURL: `${API_BASE_URL}/customers`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export const productApi = axios.create({
  baseURL: `${API_BASE_URL}/products`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Task 1: Register a new customer
 * @route POST /customers/register
 * @param {Object} data - { fullName, email, password, phone }
 */
export const registerCustomer = async (data) => {
  const response = await authApi.post("/register", data);
  return response.data;
};

/**
 * Task 2: Login customer and obtain HttpOnly session cookie
 * @route POST /customers/login
 * @param {Object} credentials - { email, password }
 */
export const loginCustomer = async (credentials) => {
  const response = await authApi.post("/login", credentials);
  return response.data;
};

/**
 * Task 3: Fetch currently logged-in customer's profile
 * @route GET /customers/me
 */
export const getCustomerProfile = async () => {
  const response = await authApi.get("/me");
  return response.data;
};

/**
 * Task 4: Logout customer and clear session cookie
 * @route POST /customers/logout
 */
export const logoutCustomer = async () => {
  const response = await authApi.post("/logout");
  return response.data;
};

/**
 * Lab 03 - Part 1 & 2: Products APIs
 */

/**
 * Fetch products list with optional search, category filter, and sorting
 * @route GET /products?search=...&category=...&sort=...
 * @param {Object} options - { search, category, sort }
 */
export const getProducts = async ({ search, category, sort } = {}) => {
  const params = {};
  if (search && search.trim()) {
    params.search = search.trim();
  }
  if (category && category !== "All" && category !== "All Categories") {
    params.category = category.trim();
  }
  if (sort && sort !== "default") {
    params.sort = sort;
  }

  const response = await productApi.get("", { params });
  return response.data;
};

/**
 * Fetch single product details by MongoDB _id
 * @route GET /products/:id
 * @param {string} id - Product _id
 */
export const getProductById = async (id) => {
  const response = await productApi.get(`/${id}`);
  return response.data;
};

/**
 * Create a new product
 * @route POST /products
 * @param {Object} productData - { name, description, price, category, image, stock }
 */
export const createProduct = async (productData) => {
  const response = await productApi.post("", productData);
  return response.data;
};

/**
 * Lab 04: Wishlist APIs
 */
export const wishlistApi = axios.create({
  baseURL: `${API_BASE_URL}/wishlist`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Task 3: Get current user's populated wishlist
 * @route GET /wishlist
 */
export const getWishlist = async () => {
  const response = await wishlistApi.get("");
  return response.data;
};

/**
 * Task 2: Add product to current user's wishlist
 * @route POST /wishlist/:productId
 * @param {string} productId
 */
export const addToWishlist = async (productId) => {
  const response = await wishlistApi.post(`/${productId}`);
  return response.data;
};

/**
 * Task 4: Remove product from current user's wishlist
 * @route DELETE /wishlist/:productId
 * @param {string} productId
 */
export const removeFromWishlist = async (productId) => {
  const response = await wishlistApi.delete(`/${productId}`);
  return response.data;
};

/**
 * Bonus Task 23: Toggle product in wishlist
 * @route PATCH /wishlist/:productId/toggle
 * @param {string} productId
 */
export const toggleWishlist = async (productId) => {
  const response = await wishlistApi.patch(`/${productId}/toggle`);
  return response.data;
};

/**
 * Bonus Task 24: Get count of saved wishlist items
 * @route GET /wishlist/count
 */
export const getWishlistCount = async () => {
  const response = await wishlistApi.get("/count");
  return response.data;
};

/**
 * Lab 05: Shopping Cart APIs
 */
export const cartApi = axios.create({
  baseURL: `${API_BASE_URL}/cart`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Task 3: Get current user's populated cart
 * @route GET /cart
 */
export const getCart = async () => {
  const response = await cartApi.get("");
  return response.data;
};

/**
 * Task 2: Add product to cart / increment quantity
 * @route POST /cart/:productId
 * @param {string} productId
 */
export const addToCart = async (productId) => {
  const response = await cartApi.post(`/${productId}`);
  return response.data;
};

/**
 * Task 4: Update product quantity in cart
 * @route PATCH /cart/:productId
 * @param {string} productId
 * @param {number} quantity
 */
export const updateCartQuantity = async (productId, quantity) => {
  const response = await cartApi.patch(`/${productId}`, { quantity });
  return response.data;
};

/**
 * Task 5: Remove product from cart
 * @route DELETE /cart/:productId
 * @param {string} productId
 */
export const removeFromCart = async (productId) => {
  const response = await cartApi.delete(`/${productId}`);
  return response.data;
};

/**
 * Lab 06: Order & Checkout APIs
 */
export const orderApi = axios.create({
  baseURL: `${API_BASE_URL}/orders`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Task 4: Validate cart, create ShopKart pending order and Razorpay Order
 * @route POST /orders/create-payment-order
 * @param {Object} shippingAddress - { fullName, phone, addressLine1, city, state, pincode }
 */
export const createPaymentOrder = async (shippingAddress) => {
  const response = await orderApi.post("/create-payment-order", { shippingAddress });
  return response.data;
};

/**
 * Task 4 & Step 11: Verify Razorpay signature and confirm ShopKart order
 * @route POST /orders/verify-payment
 * @param {Object} paymentData - { shopKartOrderId, razorpay_order_id, razorpay_payment_id, razorpay_signature }
 */
export const verifyPayment = async (paymentData) => {
  const response = await orderApi.post("/verify-payment", paymentData);
  return response.data;
};

/**
 * Task 7: Get current user's orders
 * @route GET /orders
 */
export const getOrders = async () => {
  const response = await orderApi.get("");
  return response.data;
};

/**
 * Task 17: Get single order details
 * @route GET /orders/:id
 * @param {string} id - Order ID
 */
export const getOrderById = async (id) => {
  const response = await orderApi.get(`/${id}`);
  return response.data;
};

/**
 * Bonus Challenge (Section 26): Update order status progression
 * @route PATCH /orders/:id/status
 * @param {string} id - Order ID
 * @param {string} status - New status (PLACED, CONFIRMED, SHIPPED, DELIVERED)
 */
export const updateOrderStatus = async (id, status) => {
  const response = await orderApi.patch(`/${id}/status`, { status });
  return response.data;
};

export default authApi;



