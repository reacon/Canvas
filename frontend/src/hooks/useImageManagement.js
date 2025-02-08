/* eslint-disable no-unused-vars */
import { useState,useEffect,useRef } from "react";
import { ImageService } from "../services/ImageService";

export const useImageManagement = (drawImage,canvasRef,setHistory,setBlurON) => {
  const [image, setImage] = useState(null);
  const [title, setTitle] = useState('');
  const [error, setError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [userImages, setUserImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imageId, setImageId] = useState(null);
  const fileInputRef = useRef(null);
  const [imageData,setimageData] = useState(null);

  useEffect(() => {
      fetchImages();
    }, []);
  
    const fetchImages = async () => {
      try {
        setLoading(true);
        const response = await ImageService.getImages();
        setUserImages(response);
      } catch (error) {
        console.error("Error fetching images", error);
      } finally {
        setLoading(false);
      }
    };

  const handleImageSelect = async (file) => {
    setHistory([])
    if (fileInputRef.current) {
        fileInputRef.current.value = ''; 
      }
    if (file){
        setImage(file);
    }
    const ObjectUrl = URL.createObjectURL(file);
    setBlurON(false)
    setTitle('');
    setimageData(null);
    setImageId(null);
    await drawImage(ObjectUrl);
    const ctx = canvasRef.current.getContext('2d');
    setimageData(ctx.getImageData(
      0,
      0,
      ctx.canvas.width,
      ctx.canvas.height
    ))
    setHistory(prev => [...prev, ObjectUrl]);
    
  };

  const handleExistingImageSelect = async (file) => {
    try{
    const response = await fetch(file.image)
    const blob = await response.blob();
    setimageData(null);
    setBlurON(false)
    setImageId(file.id);
    setImage(blob);
    setTitle(file.title);

    const ObjectUrl = URL.createObjectURL(blob);
    await drawImage(ObjectUrl);
    const ctx = canvasRef.current.getContext('2d');
    setimageData(ctx.getImageData(
      0,
      0,
      ctx.canvas.width,
      ctx.canvas.height
    ))
    setHistory(prev => [...prev, ObjectUrl]);
    
    } catch (err){
        setError('Failed to load image');
    }
  }

  const clearImage = () => {
    setImage(null);
    setTitle('');
    setError(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = ''; 
      }
  }
  const saveImage = async (getCanvasImage) => {
    try{
        setIsUploading(true);
        setError(null);
        const blob = await getCanvasImage();
        if (!blob) {
            throw new error("No image to save");
            }
        if (imageId) {
            await ImageService.update_image(blob, imageId, title);
        } else {
            await ImageService.uploadImage(blob, title);
        }
        fetchImages();
    } catch (err){
        setError('Failed to save image');
    } finally {
        setIsUploading(false);
    }
  }

  const deleteImage = async (id) => {
    try{
        setTitle('');
        await ImageService.deleteImage(id);
        if (fileInputRef.current) {
        fileInputRef.current.value = ''; 
      }
        fetchImages();
    } catch (err){
        setError('Failed to delete image');
    }
  }
  return {
    image,
    title,
    setTitle,
    error,
    isUploading,
    userImages,
    loading,
    imageId,
    handleImageSelect,
    handleExistingImageSelect,
    clearImage,
    saveImage,
    deleteImage,
    fileInputRef,
    imageData,setimageData
  };
}
export default useImageManagement;