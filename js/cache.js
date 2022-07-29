import Config from '../config.js';

export default {

  getFromCache(key, asJson = false) {
    const item = localStorage.getItem(key);
    return asJson ? JSON.parse(item) : item;
  },

  updateCache(key, timestampKey, value, asJson = false) {
    localStorage.setItem(key, asJson ? JSON.stringify(value) : value);
    localStorage.setItem(timestampKey, Date.now());
  },

  shouldFetch(timestampKey, cacheValidFor) {
    const timestamp = localStorage.getItem(timestampKey);
    if (!timestamp) {
      return true;
    }

    return (Date.now() - timestamp) > cacheValidFor;
  },

  getCacheTimeRemainingInSeconds(timestampKey, cacheValidFor) {
    const timestamp = localStorage.getItem(timestampKey);
    if (!timestamp) {
      return 0;
    }
    const timePassed = Date.now() - timestamp;

    return Math.max(Math.round((cacheValidFor - timePassed) * 0.001), 0);
  },

  enabledCoinsModified() {
    const cached = localStorage.getItem(Config.COINS_ENABLED_KEY);
    if (!cached) {
      localStorage.setItem(Config.COINS_ENABLED_KEY, JSON.stringify(Config.COINS));
      return true;
    }

    // check if list has been modified since last visit then update stored value
    const modified = cached !== JSON.stringify(Config.COINS);
    if (modified) {
      localStorage.setItem(Config.COINS_ENABLED_KEY, JSON.stringify(Config.COINS));
    }
    
    return modified;
  },

  refreshEnabledCoinsCache() {
    localStorage.setItem(Config.COINS_ENABLED_KEY, JSON.stringify(Config.COINS));
  }

};
