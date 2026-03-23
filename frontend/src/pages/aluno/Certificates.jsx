import React from 'react';
import { useAuth } from '../../context/AuthContext';
import StudentSidebar from '../../components/StudentSidebar';
import DashboardHeader from '../../components/DashboardHeader';
import '../../styles/dashboard.css';
const Certificates = () => {
  const { user } = useAuth();

  const shareLink = () => {
    const link = `https://englishacademy.com/verify/EA-2026-001A-INI`;
    navigator.clipboard.writeText(link).then(() => alert('Link de verificação copiado!\n' + link));
  };

  return (
    <div className="dashboard-wrapper">
      <StudentSidebar active="certificados" />
      
      <main className="dashboard-main">
        <DashboardHeader />
        <div className="dashboard-content animate-fade-in">
          <header className="page-header-flex">
            <div>
              <h1>Meus Certificados</h1>
              <p className="subtitle">Certificados emitidos ao concluir cursos com aprovação.</p>
            </div>
          </header>

          <div className="cert-preview-modern">
            <div className="cert-preview-content">
              <div className="cert-header">🎓 ENGLISH ACADEMY</div>
              <div className="cert-ornament">🏆</div>
              <div className="cert-type">Certificado de Conclusão</div>
              <h2 className="cert-course">Inglês para Iniciantes</h2>
              <p className="cert-text">Certificamos que</p>
              <h3 className="cert-name">{user?.full_name || 'Aluno da Plataforma'}</h3>
              <p className="cert-text">concluiu com êxito o curso em 10 de Março de 2026</p>
              
              <div className="cert-footer-actions">
                <button className="btn btn-accent" onClick={() => alert('Baixando PDF...')}>
                  <span className="icon">⬇</span> Baixar PDF
                </button>
                <button className="btn btn-outline-white" onClick={shareLink}>
                  <span className="icon">🔗</span> Copiar Link de Verificação
                </button>
              </div>
            </div>
          </div>

          <div className="cert-list-section">
            <h2 className="section-title">Todos os Certificados (1)</h2>
            <div className="cert-item-card">
              <div className="cert-item-icon">🏅</div>
              <div className="cert-item-info">
                <h4>Inglês para Iniciantes</h4>
                <p>Emitido em 10 de Março de 2026</p>
                <code>ID: EA-2026-001A-INI</code>
              </div>
              <button className="btn btn-outline" onClick={() => alert('Baixando PDF...')}>Baixar</button>
            </div>

            <div className="cert-item-locked">
              <div className="lock-icon">🔒</div>
              <div className="lock-info">
                <h4>Inglês Intermediário</h4>
                <p>Complete o curso para desbloquear este certificado.</p>
              </div>
              <button className="btn btn-primary" disabled>Bloqueado</button>
            </div>
          </div>
        </div>
      </main>

      <style>{`
        .page-header-flex { margin-bottom: 30px; }
        .subtitle { color: #64748b; font-size: 15px; margin-top: 5px; }

        .cert-preview-modern {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          border-radius: 24px;
          padding: 60px;
          color: white;
          text-align: center;
          position: relative;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0,0,0,0.2);
          margin-bottom: 40px;
          border: 1px solid rgba(255,255,255,0.1);
        }

        .cert-preview-modern::before {
          content: '';
          position: absolute;
          top: -100px;
          right: -100px;
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, var(--accent-color) 0%, transparent 70%);
          opacity: 0.1;
        }

        .cert-header { font-size: 14px; font-weight: 800; letter-spacing: 4px; opacity: 0.6; margin-bottom: 30px; }
        .cert-ornament { font-size: 80px; margin-bottom: 20px; filter: drop-shadow(0 0 20px rgba(252, 163, 17, 0.3)); }
        .cert-type { font-size: 13px; text-transform: uppercase; letter-spacing: 5px; color: var(--accent-color); margin-bottom: 15px; font-weight: 700; }
        .cert-course { font-size: 36px; font-weight: 900; margin-bottom: 20px; }
        .cert-text { font-size: 16px; opacity: 0.7; font-style: italic; }
        .cert-name { font-size: 32px; font-weight: 800; margin: 15px 0; color: white; }
        
        .cert-footer-actions { display: flex; gap: 15px; justify-content: center; margin-top: 40px; }
        .btn-outline-white { border: 1px solid rgba(255,255,255,0.2); color: white; background: transparent; padding: 12px 25px; border-radius: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .btn-outline-white:hover { background: rgba(255,255,255,0.05); border-color: white; }

        .cert-list-section { display: flex; flex-direction: column; gap: 15px; }
        .section-title { font-size: 18px; font-weight: 800; margin-bottom: 10px; }
        
        .cert-item-card {
          background: white;
          border-radius: 20px;
          padding: 25px;
          display: flex;
          align-items: center;
          gap: 20px;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
          transition: transform 0.2s;
        }
        .cert-item-card:hover { transform: translateY(-3px); }
        .cert-item-icon { font-size: 40px; width: 70px; height: 70px; display: flex; align-items: center; justify-content: center; background: #f8fafc; border-radius: 15px; }
        .cert-item-info { flex: 1; }
        .cert-item-info h4 { font-size: 16px; margin-bottom: 4px; }
        .cert-item-info p { font-size: 13px; color: #64748b; margin-bottom: 4px; }
        .cert-item-info code { font-size: 11px; background: #f1f5f9; padding: 2px 8px; border-radius: 4px; color: #475569; }

        .cert-item-locked {
          background: #f8fafc;
          border: 2px dashed #e2e8f0;
          border-radius: 20px;
          padding: 25px;
          display: flex;
          align-items: center;
          gap: 20px;
          opacity: 0.8;
        }
        .lock-icon { font-size: 32px; width: 70px; height: 70px; display: flex; align-items: center; justify-content: center; color: #94a3b8; }
        .lock-info h4 { font-size: 16px; color: #64748b; margin-bottom: 4px; }
        .lock-info p { font-size: 13px; color: #94a3b8; }

        @media (max-width: 768px) {
          .cert-preview-modern { padding: 30px; }
          .cert-course { font-size: 24px; }
          .cert-name { font-size: 22px; }
          .cert-footer-actions { flex-direction: column; }
          .cert-item-card { flex-direction: column; text-align: center; }
        }
      `}</style>
    </div>
  );
};

export default Certificates;
