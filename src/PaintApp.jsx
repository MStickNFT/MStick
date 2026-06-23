import { useRef, useState, useEffect } from 'react';
import DraggableWindow from './DraggableWindow';

// Accurate MS Paint 16 colors (interleaved for 2 columns)
const COLORS = [
  '#000000', '#ffffff',
  '#808080', '#c0c0c0',
  '#800000', '#ff0000',
  '#808000', '#ffff00',
  '#008000', '#00ff00',
  '#008080', '#00ffff',
  '#000080', '#0000ff',
  '#800080', '#ff00ff'
];

const PENCIL_16 = [
  ".............00.",
  "............0pp0",
  "...........0pp0.",
  "..........0000..",
  ".........0yyd0..",
  "........0yyd0...",
  ".......0yyd0....",
  "......0yyd0.....",
  ".....0yyd0......",
  "....0yyd0.......",
  "...0www0........",
  "..0ww0..........",
  ".0w0............",
  "00..............",
  "................",
  "................",
];

const ERASER_16 = [
  "................",
  ".....0000000....",
  "...00wwwwwww00..",
  ".00wwwwwwwwwww0.",
  "0wwwwwwwwwwwww0.",
  "0ggggggggggggg0.",
  "0ggggggggggggg0.",
  "0ggggggggggggg0.",
  "0ggggggggggggg0.",
  "0ggggggggggggg0.",
  ".00ggggggggg00..",
  "...000000000....",
  "................",
  "................",
  "................",
  "................",
];

const BRUSH_16 = [
  "...........00...",
  "..........0ww0..",
  ".........0www0..",
  "........0www0...",
  ".......0www0....",
  "......0www0.....",
  ".....0www0......",
  "....0www0.......",
  "...0www0........",
  "..00w00.........",
  ".0yyyy0.........",
  "0yyyyyy0........",
  "00yyyy00........",
  "..0000..........",
  "................",
  "................",
];

const createIconPng = (mapArray, colorMap, scale = 1) => {
  if (typeof document === 'undefined') return '';
  const canvas = document.createElement('canvas');
  canvas.width = mapArray[0].length * scale;
  canvas.height = mapArray.length * scale;
  const ctx = canvas.getContext('2d');
  mapArray.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const char = row[x];
      if (char !== '.') {
        ctx.fillStyle = colorMap[char];
        ctx.fillRect(x * scale, y * scale, scale, scale);
      }
    }
  });
  return canvas.toDataURL('image/png');
};

const PENCIL_COLOR_MAP = { '0': '#000000', 'p': '#ff80a0', 'y': '#ffff00', 'd': '#808000', 'w': '#ffcc99' };
const ERASER_COLOR_MAP = { '0': '#000000', 'w': '#ffffff', 'g': '#c0c0c0' };

let pencilPngUrl = '';
let eraserPngUrl = '';
let pencilCursorPngUrl = '';
let brushPngUrl = '';
let brushCursorPngUrl = '';
if (typeof document !== 'undefined') {
  pencilPngUrl = createIconPng(PENCIL_16, PENCIL_COLOR_MAP, 1);
  eraserPngUrl = createIconPng(ERASER_16, ERASER_COLOR_MAP, 1);
  brushPngUrl = createIconPng(BRUSH_16, PENCIL_COLOR_MAP, 1);
  pencilCursorPngUrl = createIconPng(PENCIL_16, PENCIL_COLOR_MAP, 2); 
  brushCursorPngUrl = createIconPng(BRUSH_16, PENCIL_COLOR_MAP, 2); 
}

const PencilSVG = <img src={pencilPngUrl} style={{ width: '16px', height: '16px', imageRendering: 'pixelated' }} alt="Pencil" />;
const EraserSVG = <img src={eraserPngUrl} style={{ width: '16px', height: '16px', imageRendering: 'pixelated' }} alt="Eraser" />;
const BrushSVG = <img src={brushPngUrl} style={{ width: '16px', height: '16px', imageRendering: 'pixelated' }} alt="Brush" />;

const FillSVG = <svg width="24" height="24" viewBox="0 0 16 16"><path d="M4 10 L10 14 L14 8 L8 4 Z" fill="none" stroke="#000" strokeWidth="1"/><path d="M4 10 L2 12" stroke="#000" strokeWidth="2"/></svg>;
const LineSVG = <svg width="24" height="24" viewBox="0 0 16 16"><line x1="3" y1="13" x2="13" y2="3" stroke="#000" strokeWidth="1"/></svg>;
const RectSVG = <svg width="24" height="24" viewBox="0 0 16 16"><rect x="3" y="4" width="10" height="8" fill="none" stroke="#000" strokeWidth="1"/></svg>;

