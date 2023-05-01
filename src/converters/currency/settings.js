import { Picker, Range } from '@/settings/variants';
import { mapKeys } from '@/util/chrome/storage';
import { units, duplicateSymbols } from './data';

const key = 'currency.settings';
const area = 'sync'; // Default storage area
const map = mapKeys.new(key);

export default {
  general: {
    decimal: {
      title: 'Decimal points',
      setting: new Range({
        area,
        key: map('decimals'),
        options: { min: 0, max: 3, step: 1 },
        defaultValue: 0,
      }),
    },
    mainCurrency: {
      title: 'Main currency',
      description: 'Currency to convert highlighted currencies to',
      setting: new Picker({
        area,
        key: map('mainCurrency'),
        options: units.map(({ id }) => id),
        defaultValue: 'usd',
      }),
    },
    secondCurrency: {
      title: 'Foreign currency',
      description: 'Currency to convert your main currency to',
      setting: new Picker({
        area,
        key: map('foreignCurrency'),
        options: units.map(({ id }) => id),
        defaultValue: 'eur',
      }),
    },
  },
  duplicateSymbols: Object.fromEntries(
    Object.entries(duplicateSymbols).map(([symbol, currencyIDs]) => [
      symbol, // key
      {
        title: symbol,
        description: `Default currency for ${symbol} signs`,
        setting: new Picker({
          area,
          key: map(`${symbol}-default`),
          options: currencyIDs,
          defaultValue: currencyIDs[0],
        }),
      },
    ])
  ),
};
