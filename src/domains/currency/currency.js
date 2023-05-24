import units from './data/units';
import { getStoredRates } from './util';
import createDomain from '../createDomain';

export { units }; // For testing

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

const { domain: currency, controllers } = createDomain({
  units,
  converterConfig: {
    type: 'LinearConverter',
    setup: { getRates },
  },
  id: 'currency',
  renderConfig: {
    featuredUnitIDs:  ['usd', 'egp', 'gbp', 'eur'],
    mainUnitID: 'egp',
    secondaryUnitID: 'usd',
    unitTemplates: units.reduce((acc, { id, name, symbol: { alt } }) => {
      acc[id] = { title: `${alt} ${name}`, subtitle: id.toUpperCase() };
      return acc;
    }, {}),
  },
});
export { controllers };
export default currency;
