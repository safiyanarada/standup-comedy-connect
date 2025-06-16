import React, { type CSSProperties, useState } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../hooks/useAuth';
import type { IUserData } from '../types/user';
import EditOrganizerProfileForm from '../components/EditOrganizerProfileForm';

function OrganizerProfilePage() {
  const { getCurrentUser } = useAuth();
  const [user, setUser] = useState<IUserData | null>(getCurrentUser());
  const [isEditing, setIsEditing] = useState(false);

  const handleSaveSuccess = () => {
    setUser(getCurrentUser());
    setIsEditing(false);
  };

  const mainContainerStyle: CSSProperties = {
    minHeight: '100vh',
    color: '#ffffff',
    padding: '20px',
    background: 'linear-gradient(to bottom right, #1a1a2e, #331f41)',
  };

  const pageHeaderStyle: CSSProperties = {
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
  };

  const titleStyle: CSSProperties = {
    fontSize: '2.5em',
    color: '#ff416c',
  };

  const subtitleStyle: CSSProperties = {
    fontSize: '1.1em',
    color: '#aaa',
    marginBottom: '20px',
  };

  const sectionContainerStyle: CSSProperties = {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '20px',
    alignItems: 'flex-start',
  };

  const cardStyle: CSSProperties = {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: '8px',
    padding: '25px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
  };

  const cardTitleStyle: CSSProperties = {
    fontSize: '1.5em',
    color: '#ff4b2b',
    marginBottom: '15px',
    display: 'flex',
    alignItems: 'center',
  };

  const infoRowStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '10px',
  };

  const infoLabelStyle: CSSProperties = {
    fontWeight: 'bold',
    color: '#ccc',
  };

  const infoValueStyle: CSSProperties = {
    color: '#fff',
  };

  const profileCardStyle: CSSProperties = {
    ...cardStyle,
    textAlign: 'center',
  };

  const avatarStyle: CSSProperties = {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    backgroundColor: '#ff416c',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '3em',
    fontWeight: 'bold',
    margin: '0 auto 15px auto',
  };

  const statsValueStyle: CSSProperties = {
    fontSize: '1.2em',
    color: '#ff416c',
    fontWeight: 'bold',
  };

  const editButtonStyle: CSSProperties = {
    padding: '8px 15px',
    borderRadius: '8px',
    border: 'none',
    background: 'linear-gradient(to right, #ff416c, #ff4b2b)',
    color: 'white',
    fontSize: '0.9em',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background 0.3s ease',
    marginLeft: '10px',
  };

  return (
    <div style={mainContainerStyle}>
      <Navbar />

      <div style={pageHeaderStyle}>
        <div>
          <h1 style={titleStyle}>Mon Profil</h1>
          <p style={subtitleStyle}>Gère tes informations et préférences</p>
        </div>
        <button style={editButtonStyle} onClick={() => setIsEditing(true)}>Modifier</button>
      </div>

      {isEditing && user ? (
        <EditOrganizerProfileForm
          isOpen={isEditing}
          onClose={() => setIsEditing(false)}
          currentUser={user}
          onSaveSuccess={handleSaveSuccess}
        />
      ) : (
        <div style={sectionContainerStyle}>
          {/* Informations personnelles */}
          <div style={cardStyle}>
            <h2 style={cardTitleStyle}>
              <i className="fas fa-user-circle" style={{ marginRight: '10px' }}></i> Informations personnelles
            </h2>
            <div style={infoRowStyle}>
              <span style={infoLabelStyle}>Prénom</span>
              <span style={infoValueStyle}>{user?.firstName || 'Non défini'}</span>
            </div>
            <div style={infoRowStyle}>
              <span style={infoLabelStyle}>Nom</span>
              <span style={infoValueStyle}>{user?.lastName || 'Non défini'}</span>
            </div>
            <div style={infoRowStyle}>
              <span style={infoLabelStyle}>Email</span>
              <span style={infoValueStyle}>{user?.email || 'Non défini'}</span>
            </div>
            <div style={infoRowStyle}>
              <span style={infoLabelStyle}>Nom de l'entreprise</span>
              <span style={infoValueStyle}>{user?.companyName || 'Non défini'}</span>
            </div>
            <div style={infoRowStyle}>
              <span style={infoLabelStyle}>Ville</span>
              <span style={infoValueStyle}>{user?.city || 'Non défini'}</span>
            </div>
          </div>

          {/* Profil principal (avatar et rôle) */}
          <div style={profileCardStyle}>
            <div style={avatarStyle}>
              {user ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase() : 'DA'}
            </div>
            <h3 style={{ color: '#ffffff', marginBottom: '5px' }}>{user ? `${user.firstName} ${user.lastName}` : 'Dahmane Aissa'}</h3>
            <p style={{ color: '#ff4b2b', fontSize: '1.1em', fontWeight: 'bold' }}>{user?.role || 'Organisateur'}</p>

            {/* Stats rapides */}
            <h4 style={{ color: '#ff4b2b', marginTop: '30px', marginBottom: '15px' }}>Stats rapides</h4>
            <div style={infoRowStyle}>
              <span style={infoLabelStyle}>Événements créés</span>
              <span style={statsValueStyle}>0</span>
            </div>
            <div style={infoRowStyle}>
              <span style={infoLabelStyle}>Vues profil</span>
              <span style={statsValueStyle}>0</span>
            </div>
          </div>

          {/* Profil Organisateur (si applicable) */}
          <div style={{ ...cardStyle, gridColumn: 'span 2' }}>
            <h2 style={cardTitleStyle}>Profil Organisateur</h2>
            <div style={infoRowStyle}>
              <span style={infoLabelStyle}>Nom de l'entreprise:</span>
              <span style={infoValueStyle}>{user?.organizerProfile?.companyName || 'Non spécifié'}</span>
            </div>
            <div style={infoRowStyle}>
              <span style={infoLabelStyle}>Description:</span>
              <span style={infoValueStyle}>{user?.organizerProfile?.description || 'Non spécifié'}</span>
            </div>
            <div style={infoRowStyle}>
              <span style={infoLabelStyle}>Site web:</span>
              <span style={infoValueStyle}>{user?.organizerProfile?.website || 'Non spécifié'}</span>
            </div>
            <div style={infoRowStyle}>
              <span style={infoLabelStyle}>Types de lieux:</span>
              <span style={infoValueStyle}>{user?.organizerProfile?.venueTypes?.join(', ') || 'Non spécifié'}</span>
            </div>
            <div style={infoRowStyle}>
              <span style={infoLabelStyle}>Budget moyen:</span>
              <span style={infoValueStyle}>Non spécifié - Non spécifié€</span>
            </div>
            <div style={infoRowStyle}>
              <span style={infoLabelStyle}>Fréquence des événements:</span>
              <span style={infoValueStyle}>{user?.organizerProfile?.eventFrequency || 'monthly'}</span>
            </div>
            <button style={{ ...editButtonStyle, marginTop: '20px' }} onClick={() => setIsEditing(true)}>MODIFIER</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrganizerProfilePage; 