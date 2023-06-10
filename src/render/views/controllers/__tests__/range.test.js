import range from '../range';

jest.mock('@ui5/webcomponents/dist/Slider', () => {});

const options = { min: 0, max: 20, step: 2 };

const settings = {
  labelInterval: 4,
  showTickmarks: true,
  showTooltip: true,
};

const testRange = range({
  options,
  value: 4,
  settings,
});

it('Renders correctly', () => {
  expect(testRange).toMatchObject({
    ...settings,
    ...options,
    value: 4,
  });

  const defaultSettings = {
    showTickmarks: false,
    showTooltip: false,
    labelInterval: 0
  }

  const basicRange = range({
    options,
    value: 4,
  });
  
  expect(basicRange).toMatchObject({
    ...defaultSettings,
    ...options,
    value: 4
  });
});

it('Allows programatic value updates', () => {
  testRange.setValue(10);
  expect(testRange.value).toBe(10);
});

it('Dispatches the correct visitor method with relevant arguments', () => {
  const visitor = {
    range: jest.fn(),
  };
  testRange.acceptVisitor(visitor);

  expect(visitor.range).toHaveBeenCalledWith({
    options,
    element: testRange,
  });
});
