/**
 * Another iteration towards fast, accurate and complete selection mapping. The
 * previous approach (deprecated-../mapSelectionIndices) utilized selection
 * manipulation (extending and moving with selection.modify) to traverse and map
 * the selection in a way that's consistent with the selection api's native view
 * of the document (only visible characters, no trimmed whitespaces or hidden nodes).
 *
 * This had two caveats:
 * 1- Minor: Some elements stopped selections from extending into or around them.
 *    They could only be selected around with a mouse (or manually setting positions).
 *    This was left unhandled since users can easily intuit around it.
 * 2- Breaking: Manipulating selections for up to thousands of characters queued up
 *    thousands of selection change events to get dispatched after after the task
 *    completed. Luckily, testing large selections on a weak-ish laptop from 2016, I noticed
 *    that even with no selection change listeners, dispatching thousands of UI event tasks
 *    locked up the event loop for several seconds. They were all separate tasks so 
 *    rendering wasn't affected, but running JS was a no go until all the events were dispatched.
 *
 *  After trying (and failing) to stop these events from entering the task queue or
 *  removing them from the task queue, I resigned myself to stepping away from
 *  selection manipulation and instead implemented this hybrid selection/range approach
 *  marrying the selection method and the method I used before that (2. in deprecated/)
 *  of traversing visible nodes using a tree walker (that's where the similarity ends).
 */

/**
 * This approach uses the selection's one of a kind stringifier to get the **rendered**
 * selected text on screen, then traverses visible nodes intersecting with the selection
 * to match each character in the rendered string to the location of its counterpart in the DOM.
 *
 * This is needed because the only inconsistencies between text node values and the rendered
 * text are unintuitive whitespaces/new-lines that exist in the source HTML.
 * Looking at an unedited excerpt from the source HTML of a random MDN page [1],
 * lines are broken and indented in a "legible" way, but disregard the ongoing text nodes
 * that span and include these breaks. Text nodes that are ambivalent to HTML lines except by adding a "\n".
 * While this practice leads to pretty HTML files, that read well and are easy to edit, all while not
 * affecting the final rendered page, they still leak incorrect data into the DOM, in the node values,
 * in the form of those extra whitespace characters [1].
 *
 * These can and should be processed out before shipping but I've encountered them enough times
 * (mainly on article based websites) to have to handle them properly for this extension since
 * they can break unit labels, and amounts i.e. 'US \nDollar' or '100 \n kg' casuing false negatives.
 * 
 *
 * These whitespaces are the only characters that are removed by the selection stringifier,
 * so the concatenated value of all visible text nodes in a selection will the same as the
 * selection string + extra whitespaces. So, we can parse through both, matching characters in
 * one set to their counterpart in the other, and skipping over whitespace characters in the node values 
 * with no counterparts in the rendered text.
 *
 * Finally, the selection stringifier adds new lines when crossing block elements, so we
 * need to account for that too by checking if the next character in the string is a new-line
 * when we iterate over a non-text node.
 *
 * P.S. The reason we can't just remove all new-lines is that we need rendered ones to
 * avoid false positives and/or unrelateed units/amounts being matched together. Also, the issue doesn't
 * only add new-lines, but spaces and tabs that are in the HTML files [1] which also aren't
 * necessarily rendered, but can break the extension's matching.
 */

/**
 * @typedef {{node: Node, offset: number}} Location
 */

/**
 * @typedef MappedSelection
 * @prop {string} string Stringified value of the current selection.
 *
 * Contains only **rendered** text. Hidden nodes, *trimmed whitespaces*, etc aren't
 * included.
 * @prop {Location[]} locations DOM position of each character in the string, mapped on indices.
 */

/**
 * @param {Text} node
 * @param {string} targetString
 * @param {number} targetIndex Index in the target string to start at. Better than slicing 
 * the target string each time we map a node.
 * @param {number} [offset = 0]
 * @returns {Location[]}
 */
