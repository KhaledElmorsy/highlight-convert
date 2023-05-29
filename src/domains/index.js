export { default as currency } from './currency/currency';
export { default as temperature } from './temperature/temperature';
export { default as length } from './length/length';
export { default as volume } from './volume/volume';
export { default as weight } from './weight/weight';

import { controllers as tempControllers } from '@domains/temperature/temperature';
import { controllers as lengthControolers } from '@domains/length/length';
import { controllers as weightControllers } from '@domains/weight/weight';
import { controllers as volumeControllers } from '@domains/volume/volume';
import { controllers as currencyControllers } from '@domains/currency/currency';

export const controllers = {
  temperature: tempControllers,
  length: lengthControolers,
  weight: weightControllers,
  volume: volumeControllers,
  currency: currencyControllers,
};
