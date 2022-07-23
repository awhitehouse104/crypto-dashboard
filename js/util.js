import Config from '../config.js';

export default {

  formatCurrency(value) {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    });

    return formatter.format(value);
  },

  formatPercentage(value) {
    const formatter = new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 2
    });

    return formatter.format(value);
  },

  getFearAndGreedIndexFromCache() {
    return localStorage.getItem(Config.FEAR_AND_GREED_INDEX_KEY);
  },

  getCoinsFromCache() {
    return JSON.parse(localStorage.getItem(Config.COINS_KEY));
  },

  updateFearAndGreedIndexCache(fearAndGreedIndex) {
    localStorage.setItem(Config.FEAR_AND_GREED_INDEX_KEY, fearAndGreedIndex);
    localStorage.setItem(Config.FEAR_AND_GREED_INDEX_TIMESTAMP_KEY, Date.now());
  },

  updateCoinsCache(coins) {
    localStorage.setItem(Config.COINS_KEY, JSON.stringify(coins));
    localStorage.setItem(Config.COINS_TIMESTAMP_KEY, Date.now());
  },

  shouldFetchFearAndGreedIndex() {
    const now = Date.now();
    const timestamp = localStorage.getItem(Config.FEAR_AND_GREED_INDEX_TIMESTAMP_KEY);
    if (!timestamp) {
      return true;
    }

    return (now - timestamp) > Config.CACHE_VALID_FOR;
  },

  shouldFetchCoins() {
    const now = Date.now();
    const timestamp = localStorage.getItem(Config.COINS_TIMESTAMP_KEY);
    if (!timestamp) {
      return true;
    }

    return (now - timestamp) > Config.CACHE_VALID_FOR;
  }
  
};
