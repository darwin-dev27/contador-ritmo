import React, { useState, useEffect } from 'react';
import { WorkoutLog } from '../WorkoutLog/WorkoutLog.jsx';
import { WorkoutList } from '../WorkoutList/WorkoutList.jsx';
import { TrainingCalendar } from '../TrainingCalendar/TrainingCalendar.jsx';
import { activityAPI } from '../../services/api';
import { Activity, Calendar as CalendarIcon, List } from 'lucide-react';
import { format } from 'date-fns';
import styles from './Diary.module.css';

export const Diary = () => {
  const [workouts, setWorkouts] = useState([]);
  const [stats, setStats] = useState({ total_workouts: 0, total_distance: 0 });
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' o 'list'
  const [preSelectedDate, setPreSelectedDate] = useState(null);

  const fetchData = async () => {
    try {
      const response = await activityAPI.getAll();
      const data = response.results ? response.results : response;

      // Sorting desc by start_time
      setWorkouts(data.sort((a, b) => new Date(b.start_time) - new Date(a.start_time)));

      const userStats = await activityAPI.getStats();
      setStats({
        total_workouts: userStats.general?.total_activities || 0,
        total_distance: userStats.general?.total_distance || 0
      });
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
        <WorkoutLog onWorkoutAdded={fetchData} selectedDate={preSelectedDate} />

        <div className={styles.scrollbarContainer}>
          {viewMode === 'calendar' ? (
            <TrainingCalendar workouts={workouts} onDayClick={handleDayClick} />
          ) : (
            <WorkoutList workouts={workouts} onWorkoutDeleted={fetchData} />
          )}
        </div>
      </div>
    </div>
  );
};
