// src/module/payment/SlipUpload.js
"use client";
import { useState, useRef } from "react";
import { Upload, Image, Check, X } from "lucide-react";

export default function SlipUpload({ onUpload, isUploading, hasSlip, slipUrl }) {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState(slipUrl || null);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("กรุณาเลือกไฟล์รูปภาพเท่านั้น");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("ไฟล์รูปภาพต้องมีขนาดไม่เกิน 5MB");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
    };
    reader.readAsDataURL(file);

    // Upload file
    onUpload(file);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        อัปโหลดสลิปการโอนเงิน
      </h3>

      {hasSlip && slipUrl ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-green-600">
            <Check className="w-5 h-5" />
            <span className="font-medium">อัปโหลดสลิปเรียบร้อยแล้ว</span>
          </div>
          
          <div className="relative">
            <img
              src={slipUrl}
              alt="Payment slip"
              className="w-full max-w-sm mx-auto rounded-lg border border-gray-200"
            />
          </div>
          
          <p className="text-sm text-gray-600 text-center">
            รอการตรวจสอบจากเจ้าหน้าที่
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div
            className={`
              relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
              ${dragActive
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-gray-400"
              }
              ${isUploading ? "opacity-50 pointer-events-none" : "cursor-pointer"}
            `}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={openFileDialog}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleChange}
              className="hidden"
            />

            {isUploading ? (
              <div className="space-y-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600">กำลังอัปโหลด...</p>
              </div>
            ) : preview ? (
              <div className="space-y-4">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full max-w-sm mx-auto rounded-lg border border-gray-200"
                />
                <p className="text-sm text-gray-600">
                  คลิกเพื่อเปลี่ยนรูปภาพ
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="mx-auto w-12 h-12 text-gray-400">
                  <Upload className="w-full h-full" />
                </div>
                
                <div>
                  <p className="text-lg font-medium text-gray-900">
                    อัปโหลดสลิปการโอนเงิน
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    ลากและวางไฟล์ หรือคลิกเพื่อเลือกไฟล์
                  </p>
                </div>
                
                <p className="text-xs text-gray-500">
                  รองรับไฟล์: JPG, PNG, GIF (ขนาดไม่เกิน 5MB)
                </p>
              </div>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-3">
              <Image className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">เคล็ดลับการถ่ายสลิป:</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>ถ่ายให้เห็นข้อมูลครบถ้วน (วันที่, เวลา, ยอดเงิน, บัญชีปลายทาง)</li>
                  <li>รูปภาพชัดเจน ไม่เบลอ</li>
                  <li>แสงเพียงพอ ไม่มีเงาบัง</li>
                  <li>ตรวจสอบยอดเงินให้ตรงกับที่ระบุ</li>
                  <li>ตรวจสอบเลขที่บัญชีปลายทางให้ถูกต้อง</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}