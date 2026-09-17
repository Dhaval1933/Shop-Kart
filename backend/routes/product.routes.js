const express = require("express");
const router = express.Router();
const productController = require("../controllers/product.controller");

// Product routes
router.post("/", productController.createProduct);
router.get("/", productController.getAllProducts);
router.get("/:id", productController.getProductById);

module.exports = router;
