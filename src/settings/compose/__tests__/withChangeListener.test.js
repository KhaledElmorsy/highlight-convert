import withChangeListener from '../withChangeListener';
import Controller from '@settings/Controller/Controller';

jest.mock('@settings/Controller/Controller');

/** @type {ReturnType<withChangeListener<Controller<any>, any>>} */
let controller;
let baseSetter;
let baseController;

beforeEach(() => {
  jest.clearAllMocks();
  baseController = new Controller();
  baseSetter = baseController.set;
  controller = withChangeListener(baseController);
});

it('Registers, calls, and removes listeners', async () => {
  const handler = jest.fn();
  const asyncCallback = jest.fn(async () => {
    await new Promise((res) => setTimeout(res, 0)); // Force off sync stack
    handler();
  });

  controller.addListener(asyncCallback);

  expect(handler).not.toHaveBeenCalled();

  const newValue = {};
  await controller.set(newValue);

  function baseBehaviorMaintained() {
    expect(baseSetter).toHaveBeenCalled();
    expect(baseSetter.mock.calls[0][0]).toBe(newValue);
    expect(baseSetter.mock.contexts[0]).toBe(baseController);
  }
  baseBehaviorMaintained();

  expect(asyncCallback.mock.calls[0][0]).toBe(newValue);
  expect(handler).toHaveBeenCalled();

  jest.clearAllMocks();
  controller.removeListener(asyncCallback);

  await controller.set(newValue);
  expect(asyncCallback).not.toHaveBeenCalled();
  baseBehaviorMaintained();
});

it('Registers a specific handler instance only once', async () => {
  const handler = jest.fn();
  controller.addListener(handler);
  controller.addListener(handler);

  await controller.set();
  expect(handler).toHaveBeenCalledTimes(1);

  handler.mockClear();
  controller.removeListener(handler);
  await controller.set();
  expect(handler).not.toHaveBeenCalled();
});

it('Awaits all async handlers', async () => {
  const spies = [];
  function generateCB() {
    const spy = jest.fn();
    spies.push(spy);
    return async () => {
      await new Promise((res) => setTimeout(res, 0));
      spy();
    };
  }
  for (let i = 0; i < 6; i++) {
    const asyncCB = generateCB();
    controller.addListener(asyncCB);
  }
  await controller.set();
  spies.forEach((spy) => expect(spy).toHaveBeenCalled());
});
