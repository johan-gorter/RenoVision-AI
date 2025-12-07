import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Project, Material, ToolMode } from '../types';
import { Button } from '../components/Button';
import { CanvasEditor } from '../components/CanvasEditor';
import { generateRenovation } from '../services/geminiService';
import { Upload, Wand2, Eraser, Brush, Undo, Save, ArrowLeft, Image as ImageIcon } from 'lucide-react';

interface EditorProps {
  onSaveProject: (project: Project) => void;
  materials: Material[];
}

export const Editor: React.FC<EditorProps> = ({ onSaveProject, materials }) => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [maskImage, setMaskImage] = useState<string | null>(null);
  
  const [prompt, setPrompt] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  
  const [mode, setMode] = useState<ToolMode>('view'); // view, brush, eraser (conceptually, though our canvas is simple mask drawing)
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setOriginalImage(event.target?.result as string);
      setGeneratedImage(null);
      setMaskImage(null);
      setMode('brush'); // Auto switch to brush for convenience
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if (!originalImage || !prompt.trim()) return;

    setIsProcessing(true);
    setError(null);

    try {
      const resultImage = await generateRenovation({
        prompt: prompt,
        originalImage: originalImage,
        maskImage: maskImage || undefined,
        materialImage: selectedMaterial?.imageBase64,
      });

      setGeneratedImage(resultImage);

      // Save automatically or user can save explicitly? Let's save logic here.
      const newProject: Project = {
        id: Date.now().toString(),
        originalImageBase64: originalImage,
        generatedImageBase64: resultImage,
        prompt: prompt,
        maskImageBase64: maskImage || undefined,
        usedMaterialId: selectedMaterial?.id,
        timestamp: Date.now()
      };
      onSaveProject(newProject);
      
    } catch (err: any) {
      setError(err.message || 'Failed to generate renovation. Try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-24 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
            <button onClick={() => navigate('/')} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                <ArrowLeft size={20} />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Editor</h1>
        </div>
        {originalImage && (
             <Button 
                variant="secondary" 
                onClick={() => {
                    setOriginalImage(null); 
                    setGeneratedImage(null); 
                    setPrompt('');
                    setMaskImage(null);
                }}
             >
                Reset
             </Button>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-0">
        
        {/* Left Column: Canvas / Preview */}
        <div className="lg:col-span-2 flex flex-col gap-4 min-h-[500px]">
           {!originalImage ? (
               <div 
                className="flex-1 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
               >
                   <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*" 
                        onChange={handleFileUpload}
                   />
                   <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center text-brand-600 mb-4">
                       <Upload size={32} />
                   </div>
                   <h3 className="text-xl font-medium text-gray-900">Upload a photo of your room</h3>
                   <p className="text-gray-500 mt-2">JPG or PNG supported</p>
               </div>
           ) : (
               <div className="flex-1 bg-gray-900 rounded-xl overflow-hidden relative flex items-center justify-center">
                   {/* If we have a generated result, show it. Otherwise show editor */}
                   {generatedImage ? (
                       <div className="relative w-full h-full flex items-center justify-center">
                           <img src={generatedImage} alt="Result" className="max-w-full max-h-full object-contain" />
                           <div className="absolute top-4 right-4 flex gap-2">
                               <Button variant="secondary" onClick={() => setGeneratedImage(null)} className="shadow-lg bg-white/90 backdrop-blur">
                                   <Undo size={16} className="mr-2" /> Back to Edit
                               </Button>
                           </div>
                       </div>
                   ) : (
                       <div className="w-full h-full flex flex-col">
                           {/* Toolbar */}
                           <div className="bg-white border-b p-2 flex justify-center gap-2">
                               <button 
                                onClick={() => setMode('brush')}
                                className={`p-2 rounded flex items-center gap-2 ${mode === 'brush' ? 'bg-brand-100 text-brand-700' : 'hover:bg-gray-100 text-gray-600'}`}
                               >
                                   <Brush size={18} /> <span className="text-sm font-medium">Mark Area</span>
                               </button>
                               <button 
                                onClick={() => setMode('eraser')}
                                className={`p-2 rounded flex items-center gap-2 ${mode === 'eraser' ? 'bg-brand-100 text-brand-700' : 'hover:bg-gray-100 text-gray-600'}`}
                               >
                                   <Eraser size={18} /> <span className="text-sm font-medium">Eraser</span>
                               </button>
                               <div className="w-px bg-gray-200 mx-2" />
                               <span className="text-xs text-gray-400 flex items-center">
                                   Draw on the image to select area
                               </span>
                           </div>
                           
                           {/* Canvas */}
                           <div className="flex-1 bg-gray-100 overflow-hidden relative p-4 flex items-center justify-center">
                               <CanvasEditor 
                                    backgroundImage={originalImage}
                                    mode={mode}
                                    brushSize={30}
                                    onMaskChange={setMaskImage}
                               />
                           </div>
                       </div>
                   )}
               </div>
           )}
        </div>

        {/* Right Column: Controls */}
        <div className="flex flex-col gap-6 overflow-y-auto">
            
            {/* 1. Prompt */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Wand2 size={18} className="text-brand-500" />
                    Describe the Change
                </h3>
                <textarea 
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g. 'Paint the walls sage green', 'Remove the chair', 'Add a modern rug'"
                    className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none resize-none text-sm"
                />
            </div>

            {/* 2. Materials (Optional) */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <ImageIcon size={18} className="text-blue-500" />
                        Use Material (Optional)
                    </h3>
                    <button onClick={() => navigate('/materials')} className="text-xs text-brand-600 hover:underline">Manage</button>
                </div>
                
                {materials.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto p-1">
                        {materials.map(mat => (
                            <div 
                                key={mat.id}
                                onClick={() => setSelectedMaterial(selectedMaterial?.id === mat.id ? null : mat)}
                                className={`aspect-square rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                                    selectedMaterial?.id === mat.id ? 'border-brand-500 ring-2 ring-brand-200' : 'border-transparent hover:border-gray-300'
                                }`}
                            >
                                <img src={mat.imageBase64} alt={mat.name} className="w-full h-full object-cover" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-gray-500 italic">No materials saved yet.</p>
                )}
                {selectedMaterial && (
                    <p className="mt-2 text-xs text-gray-600">Selected: <span className="font-medium">{selectedMaterial.name}</span></p>
                )}
            </div>

            {/* Generate Button */}
            <div className="pt-4">
                <Button 
                    onClick={handleGenerate} 
                    disabled={!originalImage || !prompt.trim() || isProcessing}
                    isLoading={isProcessing}
                    className="w-full py-3 text-lg shadow-lg shadow-brand-200"
                >
                    {isProcessing ? 'Designing...' : 'Generate Renovation'}
                </Button>
                {error && (
                    <p className="mt-3 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
                        {error}
                    </p>
                )}
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg text-xs text-blue-700">
                <p className="font-semibold mb-1">Tip:</p>
                Masking helps Gemini focus. If you want to change the wall, draw over the wall. If you want to remove an object, draw over the object.
            </div>
        </div>

      </div>
    </div>
  );
};