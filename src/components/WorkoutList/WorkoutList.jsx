import React from 'react';
import { Waves, Bike, Footprints, Trash2, Activity as ActivityIcon } from 'lucide-react';
import { activityAPI } from '../../services/api';
import styles from './WorkoutList.module.css';

export const WorkoutList = ({ workouts, onWorkoutDeleted }) => {
  const getIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'swim': return <Waves size={24} color="var(--accent-swim)" />;
      case 'bike': return <Bike size={24} color="var(--accent-bike)" />;
      case 'run': return <Footprints size={24} color="var(--accent-run)" />;
      default: return <ActivityIcon size={24} color="var(--text-muted)" />;
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Seguro que deseas eliminar este registro?")) {
      try {
        await activityAPI.delete(id);
        if (onWorkoutDeleted) onWorkoutDeleted();
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
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!workouts || workouts.length === 0) {
    return (
      <div className={`glass-panel ${styles.emptyState}`}>
        <p>Aún no hay actividades registradas.</p>
      </div>
    );
  }

  return (
    <div className={styles.listWrapper}>
      {workouts.map(w => (
        <div key={w.id} className={`glass-panel animate-fade-in ${styles.workoutCard}`}>
          <div className={styles.leftContent}>
            <div className={styles.iconWrapper}>
              {getIcon(w.sport_type)}
            </div>
            <div>
              <h3 className={styles.title}>
                {w.sport_type || 'Actividad'}: {formatDistance(w.distance, w.sport_type)} en {w.elapsed_time}
              </h3>

              {w.feeling && (
                <div className={styles.feelingBadge}>
                  Sensación: {w.feeling}/10
                </div>
              )}

              {w.gear_names && w.gear_names.length > 0 && (
                <div className={styles.gearsContainer}>
                  {w.gear_names.map((name, i) => (
                    <span key={i} className={styles.gearBadge}>{name}</span>
                  ))}
                </div>
              )}

              <p className={styles.metaText}>
                {formatDate(w.start_time)} {w.description && `- "${w.description}"`}
              </p>
            </div>
          </div>

          <button className={`secondary ${styles.deleteButton}`} onClick={() => handleDelete(w.id)}>
            <Trash2 size={18} />
          </button>
        </div>
      ))}
    </div>
  );
};
