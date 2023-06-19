/**
 * Get all text nodes that intersect with a range.
 * @param {Range} range 
 * @returns {Text[]}
 */
export default function getIntersectingTextNodes(range) {
  const root = range.commonAncestorContainer
  if (range.collapsed) return [];

  // Range contained in one text node == no other intersections
  if (root instanceof Text) return [root];

  const treeWalker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_TEXT,
    (node) =>
      range.intersectsNode(node)
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_REJECT
  );

  const nodes = [];
  let currentNode = treeWalker.currentNode;
  while ((currentNode = treeWalker.nextNode())) {
    nodes.push(currentNode);
  }

  return nodes;
}
