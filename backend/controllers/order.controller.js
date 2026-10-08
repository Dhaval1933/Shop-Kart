const crypto = require("crypto");
const mongoose = require("mongoose");
const Order = require("../models/order.model");
const Customer = require("../models/customer.model");
const Product = require("../models/product.model");
const razorpay = require("../config/razorpay");

/**
 * Task 4 & Section 27: Create Payment Order
 * Validates shipping address, verifies user cart & stock, snapshots order items,
 * calculates total on server, creates pending order & Razorpay order.
 * @route POST /orders/create-payment-order (and POST /orders)
 * @access Protected
 */
exports.createPaymentOrder = async (req, res) => {
  try {
    const { shippingAddress } = req.body;

    // 1. Validate shipping address presence
    if (!shippingAddress || typeof shippingAddress !== "object") {
      return res.status(400).json({
        success: false,
        message: "Shipping address is required",
      });
    }

    const { fullName, phone, addressLine1, city, state, pincode } = shippingAddress;

    // 2. Validate all required address fields are non-empty and not just whitespace
    if (
      !fullName || !fullName.trim() ||
      !phone || !phone.trim() ||
      !addressLine1 || !addressLine1.trim() ||
      !city || !city.trim() ||
      !state || !state.trim() ||
      !pincode || !pincode.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "All shipping address fields are required and cannot be empty",
      });
    }

    // 3. Phone validation (must be valid phone number format e.g. 10 digits)
    const sanitizedPhone = phone.trim().replace(/[\s-]/g, "");
    if (!/^\d{10,15}$/.test(sanitizedPhone)) {
      return res.status(400).json({
        success: false,
        message: "Phone number must contain a valid 10-digit number",
      });
    }

    // 4. Pincode validation (must contain exactly 6 digits)
    if (!/^\d{6}$/.test(pincode.trim())) {
      return res.status(400).json({
        success: false,
        message: "Pincode must contain 6 digits",
      });
    }

    // 5. Load authenticated user and cart
    const user = await Customer.findById(req.user._id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - User not found",
      });
    }

    if (!user.cart || user.cart.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart cannot be empty",
      });
    }

    // 6. Verify each product exists, verify latest stock, and build historical snapshot
    const orderItems = [];
    let calculatedTotal = 0;

    for (const cartItem of user.cart) {
      const product = await Product.findById(cartItem.product);

      // Verify product still exists in catalog
      if (!product) {
        return res.status(400).json({
          success: false,
          message: "One or more products in your cart are no longer available in the catalogue",
        });
      }

      // Verify stock availability
      if (product.stock < cartItem.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available stock: ${product.stock}, requested: ${cartItem.quantity}`,
        });
      }

      // Build purchase-time snapshot
      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: cartItem.quantity,
        image: product.image,
      });

      // Calculate server-side total (never trust client total)
      calculatedTotal += product.price * cartItem.quantity;
    }

    // 7. Create ShopKart Order with PENDING_PAYMENT status
    const shopKartOrder = new Order({
      user: user._id,
      items: orderItems,
      shippingAddress: {
        fullName: fullName.trim(),
        phone: sanitizedPhone,
        addressLine1: addressLine1.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
      },
      totalAmount: calculatedTotal,
      paymentStatus: "PENDING",
      status: "PENDING_PAYMENT",
    });

    // 8. Create Razorpay Order in paise (INR smallest unit)
    const amountInPaise = Math.round(calculatedTotal * 100);
    let razorpayOrderId;
    let isRealRazorpay = false;

    try {
      const razorpayOrder = await razorpay.orders.create({
        amount: amountInPaise,
        currency: "INR",
        receipt: shopKartOrder._id.toString(),
      });
      razorpayOrderId = razorpayOrder.id;
      isRealRazorpay = true;
    } catch (rzpErr) {
      console.warn("Razorpay API create order warning:", rzpErr.message);
      // Fallback for offline testing / sandbox test key mode without active Razorpay account
      razorpayOrderId = "order_" + Math.random().toString(36).substring(2, 12).toUpperCase();
      isRealRazorpay = false;
    }

    shopKartOrder.razorpayOrderId = razorpayOrderId;
    await shopKartOrder.save();

    // 9. Return safe checkout information to frontend
    // Note: RAZORPAY_KEY_SECRET is NEVER returned!
    return res.status(201).json({
      success: true,
      shopKartOrderId: shopKartOrder._id,
      razorpayOrderId: shopKartOrder.razorpayOrderId,
      amount: amountInPaise,
      currency: "INR",
      key: process.env.RAZORPAY_KEY_ID || "rzp_test_shopkart2026",
      isSimulated: !isRealRazorpay,
      order: shopKartOrder,
    });
  } catch (error) {
    console.error("Error creating payment order:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create order",
    });
  }
};

/**
 * Task 4 & Step 11/12/13: Verify Razorpay Payment Signature and Confirm Order
 * @route POST /orders/verify-payment
 * @access Protected
 */
exports.verifyPayment = async (req, res) => {
  try {
    const {
      shopKartOrderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (!shopKartOrderId || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Payment verification details missing (shopKartOrderId, razorpay_payment_id, razorpay_signature are required)",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(shopKartOrderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid shopKartOrderId format",
      });
    }

    // Find the ShopKart order
    const order = await Order.findById(shopKartOrderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Ownership check: ensure order belongs to authenticated user
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Forbidden - You do not have permission to verify this order",
      });
    }

    // Check if already processed
    if (order.paymentStatus === "PAID") {
      return res.status(200).json({
        success: true,
        message: "Order is already paid and confirmed",
        order,
      });
    }

    // Verify HMAC SHA256 Signature using TRUSTED razorpayOrderId from DB
    const trustedOrderId = order.razorpayOrderId;
    const body = trustedOrderId + "|" + razorpay_payment_id;
    const secret = process.env.RAZORPAY_KEY_SECRET || "shopkart_razorpay_secret_2026";

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      // Signature mismatch: Mark payment status as FAILED, keep order unconfirmed, DO NOT clear cart
      order.paymentStatus = "FAILED";
      await order.save();

      return res.status(400).json({
        success: false,
        message: "Invalid payment signature. Payment verification failed.",
      });
    }

    // Signature is valid! Confirm the order
    order.paymentStatus = "PAID";
    order.status = "PLACED";
    order.razorpayPaymentId = razorpay_payment_id;
    await order.save();

    // Deduct stock for each purchased item
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    }

    // Task 5: Clear user cart ONLY after verified successful payment
    const user = await Customer.findById(req.user._id);
    if (user) {
      user.cart = [];
      await user.save();
    }

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully. Order placed!",
      order,
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to verify payment",
    });
  }
};

/**
 * Task 7: Get All Orders for Current User
 * @route GET /orders
 * @access Protected
 */
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch orders",
    });
  }
};

/**
 * Task 17: Get Single Order Details
 * @route GET /orders/:id
 * @access Protected
 */
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID format",
      });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Enforce ownership: prevent users from viewing others' orders
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Forbidden - You do not have permission to view this order",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch order",
    });
  }
};

/**
 * Bonus Challenge (Section 26): Update Order Status Progression
 * Allowed values: PLACED -> CONFIRMED -> SHIPPED -> DELIVERED
 * @route PATCH /orders/:id/status
 * @access Protected
 */
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ["PENDING_PAYMENT", "PLACED", "CONFIRMED", "SHIPPED", "DELIVERED"];
    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values: ${allowedStatuses.join(", ")}`,
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID format",
      });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Verify ownership
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Forbidden - You do not have permission to update this order",
      });
    }

    order.status = status;
    await order.save();

    return res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      order,
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update order status",
    });
  }
};
