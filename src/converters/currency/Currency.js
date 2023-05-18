import units from './data/units';
import controllers from './controllers';
import { getStoredRates } from './util';
import LinearConverter from '@converters/LinearConverter';

/** Currently saved rates */
export const cachedRates = {}; // Extracted to be accessible, and thus, mockable during testing

/**
 * Get currency conversion rates.
 *
 * First check this object's local property, then check chrome's storage,
 * finally, request new rates.
 *
 * The latter two cases are delegated to {@link getStoredRates}.
 * @returns {Promise<Rates>}
 */
export async function getRates() {
  const today = new Date().toLocaleDateString('en-us');
  if (cachedRates.rates && cachedRates.date === today) {
    return cachedRates.rates;
  }

  const rates = await getStoredRates();

  Object.assign(cachedRates, { date: today, rates });
  return rates;
}

export default new LinearConverter({ units, controllers, getRates });
