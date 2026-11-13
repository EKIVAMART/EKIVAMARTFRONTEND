import styles from './product-row-skeleton.module.css';

export default function ProductRowSkeleton() {
  return Array.from({ length: 6 }, (_, index) => (
    <div key={index} aria-hidden="true" className={`ek-product-card ${styles.card}`} data-product-skeleton>
      <div className={styles.image} />
      <div className={styles.name}><span /><span /></div>
      <div className={styles.price} />
      <div className={styles.rating} />
      <div className={styles.details}><span /><span /></div>
      <div className={styles.action} />
    </div>
  ));
}
