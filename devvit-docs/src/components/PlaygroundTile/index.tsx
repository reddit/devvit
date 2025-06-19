import React from 'react';

import ExpandIcon from '../../../docs/assets/icons/icon-expand-right-outline.svg';
import styles from './styles.module.css';

export default function PlaygroundTile({
  name = 'Unnamed',
  author = 'username',
  link,
  image,
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
            <p className={styles.byline}>{`By ${author}`}</p>
          </div>

          {/* Expand Icon */}
          <div className={styles.icon}>
            <ExpandIcon />
          </div>
        </div>
      </div>
    </a>
  );
}
