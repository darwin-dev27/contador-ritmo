import React, { useState } from 'react';
import { 
  format, addMonths, subMonths, addWeeks, subWeeks, 
  startOfWeek, endOfWeek, startOfMonth, endOfMonth, 
  eachDayOfInterval, isSameMonth, isSameDay, isToday, parseISO
} from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './TrainingCalendar.module.css';

export const TrainingCalendar = ({ workouts, onDayClick, onWorkoutClick }) => {
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

  const getSportClass = (sport) => {
    const s = sport?.toLowerCase();
    if (['swim', 'bike', 'run'].includes(s)) return styles[s];
    return styles.other;
  };

  // Cabecera de Días de la semana (Lun, Mar, Mié, Jue, Vie, Sáb, Dom)
  const weekDaysHeader = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  return (
    <div className={`glass-panel animate-fade-in ${styles.calendarContainer}`}>
      {/* HEADER: Navegación y Controles */}
      <div className={styles.header}>
        
        <div className={styles.controls}>
          <button className={`secondary ${styles.chevronButton}`} onClick={prev}><ChevronLeft /></button>
          <h2 className={styles.title}>
            {viewState === 'weekly' 
              ? `${format(startDate, 'd MMM', {locale: es})} - ${format(endDate, 'd MMM', {locale: es})}` 
              : format(currentDate, 'MMMM yyyy', {locale: es})
            }
          </h2>
          <button className={`secondary ${styles.chevronButton}`} onClick={next}><ChevronRight /></button>
          <button onClick={goToday} className={styles.todayButton}>Hoy</button>
        </div>

        <div className={styles.viewToggleContainer}>
          <button 
            type="button"
            onClick={() => setViewState('weekly')}
            className={`${styles.viewToggleButton} ${viewState === 'weekly' ? styles.active : ''}`}
          >
            Semana
          </button>
          <button 
            type="button"
            onClick={() => setViewState('monthly')}
            className={`${styles.viewToggleButton} ${viewState === 'monthly' ? styles.active : ''}`}
          >
            Mes
          </button>
        </div>
      </div>

      {/* DÍAS DE LA SEMANA */}
      <div className={styles.weekdaysHeader}>
        {weekDaysHeader.map(d => <div key={d}>{d}</div>)}
      </div>

      {/* CUADRÍCULA DE DÍAS */}
      <div className={`${styles.daysGrid} ${viewState === 'weekly' ? styles.weekly : styles.monthly}`}>
        {days.map(day => {
          const dayWorkouts = getDayWorkouts(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isDayToday = isToday(day);

          return (
            <div 
              key={day.toISOString()} 
              onClick={() => onDayClick && onDayClick(day)}
              className={`${styles.dayCell} ${isDayToday ? styles.today : ''} ${
                (viewState === 'monthly' && !isCurrentMonth) ? styles.outsideMonth : ''
              }`}
            >
              <div className={`${styles.dayNumber} ${isDayToday ? styles.today : ''}`}>
                {format(day, 'd')}
              </div>
              
              {/* LISTA DE ACTIVIDADES EN EL DÍA */}
              <div className={styles.activitiesContainer}>
                {dayWorkouts.map(w => (
                  <div 
                    key={w.id} 
                    onClick={(e) => {
                      e.stopPropagation();
                      onWorkoutClick && onWorkoutClick(w);
                    }}
                    style={{ cursor: 'pointer' }}
                    className={`${styles.activityItem} ${
                      w.completed ? styles.completed : styles.planned
                    } ${getSportClass(w.sport_type)}`}
                  >
                    <strong className={styles.activityTitle}>
                      {w.sport_type} {w.completed ? '' : '(Plan)'}
                    </strong>
                    {viewState === 'weekly' && w.description && (
                      <span className={styles.activityDesc}>
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
