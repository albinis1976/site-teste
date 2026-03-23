
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Formato de e-mail inválido.');
      return;
    }
    if (password.trim().length === 0) {
      setError('A senha não pode estar vazia.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const data = await login(email, password);
      // Logic for role-based redirect is handled by App.jsx or here
      // Let's check user role and redirect
      if (data && data.user) {
        const role = data.user.role;
        if (role === 'admin') navigate('/admin/dashboard');
        else if (role === 'teacher') navigate('/teacher/dashboard');
        else navigate('/dashboard');
      } else {
        // Fallback if data.user is not immediately available
        navigate('/dashboard');
      }
    } catch (err) {
      setError('E-mail ou senha incorretos. Por favor, tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-card animate-fade-in">
        <div className="auth-header">
          <h2>Bem-vindo de volta!</h2>
          <p className="text-muted">Acesse sua conta para continuar seus estudos.</p>
        </div>

        {error && (
          <div style={{ backgroundColor: 'rgba(214, 48, 49, 0.1)', color: 'var(--danger-color)', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', textAlign: 'center', fontWeight: '600' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Seu E-mail</label>
            <input
              type="email"
              className="form-control"
              placeholder="exemplo@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <label className="form-label" style={{ marginBottom: '0' }}>Sua Senha</label>
              <Link to="/forgot-password" style={{ fontSize: '13px', color: 'var(--accent-color)', fontWeight: '700' }}>Esqueceu a senha?</Link>
            </div>
            <input
              type="password"
              className="form-control"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '15px', marginTop: '10px' }}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Entrando...' : 'Entrar na Minha Conta'}
          </button>
        </form>

        <div className="auth-footer">
          Não tem uma conta? <Link to="/register">Crie uma agora gratuitamente</Link>
        </div>
      </div>
    </main>
  );
};

export default Login;
