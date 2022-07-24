import Data from './data.js';
import Cache from './cache.js';
import Config from '../config.js';

const { createApp } = Vue;

createApp({

  data() {
    return {
      header: Config.APP_NAME,
      fearAndGreedIndex: null,
      coins: [],
      cacheTimer: Cache.getCacheTimeRemainingInSeconds(
        Config.COINS_TIMESTAMP_KEY,
        Config.COINS_CACHE_VALID_FOR)
    };
  },

  async created() {
    this.startCacheTimer();

    this.fearAndGreedIndex =  await Data.fetchFearAndGreedIndex();
    this.coins = await Data.fetchCoins();
    
    console.info('Fear and Greed Index:', this.fearAndGreedIndex);
    console.info('Coins:', this.coins);
  },

  methods: {

    async refreshCoins() {
      this.coins = await Data.fetchCoins(true);
    },

    startCacheTimer() {
      setInterval(async () => {
        this.cacheTimer = Cache.getCacheTimeRemainingInSeconds(
          Config.COINS_TIMESTAMP_KEY,
          Config.COINS_CACHE_VALID_FOR);

        if (this.cacheTimer === 0) {
          this.coins = await Data.fetchCoins(true);
        }
      }, 1000);
    }

  }

}).mount('#app');
