function cutDecimals(number, decimals) {
  return number.toLocaleString('fullwide', { maximumFractionDigits: decimals });
}

module.exports = cutDecimals;
