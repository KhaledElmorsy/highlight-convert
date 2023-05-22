import { Picker } from '@settings/Controller';
import createConverter from './createConverter';
import LinearConverter from '@converters/LinearConverter';
import CustomConverter from '@converters/CustomConverter';

class MockPicker {
  get() {}
}

jest.mock('@settings/Controller', () => ({
  Picker: jest.fn(() => new MockPicker()),
}));

class MockConverter {}
jest.mock('../LinearConverter', () => jest.fn(() => new MockConverter()));
jest.mock('../CustomConverter', () => jest.fn(() => new MockConverter()));

const converterID = 'test';
const unitMap = {
  usd: { id: 'usd', labels: ['$', 'usd'], name: 'US Dollar', group: '' },
  gbp: { id: 'gbp', labels: ['£', 'gbp'], name: 'Pound Sterling', group: '' },
  egp: { id: 'egp', labels: ['£', 'egp'], name: 'Egyptian Pound', group: '' },
};
const units = Object.values(unitMap);
const rates = { usd: 1, gbp: 1, egp: 1 };
const setup = { rates };

/** @type {ConverterOptions<Unit>} */
const options = {
  numberRequired: true,
  caseSensetive: true,
};

let converter;
let controllers;

beforeEach(() => {
  jest.clearAllMocks();
  ({ converter, controllers } = createConverter({
    id: converterID,
    units,
    type: 'LinearConverter',
    setup,
    options,
  }));
});

it('Passes options and units to the converter constructor', () => {
  expect(LinearConverter).toHaveBeenCalledWith(
    expect.objectContaining({ options, units })
  );
});

it('Returns the correct converter type', () => {
  expect(converter).toBeInstanceOf(MockConverter);
});

it('Passes converter setup parameters to the chosen constructor', () => {
  expect(LinearConverter).toHaveBeenCalledWith(expect.objectContaining(setup));
  
  // Custom Converter
  const ccSetup = { convertAll: () => {}, convertVector: () => {} };
  createConverter({
    id: 'any',
    units,
    type: 'CustomConverter',
    setup: ccSetup,
  });
  expect(CustomConverter).toHaveBeenCalledWith(
    expect.objectContaining(ccSetup)
  );
});

describe('labelDefaults', () => {
  let labelDefaults;
  let controller;
  const label = '£';
  beforeEach(() => {
    ({ labelDefaults } = controllers);
    controller = labelDefaults[label];
  });
  describe('controllers:', () => {
    it('Creates controllers for each shared label', () => {
      expect(labelDefaults).toHaveProperty('£');
      // Mocked above for easier confirmation
      expect(labelDefaults['£']).toBeInstanceOf(MockPicker);
    });

    it('Instantiates the controller with the input key (interpolated)', () => {
      expect(Picker.mock.calls[0][0].key).toBe(
        `${converterID}.labelDefaults.${label}`
      );
    });

    it('Passes a compacted unit array (id & name) as options to the controller', () => {
      expect(Picker.mock.calls[0][0].options).toEqual(
        expect.arrayContaining(
          [unitMap.egp, unitMap.gbp].map(({ id, name }) => ({ id, name }))
        )
      );
    });
  });

  it('Passes the default unit ID getter to the converter', async () => {
    const testID = 'nice';
    jest.spyOn(controller, 'get').mockResolvedValue({ id: testID });

    expect(LinearConverter).toHaveBeenCalledWith(
      expect.objectContaining({
        labelDefaults: {
          [label]: expect.any(Function),
        },
      })
    );

    const idGetter = LinearConverter.mock.calls[0][0].labelDefaults[label];
    const defaultID = await idGetter();
    expect(defaultID).toBe(testID);
  });

  it('Passes an empty object to the controller if no labels are shared', () => {
    const testUnits = [unitMap.usd, unitMap.gbp];
    createConverter({
      units: testUnits,
      type: 'LinearConverter',
      id: converterID,
    });
    const labelDefaultArgs = LinearConverter.mock.calls.at(-1)[0].labelDefaults;
    expect(labelDefaultArgs).toEqual({});
  });
});
