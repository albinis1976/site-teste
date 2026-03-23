import React, { useState } from 'react';
import TeacherSidebar from '../../components/TeacherSidebar';

const ManageClasses = () => {
  const [lessons, setLessons] = useState([
    { id: 1, title: 'Introdução ao Curso', course: 'Inglês para Iniciantes', duration: '15 min', status: 'published' },
    { id: 2, title: 'Verbos Essenciais', course: 'Inglês para Iniciantes', duration: '22 min', status: 'published' },
    { id: 3, title: 'Pronúncia Avançada', course: 'Inglês Intermediário', duration: '30 min', status: 'draft' },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="dashboard-wrapper">
      <TeacherSidebar active="gestao-aulas" />
      
      <main className="dashboard-main">
        <header className="dashboard-header">
          <div className="header-search">
            <span className="search-icon">🔍</span>
            <input type="text" placeholder="Pesquisar aulas..." />
          </div>
          <button className="btn btn-accent" onClick={() => setIsModalOpen(true)}>+ Nova Aula</button>
        </header>

        <div className="dashboard-content animate-fade-in">
          <div className="content-header-flex">
            <div>
              <h1>Gerenciar Aulas</h1>
              <p>Crie, edite e organize as aulas dos seus cursos.</p>
            </div>
          </div>

          <div className="table-container-modern">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Título da Aula</th>
                  <th>Curso</th>
                  <th>Duração</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {lessons.map(lesson => (
                  <tr key={lesson.id}>
                    <td>{lesson.id}</td>
                    <td><strong>{lesson.title}</strong></td>
                    <td>{lesson.course}</td>
                    <td>{lesson.duration}</td>
                    <td>
                      <span className={`badge-status ${lesson.status}`}>
                        {lesson.status === 'published' ? 'Publicada' : 'Rascunho'}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-outline-sm" onClick={() => setIsModalOpen(true)}>Editar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {isModalOpen && (
        <div className="modal-overlay-modern">
          <div className="modal-box-modern">
            <div className="modal-header">
              <h2>Nova Aula / Editar Aula</h2>
              <button className="close-modal" onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <form className="modal-form" onSubmit={(e) => { e.preventDefault(); setIsModalOpen(false); alert('Aula salva!'); }}>
              <div className="form-group-modern">
                <label>Título da Aula</label>
                <input type="text" placeholder="Ex: Vocabulário do Dia a Dia" required />
              </div>
              <div className="form-group-modern">
                <label>Conteúdo / Descrição</label>
                <textarea rows="4" placeholder="Descreva o conteúdo..." required></textarea>
              </div>
              <div className="form-row-flex">
                <div className="form-group-modern">
                  <label>URL do Vídeo</label>
                  <input type="url" placeholder="https://youtube.com/..." />
                </div>
                <div className="form-group-modern">
                  <label>Duração (min)</label>
                  <input type="number" defaultValue="15" />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Salvar Aula</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .table-container-modern { background: white; border-radius: 20px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); overflow: hidden; margin-top: 30px; }
        .modern-table { width: 100%; border-collapse: collapse; }
        .modern-table th { background: #f8fafc; text-align: left; padding: 20px; font-size: 12px; font-weight: 800; text-transform: uppercase; color: #64748b; letter-spacing: 1px; }
        .modern-table td { padding: 20px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
        .modern-table tr:hover { background: #fcfdfe; }
        
        .badge-status { padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 800; text-transform: uppercase; }
        .badge-status.published { background: #dcfce7; color: #166534; }
        .badge-status.draft { background: #fef9c3; color: #854d0e; }
        
        .btn-outline-sm { padding: 6px 12px; font-size: 12px; background: white; border: 1px solid #e2e8f0; border-radius: 8px; font-weight: 700; cursor: pointer; transition: all 0.2s; }
        .btn-outline-sm:hover { color: var(--primary-color); border-color: var(--primary-color); }

        /* Modal Styles */
        .modal-overlay-modern { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; }
        .modal-box-modern { background: white; width: 600px; max-width: 90%; border-radius: 24px; padding: 40px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); }
        .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
        .modal-header h2 { font-size: 20px; font-weight: 800; }
        .close-modal { font-size: 30px; background: none; border: none; cursor: pointer; color: #94a3b8; }
        
        .form-row-flex { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; }
        .modal-footer { display: flex; gap: 15px; margin-top: 30px; }
        .modal-footer button { flex: 1; padding: 12px; }
      `}</style>
    </div>
  );
};

export default ManageClasses;
