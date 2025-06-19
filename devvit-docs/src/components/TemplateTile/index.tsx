import React from 'react';

import styles from './styles.module.css';

export default function TemaplteTile({
  name = 'unnamed',
  description = 'no description',
  image,
  link,
}): JSX.Element {
  return (
    <a href={link} target="_blank" className={styles.link}>
      <div className={styles.wrapper}>
        {/* Thumbnail */}
        <img src={image} alt={name} className={styles.thumbnail} />

        {/* Footer */}
        <div className={styles.footer}>
          {/* Text */}
          <div className={styles.content}>
            <h4 className={styles.title}>{name}</h4>
            <p className={styles.byline}>{description}</p>
          </div>
        </div>
      </div>
    </a>
  );
}
