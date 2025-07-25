import React from 'react';

/**
 * IntroTilePanel - a reusable two-tile panel for intro pages.
 * @param {Array} tiles - Array of tile configs: { image, alt, title, href, background, textColor, imageSide ('left'|'right'), ariaLabel }
 * @param {string|number} gap - CSS gap between tiles (default: '2.5rem')
 */
export default function IntroTilePanel({ tiles, gap = '2.5rem' }) {
  return (
    <div style={{ padding: '0 2.5vw' }}>
      <div className="row" style={{ marginBottom: '1.5rem', gap, display: 'flex' }}>
        {tiles.map((tile, i) => {
          const isImageLeft = tile.imageSide === 'left';
          return (
            <a
              key={tile.title}
              href={tile.href}
              style={{ textDecoration: 'none', color: 'inherit', flex: 1 }}
              aria-label={tile.ariaLabel || `Go to ${tile.title}`}
            >
              <div
                className={`col col--6 themed-col themed-col--${tile.title.toLowerCase().replace(/\s/g, '')}`}
                style={{
                  position: 'relative',
                  background: tile.background,
                  borderRadius: 12,
                  overflow: 'hidden',
                  minHeight: 150,
                  maxHeight: 150,
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  padding: '1.2rem',
                  maxWidth: '100%',
                }}
              >
                {isImageLeft && (
                  <img
                    src={tile.image}
                    alt={tile.alt || tile.title}
                    style={{
                      position: 'relative',
                      width: 110,
                      height: 110,
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain',
                      opacity: 0.8,
                      zIndex: 1,
                      borderRadius: 12,
                      marginRight: '1.5rem',
                      background: 'none',
                      ...(tile.imageFlip ? { transform: 'scaleX(-1)' } : {}),
                      display: 'block',
                      margin: 'auto',
                    }}
                  />
                )}
                <h2
                  style={{
                    position: 'relative',
                    zIndex: 2,
                    color: tile.textColor,
                    fontWeight: 'bold',
                    fontSize: 'clamp(1.1rem, 2vw, 2rem)',
                    borderRadius: 8,
                    padding: '0.5em 1em',
                    display: 'inline-block',
                    maxWidth: 320,
                    width: '100%',
                    textAlign: tile.textAlign || (isImageLeft ? 'right' : 'left'),
                    margin: 0,
                    ...(isImageLeft ? { marginRight: '1.5rem' } : { marginLeft: '1.5rem' }),
                    background: 'none',
                    overflow: 'hidden',
                    whiteSpace: 'normal',
                  }}
                >
                  {tile.title}
                </h2>
                {!isImageLeft && (
                  <img
                    src={tile.image}
                    alt={tile.alt || tile.title}
                    style={{
                      position: 'relative',
                      width: 110,
                      height: 110,
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain',
                      opacity: 0.8,
                      zIndex: 1,
                      borderRadius: 12,
                      marginLeft: '1.5rem',
                      background: 'none',
                      ...(tile.imageFlip ? { transform: 'scaleX(-1)' } : {}),
                      display: 'block',
                      margin: 'auto',
                    }}
                  />
                )}
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
