import Util from './util.js';
import Config from '../config.js';

const { createApp } = Vue;

createApp({

  data() {
    return {
      header: Config.APP_NAME,
      fearAndGreedIndex: '',
      coins: []
    }
  },

  async created() {
    this.fearAndGreedIndex =  await getFearAndGreedIndex();
    this.coins = await getCoins();
    
    console.info('Fear and Greed Index:', this.fearAndGreedIndex);
    console.info('Coins:', this.coins);
  }
  
}).mount('#app');

async function getFearAndGreedIndex() {
  const fearAndGreedIndexCache = Util.getFearAndGreedIndexFromCache();

  if (!Util.shouldFetchFearAndGreedIndex() && fearAndGreedIndexCache) {
    console.info('Fetched Fear and Greed Index from cache')
    return fearAndGreedIndexCache;
  }

  console.info('Fetching Fear and Greed Index from api.alternative.me...');

  // api documentation https://alternative.me/crypto/fear-and-greed-index/
  const fearAndGreedResponse = await fetch('https://api.alternative.me/fng/');
  const fearAndGreedData = await fearAndGreedResponse.json();
  const fearAndGreedIndex = fearAndGreedData.data[0].value;

  Util.updateFearAndGreedIndexCache(fearAndGreedIndex);

  console.info('Fetched Fear and Greed Index from api.alternative.me');
  return fearAndGreedIndex;
};

async function getCoins() {
  const coinsCache = Util.getCoinsFromCache();

  if (!Util.shouldFetchCoins() && coinsCache) {
    console.info('Fetched Coins from cache');
    return coinsCache;
  }
  
  const coins = await Promise.all(Config.COINS.map(async coin => getCoin(coin)));

  Util.updateCoinsCache(coins);

  return coins;
};

async function getCoin(coinId) {
  console.info(`Fetching ${coinId} from api.coingecko.com...`)

  // api documentation https://www.coingecko.com/en/api/documentation
  const response = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}`);
  const data = await response.json();

  const coin = {
    name: data.name,
    symbol: data.symbol.toUpperCase(),
    price: Util.formatCurrency(data.market_data.current_price.usd),
    priceChangeDailyPercent: Util.formatPercentage(data.market_data.price_change_percentage_24h)
  };

  console.info(`Fetched ${coinId} from api.coingecko.com`)

  return coin;
}
