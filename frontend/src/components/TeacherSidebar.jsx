
import React from 'react';
import { Link } from 'react-router-dom';

const TeacherSidebar = ({ active }) => {
  return (
    <aside className="dashboard-sidebar teacher-sidebar">
      <div className="sidebar-brand">
        <Link to="/">English<span>Academy</span></Link>
      </div>
      
      <nav className="sidebar-menu">
        <p className="menu-label">Gestão</p>
        <Link to="/teacher/dashboard" className={`menu-item ${active === 'dashboard' ? 'active' : ''}`}>📊 Painel Geral</Link>
        <Link to="/teacher/gestao-aulas" className={`menu-item ${active === 'gestao-aulas' ? 'active' : ''}`}>🎬 Gerenciar Aulas</Link>
        <Link to="/teacher/alunos" className={`menu-item ${active === 'alunos' ? 'active' : ''}`}>👥 Meus Alunos</Link>
        
        <p className="menu-label">Conteúdo</p>
        <Link to="/teacher/upload" className={`menu-item ${active === 'upload' ? 'active' : ''}`}>📁 Upload Materiais</Link>
        
        <p className="menu-label">Conta</p>
        <Link to="/teacher/perfil" className={`menu-item ${active === 'perfil' ? 'active' : ''}`}>⚙️ Perfil Docente</Link>
        <button onClick={() => { localStorage.clear(); window.location.href = "/login"; }} className="menu-item logout-btn" style={{ marginTop: '20px', color: '#ff6b6b' }}>🚪 Sair da Conta</button>
      </nav>
      
      <style>{`
        .teacher-sidebar { background: #0f172a !important; }
      `}</style>
    </aside>
  );
};

export default TeacherSidebar;
