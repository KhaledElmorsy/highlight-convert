import StorageEvents, { dispatchObservables } from '../StorageEvents';

it('Registers its dispatcher in chromes storage object', () => {
  expect(chrome.storage.onChanged.addListener).toHaveBeenCalledWith(
    dispatchObservables
  );
});

it('Registers and dispatches observers for specific keys in specific storage areas', () => {
  ['local', 'session', 'sync'].forEach((storageArea) => {
    const area = chrome.storage[storageArea];
    const key = 'test';
    const observer = jest.fn();
    StorageEvents.observe(area, key, observer);

    dispatchObservables({}, storageArea);
    dispatchObservables({ randomKey: {} }, storageArea);
    const differentArea = storageArea !== 'local' ? 'local' : 'sync';
    dispatchObservables({ [key]: {} }, differentArea);
    expect(observer).not.toHaveBeenCalled();

    const change = {};
    dispatchObservables({ [key]: change }, storageArea);
    expect(observer).toHaveBeenCalledWith(change);

    const keyB = 'nice';
    const observerB = jest.fn();
    StorageEvents.observe(area, keyB, observerB);
    const changeB = {};

    jest.clearAllMocks();
    dispatchObservables({ [key]: change, [keyB]: changeB }, storageArea);
    expect(observer).toHaveBeenCalledWith(change);
    expect(observerB).toHaveBeenCalledWith(changeB);

    jest.clearAllMocks();
    StorageEvents.removeObserver(area, key, observer);
    dispatchObservables({ [key]: change, [keyB]: changeB }, storageArea);
    expect(observer).not.toHaveBeenCalled();
    expect(observerB).toBeCalledWith(changeB);
  });
});

it('Silently accepts non-existant observer removals', () => {
  expect(() =>
    StorageEvents.removeObserver(chrome.storage.local, 'randomKey', () => {})
  ).not.toThrow();
});

it('Throws when passed an invalid storage area', () => {
  expect(() => StorageEvents.observe({}, 'test', () => {})).toThrow();
});
