import { currency, length, temperature, volume, weight } from './domains';
import { MultiPicker } from '@settings/Controller';

/** @type {{[x: string]: Domain<Unit>}} */
const appDomains = { currency, length, temperature, volume, weight };
const domainNames = Object.keys(appDomains);

export const domainDisplay = {
  currency: { symbol: '💸', title: 'Currency' },
  length: { symbol: '📏', title: 'Length' },
  temperature: { symbol: '🌡️', title: 'Temperature' },
  volume: { symbol: '🫙', title: 'Volume' },
  weight: { symbol: '⚖️', title: 'Weight' },
};

const domainPicker = new MultiPicker({
  area: 'sync',
  key: 'app.enabledDomainNames',
  options: domainNames,
  defaultValue: domainNames,
});

const getDomains = async () => {
  const enabledDomainKeys = await domainPicker.get();
  return enabledDomainKeys.map((key) => appDomains[key]);
};

export { domainPicker, domainNames };
export default getDomains;
