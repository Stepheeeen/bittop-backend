import express from "express";
import { getMarket, getPrice, getFullMarket } from "../services/prices.js";

const router = express.Router();

router.get("/simple", async (req, res) => {
  const data = await getMarket();
  res.json(data);
});

router.get("/full", async (req, res) => {
  try {
    const data = await getFullMarket()
    res.json(data)
  } catch (err) {
    console.error("Route error:", err.message)
    res.status(500).json({ error: "Failed to load market data" })
  }
})

router.get("/price/:coin", async (req, res) => {
  const { coin } = req.params;
  const price = await getPrice(coin);
  res.json({ coin, price });
});

export default router;
