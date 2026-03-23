import React from 'react';
import StudentSidebar from '../../components/StudentSidebar';
import DashboardHeader from '../../components/DashboardHeader';
import '../../styles/dashboard.css';
const Materials = () => {
  const download = (type) => {
    alert(`Iniciando download do ${type}...\n(Integração com armazenamento de arquivos em breve!)`);
  };

  const materialSections = [
    {
      title: '📄 PDFs & Apostilas',
      items: [
        { icon: '📖', title: 'Apostila Completa — Módulo 1', meta: '2.4 MB · 48 páginas', type: 'PDF', color: '#fde3d0' },
        { icon: '📝', title: 'Lista de Vocabulary — 500 Palavras', meta: '1.1 MB · 20 páginas', type: 'PDF', color: '#fde3d0' },
        { icon: '📋', title: 'Exercícios Gramaticais — Módulo 1', meta: '800 KB · 15 páginas', type: 'PDF', color: '#fde3d0' },
        { icon: '🗺️', title: 'Mapa Mental — Tempos Verbais', meta: '600 KB · Infográfico', type: 'PDF', color: '#fde3d0' },
      ]
    },
    {
      title: '🎧 Áudios de Pronúncia',
      items: [
        { icon: '🔊', title: 'Pronúncia das Vogais Inglesas', meta: '12 min · MP3', type: 'Áudio', color: '#d5f0e0' },
        { icon: '🎙️', title: 'Diálogos para Iniciantes', meta: '28 min · MP3', type: 'Áudio', color: '#d5f0e0' },
        { icon: '🎵', title: 'Shadowing — Conversas Básicas', meta: '35 min · MP3', type: 'Áudio', color: '#d5f0e0' },
      ]
    },
    {
      title: '🎬 Vídeos Extras',
      items: [
        { icon: '🎥', title: 'Dicas de Pronúncia com Sarah', meta: '18 min · HD', type: 'Vídeo', color: '#d0e8ff' },
        { icon: '📺', title: 'Expressões Idiomáticas Populares', meta: '22 min · HD', type: 'Vídeo', color: '#d0e8ff' },
      ]
    }
  ];

  return (
    <div className="dashboard-wrapper">
      <StudentSidebar active="materiais" />
      
      <main className="dashboard-main">
        <DashboardHeader />
        <div className="dashboard-content animate-fade-in">
          <header className="page-header-flex">
            <div>
              <h1>Materiais de Estudo</h1>
              <p className="subtitle">Baixe PDFs, ouça áudios e acesse materiais complementares.</p>
            </div>
          </header>

          {materialSections.map((section, idx) => (
            <section key={idx} className="material-section">
              <h2 className="section-title">{section.title}</h2>
              <div className="materials-grid-modern">
                {section.items.map((item, i) => (
                  <div key={i} className="material-card-modern" onClick={() => download(item.type)}>
                    <div className="material-icon-hero">{item.icon}</div>
                    <div className="material-card-body">
                      <h4>{item.title}</h4>
                      <p>{item.meta}</p>
                      <span className="type-badge" style={{ backgroundColor: item.color }}>{item.type}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>

      <style>{`
        .material-section { margin-bottom: 50px; }
        .materials-grid-modern { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
        
        .material-card-modern { 
          background: white; 
          border-radius: 24px; 
          overflow: hidden; 
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); 
          transition: all 0.3s; 
          cursor: pointer;
          border: 1px solid #f1f5f9;
        }
        
        .material-card-modern:hover { transform: translateY(-8px); box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); border-color: var(--accent-color); }
        
        .material-icon-hero { height: 120px; background: #f8fafc; display: flex; align-items: center; justify-content: center; font-size: 50px; }
        .material-card-body { padding: 25px; }
        .material-card-body h4 { font-size: 15px; font-weight: 800; margin-bottom: 8px; line-height: 1.4; color: #1e293b; }
        .material-card-body p { font-size: 12px; color: #64748b; margin-bottom: 15px; }
        
        .type-badge { padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 800; text-transform: uppercase; color: rgba(0,0,0,0.5); }
      `}</style>
    </div>
  );
};

export default Materials;
