import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import { Diary } from './components/Diary';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        
        <main style={{
          position: 'relative',
          minHeight: '400px',
          maxWidth: '1200px',
          margin: '0 auto',
          width: '100%',
        }}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Rutas Privadas */}
            <Route path="/" element={
              <ProtectedRoute>
                <Diary />
              </ProtectedRoute>
            } />
            
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <footer style={{
          marginTop: '5rem',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '0.875rem',
          opacity: 0.8
        }}>
          <p>TriCalc Pro © {new Date().getFullYear()} - Rendimiento y Precisión. 🚀</p>
        </footer>
      </Router>
    </AuthProvider>
  );
}

export default App;