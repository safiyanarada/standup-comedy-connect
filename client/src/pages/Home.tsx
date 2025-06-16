import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';

function Home() {
  const { register, login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'COMEDIAN' as const,
    profile: {
      bio: '',
      experience: '',
    },
  });

  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });

  const [events, setEvents] = useState<any[]>([]);
  const [eventsError, setEventsError] = useState<string | null>(null);
  const [eventsLoading, setEventsLoading] = useState<boolean>(false);

  const handleSubmitRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register.mutateAsync(formData);
      alert('Inscription réussie !');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Une erreur est survenue lors de l\'inscription');
    }
  };

  const handleSubmitLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await login.mutateAsync(loginData);
      alert('Connexion réussie ! Token : ' + response.token);
      console.log('Token JWT:', response.token);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Une erreur est survenue lors de la connexion');
    }
  };

  const handleFetchEvents = async () => {
    setEventsLoading(true);
    setEventsError(null);
    try {
      const response = await api.get('/events');
      setEvents(response.data);
    } catch (error: any) {
      setEventsError(error.response?.data?.message || 'Erreur lors de la récupération des événements');
    } finally {
      setEventsLoading(false);
    }
  };

  const handleChangeRegister = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'bio' || name === 'experience') {
      setFormData(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          [name]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleChangeLogin = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', display: 'flex', gap: '40px' }}>
      <div style={{ flex: 1 }}>
        <h1>Test d'inscription</h1>
        <form onSubmit={handleSubmitRegister} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChangeRegister}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Mot de passe"
            value={formData.password}
            onChange={handleChangeRegister}
            required
          />
          <input
            type="text"
            name="firstName"
            placeholder="Prénom"
            value={formData.firstName}
            onChange={handleChangeRegister}
            required
          />
          <input
            type="text"
            name="lastName"
            placeholder="Nom"
            value={formData.lastName}
            onChange={handleChangeRegister}
            required
          />
          <textarea
            name="bio"
            placeholder="Biographie"
            value={formData.profile.bio}
            onChange={handleChangeRegister}
            required
          ></textarea>
          <textarea
            name="experience"
            placeholder="Expérience"
            value={formData.profile.experience}
            onChange={handleChangeRegister}
            required
          ></textarea>
          <select
            name="role"
            value={formData.role}
            onChange={handleChangeRegister}
            required
          >
            <option value="COMEDIAN">Comédien</option>
            <option value="ORGANIZER">Organisateur</option>
          </select>
          <button type="submit" disabled={register.isPending}>
            {register.isPending ? 'Inscription en cours...' : 'S\'inscrire'}
          </button>
        </form>

        {register.isError && (
          <div style={{ color: 'red', marginTop: '10px' }}>
            Erreur : {register.error?.message}
          </div>
        )}

        {register.isSuccess && (
          <div style={{ color: 'green', marginTop: '10px' }}>
            Inscription réussie !
          </div>
        )}
      </div>

      <div style={{ flex: 1 }}>
        <h1>Test de connexion</h1>
        <form onSubmit={handleSubmitLogin} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={loginData.email}
            onChange={handleChangeLogin}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Mot de passe"
            value={loginData.password}
            onChange={handleChangeLogin}
            required
          />
          <button type="submit" disabled={login.isPending}>
            {login.isPending ? 'Connexion en cours...' : 'Se connecter'}
          </button>
        </form>

        {login.isError && (
          <div style={{ color: 'red', marginTop: '10px' }}>
            Erreur : {login.error?.message}
          </div>
        )}

        {login.isSuccess && (
          <div style={{ color: 'green', marginTop: '10px' }}>
            Connexion réussie !
          </div>
        )}

        <h2 style={{ marginTop: '30px' }}>Test des routes protégées</h2>
        <button onClick={handleFetchEvents} disabled={eventsLoading}>
          {eventsLoading ? 'Chargement des événements...' : 'Récupérer les événements'}
        </button>

        {eventsError && (
          <div style={{ color: 'red', marginTop: '10px' }}>
            Erreur : {eventsError}
          </div>
        )}

        {events.length > 0 && (
          <div style={{ marginTop: '10px' }}>
            <h3>Événements récupérés :</h3>
            <pre>{JSON.stringify(events, null, 2)}</pre>
          </div>
        )}

        {events.length === 0 && !eventsLoading && !eventsError && (
          <div style={{ marginTop: '10px', color: 'gray' }}>
            Aucun événement trouvé ou pas encore récupéré.
          </div>
        )}

      </div>
    </div>
  );
}

export default Home; 