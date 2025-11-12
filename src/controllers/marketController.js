import { getFullMarket } from "../services/prices.js"

// GET /market
export const getMarketData = async (req, res) => {
  try {
    const market = await getFullMarket(50)
    res.json(market)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Failed to fetch market data" })
  }
}