/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import {
  ImageOff,
  Contrast,
  Palette,
  Sun,
  Thermometer,
  Droplet,
  Lightbulb,
  Layers,
  Filter,
  X,
  Sliders,
  Trash2,
  ImageDown,
} from "lucide-react";

const ImageFilters = ({ canvasRef, imageData }) => {
  const [transformationStack, setTransformationStack] = useState([]);
  const [original, setOriginal] = useState(null);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [isAdjustmentsMenuOpen, setIsAdjustmentsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("filters");
  const FilterIcons = {
    grayscale: ImageOff,
    sepia: Palette,
    invert: Contrast,
    brightness: Sun,
    contrast: Layers,
    temperature: Thermometer,
    exposure: Lightbulb,
    alpha: Droplet,
  };
  useEffect(() => {
    if (!imageData) {
      setIsFilterMenuOpen(false);
      setIsAdjustmentsMenuOpen(false);
    }
  }, [imageData]);

  const Transformations = {
    grayscale: (imageData, intensity) => {
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        data[i] = data[i] * (1 - intensity) + avg * intensity;
        data[i + 1] = data[i + 1] * (1 - intensity) + avg * intensity;
        data[i + 2] = data[i + 2] * (1 - intensity) + avg * intensity;
      }
      return imageData;
    },
    sepia: (imageData, intensity) => {
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i],
          g = data[i + 1],
          b = data[i + 2];
        data[i] = Math.min(
          255,
          r * (1 - intensity) + (r * 0.393 + g * 0.769 + b * 0.189) * intensity
        );
        data[i + 1] = Math.min(
          255,
          g * (1 - intensity) + (r * 0.349 + g * 0.686 + b * 0.168) * intensity
        );
        data[i + 2] = Math.min(
          255,
          b * (1 - intensity) + (r * 0.272 + g * 0.534 + b * 0.131) * intensity
        );
      }
      return imageData;
    },
    invert: (imageData) => {
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        data[i] = 255 - data[i];
        data[i + 1] = 255 - data[i + 1];
        data[i + 2] = 255 - data[i + 2];
      }
      return imageData;
    },
    brightness: (imageData, value) => {
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.min(255, data[i] * value);
        data[i + 1] = Math.min(255, data[i + 1] * value);
        data[i + 2] = Math.min(255, data[i + 2] * value);
      }
      return imageData;
    },

    contrast: (imageData, value) => {
      const data = imageData.data;
      const factor = (259 * (value + 255)) / (255 * (259 - value));

      for (let i = 0; i < data.length; i += 4) {
        data[i] = factor * (data[i] - 128) + 128;
        data[i + 1] = factor * (data[i + 1] - 128) + 128;
        data[i + 2] = factor * (data[i + 2] - 128) + 128;
      }
      return imageData;
    },

    temperature: (imageData, value) => {
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.min(255, Math.max(0, data[i] + value * 10));
        data[i + 2] = Math.min(255, Math.max(0, data[i + 2] - value * 10));
      }
      return imageData;
    },

    tint: (imageData, value) => {
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        data[i + 1] += value;
      }
      return imageData;
    },

    exposure: (imageData, value) => {
      const data = imageData.data;
      const exposureMultiplier = Math.pow(2, value);

      for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.min(255, data[i] * exposureMultiplier);
        data[i + 1] = Math.min(255, data[i + 1] * exposureMultiplier);
        data[i + 2] = Math.min(255, data[i + 2] * exposureMultiplier);
      }
      return imageData;
    },

    alpha: (imageData, value) => {
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        data[i + 3] = Math.min(255, data[i + 3] * value);
      }
      return imageData;
    },
  };

  useEffect(() => {
    if (imageData) {
      setOriginal(imageData);
      setTransformationStack([]);
    }
  }, [imageData]);

  useEffect(() => {
    if (canvasRef.current && original) {
      const processedImageData = new ImageData(
        new Uint8ClampedArray(original.data),
        original.width,
        original.height
      );
      transformationStack.forEach((transformation) => {
        if (Transformations[transformation.type]) {
          Transformations[transformation.type](
            processedImageData,
            transformation.intensity
          );
        }
      });
      const ctx = canvasRef.current.getContext("2d");
      ctx.putImageData(processedImageData, 0, 0);
    }
  }, [transformationStack, original]);

  const addTransformation = (type) => {
    if (transformationStack.some((t) => t.type === type)) {
      return;
    }
    let defaultIntensity;

    if (type === "grayscale") {
      defaultIntensity = 0.7;
    } else if (
      type === "brightness" ||
      type === "contrast" ||
      type === "exposure"
    ) {
      defaultIntensity = 1.2;
    } else if (type === "alpha") {
      defaultIntensity = 1;
    } else {
      defaultIntensity = 0.5;
    }

    setTransformationStack((prev) => [
      ...prev,
      {
        id: Date.now(),
        type,
        intensity: defaultIntensity,
      },
    ]);
  };

  const updateTransformationIntensity = (id, intensity) => {
    setTransformationStack((prev) =>
      prev.map((transformation) =>
        transformation.id === id
          ? { ...transformation, intensity }
          : transformation
      )
    );
  };

  const removeTransformation = (id) => {
    setTransformationStack((prev) => prev.filter((t) => t.id !== id));
  };

  const resetTransformations = () => {
    setTransformationStack([]);
  };

  return (
    <div className="bg-gray-700/50 backdrop-blur-sm rounded-xl p-4">
      <div className="flex border-b mb-4">
        <button
          onClick={() => setActiveTab("filters")}
          className={`px-4 py-2 font-medium ${
            activeTab === "filters"
              ? "border-b-2 border-blue-500 text-blue-500"
              : "text-gray-300"
          }`}
        >
          Filters
        </button>
        <button
          onClick={() => setActiveTab("adjustments")}
          className={`px-4 py-2 font-medium ${
            activeTab === "adjustments"
              ? "border-b-2 border-blue-500 text-blue-500"
              : "text-gray-300"
          }`}
        >
          Adjustments
        </button>
      </div>

      {activeTab === "filters" && (
        <div className="grid grid-cols-3 gap-2">
          {["grayscale", "sepia", "invert"].map((filter) => {
            const Icon = FilterIcons[filter];
            return (
              <button
                key={filter}
                onClick={() => addTransformation(filter)}
                className="p-3 rounded-lg flex flex-col items-center gap-2 bg-gray-600/50 text-gray-300 hover:bg-gray-500/50 transition-all"
              >
                <Icon size={20} />
                <span className="text-xs capitalize">{filter}</span>
              </button>
            );
          })}
        </div>
      )}

      {activeTab === "adjustments" && (
        <div className="grid grid-cols-3 gap-2">
          {["brightness", "contrast", "temperature", "exposure", "alpha"].map(
            (adjustment) => {
              const Icon = FilterIcons[adjustment];
              return (
                <button
                  key={adjustment}
                  onClick={() => addTransformation(adjustment)}
                  className="p-3 rounded-lg flex flex-col items-center gap-2 bg-gray-600/50 text-gray-300 hover:bg-gray-500/50 transition-all"
                >
                  <Icon size={20} />
                  <span className="text-xs capitalize">{adjustment}</span>
                </button>
              );
            }
          )}
        </div>
      )}

      {transformationStack.length > 0 && imageData && (
        <div className="mt-4 bg-gray-600/30 rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-200">Applied Effects</h3>
            <button
              onClick={resetTransformations}
              className="text-red-400 hover:bg-red-400/20 p-1 rounded transition-colors"
            >
              <Trash2 size={20} />
            </button>
          </div>
          <div className="space-y-3">
            {transformationStack.map((transformation) => (
              <div key={transformation.id} className="flex items-center gap-2">
                <span className="text-gray-300 text-sm capitalize">
                  {transformation.type}
                </span>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={transformation.intensity}
                  onChange={(e) =>
                    updateTransformationIntensity(
                      transformation.id,
                      parseFloat(e.target.value)
                    )
                  }
                  className="flex-grow"
                />
                <span className="text-gray-300 text-sm w-8">
                  {transformation.intensity.toFixed(1)}
                </span>
                <button
                  onClick={() => removeTransformation(transformation.id)}
                  className="text-red-400 hover:bg-red-400/20 p-1 rounded transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageFilters;
