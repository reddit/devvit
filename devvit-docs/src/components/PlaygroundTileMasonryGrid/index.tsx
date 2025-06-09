import React from 'react';

import styles from './styles.module.css';

export default function PlaygroundTileMasonryGrid({ children }): JSX.Element {
  return <div className={styles.grid}>{children}</div>;
}
