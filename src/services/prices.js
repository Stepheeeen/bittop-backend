import axios from "axios";

// Shared cache state
let priceCache = {};
let fullMarketCache = [];
let marketCache = null;
let lastPriceUpdate = 0;
let lastFullMarketUpdate = 0;
let lastMarketUpdate = 0;

const PRICE_CACHE_DURATION = 60 * 1000;  // 1 minute
const MARKET_CACHE_DURATION = 60 * 1000; // 1 minute
const FULL_MARKET_CACHE_DURATION = 120 * 1000; // 2 minutes

// ---------- 1️⃣ Get Prices (for portfolio) ----------
export const getPrices = async (coins = []) => {
  coins = Array.isArray(coins) ? coins : Object.values(coins);

  const now = Date.now();
  const cacheExpired = now - lastPriceUpdate > PRICE_CACHE_DURATION;

  if (cacheExpired) {
    try {
      const ids = coins.join(",");
      if (ids) {
        const res = await axios.get("https://api.coingecko.com/api/v3/simple/price", {
          params: { ids, vs_currencies: "usd" },
        });
        priceCache = { ...priceCache, ...res.data };
        lastPriceUpdate = now;
        console.log("✅ Updated price cache:", Object.keys(priceCache));
      }
    } catch (err) {
      const status = err.response?.status;
      console.error("Failed to fetch prices:", status || err.message);
      // Graceful fallback if rate limited
      if (status === 429) console.warn("⚠️ CoinGecko rate limit hit, using cached prices");
      if (!Object.keys(priceCache).length) throw err; // no fallback
    }
  }

  // Return prices for requested coins
  return coins.reduce((acc, coin) => {
    acc[coin] = priceCache[coin]?.usd || 0;
    return acc;
  }, {});
};

// ---------- 2️⃣ Get Simplified Market Data (Top 4 coins) ----------
export const getMarket = async () => {
  const now = Date.now();
  const cacheExpired = now - lastMarketUpdate > MARKET_CACHE_DURATION;

  if (!cacheExpired && marketCache) return marketCache;

  try {
    const coins = "bitcoin,ethereum,tether,bnb";
    const res = await axios.get("https://api.coingecko.com/api/v3/simple/price", {
      params: { ids: coins, vs_currencies: "usd" },
    });
    marketCache = res.data;
    lastMarketUpdate = now;
    return marketCache;
  } catch (err) {
    const status = err.response?.status;
    console.error("Error fetching market data:", status || err.message);
    if (status === 429) console.warn("⚠️ Rate limited on market data, using cached market info");
    return marketCache || {}; // fallback
  }
};

// ---------- 3️⃣ Get Full Market Data (Top N coins) ----------
export const getFullMarket = async (limit = 50) => {
  const now = Date.now();
  const cacheExpired = now - lastFullMarketUpdate > FULL_MARKET_CACHE_DURATION;

  if (!cacheExpired && fullMarketCache.length) return fullMarketCache;

  try {
    const url = `https://api.coingecko.com/api/v3/coins/markets`;
    const res = await axios.get(url, {
      params: {
        vs_currency: "usd",
        order: "market_cap_desc",
        per_page: limit,
        page: 1,
        sparkline: true,
      },
    });

    fullMarketCache = res.data.map((coin) => ({
      id: coin.id,
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
      image: coin.image,
      price: coin.current_price,
      change_24h: coin.price_change_percentage_24h,
      market_cap: coin.market_cap,
      volume: coin.total_volume,
      sparkline: coin.sparkline_in_7d?.price || [],
    }));

    lastFullMarketUpdate = now;
    return fullMarketCache;
  } catch (err) {
    const status = err.response?.status;
    console.error("Error fetching full market data:", status || err.message);
    if (status === 429) console.warn("⚠️ Rate limit hit, returning cached full market data");
    return fullMarketCache || []; // fallback
  }
};
