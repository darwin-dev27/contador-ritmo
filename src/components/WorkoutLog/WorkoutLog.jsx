import React, { useState, useEffect } from 'react';
import { activityAPI, gearAPI } from '../../services/api';
import { Save, CalendarClock } from 'lucide-react';
import styles from './WorkoutLog.module.css';

export const WorkoutLog = ({ onWorkoutAdded, selectedDate }) => {
  const [formData, setFormData] = useState({
    sport_type: 'swim',
    sub_sport: 'pool',
    date: new Date().toISOString().split('T')[0],
    time: '12:00',
    elapsed_time: '01:00:00',
    distance: '',
    feeling: '',
    notes: '',
    avg_heart_rate: '',
    max_heart_rate: '',
    total_ascent: '',
    calories: '',
    cadence: '',
    avg_power: '',
    strokes: '',
    fit_file: null,
    is_planned: false,
    gear: ''
  });
  const [loading, setLoading] = useState(false);
  const [gears, setGears] = useState([]);

  const subSportOptions = {
    swim: [{ id: 'pool', name: 'Piscina' }, { id: 'open_water', name: 'Aguas abiertas' }],
    bike: [{ id: 'road', name: 'Carretera' }, { id: 'mtb', name: 'Mountain Bike' }, { id: 'gravel', name: 'Gravel' }, { id: 'indoor_bike', name: 'Rodillo' }],
    run: [{ id: 'road_run', name: 'Carretera' }, { id: 'trail', name: 'Trail' }, { id: 'track', name: 'Pista' }, { id: 'treadmill', name: 'Cinta' }],
    other: [{ id: 'other', name: 'Otro' }, { id: 'triathlon', name: 'Triatlón' }]
  };

  useEffect(() => {
    if (selectedDate) setFormData(f => ({ ...f, date: selectedDate, is_planned: new Date(selectedDate) > new Date() }));
  }, [selectedDate]);

  useEffect(() => {
    gearAPI.getAll()
      .then(res => setGears(res.results ? res.results : res))
      .catch(console.error);
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    setFormData(prev => {
      const upd = { ...prev, [name]: val };
      if (name === 'sport_type') upd.sub_sport = subSportOptions[value][0].id;
      return upd;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const start_time = `${formData.date}T${formData.time}:00Z`;
    let meters = (parseFloat(formData.distance) || 0) * (['bike', 'run'].includes(formData.sport_type) ? 1000 : 1);

    const payload = new FormData();
    const fields = ['sport_type', 'sub_sport', 'elapsed_time', 'notes', 'feeling', 'avg_heart_rate', 'max_heart_rate', 'total_ascent', 'calories'];
    payload.append('start_time', start_time);
    payload.append('distance', meters);
    payload.append('completed', !formData.is_planned);
    payload.append('source', 'manual');

    fields.forEach(f => { if (formData[f]) payload.append(f === 'notes' ? 'description' : f, formData[f]); });
    if (formData.gear) payload.append('gear', formData.gear);
    if (formData.fit_file) payload.append('raw_fit_file', formData.fit_file);

    const specific = {};
    if (formData.sport_type === 'run' && formData.cadence) specific.cadence = formData.cadence;
    if (formData.sport_type === 'bike' && formData.avg_power) specific.avg_power = formData.avg_power;
    if (formData.sport_type === 'swim' && formData.strokes) specific.strokes = formData.strokes;
    payload.append('sport_specific_data', JSON.stringify(specific));

    try {
      await activityAPI.create(payload);
      setFormData({ ...formData, distance: '', notes: '', feeling: '', fit_file: null, is_planned: false, gear: '' });
      if (onWorkoutAdded) onWorkoutAdded();
    } catch (err) { alert("Error al guardar"); } finally { setLoading(false); }
  };

  const isKm = ['bike', 'run'].includes(formData.sport_type);

  return (
    <div className="glass-panel animate-fade-in">
      <h2 className={styles.title}>{formData.is_planned ? 'Planificar' : 'Registrar'} Actividad</h2>
      <form onSubmit={handleSubmit}>
        <div className={styles.planningContainer}>
          <input
            type="checkbox"
            id="is_planned"
            name="is_planned"
            checked={formData.is_planned}
            onChange={handleChange}
            className={styles.planningCheckbox}
          />
          <label htmlFor="is_planned" className={styles.planningLabel}>Planificación futura</label>
        </div>

        <div className={styles.formRow}>
          <div className={`input-group ${styles.inputGroupFlex}`}><label>Deporte</label>
            <select name="sport_type" value={formData.sport_type} onChange={handleChange}>
              <option value="swim">Natación</option><option value="bike">Ciclismo</option><option value="run">Carrera</option><option value="other">Otro</option>
            </select>
          </div>
          <div className={`input-group ${styles.inputGroupFlex}`}><label>Tipo</label>
            <select name="sub_sport" value={formData.sub_sport} onChange={handleChange}>
              {subSportOptions[formData.sport_type].map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
            </select>
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={`input-group ${styles.inputGroupFlex}`}><label>Fecha</label><input type="date" name="date" value={formData.date} onChange={handleChange} required /></div>
          <div className={`input-group ${styles.inputGroupFlex}`}><label>Hora</label><input type="time" name="time" value={formData.time} onChange={handleChange} required /></div>
        </div>

        <div className={styles.formRowNoMargin}>
          <div className={`input-group ${styles.inputGroupFlex}`}><label>Duración</label><input type="text" name="elapsed_time" value={formData.elapsed_time} onChange={handleChange} required /></div>
          <div className={`input-group ${styles.inputGroupFlex}`}><label>Distancia {isKm ? '(km)' : '(m)'}</label><input type="number" step="0.01" name="distance" value={formData.distance} onChange={handleChange} required /></div>
        </div>

        {!formData.is_planned && (
          <div className={styles.metricsSection}>
            <div className={styles.formRow}>
              <div className={`input-group ${styles.inputGroupFlex}`}><label>FC Media</label><input type="number" name="avg_heart_rate" value={formData.avg_heart_rate} onChange={handleChange} /></div>
              <div className={`input-group ${styles.inputGroupFlex}`}><label>FC Máxima</label><input type="number" name="max_heart_rate" value={formData.max_heart_rate} onChange={handleChange} /></div>
            </div>
            <div className={styles.formRow}>
              <div className={`input-group ${styles.inputGroupFlex}`}><label>Desnivel +</label><input type="number" name="total_ascent" value={formData.total_ascent} onChange={handleChange} /></div>
              <div className={`input-group ${styles.inputGroupFlex}`}><label>Calorías</label><input type="number" name="calories" value={formData.calories} onChange={handleChange} /></div>
            </div>
            <div className="input-group">
              {formData.sport_type === 'run' && <><label>Cadencia</label><input type="number" name="cadence" value={formData.cadence} onChange={handleChange} /></>}
              {formData.sport_type === 'bike' && <><label>Potencia (W)</label><input type="number" name="avg_power" value={formData.avg_power} onChange={handleChange} /></>}
              {formData.sport_type === 'swim' && <><label>Brazadas</label><input type="number" name="strokes" value={formData.strokes} onChange={handleChange} /></>}
            </div>
            <div className="input-group"><label>Sensación (1-10)</label><input type="number" min="1" max="10" name="feeling" value={formData.feeling} onChange={handleChange} /></div>
          </div>
        )}

        <div className="input-group">
          <label>Equipamiento utilizado</label>
          <select name="gear" value={formData.gear} onChange={handleChange}>
            <option value="">Ninguno</option>
            {gears.filter(g => g.active).map(g => (
              <option key={g.id} value={g.id}>{g.name} ({g.brand} {g.model_name})</option>
            ))}
          </select>
        </div>

        <div className="input-group"><label>Notas</label><input type="text" name="notes" value={formData.notes} onChange={handleChange} /></div>
        <div className="input-group"><label>Archivo .FIT</label><input type="file" accept=".fit" onChange={(e) => setFormData({ ...formData, fit_file: e.target.files[0] })} className={styles.fitInput} /></div>

        <button type="submit" disabled={loading} className={styles.submitButton}>
          {formData.is_planned ? <CalendarClock size={20} /> : <Save size={20} />}
          {loading ? 'Guardando...' : (formData.is_planned ? 'Agendar' : 'Guardar')}
        </button>

      </form>
    </div>
  );
};
