import styles from './styles/Conversion.module.scss';
import Value from './Value';
import { useEffect, useRef, useState } from 'preact/hooks';

/**
 *
 * @param {Range} range
 * @param {Value[]} values
 * @param {Value<any>} defaultValue
 */
export function Conversion({ range, conversion }) {
  const bubble = useRef();
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState('');

  function hideBubble() {
    const b = bubble.current;
    if (!b) return;

    let removed;
    function remove() {
      if (removed) return;
      setVisible(false);
      removed = true;
    }

    b.ontransitionend = remove;
    setTimeout(() => {
      if (bubble.current.classList.contains(styles.out)) {
        remove();
      }
    }, 1000);

    b.classList.add(styles.out);
  }

  const containerArea = (({ top, left, width, height }) => ({
    width,
    height,
    top: top + window.scrollY,
    left: left + window.scrollX,
  }))(range.getBoundingClientRect());

  function expand(e) {
    if (e.button !== 0) return;
    bubble.current.classList.add(styles.expanded);
    e.preventDefault();
  }

  const bubbleSize = {
    ['--expandedWidth']: '300px',
    ['--expandedHeight']: '220px',
  };

  const bubblePosition = (({ top, left, width }) => {
    const right = left + width;
    const [bblWidth, bblHeight] = Object.values(bubbleSize).map(parseFloat);

    let { width: docW, height: docH } = window.getComputedStyle(document.body);
    [docW, docH] = [docW, docH].map(parseFloat);

    return {
      ...(left < bblWidth/2 ? { left: -left + 10 } : {}),
      ...(right + bblWidth/2 > docW ? { right: docW - right + 10 } : {}),
      ...(top < bblHeight + 20 ? { top: '150%' } : {}),
    };
  })(containerArea);

  return (
    <div
      className={styles.container}
      style={{ ...containerArea }}
      onMouseEnter={() => setVisible(true)}
      // onMouseLeave={() => hideBubble()}
    >
      <div
        className={`${styles.hoverArea} ${
          visible ? styles.extendedArea : null
        }`}
      ></div>
      {visible ? (
        <div
          style={{...bubblePosition, ...bubbleSize}}
          className={`${styles.bubble} ${styles.translated}`}
          ref={bubble}
          onMouseDown={expand}
        >
          <div className={styles.conversions}>
            {conversion.map((v) => (
              <Value {...v} />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
