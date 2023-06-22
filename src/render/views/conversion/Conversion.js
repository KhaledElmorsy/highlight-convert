import { onAllAnimationsEnd, onAllTransitionsEnd } from '@render/util';
import { searchValues, mapUnitTemplate, getStackingContext } from './util';
import styles from './styles/Conversion.module.scss';
import Value from './Value';
import { useEffect, useRef, useState, useLayoutEffect } from 'preact/hooks';
import { isEmptyObject } from '@util/misc';

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
  passBubbleSize,
  renderSettings: {
    unitTemplates,
    mainUnitID,
    secondaryUnitID,
    featuredUnitIDs,
    groups,
  },
}) {
  const bubble = useRef();
  const hiddenContainerRef = useRef();
  const hoverAreaRef = useRef();
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [search, setSearch] = useState('');
  const [autoBubbleSize, setAutoBubbleSize] = useState({});

  const [stackingPosition] = useState(() => {
    const { zIndex, isFixed } = getStackingContext(range.startContainer);
    return {
      zIndex: zIndex === 'auto' ? 'auto' : parseInt(zIndex) + 1,
      position: isFixed ? 'fixed' : 'absolute',
    };
  });

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

  /**
   * Calculate the size and position, relative to the document, of a range.
   * @returns {{[prop in "width"|"height"|"top"|"left"]:string}}
   */
  function getRangeRect() {
    const { top, left, width, height } = range.getBoundingClientRect();
    return {
      width,
      height,
      top: top + window.scrollY,
      left: left + window.scrollX,
    };
  }

  const [containerRect, setContainerRect] = useState(getRangeRect());

  // Poll value range position & size and update the container on change.
  useEffect(() => {
    const containerRectPoll = setInterval(() => {
      setContainerRect((prev) => {
        const currentRect = getRangeRect();
        const isSameRect = JSON.stringify(prev) === JSON.stringify(currentRect);
        return isSameRect ? prev : currentRect;
      });
    }, 100);
    return () => clearInterval(containerRectPoll);
  }, []);

  const tempSize = useRef({});
  useLayoutEffect(() => {
    if (!passBubbleSize) return;

    setVisible(true);
    if (visible && !expanded) {
      tempSize.current.initialWidth = window.getComputedStyle(
        bubble.current
      ).width;
      setExpanded(true);
    }
    if (expanded) {
      passBubbleSize({
        expandedHeight: window.getComputedStyle(bubble.current).height,
        expandedWidth: window.getComputedStyle(bubble.current).width,
        initialWidth: tempSize.current.initialWidth,
      });
    }
  }, [expanded, visible]);

  const defaultBubbleSize = {
    '--initialWidth': 'auto',
    '--expandedWidth': 'auto',
    '--expandedHeight': 'auto',
  };

  const [bubblePosition, setBubblePosition] = useState({});
  const [bubbleSize, setBubbleSize] = useState(defaultBubbleSize);

  useLayoutEffect(() => {
    if (isEmptyObject(autoBubbleSize) || passBubbleSize) return;
    const { expandedWidth, initialWidth, expandedHeight } = autoBubbleSize;

    setBubbleSize({
      '--expandedHeight': expandedHeight,
      '--expandedWidth': expandedWidth,
      '--initialWidth': initialWidth,
    });

    // Ensure that the bubble doesn't overflow the document edges
    const container = { ...containerRect };
    container.right = container.left + container.width;
    const center = container.left + container.width / 2;

    const docWidth = ((dS = window.getComputedStyle(document.body)) => {
      const { width, paddingRight, marginRight, paddingLeft, marginLeft } = dS;
      return [width, paddingRight, marginRight, paddingLeft, marginLeft]
        .map(parseFloat)
        .reduce((sum, length) => sum + length);
    })();

    const bubbleWidth = parseFloat(expandedWidth);
    const bubbleHeight = parseFloat(expandedHeight);

    const edgeDistance = 10;

    const position = {};
    if (container.top < bubbleHeight + edgeDistance) position.top = '150%';

    if (center < bubbleWidth / 2 + edgeDistance) {
      position.left = -container.left + edgeDistance;
    }

    if (center + bubbleWidth / 2 > docWidth - edgeDistance) {
      position.right = -(docWidth - container.right) + edgeDistance;
    }
    setBubblePosition(position);
  }, [autoBubbleSize]);

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
      .map(({ name, values }, i) => Group(values, name, (name ?? '') + i));
  }

  /**
   * Disable pointer events on the hover area for a set duration on middle-click.
   * @param {MouseEvent} event
   */
  function toggleClickThrough(event) {
    if (event.button !== 1) return;
    event.preventDefault();
    hoverAreaRef.current.style.pointerEvents = 'none';
    setTimeout(() => {
      if (!hoverAreaRef.current) return;
      hoverAreaRef.current.style.pointerEvents = 'all';
    }, 4000);
  }

  return (
    <div
      className={styles.container}
      style={{ ...containerRect, ...stackingPosition }}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={hideBubble}
    >
      {visible && !passBubbleSize && isEmptyObject(autoBubbleSize) ? (
        <div className={styles.hiddenContainer} ref={hiddenContainerRef}>
          <Conversion {...arguments[0]} passBubbleSize={setAutoBubbleSize} />
        </div>
      ) : null}
      <div
        className={`${styles.hoverArea} ${
          visible ? styles.extendedArea : null
        }`}
        style={hoverExtensionPosition}
        onMouseDown={toggleClickThrough}
        ref={hoverAreaRef}
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
