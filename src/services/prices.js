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
