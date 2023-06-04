import styles from './styles/Value.module.scss';

/**
 * Displays the amount, id, and optional name & symbol of a value.
 * @param {Value<any>} value
 */
export default function Value({ amount, title, subtitle, expanded }) {
  const formattedAmount = {
    compact: Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumSignificantDigits: 3,
      maximumFractionDigits: 2,
    }).format(amount),

    hundredth: Intl.NumberFormat('en-US', {
      maximumFractionDigits: 3,
    }).format(amount),

    regular: Intl.NumberFormat('en-US', {
      maximumSignificantDigits: 5,
    }).format(amount),

    scientific: Intl.NumberFormat('en-US', {
      maximumSignificantDigits: 2,
      notation: 'scientific',
    }).format(amount),

    large: Intl.NumberFormat('en-US', {
      maximumFractionDigits: 0,
    }).format(amount),
  };

  const renderedAmount = (() => {
    switch (true) {
      case Math.abs(amount) < 0.01:
        return formattedAmount.scientific;
      case Math.abs(amount) < 0.1:
        return formattedAmount.hundredth;
      default:
        return formattedAmount.compact;
    }
  })();

  const amountTooltip = (() => {
    switch (true) {
      case Math.abs(amount) >= 100000:
        return formattedAmount.large;
      default:
        return formattedAmount.regular;
    }
  })();

  return (
    <div
      className={`${styles.valueContainer} ${expanded ? styles.expanded : ''}`}
    >
      <div className={styles.amountContainer}>
        <span className={styles.amount} title={amountTooltip}>
          {renderedAmount}
        </span>
      </div>
      <div className={styles.nameContainer}>
        <span className={styles.name} title={title}>
          {title}
          {subtitle ? (
            <span className={styles.subtitle}>{subtitle}</span>
          ) : null}
        </span>
      </div>
    </div>
  );
}
