import React from 'react';

import styles from './styles.module.css';

export default function IconTileGrid({ children }): JSX.Element {
  return <div className={styles.container}>{children}</div>;
}
