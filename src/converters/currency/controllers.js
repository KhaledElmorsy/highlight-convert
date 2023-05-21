import { MultiPicker, Picker, Range } from '@settings/Controller/';
import { mapKeys } from '@/util/chrome/storage';
import { units, duplicateSymbols } from './data';

const key = 'currency.settings';
const area = 'sync'; // Default storage area
const map = mapKeys.new(key);

/** Only keep fields for identification and rendering, to reduce sync storage space req. */
const compactUnits = units.map(({ id, name, symbol: { alt } }) => ({
  id,
  name,
  symbol: alt,
}));

export default {
  mainUnit: new Picker({
    area,
    key: map('mainCurrency'),
    options: compactUnits,
    defaultValue: 'usd',
  }),
  secondUnit: new Picker({
    area,
    key: map('foreignCurrency'),
    options: compactUnits,
    defaultValue: 'eur',
  }),
  featuredUnits: new MultiPicker({
    area,
    key: map('featuredCurrencies'),
    options: compactUnits,
    defaultValue: compactUnits.filter(({ id }) =>
      ['usd', 'gbp', 'eur'].includes(id)
    ),
  }),
  labelDefaults: Object.fromEntries(
    Object.entries(duplicateSymbols).map(([symbol, currencyIDs]) => [
      symbol, // key
      new Picker({
        area,
        key: map(`${symbol}-default`),
        options: currencyIDs.map((id) => compactUnits.find((u) => u.id === id)),
        defaultValue: currencyIDs.map((id) =>
          compactUnits.find((u) => u.id === id)
        )[0],
      }),
    ])
  ),
};
