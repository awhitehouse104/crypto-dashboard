// copy to untracked config.js file
export default {

  APP_NAME: 'Crypto Dashboard',

  // coin ids can be retreived here https://api.coingecko.com/api/v3/coins/list
  // clear localStorage after updating list to force update
  COINS: [{
      ID: 'bitcoin',
      CHART_COLOR: '#f2a900'
    }, {
      ID: 'ethereum',
      CHART_COLOR: '#48cbd9'
    }, {
      ID: 'monero',
      CHART_COLOR: '#4c4c4c'
    }
  ],

  // for localStorage cache
  FEAR_AND_GREED_INDEX: {
    KEY: 'fearAndGreedIndex',
    TIMESTAMP_KEY: 'fearAndGreedIndexLastFetched',
    CACHE_VALID_FOR: 60000 * 60
  },

  COIN_DATA: {
    KEY: 'coins',
    TIMESTAMP_KEY: 'coinsLastFetched',
    CACHE_VALID_FOR: 60000 * 15
  },

  HISTORICAL_DATA: {
    KEY: 'historicalData',
    TIMESTAMP_KEY: 'historicalDataLastFetched',
    CACHE_VALID_FOR: 60000 * 60
  }

};
