/**
 * @typedef {[node: Node, offset: number]} Position
 * @typedef {{start: Position[], end: Position[]}} CharPositions
 */

/** 
 * Currently, the 3rd and best iteration of on page string recognition and position mapping.
 * The key is using the Selection object's stringifier. 
 * 
 * Previously, ranges were used to stringify and map the indices of those strings, 
 * but ranges stringified nodes by returning their actual `data` property. Text nodes 
 * sometimes (but often enough to notice) contained hidden whitesapces that weren't 
 * rendered on screen. Sometimes within the same line or even splitting a word. This 
 * caused many supposed matches to get skipped, making the extension feel buggy and off.
 * 
 * In contrast, Selection.toString() returns the 'rendered text' [W3C - Selection API],
 * which thankfully ignores all those random whitespaces and also has the built in 
 * benefit of ignoring hidden text nodes like style and script elements (something that 
 * needed to accounted for in the previous iteration). Perfect right? There was just one 
 * caveat, mapping the output string, which isn't accessible with any other way to locations
 * in the document, to highlight the matches. 
 * 
 * The function below handles that task as elegantly as I could get it within a day and a bit
 * by traversing the input selection with a mini selection using Selection.modify() which, 
 * thankfully, closely (but not perfectly) matched the characters in the output string with each
 * step. The slight differences that do exist, mainly between element boundaries, are handled
 * by the function. 
 */

// The older iterations are still in this folder for posterity (and pride).

/**
 * Get the selection's string value and the DOM start/end positions of each of its
 * characters.
 * 
 * Uses selection manipulation and will cause selection change events to be queued.
 * @param {Selection} selection
 * @returns {{string: string, positions: CharPositions}}
 */
export default function mapSelectionIndices(selection) {
  const anchor = { node: selection.anchorNode, offset: selection.anchorOffset };
  const focus = { node: selection.focusNode, offset: selection.focusOffset };

  const backwards =
    (anchor.node === focus.node && anchor.offset > focus.offset) ||
    anchor.node.compareDocumentPosition(focus.node) ===
      Node.DOCUMENT_POSITION_PRECEDING;

  const selectionEnd = !backwards ? focus : anchor;

  const originalRange = selection.getRangeAt(0).cloneRange();

  const selectionString = selection.toString();

  /**
   * Track both start and end positions at each index.
   *
   * Selection edges at the same point represent their position differently.
   * For example, a forward selection wont end at the beginning of a text node (0 offset),
   * but at the end position at the end of the previous element/node. But a selection starting
   * at that same point will start at the beginning of the text node with an offset of 0.'
   *
   * Storing both edges overcomes this issue without resorting to more complex lookups.
   * @type {CharPositions}
   */
  const positions = {
    start: [],
    end: [],
  };

  /*
    Traverse the input selection with a 1 character extension width selection
    to get both edge positions.

    - Note: 1 char extension !== 1 char length. You can extend a selection by one
      'character' to highlight a character with a length > 1, i.e. 👨‍👩‍👧‍👦 (length: 11)
  */

  // Some selectable positions cant be reached by extending another selection
  let iterationsLeft = 4000; // AKA: To not ruin your day when you hit CTRL-A 🎵

  let currentEnd = { node: null, offset: null };

  let stringIndex = 0;
  selection.collapseToStart();
  do {
    selection.modify('extend', 'forward', 'character');

    const currentChar = selection.toString();
    if (
      currentChar ===
        selectionString.slice(stringIndex, stringIndex + currentChar.length) ||
      // Selection string rep. at element boundaries change if it starts at a text node or not
      // i.e. Sometimes between elements, currentChar: \t\n, selectionString: \n
      [currentChar, selectionString[stringIndex]].every((c) => c.match(/\s+/))
    ) {
      const start = [selection.anchorNode, selection.anchorOffset];
      const end =
        selection.focusNode instanceof Text
          ? [selection.focusNode, selection.focusOffset]
          : positions.end.at(-1); // Always end in text nodes

      positions.start.push(...Array(currentChar.length).fill(start));
      positions.end.push(...Array(currentChar.length).fill(end));

      stringIndex += currentChar.length;
    }

    // Some elements stop incoming extending selections from entering them (or extending any further)
    // like Select elements (weirdly ironic). They can be selected over/around with a mouse 
    // and their rendered text is included in the selection's string value. So for this extension
    // just stop indexing and let intuitive users make new selections past the point where there are no 
    // conversions. 
    if (
      currentEnd.node &&
      selection.focusNode === currentEnd.node &&
      selection.focusOffset === currentEnd.offset
    ) {
      break;
    }

    currentEnd = { node: selection.focusNode, offset: selection.focusOffset };
    selection.modify('move', 'forward', 'character');
    iterationsLeft--;
  } while (
    stringIndex < selectionString.length &&
    !(
      selection.focusNode === selectionEnd.node &&
      selection.focusOffset === selectionEnd.offset
    ) &&
    iterationsLeft >= 0
  );

  selection.removeAllRanges();
  selection.addRange(originalRange);

  return {
    string: selectionString,
    positions: { start: positions.start, end: positions.end },
  };
}
