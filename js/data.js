import Util from './util.js';
import Cache from './cache.js';
import Config from '../config.js';

const FEAR_AND_GREED_API_URL = 'https://api.alternative.me/fng/';
const COIN_API_URL = id => `https://api.coingecko.com/api/v3/coins/${id}?localization=false&tickers=false&community_data=false&developer_data=false`;
const HISTORICAL_DATA_URL = id => `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=30&interval=daily`;
const TRENDING_URL = 'https://api.coingecko.com/api/v3/search/trending';

export default {

  async fetchFearAndGreedIndex() {
    const fearAndGreedIndexCache = Cache.getFromCache(Config.FEAR_AND_GREED_INDEX.KEY);
    const shouldFetch = Cache.shouldFetch(
      Config.FEAR_AND_GREED_INDEX.TIMESTAMP_KEY,
      Config.FEAR_AND_GREED_INDEX.CACHE_VALID_FOR);
  
    if (!shouldFetch && fearAndGreedIndexCache) {
      console.info('Fetched Fear and Greed Index from cache');
      return fearAndGreedIndexCache;
    }
  
    console.info(`Fetching Fear and Greed Index from ${FEAR_AND_GREED_API_URL}...`);
  
    // api documentation https://alternative.me/crypto/fear-and-greed-index/
    const response = await fetch(FEAR_AND_GREED_API_URL);
    const data = await response.json();
    const fearAndGreedIndex = data.data[0].value;
  
    Cache.updateCache(
      Config.FEAR_AND_GREED_INDEX.KEY,
      Config.FEAR_AND_GREED_INDEX.TIMESTAMP_KEY,
      fearAndGreedIndex);
  
    console.info(`Fetched Fear and Greed Index from ${FEAR_AND_GREED_API_URL}`);
    return fearAndGreedIndex;
  },

  async fetchCoins(force = false) {
    const coinsCache = Cache.getFromCache(Config.COIN_DATA.KEY, true);
    const shouldFetch = Cache.shouldFetch(
      Config.COIN_DATA.TIMESTAMP_KEY,
      Config.COIN_DATA.CACHE_VALID_FOR);
  
    if (!force && !shouldFetch && coinsCache) {
      console.info('Fetched Coins from cache');
      return coinsCache;
    }
    
    const coins = await Promise.all(Config.COINS.map(async c => this.fetchCoin(c.ID)));
  
    Cache.updateCache(
      Config.COIN_DATA.KEY,
      Config.COIN_DATA.TIMESTAMP_KEY,
      coins,
      true
    );
  
    return coins;
  },

  async fetchCoin(id) {
    console.info(`Fetching ${id} from ${COIN_API_URL(id)}...`);
  
    // api documentation https://www.coingecko.com/en/api/documentation
    const response = await fetch(COIN_API_URL(id));
    const data = await response.json();

    const priceHasDecimal = data.market_data.current_price.usd.toString().includes('.');
  
    const coin = {
      id,
      name: data.name,
      symbol: data.symbol.toUpperCase(),
      image: data.image.small,
      url: data.links.homepage[0],
      price: Util.formatCurrency(data.market_data.current_price.usd, priceHasDecimal ? 2 : 0),
      priceChangeDailyPercent: Util.formatPercentage(data.market_data.price_change_percentage_24h)
    };
  
    console.info(`Fetched ${id} from ${COIN_API_URL(id)}`);
  
    return coin;
  },

  async fetchHistoricalData(force = false) {
    const historicalDataCache = Cache.getFromCache(Config.HISTORICAL_DATA.KEY, true);
    const shouldFetch = Cache.shouldFetch(
      Config.HISTORICAL_DATA.TIMESTAMP_KEY,
      Config.HISTORICAL_DATA.CACHE_VALID_FOR);
  
    if (!force && !shouldFetch && historicalDataCache) {
      console.info('Fetched Historical Data from cache');
      return historicalDataCache;
    }

    const historicalDataForCoins = await Promise.all(Config.COINS.map(async c => this.fetchHistoricalDataForCoin(c.ID)));
    const historicalData = {
      // dates should be same for all so we select from first
      labels: historicalDataForCoins[0].dates,
      datasets: historicalDataForCoins.map(coin=> {
        const color = Config.COINS.find(c => c.ID === coin.data.label).CHART_COLOR
        return { ...coin.data, backgroundColor: color, borderColor: color };
      })
    };

    Cache.updateCache(
      Config.HISTORICAL_DATA.KEY,
      Config.HISTORICAL_DATA.TIMESTAMP_KEY,
      historicalData,
      true
    );

    return historicalData;
  },

  async fetchHistoricalDataForCoin(id) {
    console.info(`Fetching Historical Data for ${id} from ${HISTORICAL_DATA_URL(id)}...`);

    // api documentation https://www.coingecko.com/en/api/documentation
    const response = await fetch(HISTORICAL_DATA_URL(id));
    const data = await response.json();

    const priceMap = data.prices.reduce((prev, curr) => {
      prev.dates.push(Util.timestampToDateString(curr[0]));
      prev.prices.push(curr[1]);
      return prev;
    }, { dates: [], prices: [] });

    const historicalDataForCoin = {
      dates: priceMap.dates,
      data: {
        label: id,
        data: priceMap.prices
      }
    };

    console.info(`Fetched Historical Data for ${id} from ${HISTORICAL_DATA_URL(id)}`);

    return historicalDataForCoin;
  },

  async fetchTrending() {
    const trendingCache = Cache.getFromCache(Config.TRENDING_DATA.KEY, true);
    const shouldFetch = Cache.shouldFetch(
      Config.TRENDING_DATA.TIMESTAMP_KEY,
      Config.TRENDING_DATA.CACHE_VALID_FOR);

    if (!shouldFetch && trendingCache) {
      console.info('Fetched Trending Data from cache');
      return trendingCache;
    }

    console.info(`Fetching Trending Data from ${TRENDING_URL}...`);

    // api documentation https://www.coingecko.com/en/api/documentation
    const response = await fetch(TRENDING_URL);
    const data = await response.json();

    const trendingData = await Promise.all(data.coins.map(async c => this.fetchCoin(c.item.id)));

    Cache.updateCache(
      Config.TRENDING_DATA.KEY,
      Config.TRENDING_DATA.TIMESTAMP_KEY,
      trendingData,
      true
    );

    console.info(`Fetched Trending Data from ${TRENDING_URL}`);
    return trendingData;
  }

};
