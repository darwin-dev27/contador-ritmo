import React from 'react';
import { Waves, Bike, Footprints, Trash2, Activity as ActivityIcon } from 'lucide-react';
import { activityAPI } from '../services/api';

export const WorkoutList = ({ workouts, onWorkoutDeleted }) => {
  const getIcon = (type) => {
    switch(type?.toLowerCase()) {
      case 'swim': return <Waves size={24} color="var(--accent-swim)" />;
      case 'bike': return <Bike size={24} color="var(--accent-bike)" />;
      case 'run': return <Footprints size={24} color="var(--accent-run)" />;
      default: return <ActivityIcon size={24} color="var(--text-muted)" />;
    }
  };

  const handleDelete = async (id) => {
    if(window.confirm("¿Seguro que deseas eliminar este registro?")) {
      try {
        await activityAPI.delete(id);
        if(onWorkoutDeleted) onWorkoutDeleted();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const formatDistance = (meters, sportType) => {
    if (!meters && meters !== 0) return '-';
    if (sportType === 'swim') {
      return `${Math.round(meters)} m`;
    }
    return `${(meters / 1000).toFixed(2)} km`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  if(!workouts || workouts.length === 0) {
    return (
      <div className="glass-panel" style={{ textAlign: 'center', opacity: 0.7 }}>
        <p>Aún no hay actividades registradas.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {workouts.map(w => (
        <div key={w.id} className="glass-panel animate-fade-in" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.8rem', borderRadius: '50%' }}>
              {getIcon(w.sport_type)}
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.2rem', textTransform: 'capitalize' }}>
                {w.sport_type || 'Actividad'}: {formatDistance(w.distance, w.sport_type)} en {w.elapsed_time}
              </h3>
              
              {w.feeling && (
                <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.1)', padding: '0.1rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', marginRight: '0.5rem' }}>
                  Sensación: {w.feeling}/10
                </div>
              )}
              <p style={{ margin: '0.3rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                {formatDate(w.start_time)} {w.description && `- "${w.description}"`}
              </p>
            </div>
          </div>
          
          <button className="secondary" onClick={() => handleDelete(w.id)} style={{ padding: '0.5rem', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
            <Trash2 size={18} />
          </button>
        </div>
      ))}
    </div>
  );
};
