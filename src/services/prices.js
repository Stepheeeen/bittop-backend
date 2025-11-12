import axios from "axios"

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
    try {
        const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=true`;
        const res = await axios.get(url);
        return res.data.map((coin) => ({
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
    } catch (err) {
        console.error("Error fetching full market data:", err.message);
        return [];
    }
};