const PaintApp = ({ onClose, onMinimize }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(2);
  const [activeTool, setActiveTool] = useState('pencil');
  const [undoHistory, setUndoHistory] = useState([]);
  const [snapshot, setSnapshot] = useState(null);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    // Fill white background initially
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const undo = () => {
    if (undoHistory.length === 0) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    setUndoHistory(prev => {
      const newHistory = [...prev];
      const lastState = newHistory.pop();
      if (lastState) {
         ctx.putImageData(lastState, 0, 0);
      }
      return newHistory;
    });
  };

  const saveState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setUndoHistory(prev => {
      const newHistory = [...prev, data];
      if (newHistory.length > 10) newHistory.shift();
      return newHistory;
    });
  };

  // Global Ctrl+Z handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 'z') {
        undo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undoHistory]);

  const hexToRgb = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return [r, g, b, 255];
  };

  const floodFill = (ctx, sx, sy, fillColorHex) => {
    const canvas = ctx.canvas;
    const width = canvas.width;
    const height = canvas.height;
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    const startPos = (sy * width + sx) * 4;
    const startR = data[startPos];
    const startG = data[startPos + 1];
    const startB = data[startPos + 2];
    const startA = data[startPos + 3];

    const [fillR, fillG, fillB, fillA] = hexToRgb(fillColorHex);

    if (startR === fillR && startG === fillG && startB === fillB && startA === fillA) {
      return;
    }

    const matchStartColor = (pos) => {
      return data[pos] === startR && data[pos + 1] === startG && data[pos + 2] === startB && data[pos + 3] === startA;
    };

    const colorPixel = (pos) => {
      data[pos] = fillR;
      data[pos + 1] = fillG;
      data[pos + 2] = fillB;
      data[pos + 3] = fillA;
    };

    const pixelStack = [[sx, sy]];

    while (pixelStack.length) {
      const newPos = pixelStack.pop();
      const x = newPos[0];
      let y = newPos[1];

      let pixelPos = (y * width + x) * 4;
      while (y-- >= 0 && matchStartColor(pixelPos)) {
        pixelPos -= width * 4;
      }
      pixelPos += width * 4;
      ++y;

      let reachLeft = false;
      let reachRight = false;

      while (y++ < height - 1 && matchStartColor(pixelPos)) {
        colorPixel(pixelPos);

        if (x > 0) {
          if (matchStartColor(pixelPos - 4)) {
            if (!reachLeft) {
              pixelStack.push([x - 1, y]);
              reachLeft = true;
            }
          } else if (reachLeft) {
            reachLeft = false;
          }
        }

        if (x < width - 1) {
          if (matchStartColor(pixelPos + 4)) {
            if (!reachRight) {
              pixelStack.push([x + 1, y]);
              reachRight = true;
            }
          } else if (reachRight) {
            reachRight = false;
          }
        }

        pixelPos += width * 4;
      }
    }
    ctx.putImageData(imageData, 0, 0);
  };

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);

    saveState();

    setIsDrawing(true);
    setStartX(x);
    setStartY(y);

    if (activeTool === 'pencil' || activeTool === 'brush' || activeTool === 'eraser') {
      ctx.beginPath();
      ctx.moveTo(x, y);
      
      if (activeTool === 'pencil') {
        ctx.lineCap = 'square';
        ctx.lineJoin = 'miter';
        ctx.lineWidth = brushSize;
        ctx.strokeStyle = color;
      } else if (activeTool === 'brush') {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = brushSize * 2;
        ctx.strokeStyle = color;
      } else if (activeTool === 'eraser') {
        ctx.lineCap = 'square';
        ctx.lineJoin = 'miter';
        ctx.lineWidth = brushSize * 4 + 4;
        ctx.strokeStyle = '#ffffff';
      }
      
      // Draw a single dot immediately
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, y);
    } else if (activeTool === 'fill') {
      floodFill(ctx, x, y, color);
    } else if (activeTool === 'line' || activeTool === 'rect') {
      setSnapshot(ctx.getImageData(0, 0, canvas.width, canvas.height));
    }
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);
    
    if (activeTool === 'pencil' || activeTool === 'brush' || activeTool === 'eraser') {
      ctx.lineTo(x, y);
      ctx.stroke();
      // Begin a new path immediately so we don't redraw the whole history (which causes lag and jagged lines)
      ctx.beginPath();
      ctx.moveTo(x, y);
    } else if (activeTool === 'line') {
      if (snapshot) ctx.putImageData(snapshot, 0, 0);
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(x, y);
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.stroke();
    } else if (activeTool === 'rect') {
      if (snapshot) ctx.putImageData(snapshot, 0, 0);
      ctx.beginPath();
      ctx.rect(startX, startY, x - startX, y - startY);
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    saveState();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const saveCanvas = () => {
    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'mstick_masterpiece.png';
    link.href = dataUrl;
    link.click();
  };

  const shareTwitter = () => {
    const text = encodeURIComponent("Just drew this masterpiece on MStick Paint! 🎨\n\n#TheOGCanvas @MStick_NFT");
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  };

  // Custom SVG Cursors
  // The exact tip of the 2x scaled pencil is at x=0, y=26.
  const ogPencilCursor = `url(${pencilCursorPngUrl}) 0 26, crosshair`;
  const ogBrushCursor = `url(${brushCursorPngUrl}) 0 26, crosshair`;
  
  // Make eraser cursor 2x larger and very visible (gray fill, black border)
  const eraserSize = brushSize * 4 + 4; 
  let dynamicEraserCursor = 'crosshair';
  if (typeof document !== 'undefined') {
    const eCanvas = document.createElement('canvas');
    eCanvas.width = eraserSize;
    eCanvas.height = eraserSize;
    const eCtx = eCanvas.getContext('2d');
    eCtx.fillStyle = '#c0c0c0'; // Gray fill so it stands out against white canvas
    eCtx.fillRect(0, 0, eraserSize, eraserSize);
    eCtx.strokeStyle = '#000000';
    eCtx.lineWidth = 2; // Thicker border
    eCtx.strokeRect(1, 1, eraserSize-2, eraserSize-2);
    dynamicEraserCursor = `url(${eCanvas.toDataURL('image/png')}) ${Math.floor(eraserSize/2)} ${Math.floor(eraserSize/2)}, crosshair`;
  }
  
  const crosshairCursor = 'crosshair';

  let currentCursor = ogPencilCursor;
  if (activeTool === 'brush') currentCursor = ogBrushCursor;
  if (activeTool === 'eraser') currentCursor = dynamicEraserCursor;
  if (activeTool === 'fill' || activeTool === 'line' || activeTool === 'rect') currentCursor = crosshairCursor;

  const renderToolBtn = (icon, id, title) => (
    <div 
      key={id}
      title={title}
      onClick={() => setActiveTool(id)}
      style={{
        width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center',
        backgroundColor: 'var(--win95-gray)',
        boxShadow: activeTool === id ? 'var(--border-inset)' : 'var(--border-outset)',
        cursor: 'pointer',
        boxSizing: 'border-box',
        padding: activeTool === id ? '2px 0 0 2px' : '0'
      }}
    >
      {icon}
    </div>
  );

  return (
    <DraggableWindow 
      title="MStick Paint" 
      initialPosition={{ x: typeof window !== 'undefined' ? window.innerWidth/2 - 260 : 100, y: typeof window !== 'undefined' ? window.innerHeight/2 - 220 : 100 }}
      onClose={onClose} 
      onMinimize={onMinimize}
      style={{ width: '560px' }}
    >
      <div style={{ display: 'flex', gap: '8px', height: '100%' }}>
        {/* Sidebar Tools */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '54px', flexShrink: 0 }}>
          
          {/* Tool Icons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px' }}>
            {renderToolBtn(PencilSVG, 'pencil', 'Pencil')}
            {renderToolBtn(EraserSVG, 'eraser', 'Eraser')}
            {renderToolBtn(BrushSVG, 'brush', 'Brush')}
            {renderToolBtn(FillSVG, 'fill', 'Fill')}
            {renderToolBtn(LineSVG, 'line', 'Line')}
            {renderToolBtn(RectSVG, 'rect', 'Rectangle')}
          </div>

          {/* Tool Options (Brush Size) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', backgroundColor: '#fff', border: 'var(--border-inset)', padding: '2px' }}>
            {[2, 5, 8].map(size => (
              <div 
                key={size}
                onClick={() => setBrushSize(size)}
                style={{ 
                  height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  backgroundColor: brushSize === size ? '#000080' : 'transparent',
                  cursor: 'pointer'
                }}
              >
                <div style={{ width: '80%', height: `${size}px`, backgroundColor: brushSize === size ? '#fff' : '#000' }} />
              </div>
            ))}
          </div>

          {/* Color Palette */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px', backgroundColor: 'var(--win95-gray)', padding: '2px', boxShadow: 'var(--border-inset)', width: '54px', boxSizing: 'border-box' }}>
            {COLORS.map((c) => (
              <div 
                key={c} 
                onClick={() => setColor(c)}
                style={{ 
                  width: '24px', height: '24px', backgroundColor: c, 
                  border: color === c ? '2px solid #fff' : '2px solid #000',
                  boxShadow: color === c ? 'inset 1px 1px #000, inset -1px -1px #fff' : 'none',
                  cursor: 'pointer',
                  boxSizing: 'border-box'
                }} 
              />
            ))}
          </div>
          
          {/* Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: 'auto' }}>
            <button className="win95-btn" onClick={clearCanvas} style={{ fontSize: '11px', padding: '2px' }}>Clear</button>
            <button className="win95-btn" onClick={undo} style={{ fontSize: '11px', padding: '2px' }}>Undo</button>
            <button className="win95-btn" onClick={saveCanvas} style={{ fontSize: '11px', padding: '2px', fontWeight: 'bold' }}>Save</button>
            <button className="win95-btn" onClick={shareTwitter} style={{ fontSize: '11px', padding: '2px', fontWeight: 'bold', color: '#1da1f2' }}>Share</button>
          </div>
        </div>
        
        {/* Canvas Area */}
        <div className="win95-panel" style={{ padding: '2px', backgroundColor: '#808080' }}>
          <canvas 
            ref={canvasRef}
            width={488}
            height={452}
            style={{ 
              width: '488px',
              height: '452px',
              cursor: currentCursor, 
              backgroundColor: '#ffffff', 
              display: 'block'
            }}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseOut={stopDrawing}
          />
        </div>
      </div>
    </DraggableWindow>
  );
};

export default PaintApp;
