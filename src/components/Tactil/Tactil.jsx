import { useState, useEffect } from 'react';

const Tactil = ({ onGesture }) => {
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [endX, setEndX] = useState(0);
  const [endY, setEndY] = useState(0);

  useEffect(() => {
    const handleTouchStart = (event) => {
      setStartX(event.touches[0].clientX);
      setStartY(event.touches[0].clientY);
    };

    const handleTouchEnd = (event) => {
      setEndX(event.changedTouches[0].clientX);
      setEndY(event.changedTouches[0].clientY);
      handleGesture();
    };

    const handleGesture = () => {
      const dx = endX - startX;
      const dy = endY - startY;

      if (Math.abs(dx) > Math.abs(dy)) {
        // Movimiento horizontal
        if (dx > 0) {
          onGesture('right');
        } else {
          onGesture('left');
        }
      } else {
        // Movimiento vertical
        if (dy > 0) {
          onGesture('down');
        } else {
          onGesture('up');
        }
      }
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onGesture, startX, startY, endX, endY]);

  return null; // No se renderiza nada en el componente Tactil
};

export default Tactil;