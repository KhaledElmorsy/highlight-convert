import Observable from '../Observable';

it('Registers unique observers and invokes them with passed arguments', async () => {
  const observable = new Observable();
  const cbA = jest.fn();
  let asyncTest = 'failed';
  const cbB = jest.fn(async () => {
    await new Promise((res) => setTimeout(res, 0));
    asyncTest = 'successful';
  });
  observable.add(cbA);
  observable.add(cbA); // Should still fire only once
  observable.add(cbB);

  expect(observable.size).toBe(2);

  const args = [{}, {}];
  await observable.dispatch(...args);

  [cbA, cbB].forEach((callback) => {
    expect(callback).toHaveBeenCalledTimes(1);
    expect(
      callback.mock.calls[0].every((arg, i) => arg === args[i])
    ).toBeTruthy();
  });
  expect(asyncTest).toBe('successful');
});

it('Removes and clears observers', () => {
  const observable = new Observable();
  const [oA, oB, oC] = Array.from({ length: 3 }, () => jest.fn());
  observable.add(oA);
  observable.add(oB);
  observable.add(oC);

  observable.remove(oB);

  observable.dispatch();
  [oA, oC].forEach((observer) => expect(observer).toHaveBeenCalled());
  expect(oB).not.toHaveBeenCalled();

  jest.clearAllMocks();
  observable.clear();
  observable.dispatch();
  [oA, oC].forEach((observer) => expect(observer).not.toHaveBeenCalled());
});
