import units from './data/units';
import settings from './settings';
import Converter from '../Converter';
import { getStoredRates } from './util';
import { roundTo } from '@util/misc';

export default class Currency extends Converter {
  /**
   * Locally stored conversion rates and their pull date.
   * @type {RateCache}
   */
  cachedRates;

  constructor() {
    super(units);
  }

  /**
   * Get currency conversion rates.
   *
   * First check this object's local property, then check chrome's storage,
   * finally, request new rates.
   *
   * The latter two cases are delegated to {@link getStoredRates}.
   * @returns {Promise<Rates>}
   */
  async getRates() {
    const today = new Date().toLocaleDateString('en-us');
    if (this.cachedRates && this.cachedRates.date === today) {
      return this.cachedRates.rates;
    }

    const rates = await getStoredRates();

    this.cachedRates = {
      date: today,
      rates,
    };
    return rates;
  }

  /** @type {Converter['matchFilter']} */
  async matchFilter(match) {
    // Filter out matched symbols that are shared by multiple currencies
    // if their matched currency isn't the user's default choice.
    const {
      unit,
      data: { unit: label },
    } = match;
    const { duplicateSymbols } = settings;
    const currentDupe = duplicateSymbols[label];
    if (currentDupe === undefined) return true;
    const defaultUnit = await currentDupe.setting.get();
    return JSON.stringify(defaultUnit) === JSON.stringify(unit);
  }

  /**
   * @type {Converter['convert']}
   */
  async convert(value) {
    const rates = await this.getRates();

    const { amount, unit } = value;

    // Scale rates to amounts using the same relative ratio as the input value
    // Input: 60 egp | rates:{egp: 30, usd: 1} | scale: 2 | Output: {egp: 60, usd: 2}
    const scaleFactor = amount / rates[unit.id];

    /** @type {{[id: string]: number}} */
    const convertedAmounts = Object.fromEntries(
      Object.entries(rates).map(([id, rate]) => [id, rate * scaleFactor])
    );

    const decimals = await settings.general.decimal.setting.get();

    return this.units.map((currency) =>
      this.createValue({
        unit: currency,
        amount: roundTo(convertedAmounts[currency.id], decimals),
      })
    );
  }
}
