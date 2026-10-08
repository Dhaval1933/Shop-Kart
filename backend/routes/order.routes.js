const express = require("express");
const router = express.Router();
const protect = require("../middlewares/auth.middleware");
const orderController = require("../controllers/order.controller");

// All Order routes are protected
router.use(protect);

// Task 4: Create Payment Order
router.post("/create-payment-order", orderController.createPaymentOrder);
router.post("/", orderController.createPaymentOrder);

// Task 4 & Step 11: Verify Razorpay Payment Signature
router.post("/verify-payment", orderController.verifyPayment);

// Task 7: Get All Orders for Logged-in User
router.get("/", orderController.getMyOrders);

// Task 17: Get Specific Order Details
router.get("/:id", orderController.getOrderById);

// Bonus: Update Order Status Progression
router.patch("/:id/status", orderController.updateOrderStatus);

module.exports = router;
