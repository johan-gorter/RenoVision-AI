import React, { useState } from 'react';
import { Project } from '../types';
import { Trash2, ZoomIn } from 'lucide-react';
import { Button } from '../components/Button';

interface HistoryProps {
  projects: Project[];
  onDeleteProject: (id: string) => void;
}

export const History: React.FC<HistoryProps> = ({ projects, onDeleteProject }) => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Project History</h1>
          <p className="text-gray-500">View and compare your past renovations.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...projects].sort((a,b) => b.timestamp - a.timestamp).map((project) => (
          <div key={project.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
            <div className="relative aspect-video group cursor-pointer" onClick={() => setSelectedProject(project)}>
                {/* Show Generated if available, else original */}
               <img 
                 src={project.generatedImageBase64 || project.originalImageBase64} 
                 alt="Project thumbnail" 
                 className="w-full h-full object-cover"
               />
               <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <ZoomIn className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" size={32} />
               </div>
               {project.generatedImageBase64 && (
                   <span className="absolute top-2 right-2 bg-brand-500 text-white text-xs px-2 py-1 rounded-full font-medium shadow-sm">
                       Edited
                   </span>
               )}
            </div>
            <div className="p-4 flex-1 flex flex-col">
               <p className="text-sm text-gray-500 mb-2">{new Date(project.timestamp).toLocaleString()}</p>
               <p className="font-medium text-gray-900 mb-4 line-clamp-2 italic">"{project.prompt}"</p>
               <div className="mt-auto flex justify-end">
                   <button 
                     onClick={() => onDeleteProject(project.id)}
                     className="text-gray-400 hover:text-red-500 transition-colors text-sm flex items-center gap-1"
                   >
                       <Trash2 size={16} /> Delete
                   </button>
               </div>
            </div>
          </div>
        ))}

        {projects.length === 0 && (
            <div className="col-span-full py-20 text-center text-gray-500">
                No history found. Create your first project!
            </div>
        )}
      </div>

      {/* Modal for viewing before/after */}
      {selectedProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedProject(null)}>
              <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-auto p-6" onClick={e => e.stopPropagation()}>
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-bold">Project Details</h3>
                      <button onClick={() => setSelectedProject(null)} className="text-gray-500 hover:text-gray-900">Close</button>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                      <div>
                          <p className="text-sm font-medium text-gray-500 mb-2">Original</p>
                          <img src={selectedProject.originalImageBase64} className="w-full rounded-lg bg-gray-100" alt="Original" />
                      </div>
                      {selectedProject.generatedImageBase64 ? (
                        <div>
                            <p className="text-sm font-medium text-brand-600 mb-2">AI Generated Result</p>
                            <img src={selectedProject.generatedImageBase64} className="w-full rounded-lg bg-gray-100 border-2 border-brand-500" alt="Generated" />
                        </div>
                      ) : (
                        <div className="flex items-center justify-center bg-gray-50 rounded-lg text-gray-400">
                            No result generated yet
                        </div>
                      )}
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="font-semibold text-gray-700">Prompt Used:</p>
                      <p className="text-gray-900">{selectedProject.prompt}</p>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};