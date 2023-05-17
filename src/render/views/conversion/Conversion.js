import { onAllAnimationsEnd, onAllTransitionsEnd } from '@render/util';
import { searchValues } from './util';
import styles from './styles/Conversion.module.scss';
import Value from './Value';
import { useEffect, useRef, useState } from 'preact/hooks';

/**
 * An expandable and searchable popup that appears when the unit is hovered on the page.
 * @param {Range} range
 * @param {Value[]} values
 * @param {Value<any>} defaultValue
 */
export function Conversion({ range, values }) {
  const bubble = useRef();
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [search, setSearch] = useState('');
  const [renderedConversions, setRenderedConversions] = useState([values[0]]);

  useEffect(() => {
    if (!expanded) return;
    setRenderedConversions(
      search === '' ? values : searchValues(values, search)
    );
  }, [search]);

  /** @param {MouseEvent} e */
  function expand(e) {
    if (e.button !== 0) return;
    setExpanded(true);
    e.preventDefault(); // Don't remove the user's selection
  }

  // Render all conversions when expanded
  useEffect(() => {
    setRenderedConversions(expanded ? values : [values[0]]);
  }, [expanded]);

  // Reset after hiding
  useEffect(() => {
    if (visible) return;
    setExpanded(false);
    setSearch('');
  }, [visible]);

  /** Animate the bubble out then remove it */
  function hideBubble() {
    if (!bubble.current) return;
    onAllAnimationsEnd(bubble.current, () => setVisible(false));
    bubble.current.classList.add(styles.out);
  }

  useEffect(() => {
    /** Emulate a timed query that resets after typing stops  */
    const quickType = (function () {
      let query = '';
      let captureTimeout;
      /** @param {KeyboardEvent} e */
      return function (e) {
        clearTimeout(captureTimeout);
        captureTimeout = setTimeout(() => (query = ''), 500);
        if (!/^([a-z0-9\s]|Backspace)$/i.test(e.key)) return;
        e.preventDefault();
        switch (e.key) {
          case 'Backspace':
            setSearch((query = ''));
            break;
          default:
            setSearch((query += e.key));
        }
      };
    })();
    if (expanded) document.addEventListener('keydown', quickType);
    const reset = () => document.removeEventListener('keydown', quickType);
    if (!visible) reset(); // Bubble goes from: Compact -> Expanded -> Hidden
    return reset;
  }, [expanded, visible]);

  // Bubble width is animated with max-width to allow for adaptive sizing.
  // First its max-width is set to the expanded width, then the resulting width
  // replaces it to act as pre-expansion starting width.
  useEffect(() => {
    if (!visible) return;
    onAllAnimationsEnd(bubble.current, () => {
      const { width } = bubble.current.getBoundingClientRect();
      bubble.current.style.setProperty('--initWidth', width + 'px');
    });
  }, [visible]);

  // Stabilize the auto calculated post-expansion width to avoid changes when
  // conversions are filtered to thinner results when searching
  useEffect(() => {
    if (!expanded) return;
    onAllTransitionsEnd(bubble.current, () => {
      const { width } = bubble.current.getBoundingClientRect();
      bubble.current.style.width = width + 'px';
    });
  }, [expanded]);

  // Get the size extents of the match range to render the hover area and bubble relative to it
  const rangeExtents = (({ top, left, width, height }) => ({
    width,
    height,
    top: top + window.scrollY,
    left: left + window.scrollX,
  }))(range.getBoundingClientRect());

  /** Max size */
  const bubbleSize = {
    ['--expandedWidth']: '300px',
    ['--expandedHeight']: '200px',
  };

  // Ensure that the bubble doesn't clip through the document edges
  const bubblePosition = (({ top, left, width }) => {
    const center = left + width / 2;
    const [bblWidth, bblHeight] = Object.values(bubbleSize).map(parseFloat);
    const docW = parseFloat(window.getComputedStyle(document.body));
    return {
      ...(center < bblWidth / 2 ? { left: -left + 10 } : {}),
      ...(center + bblWidth / 2 > docW ? { right: right - docW + 10 } : {}),
      ...(top < bblHeight + 20 ? { top: '150%' } : {}),
    };
  })(rangeExtents);

  const hoverExtensionPosition =
    bubblePosition.top !== undefined ? { '--top': 0 } : { '--bottom': 0 };

  return (
    <div
      className={styles.container}
      style={{ ...rangeExtents }}
      onMouseEnter={() => setVisible(true)}
      // onMouseLeave={hideBubble}
    >
      <div
        className={`${styles.hoverArea} ${
          visible ? styles.extendedArea : null
        }`}
        style={hoverExtensionPosition}
      ></div>
      {visible ? (
        <div
          style={{ ...bubblePosition, ...bubbleSize }}
          className={`${styles.bubble} ${expanded ? styles.expanded : ''}`}
          ref={bubble}
          onMouseDown={expand}
        >
          {search && expanded ? (
            <p className={styles.search}>{search}</p>
          ) : null}
          <div className={styles.conversions}>
            {renderedConversions.map((v) => (
              <Value {...v} />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
