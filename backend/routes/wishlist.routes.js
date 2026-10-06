const express = require("express");
const router = express.Router();
const wishlistController = require("../controllers/wishlist.controller");
const protect = require("../middlewares/auth.middleware");

// Protect all Wishlist endpoints (Section 14 & 15: Auth Required)
router.use(protect);

// GET /wishlist/count (Bonus Task 24: Fast count endpoint)
router.get("/count", wishlistController.getWishlistCount);

// GET /wishlist (Task 3: Get Current User's Wishlist with populate)
router.get("/", wishlistController.getWishlist);

// POST /wishlist/:productId (Task 2: Add Product to Wishlist)
router.post("/:productId", wishlistController.addToWishlist);

// DELETE /wishlist/:productId (Task 4: Remove Product from Wishlist)
router.delete("/:productId", wishlistController.removeFromWishlist);

// PATCH /wishlist/:productId/toggle (Bonus Task 23: Wishlist Toggle)
router.patch("/:productId/toggle", wishlistController.toggleWishlist);

module.exports = router;
