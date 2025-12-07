import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { User, Project, Material } from './types';
import { Login } from './pages/Login';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Editor } from './pages/Editor';
import { History } from './pages/History';
import { Materials } from './pages/Materials';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);

  // Load data from local storage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('renovision_user');
    const storedProjects = localStorage.getItem('renovision_projects');
    const storedMaterials = localStorage.getItem('renovision_materials');

    if (storedUser) setUser(JSON.parse(storedUser));
    if (storedProjects) setProjects(JSON.parse(storedProjects));
    if (storedMaterials) setMaterials(JSON.parse(storedMaterials));
  }, []);

  // Save data effects
  useEffect(() => {
    if (user) localStorage.setItem('renovision_user', JSON.stringify(user));
    else localStorage.removeItem('renovision_user');
  }, [user]);

  useEffect(() => {
    localStorage.setItem('renovision_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('renovision_materials', JSON.stringify(materials));
  }, [materials]);

  const handleLogin = (newUser: User) => setUser(newUser);
  const handleLogout = () => setUser(null);

  const handleSaveProject = (project: Project) => {
    setProjects(prev => [...prev, project]);
  };

  const handleDeleteProject = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  const handleAddMaterial = (material: Material) => {
    setMaterials(prev => [...prev, material]);
  };

  const handleDeleteMaterial = (id: string) => {
    setMaterials(prev => prev.filter(m => m.id !== id));
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Router>
      <Layout user={user} onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<Dashboard projects={projects} materials={materials} />} />
          <Route path="/editor" element={<Editor onSaveProject={handleSaveProject} materials={materials} />} />
          <Route path="/materials" element={<Materials materials={materials} onAddMaterial={handleAddMaterial} onDeleteMaterial={handleDeleteMaterial} />} />
          <Route path="/history" element={<History projects={projects} onDeleteProject={handleDeleteProject} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;