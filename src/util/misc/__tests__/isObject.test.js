import isObject from '../isObject';

let tests = [[]];
afterEach(() => {
  tests.forEach(([input, expected]) => {
    expect(isObject(input)).toBe(expected);
  });
});

test('Plain objects', () => {
  tests = [
    [{}, true],
    [{ a: {} }, true],
  ];
});

test('Arrays', () => {
  tests = [
    [[1, 2], false],
    [[{}], false],
  ];
});

test('null', () => {
  tests = [[null, false]]
})

test('Regexp', () => {
  tests = [[/hi/, false]]
});

test('Date', () => {
  tests = [
    [new Date(), false],
  ]
});

test('Blob', () => {
  tests = [
    [new Blob(), false]
  ]
})
