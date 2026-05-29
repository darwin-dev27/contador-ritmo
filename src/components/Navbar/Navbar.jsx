import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Activity, Dumbbell, LogOut, Calendar, Trophy, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import styles from './Navbar.module.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [shouldGlow, setShouldGlow] = useState(false);

  useEffect(() => {
    const handleGlow = () => {
      setShouldGlow(true);
      const timer = setTimeout(() => {
        setShouldGlow(false);
      }, 5000);
      return () => clearTimeout(timer);
    };

    window.addEventListener('trigger-navbar-glow', handleGlow);
    return () => window.removeEventListener('trigger-navbar-glow', handleGlow);
  }, []);

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`glass-panel animate-fade-in ${styles.navbar}`}>
      {/* Brand / Logo */}
      <Link to={user ? "/diary" : "/"} className={styles.brand}>
        <Activity size={32} strokeWidth={2.5} />
        <span className={styles.brandText}>
          TriCalc <span className={styles.brandTextHighlight}>Pro</span>
        </span>
      </Link>

      {/* Navigation Links for Authenticated Users */}
      {user && (
        <div className={styles.navLinks}>
          <Link to="/diary" className={`${styles.navLink} ${isActive('/diary') ? styles.active : ''}`}>
            <Calendar size={18} />
            Diario
          </Link>

          <Link to="/material" className={`${styles.navLink} ${isActive('/material') ? styles.active : ''} ${shouldGlow ? styles.glowPulse : ''}`}>
            <Dumbbell size={18} />
            Material
          </Link>

          <Link to="/races" className={`${styles.navLink} ${isActive('/races') ? styles.active : ''} ${shouldGlow ? styles.glowPulse : ''}`}>
            <Trophy size={18} />
            Carreras
          </Link>

          <Link to="/profile" className={`${styles.navLink} ${isActive('/profile') ? styles.active : ''} ${shouldGlow ? styles.glowPulse : ''}`}>
            <User size={18} />
            Perfil
          </Link>
        </div>
      )}


      {/* User Actions / Logout */}
      {user ? (
        <div className={styles.userActions}>
          <Link to="/profile" className={styles.welcomeText} style={{ textDecoration: 'none', color: 'inherit' }}>
            Hola, <strong className={styles.username}>{user.username}</strong>
          </Link>
          <button className={`secondary ${styles.logoutButton}`} onClick={logout}>
            <LogOut size={16} />
            Cerrar sesión
          </button>
        </div>
      ) : (
        <div className={styles.spacingHelper} /> /* Spacing helper */
      )}
    </nav>
  );
};

export default Navbar;
