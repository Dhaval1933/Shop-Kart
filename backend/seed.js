const mongoose = require("mongoose");
require("dotenv").config();
const Product = require("./models/product.model");

const sampleProducts = [
  {
    name: "Noise Cancelling Headphones",
    description: "Premium wireless over-ear headphones with active noise cancellation, 40-hour battery life, and crystal-clear audio with custom 40mm drivers.",
    price: 4999,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
    stock: 25,
  },
  {
    name: "Mechanical Keyboard",
    description: "RGB mechanical gaming keyboard with hot-swappable tactile blue switches, aircraft-grade aluminum frame, and customizable lighting profiles.",
    price: 2999,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80",
    stock: 12,
  },
  {
    name: "Ultra-Wide Curved Gaming Monitor",
    description: "34-inch WQHD curved gaming monitor with 165Hz refresh rate, 1ms response time, AMD FreeSync Premium, and HDR400 color depth.",
    price: 24999,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80",
    stock: 7,
  },
  {
    name: "Wireless Ergonomic Mouse",
    description: "Sculpted ergonomic vertical mouse designed to reduce wrist strain, featuring dual Bluetooth & 2.4GHz wireless connectivity with quiet clicks.",
    price: 1499,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop&q=80",
    stock: 35,
  },
  {
    name: "Smart Fitness Watch",
    description: "Advanced health tracker with AMOLED display, continuous heart rate and SpO2 monitoring, built-in GPS, and 50m water resistance.",
    price: 3499,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80",
    stock: 18,
  },
  {
    name: "Classic Denim Jacket",
    description: "Vintage-inspired 100% organic cotton trucker denim jacket with button-flap chest pockets and timeless rugged styling.",
    price: 2499,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&auto=format&fit=crop&q=80",
    stock: 20,
  },
  {
    name: "Premium Leather Chelsea Boots",
    description: "Handcrafted genuine full-grain leather Chelsea boots with durable Goodyear welt construction, elastic side panels, and cushioned insoles.",
    price: 5999,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=800&auto=format&fit=crop&q=80",
    stock: 10,
  },
  {
    name: "Minimalist Canvas Backpack",
    description: "Water-resistant commuter backpack with dedicated padded 15.6-inch laptop compartment, hidden anti-theft pocket, and breathable shoulder straps.",
    price: 1899,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80",
    stock: 28,
  },
  {
    name: "The Pragmatic Programmer",
    description: "20th Anniversary Edition. One of the most influential software engineering books on modern practices, craftsmanship, and pragmatic development.",
    price: 1199,
    category: "Books",
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80",
    stock: 15,
  },
  {
    name: "Clean Code: A Handbook of Agile Craftsmanship",
    description: "Classic software guide by Robert C. Martin teaching how to write clear, robust, maintainable code with hundreds of practical real-world examples.",
    price: 999,
    category: "Books",
    image: "https://images.unsplash.com/photo-1532012164546-f432f2e3777a?w=800&auto=format&fit=crop&q=80",
    stock: 22,
  },
  {
    name: "Designing Data-Intensive Applications",
    description: "The definitive guide to distributed architectures, storage engines, data modeling, reliability, scalability, and stream processing.",
    price: 1799,
    category: "Books",
    image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&auto=format&fit=crop&q=80",
    stock: 9,
  },
  {
    name: "Modern Ceramic Table Lamp",
    description: "Minimalist Scandinavian design table lamp with textured ceramic base and natural linen shade. Warm ambient lighting for bedrooms and living spaces.",
    price: 1599,
    category: "Home",
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80",
    stock: 16,
  },
  {
    name: "Ergonomic Memory Foam Pillow",
    description: "Contoured cervical orthopedic memory foam pillow for neck pain relief, with cooling gel infusion and breathable hypoallergenic washable bamboo cover.",
    price: 1299,
    category: "Home",
    image: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=800&auto=format&fit=crop&q=80",
    stock: 35,
  },
  {
    name: "Stainless Steel French Press",
    description: "Double-wall insulated 1-liter French press coffee maker with 4-level filtration system, keeping brew hot for 2 hours while preserving natural oils.",
    price: 899,
    category: "Home",
    image: "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=800&auto=format&fit=crop&q=80",
    stock: 3,
  },
];

async function seedDatabase() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB.");

    console.log("Clearing existing products...");
    await Product.deleteMany({});

    console.log(`Inserting ${sampleProducts.length} sample products...`);
    const inserted = await Product.insertMany(sampleProducts);

    console.log(`Successfully seeded ${inserted.length} products into ShopKart!`);
    mongoose.connection.close();
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();
