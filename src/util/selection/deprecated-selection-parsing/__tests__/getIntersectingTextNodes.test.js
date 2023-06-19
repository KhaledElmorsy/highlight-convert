import getIntersectingTextNodes from '../1.getIntersectingTextNodes';

const testElemenHTML = `\
<div id="outer">Text content in the container\
<p id="inner">Now a paragraph <span>with an embedded span</span></p>\
<p> And  some <br id="break"> nodes separated <br> by line-breaks</p>\
and a node in the end for good measure.\
</div>`;

document.body.innerHTML = testElemenHTML;
const outer = document.getElementById('outer');
const inner = document.getElementById('inner');
const breakEl = document.getElementById('break');

it('Returns an empty array if the range is collapsed', () => {
  const range = new Range();
  range.setStart(outer, 2);
  range.collapse();
  expect(getIntersectingTextNodes(range)).toEqual([]);
});

it('Returns an array of all text nodes in an element that intersect the current selection', () => {
  const outerRange = new Range();
  outerRange.selectNodeContents(outer);

  const allNodes = getIntersectingTextNodes(outerRange);
  expect(allNodes.length).toBe(7);

  const innerRange = new Range();
  innerRange.setStartBefore(inner);
  innerRange.setEndBefore(breakEl);
  expect(getIntersectingTextNodes(innerRange).length).toBe(3);
  
  const midNodeRange = innerRange.cloneRange();
  midNodeRange.setStart(inner.childNodes[0], 3);
  expect(getIntersectingTextNodes(innerRange).length).toBe(3);
});
