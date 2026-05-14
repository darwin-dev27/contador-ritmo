import React from 'react';
import { Activity } from 'lucide-react';

const Navbar = () => {
  return (
    <nav style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      marginBottom: '2rem',
      alignItems: 'center'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        color: 'var(--primary)'
      }}>
        <Activity size={40} strokeWidth={2.5} />
        <h1 style={{ fontSize: '2rem', letterSpacing: '-1px' }}>TriCalc Pro</h1>
      </div>
    </nav>
  );
};

export default Navbar;
