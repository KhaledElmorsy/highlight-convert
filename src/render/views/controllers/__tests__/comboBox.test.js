import comboBox from '../combBox';
import { comboBox as setup } from '../test-utils/pickerSetup';

jest.mock('@ui5/webcomponents/dist/ComboBox', () => {});
jest.mock('@ui5/webcomponents/dist/MultiComboBox', () => {});

describe.each([
  ['Single', { multi: false, visitorMethod: 'comboBox' }],
  ['Multi', { multi: true, visitorMethod: 'multiComboBox' }],
])('%s option selection mode', (_, { multi, visitorMethod }) => {
  describe.each([
    [
      'String',
      {
        init: {
          options: setup.string.options,
          settings: { mapOptions: setup.string.mapOptions, multi },
        },
        values: multi
          ? {
              defaultValue: [setup.string.options[2]],
              newValue: setup.string.options.slice(0, 2),
            }
          : {
              defaultValue: setup.string.options[2],
              newValue: setup.string.options[0],
            },
        visitorArgs: {
          options: setup.string.options,
          keys: null,
          mapOptions: setup.string.mapOptions,
        },
      },
    ],
    [
      'Object',
      {
        init: {
          options: setup.object.options,
          settings: {
            mapOptions: setup.object.mapOptions,
            keys: setup.object.keys,
            multi,
          },
        },
        values: multi
          ? {
              defaultValue: [setup.object.options[2]],
              newValue: setup.object.options.slice(0, 2),
            }
          : {
              defaultValue: setup.object.options[2],
              newValue: setup.object.options[0],
            },
        visitorArgs: {
          options: setup.object.options,
          keys: setup.object.keys,
          mapOptions: setup.object.mapOptions,
        },
      },
    ],
  ])(
    '%s options',
    (_, { init, values: { defaultValue, newValue }, visitorArgs }) => {
      const testComboBox = comboBox({ ...init, value: defaultValue });

      it('Renders correctly', () => {
        expect(testComboBox).toMatchSnapshot();
      });
      it('Can programatically change values', () => {
        testComboBox.setValue(newValue);
        expect(testComboBox).toMatchSnapshot();
      });
      it('Dispatches the correct visitor method with relevant arguments', () => {
        const visitor = {
          comboBox: jest.fn(),
          multiComboBox: jest.fn(),
        };
        testComboBox.acceptVisitor(visitor);
        expect(visitor[visitorMethod]).toHaveBeenCalledWith({
          ...visitorArgs,
          element: testComboBox,
        });
      });
    }
  );
});
