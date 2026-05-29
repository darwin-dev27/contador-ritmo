import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Activity } from 'lucide-react';
import styles from './Login.module.css';

export const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
      // Tras el login exitoso, redirigimos al diario
      navigate('/diary');
    } catch (err) {
      setError('Credenciales incorrectas. Verifica tu usuario y contraseña.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={`glass-panel animate-fade-in ${styles.panel}`}>
        <div className={styles.header}>
          <div className={styles.logoWrapper}>
            <Activity size={32} color="white" />
          </div>
          <h2 className={styles.title}>Bienvenido a TriCalc Pro</h2>
          <p className={styles.subtitle}>Accede a tu diario de entrenamiento</p>
        </div>

        {error && (
          <div className={styles.errorBox}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Usuario</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Ej. atleta_pro"
            />
          </div>

          <div className="input-group">
            <label>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          <button type="submit" disabled={loading} className={styles.submitButton}>
            {loading ? 'Iniciando sesión...' : 'Entrar'}
          </button>

          <p className={styles.redirectText}>
            ¿No tienes cuenta? <Link to="/register" className={styles.redirectLink}>Regístrate aquí</Link>
          </p>
        </form>
      </div>
    </div>
  );
};
