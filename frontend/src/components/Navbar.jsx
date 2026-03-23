import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <header className="header-glass">
      <div className="container">
        <nav className="flex justify-between align-center" style={{ padding: '15px 0' }}>
          <Link to="/" className="logo" onClick={closeMenu}>English<span>Academy</span></Link>
          
          <button 
            className={`hamburger ${isMenuOpen ? 'open' : ''}`} 
            onClick={toggleMenu}
            aria-label="Menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          <ul className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
            <li><Link to="/" className={isActive('/')} onClick={closeMenu}>Início</Link></li>
            <li><Link to="/courses" className={isActive('/courses')} onClick={closeMenu}>Cursos</Link></li>
            <li><Link to="/plans" className={isActive('/plans')} onClick={closeMenu}>Planos</Link></li>
            <li><Link to="/teachers" className={isActive('/teachers')} onClick={closeMenu}>Professores</Link></li>
            <li><Link to="/testimonials" className={isActive('/testimonials')} onClick={closeMenu}>Depoimentos</Link></li>
            <li><Link to="/blog" className={isActive('/blog')} onClick={closeMenu}>Blog</Link></li>
            <li><Link to="/contact" className={isActive('/contact')} onClick={closeMenu}>Contato</Link></li>
            
            <div className="auth-links-mobile">
              {user ? (
                <>
                  <Link 
                    to={user.role === 'admin' ? '/admin/dashboard' : user.role === 'teacher' ? '/teacher/dashboard' : '/dashboard'} 
                    className="btn btn-accent"
                    onClick={closeMenu}
                  >
                    Meu Painel
                  </Link>
                  <button onClick={handleLogout} className="btn-logout-mobile">Sair</button>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn btn-outline" onClick={closeMenu}>Entrar</Link>
                  <Link to="/register" className="btn btn-accent" onClick={closeMenu}>Cadastrar</Link>
                </>
              )}
            </div>
          </ul>
          
          <div className="auth-links">
            {user ? (
              <div className="auth-group">
                <Link 
                  to={user.role === 'admin' ? '/admin/dashboard' : user.role === 'teacher' ? '/teacher/dashboard' : '/dashboard'} 
                  className="btn btn-accent"
                >
                  Meu Painel
                </Link>
                <button onClick={handleLogout} className="btn-logout-header" style={{ background: 'transparent', border: 'none', color: 'white', opacity: 0.7, fontWeight: '600', cursor: 'pointer', padding: '0 15px' }}>Sair</button>
              </div>
            ) : (
              <div className="auth-group">
                {location.pathname !== '/login' && <Link to="/login" className="btn btn-outline" style={{ borderColor: 'rgba(13, 33, 63, 0.2)' }}>Entrar</Link>}
                {location.pathname !== '/register' && <Link to="/register" className="btn btn-accent">Cadastrar</Link>}
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;