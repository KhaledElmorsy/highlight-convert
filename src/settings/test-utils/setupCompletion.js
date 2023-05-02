import Controller from "../Controller/Controller"; 
let setupSpy;

beforeEach(() => {
  setupSpy = jest.spyOn(Controller.prototype, 'setup');
});

/**
 * Instantiating a `Setting` object involves asynchronously updating its options & value.
 * Use this promise to wait until that's rseolved.
 */
export default setupCompletion = () => setupSpy.mock.results.at(-1).value;

afterEach(() => setupSpy.mockRestore());
