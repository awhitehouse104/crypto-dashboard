export default {

  formatCurrency(value, fractionDigits = 0) {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: fractionDigits
    });

    return formatter.format(value);
  },

  formatPercentage(value, fractionDigits = 2) {
    const formatter = new Intl.NumberFormat('en-US', {
      maximumFractionDigits: fractionDigits
    });

    return formatter.format(value);
  },

  timestampToDateString(timestamp) {
    return new Date(timestamp).toLocaleDateString()
  },

};
