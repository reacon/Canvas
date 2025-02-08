/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from "react";
import Navbar from "../components/Navbar";
import { useAuth } from "../contexts/AuthContext";
import { useCanvas } from "../hooks/useCanvas";
import { useImageManagement } from "../hooks/useImageManagement";
import ImageGrid from "./ImageGrid";
import {
  Pencil,
  Square,
  Circle,
  Minus,
  Eraser,
  Undo2,
  Rotate3D,
  Move,
  Scissors,
  Trash2,
  Save,
  Download,
  Crop,
  Image as ImageIcon,
  X,
} from "lucide-react";
import { useImageDrawing } from "../hooks/useImageDrawing";
import ApplyFilters from "./ApplyFilters";
import { usePillowFunctions } from "../hooks/usePillowFunctions";
import GenerateImageForm from "./GenerateImageForm";

const ImageEditor = () => {
  const [activeSection, setActiveSection] = useState({
    drawing: true,
    transformations: false,
    filters: false,
  });
  const [history, setHistory] = useState([]);
  const [showImageGrid, setShowImageGrid] = useState(true);
  const { canvasRef, getCanvasImage, clearCanvas, drawImage } = useCanvas();
  const cropCanvasRef = useRef(null);
  const {
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
    generateImage,
  } = usePillowFunctions(canvasRef, cropCanvasRef, setHistory);

  const {
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
    imageData,
    setimageData,
  } = useImageManagement(drawImage, canvasRef, setHistory, setBlurON);

  const {
    startDrawing,
    draw,
    stopDrawing,
    setTool,
    setColor,
    setLineWidth,
    tool,
    color,
    lineWidth,
  } = useImageDrawing(canvasRef, history, setHistory);

  const { user, logout } = useAuth();

  useEffect(() => {
    if (cropMode) {
      drawCropWindow();
    }
  }, [cropMode]);

  useEffect(() => {
    history.forEach((url) => {
      URL.revokeObjectURL(url);
    });
  }, []);

  const handleClearImage = () => {
    clearImage();
    const canvasClear = clearCanvas();
    setHistory([]);
    setimageData(canvasClear);
    setimageData(null);
  };

  const handleSaveImage = async () => {
    await saveImage(getCanvasImage);
  };

  const handleDeleteImage = async () => {
    await deleteImage(imageId);
    clearCanvas();
  };

  const handleUndo = () => {
    if (history.length === 1) {
      const canvasClear = clearCanvas();
      setHistory([]);
      clearImage();
      setimageData(canvasClear);
      setimageData(null);
      return;
    }
    if (history.length > 1) {
      const newhistory = [...history];
      const removedUrl = newhistory.pop();
      URL.revokeObjectURL(removedUrl);
      setHistory(newhistory);

      const url = newhistory[newhistory.length - 1];
      drawImage(url);
    }
  };

  const donwloadImage = () => {
    const filename = title || "image";
    const a = document.createElement("a");
    a.href = canvasRef.current.toDataURL();
    a.download = `${filename}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
  };

  const drawingTools = [
    {
      name: "pencil",
      icon: <Pencil className="w-5 h-5" />,
      label: "Pencil",
    },
    {
      name: "rectangle",
      icon: <Square className="w-5 h-5" />,
      label: "Rectangle",
    },
    {
      name: "circle",
      icon: <Circle className="w-5 h-5" />,
      label: "Circle",
    },
    {
      name: "line",
      icon: <Minus className="w-5 h-5" />,
      label: "Line",
    },
    {
      name: "eraser",
      icon: <Eraser className="w-5 h-5" />,
      label: "Eraser",
    },
  ];

  const handleCanvasInteraction = (e) => {
    if (cropMode) {
      if (e.type === "mousedown") handleCropMouseDown(e);
      else if (e.type === "mousemove") handleCropMouseMove(e);
      else if (e.type === "mouseup") handleCropMouseUp(e);
    } else if (blurON) {
      if (e.type === "mousedown") setBlurArea(e);
      else if (e.type === "mouseup") handleBlur();
    } else {
      if (e.type === "mousedown") startDrawing(e);
      else if (e.type === "mousemove") draw(e);
      else if (e.type === "mouseup" || e.type === "mouseleave") stopDrawing();
    }
  };

  const canvasContainerStyle = {
    position: "relative",
    width: "fit-content",
  };

  const mainCanvasStyle = {
    position: "relative",
    maxWidth: "100%",
    border: "1px solid rgb(75, 85, 99)",
    borderRadius: "0.5rem",
  };

  const cropCanvasStyle = {
    position: "absolute",
    top: 0,
    left: 0,
    pointerEvents: "none",
    maxWidth: "100%",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 relative overflow-hidden pb-12">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
      </div>

      <Navbar user={user} handleLogout={logout} />

      <div className="max-w-7xl mx-auto px-4 pt-24">
        <div className="bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-2xl p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-gray-700 pb-6">
            <div>
              <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                Canvas
              </h1>
              <p className="text-gray-400 mt-2">
                Transform your creative vision with advanced editing tools
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <GenerateImageForm
                onGenerate={(prompt, quality) => {
                  setPrompt(prompt);
                  setQuality(quality);
                  generateImage();
                }}
              />
              <button
                onClick={donwloadImage}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>
              <button
                onClick={handleClearImage}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Clear</span>
              </button>
              {imageId && (
                <button
                  onClick={() => handleDeleteImage(imageId)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              )}
              <button
                onClick={handleSaveImage}
                disabled={isUploading}
                className={`px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2 ${
                  isUploading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <Save className="w-4 h-4" />
                <span>
                  {isUploading ? "Saving..." : imageId ? "Update" : "Save"}
                </span>
              </button>
            </div>
          </div>

          {/* Toggle button for the image grid placed at top-right of editor area */}
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setShowImageGrid(!showImageGrid)}
              className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors "
            >
              {showImageGrid ? (
                <X className="w-5 h-5" />
              ) : (
                <ImageIcon className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Conditionally render the image grid */}
          {showImageGrid && (
            <div className="mb-8">
              <ImageGrid
                images={userImages}
                onUpload={handleImageSelect}
                onImageSelect={handleExistingImageSelect}
                loading={loading}
                selectedImageId={imageId}
                fileInputRef={fileInputRef}
              />
            </div>
          )}

          {/* Editor Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Tools Panel */}
            <div className="space-y-4">
              <div className="bg-gray-700/50 backdrop-blur-sm rounded-xl p-4">
                <div
                  className="flex justify-between items-center cursor-pointer mb-4"
                  onClick={() =>
                    setActiveSection((prev) => ({
                      ...prev,
                      drawing: !prev.drawing,
                    }))
                  }
                >
                  <h3 className="text-lg font-semibold text-gray-200">
                    Drawing Tools
                  </h3>
                  <span className="text-gray-400">
                    {activeSection.drawing ? "▼" : "▶"}
                  </span>
                </div>
                {activeSection.drawing && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-2">
                      {drawingTools.map((toolItem) => (
                        <button
                          key={toolItem.name}
                          onClick={() => setTool(toolItem.name)}
                          className={`p-3 rounded-lg flex flex-col items-center gap-2 transition-all ${
                            tool === toolItem.name
                              ? "bg-purple-600 text-white"
                              : "bg-gray-600/50 text-gray-300 hover:bg-gray-500/50"
                          }`}
                        >
                          {toolItem.icon}
                          <span className="text-xs">{toolItem.label}</span>
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-4 bg-gray-600/30 p-3 rounded-lg">
                      <input
                        type="color"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="w-10 h-10 rounded-lg cursor-pointer"
                      />
                      <input
                        type="range"
                        min="1"
                        max="20"
                        value={lineWidth}
                        onChange={(e) => setLineWidth(parseInt(e.target.value))}
                        className="flex-grow"
                      />
                      <button
                        onClick={handleUndo}
                        disabled={history.length === 0}
                        className={`p-2 rounded-lg ${
                          history.length === 0
                            ? "bg-gray-600 cursor-not-allowed opacity-50"
                            : "bg-blue-600 hover:bg-blue-700"
                        } text-white`}
                      >
                        <Undo2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-gray-700/50 backdrop-blur-sm rounded-xl p-4">
                <div
                  className="flex justify-between items-center cursor-pointer mb-4"
                  onClick={() =>
                    setActiveSection((prev) => ({
                      ...prev,
                      transformations: !prev.transformations,
                    }))
                  }
                >
                  <h3 className="text-lg font-semibold text-gray-200">
                    Transformations
                  </h3>
                  <span className="text-gray-400">
                    {activeSection.transformations ? "▼" : "▶"}
                  </span>
                </div>
                {activeSection.transformations && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <label className="text-sm text-gray-300">Width</label>
                        <input
                          type="number"
                          value={resizeWidth}
                          onChange={(e) =>
                            setResizeWidth(parseInt(e.target.value))
                          }
                          className="w-full px-3 py-2 bg-gray-600/50 rounded-lg text-gray-200 border border-gray-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm text-gray-300">Height</label>
                        <input
                          type="number"
                          value={resizeHeight}
                          onChange={(e) =>
                            setResizeHeight(parseInt(e.target.value))
                          }
                          className="w-full px-3 py-2 bg-gray-600/50 rounded-lg text-gray-200 border border-gray-500"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-gray-300">
                        Rotation (degrees)
                      </label>
                      <input
                        type="number"
                        min="-360"
                        max="360"
                        value={degrees}
                        onChange={(e) => setDegrees(parseInt(e.target.value))}
                        className="w-full px-3 py-2 bg-gray-600/50 rounded-lg text-gray-200 border border-gray-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleResize(resizeWidth, resizeHeight)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        <Move className="w-4 h-4" />
                        <span>Resize</span>
                      </button>
                      <button
                        onClick={() => handleRotate(degrees)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        <Rotate3D className="w-4 h-4" />
                        <span>Rotate</span>
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleTranspose("horizontal")}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        <Scissors className="w-4 h-4" />
                        <span>Flip H</span>
                      </button>
                      <button
                        onClick={() => handleTranspose("vertical")}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        <Scissors className="w-4 h-4" />
                        <span>Flip V</span>
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          setBlurON(false);
                          setCropMode(!cropMode);
                        }}
                        className={`px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                          cropMode
                            ? "bg-green-600 hover:bg-green-700"
                            : "bg-blue-600 hover:bg-blue-700"
                        } text-white`}
                      >
                        <Crop className="w-4 h-4" />
                        <span>{cropMode ? "Finish Crop" : "Crop"}</span>
                      </button>
                      <button
                        onClick={() => {
                          setCropMode(false);
                          setBlurON(!blurON);
                        }}
                        className={`px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                          blurON
                            ? "bg-green-600 hover:bg-green-700"
                            : "bg-blue-600 hover:bg-blue-700"
                        } text-white`}
                      >
                        <span>{blurON ? "Finish Blur" : "Blur"}</span>
                      </button>
                    </div>
                    {cropMode && (
                      <button
                        onClick={handleCrop}
                        className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        <span>Apply Crop</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Canvas Area */}
            <div className="lg:col-span-3">
              {/* Filters placed above the canvas */}
              <div className="mb-6">
                <ApplyFilters canvasRef={canvasRef} imageData={imageData} />
              </div>
              <div className="bg-gray-700/30 backdrop-blur-sm rounded-xl p-4">
                <div style={canvasContainerStyle}>
                  <canvas
                    ref={canvasRef}
                    onMouseDown={handleCanvasInteraction}
                    onMouseMove={handleCanvasInteraction}
                    onMouseUp={handleCanvasInteraction}
                    onMouseLeave={handleCanvasInteraction}
                    style={mainCanvasStyle}
                    width={1500}
                    height={800}
                    className="border border-gray-600 rounded-lg"
                  />
                  {cropMode && (
                    <canvas
                      ref={cropCanvasRef}
                      style={cropCanvasStyle}
                      width={1500}
                      height={800}
                    />
                  )}
                </div>
                <div className="mt-4">
                  <input
                    type="text"
                    placeholder="Image title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-600/50 rounded-lg text-gray-200 border border-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  {error && (
                    <p className="mt-2 text-red-400 text-sm">{error}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;
