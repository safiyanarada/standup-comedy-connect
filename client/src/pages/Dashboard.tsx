import React, { type CSSProperties } from 'react';
import Navbar from '../components/Navbar'; // Import de la barre de navigation

function Dashboard() {
  // Styles de base pour le conteneur principal
  const mainContainerStyle: CSSProperties = {
    minHeight: '100vh',
    color: '#ffffff',
    padding: '20px',
    background: 'linear-gradient(to bottom right, #1a1a2e, #331f41)', // Dégradé du login
  };

  // Styles pour l'en-tête du tableau de bord
  const dashboardHeaderStyle: CSSProperties = {
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto',
  };

  // Styles pour le titre
  const titleStyle: CSSProperties = {
    fontSize: '2.5em',
    marginBottom: '20px',
    color: '#ff416c', // Couleur d'accentuation du login
  };

  // Styles pour les onglets de navigation (Vue d'ensemble, Messages, Rechercher)
  const tabNavigationStyle: CSSProperties = {
    display: 'flex',
    marginBottom: '30px',
    borderBottom: '1px solid #444',
  };

  const tabButtonStyle: CSSProperties = {
    padding: '10px 20px',
    cursor: 'pointer',
    backgroundColor: 'transparent',
    border: 'none',
    color: '#aaa',
    fontSize: '1.1em',
    fontWeight: 'bold',
  };

  const activeTabButtonStyle: CSSProperties = {
    ...tabButtonStyle,
    color: '#ff416c', // Couleur d'accentuation du login
    borderBottom: '2px solid #ff416c',
  };

  // Styles pour la grille des cartes de statistiques
  const cardsGridStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px',
    maxWidth: '1200px',
    margin: '0 auto',
    paddingBottom: '20px',
  };

  // Styles pour une carte individuelle
  const cardStyle: CSSProperties = {
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // Fond semi-transparent du login
    borderRadius: '8px',
    padding: '25px',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: '150px',
  };

  const cardTitleStyle: CSSProperties = {
    fontSize: '1.2em',
    color: '#ffffff',
    marginBottom: '10px',
  };

  const cardValueStyle: CSSProperties = {
    fontSize: '2.5em',
    fontWeight: 'bold',
    color: '#ff4b2b', // Couleur d'accentuation (plus rouge du dégradé)
  };

  const cardStatusStyle: CSSProperties = {
    fontSize: '1em',
    color: '#aaa',
  };

  const cardIconStyle: CSSProperties = {
    fontSize: '2em',
    color: '#ff416c', // Couleur d'accentuation du login
    alignSelf: 'flex-end',
  };

  return (
    <div style={mainContainerStyle}>
      <Navbar />
      <div style={dashboardHeaderStyle}>
        <h1 style={titleStyle}>Tableau de bord de l'organisateur</h1>

        <div style={tabNavigationStyle}>
          <button style={activeTabButtonStyle}>Vue d'ensemble</button>
          <button style={tabButtonStyle}>Messages</button>
          <button style={tabButtonStyle}>Rechercher</button>
        </div>

        <div style={cardsGridStyle}>
          {/* Carte : Événements créés */}
          <div style={cardStyle}>
            <div>
              <p style={cardTitleStyle}>Événements créés</p>
              <p style={cardValueStyle}>0</p>
            </div>
            <span style={cardIconStyle}>🗓️</span>
          </div>

          {/* Carte : Candidatures en attente */}
          <div style={cardStyle}>
            <div>
              <p style={cardTitleStyle}>Candidatures en attente</p>
              <p style={cardValueStyle}>0</p>
            </div>
            <span style={cardIconStyle}>⏱️</span>
          </div>

          {/* Carte : Humoristes postulants */}
          <div style={cardStyle}>
            <div>
              <p style={cardTitleStyle}>Humoristes postulants</p>
              <p style={cardValueStyle}>0</p>
              <p style={cardStatusStyle}>Acceptées: 0 (0%)</p>
              <p style={cardStatusStyle}>Refusées: 0 (0%)</p>
            </div>
            <span style={cardIconStyle}>👥</span>
          </div>

          {/* Carte : Prochains événements (non complets) */}
          <div style={cardStyle}>
            <div>
              <p style={cardTitleStyle}>Prochains événements<br/>(non complets)</p>
              <p style={cardStatusStyle}>Aucun événement non complet à venir.</p>
            </div>
            <span style={cardIconStyle}>✨</span>
          </div>

          {/* Carte : Événements complets */}
          <div style={cardStyle}>
            <div>
              <p style={cardTitleStyle}>Événements complets</p>
              <p style={cardStatusStyle}>Aucun événement complet ou passé.</p>
            </div>
            <span style={cardIconStyle}>✅</span>
          </div>

          {/* Carte : Événements archivés */}
          <div style={cardStyle}>
            <div>
              <p style={cardTitleStyle}>Événements archivés</p>
              <p style={cardValueStyle}>0</p>
            </div>
            <span style={cardIconStyle}>📦</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard; 