import React, { useEffect, useRef, useState } from 'react';

export default function RotatingImage({ images, interval = 1800, style }) {
  const [idx, setIdx] = useState(0);
  const [nextIdx, setNextIdx] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionClass, setTransitionClass] = useState('');
  const duration = 400; // ms for slide
  const timeoutRef = useRef();

  useEffect(() => {
    const id = setInterval(() => {
      const newIdx = (idx + 1) % images.length;
      setNextIdx(newIdx);
      setIsTransitioning(true);
      setTransitionClass(''); // Start with initial transforms
      requestAnimationFrame(() => {
        setTransitionClass('do-transition');
      });
      timeoutRef.current = setTimeout(() => {
        setIdx(newIdx);
        setNextIdx(null);
        setIsTransitioning(false);
        setTransitionClass('');
      }, duration);
    }, interval);
    return () => {
      clearInterval(id);
      clearTimeout(timeoutRef.current);
    };
  }, [images, interval, idx]);

  // CSS classes for transition (X axis only)
  // .rotating-img { ...base styles... }
  // .rotating-img.next { transform: translateX(100%); z-index:2; }
  // .rotating-img.current { transform: translateX(0); z-index:1; }
  // .rotating-img.do-transition.next { transform: translateX(0); }
  // .rotating-img.do-transition.current { transform: translateX(-100%); }

  const baseImgStyle = {
    position: 'absolute',
    width: '100%',
    maxWidth: 340,
    height: '100%',
    borderRadius: 12,
    boxShadow: '0 2px 12px #0001',
    objectFit: 'contain',
    top: 0,
    left: 0,
    transition: `transform ${duration}ms cubic-bezier(0.4,0,0.2,1)`,
    ...style,
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: 340,
        height: 280,
        minHeight: 120,
        overflow: 'hidden',
        background: '#fff',
      }}
    >
      <style>{`
        .rotating-img { will-change: transform; }
        .rotating-img.next { transform: translateX(100%); z-index:2; }
        .rotating-img.current { transform: translateX(0); z-index:1; }
        .rotating-img.do-transition.next { transform: translateX(0); }
        .rotating-img.do-transition.current { transform: translateX(-100%); }
      `}</style>
      {isTransitioning && nextIdx !== null && (
        <>
          <img
            key={`current-${idx}`}
            src={images[idx]}
            alt="Showcase example"
            className={`rotating-img current${transitionClass ? ' ' + transitionClass : ''}`}
            style={baseImgStyle}
          />
          <img
            key={`next-${nextIdx}`}
            src={images[nextIdx]}
            alt="Showcase example"
            className={`rotating-img next${transitionClass ? ' ' + transitionClass : ''}`}
            style={baseImgStyle}
          />
        </>
      )}
      {!isTransitioning && (
        <img
          key={`current-${idx}`}
          src={images[idx]}
          alt="Showcase example"
          style={{
            ...baseImgStyle,
            zIndex: 2,
            transform: 'translateX(0)',
          }}
        />
      )}
    </div>
  );
}
