import styles from '@styles/BrandSignature.module.css';
import OmniFlowMark from './OmniFlowMark';

export default function BrandSignature({
  theme = 'light',
  size = 'md',
  subtitle = 'Operational clarity for every task.',
  compact = false,
  align = 'left',
  badge = 'Task orchestration platform',
}) {
  const classNames = [
    styles.brand,
    styles[`theme${theme.charAt(0).toUpperCase()}${theme.slice(1)}`],
    styles[`size${size.toUpperCase()}`],
    compact ? styles.compact : '',
    align === 'center' ? styles.alignCenter : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classNames}>
      <div className={styles.markWrap}>
        <OmniFlowMark className={styles.mark} />
      </div>

      <div className={styles.copy}>
        {badge ? <span className={styles.badge}>{badge}</span> : null}
        <h1 className={styles.wordmark}>
          <span className={styles.wordOmni}>Omni</span>
          <span className={styles.wordFlow}>Flow</span>
        </h1>
        {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
      </div>
    </div>
  );
}
