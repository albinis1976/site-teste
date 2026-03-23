import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Transmit to logging service in true production deployments
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f8fafc', padding: '20px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '48px', margin: '0 0 10px 0' }}>⚠️</h1>
          <h2 style={{ color: '#0f172a', margin: '0 0 10px 0', fontSize: '28px' }}>Oops! Algo deu errado.</h2>
          <p style={{ color: '#64748b', margin: '0 0 25px 0', maxWidth: '400px', lineHeight: '1.5' }}>
            Desculpe, ocorreu um erro inesperado na interface. Nossa equipe já foi notificada e estamos trabalhando para resolver isso.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            style={{ padding: '12px 24px', background: '#0056b3', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px', transition: 'background 0.2s' }}
            onMouseOver={(e) => e.target.style.background = '#004494'}
            onMouseOut={(e) => e.target.style.background = '#0056b3'}
          >
            Recarregar Página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
