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

export default authApi;
