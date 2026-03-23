import React from 'react';

const DashboardHeader = () => {
  return (
    <header className="dashboard-header">
      <div className="header-search">
        <span className="search-icon">🔍</span>
        <input type="text" placeholder="Pesquisar aulas, materiais..." />
      </div>
      <div className="header-actions">
        <button className="notif-btn">🔔<span className="badge-dot"></span></button>
      </div>
    </header>
  );
};

export default DashboardHeader;
