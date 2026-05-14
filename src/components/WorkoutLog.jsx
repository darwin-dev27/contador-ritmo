import React, { useState, useEffect } from 'react';
import { activityAPI } from '../services/api';
import { Save, CalendarClock } from 'lucide-react';

export const WorkoutLog = ({ onWorkoutAdded, selectedDate }) => {
  const [formData, setFormData] = useState({
    sport_type: 'swim',
    date: new Date().toISOString().split('T')[0],
    time: '12:00',
    elapsed_time: '01:00:00',
    distance: '',
    feeling: '',
    notes: '',
    is_planned: false
  });
  const [loading, setLoading] = useState(false);

  // Si desde el calendario pinchan un día, pre-cargamos esa fecha en el form
  useEffect(() => {
    if (selectedDate) {
      setFormData(f => ({ ...f, date: selectedDate, is_planned: new Date(selectedDate) > new Date() }));
    }
  }, [selectedDate]);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // El backend requiere 'start_time' como Datetime.
    const start_time = `${formData.date}T${formData.time}:00Z`;

    // El backend espera metros para registrar.
    let distanceInMeters = parseFloat(formData.distance) || 0;
    if (formData.sport_type === 'bike' || formData.sport_type === 'run') {
      distanceInMeters = distanceInMeters * 1000;
    }

    const payload = {
      sport_type: formData.sport_type,
      start_time: start_time,
      elapsed_time: formData.elapsed_time,
      distance: distanceInMeters,
      feeling: (!formData.is_planned && formData.feeling) ? parseInt(formData.feeling) : null,
      description: formData.notes,
      source: 'manual',
      completed: !formData.is_planned // Si es planeado, completed será false.
    };

    try {
      await activityAPI.create(payload);
      setFormData({ ...formData, distance: '', notes: '', feeling: '', is_planned: false });
      if (onWorkoutAdded) onWorkoutAdded();
    } catch (err) {
      console.error(err);
      alert("Error al guardar la actividad.");
    } finally {
      setLoading(false);
    }
  };

  const isKm = formData.sport_type === 'bike' || formData.sport_type === 'run';

  return (
    <div className="glass-panel animate-fade-in" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
      <h2 style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>
        {formData.is_planned ? 'Planificar Actividad' : 'Registrar Actividad'}
      </h2>
      
      <form onSubmit={handleSubmit}>
        
        {/* Toggle / Checkbox interactivo para "Realizado vs Planificado" */}
        <div style={{ marginBottom: '1.5rem', padding: '0.8rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <input 
            type="checkbox" 
            id="is_planned" 
            name="is_planned" 
            checked={formData.is_planned} 
            onChange={handleChange}
            style={{ width: '20px', height: '20px', accentColor: 'var(--primary)' }}
          />
          <label htmlFor="is_planned" style={{ flexGrow: 1, cursor: 'pointer', fontSize: '0.95rem' }}>
            Es una planificación futura
          </label>
        </div>

        <div className="input-group">
          <label>Deporte</label>
          <select 
            name="sport_type" 
            value={formData.sport_type} 
            onChange={handleChange}
            style={{
              background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--panel-border)',
              color: 'var(--text-main)', padding: '0.875rem 1rem', borderRadius: '12px',
              fontFamily: 'inherit', fontSize: '1rem',
            }}
          >
            <option value="swim">Natación</option>
            <option value="bike">Ciclismo</option>
            <option value="run">Carrera</option>
            <option value="other">Otro</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <div className="input-group" style={{ flex: 1 }}>
            <label>Fecha</label>
            <input type="date" name="date" value={formData.date} onChange={handleChange} required />
          </div>
          <div className="input-group" style={{ flex: 1 }}>
            <label>Hora</label>
            <input type="time" name="time" value={formData.time} onChange={handleChange} required />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <div className="input-group" style={{ flex: 1 }}>
            <label>{formData.is_planned ? 'Duración Objetivo' : 'Duración Real'}</label>
            <input type="text" name="elapsed_time" value={formData.elapsed_time} onChange={handleChange} required placeholder="01:30:00" />
          </div>
          <div className="input-group" style={{ flex: 1 }}>
            <label>{formData.is_planned ? 'Distancia Objetivo' : 'Distancia Real'} {isKm ? '(km)' : '(m)'}</label>
            <input type="number" step="0.01" name="distance" value={formData.distance} onChange={handleChange} required placeholder={isKm ? "10.5" : "1500"} />
          </div>
        </div>

        {/* Solo mostrar Sensación si ya se realizó la actividad */}
        {!formData.is_planned && (
          <div className="input-group">
            <label>Sensación Pos-entreno (1-10)</label>
            <input type="number" min="1" max="10" name="feeling" value={formData.feeling} onChange={handleChange} placeholder="Ej. 7" />
          </div>
        )}

        <div className="input-group">
          <label>Notas / Descripción</label>
          <input type="text" name="notes" value={formData.notes} onChange={handleChange} placeholder={formData.is_planned ? "Estructura: 4x100m fuertes..." : "¿Cómo te sentiste?"} />
        </div>

        <button type="submit" disabled={loading} style={{ width: '100%', marginTop: '1rem' }}>
          {formData.is_planned ? <CalendarClock size={20} /> : <Save size={20} />}
          {loading ? 'Guardando...' : (formData.is_planned ? 'Agendar Entrenamiento' : 'Guardar Actividad')}
        </button>
      </form>
    </div>
  );
};

