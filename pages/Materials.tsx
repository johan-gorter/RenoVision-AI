import React, { useState, useRef } from 'react';
import { Material } from '../types';
import { Button } from '../components/Button';
import { Upload, Trash2, Camera } from 'lucide-react';

interface MaterialsProps {
  materials: Material[];
  onAddMaterial: (material: Material) => void;
  onDeleteMaterial: (id: string) => void;
}

export const Materials: React.FC<MaterialsProps> = ({ materials, onAddMaterial, onDeleteMaterial }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      const newMaterial: Material = {
        id: Date.now().toString(),
        name: file.name.split('.')[0],
        category: 'other',
        imageBase64: base64,
        timestamp: Date.now()
      };
      onAddMaterial(newMaterial);
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Material Library</h1>
          <p className="text-gray-500">Upload textures, colors, and items to use in your designs.</p>
        </div>
        <div>
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileUpload}
            />
            <Button onClick={() => fileInputRef.current?.click()} icon={<Upload size={18} />} disabled={isUploading}>
                {isUploading ? 'Uploading...' : 'Add Material'}
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {materials.map((mat) => (
          <div key={mat.id} className="group relative bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm aspect-square">
            <img src={mat.imageBase64} alt={mat.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
               <p className="text-white font-medium truncate">{mat.name}</p>
               <button 
                onClick={(e) => { e.stopPropagation(); onDeleteMaterial(mat.id); }}
                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
               >
                 <Trash2 size={16} />
               </button>
            </div>
          </div>
        ))}
        
        {/* Empty State placeholder if needed, usually cleaner to leave empty or show message if list is empty */}
        {materials.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-500 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                <Camera className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                <p>No materials yet. Upload pictures of wood, paint swatches, or furniture!</p>
            </div>
        )}
      </div>
    </div>
  );
};