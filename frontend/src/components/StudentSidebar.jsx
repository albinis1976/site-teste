
import React from 'react';
import { Link } from 'react-router-dom';

const StudentSidebar = ({ active }) => {
  return (
    <aside className="dashboard-sidebar">
      <div className="sidebar-brand">
        <Link to="/">English<span>Academy</span></Link>
      </div>
      
      <nav className="sidebar-menu">
        <p className="menu-label">Principal</p>
        <Link to="/dashboard" className={`menu-item ${active === 'dashboard' ? 'active' : ''}`}>📊 Visão Geral</Link>
        <Link to="/aluno/aulas" className={`menu-item ${active === 'aulas' ? 'active' : ''}`}>🎬 Minhas Aulas</Link>
        <Link to="/aluno/progresso" className={`menu-item ${active === 'progresso' ? 'active' : ''}`}>📈 Progresso</Link>
        
        <p className="menu-label">Conteúdo</p>
        <Link to="/aluno/materiais" className={`menu-item ${active === 'materiais' ? 'active' : ''}`}>📄 Materiais PDF</Link>
        <Link to="/aluno/certificados" className={`menu-item ${active === 'certificados' ? 'active' : ''}`}>🏆 Certificados</Link>
        
        <p className="menu-label">Conta</p>
        <Link to="/aluno/configuracoes" className={`menu-item ${active === 'configuracoes' ? 'active' : ''}`}>⚙️ Configurações</Link>
        <button onClick={() => { localStorage.clear(); window.location.href = "/login"; }} className="menu-item logout-btn" style={{ marginTop: '20px', color: '#ff6b6b' }}>🚪 Sair da Conta</button>
      </nav>
    </aside>
  );
};

export default StudentSidebar;
