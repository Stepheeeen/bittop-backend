import express from "express";
import { getMarket, getPrices, getFullMarket } from "../services/prices.js";

const router = express.Router();

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
    const data = await getFullMarket();
    res.json(data);
  } catch (err) {
    console.error("Full market route error:", err.message);
    res.status(500).json({ error: "Failed to load full market data" });
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
