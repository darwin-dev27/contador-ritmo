import React, { useState, useEffect } from 'react';
import { activityAPI, gearAPI } from '../../services/api';
import { Save, CalendarClock, UploadCloud, Sparkles } from 'lucide-react';
import styles from './WorkoutLog.module.css';

export const WorkoutLog = ({ onWorkoutAdded, selectedDate, editWorkout, onClearEdit }) => {
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
    gear: []
  });
  const [loading, setLoading] = useState(false);
  const [gears, setGears] = useState([]);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFormData(prev => ({ ...prev, fit_file: e.dataTransfer.files[0] }));
    }
  };

  const subSportOptions = {
    swim: [{ id: 'pool', name: 'Piscina' }, { id: 'open_water', name: 'Aguas abiertas' }],
    bike: [{ id: 'road', name: 'Carretera' }, { id: 'mtb', name: 'Mountain Bike' }, { id: 'gravel', name: 'Gravel' }, { id: 'indoor_bike', name: 'Rodillo' }],
    run: [{ id: 'road_run', name: 'Carretera' }, { id: 'trail', name: 'Trail' }, { id: 'track', name: 'Pista' }, { id: 'treadmill', name: 'Cinta' }],
    other: [{ id: 'other', name: 'Otro' }, { id: 'triathlon', name: 'Triatlón' }]
  };

  useEffect(() => {
    if (editWorkout) {
      const d = new Date(editWorkout.start_time);
      const dateStr = d.toISOString().split('T')[0];
      const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

      setFormData({
        sport_type: editWorkout.sport_type || 'swim',
        sub_sport: editWorkout.sub_sport || 'pool',
        date: dateStr,
        time: timeStr,
        elapsed_time: editWorkout.elapsed_time || '01:00:00',
        distance: editWorkout.distance ? (['bike', 'run'].includes(editWorkout.sport_type) ? (editWorkout.distance / 1000).toFixed(2) : editWorkout.distance) : '',
        feeling: editWorkout.feeling || '',
        notes: editWorkout.description || '',
        avg_heart_rate: editWorkout.avg_heart_rate || '',
        max_heart_rate: editWorkout.max_heart_rate || '',
        total_ascent: editWorkout.total_ascent || '',
        calories: editWorkout.calories || '',
        cadence: editWorkout.sport_specific_data?.cadence || '',
        avg_power: editWorkout.sport_specific_data?.avg_power || '',
        strokes: editWorkout.sport_specific_data?.strokes || '',
        fit_file: null,
        is_planned: !editWorkout.completed,
        gear: editWorkout.gear ? editWorkout.gear.map(id => id.toString()) : []
      });
    } else {
      setFormData({
        sport_type: 'swim',
        sub_sport: 'pool',
        date: selectedDate || new Date().toISOString().split('T')[0],
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
        gear: []
      });
    }
  }, [editWorkout, selectedDate]);

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
    if (formData.gear && formData.gear.length > 0) {
      formData.gear.forEach(id => payload.append('gear', id));
    }
    if (formData.fit_file) payload.append('raw_fit_file', formData.fit_file);

    const specific = {};
    if (formData.sport_type === 'run' && formData.cadence) specific.cadence = formData.cadence;
    if (formData.sport_type === 'bike' && formData.avg_power) specific.avg_power = formData.avg_power;
    if (formData.sport_type === 'swim' && formData.strokes) specific.strokes = formData.strokes;
    payload.append('sport_specific_data', JSON.stringify(specific));

    try {
      if (editWorkout) {
        await activityAPI.update(editWorkout.id, payload);
        if (onClearEdit) onClearEdit();
      } else {
        await activityAPI.create(payload);
      }
      setFormData({ ...formData, distance: '', notes: '', feeling: '', fit_file: null, is_planned: false, gear: [] });
      if (onWorkoutAdded) onWorkoutAdded();
    } catch (err) { alert("Error al guardar"); } finally { setLoading(false); }
  };

  const isKm = ['bike', 'run'].includes(formData.sport_type);

  return (
    <div className="glass-panel animate-fade-in">
      <h2 className={styles.title}>{editWorkout ? 'Editar' : (formData.is_planned ? 'Planificar' : 'Registrar')} Actividad</h2>
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
          <div className={`input-group ${styles.inputGroupFlex}`}><label>Fecha</label><input type="date" name="date" value={formData.date} onChange={handleChange} required={!formData.fit_file} /></div>
          <div className={`input-group ${styles.inputGroupFlex}`}><label>Hora</label><input type="time" name="time" value={formData.time} onChange={handleChange} required={!formData.fit_file} /></div>
        </div>

        <div className={styles.formRowNoMargin}>
          <div className={`input-group ${styles.inputGroupFlex}`}><label>Duración</label><input type="text" name="elapsed_time" value={formData.elapsed_time} onChange={handleChange} required={!formData.fit_file} /></div>
          <div className={`input-group ${styles.inputGroupFlex}`}><label>Distancia {isKm ? '(km)' : '(m)'}</label><input type="number" step="0.01" name="distance" value={formData.distance} onChange={handleChange} required={!formData.fit_file} /></div>
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
          <label>Equipamiento utilizado (puedes seleccionar varios)</label>
          {gears.filter(g => g.active).length === 0 ? (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic', margin: '0.5rem 0' }}>No tienes material deportivo registrado.</p>
          ) : (
            <div className={styles.gearPills}>
              {gears.filter(g => g.active).map(g => {
                const isSelected = formData.gear.includes(g.id.toString());
                return (
                  <button
                    type="button"
                    key={g.id}
                    className={`${styles.gearPill} ${isSelected ? styles.selectedGear : ''}`}
                    onClick={() => {
                      setFormData(prev => {
                        const currentGear = prev.gear ? [...prev.gear] : [];
                        const idStr = g.id.toString();
                        const nextGear = currentGear.includes(idStr)
                          ? currentGear.filter(id => id !== idStr)
                          : [...currentGear, idStr];
                        return { ...prev, gear: nextGear };
                      });
                    }}
                  >
                    {g.name} ({g.brand})
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="input-group"><label>Notas</label><input type="text" name="notes" value={formData.notes} onChange={handleChange} /></div>
        <div className="input-group">
          <label>Importar Archivo .FIT (Opcional)</label>
          <div 
            className={`${styles.dropzone} ${dragActive ? styles.dragActive : ''} ${formData.fit_file ? styles.hasFile : ''}`}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => document.getElementById('fit-file-input').click()}
          >
            <input 
              type="file" 
              id="fit-file-input"
              accept=".fit" 
              style={{ display: 'none' }}
              onChange={(e) => setFormData({ ...formData, fit_file: e.target.files[0] })} 
            />
            {formData.fit_file ? (
              <div className={styles.dropzoneContent}>
                <Sparkles size={20} color="#10b981" />
                <span className={styles.dropzoneText}>¡Archivo cargado con éxito!</span>
                <span className={styles.fileName}>{formData.fit_file.name}</span>
              </div>
            ) : (
              <div className={styles.dropzoneContent}>
                <UploadCloud size={20} />
                <span className={styles.dropzoneText}>Arrastra tu archivo .FIT aquí o haz clic para subir</span>
              </div>
            )}
          </div>
        </div>

        <div className={editWorkout ? styles.buttonGroup : ''}>
          <button type="submit" disabled={loading} className={styles.submitButton}>
            {formData.is_planned ? <CalendarClock size={20} /> : <Save size={20} />}
            {loading ? 'Guardando...' : (editWorkout ? 'Guardar Cambios' : (formData.is_planned ? 'Agendar' : 'Guardar'))}
          </button>
          {editWorkout && (
            <button type="button" onClick={onClearEdit} className={`secondary ${styles.cancelButton}`}>
              Cancelar
            </button>
          )}
        </div>

      </form>
    </div>
  );
};
