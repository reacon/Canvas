/* eslint-disable no-unused-vars */
import { resolve } from 'mathjs';
import { useRef , useState} from 'react';


export const useCanvas = () => {
   
    const canvasRef = useRef(null);
    const [error , setError] = useState(null);

    const drawImage = (imageUrl) => {
        return new Promise((resolve,reject) => {
             if (!imageUrl) {
            clearCanvas();
            reject('No image URL provided');
            return;
        };
        const img = new Image();

        img.onload = () => {
            const canvas = canvasRef.current;
            if (canvas) {
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0);
                resolve();

            }
        };
         img.onerror = () => {
            setError("Failed to load image");
            new Error('Failed to load image');
        }
        img.src = imageUrl;
        
        })
       
    };


const clearCanvas = () => {
   if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      const image =  ctx.getImageData(
        0,
        0,
        ctx.canvas.width,
        ctx.canvas.height
      );
      return image
    }
    setError(null);
}   
const getCanvasImage = () => {
    if (canvasRef.current) {
        return new Promise((resolve) => {
            canvasRef.current.toBlob((blob) => {
                resolve(blob);
            }, "image/png");
        });
    }
    return null;
}

    
return {getCanvasImage, drawImage, clearCanvas, canvasRef, error};
}
export default useCanvas;   