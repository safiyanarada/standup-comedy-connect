import { useState, type CSSProperties } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });

  const handleSubmitLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login.mutateAsync(loginData);
      alert('Connexion réussie !');
      navigate('/dashboard'); // Redirige vers le tableau de bord après connexion
    } catch (error: any) {
      alert(error.response?.data?.message || 'Une erreur est survenue lors de la connexion');
    }
  };

  const handleChangeLogin = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const pageStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#1a1a2e', // Couleur de fond sombre
    backgroundImage: 'linear-gradient(to bottom right, #1a1a2e, #331f41)', // Dégradé subtil
    color: '#ffffff',
    fontFamily: 'Arial, sans-serif',
    textAlign: 'center',
  };

  const containerStyle: CSSProperties = {
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // Fond semi-transparent pour la carte
    padding: '40px',
    borderRadius: '15px',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)',
    maxWidth: '400px',
    width: '90%',
  };

  const inputStyle: CSSProperties = {
    width: 'calc(100% - 20px)',
    padding: '12px 10px',
    margin: '10px 0',
    borderRadius: '8px',
    border: '1px solid #444',
    backgroundColor: '#2c2c4d',
    color: '#ffffff',
    fontSize: '1em',
    outline: 'none',
  };

  const buttonStyle: CSSProperties = {
    width: '100%',
    padding: '15px',
    margin: '20px 0',
    borderRadius: '8px',
    border: 'none',
    background: 'linear-gradient(to right, #ff416c, #ff4b2b)', // Dégradé rose-rouge
    color: 'white',
    fontSize: '1.2em',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const linkStyle: CSSProperties = {
    color: '#ff416c',
    textDecoration: 'none',
    fontWeight: 'bold',
    marginTop: '10px',
  };

  const iconStyle: CSSProperties = {
    fontSize: '3em',
    marginBottom: '20px',
  };

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <div style={iconStyle}>🎤</div>
        <h2>Bon retour ! 👋</h2>
        <p>Connecte-toi pour accéder à ton tableau de bord</p>

        <form onSubmit={handleSubmitLogin} style={{ display: 'flex', flexDirection: 'column' }}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={loginData.email}
            onChange={handleChangeLogin}
            style={inputStyle}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Mot de passe"
            value={loginData.password}
            onChange={handleChangeLogin}
            style={inputStyle}
            required
          />
          <button type="submit" style={buttonStyle} disabled={login.isPending}>
            {login.isPending ? 'Connexion en cours...' : <>Se connecter <span style={{ marginLeft: '10px' }}>🚀</span></>}
          </button>
        </form>

        <p>Pas encore de compte ? <Link to="/register" style={linkStyle}>Inscris-toi</Link></p>
      </div>
    </div>
  );
}

export default LoginPage; 