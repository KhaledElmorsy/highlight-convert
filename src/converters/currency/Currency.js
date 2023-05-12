import units from './data/units';
import controllers from './controllers';
import Converter from '../Converter';
import { getStoredRates } from './util';

class Currency extends Converter {
  /**
   * Locally stored conversion rates and their pull date.
   * @type {RateCache}
   */
  cachedRates;

  constructor() {
    super({units, controllers});
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
}

export default new Currency();