function mapTextNode(node, targetString, targetIndex, offset = 0) {
  const nodeText = node.data;
  const locations = [];
  for (let i = offset; i < nodeText.length; i++) {
    if (nodeText[i] === targetString[targetIndex]) {
      locations.push({ node, offset: i });
      targetIndex++;
    }
    if (locations.length === targetString.length) break;
  }
  return locations;
}

/**
 * Stringify the current selection and map the string's characters to locations
 * in the document.
 *
 * Locations are contained in text nodes and are defined by the node and the inner
 * offset in its string value, `textNode.data`.
 * @param {Selection} selection
 * @returns {MappedSelection}
 */
export default function mapSelection(selection) {
  const string = selection.toString();

  const range = selection.getRangeAt(0);
  const { startContainer, startOffset } = range;

  const root = range.commonAncestorContainer;

  // Selection range is contained in one node.
  if (root instanceof Text) {
    return {
      string,
      locations: mapTextNode(root, string, 0, startOffset),
    };
  }

  /** @type {Location[]} */
  const locations = [];

  let started = false;
  let ended = false;
  let currentIndex = 0;

  const treeWalker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_TEXT + NodeFilter.SHOW_ELEMENT,
    {
      acceptNode(node) {
        if (ended || (node.checkVisibility && !node.checkVisibility())) {
          return NodeFilter.FILTER_REJECT;
        }

        if (node === startContainer) {
          started = true;
        }

        if (!started) return NodeFilter.FILTER_SKIP;

        const desiredChar = string[currentIndex];
        if (node instanceof Text) {
          const offset = node === startContainer ? startOffset : 0;
          const nodeLocations = mapTextNode(node, string, currentIndex, offset);
          locations.push(...nodeLocations);
          currentIndex += nodeLocations.length;
        } else {
          if (/\s/.test(desiredChar)) {
            locations.push(locations.at(-1));
            currentIndex++;
          }
        }

        if (currentIndex === string.length) {
          ended = true;
        }

        return NodeFilter.FILTER_SKIP;
      },
    }
  );

  // Node filter never accepts a node, so it traverses the whole tree with one iteration.
  treeWalker.nextNode();

  return { string, locations };
}

/*
[1]: MDN: TaskSignal - [https://developer.mozilla.org/en-US/docs/Web/API/TaskSignal]
<p>
  An object of this type is created, and associated with, a <a href="/en-US/docs/Web/API/TaskController"><code>TaskController</code></a>.
  The initial priority of the signal may be set by specifying it as an argument to the <a href="/en-US/docs/Web/API/TaskController/TaskController"><code>TaskController</code> constructor</a> (by default it is <code>"user-visible"</code>).
  The priority can be changed by calling <a href="/en-US/docs/Web/API/TaskController/setPriority"><code>TaskController.setPriority()</code></a> on the controller.
</p>
<p>
  The signal may be passed as the <code>options.signal</code> argument in <a href="/en-US/docs/Web/API/Scheduler/postTask"><code>Scheduler.postTask()</code></a>, after which it's associated controller can be used to abort the task.
  If the <a href="/en-US/docs/Web/API/Prioritized_Task_Scheduling_API#mutable_and_immutable_task_priority">task priority is mutable</a>, the controller can also be used to change the task's priority.
  Abortable tasks that do not need the priority to change may instead specify an <a href="/en-US/docs/Web/API/AbortSignal"><code>AbortSignal</code></a> as the <code>options.signal</code> argument.
</p>
*/
/*
   Looking at the end of the lines, notice how text nodes contain the line breaks
   and indentations between the lines. 
   
   While these new new-lines and spaces/tabs aren't rendered, they leak into the
   text node values, making a naïve parsing approach, inaccurate.

   For example, the string value of the text node starting at the period at the end of the first line is:
   '.\n  The initial priority of the signal may be set by specifying it as an argument to the '
   
   What's actually rendered is:
   '. The initial priority of the signal may be set by specifying it as an argument to the'

   If those extra whitespace characters cut off a unit/amount, that's a false negative.
*/
