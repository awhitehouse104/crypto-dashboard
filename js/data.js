import Util from './util.js';
import Cache from './cache.js';
import Config from '../config.js';

const FEAR_AND_GREED_API_URL = 'https://api.alternative.me/fng/';
const COIN_API_URL = coinId => `https://api.coingecko.com/api/v3/coins/${coinId}`;

export default {

  async fetchFearAndGreedIndex() {
    const fearAndGreedIndexCache = Cache.getFromCache(Config.FEAR_AND_GREED_INDEX_KEY);
    const shouldFetch = Cache.shouldFetch(
      Config.FEAR_AND_GREED_INDEX_TIMESTAMP_KEY,
      Config.FEAR_AND_GREED_INDEX_CACHE_VALID_FOR);
  
    if (!shouldFetch && fearAndGreedIndexCache) {
      console.info('Fetched Fear and Greed Index from cache');
      return fearAndGreedIndexCache;
    }
  
    console.info(`Fetching Fear and Greed Index from ${FEAR_AND_GREED_API_URL}...`);
  
    // api documentation https://alternative.me/crypto/fear-and-greed-index/
    const fearAndGreedResponse = await fetch(FEAR_AND_GREED_API_URL);
    const fearAndGreedData = await fearAndGreedResponse.json();
    const fearAndGreedIndex = fearAndGreedData.data[0].value;
  
    Cache.updateCache(
      Config.FEAR_AND_GREED_INDEX_KEY,
      Config.FEAR_AND_GREED_INDEX_TIMESTAMP_KEY,
      fearAndGreedIndex);
  
    console.info(`Fetched Fear and Greed Index from ${FEAR_AND_GREED_API_URL}`);
    return fearAndGreedIndex;
  },

  async fetchCoins(force = false) {
    const coinsCache = Cache.getFromCache(Config.COINS_KEY, true);
    const shouldFetch = Cache.shouldFetch(
      Config.COINS_TIMESTAMP_KEY,
      Config.COINS_CACHE_VALID_FOR);
  
    if (!force && !shouldFetch && coinsCache) {
      console.info('Fetched Coins from cache');
      return coinsCache;
    }
    
    const coins = await Promise.all(Config.COINS.map(async coin => this.fetchCoin(coin)));
  
    Cache.updateCache(
      Config.COINS_KEY,
      Config.COINS_TIMESTAMP_KEY,
      coins,
      true
    );
  
    return coins;
  },

  async fetchCoin(coinId) {
    console.info(`Fetching ${coinId} from ${COIN_API_URL(coinId)}...`);
  
    // api documentation https://www.coingecko.com/en/api/documentation
    const response = await fetch(COIN_API_URL(coinId));
    const data = await response.json();
  
    const coin = {
      name: data.name,
      symbol: data.symbol.toUpperCase(),
      price: Util.formatCurrency(data.market_data.current_price.usd),
      priceChangeDailyPercent: Util.formatPercentage(data.market_data.price_change_percentage_24h)
    };
  
    console.info(`Fetched ${coinId} from ${COIN_API_URL(coinId)}`);
  
    return coin;
  }

};
