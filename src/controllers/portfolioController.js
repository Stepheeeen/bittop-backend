// controllers/portfolioController.js
import User from "../models/User.js";
import { getPrices } from "../services/prices.js";

export const getPortfolio = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    const coins = user.portfolio.map((p) => p.coin);
    const prices = await getPrices(coins); // batch fetch

    const portfolio = user.portfolio.map((asset) => {
      const currentPrice = prices[asset.coin] || 0;
      const currentValue = currentPrice * asset.amount;
      return {
        coin: asset.coin,
        amount: asset.amount,
        invested: asset.invested,
        currentValue,
        gainLoss: currentValue - asset.invested,
      };
    });

    res.json(portfolio);
  } catch (err) {
    console.error("Portfolio fetch error:", err.message);
    res.status(500).json({ error: "Failed to fetch portfolio" });
  }
};
