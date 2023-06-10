import toggle from '../toggle';

jest.mock('@ui5/webcomponents/dist/Switch', () => {});

const testToggle = toggle({ value: false });

it('Renders correctly', () => {
  expect(testToggle).toMatchObject({checked: false});

  expect(
    toggle({
      value: false,
      settings: {
        graphical: true,
        tooltip: 'Click me',
      },
    })
  ).toMatchObject({
    checked: false,
    design: 'Graphical',
    tooltip: 'Click me'
  });

  expect(
    toggle({
      value: true,
      settings: {
        text: {
          off: 'Dang',
          on: 'Woo',
        },
      },
    })
  ).toMatchObject({
    checked: true,
    textOff: 'Dang',
    textOn: 'Woo'
  });
});

it('Can set value programatically', () => {
  testToggle.setValue(true);
  expect(testToggle.checked).toBe(true);
});

it('Dispatches the correct visitor method with relevant arguments', () => {
  const visitor = {
    toggle: jest.fn(),
  };
  testToggle.acceptVisitor(visitor);
  expect(visitor.toggle).toHaveBeenCalledWith({
    element: testToggle,
  });
});
