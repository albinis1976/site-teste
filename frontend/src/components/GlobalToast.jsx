import React, { useState, useEffect } from 'react';

const GlobalToast = () => {
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const handleApiError = (event) => {
      const { message, type } = event.detail;
      setToast({ message, type });
      
      // Auto dismiss after 5 seconds
      setTimeout(() => {
        setToast(null);
      }, 5000);
    };

    window.addEventListener('api_error', handleApiError);
    return () => window.removeEventListener('api_error', handleApiError);
  }, []);

  if (!toast) return null;

  const bgColors = {
    error: '#ef4444',    // Red for 500/general
    warning: '#f59e0b',  // Orange for 403
    info: '#3b82f6',     // Blue
  };

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      backgroundColor: bgColors[toast.type] || bgColors.error,
      color: 'white',
      padding: '16px 24px',
      borderRadius: '8px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      fontWeight: '600',
      minWidth: '300px',
      animation: 'slideIn 0.3s ease-out forwards'
    }}>
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
      <span style={{ fontSize: '20px' }}>{toast.type === 'warning' ? '⚠️' : '❌'}</span>
      <span>{toast.message}</span>
      <button 
        onClick={() => setToast(null)}
        style={{ marginLeft: 'auto', background: 'transparent', border: 'none', color: 'white', fontSize: '16px', cursor: 'pointer', padding: '0 5px' }}
      >
        ✕
      </button>
    </div>
  );
};

export default GlobalToast;
