import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { Plus, Clock, Palette, ArrowRight } from 'lucide-react';
import { Project, Material } from '../types';

interface DashboardProps {
  projects: Project[];
  materials: Material[];
}

export const Dashboard: React.FC<DashboardProps> = ({ projects, materials }) => {
  const navigate = useNavigate();
  const recentProjects = [...projects].sort((a, b) => b.timestamp - a.timestamp).slice(0, 3);

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-gray-500">Ready to start your next renovation?</p>
        </div>
        <Button onClick={() => navigate('/editor')} icon={<Plus size={20} />}>
          Start New Project
        </Button>
      </header>

      {/* Stats / Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between hover:border-brand-200 transition-colors cursor-pointer" onClick={() => navigate('/editor')}>
           <div>
             <p className="text-gray-500 text-sm font-medium">Create</p>
             <p className="text-lg font-bold text-gray-900">New Design</p>
           </div>
           <div className="w-10 h-10 bg-brand-50 rounded-full flex items-center justify-center text-brand-600">
             <Plus size={20} />
           </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between hover:border-brand-200 transition-colors cursor-pointer" onClick={() => navigate('/materials')}>
           <div>
             <p className="text-gray-500 text-sm font-medium">Library</p>
             <p className="text-lg font-bold text-gray-900">{materials.length} Materials</p>
           </div>
           <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
             <Palette size={20} />
           </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between hover:border-brand-200 transition-colors cursor-pointer" onClick={() => navigate('/history')}>
           <div>
             <p className="text-gray-500 text-sm font-medium">History</p>
             <p className="text-lg font-bold text-gray-900">{projects.length} Projects</p>
           </div>
           <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center text-purple-600">
             <Clock size={20} />
           </div>
        </div>
      </div>

      {/* Recent Projects */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Recent Projects</h2>
          <button onClick={() => navigate('/history')} className="text-brand-600 text-sm font-medium flex items-center hover:underline">
            View All <ArrowRight size={16} className="ml-1" />
          </button>
        </div>
        
        {recentProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentProjects.map(project => (
              <div key={project.id} className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="aspect-video bg-gray-100 relative">
                  <img src={project.generatedImageBase64 || project.originalImageBase64} alt="Project" className="w-full h-full object-cover" />
                  {project.generatedImageBase64 && (
                    <span className="absolute top-2 right-2 bg-brand-500 text-white text-xs px-2 py-1 rounded-full font-medium">Edited</span>
                  )}
                </div>
                <div className="p-4">
                  <p className="text-sm text-gray-500 mb-1">{new Date(project.timestamp).toLocaleDateString()}</p>
                  <p className="text-gray-900 font-medium truncate" title={project.prompt}>{project.prompt}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
            <p className="text-gray-500">No projects yet. Start your first design!</p>
          </div>
        )}
      </section>
    </div>
  );
};