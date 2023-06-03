/**
 * Get a range contained within an input range based on start and end indices in 
 * the input range's string value.
 * @param {Range} range
 * @param {number} startIndex
 * @param {number} endIndex
 */
export default function getInnerRange(range, start, end) {
  const { startContainer, endContainer, startOffset } = range;
  const innerRange = new Range();

  if (startContainer === endContainer && startContainer instanceof Text) {
    innerRange.setStart(startContainer, startOffset + start);
    innerRange.setEnd(startContainer, startOffset  + end);
    return innerRange;
  }

  const rangeWalker = document.createTreeWalker(
    range.commonAncestorContainer,
    NodeFilter.SHOW_TEXT
  );

  let currentIndex = 0;
  const [shiftedStart, shiftedEnd] = [start + startOffset, end + startOffset];
  let rangeStarted = false;
  let startSet = false;

  while (rangeWalker.nextNode()) {
    const { currentNode } = rangeWalker;

    if (!rangeStarted && currentNode !== startContainer) continue;
    rangeStarted ||= true;

    const { length } = currentNode.data;

    if (!startSet && shiftedStart < length + currentIndex) {
      rangeStarted = true;
      innerRange.setStart(currentNode, shiftedStart - currentIndex);
      startSet = true;
    }

    if (rangeStarted && shiftedEnd <= length + currentIndex) {
      innerRange.setEnd(currentNode, shiftedEnd - currentIndex);
      break;
    }

    currentIndex += length;
  }
  return innerRange;
}
