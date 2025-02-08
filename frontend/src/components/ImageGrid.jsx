import React from "react";

const ImageGrid = ({
  images,
  loading,
  onImageSelect,
  onUpload,
  selectedImageId,
  fileInputRef,
}) => {
  return (
    <div className="mb-8">
      <h3 className="text-xl font-semibold text-gray-100 mb-4">Your Images</h3>
      {loading ? (
        <div className="text-center py-4 text-gray-300">
          Loading your images...
        </div>
      ) : (
        <div
          className="grid gap-2 "
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(128px, 128px))",
          }}
        >
          <label className="relative w-32 h-32 box-border border-2 border-dashed border-gray-600 rounded-lg hover:border-purple-500 transition-colors">
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => onUpload(e.target.files[0])}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              accept="image/*"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <svg
                className="w-8 h-8 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              <span className="mt-2 text-sm text-gray-400">Upload New</span>
            </div>
          </label>

          {images.map((img) => (
            <div
              key={img.id}
              onClick={() => onImageSelect(img)}
              className={`relative w-32 h-32 box-border rounded-lg overflow-hidden cursor-pointer border-2 transition-colors ${
                selectedImageId === img.id
                  ? "border-purple-500"
                  : "border-transparent"
              }`}
            >
              <img
                src={img.image}
                alt={img.title}
                className="block w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-opacity" />
              {img.title && (
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-gray-100 p-1 text-xs truncate">
                  {img.title}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageGrid;
