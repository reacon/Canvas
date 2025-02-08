/* eslint-disable default-case */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { ImageService } from "../services/ImageService";
import { act, useEffect,useState } from "react";



export const usePillowFunctions = (canvasRef,cropCanvasRef,setHistory) => {
    const [resizeWidth, setResizeWidth] = useState(300);
    const [resizeHeight, setResizeHeight] = useState(300); 
    const [degrees, setDegrees] = useState(90);
    const [blur,setBlur] = useState({
        x: 0,
        y: 0,
        radius: 50
    })
    const [blurON,setBlurON] = useState(false);
    const [cropMode , setCropMode] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [activeCorner, setActiveCorner] = useState(null);
    const [cropBox, setCropBox] = useState({
        topLeft: { x: 0, y: 0 },
        topRight: { x: 0, y: 0 },
        bottomLeft: { x: 0, y: 0 },
        bottomRight: { x: 0, y: 0 }
    });
    const [iswindowDragging, setIsWindowDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [originalBox, setOriginalBox] = useState(null);
    const [prompt, setPrompt] = useState("");
    const [quality, setQuality] = useState("core");


   const getCanvasImage = () => {
       if (canvasRef.current) {
           return new Promise((resolve) => {
               canvasRef.current.toBlob((blob) => {
                   resolve(blob);
               }, "image/png");
           });
       }
       return null;
   };

    const drawImage = (imageUrl) => {
        return new Promise((resolve, reject) => {
            if (!imageUrl) {
                reject('No image URL provided');
                return;
            }

            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => {
                const canvas = canvasRef.current;
                if (canvas) {
                    canvas.width = img.width;
                    canvas.height = img.height;
                    
                    const ctx = canvas.getContext("2d");
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0);
                    
                        cropCanvasRef.current.width = img.width;
                        cropCanvasRef.current.height = img.height;
            
                    resolve();
                }
            };
            
            img.onerror = () => {
                reject(new Error('Failed to load image'));
            }
            
            img.src = imageUrl;
        });
    };

   const handleResize = async (width, height) => {
       try {
           if (canvasRef.current) {
               const blob = await getCanvasImage();
               
               const resizedBlob = await ImageService.resize(blob, width, height);
               const url = URL.createObjectURL(resizedBlob);
               setHistory(prevHistory => [...prevHistory, url]);
               
               await drawImage(url);
           } else {
               console.error("Canvas ref is null");
           }
       } catch (error) {
           console.error("Error resizing image", error);
           throw error;
       }
   }
   const handleRotate = async (degrees) => {
       try {
           if (canvasRef.current) {
               const blob = await getCanvasImage();
               const rotatedBlob = await ImageService.rotate(blob, degrees);
               const url = URL.createObjectURL(rotatedBlob);
               setHistory(prevHistory => [...prevHistory, url]);
               
               await drawImage(url);
           } else {
               console.error("Canvas ref is null");
           }
       } catch (error) {
           console.error("Error rotating image", error);
           throw error;
       }

   }
   const handleTranspose = async (direction) => {
         try {
              if (canvasRef.current) {
                const blob = await getCanvasImage();
                const transposedBlob = await ImageService.transpose(blob, direction);
                const url = URL.createObjectURL(transposedBlob);
                
                await drawImage(url);
              } else {
                console.error("Canvas ref is null");
              }
         } catch (error) {
              console.error("Error transposing image", error);
              throw error;
         }
   }

   const setBlurArea = (e) => {
    if (!blurON) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    setBlur({x:x,y:y,radius:5});
   }

   const handleBlur = async () => {
    try{
        if (canvasRef.current) {
            const blob = await getCanvasImage();
            const blurredBlob = await ImageService.blur(blob, blur.x, blur.y, blur.radius);
            const url = URL.createObjectURL(blurredBlob);
            setHistory(prevHistory => [...prevHistory, url]);
            await drawImage(url);  
        }
    }
    catch (error) {
        console.error("Error blurring image", error);
        throw error
       }   }
    
 
    const generateImage = async () => {
        try{
            const response = await ImageService.generate(prompt,quality);
            await drawImage(response);
         
        }
        catch (error) {
            console.error("Error generating image", error);
            throw error;
        }
    }
    
    useEffect(() => {
    if (cropMode) {
        initializeCrop();
    }
}, [cropMode]);

    const initializeCrop = () => {
        if (!canvasRef.current) return;
        
        const canvas = canvasRef.current;
        const paddingX = canvas.width * 0.01;
        const paddingY = canvas.height * 0.01;

        const topLeft = { x: paddingX, y: paddingY };
        const topRight = { x: canvas.width - paddingX, y: paddingY };
        const bottomLeft = { x: paddingX, y: canvas.height - paddingY };
        const bottomRight = { x: canvas.width - paddingX, y: canvas.height - paddingY };
        setCropBox({ topLeft, topRight, bottomLeft, bottomRight });
    }

    const drawCropWindow = () => {
    if (!cropCanvasRef.current || !cropMode) return;
    const ctx = cropCanvasRef.current.getContext("2d");
    cropCanvasRef.current.width = canvasRef.current.width;
    cropCanvasRef.current.height = canvasRef.current.height;
    
    ctx.clearRect(0, 0, cropCanvasRef.current.width, cropCanvasRef.current.height);
        
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(0, 0, cropCanvasRef.current.width, cropCanvasRef.current.height);

    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = "black";
    ctx.fillRect(
      cropBox.topLeft.x,
      cropBox.topLeft.y,
      cropBox.topRight.x - cropBox.topLeft.x,
      cropBox.bottomLeft.y - cropBox.topLeft.y
    );

    ctx.globalCompositeOperation = "source-over";
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.strokeRect(
      cropBox.topLeft.x,
      cropBox.topLeft.y,
      cropBox.topRight.x - cropBox.topLeft.x,
      cropBox.bottomLeft.y - cropBox.topLeft.y
    );


    const corners = ["topLeft", "topRight", "bottomLeft", "bottomRight"];
    corners.forEach((corner) => {
      ctx.beginPath();
      ctx.arc(cropBox[corner].x, cropBox[corner].y, 8, 0, Math.PI * 2);
      ctx.fillStyle = "white";
      ctx.fill();
      ctx.strokeStyle = "black";
      ctx.stroke();
    });
  };


    const handleCropMouseDown = (e) => {
        if (!cropCanvasRef.current) return;

        

        const rect = cropCanvasRef.current.getBoundingClientRect();
        const scaleX = cropCanvasRef.current.width / rect.width;
        const scaleY = cropCanvasRef.current.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        if (cropBox.topLeft.x < x && x < cropBox.topRight.x && cropBox.topLeft.y < y && y < cropBox.bottomLeft.y) {
            setIsWindowDragging(true);
            setDragStart({ x, y });
            setOriginalBox({ ...cropBox });
            return

        }

        const corners = Object.keys(cropBox);
        for (let corner of corners) {
            const dx = x - cropBox[corner].x;
            const dy = y - cropBox[corner].y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 20) {
                setIsDragging(true);
                setActiveCorner(corner);
                return;
            }
        }

    }
    const handleCropMouseMove = (e) => {
        if (!cropMode) return;

        const rect = cropCanvasRef.current.getBoundingClientRect();
        const scaleX = cropCanvasRef.current.width / rect.width;
        const scaleY = cropCanvasRef.current.height / rect.height;
        const newX = (e.clientX - rect.left) * scaleX;
        const newY = (e.clientY - rect.top) * scaleY;

        if (iswindowDragging) {
            const dx = newX - dragStart.x;
            const dy = newY - dragStart.y;

        const newTopLeftX = originalBox.topLeft.x + dx;
        const newTopLeftY = originalBox.topLeft.y + dy;
        const newTopRightX = originalBox.topRight.x + dx;
        const newTopRightY = originalBox.topRight.y + dy;
        const newBottomLeftX = originalBox.bottomLeft.x + dx;
        const newBottomLeftY = originalBox.bottomLeft.y + dy;
        const newBottomRightX = originalBox.bottomRight.x + dx;
        const newBottomRightY = originalBox.bottomRight.y + dy;

        if (newTopLeftX < 0 || 
            newTopRightX > canvasRef.current.width || 
            newTopLeftY < 0 || 
            newBottomLeftY > canvasRef.current.height) {
            return; 
        }
        setCropBox({
            topLeft: { 
                x: newTopLeftX, 
                y: newTopLeftY 
            },
            topRight: { 
                x: newTopRightX, 
                y: newTopRightY 
            },
            bottomLeft: { 
                x: newBottomLeftX, 
                y: newBottomLeftY 
            },
            bottomRight: { 
                x: newBottomRightX, 
                y: newBottomRightY 
            }
        });


        }

       setCropBox(prev => {
        const newBox = { ...prev };
        
        switch (activeCorner) {
            case 'topLeft':
                newBox.topLeft = { x: newX, y: newY };
                newBox.topRight.y = newY;
                newBox.bottomLeft.x = newX;
                break;
                
            case 'topRight':
                newBox.topRight = { x: newX, y: newY };
                newBox.topLeft.y = newY;
                newBox.bottomRight.x = newX;
                break;
                
            case 'bottomLeft':
                newBox.bottomLeft = { x: newX, y: newY };
                newBox.bottomRight.y = newY;
                newBox.topLeft.x = newX;
                break;
                
            case 'bottomRight':
                newBox.bottomRight = { x: newX, y: newY };
                newBox.bottomLeft.y = newY;
                newBox.topRight.x = newX;
                break;
        }

        return newBox;
    });

        
        drawCropWindow();
    }   

    const handleCropMouseUp = () => {
        setIsDragging(false);
        setActiveCorner(null);
        setIsWindowDragging(false);
        setOriginalBox(null);
    }

    const handleCrop = async () => {
        try{
            if (canvasRef.current){
                const blob = await getCanvasImage()
                const width = cropBox.topRight.x - cropBox.topLeft.x 
                const height = cropBox.bottomLeft.y - cropBox.topLeft.y;

                const croppedBlob = await ImageService.crop(blob,width,height,cropBox.topLeft.x,cropBox.topLeft.y)
                
                    
                const url = URL.createObjectURL(croppedBlob);
                setHistory(prevHistory => [...prevHistory, url]);
                
                
                await drawImage(url);
                setCropMode(false);

            }
        } catch (error) {
              console.error("Error transposing image", error);
              throw error;
         }
    } 
     useEffect(() => {
    if (cropMode) {
        const redraw = async () => {
            drawCropWindow();
        };
        redraw();
    }
}, [cropMode, cropBox])


    return {
        resizeWidth,
        setResizeWidth,
        resizeHeight,
        setResizeHeight,
        handleResize,
        handleRotate,
        handleTranspose,
        degrees,
        setDegrees,
        blurON,
        setBlurON,
        handleBlur,
        setBlurArea,
        cropMode,
        setCropMode,
        handleCropMouseDown,
        handleCropMouseMove,
        handleCropMouseUp,
        handleCrop,
        drawCropWindow,
        setPrompt,
        setQuality,
        generateImage

    } 

}
   


export default usePillowFunctions;