const http = require("http");
const mongoose = require("mongoose");
require("dotenv").config();
const app = require("./index");

async function runTests() {
  console.log("=== Starting Backend Product API Tests ===");
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(5001, resolve));
  console.log("Test server running on port 5001");

  const baseUrl = "http://localhost:5001";

  async function request(method, path, body = null) {
    const res = await fetch(`${baseUrl}${path}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : null,
    });
    const data = await res.json().catch(() => null);
    return { status: res.status, data };
  }

  let passed = 0;
  let total = 0;

  function assert(desc, condition) {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${desc}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${desc}`);
    }
  }

  try {
    // Wait briefly for mongoose connection
    if (mongoose.connection.readyState !== 1) {
      await new Promise((resolve) => mongoose.connection.once("open", resolve));
    }

    // 1. GET /products
    console.log("\n--- Testing GET /products ---");
    const getRes = await request("GET", "/products");
    assert("GET /products returns status 200", getRes.status === 200);
    assert("Response has success: true", getRes.data?.success === true);
    assert("Response has count property", typeof getRes.data?.count === "number");
    assert("Products array is returned with items", Array.isArray(getRes.data?.products) && getRes.data.products.length > 0);

    const firstProduct = getRes.data.products[0];

    // 2. GET /products/:id
    console.log("\n--- Testing GET /products/:id ---");
    const getSingleRes = await request("GET", `/products/${firstProduct._id}`);
    assert("GET /products/:id returns status 200", getSingleRes.status === 200);
    assert("Single product data matches ID", getSingleRes.data?.product?._id === firstProduct._id);

    // 3. GET /products/:id with invalid ID
    console.log("\n--- Testing GET /products/:id (Invalid ID) ---");
    const invalidIdRes = await request("GET", "/products/123-not-valid-id");
    assert("Invalid product ID returns status 400", invalidIdRes.status === 400);

    // 4. GET /products/:id with non-existent ID
    console.log("\n--- Testing GET /products/:id (Not Found) ---");
    const notFoundRes = await request("GET", "/products/60d0fe4f5311236168a109ca");
    assert("Non-existent product returns status 404", notFoundRes.status === 404);

    // 5. POST /products (Success)
    console.log("\n--- Testing POST /products (Creation) ---");
    const testProductPayload = {
      name: "Test Wireless Earbuds",
      description: "Compact wireless earbuds with deep bass and charging case.",
      price: 1999,
      category: "Electronics",
      image: "https://example.com/earbuds.jpg",
      stock: 50,
    };
    const createRes = await request("POST", "/products", testProductPayload);
    assert("POST /products returns status 201", createRes.status === 201);
    assert("Created product has valid _id", !!createRes.data?.product?._id);
    const createdId = createRes.data?.product?._id;

    // 6. POST /products (Missing field)
    console.log("\n--- Testing POST /products (Missing field) ---");
    const missingFieldRes = await request("POST", "/products", {
      name: "Incomplete Product",
      price: 100,
    });
    assert("Missing required fields returns status 400", missingFieldRes.status === 400);

    // 7. POST /products (Invalid price <= 0)
    console.log("\n--- Testing POST /products (Invalid price) ---");
    const invalidPriceRes = await request("POST", "/products", {
      ...testProductPayload,
      price: -50,
    });
    assert("Negative price returns status 400", invalidPriceRes.status === 400);

    const zeroPriceRes = await request("POST", "/products", {
      ...testProductPayload,
      price: 0,
    });
    assert("Zero price returns status 400", zeroPriceRes.status === 400);

    // 8. POST /products (Invalid stock < 0)
    console.log("\n--- Testing POST /products (Invalid stock) ---");
    const invalidStockRes = await request("POST", "/products", {
      ...testProductPayload,
      stock: -5,
    });
    assert("Negative stock returns status 400", invalidStockRes.status === 400);

    // 9. Search filtering
    console.log("\n--- Testing GET /products?search=keyboard ---");
    const searchRes = await request("GET", "/products?search=keyboard");
    assert("Search request returns status 200", searchRes.status === 200);
    assert("Search finds products containing 'keyboard'", searchRes.data.products.every((p) => p.name.toLowerCase().includes("keyboard")));

    // 10. Category filtering
    console.log("\n--- Testing GET /products?category=Electronics ---");
    const categoryRes = await request("GET", "/products?category=Electronics");
    assert("Category request returns status 200", categoryRes.status === 200);
    assert("Filtered products all have category 'Electronics'", categoryRes.data.products.every((p) => p.category.toLowerCase() === "electronics"));

    // 11. Combined Search & Category
    console.log("\n--- Testing GET /products?search=keyboard&category=Electronics ---");
    const combinedRes = await request("GET", "/products?search=keyboard&category=Electronics");
    assert("Combined request returns status 200", combinedRes.status === 200);
    assert("Combined filter returns correct product", combinedRes.data.products.length > 0 && combinedRes.data.products[0].name.toLowerCase().includes("keyboard"));

    // 12. Bonus: Sorting by price_asc
    console.log("\n--- Testing GET /products?sort=price_asc ---");
    const sortAscRes = await request("GET", "/products?sort=price_asc");
    assert("Sort price_asc returns status 200", sortAscRes.status === 200);
    let isAscending = true;
    for (let i = 1; i < sortAscRes.data.products.length; i++) {
      if (sortAscRes.data.products[i].price < sortAscRes.data.products[i - 1].price) {
        isAscending = false;
        break;
      }
    }
    assert("Products are sorted by price ascending", isAscending);

    // 13. Bonus: Sorting by price_desc
    console.log("\n--- Testing GET /products?sort=price_desc ---");
    const sortDescRes = await request("GET", "/products?sort=price_desc");
    assert("Sort price_desc returns status 200", sortDescRes.status === 200);
    let isDescending = true;
    for (let i = 1; i < sortDescRes.data.products.length; i++) {
      if (sortDescRes.data.products[i].price > sortDescRes.data.products[i - 1].price) {
        isDescending = false;
        break;
      }
    }
    assert("Products are sorted by price descending", isDescending);

    // Clean up created test product
    if (createdId) {
      const Product = require("./models/product.model");
      await Product.findByIdAndDelete(createdId);
    }

    console.log(`\n================================`);
    console.log(`Test Results: ${passed}/${total} Passed (${Math.round((passed / total) * 100)}%)`);
    console.log(`================================\n`);
  } catch (err) {
    console.error("Test execution failed:", err);
  } finally {
    server.close();
    await mongoose.connection.close();
    process.exit(passed === total ? 0 : 1);
  }
}

runTests();
