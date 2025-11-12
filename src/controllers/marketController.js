import { getMarket } from "../services/prices.js"

export const getMarketData = async (req, res) => {
  const data = await getMarket()
  res.json(data)
}
