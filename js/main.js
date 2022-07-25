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
      historicalData: null,
      selectedForHistoricalData: [Config.COINS[0].ID],
      historicalDataChart: null,
      disableUpdateChart: false,
      cacheTimer: Cache.getCacheTimeRemainingInSeconds(
        Config.COIN_DATA.TIMESTAMP_KEY,
        Config.COIN_DATA.CACHE_VALID_FOR)
    };
  },

  async created() {
    this.startCacheTimer();

    this.fearAndGreedIndex =  await Data.fetchFearAndGreedIndex();
    this.coins = await Data.fetchCoins();
    this.historicalData = await Data.fetchHistoricalData();

    this.initializeHistoricalDataChart();
    
    console.info('Fear and Greed Index:', this.fearAndGreedIndex);
    console.info('Coin Data:', this.coins);
    console.info('Historical Data:', this.historicalData);
  },

  methods: {

    async refreshCoins() {
      this.coins = await Data.fetchCoins(true);
    },

    startCacheTimer() {
      setInterval(async () => {
        this.cacheTimer = Cache.getCacheTimeRemainingInSeconds(
          Config.COIN_DATA.TIMESTAMP_KEY,
          Config.COIN_DATA.CACHE_VALID_FOR);

        if (this.cacheTimer === 0) {
          this.coins = await Data.fetchCoins(true);
        }
      }, 1000);
    },

    initializeHistoricalDataChart() {
      // updating too quickly causes chartjs to fail
      this.disableUpdateChart = true;
      setTimeout(() => this.disableUpdateChart = false, 1000);

      if (this.historicalDataChart) {
        this.historicalDataChart.destroy();
      }

      const selectedHistoricalData = {
        ...this.historicalData,
        datasets: this.historicalData.datasets.filter(d => this.selectedForHistoricalData.includes(d.label))
      };
      const ctx = document.getElementById('historicalDataChart');
      this.historicalDataChart = new Chart(ctx, {
        type: 'line',
        data: selectedHistoricalData,
        options: {
          plugins: {
            legend: {
              display: false
            }
          }
        }
      });
    },

  }

}).mount('#app');
