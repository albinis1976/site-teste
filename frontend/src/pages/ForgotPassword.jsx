import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import authService from '../services/authService';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setLoading(false);
      return setError('Formato de e-mail inválido.');
    }
    
    try {
      await authService.forgotPassword(email);
      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Erro de conexão. Verifique sua internet ou tente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-card animate-fade-in">
        <div className="auth-header">
          <h2>Recuperar Senha</h2>
          <p className="text-muted">Enviaremos um link para redefinir sua senha.</p>
        </div>

        {error && (
          <div style={{ backgroundColor: 'rgba(214, 48, 49, 0.1)', color: 'var(--danger-color)', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', textAlign: 'center', fontWeight: '600' }}>
            {error}
          </div>
        )}

        {submitted ? (
          <div className="success-state animate-pop-in" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>✉️</div>
            <h3>Email Enviado!</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>Verifique sua caixa de entrada (e a pasta de spam) para as próximas instruções.</p>
            <Link to="/login" className="btn btn-primary" style={{ width: '100%', padding: '15px' }}>Voltar ao Login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email cadastrado</label>
              <input 
                type="email" 
                className="form-control"
                placeholder="seu@email.com" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '15px' }} disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar Link de Recuperação'}
            </button>
            <div className="auth-footer">
              <Link to="/login">Lembrei minha senha. Fazer login →</Link>
            </div>
          </form>
        )}
      </div>
    </main>
  );
};

export default ForgotPassword;
