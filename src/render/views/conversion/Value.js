import styles from './styles/Value.module.scss';

/**
 * Displays the amount, id, and optional name & symbol of a value.
 * @param {Value<any>} value
 */
export default function Value({ amount, title, subtitle }) {
  const amountNum = {
    compact: Intl.NumberFormat('en', { notation: 'compact' }).format(amount),
    regular: Intl.NumberFormat('en').format(amount),
  };

  return (
    <div className={styles.valueContainer}>
      <span className={styles.amount} title={amountNum.regular}>
        {amountNum.compact}
      </span>
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
