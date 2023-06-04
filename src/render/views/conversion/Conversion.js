import { onAllAnimationsEnd, onAllTransitionsEnd } from '@render/util';
import { searchValues, mapUnitTemplate } from './util';
import styles from './styles/Conversion.module.scss';
import Value from './Value';
import { useEffect, useRef, useState } from 'preact/hooks';

/**
 * An expandable and searchable popup that appears when the unit is hovered on the page.
 * @param {object} props
 * @param {Range} props.ange
 * @param {ValueVector<Unit>[]} props.values
 * @param {ValueVector<Unit>} props.inputValue
 * @param {ConversionRenderSettings<Unit>} props.renderSettings
 */
export function Conversion({
  range,
  values,
  inputValue,
  renderSettings: {
    unitTemplates,
    mainUnitID,
    secondaryUnitID,
    featuredUnitIDs,
    groups,
  },
}) {
  const bubble = useRef();
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [search, setSearch] = useState('');

  const topConversion = (() => {
    const topUnitID =
      inputValue.unit.id === mainUnitID ? secondaryUnitID : mainUnitID;
    return values.find((value) => value.unit.id === topUnitID);
  })();

  const [renderedConversions, setRenderedConversions] = useState(
    /** @type {ValueVector<Unit>[]} */ ([topConversion])
  );

  useEffect(() => {
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
    setRenderedConversions(expanded ? values : [topConversion]);
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

  /**
   * Map a `value` value to a {@link Value} component, mapping its `unit` to its 
   * {@link UnitConversionTemplate unit template}
   * 
   * Inlined.
   * @param {ValueVector<Unit>} value
   * @returns {preact.JSX.Element}
   */
  function Row({ unit, amount }) {
    return (
      <div className={styles.row}>
        <Value
          key={unit.id}
          amount={amount}
          expanded={expanded}
          {...mapUnitTemplate(unit, unitTemplates)}
        />
      </div>
    );
  }

  /**
   * Map a {@link UnitGroup group} of values to a wrapped set of elements.
   *
   * Inlined.
   * @param {ValueVector<Unit>[]} values
   * @param {string} [title]
   * @param {string} [key] Key incase of group arrays
   * @returns {preact.JSX.Element}
   */
  function Group(values, title = '', key = title) {
    return (
      <div key={key} className={styles.group}>
        {title ? <p className={styles.groupTitle}>{title}</p> : null}
        {values.map((value) => Row(value))}
      </div>
    );
  }

  /**
   * Create and return of values from an array IDs of units that
   * should be featured.
   * 
   * Inlined.
   * @param {Unit['id'][]} featuredUnitIDs
   * @param {ValueVector<Unit>[]} values
   * @returns {preact.JSX.Element}
   */
  function FeaturedUnits(featuredUnitIDs, values) {
    const featuredValues = values.filter(({ unit: { id } }) =>
      featuredUnitIDs.includes(id)
    );
    return Group(featuredValues, 'Favourites');
  }

  /**
   * Render {@link UnitGroup groups} of units according to the  the
   * passed {@link ConversionRenderSettings render settings} value.
   * @param {UnitGroup[]} groups
   * @param {ValueVector<Unit>[]} values
   * @returns {preact.JSX.Element[]}
   */
  function renderGroupArray(groups, values) {
    return groups
      .map(({ name, unitIDs }) => {
        return {
          name,
          values: unitIDs.map((id) =>
            values.find(({ unit }) => unit.id === id)
          ),
        };
      })
      .map(({ name, values }, i) =>
        Group(values, name, (name ?? '') + i)
      );
  }

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
            {!expanded || search
              ? Group(renderedConversions, '', 'search-results')
              : [
                  featuredUnitIDs.length
                    ? FeaturedUnits(featuredUnitIDs, values)
                    : null,
                  groups.length
                    ? renderGroupArray(groups, values)
                    : Group(values, '', 'all-units'),
                ]}
          </div>
        </div>
      ) : null}
    </div>
  );
}
