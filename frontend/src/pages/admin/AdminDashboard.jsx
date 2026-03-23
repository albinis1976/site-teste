import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminDashboard = () => {
  const { logout } = useAuth();
  
  const stats = [
    { label: 'Total de Alunos', value: '452', icon: '👥', color: '#6366f1' },
    { label: 'Professores Ativos', value: '18', icon: '👨‍🏫', color: '#f59e0b' },
    { label: 'Cursos Ativos', value: '24', icon: '📚', color: '#10b981' },
    { label: 'Faturamento Mensal', value: 'R$ 12.850', icon: '💰', color: '#ec4899' }
  ];

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar-modern">
        <div className="admin-brand">English<span>Academy</span> <small>ADMIN</small></div>
        <nav className="admin-nav-modern">
          <p className="admin-section-label">Controle Geral</p>
          <Link to="/admin/dashboard" className="active">📊 Geral</Link>
          <Link to="/admin/usuarios">👥 Usuários</Link>
          <Link to="/admin/cursos">📚 Cursos</Link>
          <Link to="/admin/financeiro">💳 Financeiro</Link>
          
          <p className="admin-section-label">Configurações</p>
          <Link to="/admin/sistema">⚙️ Sistema</Link>
          <Link to="/admin/seguranca">🛡️ Segurança</Link>
          <button className="btn-admin-logout" onClick={() => logout()}>Sair do Painel</button>
        </nav>
      </aside>

      <main className="admin-main-modern">
        <div className="admin-header-flex">
          <h1>Painel de Controle Administrativo</h1>
          <div className="admin-profile-badge">
            <span>Admin Principal</span>
            <div className="admin-avatar">A</div>
          </div>
        </div>

        <div className="admin-stats-grid">
          {stats.map((s, i) => (
            <div key={i} className="admin-stat-card">
              <div className="stat-icon-box" style={{ background: `${s.color}15`, color: s.color }}>{s.icon}</div>
              <div className="stat-text-box">
                <span className="stat-label">{s.label}</span>
                <span className="stat-value">{s.value}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="admin-split-grid">
          <div className="admin-table-card">
            <div className="card-header">
              <h3>Novos Matriculados</h3>
              <button className="btn-text">Ver todos</button>
            </div>
            <table>
              <thead>
                <tr><th>Aluno</th><th>Curso</th><th>Data</th><th>Status</th></tr>
              </thead>
              <tbody>
                {['João Silva', 'Maria Santos', 'Pedro Costa', 'Alice Lima'].map((name, i) => (
                  <tr key={i}>
                    <td><strong>{name}</strong></td>
                    <td>Inglês Iniciante</td>
                    <td>Há {i+1}h</td>
                    <td><span className="admin-badge-ok">Ativo</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="admin-audit-card">
            <h3>Atividade Recente</h3>
            <div className="audit-timeline">
              {[
                { actor: 'Prof. Sarah', action: 'adicionou uma nova aula', time: '10 min atrás' },
                { actor: 'Sistema', action: 'processou 4 novos pagamentos', time: '25 min atrás' },
                { actor: 'Admin', action: 'alterou configurações de SMTP', time: '1h atrás' }
              ].map((log, i) => (
                <div key={i} className="audit-item">
                  <span className="audit-time">{log.time}</span>
                  <p><strong>{log.actor}</strong> {log.action}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <style>{`
        .admin-layout { display: grid; grid-template-columns: 280px 1fr; min-height: 100vh; background: #f1f5f9; }
        .admin-sidebar-modern { background: #1e293b; color: white; padding: 40px 20px; }
        .admin-brand { font-size: 22px; font-weight: 900; margin-bottom: 50px; text-align: center; }
        .admin-brand small { font-size: 10px; background: #334155; padding: 2px 6px; border-radius: 4px; vertical-align: middle; }
        
        .admin-section-label { font-size: 10px; text-transform: uppercase; font-weight: 800; color: #64748b; margin: 30px 15px 10px; letter-spacing: 1px; }
        .admin-nav-modern a { display: block; padding: 12px 20px; border-radius: 12px; color: #94a3b8; text-decoration: none; font-size: 14px; font-weight: 600; margin-bottom: 4px; transition: all 0.2s; }
        .admin-nav-modern a:hover, .admin-nav-modern a.active { background: #334155; color: white; }
        .btn-admin-logout { width: 100%; margin-top: 50px; background: #ef444420; color: #ef4444; border: none; padding: 12px; border-radius: 12px; font-weight: 700; cursor: pointer; }
        
        .admin-main-modern { padding: 50px; }
        .admin-header-flex { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; }
        .admin-header-flex h1 { font-size: 24px; font-weight: 800; }
        .admin-profile-badge { display: flex; align-items: center; gap: 12px; background: white; padding: 8px 15px; border-radius: 50px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
        .admin-avatar { width: 32px; height: 32px; border-radius: 50%; background: #6366f1; color: white; display: flex; align-items: center; justify-content: center; font-weight: 800; }
        
        .admin-stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 25px; margin-bottom: 40px; }
        .admin-stat-card { background: white; padding: 25px; border-radius: 24px; display: flex; align-items: center; gap: 20px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
        .stat-icon-box { width: 60px; height: 60px; border-radius: 18px; display: flex; align-items: center; justify-content: center; font-size: 28px; }
        .stat-label { display: block; font-size: 13px; color: #64748b; font-weight: 600; }
        .stat-value { font-size: 22px; font-weight: 800; color: #1e293b; }

        .admin-split-grid { display: grid; grid-template-columns: 1.8fr 1fr; gap: 30px; }
        .admin-table-card, .admin-audit-card { background: white; border-radius: 24px; padding: 30px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
        
        .admin-table-card table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        .admin-table-card th { text-align: left; font-size: 12px; color: #94a3b8; padding: 15px; border-bottom: 1px solid #f1f5f9; }
        .admin-table-card td { padding: 15px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
        .admin-badge-ok { background: #dcfce7; color: #166534; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 800; }

        .audit-timeline { margin-top: 20px; }
        .audit-item { padding: 15px 0; border-bottom: 1px solid #f1f5f9; }
        .audit-time { font-size: 11px; color: #94a3b8; font-weight: 700; display: block; }
        .audit-item p { font-size: 13px; color: #475569; margin-top: 4px; }
        
        @media (max-width: 1200px) { .admin-layout { grid-template-columns: 1fr; } .admin-sidebar-modern { display: none; } .admin-split-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
