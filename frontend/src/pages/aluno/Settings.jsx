import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import StudentSidebar from '../../components/StudentSidebar';
import DashboardHeader from '../../components/DashboardHeader';
import '../../styles/dashboard.css';
const Settings = () => {
  const { user, logout } = useAuth();
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    alert('Perfil atualizado com sucesso!');
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      alert('As senhas não coincidem!');
      return;
    }
    alert('Senha atualizada com sucesso!');
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Tem certeza que deseja excluir sua conta permanentemente? Esta ação não pode ser desfeita.')) {
      alert('Conta excluída. Você será redirecionado.');
      logout();
    }
  };

  return (
    <div className="dashboard-wrapper">
      <StudentSidebar active="configuracoes" />
      
      <main className="dashboard-main">
        <DashboardHeader />
        <div className="dashboard-content animate-fade-in">
          <header className="page-header-flex">
            <div>
              <h1>Configurações</h1>
              <p className="subtitle">Gerencie suas preferências e dados pessoais.</p>
            </div>
          </header>

          <div className="settings-grid">
            <div className="settings-main-col">
              {/* Profile Section */}
              <section className="settings-card-modern">
                <div className="card-header-iconified">
                  <div className="header-icon">👤</div>
                  <h3>Perfil do Usuário</h3>
                </div>
                
                <div className="profile-hero-mini">
                  <div className="avatar-large">{user?.full_name?.charAt(0) || 'U'}</div>
                  <div className="hero-info">
                    <h4>{user?.full_name}</h4>
                    <p>{user?.email}</p>
                    <button className="btn btn-outline-alt">Alterar Foto</button>
                  </div>
                </div>

                <form className="settings-form" onSubmit={handleSaveProfile}>
                  <div className="form-row">
                    <div className="form-group-modern">
                      <label>Nome Completo</label>
                      <input 
                        type="text" 
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleInputChange} 
                      />
                    </div>
                    <div className="form-group-modern">
                      <label>Email de Contato</label>
                      <input 
                        type="email" 
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange} 
                      />
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary">Salvar Alterações</button>
                </form>
              </section>

              {/* Security Section */}
              <section className="settings-card-modern">
                <div className="card-header-iconified">
                  <div className="header-icon">🔒</div>
                  <h3>Segurança e Senha</h3>
                </div>
                
                <form className="settings-form" onSubmit={handleChangePassword}>
                  <div className="form-group-modern">
                    <label>Senha Atual</label>
                    <input type="password" name="currentPassword" placeholder="••••••••" />
                  </div>
                  <div className="form-row">
                    <div className="form-group-modern">
                      <label>Nova Senha</label>
                      <input type="password" name="newPassword" placeholder="Mínimo 8 caracteres" />
                    </div>
                    <div className="form-group-modern">
                      <label>Confirmar Nova Senha</label>
                      <input type="password" name="confirmPassword" />
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary">Atualizar Senha</button>
                </form>
              </section>
            </div>

            <div className="settings-side-col">
              {/* Notifications Section */}
              <section className="settings-card-modern">
                <div className="card-header-iconified">
                  <div className="header-icon">🔔</div>
                  <h3>Preferências</h3>
                </div>
                
                <div className="preference-list">
                  <div className="pref-item">
                    <div className="pref-info">
                      <span>Lembretes Diários</span>
                      <p>Sequência de estudo</p>
                    </div>
                    <label className="switch">
                      <input type="checkbox" defaultChecked />
                      <span className="slider round"></span>
                    </label>
                  </div>
                  <div className="pref-item">
                    <div className="pref-info">
                      <span>Novos Cursos</span>
                      <p>Emails de novidades</p>
                    </div>
                    <label className="switch">
                      <input type="checkbox" defaultChecked />
                      <span className="slider round"></span>
                    </label>
                  </div>
                  <div className="pref-item">
                    <div className="pref-info">
                      <span>Newsletter</span>
                      <p>Dicas semanais</p>
                    </div>
                    <label className="switch">
                      <input type="checkbox" />
                      <span className="slider round"></span>
                    </label>
                  </div>
                </div>
              </section>

              {/* Danger Zone */}
              <section className="settings-card-modern danger-card">
                <div className="card-header-iconified">
                  <div className="header-icon">⚠️</div>
                  <h3 style={{ color: '#ef4444' }}>Zona de Perigo</h3>
                </div>
                <p className="danger-text">A exclusão de conta é permanente e todos os seus progressos serão perdidos.</p>
                <button className="btn btn-danger" onClick={handleDeleteAccount}>Excluir Minha Conta</button>
              </section>
            </div>
          </div>
        </div>
      </main>

      <style>{`
        .settings-grid { display: grid; grid-template-columns: 1.8fr 1fr; gap: 30px; }
        .settings-card-modern { background: white; border-radius: 24px; padding: 35px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); margin-bottom: 30px; }
        
        .card-header-iconified { display: flex; align-items: center; gap: 15px; margin-bottom: 30px; border-bottom: 1px solid #f1f5f9; padding-bottom: 15px; }
        .header-icon { width: 35px; height: 35px; border-radius: 10px; background: #f8fafc; display: flex; align-items: center; justify-content: center; font-size: 18px; }
        .card-header-iconified h3 { font-size: 17px; font-weight: 800; }

        .profile-hero-mini { display: flex; align-items: center; gap: 20px; margin-bottom: 35px; background: #f8fafc; padding: 20px; border-radius: 20px; }
        .avatar-large { width: 80px; height: 80px; border-radius: 24px; background: var(--grad-primary); color: white; display: flex; align-items: center; justify-content: center; font-size: 32px; font-weight: 800; }
        .hero-info h4 { font-size: 18px; margin-bottom: 4px; }
        .hero-info p { font-size: 14px; color: #64748b; margin-bottom: 10px; }
        .btn-outline-alt { background: white; border: 1px solid #e2e8f0; padding: 6px 15px; border-radius: 8px; font-size: 12px; font-weight: 700; cursor: pointer; }

        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .form-group-modern { margin-bottom: 20px; }
        .form-group-modern label { display: block; font-size: 13px; font-weight: 700; color: #475569; margin-bottom: 8px; }
        .form-group-modern input { width: 100%; padding: 12px 16px; border-radius: 12px; border: 1px solid #e2e8f0; background: #f8fafc; transition: all 0.2s; font-size: 14px; }
        .form-group-modern input:focus { outline: none; border-color: var(--primary-color); background: white; box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1); }

        .pref-item { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #f8fafc; }
        .pref-item:last-child { border-bottom: none; margin-bottom: 0; }
        .pref-info span { display: block; font-size: 14px; font-weight: 700; }
        .pref-info p { font-size: 12px; color: #64748b; }

        .danger-card { border: 1px solid #fee2e2; }
        .danger-text { font-size: 13px; color: #64748b; margin-bottom: 20px; line-height: 1.5; }
        .btn-danger { background: #fee2e2; color: #ef4444; border: none; width: 100%; padding: 12px; border-radius: 12px; font-weight: 700; cursor: pointer; transition: all 0.2s; }
        .btn-danger:hover { background: #ef4444; color: white; }

        /* Custom Switch */
        .switch { position: relative; display: inline-block; width: 44px; height: 24px; }
        .switch input { opacity: 0; width: 0; height: 0; }
        .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #e2e8f0; transition: .4s; }
        .slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px; background-color: white; transition: .4s; }
        input:checked + .slider { background-color: var(--primary-color); }
        input:checked + .slider:before { transform: translateX(20px); }
        .slider.round { border-radius: 34px; }
        .slider.round:before { border-radius: 50%; }

        @media (max-width: 1024px) { .settings-grid { grid-template-columns: 1fr; } }
        @media (max-width: 600px) { .form-row { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
};

export default Settings;
