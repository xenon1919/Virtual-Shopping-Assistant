const express = require("express");
const cors = require("cors");
const axios = require("axios");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const productKeywords = [
  "shoes",
  "heels",
  "bags",
  "watches",
  "shirts",
  "dress",
  "sneakers",
  "jeans",
  "tshirt",
  "sandals",
  "kurti",
  "saree",
  "jacket",
  "top",
  "hoodie",
  "boots",
  "loafers",
];

const colorKeywords = [
  "green",
  "red",
  "blue",
  "black",
  "white",
  "brown",
  "gold",
  "pink",
  "yellow",
  "purple",
  "grey",
  "orange",
];

const defaultCategories = [
  "smartphones",
  "laptops",
  "fragrances",
  "skincare",
  "groceries",
  "home-decoration",
  "furniture",
  "womens-dresses",
  "mens-shirts",
  "sunglasses",
  "automotive",
];

app.post("/api/message", async (req, res) => {
  const { message } = req.body;

  let reply = "Let me help you shop!";
  let keyword = "trending";

  const lowerMsg = message.toLowerCase();
  const product = productKeywords.find((w) => lowerMsg.includes(w));
  const color = colorKeywords.find((c) => lowerMsg.includes(c));
  const combined = color && product ? `${color} ${product}` : product;
  keyword = combined || product || "trending";

  // 🧠 Gemini AI
  try {
    const prompt = `
You are ShopMate, a helpful shopping assistant.
Reply in just 1–2 short lines, suggesting relevant product ideas based on this user message:
"${message}"
`.trim();

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });
    const geminiRes = await model.generateContent(prompt);
    const geminiText = geminiRes.response.text().trim();

    reply =
      geminiText.length <= 200
        ? geminiText
        : `Here are some great picks for ${keyword}.`;
  } catch (error) {
    console.warn("⚠️ Gemini failed:", error.message);
    reply = `Here are some great picks for ${keyword}.`;
  }

  // 🛒 Fetch products from DummyJSON
  try {
    const searchRes = await axios.get(
      `https://dummyjson.com/products/search?q=${encodeURIComponent(keyword)}`
    );
    const products = searchRes.data.products;

    if (!products || products.length === 0) {
      console.warn("🛑 No products found for:", keyword);
      return res.json({
        reply: `Sorry, I couldn't find products for "${keyword}". Try exploring these categories:`,
        products: [],
        suggestCategories: defaultCategories,
      });
    }

    const topProducts = products.slice(0, 5).map((p) => ({
      id: p.id,
      name: p.title,
      category: p.category,
      price: `$${p.price}`,
      image: p.thumbnail,
    }));

    return res.json({ reply, products: topProducts, suggestCategories: [] });
  } catch (err) {
    console.error("❌ Failed to fetch from DummyJSON:", err.message);
    return res.json({
      reply,
      products: [],
      suggestCategories: defaultCategories,
    });
  }
});

app.listen(5000, () => {
  console.log("✅ Server running on http://localhost:5000");
});
