import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { Activity } from 'lucide-react';
import styles from './Register.module.css';

export const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authAPI.register(formData.username, formData.email, formData.password);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError('Hubo un problema al crear la cuenta. Intenta con otro usuario u otra contraseña.');
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
          <h2 className={styles.title}>Crear Cuenta</h2>
          <p className={styles.subtitle}>Únete a TriCalc Pro</p>
        </div>

        {error && (
          <div className={styles.errorBox}>
            {error}
          </div>
        )}

        {success ? (
          <div className={styles.successBox}>
            Cuenta creada con éxito. Redirigiendo al login...
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Nombre de Usuario</label>
              <input type="text" name="username" value={formData.username} onChange={handleChange} required placeholder="atleta_123" />
            </div>

            <div className="input-group">
              <label>Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="correo@ejemplo.com" />
            </div>

            <div className="input-group">
              <label>Contraseña</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} required placeholder="••••••••" />
            </div>

            <button type="submit" disabled={loading} className={styles.submitButton}>
              {loading ? 'Procesando...' : 'Registrarme'}
            </button>

            <p className={styles.redirectText}>
              ¿Ya tienes una cuenta? <Link to="/login" className={styles.redirectLink}>Entra aquí</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};
