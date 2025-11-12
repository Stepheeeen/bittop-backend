import axios from "axios"

let cachedData = null
let cacheTime = 0

export const getPrice = async (coin) => {
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coin}&vs_currencies=usd`
    const res = await axios.get(url)
    return res.data[coin].usd
}

export const getMarket = async () => {
    const coins = "bitcoin,ethereum,tether,bnb"
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coins}&vs_currencies=usd`
    const res = await axios.get(url)
    return res.data
}

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
    // ✅ Defensive logging (prevents "Cannot read properties of undefined")
    const status = err.response?.status
    const message = err.response?.data || err.message

    console.error("Error fetching full market data:", status || "No response", message)
    return [] // fallback to empty array instead of crashing
  }
}