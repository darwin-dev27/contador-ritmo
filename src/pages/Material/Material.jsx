import React, { useState, useEffect } from 'react';
import { gearAPI } from '../../services/api';
import { Footprints, Bike, Waves, Trash2, Plus, Calendar, Gauge, Dumbbell } from 'lucide-react';
import styles from './Material.module.css';

export const Material = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [newGear, setNewGear] = useState({ name: '', gear_type: 'shoes', brand: '', model_name: '', max_distance: '', purchased_at: '', notes: '' });

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const data = await gearAPI.create({
        ...newGear,
        max_distance: newGear.max_distance ? parseFloat(newGear.max_distance) * 1000 : null
      });
      setMaterials(prev => [data, ...prev]);
      setShowForm(false);
      setNewGear({ name: '', gear_type: 'shoes', brand: '', model_name: '', max_distance: '', purchased_at: '', notes: '' });
    } catch (err) {
      alert("No se pudo registrar el material.");
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const res = await gearAPI.getAll();
      const data = res.results ? res.results : res;
      setMaterials(data);
      setError(null);
    } catch (err) {
      console.error("Error al obtener material:", err);
      setError("No se pudo cargar el listado de material.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Seguro que deseas eliminar este material deportivo?")) {
      try {
        await gearAPI.delete(id);
        setMaterials(prev => prev.filter(m => m.id !== id));
      } catch (err) {
        console.error("Error al eliminar material:", err);
        alert("No se pudo eliminar el material deportivo.");
      }
    }
  };

  const getMaterialIcon = (type) => {
    switch (type) {
      case 'shoes':
        return <Footprints size={28} color="var(--accent-run)" />;
      case 'bike':
        return <Bike size={28} color="var(--accent-bike)" />;
      case 'wetsuit':
      case 'goggles':
        return <Waves size={28} color="var(--accent-swim)" />;
      default:
        return <Dumbbell size={28} color="var(--primary)" />;
    }
  };

  const getMaterialTypeName = (type) => {
    const types = {
      shoes: 'Zapatillas',
      bike: 'Bicicleta',
      wetsuit: 'Neopreno',
      goggles: 'Gafas de natación',
      helmet: 'Casco',
      other: 'Otro'
    };
    return types[type] || 'Otro';
  };

  const formatDistance = (meters) => {
    if (!meters && meters !== 0) return '0 km';
    return `${(parseFloat(meters) / 1000).toFixed(0)} km`;
  };

  return (
    <div className={`animate-fade-in ${styles.container}`}>

      {/* Encabezado */}
      <div className={styles.headerRow}>
        <div>
          <h2 className={styles.headerTitle}>Mi Material Deportivo</h2>
          <p className={styles.headerSubtitle}>Controla la vida útil y el desgaste de tu equipamiento para evitar lesiones y averías.</p>
        </div>

        <button onClick={() => setShowForm(!showForm)}>
          <Plus size={20} />
          {showForm ? 'Cancelar' : 'Añadir Material'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem', padding: '1.5rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px' }} className="glass-panel">
          <div className="input-group"><label>Tipo</label>
            <select value={newGear.gear_type} onChange={e => setNewGear({...newGear, gear_type: e.target.value})}>
              <option value="shoes">Zapatillas</option><option value="bike">Bicicleta</option><option value="wetsuit">Neopreno</option><option value="goggles">Gafas</option><option value="helmet">Casco</option><option value="other">Otro</option>
            </select>
          </div>
          <div className="input-group"><label>Nombre</label><input placeholder="Ej: Pegasus 40" value={newGear.name} onChange={e => setNewGear({...newGear, name: e.target.value})} required /></div>
          <div className="input-group"><label>Marca</label><input placeholder="Ej: Nike" value={newGear.brand} onChange={e => setNewGear({...newGear, brand: e.target.value})} /></div>
          <div className="input-group"><label>Modelo</label><input placeholder="Ej: Zoom" value={newGear.model_name} onChange={e => setNewGear({...newGear, model_name: e.target.value})} /></div>
          <div className="input-group"><label>Vida útil (km)</label><input type="number" placeholder="Ej: 800" value={newGear.max_distance} onChange={e => setNewGear({...newGear, max_distance: e.target.value})} /></div>
          <div className="input-group"><label>Fecha compra</label><input type="date" value={newGear.purchased_at} onChange={e => setNewGear({...newGear, purchased_at: e.target.value})} /></div>
          <div className="input-group" style={{ gridColumn: '1 / -1' }}><label>Notas</label><input placeholder="Notas adicionales..." value={newGear.notes} onChange={e => setNewGear({...newGear, notes: e.target.value})} /></div>
          <button type="submit" style={{ gridColumn: '1 / -1', marginTop: '0.5rem' }}>Guardar Equipamiento</button>
        </form>
      )}

      {loading ? (
        <div className={styles.loading}>
          <p>Cargando material...</p>
        </div>
      ) : error ? (
        <div className={`glass-panel ${styles.errorBox}`}>
          <p className={styles.errorText}>{error}</p>
        </div>
      ) : materials.length === 0 ? (
        <div className={`glass-panel ${styles.emptyState}`}>
          <Dumbbell size={48} className={styles.emptyIcon} />
          <h3 className={styles.emptyTitle}>No tienes material registrado</h3>
          <p className={styles.emptySubtitle}>
            Añade tus zapatillas de correr, bicicletas o neoprenos para realizar un seguimiento del desgaste acumulado en cada entrenamiento.
          </p>
          <button className={styles.emptyButton} onClick={() => setShowForm(true)}>
            <Plus size={20} />
            Registrar mi primer material
          </button>
        </div>
      ) : (
        <div className={styles.grid}>
          {materials.map(m => {
            const usagePercent = m.usage_percentage !== null ? m.usage_percentage : 0;
            const progressColor = usagePercent > 90 ? '#ef4444' : usagePercent > 70 ? '#f59e0b' : 'var(--primary)';

            return (
              <div key={m.id} className={`glass-panel ${styles.card}`}>
                <div>
                  {/* Encabezado de la Tarjeta */}
                  <div className={styles.cardHeader}>
                    <div className={styles.iconWrapper}>
                      {getMaterialIcon(m.gear_type)}
                    </div>

                    <button className={`secondary ${styles.deleteButton}`} onClick={() => handleDelete(m.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* Info del material */}
                  <span className={styles.gearLabel}>
                    {getMaterialTypeName(m.gear_type)}
                  </span>

                  <h3 className={styles.gearName}>{m.name}</h3>
                  <p className={styles.gearModel}>
                    {m.brand} {m.model_name}
                  </p>

                  {/* Notas si existen */}
                  {m.notes && (
                    <p className={styles.notesBlock}>
                      "{m.notes}"
                    </p>
                  )}
                </div>

                {/* Sección de Progreso y Vida Útil */}
                <div className={styles.footerSection}>
                  <div className={styles.progressInfo}>
                    <div className={styles.usageWrapper}>
                      <Gauge size={14} />
                      <span>Uso: <strong>{formatDistance(m.distance_logged)}</strong></span>
                    </div>
                    {m.max_distance ? (
                      <span>Límite: {formatDistance(m.max_distance)}</span>
                    ) : (
                      <span>Sin límite</span>
                    )}
                  </div>

                  {m.max_distance && (
                    <div>
                      {/* Barra de progreso */}
                      <div className={styles.progressTrack}>
                        <div
                          className={styles.progressBar}
                          style={{
                            width: `${Math.min(usagePercent, 100)}%`,
                            background: progressColor,
                          }}
                        />
                      </div>
                      <div className={styles.progressLabels}>
                        <span className={styles.lifePercent} style={{ color: progressColor }}>
                          {usagePercent}% de vida útil
                        </span>
                        {usagePercent >= 100 && (
                          <span className={styles.warningAdvice}>
                            ¡Reemplazo aconsejado!
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {m.purchased_at && (
                    <div className={styles.purchasedDate}>
                      <Calendar size={12} />
                      <span>Comprado el {new Date(m.purchased_at).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default Material;
