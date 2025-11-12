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

export const getFullMarket = async (req, res) => {
    const now = Date.now()
    const cacheValid = cachedData && now - cacheTime < 120000 // 2 minutes cache

    if (cacheValid) {
        return res.json(cachedData)
    }

    try {
        const url =
            "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&sparkline=true&per_page=20&page=1"
        const response = await axios.get(url)

        const formatted = response.data.map((coin) => ({
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
        res.json(formatted)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Failed to fetch market data" })
    }
}