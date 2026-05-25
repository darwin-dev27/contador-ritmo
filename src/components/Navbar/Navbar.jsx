import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Activity, Dumbbell, LogOut, Calendar } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import styles from './Navbar.module.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`glass-panel animate-fade-in ${styles.navbar}`}>
      {/* Brand / Logo */}
      <Link to="/" className={styles.brand}>
        <Activity size={32} strokeWidth={2.5} />
        <span className={styles.brandText}>
          TriCalc <span className={styles.brandTextHighlight}>Pro</span>
        </span>
      </Link>

      {/* Navigation Links for Authenticated Users */}
      {user && (
        <div className={styles.navLinks}>
          <Link to="/" className={`${styles.navLink} ${isActive('/') ? styles.active : ''}`}>
            <Calendar size={18} />
            Diario
          </Link>

          <Link to="/material" className={`${styles.navLink} ${isActive('/material') ? styles.active : ''}`}>
            <Dumbbell size={18} />
            Material
          </Link>
        </div>
      )}

      {/* User Actions / Logout */}
      {user ? (
        <div className={styles.userActions}>
          <span className={styles.welcomeText}>
            Hola, <strong className={styles.username}>{user.username}</strong>
          </span>
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
