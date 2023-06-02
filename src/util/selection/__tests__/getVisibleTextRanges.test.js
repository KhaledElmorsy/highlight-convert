import getVisibleTextRanges from '../getVisibleTextRanges';
import dedent from '@util/misc/dedent';

HTMLElement.prototype.checkVisibility = function () {
  return ![HTMLStyleElement, HTMLScriptElement].some(
    (type) => this instanceof type
  );
};

const html = dedent`\
<div id="outer">
  Sample text node
  <style id="style">
    color: red;
  </style>
  Another text node
  <p id="paragraph">This one's in a paragraph element</p>
  <script id="script">
    console.log('Sometimes there's a 100kb script element in a random spot in the page')
  </script>
  <div id="inner"><span id="span">Nested</span></div>
</div>`;

beforeAll(() => {
  document.body.innerHTML = html;
});

function testRangeProps(visibleRanges, expectedPropArray) {
  visibleRanges.forEach((range, i) => {
    Object.entries(expectedPropArray[i]).forEach(([prop, val]) => {
      expect(range[prop]).toBe(val);
    });
  });
}

describe('Returns visible ranges:', () => {
  test('Range fully contained in element', () => {
    const range = new Range();
    range.selectNodeContents(outer);
    const visibleRanges = getVisibleTextRanges(range);
    expect(visibleRanges.length).toBe(3);
    testRangeProps(visibleRanges, [
      {
        startContainer: outer.firstChild,
        startOffset: 0,
        endContainer: outer.firstChild,
        endOffset: outer.firstChild.data.length,
      },
      {
        startContainer: paragraph.previousSibling,
        startOffset: 0,
        endContainer: paragraph.nextSibling,
        endOffset: paragraph.nextSibling.length,
      },
      {
        startContainer: inner.previousSibling,
        startOffset: 0,
        endContainer: inner.nextSibling,
        endOffset: inner.nextSibling.length,
      },
    ]);
  });

  test('Range fully contained in a text node', () => {
    const range = new Range();
    range.setStart(paragraph.firstChild, 2);
    range.setEnd(paragraph.firstChild, 7);
    const visibleRanges = getVisibleTextRanges(range);
    expect(visibleRanges.length).toBe(1);
    testRangeProps(visibleRanges, [
      {
        startContainer: paragraph.firstChild,
        startOffset: 2,
        endContainer: paragraph.firstChild,
        endOffset: 7,
      }])
  })

  test('Partially contained range', () => {
    const range = new Range();
    range.setStart(outer.firstChild, 5);
    range.setEnd(paragraph.firstChild, 4);
    const visibleRanges = getVisibleTextRanges(range);
    expect(visibleRanges.length).toBe(2);
    testRangeProps(visibleRanges, [
      {
        startContainer: outer.firstChild,
        startOffset: 5,
        endContainer: outer.firstChild,
        endOffset: outer.firstChild.length,
      },
      {
        startContainer: paragraph.previousSibling,
        startOffset: 0,
        endContainer: paragraph.firstChild,
        endOffset: 4,
      },
    ]);
  });

  test('Range with hidden boundaries', () => {
    const range = new Range();
    range.setStart(style.firstChild, 2);
    range.setEnd(script.firstChild, 3);
    const visibleRanges = getVisibleTextRanges(range);
    expect(visibleRanges.length).toBe(1);
    testRangeProps(visibleRanges, [
      {
        startContainer: paragraph.previousSibling,
        startOffset: 0,
        endContainer: script.previousSibling,
        endOffset: script.previousSibling.length,
      },
    ]);
  });
  
  test('Range with included element boundaries', () => {
    const range = new Range();
    range.setStartBefore(paragraph);
    range.setEndAfter(span);
    const visibleRanges = getVisibleTextRanges(range);
    expect(visibleRanges.length).toBe(2);
    testRangeProps(visibleRanges, [
      {
        startContainer: paragraph.firstChild,
        startOffset: 0,
        endContainer: paragraph.nextSibling,
        endOffset: paragraph.nextSibling.length,
      },
      {
        startContainer: script.nextSibling,
        startOffset: 0,
        endContainer: span.firstChild,
        endOffset: span.firstChild.length,
      },
    ]);
  });

  test('Range with excluded element boundaries', () => {
    // A range's end container can point to an element that's not part of that range.
    // The range will have an end offset of 0 since end offset is the number 
    // of child nodes between the start of the end container and the range boundary.
    // For more info: MDN: Range:endOffset https://developer.mozilla.org/en-US/docs/Web/API/Range/endOffset
    const range = new Range();
    range.setStartAfter(script);
    range.setEnd(span, 0); // Can naturally happen with DOM selections
    const visibleRanges = getVisibleTextRanges(range);
    expect(visibleRanges.length).toBe(1);
    testRangeProps(visibleRanges, [
      {
        startContainer: script.nextSibling,
        startOffset: 0,
        endContainer: script.nextSibling,
        endOffset: script.nextSibling.length,
      },
    ]);
  })

  test('Collapsed visible range', () => {
    const range = new Range();
    range.setStartAfter(style);
    range.collapse();
    const visibleRanges = getVisibleTextRanges(range);
    expect(visibleRanges.length).toBe(1);
    expect(visibleRanges[0]).toBe(range);
  })
});
