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
      trendingData: [],
      selectedForHistoricalData: [Config.COINS[0].ID],
      historicalDataChart: null,
      historicalDataMultiselect: false,
      disableUpdateChart: false,
      cacheTimer: Cache.getCacheTimeRemainingInSeconds(
        Config.COIN_DATA.TIMESTAMP_KEY,
        Config.COIN_DATA.CACHE_VALID_FOR)
    };
  },

  async created() {
    // if list has been modified since last visit we need to force update price and historical data
    const enabledCoinsModified = Cache.enabledCoinsModified();

    this.fearAndGreedIndex =  await Data.fetchFearAndGreedIndex();
    this.coins = await Data.fetchCoins(enabledCoinsModified);
    this.historicalData = await Data.fetchHistoricalData(enabledCoinsModified);
    this.trendingData = await Data.fetchTrending();

    this.startCacheTimer();
    this.initializeHistoricalDataChart();
    
    console.info('Fear and Greed Index:', this.fearAndGreedIndex);
    console.info('Coin Data:', this.coins);
    console.info('Historical Data:', this.historicalData);
    console.info('Trending Data:', this.trendingData);
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

    initializeHistoricalDataChart(event) {
      // updating too quickly causes chartjs to fail
      this.disableUpdateChart = true;
      setTimeout(() => this.disableUpdateChart = false, 1000);

      if (this.historicalDataChart) {
        this.historicalDataChart.destroy();
      }

      // event only present when selection made from ui. if multiselect disabled, filter to only current selection
      if (event && !this.historicalDataMultiselect) {
        this.selectedForHistoricalData = this.selectedForHistoricalData.filter(d => d === event.target.value);
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

    historicalDataMultiselectChanged() {
      // if multiselect is toggled off while multiple items are selected, remove all but most recent selection
      if (!this.historicalDataMultiselect && this.selectedForHistoricalData.length > 1) {
        const recentSelection = this.selectedForHistoricalData[this.selectedForHistoricalData.length - 1];
        this.selectedForHistoricalData = [recentSelection];
        this.initializeHistoricalDataChart();
      }
    }

  }

}).mount('#app');
