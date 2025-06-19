import React from 'react';

import styles from './styles.module.css';

export default function IconTile({ name = 'unnamed', children }): JSX.Element {
  return (
    <div className={styles.container}>
      <ul className={styles.icons}>
        {children.map((child) => (
          <li className={styles.icon}>{child}</li>
        ))}
      </ul>
      <p className={styles.name}>{name}</p>
    </div>
  );
}
