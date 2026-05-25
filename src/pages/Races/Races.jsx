import React, { useState, useEffect } from 'react';
import { raceAPI, activityAPI } from '../../services/api';
import { Trophy, Plus, Calendar, MapPin, Target, Award, Link as LinkIcon, Link2Off, Trash2, Clock } from 'lucide-react';
import styles from './Races.module.css';

export const Races = () => {
  const [races, setRaces] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // Form states for creating a new race
  const [newRace, setNewRace] = useState({
    name: '',
    date: '',
    sport_type: 'triathlon_olympic',
    location: '',
    target_hours: '02',
    target_minutes: '30',
    target_seconds: '00',
    target_position: '',
    notes: ''
  });

  // States for entering results inline per race
  const [resultInput, setResultInput] = useState({}); // { [raceId]: { hours, minutes, seconds, position } }

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [racesRes, activitiesRes] = await Promise.all([
        raceAPI.getAll(),
        activityAPI.getAll()
      ]);

      const racesData = racesRes.results ? racesRes.results : racesRes;
      const activitiesData = activitiesRes.results ? activitiesRes.results : activitiesRes;

      // Sort races by date descending
      setRaces(racesData.sort((a, b) => new Date(b.date) - new Date(a.date)));
      setActivities(activitiesData);
      setError(null);
    } catch (err) {
      console.error("Error loading races data:", err);
      setError("No se pudieron cargar las competiciones ni las actividades.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const target_time = `${newRace.target_hours.padStart(2, '0')}:${newRace.target_minutes.padStart(2, '0')}:${newRace.target_seconds.padStart(2, '0')}`;
      const raceData = {
        name: newRace.name,
        date: newRace.date,
        sport_type: newRace.sport_type,
        season: new Date(newRace.date).getFullYear(),
        location: newRace.location,
        target_time,
        target_position: newRace.target_position ? parseInt(newRace.target_position) : null,
        notes: newRace.notes
      };

      const created = await raceAPI.create(raceData);
      setRaces(prev => [created, ...prev].sort((a, b) => new Date(b.date) - new Date(a.date)));
      setShowForm(false);
      // Reset form
      setNewRace({
        name: '',
        date: '',
        sport_type: 'triathlon_olympic',
        location: '',
        target_hours: '02',
        target_minutes: '30',
        target_seconds: '00',
        target_position: '',
        notes: ''
      });
    } catch (err) {
      console.error("Error creating race:", err);
      alert("No se pudo registrar la competición.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Seguro que deseas eliminar esta competición?")) {
      try {
        await raceAPI.delete(id);
        setRaces(prev => prev.filter(r => r.id !== id));
      } catch (err) {
        console.error("Error deleting race:", err);
        alert("No se pudo eliminar la competición.");
      }
    }
  };

  const handleSaveResults = async (raceId) => {
    const inputs = resultInput[raceId] || {};
    const hours = (inputs.hours || '00').padStart(2, '0');
    const minutes = (inputs.minutes || '00').padStart(2, '0');
    const seconds = (inputs.seconds || '00').padStart(2, '0');
    const result_time = `${hours}:${minutes}:${seconds}`;
    const result_position = inputs.position ? parseInt(inputs.position) : null;

    try {
      const race = races.find(r => r.id === raceId);
      const updatedData = {
        ...race,
        result_time,
        result_position
      };
      
      const updated = await raceAPI.update(raceId, updatedData);
      setRaces(prev => prev.map(r => r.id === raceId ? updated : r));
      // Clear inputs state for this race
      setResultInput(prev => {
        const copy = { ...prev };
        delete copy[raceId];
        return copy;
      });
    } catch (err) {
      console.error("Error saving race results:", err);
      alert("No se pudieron registrar los resultados.");
    }
  };

  const handleLinkActivity = async (raceId, activityId) => {
    try {
      const race = races.find(r => r.id === raceId);
      const updatedData = {
        ...race,
        activity: activityId ? parseInt(activityId) : null
      };

      const updated = await raceAPI.update(raceId, updatedData);
      setRaces(prev => prev.map(r => r.id === raceId ? updated : r));
    } catch (err) {
      console.error("Error linking activity:", err);
      alert("No se pudo vincular la actividad.");
    }
  };

  const getSportDisplayName = (type) => {
    const types = {
      swim: 'Natación',
      bike: 'Ciclismo',
      run: 'Carrera',
      triathlon_sprint: 'Triatlón Sprint',
      triathlon_olympic: 'Triatlón Olímpico',
      triathlon_half: 'Medio Ironman (70.3)',
      triathlon_full: 'Ironman',
      duathlon: 'Duatlón',
      other: 'Otro'
    };
    return types[type] || 'Otro';
  };

  const formatDuration = (durationStr) => {
    if (!durationStr) return '-';
    // Django REST Framework serializes durations as e.g. "02:30:00" or "02:30:00.000000" or as seconds.
    // Let's normalize it to HH:MM:SS
    const parts = durationStr.split(':');
    if (parts.length >= 2) {
      const h = parts[0].padStart(2, '0');
      const m = parts[1].padStart(2, '0');
      const s = parts[2] ? parts[2].split('.')[0].padStart(2, '0') : '00';
      return `${h}:${m}:${s}`;
    }
    return durationStr;
  };

  const getDurationInputs = (durationStr) => {
    if (!durationStr) return { hours: '02', minutes: '30', seconds: '00' };
    const parts = durationStr.split(':');
    if (parts.length >= 2) {
      const h = parts[0].padStart(2, '0');
      const m = parts[1].padStart(2, '0');
      const s = parts[2] ? parts[2].split('.')[0].padStart(2, '0') : '00';
      return { hours: h, minutes: m, seconds: s };
    }
    return { hours: '00', minutes: '00', seconds: '00' };
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const futureRaces = races.filter(r => r.date >= todayStr);
  const pastRaces = races.filter(r => r.date < todayStr);

  return (
    <div className={`animate-fade-in ${styles.container}`}>
      {/* Encabezado */}
      <div className={styles.headerRow}>
        <div>
          <h2 className={styles.headerTitle}>Calendario de Competiciones</h2>
          <p className={styles.headerSubtitle}>Planifica tus retos de la temporada, establece metas de ritmo y registra tus victorias.</p>
        </div>

        <button onClick={() => setShowForm(!showForm)}>
          <Plus size={20} />
          {showForm ? 'Cancelar' : 'Añadir Competición'}
        </button>
      </div>

      {/* Formulario */}
      {showForm && (
        <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2.5rem', padding: '1.5rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px' }} className="glass-panel">
          <div className="input-group">
            <label>Nombre de la carrera</label>
            <input placeholder="Ej: Barcelona Triathlon" value={newRace.name} onChange={e => setNewRace({...newRace, name: e.target.value})} required />
          </div>
          
          <div className="input-group">
            <label>Fecha de competición</label>
            <input type="date" value={newRace.date} onChange={e => setNewRace({...newRace, date: e.target.value})} required />
          </div>

          <div className="input-group">
            <label>Tipo de deporte / Distancia</label>
            <select value={newRace.sport_type} onChange={e => setNewRace({...newRace, sport_type: e.target.value})}>
              <option value="triathlon_sprint">Triatlón Sprint</option>
              <option value="triathlon_olympic">Triatlón Olímpico</option>
              <option value="triathlon_half">Medio Ironman (70.3)</option>
              <option value="triathlon_full">Ironman</option>
              <option value="swim">Natación</option>
              <option value="bike">Ciclismo</option>
              <option value="run">Carrera</option>
              <option value="duathlon">Duatlón</option>
              <option value="other">Otro</option>
            </select>
          </div>

          <div className="input-group">
            <label>Lugar / Localización</label>
            <input placeholder="Ej: Barcelona, España" value={newRace.location} onChange={e => setNewRace({...newRace, location: e.target.value})} />
          </div>

          <div className="input-group" style={{ gridColumn: 'span 2' }}>
            <label>Objetivo de tiempo (HH:MM:SS)</label>
            <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
              <input type="number" min="0" max="99" style={{ width: '60px', textAlign: 'center' }} value={newRace.target_hours} onChange={e => setNewRace({...newRace, target_hours: e.target.value})} />
              <span>:</span>
              <input type="number" min="0" max="59" style={{ width: '60px', textAlign: 'center' }} value={newRace.target_minutes} onChange={e => setNewRace({...newRace, target_minutes: e.target.value})} />
              <span>:</span>
              <input type="number" min="0" max="59" style={{ width: '60px', textAlign: 'center' }} value={newRace.target_seconds} onChange={e => setNewRace({...newRace, target_seconds: e.target.value})} />
            </div>
          </div>

          <div className="input-group">
            <label>Objetivo de posición</label>
            <input type="number" min="1" placeholder="Ej: 10" value={newRace.target_position} onChange={e => setNewRace({...newRace, target_position: e.target.value})} />
          </div>

          <div className="input-group" style={{ gridColumn: '1 / -1' }}>
            <label>Notas / Notas del circuito</label>
            <input placeholder="Añade detalles sobre la altimetría, el neopreno, transiciones, etc." value={newRace.notes} onChange={e => setNewRace({...newRace, notes: e.target.value})} />
          </div>

          <button type="submit" style={{ gridColumn: '1 / -1', marginTop: '0.5rem' }}>Guardar Competición</button>
        </form>
      )}

      {loading ? (
        <div className={styles.loading}>
          <p>Cargando carreras...</p>
        </div>
      ) : error ? (
        <div className={`glass-panel ${styles.errorBox}`}>
          <p className={styles.errorText}>{error}</p>
        </div>
      ) : races.length === 0 ? (
        <div className={`glass-panel ${styles.emptyState}`}>
          <Trophy size={48} className={styles.emptyIcon} />
          <h3 className={styles.emptyTitle}>No tienes competiciones registradas</h3>
          <p className={styles.emptySubtitle}>
            Añade tus objetivos de la temporada para organizar tus picos de forma y motivarte cada día.
          </p>
          <button className={styles.emptyButton} onClick={() => setShowForm(true)}>
            <Plus size={20} />
            Añadir mi primera carrera
          </button>
        </div>
      ) : (
        <>
          {/* PRÓXIMAS CARRERAS */}
          <h3 className={styles.sectionTitle}>Próximas Competiciones</h3>
          {futureRaces.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '2rem' }}>No tienes carreras futuras planificadas en el calendario.</p>
          ) : (
            <div className={styles.grid}>
              {futureRaces.map(r => (
                <div key={r.id} className={`glass-panel ${styles.card}`}>
                  <div>
                    <div className={styles.cardHeader}>
                      <span className={styles.raceSport}>{getSportDisplayName(r.sport_type)}</span>
                      <button className={styles.deleteButton} onClick={() => handleDelete(r.id)}>
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <h4 className={styles.raceName}>{r.name}</h4>
                    
                    <div className={styles.raceMeta}>
                      <div className={styles.metaItem}>
                        <Calendar size={14} />
                        <span>{new Date(r.date).toLocaleDateString()}</span>
                      </div>
                      {r.location && (
                        <div className={styles.metaItem}>
                          <MapPin size={14} />
                          <span>{r.location}</span>
                        </div>
                      )}
                    </div>

                    {r.notes && (
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic', margin: '0.5rem 0' }}>"{r.notes}"</p>
                    )}

                    <div className={styles.goalsSection}>
                      <h5 className={styles.goalsTitle}>Objetivos Planificados</h5>
                      <div className={styles.goalsGrid}>
                        <div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tiempo objetivo:</span>
                          <div className={styles.goalVal} style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                            <Clock size={12} color="var(--primary)" />
                            {formatDuration(r.target_time)}
                          </div>
                        </div>
                        <div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Posición objetivo:</span>
                          <div className={styles.goalVal} style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                            <Target size={12} color="var(--primary)" />
                            {r.target_position ? `#${r.target_position}` : '-'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* CARRERAS PASADAS */}
          <h3 className={styles.sectionTitle}>Carreras Realizadas / Historial</h3>
          {pastRaces.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No tienes carreras pasadas registradas.</p>
          ) : (
            <div className={styles.grid}>
              {pastRaces.map(r => {
                const isEnteringResults = resultInput[r.id] !== undefined;
                const linkedAct = activities.find(a => a.id === r.activity);
                const currentResInputs = resultInput[r.id] || getDurationInputs(r.result_time);

                return (
                  <div key={r.id} className={`glass-panel ${styles.card}`}>
                    <div>
                      <div className={styles.cardHeader}>
                        <span className={styles.raceSport}>{getSportDisplayName(r.sport_type)}</span>
                        <button className={styles.deleteButton} onClick={() => handleDelete(r.id)}>
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <h4 className={styles.raceName}>{r.name}</h4>
                      
                      <div className={styles.raceMeta}>
                        <div className={styles.metaItem}>
                          <Calendar size={14} />
                          <span>{new Date(r.date).toLocaleDateString()}</span>
                        </div>
                        {r.location && (
                          <div className={styles.metaItem}>
                            <MapPin size={14} />
                            <span>{r.location}</span>
                          </div>
                        )}
                      </div>

                      {/* Objetivos */}
                      <div className={styles.goalsSection}>
                        <h5 className={styles.goalsTitle}>Objetivos</h5>
                        <div className={styles.goalsGrid}>
                          <div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tiempo:</span>
                            <div className={styles.goalVal}>{formatDuration(r.target_time)}</div>
                          </div>
                          <div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Posición:</span>
                            <div className={styles.goalVal}>{r.target_position ? `#${r.target_position}` : '-'}</div>
                          </div>
                        </div>
                      </div>

                      {/* Badge de Resultados */}
                      <div className={styles.resultsSection}>
                        <h5 className={styles.resultsTitle}>Resultados Reales</h5>
                        {r.result_time || r.result_position ? (
                          <div className={styles.goalsGrid}>
                            <div>
                              <span style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>Tiempo Real:</span>
                              <div className={styles.goalVal} style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: 'var(--primary)' }}>
                                <Award size={12} />
                                {formatDuration(r.result_time)}
                              </div>
                            </div>
                            <div>
                              <span style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>Puesto Real:</span>
                              <div className={styles.goalVal} style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: 'var(--primary)' }}>
                                <Trophy size={12} />
                                {r.result_position ? `#${r.result_position}` : '-'}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Sin resultados registrados.</p>
                        )}

                        {!isEnteringResults && (
                          <button className={`secondary ${styles.actionButton}`} onClick={() => setResultInput(prev => ({...prev, [r.id]: getDurationInputs(r.result_time)}))}>
                            <Award size={14} />
                            {r.result_time ? 'Editar Resultados' : 'Introducir Resultados'}
                          </button>
                        )}

                        {isEnteringResults && (
                          <div className={styles.resultsForm}>
                            <div className="input-group">
                              <label style={{ fontSize: '0.75rem', marginBottom: '0.2rem' }}>Tiempo Real (HH:MM:SS)</label>
                              <div style={{ display: 'flex', gap: '0.2rem', alignItems: 'center' }}>
                                <input type="number" min="0" max="99" style={{ width: '45px', padding: '0.2rem', fontSize: '0.8rem', textAlign: 'center' }} value={currentResInputs.hours} onChange={e => setResultInput(prev => ({...prev, [r.id]: {...currentResInputs, hours: e.target.value}}))} />
                                <span>:</span>
                                <input type="number" min="0" max="59" style={{ width: '45px', padding: '0.2rem', fontSize: '0.8rem', textAlign: 'center' }} value={currentResInputs.minutes} onChange={e => setResultInput(prev => ({...prev, [r.id]: {...currentResInputs, minutes: e.target.value}}))} />
                                <span>:</span>
                                <input type="number" min="0" max="59" style={{ width: '45px', padding: '0.2rem', fontSize: '0.8rem', textAlign: 'center' }} value={currentResInputs.seconds} onChange={e => setResultInput(prev => ({...prev, [r.id]: {...currentResInputs, seconds: e.target.value}}))} />
                              </div>
                            </div>
                            <div className="input-group">
                              <label style={{ fontSize: '0.75rem', marginBottom: '0.2rem' }}>Posición final</label>
                              <input type="number" min="1" style={{ padding: '0.2rem', fontSize: '0.8rem' }} value={currentResInputs.position || ''} onChange={e => setResultInput(prev => ({...prev, [r.id]: {...currentResInputs, position: e.target.value}}))} />
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button type="button" style={{ flex: 1, padding: '0.3rem' }} onClick={() => handleSaveResults(r.id)}>Guardar</button>
                              <button type="button" className="secondary" style={{ flex: 1, padding: '0.3rem' }} onClick={() => setResultInput(prev => { const copy = {...prev}; delete copy[r.id]; return copy; })}>Cancelar</button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Vínculo con Actividad del Diario */}
                    <div className={styles.linkSection}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        <LinkIcon size={12} /> Vínculo con Actividad
                      </span>

                      {r.sport_type.startsWith('triathlon') ? (
                        <div className={styles.triathlonActivities}>
                          {['swim', 'bike', 'run'].map(sport => {
                            const match = activities.find(a => a.sport_type === sport && a.start_time.split('T')[0] === r.date);
                            const sportNames = { swim: 'Natación', bike: 'Ciclismo', run: 'Carrera' };
                            return match ? (
                              <div key={sport} className={`${styles.triathlonActivityItem} ${styles.linked}`}>
                                <span>✓ {sportNames[sport]}: {match.name || getSportDisplayName(match.sport_type)} ({match.distance ? `${(match.distance / 1000).toFixed(1)} km` : ''})</span>
                              </div>
                            ) : (
                              <div key={sport} className={`${styles.triathlonActivityItem} ${styles.missing}`}>
                                <span>✗ {sportNames[sport]}: Sin registrar en esta fecha</span>
                              </div>
                            );
                          })}
                        </div>
                      ) : linkedAct ? (
                        <div className={styles.linkedBadge}>
                          <span>
                            {linkedAct.name || getSportDisplayName(linkedAct.sport_type)} (
                            {linkedAct.distance ? `${(linkedAct.distance / 1000).toFixed(1)} km` : ''})
                          </span>
                          <button className={styles.unlinkBtn} onClick={() => handleLinkActivity(r.id, null)} title="Desvincular actividad">
                            <Link2Off size={14} />
                          </button>
                        </div>
                      ) : (
                        <div className={styles.linkSelectGroup}>
                          <select className={styles.linkSelect} onChange={e => handleLinkActivity(r.id, e.target.value)} defaultValue="">
                            <option value="">-- Vincular actividad del diario --</option>
                            {activities.map(act => (
                              <option key={act.id} value={act.id}>
                                {new Date(act.start_time).toLocaleDateString()} - {act.name || getSportDisplayName(act.sport_type)} ({act.distance ? `${(act.distance / 1000).toFixed(1)} km` : ''})
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};
