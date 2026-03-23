import React, { useState, useEffect } from 'react';
import StudentSidebar from '../../components/StudentSidebar';
import DashboardHeader from '../../components/DashboardHeader';
import courseService from '../../services/courseService';
import { useNavigate } from 'react-router-dom';
import '../../styles/dashboard.css';

const MyClasses = () => {
  const [filter, setFilter] = useState('all');
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const data = await courseService.getMyEnrollments();
        setEnrollments(data);
      } catch (err) {
        console.error("Erro ao carregar matrículas:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEnrollments();
  }, []);

  // Transformar enrollments em uma lista de cursos para exibição básica
  const myCourses = enrollments.map(e => ({
    ...e.course,
    enrollment_id: e.id,
    is_active: e.is_active
  }));

  const filteredCourses = myCourses.filter(c => {
    if (filter === 'all') return true;
    if (filter === 'active') return c.is_active;
    if (filter === 'pending') return !c.is_active;
    return true;
  });

  return (
    <div className="dashboard-wrapper">
      <StudentSidebar active="aulas" />
      
      <main className="dashboard-main">
        <DashboardHeader />
        <div className="dashboard-content animate-fade-in">
          <header className="page-header-flex">
            <div>
              <h1>Meus Cursos</h1>
              <p className="subtitle">Gerencie seu aprendizado e acesse o conteúdo.</p>
            </div>
          </header>

          <div className="filter-pills">
            {[
              { id: 'all', label: 'Todos' },
              { id: 'active', label: 'Ativos' },
              { id: 'pending', label: 'Aguardando Pagamento' }
            ].map(f => (
              <button 
                key={f.id} 
                className={`pill-btn ${filter === f.id ? 'active' : ''}`}
                onClick={() => setFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>

          {loading ? (
             <div style={{ textAlign: 'center', padding: '50px' }}>Carregando seus cursos...</div>
          ) : (
            <div className="lessons-grid-list">
              {filteredCourses.length > 0 ? filteredCourses.map(course => (
                <div key={course.id} className={`lesson-item-modern ${!course.is_active && !course.is_free ? 'is-locked' : ''}`}>
                  <div className="lesson-visual" style={{ background: 'var(--grad-primary)', color: 'white' }}>
                    📚
                  </div>
                  <div className="lesson-content-main">
                    <span className="lesson-tag">Curso</span>
                    <h3>{course.title}</h3>
                    <div className="lesson-meta-row">
                      <span>{course.is_free ? '✨ Gratuito' : '💳 Pago'}</span>
                      <span>{course.is_active ? '✅ Acesso Liberado' : '⏳ Aguardando Ativação'}</span>
                    </div>
                  </div>
                  <div className="lesson-cta">
                    { (course.is_active || course.is_free) ? (
                      <button 
                        className="btn btn-accent small"
                        onClick={() => navigate(`/player/${course.slug || course.id}`)}
                      >
                        Acessar Player
                      </button>
                    ) : (
                      <button className="btn btn-disabled small" disabled>Bloqueado</button>
                    )}
                  </div>
                </div>
              )) : (
                <div style={{ textAlign: 'center', padding: '50px', color: '#64748b' }}>
                  Nenhum curso encontrado nesta categoria.
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <style>{`
        .filter-pills { display: flex; gap: 10px; margin-bottom: 35px; overflow-x: auto; padding-bottom: 10px; }
        .pill-btn { padding: 10px 22px; border-radius: 30px; border: 1px solid #e2e8f0; background: white; font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.2s; white-space: nowrap; }
        .pill-btn.active { background: var(--primary-color); color: white; border-color: var(--primary-color); box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2); }
        
        .lessons-grid-list { display: flex; flex-direction: column; gap: 15px; }
        .lesson-item-modern { 
          background: white; 
          border-radius: 20px; 
          padding: 20px; 
          display: flex; 
          align-items: center; 
          gap: 25px; 
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
          transition: all 0.2s;
          border: 1px solid transparent;
        }
        .lesson-item-modern:hover { transform: translateX(8px); border-color: #e2e8f0; }
        .lesson-item-modern.is-locked { opacity: 0.7; }
        
        .lesson-visual { width: 80px; height: 80px; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 32px; flex-shrink: 0; }
        .lesson-content-main { flex: 1; }
        .lesson-tag { font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; }
        .lesson-content-main h3 { font-size: 17px; margin: 4px 0 8px; color: #1e293b; }
        .lesson-meta-row { display: flex; gap: 20px; font-size: 13px; color: #64748b; font-weight: 600; }
        
        .lesson-cta { flex-shrink: 0; }
        .btn.small { padding: 8px 18px; font-size: 12px; }
        .btn-disabled { background: #f1f5f9; color: #94a3b8; cursor: not-allowed; border: none; }

        @media (max-width: 768px) {
          .lesson-item-modern { flex-direction: column; text-align: center; }
          .lesson-cta { width: 100%; }
          .lesson-cta .btn { width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default MyClasses;
