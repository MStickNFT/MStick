import { useState, useRef, useEffect } from 'react';

const DraggableWindow = ({ title, children, onClose, onMinimize, onMaximize, isMaximized, initialPosition, style }) => {
  const [position, setPosition] = useState(initialPosition || { x: 100, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({ startX: 0, startY: 0, initialX: 0, initialY: 0 });

  const handleMouseDown = (e) => {
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: position.x,
      initialY: position.y
    };
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      setPosition({
        x: dragRef.current.initialX + dx,
        y: dragRef.current.initialY + dy
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, position]);

  const customZIndex = style?.zIndex;
  const computedZIndex = customZIndex !== undefined ? customZIndex : (isMaximized || isDragging ? 100 : 10);

  const windowStyle = isMaximized 
    ? { ...style, top: 0, left: 0, width: '100vw', height: 'calc(100vh - 35px)', zIndex: computedZIndex }
    : { ...style, left: `${position.x}px`, top: `${position.y}px`, zIndex: computedZIndex };

  return (
    <div className="win95-window" style={{ position: 'absolute', ...windowStyle }}>
      <div className="win95-titlebar" onMouseDown={!isMaximized ? handleMouseDown : undefined} style={{ cursor: (!isMaximized && isDragging) ? 'grabbing' : (!isMaximized ? 'grab' : 'default') }}>
        <span>{title}</span>
        <div className="win95-titlebar-controls" onMouseDown={(e) => e.stopPropagation()}>
          {onMinimize && <button className="win95-btn" onClick={onMinimize}>_</button>}
          {onMaximize && <button className="win95-btn" onClick={onMaximize}>□</button>}
          <button className="win95-btn" onClick={onClose}>X</button>
        </div>
      </div>
      <div className="win95-content" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {children}
      </div>
    </div>
  );
};

export default DraggableWindow;
