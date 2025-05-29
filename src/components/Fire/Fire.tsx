import type React from 'react';

import styles from './Fire.module.scss';

const Fire: React.FC = () => {
  return (
    <div className={styles.fire}>
      <div className={styles.fire__flame}></div>
      <div className={styles.fire__flame}></div>
      <div className={styles.fire__flame}></div>
      <div className={styles.fire__flame}></div>
    </div>
  );
};

export default Fire;
