export default {

  APP_NAME: 'Crypto Dashboard',

  // coin ids can be retreived here https://api.coingecko.com/api/v3/coins/list
  // delete localStore after updating list for instant update
  COINS: [
    'bitcoin',
    'ethereum',
    'monero'
  ],

  // localStorage cache keys
  FEAR_AND_GREED_INDEX_TIMESTAMP_KEY: 'fearAndGreedIndexLastFetched',

  COINS_TIMESTAMP_KEY: 'coinsLastFetched',

  FEAR_AND_GREED_INDEX_KEY: 'fearAndGreedIndex',
  
  COINS_KEY: 'coins',

  // update this to change cache duration
  CACHE_VALID_FOR: 60000 * 15
};
