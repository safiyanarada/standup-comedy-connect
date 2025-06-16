import React, { type CSSProperties } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function Navbar() {
  const { getCurrentUser, logout } = useAuth();
  const user = getCurrentUser();
  const location = useLocation();

  const navLinkBaseStyle: CSSProperties = {
    margin: '0 15px',
    textDecoration: 'none',
    color: '#ffffff',
    fontWeight: 'bold',
  };

  const activeLinkStyle: CSSProperties = {
    borderBottom: '2px solid #ff416c',
    paddingBottom: '2px',
  };

  const rightLinkStyle: CSSProperties = {
    margin: '0 10px',
    textDecoration: 'none',
    color: '#ff416c',
    fontWeight: 'bold',
  };

  const userNameStyle: CSSProperties = {
    marginRight: '10px',
    color: '#ffffff',
    fontWeight: 'bold',
  };

  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '10px 20px',
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      color: '#ffffff',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.6)',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
    }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <h2 style={{ margin: '0', color: '#ff4b2b' }}>Standup Comedy Connect</h2>
        <div style={{ marginLeft: '30px' }}>
          <Link to="/dashboard" style={{ ...navLinkBaseStyle, ...(location.pathname === '/dashboard' ? activeLinkStyle : {}) }}>Accueil</Link>
          <Link to="/events" style={{ ...navLinkBaseStyle, ...(location.pathname === '/events' ? activeLinkStyle : {}) }}>Mes Événements</Link>
          <Link to="/applications" style={{ ...navLinkBaseStyle, ...(location.pathname === '/applications' ? activeLinkStyle : {}) }}>Candidatures</Link>
          <Link to="/profile" style={{ ...navLinkBaseStyle, ...(location.pathname === '/profile' ? activeLinkStyle : {}) }}>Profil</Link>
        </div>
      </div>
      <div>
        {user ? (
          <span style={userNameStyle}>{`${user.firstName} ${user.lastName}`}</span>
        ) : (
          <span style={userNameStyle}>Invité</span>
        )}
        <Link to="/login" onClick={logout} style={rightLinkStyle}>Déconnexion</Link>
      </div>
    </nav>
  );
}

export default Navbar; 