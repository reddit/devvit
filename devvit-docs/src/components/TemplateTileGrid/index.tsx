import React from 'react';

import styles from './styles.module.css';

export default function TemplateTileGrid({ children }): JSX.Element {
  return <div className={styles.grid}>{children}</div>;
}
