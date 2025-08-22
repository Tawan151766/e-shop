// src/module/product/ProductGallery.js
"use client";
import { useState } from "react";

export default function ProductGallery({ galleries = [], onImageSelect }) {
  const [selectedImage, setSelectedImage] = useState(0);

  if (!galleries.length) return null;

  const handleImageClick = (index) => {
    setSelectedImage(index);
    if (onImageSelect) {
      onImageSelect(galleries[index].imageUrl);
    }
  };

  return (
    <div className="px-4 pb-4">
      <h3 className="text-[#181411] text-lg font-bold leading-tight tracking-[-0.015em] pb-2 pt-2">
        รูปภาพสินค้า ({galleries.length})
      </h3>
      
      {/* Main Selected Image */}
      {galleries.length > 1 && (
        <div className="mb-4">
          <img
            src={galleries[selectedImage]?.imageUrl}
            alt={`Product image ${selectedImage + 1}`}
            className="w-full aspect-square object-cover rounded-lg border-2 border-gray-200"
          />
        </div>
      )}

      {/* Thumbnail Grid */}
      <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
        {galleries.map((gallery, index) => (
          <div
            key={gallery.id}
            className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
              selectedImage === index 
                ? "border-[#eb9947] ring-2 ring-[#eb9947] ring-opacity-50" 
                : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={() => handleImageClick(index)}
          >
            <img
              src={gallery.imageUrl}
              alt={`Thumbnail ${index + 1}`}
              className="w-full aspect-square object-cover"
            />
            {selectedImage === index && (
              <div className="absolute inset-0 bg-[#eb9947] bg-opacity-10 flex items-center justify-center">
                <div className="w-6 h-6 bg-[#eb9947] rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Image Counter */}
      <div className="mt-2 text-center text-sm text-gray-500">
        {selectedImage + 1} / {galleries.length}
      </div>
    </div>
  );
}