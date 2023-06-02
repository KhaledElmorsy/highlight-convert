/**
 * Get the visible inner text ranges in a DOM range
 * @param {Range} range
 * @returns {Range[]}
 */
export default function getVisibleTextRanges(range) {
  const root = range.commonAncestorContainer;

  if (root instanceof Text) {
    return root.parentElement && root.parentElement.checkVisibility()
      ? [range]
      : [];
  }

  const { startContainer, endContainer, startOffset, endOffset } = range;

  /** @type {Range[]} */
  const visibleRanges = [];

  /** @type {Range|null} */
  let currentRange = null;

  /** @type {Text|null} */
  let lastTextNode = null;

  /** @type {Node|null} */
  const startNode =
    startContainer instanceof Text
      ? startContainer
      : startContainer.childNodes[startOffset];

  if (range.collapsed) {
    if (startNode instanceof Text) {
      return startNode.parentElement.checkVisibility() ? [range] : [];
    }
    return startNode.checkVisibility() ? [range] : [];
  }

  const startNodeOffset = startContainer instanceof Text ? startOffset : 0;

  const { endNode, excludeEnd } = (() => {
    if (endContainer instanceof Text) {
      return { endNode: endContainer, excludeEnd: false };
    }
    if (endOffset > 0) {
      return {
        endNode: endContainer.childNodes[endOffset - 1],
        excludeEnd: false,
      };
    }
    return {
      endNode: endContainer.childNodes[0],
      excludeEnd: true,
    };
  })();

  /**
   * Iterator is primed to complete the range after exiting the end node.
   * This is needed when the range ends on a node since its descendants are visited
   * **after** it.
   */
  let primeEnd = false;

  let rangeStarted = false;
  let rangeCompleted = false;

  function flushRange(node, offset) {
    if (!currentRange) return;
    // May not exist if there's no current range
    const [actualNode, actualOffset] = node
      ? [node, offset]
      : [lastTextNode, lastTextNode.data.length];
    currentRange.setEnd(actualNode, actualOffset);
    visibleRanges.push(currentRange);
    currentRange = null;
    lastTextNode = null;
  }

  const textNodeIterator = document.createTreeWalker(
    root,
    NodeFilter.SHOW_TEXT + NodeFilter.SHOW_ELEMENT,
    {
      acceptNode(node) {
        if (rangeCompleted) return NodeFilter.FILTER_REJECT;

        if (
          (primeEnd && !endNode.contains(node)) ||
          (excludeEnd && node === endNode)
        ) {
          flushRange();
          rangeCompleted = true;
        }

        const rejectNode = !!node.checkVisibility && !node.checkVisibility();
        if (rejectNode) {
          if (node.contains(startNode)) {
            rangeStarted = true;
          }
          if (node.contains(endNode)) {
            rangeCompleted = true;
          }
          flushRange();
          return NodeFilter.FILTER_REJECT;
        }

        if (node instanceof Text) {
          if (node === startNode) {
            rangeStarted = true;
            currentRange = new Range();
            currentRange.setStart(node, startNodeOffset);
          }

          if (!rangeStarted) return NodeFilter.FILTER_SKIP;

          if (node === endNode) {
            flushRange(
              endNode,
              node === endContainer ? endOffset : node.data.length
            );
            rangeCompleted = true;
            return NodeFilter.FILTER_REJECT;
          }

          if (!currentRange) {
            currentRange = new Range();
            currentRange.setStart(node, 0);
          }

          lastTextNode = node;
          return NodeFilter.FILTER_SKIP;
        }

        if (node === startNode) {
          rangeStarted = true;
        }

        if (node === endNode) {
          primeEnd = true;
        }

        return NodeFilter.FILTER_SKIP;
      },
    }
  );

  // Iterates over the complete tree since the filter never accepts a node
  textNodeIterator.nextNode();

  if (!rangeCompleted) {
    flushRange();
  }

  return visibleRanges;
}
