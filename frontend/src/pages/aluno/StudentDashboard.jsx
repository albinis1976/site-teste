import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import userService from '../../services/userService';
import StudentSidebar from '../../components/StudentSidebar';
import DashboardHeader from '../../components/DashboardHeader';
import '../../styles/dashboard.css';

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('checkout') === 'success') {
      setCheckoutSuccess(true);
      // Clean up URL without triggering a full reload
      window.history.replaceState({}, document.title, location.pathname);
    }
  }, [location]);

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const data = await userService.getMyEnrollments();
        setEnrollments(data);
      } catch (err) {
        // Suppress failure logs cleanly
      } finally {
        setLoading(false);
      }
    };
    fetchEnrollments();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getFirstName = () => {
    const rawName = user?.first_name || user?.full_name?.split(' ')[0] || user?.username || 'Estudante';
    return rawName.replace(/[<>]/g, ''); 
  };

  return (
    <div className="dashboard-wrapper">
      <StudentSidebar active="dashboard" />

      <main className="dashboard-main">
        <DashboardHeader />

        <div className="dashboard-content animate-fade-in">
          {checkoutSuccess && (
            <div className="checkout-success-banner animate-fade-in">
              <span>✅ <strong>Pagamento Aprovado!</strong> O curso foi adicionado à sua conta. Bons estudos!</span>
              <button onClick={() => setCheckoutSuccess(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '16px' }}>✕</button>
            </div>
          )}

          <div className="welcome-section-modern">
            <div className="welcome-text">
              <h1 style={{ color: 'white' }}>Bem-vindo de volta, {getFirstName()}! 👋</h1>
              <p>Você já completou 65% da sua meta semanal. Continue assim!</p>
              <Link to="/aluno/aulas" className="btn btn-accent" style={{ marginTop: '20px', display: 'inline-block' }}>
                Retomar última aula
              </Link>
            </div>
            <div className="welcome-illustration">🔥</div>
          </div>

          <div className="stats-grid-dashboard">
            {[
              { label: 'Streak Atual', value: '7 dias', emoji: '🔥', color: '#ff9f43' },
              { label: 'Aulas Concluídas', value: '12', emoji: '📚', color: '#54a0ff' },
              { label: 'Tempo de Estudo', value: '4h 20m', emoji: '⏱', color: '#1dd1a1' },
              { label: 'XP Acumulado', value: '850', emoji: '⭐', color: '#feca57' }
            ].map((stat, i) => (
              <div key={i} className="stat-card">
                <div className="stat-card-icon" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>{stat.emoji}</div>
                <div className="stat-card-info">
                  <h3>{stat.value}</h3>
                  <p>{stat.label}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="dashboard-sections-grid">
            <section className="courses-section">
              <div className="section-header-flex">
                <h2>Meus Cursos</h2>
                <Link to="/courses" className="view-all">Explorar mais →</Link>
              </div>
              
              <div className="enrolled-list">
                {loading ? <p>Carregando cursos...</p> : enrollments.length > 0 ? enrollments.map((e, i) => (
                  <div key={i} className="enrollment-card-mini">
                    <div className="enrollment-icon">🎬</div>
                    <div className="enrollment-details">
                      <h4>{e.course?.title || 'Curso sem título'}</h4>
                      <div className="progress-wrapper-mini">
                        <div className="progress-bar-mini"><div style={{ width: `${e.progress || 0}%` }}></div></div>
                        <span>{e.progress || 0}%</span>
                      </div>
                    </div>
                    <Link to={`/player/${e.course?.slug || e.course?.id}`} className="btn-play">▶</Link>
                  </div>
                )) : (
                  <div className="empty-state">
                    <p>Você ainda não está matriculado em nenhum curso.</p>
                    <Link to="/courses" className="btn btn-outline" style={{ marginTop: '15px', display: 'inline-block' }}>Ver Catálogo</Link>
                  </div>
                )}
              </div>
            </section>

            <section className="events-section">
              <div className="section-header-flex">
                <h2>Próximas Mentorias</h2>
              </div>
              <div className="event-card-item">
                <div className="event-date"><span>MAR</span><strong>18</strong></div>
                <div className="event-info">
                  <h4>Conversação Nível B2</h4>
                  <p>Com Prof. James • 19:00</p>
                </div>
                <button className="btn-join">Entrar</button>
              </div>
              <div className="event-card-item">
                <div className="event-date"><span>MAR</span><strong>20</strong></div>
                <div className="event-info">
                  <h4>Inglês para Entrevistas</h4>
                  <p>Com Profa. Sarah • 14:00</p>
                </div>
                <button className="btn-join disabled" disabled>Agendado</button>
              </div>
            </section>
          </div>
        </div>
      </main>

      <style>{`
        /* Layout styles moved to dashboard.css */
        
        .checkout-success-banner { background-color: #dcfce7; color: #166534; padding: 15px 25px; border-radius: 16px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: center; border: 1px solid #bbf7d0; box-shadow: 0 4px 6px -1px rgba(22, 101, 52, 0.1); }
        .welcome-section-modern { background: linear-gradient(135deg, #1e293b, #334155); border-radius: 24px; padding: 40px 50px; color: white; display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; overflow: hidden; position: relative; }
        .welcome-text h1 { font-size: 32px; margin-bottom: 10px; }
        .welcome-text p { opacity: 0.8; font-size: 16px; max-width: 400px; }
        .welcome-illustration { font-size: 100px; opacity: 0.2; transform: translateY(20px); }

        .stats-grid-dashboard { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 40px; }
        .stat-card { background: white; border-radius: 20px; padding: 25px; display: flex; align-items: center; gap: 20px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
        .stat-card-icon { width: 55px; height: 55px; border-radius: 15px; display: flex; align-items: center; justify-content: center; font-size: 24px; }
        .stat-card-info h3 { font-size: 20px; font-weight: 800; margin-bottom: 2px; }
        .stat-card-info p { font-size: 13px; color: #64748b; font-weight: 600; }

        .dashboard-sections-grid { display: grid; grid-template-columns: 1.5fr 1fr; gap: 30px; }
        .section-header-flex { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .section-header-flex h2 { font-size: 18px; font-weight: 800; }
        .view-all { font-size: 13px; color: var(--accent-color); font-weight: 700; }

        .enrolled-list { display: flex; flex-direction: column; gap: 15px; }
        .enrollment-card-mini { background: white; border-radius: 16px; padding: 20px; display: flex; align-items: center; gap: 20px; border: 2px solid transparent; transition: all 0.2s; }
        .enrollment-card-mini:hover { border-color: #e2e8f0; transform: scale(1.01); }
        .enrollment-icon { width: 50px; height: 50px; border-radius: 12px; background: #f1f5f9; display: flex; align-items: center; justify-content: center; font-size: 24px; }
        .enrollment-details { flex: 1; }
        .enrollment-details h4 { font-size: 15px; margin-bottom: 8px; }
        .progress-wrapper-mini { display: flex; align-items: center; gap: 12px; }
        .progress-bar-mini { flex: 1; height: 6px; background: #f1f5f9; border-radius: 10px; overflow: hidden; }
        .progress-bar-mini div { height: 100%; background: var(--grad-primary); border-radius: 10px; }
        .progress-wrapper-mini span { font-size: 12px; font-weight: 700; color: #64748b; }
        .btn-play { width: 40px; height: 40px; border-radius: 10px; background: #f1f5f9; color: var(--primary-color); display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 800; }
        .btn-play:hover { background: var(--primary-color); color: white; }

        .event-card-item { background: white; border-radius: 16px; padding: 20px; display: flex; align-items: center; gap: 20px; margin-bottom: 12px; border: 1px solid #f1f5f9; }
        .event-date { text-align: center; line-height: 1; }
        .event-date span { font-size: 10px; font-weight: 800; color: #94a3b8; display: block; margin-bottom: 4px; }
        .event-date strong { font-size: 22px; font-weight: 900; color: var(--primary-color); }
        .event-info { flex: 1; }
        .event-info h4 { font-size: 14px; margin-bottom: 3px; }
        .event-info p { font-size: 12px; color: #64748b; font-weight: 600; }
        .btn-join { padding: 8px 15px; border-radius: 8px; border: none; background: #334155; color: white; font-size: 12px; font-weight: 700; cursor: pointer; }
        .btn-join.disabled { background: #f1f5f9; color: #cbd5e0; cursor: not-allowed; }

        @media (max-width: 1100px) {
          .dashboard-sections-grid { grid-template-columns: 1fr; }
          .stats-grid-dashboard { grid-template-columns: 1fr 1fr; }
        }
      `}</style>
    </div>
  );
};

export default StudentDashboard;
