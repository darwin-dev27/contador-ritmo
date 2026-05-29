import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar.jsx';
import { Diary } from './components/Diary/Diary.jsx';
import { Login } from './pages/Login/Login.jsx';
import { Register } from './pages/Register/Register.jsx';
import { Material } from './pages/Material/Material.jsx';
import { Races } from './pages/Races/Races.jsx';
import { Profile } from './pages/Profile/Profile.jsx';
import { Home } from './pages/Home/Home.jsx';
import { ProtectedRoute } from './components/ProtectedRoute/ProtectedRoute.jsx';
import { AuthProvider } from './context/AuthContext';
import styles from './App.module.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        
        <main className={styles.main}>
          <Routes>
            {/* Rutas Públicas */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Rutas Privadas */}
            <Route path="/diary" element={
              <ProtectedRoute>
                <Diary />
              </ProtectedRoute>
            } />
            
            <Route path="/material" element={
              <ProtectedRoute>
                <Material />
              </ProtectedRoute>
            } />

            <Route path="/races" element={
              <ProtectedRoute>
                <Races />
              </ProtectedRoute>
            } />

            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />

            
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <footer className={styles.footer}>
          <p>TriCalc Pro © {new Date().getFullYear()} - Rendimiento y Precisión. 🚀</p>
        </footer>
      </Router>
    </AuthProvider>
  );
}

export default App;