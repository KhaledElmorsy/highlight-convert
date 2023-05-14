import styles from './styles/value.module.scss';

/**
 * @param {Value<any>} value
 */
export default function Value({
  amount,
  unit: {
    name,
    id,
    symbol: { image, alt },
  },
}) {
  const amountNum = {
    compact: Intl.NumberFormat('en', { notation: 'compact' }).format(amount),
    regular: Intl.NumberFormat('en').format(amount),
  };

  const renderedName = name ?? id;

  return (
    <div className={styles.valueContainer}>
      <span className={styles.amount} title={amountNum.regular}>
        {amountNum.compact}
      </span>
      <div className={styles.nameContainer}>
        <span className={styles.alt}>{alt}</span>
        <span className={styles.name} tile={renderedName}>
          {renderedName}
        </span>
      </div>
    </div>
  );
}
