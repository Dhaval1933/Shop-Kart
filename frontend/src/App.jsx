import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Wishlist from "./pages/Wishlist";
import Cart from "./pages/Cart";
import { getCustomerProfile } from "./services/api";
import { CartProvider } from "./context/CartContext";

export default function App() {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Check on initial load if user already has a valid HttpOnly cookie session
  const checkAuth = async () => {
    try {
      const data = await getCustomerProfile();
      setUser(data);
    } catch {
      setUser(null);
    } finally {
      setAuthChecked(true);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <Router>
      <CartProvider user={user}>
        <div className="app-container">
          {/* Global Navigation Bar */}
          <Navbar
            user={user}
            onLogoutSuccess={() => setUser(null)}
          />

          {/* Application Page Routing */}
          <main className="main-content">
            <Routes>
              {/* Default Route -> redirects to /home if authenticated, else /products */}
              <Route
                path="/"
                element={<Navigate to="/products" replace />}
              />

              {/* Task 1: Register Page */}
              <Route
                path="/register"
                element={
                  user ? <Navigate to="/home" replace /> : <Register />
                }
              />

              {/* Task 2: Login Page */}
              <Route
                path="/login"
                element={
                  user ? (
                    <Navigate to="/home" replace />
                  ) : (
                    <Login onLoginSuccess={checkAuth} />
                  )
                }
              />

              {/* Task 3: Protected Home Page */}
              <Route
                path="/home"
                element={
                  <Home
                    user={user}
                    setUser={setUser}
                    onLogoutSuccess={() => setUser(null)}
                  />
                }
              />

              {/* Lab 03 Task 6: Product Listing Page */}
              <Route
                path="/products"
                element={<Products />}
              />

              {/* Lab 03 Task 8: Product Details Page */}
              <Route
                path="/products/:id"
                element={<ProductDetails />}
              />

              {/* Lab 04: Wishlist Page */}
              <Route
                path="/wishlist"
                element={<Wishlist user={user} />}
              />

              {/* Lab 05: Shopping Cart Page */}
              <Route
                path="/cart"
                element={<Cart user={user} />}
              />

              {/* Catch-all fallback */}
              <Route
                path="*"
                element={<Navigate to="/products" replace />}
              />
            </Routes>
          </main>
        </div>
      </CartProvider>
    </Router>
  );
}

