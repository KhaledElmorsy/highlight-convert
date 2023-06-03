import getInnerRange from '../getInnerRange';

const outer1HTML = '<div id ="outer1">Text<span id="inner1">Text</span></div>';
const outer2HTML =
  '<span id="outer2">Longer text with <em id="inner2">bold </em>language</span>';

/**
 * @typedef {{node: Node, offset: number}} Boundary
 * @typedef {{start: Boundary, end: Boundary}} RangeBoundaries
 */

/**
 * @type {RangeBoundaries}
 */
let inputBoundaries;
/**
 * @type {{start: number, end: number}}
 */
let indices;

/**
 * @type {RangeBoundaries}
 */
let expectedInnerBounds;

beforeEach(() => {
  document.body.innerHTML = outer1HTML + outer2HTML;
});

afterEach(() => {
  const range = new Range();
  const { start: inputStart, end: inputEnd } = inputBoundaries;
  range.setStart(inputStart.node, inputStart.offset);
  range.setEnd(inputEnd.node, inputEnd.offset);

  const innerRange = getInnerRange(range, indices.start, indices.end);
  const { start: expectedStart, end: expectedEnd } = expectedInnerBounds;

  expect(innerRange.startContainer).toBe(expectedStart.node);
  expect(innerRange.startOffset).toBe(expectedStart.offset);
  expect(innerRange.endContainer).toBe(expectedEnd.node);
  expect(innerRange.endOffset).toBe(expectedEnd.offset);
});

describe('Returns correct inner range:', () => {
  describe('Input range contained in a text node:', () => {
    let node;
    beforeEach(() => {
      node = outer2.firstChild;
    });
    test('Shared start boundary with text node', () => {
      inputBoundaries = {
        start: { node, offset: 0 },
        end: { node, offset: 7 },
      };
      indices = { start: 0, end: 4 };
      expectedInnerBounds = {
        start: { node, offset: 0 },
        end: { node, offset: 4 },
      };
    });
    test('Contained between text node boundaries', () => {
      inputBoundaries = {
        start: { node, offset: 2 },
        end: { node, offset: 10 },
      };
      indices = { start: 4, end: 7 };
      expectedInnerBounds = {
        start: { node, offset: 6 },
        end: { node, offset: 9 },
      };
    });
    test('Shared end boundary with text node', () => {
      inputBoundaries = {
        start: { node, offset: 3 },
        end: { node, offset: node.data.length },
      };
      (indices = { start: 3, end: node.data.length - 3 }),
        (expectedInnerBounds = {
          start: { node, offset: 6 },
          end: { node, offset: node.data.length },
        });
    });
  });

  describe('Input range spans multiple nodes', () => {
    beforeEach(() => {
      inputBoundaries = {
        start: { node: outer1.firstChild, offset: 0 },
        end: { node: outer2.lastChild, offset: outer2.lastChild.length },
      };
    });
    test('Shared start boundary with first node', () => {
      indices = { start: 0, end: 10 };
      expectedInnerBounds = {
        start: { node: outer1.firstChild, offset: 0 },
        end: { node: outer2.firstChild, offset: 2 },
      };
    });
    test('Shared end boundary with last node', () => {
      indices = { start: 10, end: 38 };
      expectedInnerBounds = {
        start: { node: outer2.firstChild, offset: 2 },
        end: { node: outer2.lastChild, offset: outer2.lastChild.length },
      };
    });

    test('Contained boundaries', () => {
      indices = { start: 6, end: 27 };
      expectedInnerBounds = {
        start: { node: inner1.firstChild, offset: 2 },
        end: { node: inner2.firstChild, offset: 2 },
      };
    });
  });
});
