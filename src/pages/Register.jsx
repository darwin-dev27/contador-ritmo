import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { Activity } from 'lucide-react';

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
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '400px', padding: '3rem 2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
          <div style={{ background: 'var(--primary)', padding: '1rem', borderRadius: '50%', marginBottom: '1rem' }}>
            <Activity size={32} color="white" />
          </div>
          <h2 style={{ color: 'white', textAlign: 'center' }}>Crear Cuenta</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>Únete a TriCalc Pro</p>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#fca5a5', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.875rem', textAlign: 'center' }}>
            {error}
          </div>
        )}

        {success ? (
          <div style={{ background: 'rgba(16, 185, 129, 0.2)', border: '1px solid #10b981', color: '#6ee7b7', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
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

            <button type="submit" disabled={loading} style={{ width: '100%', marginTop: '1rem', padding: '1rem' }}>
              {loading ? 'Procesando...' : 'Registrarme'}
            </button>
            
            <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              ¿Ya tienes una cuenta? <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 'bold' }}>Entra aquí</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};
