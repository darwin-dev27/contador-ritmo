import React, { useState } from 'react';
import { 
  format, addMonths, subMonths, addWeeks, subWeeks, 
  startOfWeek, endOfWeek, startOfMonth, endOfMonth, 
  eachDayOfInterval, isSameMonth, isSameDay, isToday, parseISO
} from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, List } from 'lucide-react';

export const TrainingCalendar = ({ workouts, onDayClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewState, setViewState] = useState('weekly'); // 'weekly' or 'monthly'

  // Funciones de navegación
  const next = () => setCurrentDate(viewState === 'weekly' ? addWeeks(currentDate, 1) : addMonths(currentDate, 1));
  const prev = () => setCurrentDate(viewState === 'weekly' ? subWeeks(currentDate, 1) : subMonths(currentDate, 1));
  const goToday = () => setCurrentDate(new Date());

  // Rango de fechas a renderizar según la vista
  const startDate = viewState === 'weekly' ? startOfWeek(currentDate, { weekStartsOn: 1 }) : startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 });
  const endDate = viewState === 'weekly' ? endOfWeek(currentDate, { weekStartsOn: 1 }) : endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 });
  
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const getDayWorkouts = (day) => {
    return workouts.filter(w => {
      if (!w.start_time) return false;
      const workoutDate = parseISO(w.start_time);
      return isSameDay(workoutDate, day);
    });
  };

  const getSportColor = (sport) => {
    switch (sport?.toLowerCase()) {
      case 'swim': return 'var(--accent-swim)';
      case 'bike': return 'var(--accent-bike)';
      case 'run': return 'var(--accent-run)';
      default: return 'var(--text-muted)';
    }
  };

  // Cabecera de Días de la semana (L, M, X, J, V, S, D)
  const weekDaysHeader = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '1.5rem', width: '100%' }}>
      {/* HEADER: Navegación y Controles */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button className="secondary" onClick={prev} style={{ padding: '0.4rem' }}><ChevronLeft /></button>
          <h2 style={{ fontSize: '1.25rem', minWidth: '160px', textAlign: 'center', margin: 0, textTransform: 'capitalize' }}>
            {viewState === 'weekly' 
              ? `${format(startDate, 'd MMM', {locale: es})} - ${format(endDate, 'd MMM', {locale: es})}` 
              : format(currentDate, 'MMMM yyyy', {locale: es})
            }
          </h2>
          <button className="secondary" onClick={next} style={{ padding: '0.4rem' }}><ChevronRight /></button>
          <button onClick={goToday} style={{ padding: '0.4rem 1rem', background: 'rgba(255,255,255,0.1)' }}>Hoy</button>
        </div>

        <div style={{ display: 'flex', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', padding: '0.25rem' }}>
          <button 
            type="button"
            onClick={() => setViewState('weekly')}
            style={{
              background: viewState === 'weekly' ? 'var(--primary)' : 'transparent',
              boxShadow: viewState === 'weekly' ? '0 2px 10px rgba(0,0,0,0.2)' : 'none',
              color: viewState === 'weekly' ? 'white' : 'var(--text-muted)',
              padding: '0.4rem 1rem', fontSize: '0.875rem'
            }}
          >
            Semana
          </button>
          <button 
            type="button"
            onClick={() => setViewState('monthly')}
            style={{
              background: viewState === 'monthly' ? 'var(--primary)' : 'transparent',
              boxShadow: viewState === 'monthly' ? '0 2px 10px rgba(0,0,0,0.2)' : 'none',
              color: viewState === 'monthly' ? 'white' : 'var(--text-muted)',
              padding: '0.4rem 1rem', fontSize: '0.875rem'
            }}
          >
            Mes
          </button>
        </div>
      </div>

      {/* DÍAS DE LA SEMANA */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem', marginBottom: '0.5rem', textAlign: 'center', fontWeight: 'bold', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
        {weekDaysHeader.map(d => <div key={d}>{d}</div>)}
      </div>

      {/* CUADRÍCULA DE DÍAS */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(7, 1fr)', 
        gridAutoRows: viewState === 'weekly' ? 'minmax(200px, auto)' : 'minmax(100px, auto)',
        gap: '0.5rem' 
      }}>
        {days.map(day => {
          const dayWorkouts = getDayWorkouts(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isDayToday = isToday(day);

          return (
            <div 
              key={day.toISOString()} 
              onClick={() => onDayClick && onDayClick(day)}
              style={{
                background: isDayToday ? 'rgba(14, 165, 233, 0.1)' : 'rgba(255,255,255,0.02)',
                border: isDayToday ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.05)',
                borderRadius: '8px',
                padding: '0.5rem',
                opacity: (viewState === 'monthly' && !isCurrentMonth) ? 0.4 : 1,
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex', flexDirection: 'column', gap: '0.4rem'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              onMouseLeave={(e) => e.currentTarget.style.background = isDayToday ? 'rgba(14, 165, 233, 0.1)' : 'rgba(255,255,255,0.02)'}
            >
              <div style={{ fontSize: '0.85rem', fontWeight: isDayToday ? 'bold' : 'normal', color: isDayToday ? 'var(--primary)' : 'var(--text-main)', textAlign: 'right' }}>
                {format(day, 'd')}
              </div>
              
              {/* LISTA DE ACTIVIDADES EN EL DÍA */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flexGrow: 1 }}>
                {dayWorkouts.map(w => (
                  <div key={w.id} style={{
                    background: w.completed ? `rgba(0,0,0,0.3)` : 'transparent',
                    borderLeft: `3px solid ${getSportColor(w.sport_type)}`,
                    border: !w.completed ? `1px dashed ${getSportColor(w.sport_type)}` : undefined,
                    padding: '0.3rem',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    opacity: w.completed ? 1 : 0.7,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.2rem'
                  }}>
                    <strong style={{ textTransform: 'capitalize' }}>{w.sport_type} {w.completed ? '' : '(Plan)'}</strong>
                    {viewState === 'weekly' && w.description && (
                      <span style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {w.description}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
