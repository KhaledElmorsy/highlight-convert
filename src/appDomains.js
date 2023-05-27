import { currency, length, temperature, volume, weight } from './domains';
import { MultiPicker } from '@settings/Controller';

/** @type {{[x: string]: Domain<Unit>}} */
const appDomains = { currency, length, temperature, volume, weight };
const domainList = Object.keys(appDomains);

const domainPicker = new MultiPicker({
  area: 'sync',
  key: 'appDomains',
  options: domainList,
  defaultValue: domainList,
});

const getDomains = async () => {
  const enabledDomainKeys = await domainPicker.get();
  return enabledDomainKeys.map((key) => appDomains[key]);
};

export { domainPicker };
export default getDomains;
