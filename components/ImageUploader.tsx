
import React, { ChangeEvent } from 'react';

interface ImageUploaderProps {
  label: string;
  subLabel?: string;
  imagePreview: string | null;
  onImageSelected: (file: File, base64: string, preview: string) => void;
  id: string;
  className?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ label, subLabel, imagePreview, onImageSelected, id, className = "" }) => {
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        onImageSelected(file, base64String, reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="text-center mb-2">
        <label className="block text-sm font-bold text-gray-800">{label}</label>
      </div>
      
      <div className="relative group w-full h-full bg-gray-50 border border-gray-200 hover:border-black transition-colors duration-300">
        <input
          type="file"
          id={id}
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <label
          htmlFor={id}
          className={`
            flex flex-col items-center justify-center w-full h-full cursor-pointer overflow-hidden
            ${imagePreview ? 'bg-white' : 'bg-white hover:bg-gray-50'}
          `}
        >
          {imagePreview ? (
            <>
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="w-full h-full object-contain p-2" 
              />
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <span className="text-xs font-bold uppercase tracking-wider text-black">更換圖片</span>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center p-4 text-center w-full h-full">
              <span className="font-serif text-3xl text-gray-300 mb-2 font-light">+</span>
              <span className="text-[10px] text-gray-400 uppercase tracking-widest">點擊上傳</span>
            </div>
          )}
        </label>
      </div>
    </div>
  );
};
