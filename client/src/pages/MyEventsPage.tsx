import React, { type CSSProperties, useState } from 'react';
import Navbar from '../components/Navbar';
import Modal from '../components/Modal';
import CreateEventForm from '../components/CreateEventForm';

function MyEventsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [showCreateEventForm, setShowCreateEventForm] = useState(false);

  // Dummy data for event to demonstrate modal
  const dummyEvent = {
    title: 'SHOWPARIS',
    type: 'SHOW',
    date: '10/06/2025',
    time: '16:00 - 18:00',
    location: 'PARISCOMEDY, 42 Bd de Bonne Nouvelle, 75010 PARIS',
    budget: '15€ - 20€',
    participants: ['Safiya Haidi'],
    status: 'Published',
  };

  const handleCardClick = (event: any) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
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

  const buttonStyle: CSSProperties = {
    padding: '10px 20px',
    borderRadius: '8px',
    border: 'none',
    background: 'linear-gradient(to right, #ff416c, #ff4b2b)',
    color: 'white',
    fontSize: '1em',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background 0.3s ease',
  };

  const sectionStyle: CSSProperties = {
    maxWidth: '1200px',
    margin: '0 auto 40px auto',
    padding: '20px',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
  };

  const sectionTitleStyle: CSSProperties = {
    fontSize: '1.8em',
    color: '#ff4b2b',
    marginBottom: '15px',
  };

  const emptyStateStyle: CSSProperties = {
    color: '#aaa',
    fontSize: '1.1em',
  };

  const eventCardStyle: CSSProperties = {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
    border: '1px solid #444',
    marginBottom: '15px',
    cursor: 'pointer',
  };

  const eventTitleStyle: CSSProperties = {
    fontSize: '1.5em',
    color: '#ffffff',
    marginBottom: '5px',
  };

  const eventDetailStyle: CSSProperties = {
    fontSize: '0.9em',
    color: '#bbb',
    marginBottom: '3px',
  };

  const eventStatusStyle: CSSProperties = {
    fontSize: '0.9em',
    color: '#ff416c',
    fontWeight: 'bold',
  };

  const modalDetailStyle: CSSProperties = {
    marginBottom: '10px',
  };

  const modalLabelStyle: CSSProperties = {
    fontWeight: 'bold',
    color: '#ff4b2b',
    marginRight: '5px',
  };

  const modalValueStyle: CSSProperties = {
    color: '#ffffff',
  };

  const modalParticipantListStyle: CSSProperties = {
    listStyleType: 'none',
    padding: 0,
    margin: '5px 0 0 0',
  };

  const modalParticipantItemStyle: CSSProperties = {
    color: '#ffffff',
    marginBottom: '3px',
  };

  return (
    <div style={mainContainerStyle}>
      <Navbar />

      <div style={pageHeaderStyle}>
        <h1 style={titleStyle}>Mes Événements</h1>
        {!showCreateEventForm && (
          <button style={buttonStyle} onClick={() => setShowCreateEventForm(true)}>Créer un événement</button>
        )}
      </div>

      {showCreateEventForm ? (
        <CreateEventForm onClose={() => setShowCreateEventForm(false)} />
      ) : (
        <>
          <div style={sectionStyle}>
            <h2 style={sectionTitleStyle}>Événements à venir</h2>
            <p style={emptyStateStyle}>Aucun événement à venir. Créez-en un !</p>
          </div>

          <div style={sectionStyle}>
            <h2 style={sectionTitleStyle}>Historique des événements (Archives)</h2>
            <div style={eventCardStyle} onClick={() => handleCardClick(dummyEvent)}>
              <h3 style={eventTitleStyle}>SHOWPARIS</h3>
              <p style={eventDetailStyle}>10/06/2025 (PARIS)</p>
              <p style={eventStatusStyle}>Statut: Published</p>
            </div>
            {/* D'autres cartes d'événements archivés ici */}
          </div>

          <Modal isOpen={isModalOpen} onClose={closeModal}>
            {selectedEvent && (
              <div>
                <h2 style={{ color: '#ff416c', marginBottom: '20px' }}>{selectedEvent.title}</h2>
                <p style={modalDetailStyle}>
                  <span style={modalLabelStyle}>Type:</span>
                  <span style={modalValueStyle}>{selectedEvent.type}</span>
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <p style={modalDetailStyle}>
                    <span style={modalLabelStyle}>Date:</span>
                    <span style={modalValueStyle}>{selectedEvent.date}</span>
                  </p>
                  <p style={modalDetailStyle}>
                    <span style={modalLabelStyle}>Heure:</span>
                    <span style={modalValueStyle}>{selectedEvent.time}</span>
                  </p>
                </div>
                <p style={modalDetailStyle}>
                  <span style={modalLabelStyle}>Lieu:</span>
                  <span style={modalValueStyle}>{selectedEvent.location}</span>
                </p>
                <p style={modalDetailStyle}>
                  <span style={modalLabelStyle}>Budget:</span>
                  <span style={modalValueStyle}>{selectedEvent.budget}</span>
                </p>
                <h3 style={{ color: '#ff4b2b', marginTop: '20px', marginBottom: '10px' }}>Humoristes Participants:</h3>
                <ul style={modalParticipantListStyle}>
                  {selectedEvent.participants.map((participant: string, index: number) => (
                    <li key={index} style={modalParticipantItemStyle}>{participant}</li>
                  ))}
                </ul>
                <p style={{ ...modalDetailStyle, marginTop: '20px' }}>
                  <span style={modalLabelStyle}>Statut:</span>
                  <span style={modalValueStyle}>{selectedEvent.status}</span>
                </p>
              </div>
            )}
          </Modal>
        </>
      )}
    </div>
  );
}

export default MyEventsPage; 