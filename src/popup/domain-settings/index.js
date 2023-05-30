import createDomainSettings from './util/createBaseSettings';
import * as temperature from '@domains/temperature/temperature';
import * as length from '@domains/length/length';
import * as volume from '@domains/volume/volume';
import * as weight from '@domains/weight/weight';
import * as currency from '@domains/currency/currency';

export default {
  temperature: createDomainSettings(temperature.controllers, 'Temperature'),
  
  weight: createDomainSettings(weight.controllers, 'Weight', {
    groups: weight.groups,
  }),

  length: createDomainSettings(length.controllers, 'Length', {
    groups: length.groups,
  }),

  volume: createDomainSettings(volume.controllers, 'Volume', {
    groups: volume.groups,
  }),

  currency: createDomainSettings(currency.controllers, 'Currency', {
    unitTemplates: currency.unitTemplates,
  }),
};
