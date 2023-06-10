import picker from '../picker';
import { picker as setup } from '../test-utils/pickerSetup';

jest.mock('@ui5/webcomponents/dist/Select', () => {});

describe.each([
  [
    'String',
    {
      init: {
        options: setup.string.options,
        value: setup.string.options[1],
        settings: {
          mapOptions: setup.string.mapOptions,
        },
      },
      newValue: setup.string.options[0],
      visitorArgs: {
        options: setup.string.options,
        mapOptions: setup.string.mapOptions,
        keys: null,
      },
    },
  ],
  [
    'Object',
    {
      init: {
        options: setup.object.options,
        value: setup.object.options[1],
        settings: {
          mapOptions: setup.object.mapOptions,
          keys: setup.object.keys,
        },
      },
      newValue: setup.object.options[0],
      visitorArgs: {
        options: setup.object.options,
        mapOptions: setup.object.mapOptions,
        keys: setup.object.keys,
      },
    },
  ],
])('%s options', (_, { init, newValue, visitorArgs }) => {
  const testPicker = picker(init);
  it('Renders correctly', () => {
    expect(testPicker).toMatchSnapshot();
  });
  it('Programatically updates values', () => {
    testPicker.setValue(newValue);
    expect(testPicker).toMatchSnapshot();
  });
  it('Dispatches the correct visitor method with relevant arguments', () => {
    const visitor = {
      picker: jest.fn(),
    };
    testPicker.acceptVisitor(visitor);
    expect(visitor.picker).toHaveBeenCalledWith({
      ...visitorArgs,
      element: testPicker,
    });
  });
});
