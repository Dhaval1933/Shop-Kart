const mongoose = require("mongoose");
const Product = require("../models/product.model");

// POST /products - Create Product (Task 2)
exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, category, image, stock } = req.body;

    // Check for missing required fields
    if (
      !name ||
      !description ||
      price === undefined ||
      price === null ||
      price === "" ||
      !category ||
      !image ||
      stock === undefined ||
      stock === null ||
      stock === ""
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields (name, description, price, category, image, stock) are required",
      });
    }

    // Validate price
    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid price: Price must be a number greater than 0",
      });
    }

    // Validate stock
    const numStock = Number(stock);
    if (isNaN(numStock) || numStock < 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid stock: Stock must be a non-negative number",
      });
    }

    const product = await Product.create({
      name: name.trim(),
      description: description.trim(),
      price: numPrice,
      category: category.trim(),
      image: image.trim(),
      stock: numStock,
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create product",
    });
  }
};

// GET /products - Get All Products with Search, Category Filter & Sorting (Tasks 3, 5 & Bonus)
exports.getAllProducts = async (req, res) => {
  try {
    const { search, category, sort } = req.query;

    // Build query filter dynamically
    const filter = {};

    // Search by product name (case-insensitive regex)
    if (search && search.trim()) {
      filter.name = { $regex: search.trim(), $options: "i" };
    }

    // Filter by category (case-insensitive)
    if (
      category &&
      category.trim() &&
      category.toLowerCase() !== "all" &&
      category.toLowerCase() !== "all categories"
    ) {
      filter.category = { $regex: new RegExp(`^${category.trim()}$`, "i") };
    }

    // Dynamic sorting (Bonus Challenge)
    let sortOption = { createdAt: -1 }; // default newest
    if (sort === "price_asc") {
      sortOption = { price: 1 };
    } else if (sort === "price_desc") {
      sortOption = { price: -1 };
    }

    const products = await Product.find(filter)
      .sort(sortOption)
      .select("_id name description price category image stock createdAt");

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch products",
    });
  }
};

// GET /products/:id - Get Single Product by ID (Task 4)
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID format",
      });
    }

    const product = await Product.findById(id).select(
      "_id name description price category image stock createdAt"
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch product",
    });
  }
};
