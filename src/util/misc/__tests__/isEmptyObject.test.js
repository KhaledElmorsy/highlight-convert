import isEmptyObject from "../isEmptyObject";

it('Returns true on empty objects', () => {
  expect(isEmptyObject({})).toBe(true);
})

describe('Returns false when:', () => {
  test('Object has properties', () => {
    expect(isEmptyObject({a: 1})).toBe(false);
  })
  test('Object has methods', () => {
    expect(isEmptyObject({foo() {}})).toBe(false);
  })
})

it('Warns if not passed a plain object and ignores prototype chain', () => {
  const consoleWarn = jest.spyOn(console, 'warn');
  
  const proto = {a: 1};
  const obj = Object.create(proto)
  expect(isEmptyObject(obj)).toBe(true);
  expect(consoleWarn).toHaveBeenCalled();

  // Warning can be disabled
  consoleWarn.mockClear();
  isEmptyObject(obj, {warn: false});
  expect(consoleWarn).not.toHaveBeenCalled();
})
