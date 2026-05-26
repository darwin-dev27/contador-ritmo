import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authAPI, activityAPI, raceAPI } from '../../services/api';
import { User, Trophy, Award, Clock, Waves, Bike, Footprints, Settings, ShieldAlert, LogOut } from 'lucide-react';
import styles from './Profile.module.css';

export const Profile = () => {
  const { logout } = useAuth();
  
  // Profile & stats states
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({ totalWorkouts: 0, totalHours: 0, kmRun: 0, kmBike: 0, mSwim: 0 });
  const [nextRace, setNextRace] = useState(null);
  const [workoutsThisWeek, setWorkoutsThisWeek] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form states
  const [showEdit, setShowEdit] = useState(false);
  const [editData, setEditData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    avatar_url: '',
    level: 'intermediate',
    main_goal: '',
    triathlon_modality: 'olympic',
    weekly_workout_goal: 4
  });

  const [passwordData, setPasswordData] = useState({ old_password: '', new_password: '', confirm_password: '' });
  const [passwordStatus, setPasswordStatus] = useState({ success: null, error: null });

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch Profile, Stats and Races
      const [profileRes, statsRes, racesRes, activitiesRes] = await Promise.all([
        authAPI.getProfile(),
        activityAPI.getStats(),
        raceAPI.getAll(),
        activityAPI.getAll()
      ]);

      setProfile(profileRes);
      
      // Initialize edit form data
      setEditData({
        first_name: profileRes.first_name || '',
        last_name: profileRes.last_name || '',
        email: profileRes.email || '',
        avatar_url: profileRes.profile?.avatar_url || '',
        level: profileRes.profile?.level || 'intermediate',
        main_goal: profileRes.profile?.main_goal || '',
        triathlon_modality: profileRes.profile?.triathlon_modality || 'olympic',
        weekly_workout_goal: profileRes.profile?.weekly_workout_goal || 4
      });

      // 2. Parse global stats
      const general = statsRes.general || {};
      const bySport = statsRes.by_sport || [];

      const totalWorkouts = general.total_activities || 0;
      const totalHours = general.total_elapsed_time_seconds ? (general.total_elapsed_time_seconds / 3600).toFixed(1) : 0;
      
      const swimData = bySport.find(s => s.sport_type === 'swim') || {};
      const bikeData = bySport.find(s => s.sport_type === 'bike') || {};
      const runData = bySport.find(s => s.sport_type === 'run') || {};

      setStats({
        totalWorkouts,
        totalHours,
        kmRun: runData.total_distance ? (runData.total_distance / 1000).toFixed(1) : 0,
        kmBike: bikeData.total_distance ? (bikeData.total_distance / 1000).toFixed(1) : 0,
        mSwim: swimData.total_distance ? Math.round(swimData.total_distance) : 0
      });

      // 3. Find next race
      const todayStr = new Date().toISOString().split('T')[0];
      const racesData = racesRes.results ? racesRes.results : racesRes;
      const futureRaces = racesData.filter(r => r.date >= todayStr);
      if (futureRaces.length > 0) {
        // Sort ascending to get the closest one
        const sorted = futureRaces.sort((a, b) => new Date(a.date) - new Date(b.date));
        setNextRace(sorted[0]);
      }

      // 4. Calculate workouts this week (from Monday)
      const getStartOfWeek = () => {
        const today = new Date();
        const day = today.getDay();
        const diff = today.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(today.setDate(diff));
        monday.setHours(0, 0, 0, 0);
        return monday;
      };
      
      const activitiesData = activitiesRes.results ? activitiesRes.results : activitiesRes;
      const thisWeeks = activitiesData.filter(a => new Date(a.start_time) >= getStartOfWeek());
      setWorkoutsThisWeek(thisWeeks.length);

      setError(null);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar todos los datos del perfil.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        first_name: editData.first_name,
        last_name: editData.last_name,
        email: editData.email,
        profile: {
          avatar_url: editData.avatar_url,
          level: editData.level,
          main_goal: editData.main_goal,
          triathlon_modality: editData.triathlon_modality,
          weekly_workout_goal: parseInt(editData.weekly_workout_goal)
        }
      };

      const updated = await authAPI.updateProfile(payload);
      setProfile(updated);
      setShowEdit(false);
      alert("¡Perfil actualizado con éxito!");
    } catch (err) {
      console.error(err);
      alert("No se pudo actualizar el perfil.");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordStatus({ success: null, error: null });

    if (passwordData.new_password !== passwordData.confirm_password) {
      setPasswordStatus({ success: null, error: "Las nuevas contraseñas no coinciden." });
      return;
    }

    try {
      await authAPI.changePassword(passwordData.old_password, passwordData.new_password);
      setPasswordStatus({ success: "¡Contraseña cambiada exitosamente!", error: null });
      setPasswordData({ old_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      setPasswordStatus({ success: null, error: err.message || "Error al cambiar contraseña." });
    }
  };

  const getLevelName = (lvl) => {
    const lvls = { beginner: 'Principiante', intermediate: 'Intermedio', advanced: 'Avanzado', elite: 'Élite' };
    return lvls[lvl] || 'Intermedio';
  };

  const getModalityName = (mod) => {
    const mods = { sprint: 'Sprint', olympic: 'Olímpico', half: 'Half / 70.3', full: 'Full / Ironman', other: 'Otro' };
    return mods[mod] || 'Olímpico';
  };

  if (loading) return <div className={styles.loading}><p>Cargando perfil deportivo...</p></div>;
  if (error) return <div className={`glass-panel ${styles.errorBox}`}><p className={styles.errorText}>{error}</p></div>;

  const weeklyGoal = profile?.profile?.weekly_workout_goal || 4;
  const progressPercent = Math.min((workoutsThisWeek / weeklyGoal) * 100, 100);

  // Create Initials for Avatar
  const getInitials = () => {
    const f = profile?.first_name?.[0] || '';
    const l = profile?.last_name?.[0] || '';
    return (f + l).toUpperCase() || profile?.username?.[0]?.toUpperCase() || 'U';
  };

  return (
    <div className={`animate-fade-in ${styles.container}`}>
      {/* Cabecera del perfil */}
      <div className={styles.profileHeader}>
        <div className={styles.avatarContainer}>
          {profile?.profile?.avatar_url ? (
            <img src={profile.profile.avatar_url} alt="Avatar" className={styles.avatar} />
          ) : (
            <div className={styles.avatarPlaceholder}>{getInitials()}</div>
          )}
        </div>

        <div className={styles.headerInfo}>
          <h2 className={styles.usernameTitle}>
            {profile?.first_name || profile?.last_name 
              ? `${profile.first_name} ${profile.last_name}` 
              : profile?.username}
          </h2>
          <p className={styles.emailSubtitle}>{profile?.email || 'Sin correo electrónico'}</p>
        </div>
      </div>

      {/* Grid del Perfil */}
      <div className={styles.grid}>
        {/* Ficha Deportiva */}
        <div className={`glass-panel ${styles.card}`}>
          <h3 className={styles.cardTitle}>
            <Award size={20} />
            Perfil Deportivo
          </h3>
          <div className={styles.profileDetailList}>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Nivel del atleta:</span>
              <span className={styles.detailValue}>{getLevelName(profile?.profile?.level)}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Modalidad preferida:</span>
              <span className={styles.detailValue}>{getModalityName(profile?.profile?.triathlon_modality)}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Objetivo primordial:</span>
              <span className={styles.detailValue} style={{ textAlign: 'right', maxWidth: '60%' }}>
                {profile?.profile?.main_goal || 'Sin definir'}
              </span>
            </div>
          </div>
        </div>

        {/* Resumen de actividad acumulada */}
        <div className={`glass-panel ${styles.card}`}>
          <h3 className={styles.cardTitle}>
            <Clock size={20} />
            Resumen de Actividad
          </h3>
          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <div className={styles.statVal}>{stats.totalWorkouts}</div>
              <div className={styles.statLabel}>Entrenos</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statVal}>{stats.totalHours}h</div>
              <div className={styles.statLabel}>Horas</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statVal} style={{ color: 'var(--accent-run)' }}>
                <Footprints size={16} /> {stats.kmRun}
              </div>
              <div className={styles.statLabel}>Running</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statVal} style={{ color: 'var(--accent-bike)' }}>
                <Bike size={16} /> {stats.kmBike}
              </div>
              <div className={styles.statLabel}>Cycling</div>
            </div>
            <div className={styles.statItem} style={{ gridColumn: 'span 2' }}>
              <div className={styles.statVal} style={{ color: 'var(--accent-swim)' }}>
                <Waves size={16} /> {stats.mSwim}m
              </div>
              <div className={styles.statLabel}>Natación</div>
            </div>
          </div>
        </div>

        {/* Objetivos de la Temporada */}
        <div className={`glass-panel ${styles.card}`} style={{ gridColumn: 'span 2' }}>
          <h3 className={styles.cardTitle}>
            <Trophy size={20} />
            Objetivos y Retos de la Temporada
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
            <div>
              <h5 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Progreso de Entrenamientos Semanal</h5>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600 }}>
                <span>{workoutsThisWeek} entrenos realizados</span>
                <span>Meta: {weeklyGoal}</span>
              </div>
              <div className={styles.goalProgressTrack}>
                <div className={styles.goalProgressBar} style={{ width: `${progressPercent}%` }} />
              </div>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                {progressPercent >= 100 ? '¡Meta semanal completada! Increíble constancia. 🚀' : '¡Sigue sumando kilómetros!'}
              </p>
            </div>

            <div>
              <h5 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Próximo Gran Desafío</h5>
              {nextRace ? (
                <div className={styles.nextRaceCard}>
                  <h4 className={styles.nextRaceName}>{nextRace.name}</h4>
                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <span>Fecha: <strong>{new Date(nextRace.date).toLocaleDateString()}</strong></span>
                    {nextRace.location && <span>Ubicación: <strong>{nextRace.location}</strong></span>}
                  </div>
                </div>
              ) : (
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  No tienes próximas competiciones agendadas en tu calendario de carreras.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className={`glass-panel ${styles.card} ${styles.actionsCard}`}>
          <h3 className={styles.cardTitle}>
            <Settings size={20} />
            Acciones y Configuración
          </h3>
          
          <div className={styles.actionsRow}>
            <button onClick={() => setShowEdit(!showEdit)}>
              {showEdit ? 'Ocultar Edición' : 'Editar Perfil'}
            </button>
            <button className="secondary" onClick={logout} style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
              <LogOut size={16} /> Cerrar Sesión
            </button>
          </div>

          {showEdit && (
            <div className={styles.formsGrid}>
              {/* Formulario Editar Perfil */}
              <form onSubmit={handleUpdateProfile} className={styles.actionForm}>
                <h5 className={styles.formSubtitle}>Editar Datos del Perfil</h5>
                <div className="input-group">
                  <label>Nombre</label>
                  <input value={editData.first_name} onChange={e => setEditData({...editData, first_name: e.target.value})} />
                </div>
                <div className="input-group">
                  <label>Apellidos</label>
                  <input value={editData.last_name} onChange={e => setEditData({...editData, last_name: e.target.value})} />
                </div>
                <div className="input-group">
                  <label>Email</label>
                  <input type="email" value={editData.email} onChange={e => setEditData({...editData, email: e.target.value})} required />
                </div>
                <div className="input-group">
                  <label>URL de foto de perfil (Avatar)</label>
                  <input placeholder="Ej: https://avatar.com/mi_foto.jpg" value={editData.avatar_url} onChange={e => setEditData({...editData, avatar_url: e.target.value})} />
                </div>
                <div className="input-group">
                  <label>Nivel Deportivo</label>
                  <select value={editData.level} onChange={e => setEditData({...editData, level: e.target.value})}>
                    <option value="beginner">Principiante</option>
                    <option value="intermediate">Intermedio</option>
                    <option value="advanced">Avanzado</option>
                    <option value="elite">Élite</option>
                  </select>
                </div>
                <div className="input-group">
                  <label>Modalidad de Triatlón</label>
                  <select value={editData.triathlon_modality} onChange={e => setEditData({...editData, triathlon_modality: e.target.value})}>
                    <option value="sprint">Sprint</option>
                    <option value="olympic">Olímpico</option>
                    <option value="half">Half / 70.3</option>
                    <option value="full">Full / Ironman</option>
                    <option value="other">Otro</option>
                  </select>
                </div>
                <div className="input-group">
                  <label>Objetivo de la temporada</label>
                  <input placeholder="Ej: Cruzar la meta en Valencia" value={editData.main_goal} onChange={e => setEditData({...editData, main_goal: e.target.value})} />
                </div>
                <div className="input-group">
                  <label>Objetivo Semanal (Sesiones)</label>
                  <input type="number" min="1" max="21" value={editData.weekly_workout_goal} onChange={e => setEditData({...editData, weekly_workout_goal: e.target.value})} />
                </div>
                <button type="submit">Guardar Cambios</button>
              </form>

              {/* Formulario Cambiar Contraseña */}
              <form onSubmit={handleChangePassword} className={styles.actionForm}>
                <h5 className={styles.formSubtitle}>Cambiar Contraseña</h5>
                {passwordStatus.success && (
                  <p style={{ color: '#10b981', fontSize: '0.85rem', margin: '0 0 0.5rem 0', fontWeight: 600 }}>{passwordStatus.success}</p>
                )}
                {passwordStatus.error && (
                  <p style={{ color: '#ef4444', fontSize: '0.85rem', margin: '0 0 0.5rem 0', fontWeight: 600 }}>
                    <ShieldAlert size={14} style={{ verticalAlign: 'middle', marginRight: '0.2rem' }} />
                    {passwordStatus.error}
                  </p>
                )}
                <div className="input-group">
                  <label>Contraseña Actual</label>
                  <input type="password" value={passwordData.old_password} onChange={e => setPasswordData({...passwordData, old_password: e.target.value})} required />
                </div>
                <div className="input-group">
                  <label>Nueva Contraseña</label>
                  <input type="password" value={passwordData.new_password} onChange={e => setPasswordData({...passwordData, new_password: e.target.value})} required />
                </div>
                <div className="input-group">
                  <label>Confirmar Nueva Contraseña</label>
                  <input type="password" value={passwordData.confirm_password} onChange={e => setPasswordData({...passwordData, confirm_password: e.target.value})} required />
                </div>
                <button type="submit" className="secondary">Cambiar Clave</button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default Profile;
