import React, { useState, useEffect } from 'react';
import { WorkoutLog } from './WorkoutLog';
import { WorkoutList } from './WorkoutList';
import { TrainingCalendar } from './TrainingCalendar';
import { activityAPI } from '../services/api';
import { Activity, Calendar as CalendarIcon, List } from 'lucide-react';
import { format } from 'date-fns';

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
      setWorkouts(data.sort((a,b) => new Date(b.start_time) - new Date(a.start_time)));
      
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
      <div className="glass-panel" style={{ marginBottom: '2rem', padding: '1.5rem', display: 'flex', gap: '2rem', alignItems: 'center', borderColor: 'var(--primary)', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexGrow: 1 }}>
          <Activity size={32} color="var(--primary)" />
          <div>
            <h3 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Progreso Acumulado</h3>
            <div style={{ display: 'flex', gap: '2rem', marginTop: '0.5rem' }}>
              <div><strong style={{ fontSize: '1.5rem', color: '#fff' }}>{stats.total_workouts || 0}</strong> Sesiones</div>
              <div><strong style={{ fontSize: '1.5rem', color: '#fff' }}>{Number(stats.total_distance / 1000).toFixed(1) || 0}</strong> Kms Total</div>
            </div>
          </div>
        </div>

        {/* View Toggles */}
        <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', padding: '0.25rem' }}>
          <button 
            type="button"
            onClick={() => setViewMode('calendar')}
            style={{
              background: viewMode === 'calendar' ? 'rgba(255,255,255,0.1)' : 'transparent',
              color: viewMode === 'calendar' ? 'white' : 'var(--text-muted)',
              padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem'
            }}
          >
            <CalendarIcon size={18} /> Calendario
          </button>
          <button 
            type="button"
            onClick={() => setViewMode('list')}
            style={{
              background: viewMode === 'list' ? 'rgba(255,255,255,0.1)' : 'transparent',
              color: viewMode === 'list' ? 'white' : 'var(--text-muted)',
              padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem'
            }}
          >
            <List size={18} /> Lista
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '2rem' }} className="diary-grid">
        <WorkoutLog onWorkoutAdded={fetchData} selectedDate={preSelectedDate} />
        
        <div style={{ overflowY: 'auto', maxHeight: '800px', paddingRight: '1rem' }} className="custom-scrollbar">
          {viewMode === 'calendar' ? (
            <TrainingCalendar workouts={workouts} onDayClick={handleDayClick} />
          ) : (
            <WorkoutList workouts={workouts} onWorkoutDeleted={fetchData} />
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @media (min-width: 900px) {
          .diary-grid { grid-template-columns: 350px 1fr !important; }
        }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
      `}} />
    </div>
  );
};
