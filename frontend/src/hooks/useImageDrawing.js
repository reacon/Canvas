/* eslint-disable no-unused-vars */
import { useRef,useState,useEffect } from 'react';
import { create, all } from 'mathjs';

export const useImageDrawing = (canvasRef,history,setHistory) => {
    const [isDrawing, setIsDrawing] = useState(false);
    const [tool, setTool] = useState('pencil');
    const [color, setColor] = useState('#000000');
    const [lineWidth, setLineWidth] = useState(2);
    const [start, setStart] = useState({ x: 0, y: 0 });
    const ctxRef = useRef(null);
    const math = create(all);
    const originalStateRef = useRef(null);
    
    

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        ctx.lineCap = 'round';  
        ctx.lineJoin = 'round';
        ctx.strokeStyle = color;    
        ctx.lineWidth = lineWidth;
        ctxRef.current = ctx;

    },[color, lineWidth, canvasRef]);

    const saveState = () => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            setHistory(prevHistory => [...prevHistory, url]);
        }, 'image/png');
    }


    const startDrawing = (e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        const scaleX = canvasRef.current.width / rect.width;
        const scaleY = canvasRef.current.height / rect.height;

        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;
        setStart({ x, y });
        setIsDrawing(true);

        if (tool === 'pencil') {
            ctxRef.current.beginPath();
            ctxRef.current.moveTo(x, y);
        }
        if (tool === 'eraser') {
            ctxRef.current.beginPath();
            ctxRef.current.moveTo(x, y);
            ctxRef.current.globalCompositeOperation = 'destination-out';
        } else {
            ctxRef.current.globalCompositeOperation = 'source-over';
        }
        
        if (tool === 'rectangle' || tool === 'circle' || tool === 'line') {
            originalStateRef.current = ctxRef.current.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
            
        }
    }
    const draw = (e) => {
        if (!isDrawing) return;

        const rect = canvasRef.current.getBoundingClientRect();
        const scaleX = canvasRef.current.width / rect.width;
        const scaleY = canvasRef.current.height / rect.height;
        
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        const ctx = ctxRef.current;

        if (tool === 'pencil' || tool === 'eraser') {
            ctxRef.current.lineTo(x, y);
            ctxRef.current.stroke();
        } 
         else {
            ctxRef.current.putImageData(originalStateRef.current, 0, 0);
            ctx.beginPath();

            if (tool === 'rectangle') {
                ctx.rect(start.x, start.y, x - start.x, y - start.y);
            } else if (tool === 'circle') {
                const radius = math.sqrt((x - start.x) ** 2 + (y - start.y) ** 2);
                ctx.arc(start.x, start.y, radius, 0, 2 * Math.PI);
            } else if (tool === 'line') {
                ctx.moveTo(start.x, start.y);
                ctx.lineTo(x, y);
            }
            ctx.stroke();
        }
    }

    const stopDrawing = () => {
         if (isDrawing) {
            setIsDrawing(false);
            originalStateRef.current = null;
            saveState();
        }
    }

    return {  startDrawing,
        draw,
        stopDrawing,
        setTool,
        setColor,
        setLineWidth,
        tool,
        color,
        lineWidth, saveState, history, setHistory };
}
export default useImageDrawing;