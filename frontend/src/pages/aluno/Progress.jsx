import React, { useEffect, useState } from 'react';
import StudentSidebar from '../../components/StudentSidebar';
import DashboardHeader from '../../components/DashboardHeader';
import '../../styles/dashboard.css';
const Progress = () => {
  const [streakDays, setStreakDays] = useState([]);

  useEffect(() => {
    const days = ['D','S','T','Q','Q','S','S'];
    const active = [true, true, true, false, true, true, true, false, true, true, true, true, false, false, true, true, false, true, true, true, true, false, true, true, true, true, true, true];
    const streakData = active.map((a, i) => ({
      label: days[i % 7],
      isActive: a,
      isToday: i === active.length - 1
    }));
    setStreakDays(streakData);
  }, []);

  const stats = [
    { label: 'Dias de Streak', value: '7', emoji: '🔥', color: '#ff9f43' },
    { label: 'Aulas Concluídas', value: '12', emoji: '📚', color: '#54a0ff' },
    { label: 'Tempo de Estudo', value: '4h 20m', emoji: '⏱', color: '#1dd1a1' },
    { label: 'Pontos Acumulados', value: '850', emoji: '⭐', color: '#feca57' }
  ];

  const modules = [
    { title: 'Módulo 1: Fundamentos', progress: 80, status: 'active' },
    { title: 'Módulo 2: Vocabulário Essencial', progress: 40, status: 'active' },
    { title: 'Módulo 3: Gramática Básica', progress: 10, status: 'active' },
    { title: 'Módulo 4: Conversação', progress: 0, status: 'locked' }
  ];

  return (
    <div className="dashboard-wrapper">
      <StudentSidebar active="progresso" />
      
      <main className="dashboard-main">
        <DashboardHeader />
        <div className="dashboard-content animate-fade-in">
          <header className="page-header-flex">
            <div>
              <h1>Meu Progresso</h1>
              <p className="subtitle">Acompanhe sua evolução e mantenha a consistência.</p>
            </div>
          </header>

          <div className="stats-grid-dashboard">
            {stats.map((stat, i) => (
              <div key={i} className="stat-card">
                <div className="stat-card-icon" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>{stat.emoji}</div>
                <div className="stat-card-info">
                  <h3>{stat.value}</h3>
                  <p>{stat.label}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="progress-detailed-grid">
            <div className="progress-main-col">
              <section className="progress-panel-modern">
                <h3>Progresso por Módulo</h3>
                <div className="module-progress-list">
                  {modules.map((m, i) => (
                    <div key={i} className={`module-progress-item ${m.status === 'locked' ? 'module-locked' : ''}`}>
                      <div className="module-header-info">
                        <span>{m.title}</span>
                        <strong>{m.status === 'locked' ? 'Bloqueado' : `${m.progress}%`}</strong>
                      </div>
                      <div className="progress-track-bg">
                        <div className="progress-track-fill" style={{ width: `${m.progress}%`, background: m.status === 'locked' ? '#e2e8f0' : 'var(--grad-primary)' }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="progress-panel-modern">
                <h3>Sequência de Estudo — Últimas 4 semanas</h3>
                <div className="streak-calendar">
                  {streakDays.map((day, i) => (
                    <div key={i} className={`streak-day-dot ${day.isToday ? 'is-today' : day.isActive ? 'is-active' : ''}`}>
                      {day.label}
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="progress-side-col">
              <section className="progress-panel-modern level-up-panel">
                <div className="level-badge-large">🏅</div>
                <h3>Nível A2 — Básico</h3>
                <p>Continue estudando para alcançar o nível B1 Intermediário. Faltam 320 pontos.</p>
                <div className="level-progression-bar">
                  <div className="level-fill" style={{ width: '60%' }}></div>
                </div>
                <span className="level-points">530 / 850 XP</span>
                <button className="btn btn-primary full-width">Ver Próximas Metas</button>
              </section>

              <section className="progress-panel-modern">
                <h3>Conquistas Recentes</h3>
                <div className="achievement-mini-list">
                  <div className="achievement-mini">
                    <span className="ach-icon">🔥</span>
                    <div>
                      <strong>Semana Invicta</strong>
                      <p>7 dias de estudos seguidos</p>
                    </div>
                  </div>
                  <div className="achievement-mini">
                    <span className="ach-icon">📖</span>
                    <div>
                      <strong>Leitor Alpha</strong>
                      <p>Completou 5 materiais PDF</p>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>

      <style>{`
        .progress-detailed-grid { display: grid; grid-template-columns: 1.8fr 1fr; gap: 30px; }
        .progress-panel-modern { background: white; border-radius: 24px; padding: 30px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); margin-bottom: 30px; }
        .progress-panel-modern h3 { font-size: 17px; font-weight: 800; margin-bottom: 25px; color: #1e293b; }
        
        .module-progress-list { display: flex; flex-direction: column; gap: 20px; }
        .module-header-info { display: flex; justify-content: space-between; font-size: 14px; font-weight: 700; margin-bottom: 8px; }
        .module-locked { opacity: 0.5; }
        .progress-track-bg { height: 10px; background: #f1f5f9; border-radius: 10px; overflow: hidden; }
        .progress-track-fill { height: 100%; border-radius: 10px; transition: width 1s ease-out; }

        .streak-calendar { display: flex; flex-wrap: wrap; gap: 10px; }
        .streak-day-dot { width: 35px; height: 35px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; background: #f1f5f9; color: #94a3b8; }
        .streak-day-dot.is-active { background: var(--primary-color); color: white; }
        .streak-day-dot.is-today { background: var(--accent-color); color: white; box-shadow: 0 0 15px rgba(252, 163, 17, 0.4); }

        .level-up-panel { text-align: center; background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%); }
        .level-badge-large { font-size: 60px; margin-bottom: 15px; }
        .level-up-panel h3 { margin-bottom: 10px; }
        .level-up-panel p { font-size: 13px; color: #64748b; line-height: 1.5; margin-bottom: 20px; }
        .level-progression-bar { height: 12px; background: #e2e8f0; border-radius: 20px; margin-bottom: 10px; overflow: hidden; }
        .level-fill { height: 100%; background: var(--grad-accent); border-radius: 20px; }
        .level-points { font-size: 12px; font-weight: 800; color: #475569; display: block; margin-bottom: 20px; }
        .full-width { width: 100%; }

        .achievement-mini-list { display: flex; flex-direction: column; gap: 15px; }
        .achievement-mini { display: flex; align-items: center; gap: 15px; background: #f8fafc; padding: 15px; border-radius: 16px; }
        .ach-icon { font-size: 24px; }
        .achievement-mini strong { font-size: 13px; display: block; }
        .achievement-mini p { font-size: 11px; color: #64748b; }

        @media (max-width: 1024px) { .progress-detailed-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
};

export default Progress;
