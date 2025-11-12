import axios from "axios"

let cachedData = null
let cacheTime = 0

let priceCache = {}
let lastUpdate = 0
const CACHE_DURATION = 60 * 1000 // 60 seconds

// Get prices for specific coins
export const getPrices = async (coins = []) => {
  const now = Date.now()

  if (now - lastUpdate > CACHE_DURATION) {
    try {
      const ids = coins.join(",")
      const res = await axios.get(
        `https://api.coingecko.com/api/v3/simple/price`,
        {
          params: { ids, vs_currencies: "usd" },
        }
      )
      priceCache = res.data
      lastUpdate = now
    } catch (err) {
      console.error("Failed to fetch prices:", err)
      if (!Object.keys(priceCache).length) throw err
    }
  }

  return coins.reduce((acc, coin) => {
    acc[coin] = priceCache[coin]?.usd || 0
    return acc
  }, {})
}

// Get simplified market data (top 4 coins)
export const getMarket = async () => {
  const coins = "bitcoin,ethereum,tether,bnb"
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coins}&vs_currencies=usd`
  const res = await axios.get(url)
  return res.data
}

// Get full market data
export const getFullMarket = async (limit = 50) => {
  const now = Date.now()
  const cacheValid = cachedData && now - cacheTime < 120000 // 2 minutes

  if (cacheValid) return cachedData

  try {
    const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=true`
    const res = await axios.get(url)

    const formatted = res.data.map((coin) => ({
      id: coin.id,
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
      image: coin.image,
      price: coin.current_price,
      change_24h: coin.price_change_percentage_24h,
      market_cap: coin.market_cap,
      volume: coin.total_volume,
      sparkline: coin.sparkline_in_7d?.price || [],
    }))

    cachedData = formatted
    cacheTime = now
    return formatted
  } catch (err) {
    console.error("Error fetching full market data:", err.response?.status || "No response", err.message)
    return [] // fallback to empty array
  }
}
