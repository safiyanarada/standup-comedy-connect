import React, { type CSSProperties, useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';

interface IApplication {
  _id: string;
  event: { _id: string; title: string; date: string; };
  applicant: { _id: string; firstName: string; lastName: string; };
  performanceDetails: { duration: number; description: string; videoLink?: string; };
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
}

function ApplicationsPage() {
  const { token } = useAuth();
  const [applications, setApplications] = useState<IApplication[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApplications = async () => {
      if (!token) {
        setError("Vous devez être connecté pour voir les candidatures.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
        const res = await axios.get<IApplication[]>('/api/applications', config);
        setApplications(res.data);
      } catch (err: any) {
        console.error('Erreur lors de la récupération des candidatures:', err.response?.data || err.message);
        setError(err.response?.data?.message || 'Échec de la récupération des candidatures.');
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [token]);

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

  const contentContainerStyle: CSSProperties = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
  };

  const applicationsGridStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px',
    marginTop: '20px',
  };

  const applicationCardStyle: CSSProperties = {
    backgroundColor: '#1a1a2e',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.5)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  };

  const cardTitleStyle: CSSProperties = {
    fontSize: '1.4em',
    color: '#ff4b2b',
    marginBottom: '10px',
  };

  const cardDetailStyle: CSSProperties = {
    fontSize: '0.9em',
    color: '#ccc',
    marginBottom: '5px',
  };

  const statusBadgeStyle = (status: IApplication['status']): CSSProperties => {
    let backgroundColor = '';
    let color = '#ffffff';
    switch (status) {
      case 'PENDING':
        backgroundColor = '#ffc107'; // yellow
        color = '#333';
        break;
      case 'ACCEPTED':
        backgroundColor = '#28a745'; // green
        break;
      case 'REJECTED':
        backgroundColor = '#dc3545'; // red
        break;
      default:
        backgroundColor = '#6c757d'; // gray
    }
    return {
      display: 'inline-block',
      padding: '5px 10px',
      borderRadius: '5px',
      backgroundColor,
      color,
      fontWeight: 'bold',
      marginTop: '10px',
    };
  };

  return (
    <div style={mainContainerStyle}>
      <Navbar />
      <div style={pageHeaderStyle}>
        <div>
          <h1 style={titleStyle}>Gérer les Candidatures</h1>
          <p style={subtitleStyle}>Visualisez et gérez toutes les candidatures pour vos événements.</p>
        </div>
      </div>

      <div style={contentContainerStyle}>
        {loading && <p style={{ textAlign: 'center', color: '#ccc' }}>Chargement des candidatures...</p>}
        {error && <p style={{ textAlign: 'center', color: '#dc3545' }}>Erreur: {error}</p>}
        {!loading && !error && applications.length === 0 && (
          <p style={{ textAlign: 'center', fontSize: '1.2em', color: '#ccc' }}>
            Aucune candidature trouvée pour vos événements.
          </p>
        )}

        {!loading && !error && applications.length > 0 && (
          <div style={applicationsGridStyle}>
            {applications.map((app) => (
              <div key={app._id} style={applicationCardStyle}>
                <div>
                  <h3 style={cardTitleStyle}>{app.event.title}</h3>
                  <p style={cardDetailStyle}>Humoriste: {app.applicant.firstName} {app.applicant.lastName}</p>
                  <p style={cardDetailStyle}>Date de l'événement: {new Date(app.event.date).toLocaleDateString()}</p>
                  <p style={cardDetailStyle}>Durée proposée: {app.performanceDetails.duration} min</p>
                  <p style={cardDetailStyle}>Description: {app.performanceDetails.description}</p>
                  {app.performanceDetails.videoLink && (
                    <p style={cardDetailStyle}>
                      Vidéo: <a href={app.performanceDetails.videoLink} target="_blank" rel="noopener noreferrer" style={{ color: '#ff416c', textDecoration: 'none' }}>Voir la vidéo</a>
                    </p>
                  )}
                </div>
                <div style={{ alignSelf: 'flex-end' }}>
                  <span style={statusBadgeStyle(app.status)}>Statut: {app.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ApplicationsPage; 