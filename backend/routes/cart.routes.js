const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cart.controller");
const protect = require("../middlewares/auth.middleware");

// Protect all Cart routes
router.use(protect);

// GET /cart (Task 3: Get Current User's Cart)
router.get("/", cartController.getCart);

// POST /cart/:productId (Task 2: Add Product to Cart / Increment Quantity)
router.post("/:productId", cartController.addToCart);

// PATCH /cart/:productId (Task 4: Update Product Quantity)
router.patch("/:productId", cartController.updateQuantity);

// DELETE /cart/:productId (Task 5: Remove Product from Cart)
router.delete("/:productId", cartController.removeFromCart);

module.exports = router;
