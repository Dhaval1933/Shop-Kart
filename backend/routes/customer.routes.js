const express = require("express");
const router = express.Router();
const customerController = require("../controllers/customer.controller");
const protect = require("../middlewares/auth.middleware");

router.post("/register", customerController.register);
router.post("/login", customerController.login);
router.get("/me", protect, customerController.getProfile);
router.post("/logout", protect, customerController.logout);
router.patch("/change-password", protect, customerController.changePassword);

module.exports = router;
