import styles from './styles/Value.module.scss';

/**
 * Displays the amount, id, and optional name & symbol of a value.
 * @param {Value<any>} value
 */
export default function Value({
  amount,
  unit: {
    name,
    id,
    symbol: { alt },
  },
}) {
  const amountNum = {
    compact: Intl.NumberFormat('en', { notation: 'compact' }).format(amount),
    regular: Intl.NumberFormat('en').format(amount),
  };

  const hasName = name !== undefined;

  return (
    <div className={styles.valueContainer}>
      <span className={styles.amount} title={amountNum.regular}>
        {amountNum.compact}
      </span>
      <div className={styles.nameContainer}>
        <span className={styles.alt}>{alt}</span>
        <span className={styles.name} title={hasName ? `${name} - ${id}` : id}>
          {hasName ? (
            <>
              {name} <span className={styles.subtitle}>{id}</span>
            </>
          ) : (
            id
          )}
        </span>
      </div>
    </div>
  );
}
