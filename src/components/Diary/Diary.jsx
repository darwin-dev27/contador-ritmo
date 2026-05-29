import React, { useState, useEffect } from 'react';
import { WorkoutLog } from '../WorkoutLog/WorkoutLog.jsx';
import { WorkoutList } from '../WorkoutList/WorkoutList.jsx';
import { TrainingCalendar } from '../TrainingCalendar/TrainingCalendar.jsx';
import { activityAPI } from '../../services/api';
import { Activity, Calendar as CalendarIcon, List, Sparkles, X, Heart, Flame, TrendingUp, Edit2 } from 'lucide-react';
import { format } from 'date-fns';
import styles from './Diary.module.css';

export const Diary = () => {
  const [workouts, setWorkouts] = useState([]);
  const [stats, setStats] = useState({ total_workouts: 0, total_distance: 0 });
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' o 'list'
  const [preSelectedDate, setPreSelectedDate] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [editingWorkout, setEditingWorkout] = useState(null);

  const fetchData = async () => {
    try {
      const response = await activityAPI.getAll();
      const data = response.results ? response.results : response;

      // Sorting desc by start_time
      setWorkouts(data.sort((a, b) => new Date(b.start_time) - new Date(a.start_time)));

      const userStats = await activityAPI.getStats();
      const totalActivities = userStats.general?.total_activities || 0;
      setStats({
        total_workouts: totalActivities,
        total_distance: userStats.general?.total_distance || 0
      });

      // Si no tiene actividades registradas, mostramos el banner de onboarding y disparamos el brillo del Navbar
      if (totalActivities === 0) {
        const alreadyGlowed = sessionStorage.getItem('already_glowed_onboarding');
        if (!alreadyGlowed) {
          setShowOnboarding(true);
          window.dispatchEvent(new CustomEvent('trigger-navbar-glow'));
          sessionStorage.setItem('already_glowed_onboarding', 'true');
        } else {
          const dismissed = sessionStorage.getItem('onboarding_dismissed');
          if (!dismissed) {
            setShowOnboarding(true);
          }
        }
      } else {
        setShowOnboarding(false);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDayClick = (day) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    setPreSelectedDate(dateStr);
    // Scrolling to form on mobile or small screens
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  return (
    <div className="animate-fade-in">
      {/* Banner de Onboarding */}
      {showOnboarding && (
        <div className={styles.onboardingBanner}>
          <div className={styles.onboardingContent}>
            <div className={styles.onboardingIconContainer}>
              <Sparkles size={20} />
            </div>
            <p className={styles.onboardingText}>
              ¡Bienvenido! <span className={styles.onboardingHighlight}>Completa tu perfil</span> y añade competiciones futuras o registra actividades o material deportivo.
            </p>
          </div>
          <button 
            className={styles.closeButton} 
            onClick={() => {
              setShowOnboarding(false);
              sessionStorage.setItem('onboarding_dismissed', 'true');
            }}
            title="Cerrar aviso"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Top Stats Banner & View Toggle */}
      <div className={`glass-panel ${styles.statsBanner}`}>
        <div className={styles.statsContainer}>
          <Activity size={32} color="var(--primary)" />
          <div>
            <h3 className={styles.statsTitle}>Progreso Acumulado</h3>
            <div className={styles.statsValues}>
              <div><strong className={styles.statsNumber}>{stats.total_workouts || 0}</strong> Sesiones</div>
              <div><strong className={styles.statsNumber}>{Number(stats.total_distance / 1000).toFixed(1) || 0}</strong> Kms Total</div>
            </div>
          </div>
        </div>

        {/* View Toggles */}
        <div className={styles.toggleContainer}>
          <button
            type="button"
            onClick={() => setViewMode('calendar')}
            className={`${styles.toggleButton} ${viewMode === 'calendar' ? styles.active : ''}`}
          >
            <CalendarIcon size={18} /> Calendario
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`${styles.toggleButton} ${viewMode === 'list' ? styles.active : ''}`}
          >
            <List size={18} /> Lista
          </button>
        </div>
      </div>

      <div className={styles.diaryGrid}>
        <WorkoutLog 
          onWorkoutAdded={fetchData} 
          selectedDate={preSelectedDate} 
          editWorkout={editingWorkout}
          onClearEdit={() => setEditingWorkout(null)}
        />

        <div className={styles.scrollbarContainer}>
          {viewMode === 'calendar' ? (
            <TrainingCalendar workouts={workouts} onDayClick={handleDayClick} onWorkoutClick={setSelectedWorkout} />
          ) : (
            <WorkoutList workouts={workouts} onWorkoutDeleted={fetchData} onWorkoutClick={setSelectedWorkout} />
          )}
        </div>
      </div>

      {/* Modal de Detalle de Actividad */}
      {selectedWorkout && (
        <div className={styles.modalOverlay} onClick={() => setSelectedWorkout(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitleArea}>
                <span className={styles.modalBadge}>
                  {selectedWorkout.completed ? 'Completado' : 'Planificado'}
                </span>
                <h3 className={styles.modalTitle}>
                  {selectedWorkout.sport_type === 'swim' ? '🏊 Natación' :
                   selectedWorkout.sport_type === 'bike' ? '🚴 Ciclismo' :
                   selectedWorkout.sport_type === 'run' ? '🏃 Carrera' : '💪 Actividad'}
                </h3>
              </div>
              <button className={styles.modalCloseX} onClick={() => setSelectedWorkout(null)}>
                <X size={24} />
              </button>
            </div>

            <div className={styles.modalGrid}>
              <div className={styles.modalCard}>
                <div className={styles.modalCardLabel}>Distancia</div>
                <div className={styles.modalCardValue}>
                  {selectedWorkout.sport_type === 'swim' 
                    ? `${Math.round(selectedWorkout.distance || 0)} m`
                    : `${((selectedWorkout.distance || 0) / 1000).toFixed(2)} km`}
                </div>
              </div>

              <div className={styles.modalCard}>
                <div className={styles.modalCardLabel}>Duración</div>
                <div className={styles.modalCardValue}>{selectedWorkout.elapsed_time || '--'}</div>
              </div>

              {selectedWorkout.avg_heart_rate && (
                <div className={styles.modalCard}>
                  <div className={styles.modalCardLabel} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Heart size={12} color="#ef4444" /> FC Media
                  </div>
                  <div className={styles.modalCardValue}>{selectedWorkout.avg_heart_rate} bpm</div>
                </div>
              )}

              {selectedWorkout.calories && (
                <div className={styles.modalCard}>
                  <div className={styles.modalCardLabel} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Flame size={12} color="#f97316" /> Calorías
                  </div>
                  <div className={styles.modalCardValue}>{selectedWorkout.calories} kcal</div>
                </div>
              )}

              {selectedWorkout.total_ascent && (
                <div className={styles.modalCard}>
                  <div className={styles.modalCardLabel} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <TrendingUp size={12} color="var(--primary)" /> Desnivel +
                  </div>
                  <div className={styles.modalCardValue}>{Math.round(selectedWorkout.total_ascent)} m</div>
                </div>
              )}

              {selectedWorkout.feeling && (
                <div className={styles.modalCard}>
                  <div className={styles.modalCardLabel}>Sensación (RPE)</div>
                  <div className={styles.modalCardValue}>{selectedWorkout.feeling} / 10</div>
                </div>
              )}
            </div>

            {selectedWorkout.gear_names && selectedWorkout.gear_names.length > 0 && (
              <div className={styles.modalSection}>
                <h4 className={styles.modalSectionTitle}>Material deportivo utilizado</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                  {selectedWorkout.gear_names.map((name, i) => (
                    <span key={i} style={{ fontSize: '0.8rem', background: 'rgba(14, 165, 233, 0.15)', border: '1px solid var(--primary)', color: 'var(--primary)', padding: '0.3rem 0.6rem', borderRadius: '20px', fontWeight: 600 }}>
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className={styles.modalSection}>
              <h4 className={styles.modalSectionTitle}>Fecha y Hora</h4>
              <p className={styles.modalText}>
                {new Date(selectedWorkout.start_time).toLocaleDateString()} a las {new Date(selectedWorkout.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>

            {selectedWorkout.description && (
              <div className={styles.modalSection}>
                <h4 className={styles.modalSectionTitle}>Notas y Comentarios</h4>
                <p className={styles.modalText} style={{ fontStyle: 'italic', background: 'rgba(255, 255, 255, 0.02)', padding: '0.8rem', borderRadius: '8px', borderLeft: '3px solid var(--primary)' }}>
                  "{selectedWorkout.description}"
                </p>
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button 
                className="secondary" 
                onClick={() => setSelectedWorkout(null)}
                style={{ flex: 1, padding: '0.75rem', borderRadius: '10px', fontWeight: 600 }}
              >
                Cerrar
              </button>
              <button 
                onClick={() => {
                  setEditingWorkout(selectedWorkout);
                  setSelectedWorkout(null);
                }}
                style={{ flex: 1, padding: '0.75rem', borderRadius: '10px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
              >
                <Edit2 size={16} /> Editar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
