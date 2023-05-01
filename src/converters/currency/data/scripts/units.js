const currencies = require('../raw/currencies.js');
const apiCurrencies = require('../raw/apiCurrencies.js');
const currencyFlags = require('../raw/currencyFlags.js');
const currencySymbols = require('../raw/currencySymbols.js');

const units = currencies
  .filter(({ id }) => Object.hasOwn(apiCurrencies, id))
  .map(({ id, name }) => {
    const currencySymbol = Object.hasOwn(currencySymbols, id)
      ? [currencySymbols[id]]
      : [];
    return {
      id,
      name,
      labels: [id, name, ...currencySymbol],
      symbol: {
        image: currencyFlags[id].image + '.png',
        alt: currencyFlags[id].emoji,
      },
    };
  });

process.stdout.write(JSON.stringify(units))
