const Razorpay = require("razorpay");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_shopkart2026",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "shopkart_razorpay_secret_2026",
});

module.exports = razorpay;
