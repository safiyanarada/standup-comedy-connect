import React, { type CSSProperties, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';

interface CreateEventFormProps {
  onClose: () => void;
}

function CreateEventForm({ onClose }: CreateEventFormProps) {
  const { user, token } = useAuth(); // Now directly available
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    city: '',
    postalCode: '',
    address: '',
    country: '',
    date: '',
    venue: '',
    startTime: '',
    endTime: '',
    minExperience: '',
    maxComedians: '',
    status: 'draft',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !token) {
      alert("Vous devez être connecté pour créer un événement.");
      return;
    }

    // Date and time parsing
    const [day, month, year] = formData.date.split('/').map(Number);
    const eventDate = new Date(year, month - 1, day);

    // Calculate duration in minutes
    const parseTime = (timeStr: string) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + minutes;
    };
    const startMinutes = parseTime(formData.startTime);
    const endMinutes = parseTime(formData.endTime);
    let durationInMinutes = 0;
    if (endMinutes >= startMinutes) {
      durationInMinutes = endMinutes - startMinutes;
    } else {
      // Handle overnight events, assuming it ends the next day
      durationInMinutes = (24 * 60 - startMinutes) + endMinutes;
    }

    try {
      const eventData = {
        title: formData.title,
        description: formData.description,
        date: eventDate.toISOString(),
        location: {
          venue: formData.venue, // venue is optional in model
          address: formData.address,
          city: formData.city,
          country: formData.country,
        },
        requirements: {
          minExperience: parseInt(formData.minExperience as string),
          maxPerformers: formData.maxComedians ? parseInt(formData.maxComedians as string) : undefined,
          duration: durationInMinutes,
        },
        status: formData.status,
      };

      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      };

      const res = await axios.post('/api/events', eventData, config);
      console.log('Événement créé:', res.data);
      alert('Événement créé avec succès !');
      onClose(); // Close the form on success
    } catch (error: any) {
      console.error('Erreur lors de la création de l\'événement:', error.response?.data || error.message);
      alert(`Erreur lors de la création de l'événement: ${error.response?.data?.message || error.message}`);
    }
  };

  const formContainerStyle: CSSProperties = {
    maxWidth: '1000px',
    margin: '40px auto',
    padding: '30px',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
    color: '#ffffff',
  };

  const formTitleStyle: CSSProperties = {
    fontSize: '2em',
    color: '#ff416c',
    marginBottom: '20px',
  };

  const inputGroupStyle: CSSProperties = {
    marginBottom: '15px',
  };

  const labelStyle: CSSProperties = {
    display: 'block',
    marginBottom: '5px',
    fontWeight: 'bold',
    color: '#ff4b2b',
  };

  const inputStyle: CSSProperties = {
    width: '100%',
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #555',
    backgroundColor: '#333',
    color: '#ffffff',
    boxSizing: 'border-box',
  };

  const textAreaStyle: CSSProperties = {
    ...inputStyle,
    minHeight: '80px',
    resize: 'vertical',
  };

  const twoColumnLayout: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '15px',
    marginBottom: '15px',
  };

  const buttonContainerStyle: CSSProperties = {
    marginTop: '30px',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '15px',
  };

  const primaryButtonStyle: CSSProperties = {
    padding: '10px 20px',
    borderRadius: '8px',
    border: 'none',
    background: 'linear-gradient(to right, #28a745, #218838)',
    color: 'white',
    fontSize: '1em',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background 0.3s ease',
  };

  const secondaryButtonStyle: CSSProperties = {
    padding: '10px 20px',
    borderRadius: '8px',
    border: 'none',
    background: 'linear-gradient(to right, #dc3545, #c82333)',
    color: 'white',
    fontSize: '1em',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background 0.3s ease',
  };

  return (
    <div style={formContainerStyle}>
      <h2 style={formTitleStyle}>Créer un nouvel événement</h2>
      <form onSubmit={handleSubmit}>
        <div style={inputGroupStyle}>
          <label htmlFor="title" style={labelStyle}>Titre de l'événement</label>
          <input type="text" id="title" style={inputStyle} placeholder="Titre de l'événement" value={formData.title} onChange={handleChange} required />
        </div>

        <div style={inputGroupStyle}>
          <label htmlFor="description" style={labelStyle}>Description</label>
          <textarea id="description" style={textAreaStyle} placeholder="Description" value={formData.description} onChange={handleChange} required></textarea>
        </div>

        <div style={twoColumnLayout}>
          <div style={inputGroupStyle}>
            <label htmlFor="city" style={labelStyle}>Ville</label>
            <input type="text" id="city" style={inputStyle} placeholder="Ville" value={formData.city} onChange={handleChange} required />
          </div>
          <div style={inputGroupStyle}>
            <label htmlFor="postalCode" style={labelStyle}>Code Postal</label>
            <input type="text" id="postalCode" style={inputStyle} placeholder="Code Postal" value={formData.postalCode} onChange={handleChange} />
          </div>
        </div>

        <div style={inputGroupStyle}>
          <label htmlFor="address" style={labelStyle}>Adresse</label>
          <input type="text" id="address" style={inputStyle} placeholder="Adresse" value={formData.address} onChange={handleChange} required />
        </div>

        <div style={inputGroupStyle}>
          <label htmlFor="country" style={labelStyle}>Pays</label>
          <input type="text" id="country" style={inputStyle} placeholder="Pays" value={formData.country} onChange={handleChange} required />
        </div>

        <div style={twoColumnLayout}>
          <div style={inputGroupStyle}>
            <label htmlFor="date" style={labelStyle}>Date</label>
            <input type="text" id="date" style={inputStyle} placeholder="jj/mm/aaaa" value={formData.date} onChange={handleChange} required />
          </div>
          <div style={inputGroupStyle}>
            <label htmlFor="venue" style={labelStyle}>Lieu</label>
            <input type="text" id="venue" style={inputStyle} placeholder="Lieu" value={formData.venue} onChange={handleChange} />
          </div>
        </div>

        <div style={twoColumnLayout}>
          <div style={inputGroupStyle}>
            <label htmlFor="startTime" style={labelStyle}>Heure de début</label>
            <input type="text" id="startTime" style={inputStyle} placeholder="--:--" value={formData.startTime} onChange={handleChange} required />
          </div>
          <div style={inputGroupStyle}>
            <label htmlFor="endTime" style={labelStyle}>Heure de fin</label>
            <input type="text" id="endTime" style={inputStyle} placeholder="--:--" value={formData.endTime} onChange={handleChange} required />
          </div>
        </div>

        <div style={twoColumnLayout}>
          <div style={inputGroupStyle}>
            <label htmlFor="minExperience" style={labelStyle}>Expérience minimale (années)</label>
            <input type="number" id="minExperience" style={inputStyle} placeholder="Expérience minimale" value={formData.minExperience} onChange={handleChange} required />
          </div>
        </div>

        <div style={inputGroupStyle}>
          <label htmlFor="maxComedians" style={labelStyle}>Nombre maximum d'humoristes</label>
          <input type="number" id="maxComedians" style={inputStyle} placeholder="Laisser vide si illimité" value={formData.maxComedians} onChange={handleChange} />
        </div>

        <div style={inputGroupStyle}>
          <label htmlFor="status" style={labelStyle}>Statut</label>
          <select id="status" style={inputStyle} value={formData.status} onChange={handleChange}>
            <option value="draft">Brouillon</option>
            <option value="published">Publié</option>
            <option value="archived">Archivé</option>
          </select>
        </div>

        <div style={buttonContainerStyle}>
          <button type="submit" style={primaryButtonStyle}>Créer l'événement</button>
          <button type="button" onClick={onClose} style={secondaryButtonStyle}>Annuler</button>
        </div>
      </form>
    </div>
  );
}

export default CreateEventForm; 