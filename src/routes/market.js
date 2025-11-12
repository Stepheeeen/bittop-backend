import express from "express";
import { getMarket, getPrices, getFullMarket } from "../services/prices.js";

const router = express.Router();
let cachedMarket = [];
let lastMarketUpdate = 0;

// Simplified top coins market data
router.get("/simple", async (req, res) => {
  try {
    const data = await getMarket();
    res.json(data);
  } catch (err) {
    console.error("Simple market route error:", err.message);
    res.status(500).json({ error: "Failed to load market data" });
  }
});

// Full market data (50 coins max)
router.get("/full", async (req, res) => {
  try {
    const now = Date.now();
    if (cachedMarket.length && now - lastMarketUpdate < 2 * 60 * 1000) {
      return res.json(cachedMarket);
    }

    const data = await getFullMarket();
    cachedMarket = data;
    lastMarketUpdate = now;
    res.json(data);
  } catch (err) {
    console.error("Market fetch error:", err.message);
    res.status(500).json({ error: "Failed to load market data" });
  }
});

// Get price for a single coin
router.get("/price/:coin", async (req, res) => {
  try {
    const { coin } = req.params;
    const priceData = await getPrices([coin.toLowerCase()]);
    res.json({ coin, price: priceData[coin.toLowerCase()] || 0 });
  } catch (err) {
    console.error("Price route error:", err.message);
    res.status(500).json({ error: "Failed to fetch coin price" });
  }
});

export default router;
