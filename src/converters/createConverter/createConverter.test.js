import createConverter from './createConverter';
import LinearConverter from '@converters/LinearConverter';

jest.mock('@settings/Controller', () => ({
  MultiPicker: jest.fn((args) => args),
  Picker: jest.fn((args) => args),
  Range: jest.fn((args) => args),
}));

class MockConverter {}
jest.mock('../LinearConverter', () => jest.fn(() => new MockConverter()));

const converterID = 'test';
const unitMap = {
  usd: { id: 'usd', labels: ['$', 'usd'], name: 'US Dollar', group: '' },
  gbp: { id: 'gbp', labels: ['£', 'gbp'], name: 'Pound Sterling', group: '' },
  egp: { id: 'egp', labels: ['£', 'egp'], name: 'Egyptian Pound', group: '' },
};
const units = Object.values(unitMap);
const rates = { usd: 1, gbp: 1, egp: 1 };

/** @type {ControllerSettings<Unit>} */
const controllerSettings = {
  decimals: { default: 0, max: 3 },
  mainUnit: unitMap.usd,
  secondUnit: unitMap.gbp,
  featuredUnits: [unitMap.gbp, unitMap.egp],
  labelDefaults: {
    '£': {
      options: [unitMap.gbp, unitMap.egp],
      default: unitMap.egp,
    },
  },
};

/** @type {ConverterOptions<Unit>} */
const options = {
  numberRequired: true,
  caseSensetive: true,
};

const testConverter = createConverter({
  id: converterID,
  units,
  type: 'LinearConverter',
  setup: { rates },
  controllerSettings,
  options,
});

it('Passes options and units to the converter constructor', () => {
  expect(LinearConverter).toHaveBeenCalledWith(
    expect.objectContaining({ options, units })
  );
});

it('Returns the correct converter type', () => {
  expect(testConverter).toBeInstanceOf(MockConverter);
});

it('Passes converter setup parameters to the chosen constructor', () => {
  expect(LinearConverter).toHaveBeenCalledWith(
    expect.objectContaining({ rates })
  );
});

describe('controllers', () => {
  const controllers = LinearConverter.mock.calls[0][0].controllers;

  it('Instatiates controllers with mapped storage keys in the sync storage area', () => {
    Object.entries(controllers).forEach(([controllerID, value]) => {
      if (controllerID !== 'labelDefaults') {
        const controller = value;
        expect(controller).toEqual(
          expect.objectContaining({
            key: `${converterID}.${controllerID}`,
            area: 'sync',
          })
        );
      } else {
        const controller = value['£'];
        expect(controller).toEqual(
          expect.objectContaining({
            key: `${converterID}.labelDefaults.£`,
            area: 'sync',
          })
        );
      }
    });
  });

  it('Instantiates the decimals range controller with the passed settings', () => {
    const decimals = controllers.decimals;
    const passedArgs = controllerSettings.decimals;
    expect(decimals.options.max).toBe(passedArgs.max);
    expect(decimals.defaultValue).toBe(passedArgs.default);
  });

  describe('Unit driven controllers:', () => {
    describe('Passes correct and compacted units to:', () => {
      const compact = ({ id, name }) => ({ id, name });
      const compactUnits = units.map(compact);

      test('mainUnit & secondUnit', () => {
        ['mainUnit', 'secondUnit'].forEach((key) => {
          const passedArgs = controllers[key];
          expect(passedArgs.options).toEqual(compactUnits);
          expect(passedArgs.defaultValue).toEqual(
            compact(controllerSettings[key])
          );
        });
      });
      test('featuredUnits', () => {
        const passedArgs = controllers.featuredUnits;
        expect(passedArgs.options).toEqual(compactUnits);
        expect(passedArgs.defaultValue).toEqual(
          controllerSettings.featuredUnits.map(compact)
        );
      });
      test('labelDefaults > controller', () => {
        const passedArgs = controllers.labelDefaults['£'];
        const expected = controllerSettings.labelDefaults['£'];
        expect(passedArgs.options).toEqual(expected.options.map(compact));
        expect(passedArgs.defaultValue).toEqual(compact(expected.default));
      });
    });
  });
});
