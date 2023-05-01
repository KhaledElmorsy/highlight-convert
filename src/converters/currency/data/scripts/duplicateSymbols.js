const currencySymbols = require('../raw/currencySymbols.js');
const apiCurrencies = require('../raw/apiCurrencies.js');

const symbolMap = Object.entries(currencySymbols).reduce(
  (acc, [currency, symbol]) => {
    if (!Object.hasOwn(apiCurrencies, currency)) return acc;
    acc[symbol] ??= [];
    acc[symbol].push(currency);
    return acc;
  },
  {}
);

const duplicateSymbols = Object.fromEntries(
  Object.entries(symbolMap).filter(
    ([symbol, currencies]) => currencies.length > 1
  )
);

process.stdout.write(JSON.stringify(duplicateSymbols));
