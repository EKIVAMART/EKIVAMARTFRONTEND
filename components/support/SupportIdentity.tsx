import FluidOrb from '@/components/ui/fluid-orb';
import styles from '@/app/support/support.module.css';

export default function SupportIdentity() {
  return (
    <div className={styles.identity}>
      <FluidOrb size={36} color="#22643e" aria-hidden="true" />
      <span>EkivaMart support</span>
    </div>
  );
}
