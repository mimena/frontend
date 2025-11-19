import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { Home, BookOpen, Users, BarChart3, Settings, Bell, User, LogOut, AlertCircle, CheckCircle, Wifi, WifiOff, ArrowRight, Lock, Calendar, Edit3, Save, X } from 'lucide-react';
import emailjs from '@emailjs/browser';
import SubjectsManager from './components/SubjectsManager';
import StudentsResults from './components/StudentsResults';
import SchoolStatisticsWithHistory from './components/SchoolStatistics';
import StudentsList from './components/StudentsList';
import Dashboard from './components/Dashboard';
import apiService from './services/apiService';
import './App.css';

// Configuration Firebase
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Composant Login
const LoginScreen = ({ darkMode }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const theme = {
    bg: { primary: darkMode ? '#1a1a1a' : '#f8fafc', secondary: darkMode ? '#2d2d2d' : '#ffffff', tertiary: darkMode ? '#3a3a3a' : '#f9fafb', card: darkMode ? '#2d2d2d' : '#ffffff' },
    text: { primary: darkMode ? '#f9fafb' : '#1f2937', secondary: darkMode ? '#d1d5db' : '#6b7280' },
    border: darkMode ? '#404040' : '#e5e7eb',
    shadow: darkMode ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      let errorMessage = 'Erreur de connexion';
      switch (error.code) {
        case 'auth/user-not-found': errorMessage = 'Aucun compte trouvé avec cet email'; break;
        case 'auth/wrong-password': errorMessage = 'Mot de passe incorrect'; break;
        case 'auth/invalid-email': errorMessage = 'Email invalide'; break;
        case 'auth/too-many-requests': errorMessage = 'Trop de tentatives. Réessayez plus tard'; break;
        default: errorMessage = error.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: theme.bg.primary, padding: '1rem' }}>
      <div style={{ width: '100%', maxWidth: '400px', backgroundColor: theme.bg.card, borderRadius: '12px', boxShadow: theme.shadow, border: `1px solid ${theme.border}`, overflow: 'hidden' }}>
        <div style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)', padding: '2rem', textAlign: 'center', color: 'white' }}>
          <div style={{ width: '64px', height: '64px', backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <BookOpen style={{ width: '32px', height: '32px' }} />
          </div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', margin: '0 0 0.5rem 0' }}>EduAdmin Pro</h1>
          <p style={{ fontSize: '0.875rem', opacity: 0.9, margin: 0 }}>Système de Gestion Scolaire</p>
        </div>

        <div style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', padding: '0.75rem', backgroundColor: darkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)', borderRadius: '8px', border: `1px solid ${darkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)'}` }}>
            <Lock style={{ width: '16px', height: '16px', color: '#3b82f6' }} />
            <span style={{ fontSize: '0.875rem', color: theme.text.secondary }}>Connexion sécurisée</span>
          </div>

          {error && (
            <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '0.75rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle style={{ width: '16px', height: '16px', color: '#dc2626' }} />
              <span style={{ fontSize: '0.875rem', color: '#dc2626' }}>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: theme.text.primary, marginBottom: '0.5rem' }}>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@eduadmin.com" required disabled={loading} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: `1px solid ${theme.border}`, backgroundColor: theme.bg.tertiary, color: theme.text.primary, fontSize: '0.875rem', outline: 'none' }} />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: theme.text.primary, marginBottom: '0.5rem' }}>Mot de passe</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required disabled={loading} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: `1px solid ${theme.border}`, backgroundColor: theme.bg.tertiary, color: theme.text.primary, fontSize: '0.875rem', outline: 'none' }} />
            </div>

            <button type="submit" disabled={loading} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: 'none', background: loading ? '#9ca3af' : 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)', color: 'white', fontSize: '0.875rem', fontWeight: '500', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              {loading ? <><div style={{ width: '16px', height: '16px', border: '2px solid rgba(255, 255, 255, 0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />Connexion...</> : <><Lock style={{ width: '16px', height: '16px' }} />Se connecter</>}
            </button>
          </form>

          <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: darkMode ? 'rgba(139, 92, 246, 0.1)' : 'rgba(139, 92, 246, 0.05)', borderRadius: '8px', textAlign: 'center' }}>
            <p style={{ fontSize: '0.75rem', color: theme.text.secondary, margin: 0 }}>Les comptes sont créés par l'administrateur système</p>
          </div>
        </div>
      </div>
      
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

// Composant de configuration des dates scolaires
const SchoolYearConfig = ({ darkMode, onSave, onCancel, currentConfig }) => {
  const [config, setConfig] = useState(currentConfig || {
    startMonth: 8, // Septembre (0-11)
    startDay: 1,
    endMonth: 6,   // Juillet (0-11)
    endDay: 31
  });

  const theme = {
    bg: { primary: darkMode ? '#1a1a1a' : '#f8fafc', card: darkMode ? '#2d2d2d' : '#ffffff' },
    text: { primary: darkMode ? '#f9fafb' : '#1f2937', secondary: darkMode ? '#d1d5db' : '#6b7280' },
    border: darkMode ? '#404040' : '#e5e7eb',
    shadow: darkMode ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
  };

  const months = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const getDaysInMonth = (month) => {
    return new Date(2024, month + 1, 0).getDate();
  };

  const handleSave = () => {
    onSave(config);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: theme.bg.card,
        borderRadius: '12px',
        boxShadow: theme.shadow,
        border: `1px solid ${theme.border}`,
        width: '100%',
        maxWidth: '500px',
        maxHeight: '80vh',
        overflow: 'auto'
      }}>
        <div style={{
          padding: '1.5rem',
          borderBottom: `1px solid ${theme.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: theme.text.primary, margin: 0 }}>
            ⚙️ Configuration de l'année scolaire
          </h3>
          <button
            onClick={onCancel}
            style={{
              background: 'none',
              border: 'none',
              color: theme.text.secondary,
              cursor: 'pointer',
              padding: '0.5rem',
              borderRadius: '0.375rem'
            }}
          >
            <X style={{ width: '20px', height: '20px' }} />
          </button>
        </div>

        <div style={{ padding: '1.5rem' }}>
          <div style={{
            marginBottom: '2rem',
            padding: '1rem',
            backgroundColor: darkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
            borderRadius: '8px',
            border: `1px solid ${darkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)'}`
          }}>
            <p style={{ fontSize: '0.875rem', color: theme.text.secondary, margin: 0, textAlign: 'center' }}>
              📅 Définissez les dates de début et de fin de l'année scolaire
            </p>
          </div>

          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {/* Début de l'année scolaire */}
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: '600', color: theme.text.primary, marginBottom: '1rem' }}>
                🎒 Début de l'année scolaire
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: theme.text.primary, marginBottom: '0.5rem' }}>
                    Mois
                  </label>
                  <select
                    value={config.startMonth}
                    onChange={(e) => setConfig({ ...config, startMonth: parseInt(e.target.value) })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      border: `1px solid ${theme.border}`,
                      backgroundColor: theme.bg.tertiary,
                      color: theme.text.primary,
                      fontSize: '0.875rem',
                      outline: 'none'
                    }}
                  >
                    {months.map((month, index) => (
                      <option key={index} value={index}>
                        {month}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: theme.text.primary, marginBottom: '0.5rem' }}>
                    Jour
                  </label>
                  <select
                    value={config.startDay}
                    onChange={(e) => setConfig({ ...config, startDay: parseInt(e.target.value) })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      border: `1px solid ${theme.border}`,
                      backgroundColor: theme.bg.tertiary,
                      color: theme.text.primary,
                      fontSize: '0.875rem',
                      outline: 'none'
                    }}
                  >
                    {Array.from({ length: getDaysInMonth(config.startMonth) }, (_, i) => i + 1).map(day => (
                      <option key={day} value={day}>
                        {day}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Fin de l'année scolaire */}
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: '600', color: theme.text.primary, marginBottom: '1rem' }}>
                🎓 Fin de l'année scolaire
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: theme.text.primary, marginBottom: '0.5rem' }}>
                    Mois
                  </label>
                  <select
                    value={config.endMonth}
                    onChange={(e) => setConfig({ ...config, endMonth: parseInt(e.target.value) })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      border: `1px solid ${theme.border}`,
                      backgroundColor: theme.bg.tertiary,
                      color: theme.text.primary,
                      fontSize: '0.875rem',
                      outline: 'none'
                    }}
                  >
                    {months.map((month, index) => (
                      <option key={index} value={index}>
                        {month}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: theme.text.primary, marginBottom: '0.5rem' }}>
                    Jour
                  </label>
                  <select
                    value={config.endDay}
                    onChange={(e) => setConfig({ ...config, endDay: parseInt(e.target.value) })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      border: `1px solid ${theme.border}`,
                      backgroundColor: theme.bg.tertiary,
                      color: theme.text.primary,
                      fontSize: '0.875rem',
                      outline: 'none'
                    }}
                  >
                    {Array.from({ length: getDaysInMonth(config.endMonth) }, (_, i) => i + 1).map(day => (
                      <option key={day} value={day}>
                        {day}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Aperçu */}
            <div style={{
              padding: '1rem',
              backgroundColor: darkMode ? 'rgba(139, 92, 246, 0.1)' : 'rgba(139, 92, 246, 0.05)',
              borderRadius: '8px',
              border: `1px solid ${darkMode ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.1)'}`
            }}>
              <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: theme.text.primary, marginBottom: '0.5rem' }}>
                👁️ Aperçu de la configuration
              </h4>
              <p style={{ fontSize: '0.75rem', color: theme.text.secondary, margin: 0 }}>
                L'année scolaire commence le <strong>{config.startDay} {months[config.startMonth]}</strong><br/>
                et se termine le <strong>{config.endDay} {months[config.endMonth]}</strong>
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <button
              onClick={onCancel}
              style={{
                flex: 1,
                padding: '0.75rem',
                borderRadius: '8px',
                border: `1px solid ${theme.border}`,
                backgroundColor: 'transparent',
                color: theme.text.secondary,
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              style={{
                flex: 1,
                padding: '0.75rem',
                borderRadius: '8px',
                border: 'none',
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                color: 'white',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              <Save style={{ width: '16px', height: '16px' }} />
              Enregistrer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Composant de sélection d'année scolaire
const YearSelectionScreen = ({ darkMode, onYearSelected, availableYears, schoolYearConfig }) => {
  const [selectedYear, setSelectedYear] = useState('');
  const [loading, setLoading] = useState(false);

  const theme = {
    bg: { primary: darkMode ? '#1a1a1a' : '#f8fafc', card: darkMode ? '#2d2d2d' : '#ffffff' },
    text: { primary: darkMode ? '#f9fafb' : '#1f2937', secondary: darkMode ? '#d1d5db' : '#6b7280' },
    border: darkMode ? '#404040' : '#e5e7eb',
    shadow: darkMode ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
  };

  // Obtenir l'année scolaire actuelle avec configuration personnalisée
  const getCurrentSchoolYear = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0-11
    const day = now.getDate();
    
    const startMonth = schoolYearConfig?.startMonth ?? 8; // Septembre par défaut
    const startDay = schoolYearConfig?.startDay ?? 1;
    const endMonth = schoolYearConfig?.endMonth ?? 6; // Juillet par défaut
    const endDay = schoolYearConfig?.endDay ?? 31;

    // Vérifier si nous sommes après la date de début de l'année scolaire
    if (month > startMonth || (month === startMonth && day >= startDay)) {
      // Après la date de début → année scolaire actuelle
      return `${year}-${year + 1}`;
    } else {
      // Avant la date de début → année scolaire précédente
      return `${year - 1}-${year}`;
    }
  };

  const currentYear = getCurrentSchoolYear();

  const handleContinue = () => {
    if (selectedYear) {
      setLoading(true);
      onYearSelected(selectedYear);
    }
  };

  // Vérifier si l'année est antérieure à l'année actuelle
  const isPastYear = (year) => {
    if (!year) return false;
    const [start] = year.split('-').map(Number);
    const [currentStart] = currentYear.split('-').map(Number);
    return start < currentStart;
  };

  // Vérifier si l'année est future
  const isFutureYear = (year) => {
    if (!year) return false;
    const [start] = year.split('-').map(Number);
    const [currentStart] = currentYear.split('-').map(Number);
    return start > currentStart;
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.bg.primary,
      padding: '1rem'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '600px',
        backgroundColor: theme.bg.card,
        borderRadius: '12px',
        boxShadow: theme.shadow,
        border: `1px solid ${theme.border}`,
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
          padding: '2.5rem',
          textAlign: 'center',
          color: 'white'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem'
          }}>
            <Calendar style={{ width: '40px', height: '40px' }} />
          </div>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            margin: '0 0 0.5rem 0'
          }}>Année Scolaire</h1>
          <p style={{
            fontSize: '1rem',
            opacity: 0.9,
            margin: 0
          }}>Sélectionnez l'année scolaire pour continuer</p>
        </div>

        {/* Contenu */}
        <div style={{ padding: '2.5rem' }}>
          <div style={{
            marginBottom: '2rem',
            padding: '1rem',
            backgroundColor: darkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
            borderRadius: '8px',
            border: `1px solid ${darkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)'}`
          }}>
            <p style={{
              fontSize: '0.875rem',
              color: theme.text.secondary,
              margin: 0,
              textAlign: 'center'
            }}>
              📚 <strong>Mode consultation seule</strong> pour les années antérieures<br/>
              📝 <strong>Mode édition complète</strong> pour l'année en cours {currentYear}<br/>
              🔮 <strong>Mode préparation (données vides)</strong> pour les années futures
            </p>
          </div>

          {availableYears.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '2rem',
              backgroundColor: darkMode ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.05)',
              borderRadius: '8px',
              border: `1px solid ${darkMode ? 'rgba(245, 158, 11, 0.2)' : 'rgba(245, 158, 11, 0.1)'}`,
              marginBottom: '2rem'
            }}>
              <Calendar style={{ width: '48px', height: '48px', color: '#f59e0b', margin: '0 auto 1rem' }} />
              <p style={{
                fontSize: '1rem',
                color: theme.text.primary,
                margin: '0 0 0.5rem 0',
                fontWeight: '500'
              }}>Aucune année scolaire disponible</p>
              <p style={{
                fontSize: '0.875rem',
                color: theme.text.secondary,
                margin: 0
              }}>L'année {currentYear} sera créée automatiquement</p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gap: '1rem',
              marginBottom: '2rem'
            }}>
              {availableYears.map((year) => {
                const isPast = isPastYear(year);
                const isCurrent = year === currentYear;
                const isFuture = isFutureYear(year);
                
                return (
                  <button
                    key={year}
                    onClick={() => setSelectedYear(year)}
                    style={{
                      padding: '1.5rem',
                      borderRadius: '8px',
                      border: `2px solid ${selectedYear === year ? '#3b82f6' : theme.border}`,
                      backgroundColor: selectedYear === year 
                        ? (darkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)')
                        : theme.bg.card,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      textAlign: 'left',
                      position: 'relative',
                      opacity: isPast ? 0.8 : 1
                    }}
                    onMouseEnter={(e) => {
                      if (selectedYear !== year) {
                        e.currentTarget.style.borderColor = '#3b82f6';
                        e.currentTarget.style.backgroundColor = darkMode ? 'rgba(59, 130, 246, 0.05)' : 'rgba(59, 130, 246, 0.02)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedYear !== year) {
                        e.currentTarget.style.borderColor = theme.border;
                        e.currentTarget.style.backgroundColor = theme.bg.card;
                      }
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        backgroundColor: selectedYear === year ? '#3b82f6' : 
                                        (isPast ? '#6b7280' : 
                                         (isFuture ? '#f59e0b' : 
                                          (darkMode ? '#404040' : '#f3f4f6'))),
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Calendar style={{
                          width: '24px',
                          height: '24px',
                          color: selectedYear === year ? 'white' : 
                                 (isPast ? '#d1d5db' : 
                                  (isFuture ? '#ffffff' : theme.text.secondary))
                        }} />
                      </div>
                      <div>
                        <div style={{
                          fontSize: '1.25rem',
                          fontWeight: 'bold',
                          color: theme.text.primary,
                          marginBottom: '0.25rem'
                        }}>{year}</div>
                        <div style={{
                          fontSize: '0.875rem',
                          color: theme.text.secondary
                        }}>
                          {isCurrent ? 'Année en cours • Mode édition' : 
                           isPast ? 'Année précédente • Consultation seule' : 
                           isFuture ? 'Année future • Données vides' :
                           'Année scolaire'}
                        </div>
                      </div>
                    </div>
                    
                    {selectedYear === year && (
                      <CheckCircle style={{
                        width: '24px',
                        height: '24px',
                        color: '#3b82f6'
                      }} />
                    )}
                    
                    {isPast && (
                      <div style={{
                        position: 'absolute',
                        top: '0.5rem',
                        right: '0.5rem',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '0.375rem',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        backgroundColor: '#6b7280',
                        color: 'white'
                      }}>
                        Consultation
                      </div>
                    )}
                    
                    {isCurrent && (
                      <div style={{
                        position: 'absolute',
                        top: '0.5rem',
                        right: '0.5rem',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '0.375rem',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        backgroundColor: '#10b981',
                        color: 'white'
                      }}>
                        Édition
                      </div>
                    )}

                    {isFuture && (
                      <div style={{
                        position: 'absolute',
                        top: '0.5rem',
                        right: '0.5rem',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '0.375rem',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        backgroundColor: '#f59e0b',
                        color: 'white'
                      }}>
                        Données vides
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          <button
            onClick={handleContinue}
            disabled={!selectedYear || loading}
            style={{
              width: '100%',
              padding: '1rem',
              borderRadius: '8px',
              border: 'none',
              background: (!selectedYear || loading) ? '#9ca3af' : 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              color: 'white',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: (!selectedYear || loading) ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s'
            }}
          >
            {loading ? (
              <>
                <div style={{
                  width: '20px',
                  height: '20px',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                Chargement...
              </>
            ) : (
              <>
                Continuer
                <ArrowRight style={{ width: '20px', height: '20px' }} />
              </>
            )}
          </button>

          {selectedYear && (
            <div style={{
              marginTop: '1.5rem',
              padding: '1rem',
              backgroundColor: isPastYear(selectedYear) 
                ? (darkMode ? 'rgba(107, 114, 128, 0.1)' : 'rgba(107, 114, 128, 0.05)')
                : (isFutureYear(selectedYear)
                  ? (darkMode ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.05)')
                  : (darkMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)')),
              borderRadius: '8px',
              border: `1px solid ${isPastYear(selectedYear) 
                ? (darkMode ? 'rgba(107, 114, 128, 0.2)' : 'rgba(107, 114, 128, 0.1)')
                : (isFutureYear(selectedYear)
                  ? (darkMode ? 'rgba(245, 158, 11, 0.2)' : 'rgba(245, 158, 11, 0.1)')
                  : (darkMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)'))}`,
              textAlign: 'center'
            }}>
              <p style={{
                fontSize: '0.875rem',
                color: theme.text.secondary,
                margin: 0
              }}>
                {isPastYear(selectedYear) ? (
                  <>📖 Vous serez en <strong style={{ color: '#6b7280' }}>mode consultation</strong> pour l'année <strong>{selectedYear}</strong></>
                ) : isFutureYear(selectedYear) ? (
                  <>🔮 Vous serez en <strong style={{ color: '#f59e0b' }}>mode préparation</strong> - <strong>Aucune donnée</strong> pour l'année <strong>{selectedYear}</strong></>
                ) : (
                  <>📝 Vous serez en <strong style={{ color: '#10b981' }}>mode édition</strong> pour l'année <strong>{selectedYear}</strong></>
                )}
              </p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

// Composant App principal
const App = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [apiStatus, setApiStatus] = useState('unknown');
  const [connectionMonitor, setConnectionMonitor] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [showYearConfig, setShowYearConfig] = useState(false);
  const [schoolYearConfig, setSchoolYearConfig] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Charger la configuration depuis le localStorage
  useEffect(() => {
    const savedConfig = localStorage.getItem('schoolYearConfig');
    if (savedConfig) {
      setSchoolYearConfig(JSON.parse(savedConfig));
    }
  }, []);

  // Gérer le clic en dehors du menu profil
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showProfileMenu && !event.target.closest('.profile-menu-container')) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showProfileMenu]);

  // Obtenir l'année scolaire actuelle avec configuration personnalisée
  const getCurrentSchoolYear = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0-11
    const day = now.getDate();
    
    const startMonth = schoolYearConfig?.startMonth ?? 8; // Septembre par défaut
    const startDay = schoolYearConfig?.startDay ?? 1;
    const endMonth = schoolYearConfig?.endMonth ?? 6; // Juillet par défaut
    const endDay = schoolYearConfig?.endDay ?? 31;

    // Vérifier si nous sommes après la date de début de l'année scolaire
    if (month > startMonth || (month === startMonth && day >= startDay)) {
      // Après la date de début → année scolaire actuelle
      return `${year}-${year + 1}`;
    } else {
      // Avant la date de début → année scolaire précédente
      return `${year - 1}-${year}`;
    }
  };

  // Générer automatiquement les années disponibles
  const generateAvailableYears = () => {
    const currentYear = getCurrentSchoolYear();
    const [startCurrent] = currentYear.split('-').map(Number);
    
    const years = [];
    
    // Ajouter les 3 années précédentes
    for (let i = 3; i >= 1; i--) {
      years.push(`${startCurrent - i}-${startCurrent - i + 1}`);
    }
    
    // Ajouter l'année en cours
    years.push(currentYear);
    
    // Ajouter les 2 années futures
    for (let i = 1; i <= 2; i++) {
      years.push(`${startCurrent + i}-${startCurrent + i + 1}`);
    }
    
    return years;
  };

  const availableYears = generateAvailableYears();

  // Vérifier si l'année sélectionnée est antérieure
  const isPastYear = (year) => {
    if (!year) return false;
    const [start] = year.split('-').map(Number);
    const [currentStart] = getCurrentSchoolYear().split('-').map(Number);
    return start < currentStart;
  };

  // Vérifier si l'année est future
  const isFutureYear = (year) => {
    if (!year) return false;
    const [start] = year.split('-').map(Number);
    const [currentStart] = getCurrentSchoolYear().split('-').map(Number);
    return start > currentStart;
  };

  // Vérifier si l'année est en cours
  const isCurrentYear = (year) => {
    if (!year) return false;
    return year === getCurrentSchoolYear();
  };

  // Vérifier si l'édition est autorisée
  const canEdit = () => {
    if (!selectedYear) return false;
    return !isPastYear(selectedYear) && apiStatus === 'connected' && isCurrentYear(selectedYear);
  };

  // Vérifier si on peut afficher des données
  const hasData = () => {
    if (!selectedYear) return false;
    return !isFutureYear(selectedYear);
  };

  // Gérer la sauvegarde de la configuration
  const handleSaveSchoolYearConfig = (config) => {
    setSchoolYearConfig(config);
    localStorage.setItem('schoolYearConfig', JSON.stringify(config));
    setShowYearConfig(false);
    setSuccess('Configuration de l\'année scolaire sauvegardée !');
  };

  const toggleProfileMenu = () => {
    setShowProfileMenu(!showProfileMenu);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    
    // Charger l'année sauvegardée ou sélectionner l'année en cours par défaut
    const savedYear = localStorage.getItem('anneeScolaire');
    if (savedYear) {
      setSelectedYear(savedYear);
    } else {
      // Par défaut, sélectionner l'année en cours
      const currentYear = getCurrentSchoolYear();
      setSelectedYear(currentYear);
      localStorage.setItem('anneeScolaire', currentYear);
    }
    
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme !== null) setDarkMode(savedTheme === 'true');
    initializeApp();

// Vérification de connexion simplifiée
const checkConnection = async () => {
  try {
    await apiService.checkHealth();
    setApiStatus('connected');
  } catch (error) {
    setApiStatus('disconnected');
  }
};

// Vérifier une fois au démarrage
checkConnection();

// Vérifier périodiquement
const monitorId = setInterval(checkConnection, 30000);
setConnectionMonitor(monitorId);
return () => { if (monitorId) clearInterval(monitorId); };
  }, [currentUser]);

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => { setError(null); setSuccess(null); }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  useEffect(() => { localStorage.setItem('darkMode', darkMode.toString()); }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(prev => !prev);

  const handleYearSelected = (year) => {
    setSelectedYear(year);
    localStorage.setItem('anneeScolaire', year);
    // Charger les données spécifiques à cette année
    loadDataForYear(year);
  };

  const initializeApp = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await checkApiHealth();
      if (selectedYear) {
        await loadDataForYear(selectedYear);
      }
      setSuccess('Application initialisée avec succès');
    } catch (error) {
      setError('Impossible de se connecter à l\'API. Mode hors ligne.');
      setApiStatus('disconnected');
    } finally {
      setLoading(false);
    }
  };

  const checkApiHealth = async () => {
    try {
      const response = await apiService.checkHealth();
      if (response && response.status === 'healthy') {
        setApiStatus('connected');
      } else {
        throw new Error('API not healthy');
      }
    } catch (error) {
      setApiStatus('disconnected');
      throw error;
    }
  };

  const loadDataForYear = async (year) => {
    try {
      // Pour les années futures, on ne charge aucune donnée
      if (isFutureYear(year)) {
        setStudents([]);
        setSubjects([]);
        setTeachers([]);
        setSuccess(`Mode préparation pour ${year} - Aucune donnée`);
        return;
      }
      
      // Pour les années passées et l'année en cours, on charge les données
      await loadAllData();
      setSuccess(`Données chargées pour l'année ${year}`);
    } catch (error) {
      setError(`Erreur lors du chargement des données pour ${year}`);
    }
  };

  const loadAllData = async () => {
    // Si c'est une année future, on ne charge rien
    if (isFutureYear(selectedYear)) {
      setStudents([]);
      setSubjects([]);
      setTeachers([]);
      return;
    }

    const results = await Promise.allSettled([
      loadStudentsFromAPI(), 
      loadSubjectsFromAPI(), 
      loadTeachersFromAPI()
    ]);
    const successCount = results.filter(result => result.status === 'fulfilled').length;
    if (successCount === 0) throw new Error('Aucune donnée n\'a pu être chargée');
  };

  const loadStudentsFromAPI = async () => {
    try {
      // Si année future, retourner tableau vide
      if (isFutureYear(selectedYear)) {
        setStudents([]);
        return [];
      }

      const response = await apiService.getAllStudents();
      if (response && response.success && Array.isArray(response.students)) {
        setStudents(response.students);
        return response.students;
      } else {
        setStudents([]);
        return [];
      }
    } catch (error) {
      setStudents([]);
      throw error;
    }
  };

  const loadSubjectsFromAPI = async () => {
    try {
      // Si année future, retourner tableau vide
      if (isFutureYear(selectedYear)) {
        setSubjects([]);
        return [];
      }

      const response = await apiService.getAllSubjects();
      if (response && response.success && Array.isArray(response.subjects)) {
        setSubjects(response.subjects);
        return response.subjects;
      } else {
        setSubjects([]);
        return [];
      }
    } catch (error) {
      setSubjects([]);
      throw error;
    }
  };

  const loadTeachersFromAPI = async () => {
    try {
      // Si année future, retourner tableau vide
      if (isFutureYear(selectedYear)) {
        setTeachers([]);
        return [];
      }

      const response = await apiService.getAllTeachers();
      if (response && response.success && Array.isArray(response.teachers)) {
        setTeachers(response.teachers);
        return response.teachers;
      } else {
        setTeachers([]);
        return [];
      }
    } catch (error) {
      setTeachers([]);
      throw error;
    }
  };

  const handleAddSubject = async (newSubject) => {
    if (!canEdit()) {
      setError('Modification non autorisée pour les années antérieures ou futures');
      return false;
    }
    
    if (newSubject.coefficient && isNaN(Number(newSubject.coefficient))) {
      setError('Le coefficient doit être un nombre (ex: 1, 2, 3, etc.)');
      return false;
    }
    const validation = apiService.validateSubjectData(newSubject);
    if (!validation.valid) { setError(validation.errors.join(', ')); return false; }
    if (apiStatus !== 'connected') { setError('API non disponible. Impossible d\'ajouter la matière.'); return false; }
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.addSubject(newSubject);
      if (response && response.success) {
        await loadSubjectsFromAPI();
        setSuccess('Matière ajoutée avec succès');
        return true;
      } else {
        setError(response?.message || 'Erreur inconnue lors de l\'ajout');
        return false;
      }
    } catch (error) {
      setError('Erreur lors de l\'ajout de la matière: ' + error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubject = async (subjectId, subjectData) => {
    if (!canEdit()) {
      setError('Modification non autorisée pour les années antérieures ou futures');
      return false;
    }
    
    if (subjectData.coefficient && isNaN(Number(subjectData.coefficient))) {
      setError('Le coefficient doit être un nombre (ex: 1, 2, 3, etc.)');
      return false;
    }
    const validation = apiService.validateSubjectData(subjectData);
    if (!validation.valid) { setError(validation.errors.join(', ')); return false; }
    if (apiStatus !== 'connected') { setError('API non disponible. Impossible de modifier la matière.'); return false; }
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.updateSubject(subjectId, subjectData);
      if (response && response.success) {
        await loadSubjectsFromAPI();
        setSuccess('Matière modifiée avec succès');
        return true;
      } else {
        setError(response?.message || 'Erreur inconnue lors de la modification');
        return false;
      }
    } catch (error) {
      setError('Erreur lors de la modification: ' + error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubject = async (subjectId) => {
    if (!canEdit()) {
      setError('Modification non autorisée pour les années antérieures ou futures');
      return false;
    }
    
    if (apiStatus !== 'connected') { setError('API non disponible. Impossible de supprimer la matière.'); return false; }
    const subjectToDelete = subjects.find(s => s.id === subjectId);
    const subjectName = subjectToDelete ? subjectToDelete.name : 'cette matière';
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer "${subjectName}" ?\n\nCette action est irréversible.`)) return false;
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.deleteSubject(subjectId);
      if (response && response.success) {
        await loadSubjectsFromAPI();
        setSuccess('Matière supprimée avec succès');
        return true;
      } else {
        setError(response?.message || 'Erreur inconnue lors de la suppression');
        return false;
      }
    } catch (error) {
      setError('Erreur lors de la suppression: ' + error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async (newStudent) => {
    if (!canEdit()) {
      setError('Modification non autorisée pour les années antérieures ou futures');
      return false;
    }
    
    const validation = apiService.validateStudentData(newStudent);
    if (!validation.valid) { setError(validation.errors.join(', ')); return false; }
    if (apiStatus !== 'connected') { setError('API non disponible. Impossible d\'ajouter l\'étudiant.'); return false; }
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.addStudent(newStudent);
      if (response && response.success) {
        await loadStudentsFromAPI();
        setSuccess('Étudiant ajouté avec succès');
        return true;
      } else {
        setError(response?.message || 'Erreur inconnue lors de l\'ajout');
        return false;
      }
    } catch (error) {
      setError('Erreur lors de l\'ajout de l\'étudiant: ' + error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleEditStudent = async (studentId, studentData) => {
    if (!canEdit()) {
      setError('Modification non autorisée pour les années antérieures ou futures');
      return false;
    }
    
    const validation = apiService.validateStudentData(studentData);
    if (!validation.valid) { setError(validation.errors.join(', ')); return false; }
    if (apiStatus !== 'connected') { setError('API non disponible. Impossible de modifier l\'étudiant.'); return false; }
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.updateStudent(studentId, studentData);
      if (response && response.success) {
        await loadStudentsFromAPI();
        setSuccess('Étudiant modifié avec succès');
        return true;
      } else {
        setError(response?.message || 'Erreur inconnue lors de la modification');
        return false;
      }
    } catch (error) {
      setError('Erreur lors de la modification: ' + error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (!canEdit()) {
      setError('Modification non autorisée pour les années antérieures ou futures');
      return false;
    }
    
    if (apiStatus !== 'connected') { setError('API non disponible. Impossible de supprimer l\'étudiant.'); return false; }
    const studentToDelete = students.find(s => s.id === studentId);
    const studentName = studentToDelete ? `${studentToDelete.nom} ${studentToDelete.prenom}` : 'cet étudiant';
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer "${studentName}" ?\n\nCette action est irréversible.`)) return false;
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.deleteStudent(studentId);
      if (response && response.success) {
        await loadStudentsFromAPI();
        setSuccess('Étudiant supprimé avec succès');
        return true;
      } else {
        setError(response?.message || 'Erreur inconnue lors de la suppression');
        return false;
      }
    } catch (error) {
      setError('Erreur lors de la suppression: ' + error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleAddTeacher = async (newTeacher) => {
    if (!canEdit()) {
      setError('Modification non autorisée pour les années antérieures ou futures');
      return false;
    }
    
    const validation = apiService.validateTeacherData(newTeacher);
    if (!validation.valid) { setError(validation.errors.join(', ')); return false; }
    if (apiStatus !== 'connected') { setError('API non disponible. Impossible d\'ajouter l\'enseignant.'); return false; }
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.addTeacher(newTeacher);
      if (response && response.success) {
        await loadTeachersFromAPI();
        setSuccess('Enseignant ajouté avec succès');
        return true;
      } else {
        setError(response?.message || 'Erreur inconnue lors de l\'ajout');
        return false;
      }
    } catch (error) {
      setError('Erreur lors de l\'ajout de l\'enseignant: ' + error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleEditTeacher = async (teacherId, teacherData) => {
    if (!canEdit()) {
      setError('Modification non autorisée pour les années antérieures ou futures');
      return false;
    }
    
    const validation = apiService.validateTeacherData(teacherData);
    if (!validation.valid) { setError(validation.errors.join(', ')); return false; }
    if (apiStatus !== 'connected') { setError('API non disponible. Impossible de modifier l\'enseignant.'); return false; }
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.updateTeacher(teacherId, teacherData);
      if (response && response.success) {
        await loadTeachersFromAPI();
        setSuccess('Enseignant modifié avec succès');
        return true;
      } else {
        setError(response?.message || 'Erreur inconnue lors de la modification');
        return false;
      }
    } catch (error) {
      setError('Erreur lors de la modification: ' + error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTeacher = async (teacherId) => {
    if (!canEdit()) {
      setError('Modification non autorisée pour les années antérieures ou futures');
      return false;
    }
    
    if (apiStatus !== 'connected') { setError('API non disponible. Impossible de supprimer l\'enseignant.'); return false; }
    const teacherToDelete = teachers.find(t => t.id === teacherId);
    const teacherName = teacherToDelete ? teacherToDelete.name : 'cet enseignant';
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer "${teacherName}" ?\n\nCette action est irréversible.`)) return false;
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.deleteTeacher(teacherId);
      if (response && response.success) {
        await loadTeachersFromAPI();
        setSuccess('Enseignant supprimé avec succès');
        return true;
      } else {
        setError(response?.message || 'Erreur inconnue lors de la suppression');
        return false;
      }
    } catch (error) {
      setError('Erreur lors de la suppression: ' + error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleSendCode = async (subjectCode, subjectName, recipients) => {
    if (!canEdit()) {
      setError('Envoi non autorisé pour les années antérieures ou futures');
      return false;
    }
    
    console.log('=== ENVOI EMAILS AVEC EMAILJS ===');
    console.log('Code:', subjectCode);
    console.log('Matière:', subjectName);
    console.log('Destinataires:', recipients);
    
    try {
      setLoading(true);
      setError(null);
      
      const SERVICE_ID = 'service_9k0w13e';
      const TEMPLATE_ID = 'template_cqx7563';
      const PUBLIC_KEY = 'xPPsPKFCChFmVeSce';
  
      if (SERVICE_ID === 'YOUR_SERVICE_ID' || TEMPLATE_ID === 'YOUR_TEMPLATE_ID' || PUBLIC_KEY === 'YOUR_PUBLIC_KEY') {
        setError('⚠️ EmailJS non configuré. Remplacez les clés dans App.js');
        console.error('❌ Clés EmailJS non configurées');
        return false;
      }
  
      const emailPromises = recipients.map(recipient => {
        console.log(`📧 Envoi à ${recipient.name} (${recipient.email})...`);
        
        return emailjs.send(
          SERVICE_ID,
          TEMPLATE_ID,
          {
            to_email: recipient.email,
            to_name: recipient.name,
            subject_name: subjectName,
            subject_code: subjectCode
          },
          PUBLIC_KEY
        );
      });
  
      await Promise.all(emailPromises);
      
      console.log('✅ Tous les emails envoyés avec succès');
      setSuccess(`Code "${subjectCode}" envoyé à ${recipients.length} enseignant(s) ✓`);
      return true;
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi des emails:', error);
      console.error('Détails:', error.text || error.message);
      setError('Erreur lors de l\'envoi des emails: ' + (error.text || error.message));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleRetryConnection = async () => {
    setIsRetrying(true);
    setRetryCount(prev => prev + 1);
    try {
      await apiService.retryRequest(() => checkApiHealth(), 3, 2000);
      await loadAllData();
      setSuccess('Reconnexion réussie !');
      setRetryCount(0);
    } catch (error) {
      setError(`Reconnexion échouée (tentative ${retryCount}): ${error.message}`);
    } finally {
      setIsRetrying(false);
    }
  };

  const handleLogout = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      try {
        await signOut(auth);
        setSelectedYear(null);
        localStorage.removeItem('anneeScolaire');
        setShowProfileMenu(false);
      } catch (error) {
        setError('Erreur lors de la déconnexion');
      }
    }
  };

  const handleChangeYear = () => {
    setSelectedYear(null);
    localStorage.removeItem('anneeScolaire');
    setShowProfileMenu(false);
  };

  const menuItems = [
    { 
      id: 'dashboard', 
      label: 'Enseignants', 
      icon: Users, 
      description: 'Gestion des enseignants', 
      disabled: apiStatus !== 'connected' || !canEdit(), 
      color: '#3b82f6', 
      bgColor: darkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)' 
    },
    { 
      id: 'subjects', 
      label: 'Matières', 
      icon: BookOpen, 
      description: 'Gestion des matières', 
      disabled: apiStatus !== 'connected' || !canEdit(), 
      color: '#8b5cf6', 
      bgColor: darkMode ? 'rgba(139, 92, 246, 0.1)' : 'rgba(139, 92, 246, 0.05)' 
    },
    { 
      id: 'students-list', 
      label: 'Étudiants', 
      icon: Users, 
      description: 'Liste des étudiants', 
      disabled: apiStatus !== 'connected' || !canEdit(), 
      color: '#10b981', 
      bgColor: darkMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)' 
    },
    { 
      id: 'results', 
      label: 'Résultats', 
      icon: BarChart3, 
      description: 'Notes et évaluations', 
      disabled: !hasData() || students.length === 0 || subjects.length === 0, 
      color: '#f59e0b', 
      bgColor: darkMode ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.05)' 
    },
    { 
      id: 'statistics', 
      label: 'Statistiques', 
      icon: BarChart3, 
      description: 'Analyses et rapports', 
      disabled: !hasData() || (students.length === 0 && subjects.length === 0), 
      color: '#ef4444', 
      bgColor: darkMode ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)' 
    }
  ];

  const currentDate = new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const theme = {
    bg: { primary: darkMode ? '#1a1a1a' : '#f8fafc', secondary: darkMode ? '#2d2d2d' : '#ffffff', tertiary: darkMode ? '#3a3a3a' : '#f9fafb', card: darkMode ? '#2d2d2d' : '#ffffff' },
    text: { primary: darkMode ? '#f9fafb' : '#1f2937', secondary: darkMode ? '#d1d5db' : '#6b7280', tertiary: darkMode ? '#9ca3af' : '#9ca3af' },
    border: darkMode ? '#404040' : '#e5e7eb',
    shadow: darkMode ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
  };

  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: theme.bg.primary }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', border: '4px solid #e5e7eb', borderTop: '4px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <p style={{ color: theme.text.secondary, fontSize: '0.875rem' }}>Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) return <LoginScreen darkMode={darkMode} />;

  if (!selectedYear) {
    return (
      <YearSelectionScreen 
        darkMode={darkMode}
        onYearSelected={handleYearSelected}
        availableYears={availableYears}
        schoolYearConfig={schoolYearConfig}
      />
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: theme.bg.primary }}>
      {showYearConfig && (
        <SchoolYearConfig
          darkMode={darkMode}
          onSave={handleSaveSchoolYearConfig}
          onCancel={() => setShowYearConfig(false)}
          currentConfig={schoolYearConfig}
        />
      )}
      
      <header style={{ backgroundColor: theme.bg.secondary, boxShadow: theme.shadow, borderBottom: `1px solid ${theme.border}` }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 0' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ width: '48px', height: '48px', backgroundColor: '#3b82f6', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '1rem' }}>
                <BookOpen style={{ width: '24px', height: '24px', color: 'white' }} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: theme.text.primary, margin: 0, lineHeight: '1.2' }}>EduAdmin Pro</h1>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.5rem', borderRadius: '0.375rem', fontSize: '0.75rem', fontWeight: '500', backgroundColor: apiStatus === 'connected' ? '#d1fae5' : '#fee2e2', color: apiStatus === 'connected' ? '#065f46' : '#991b1b' }}>
                    {apiStatus === 'connected' ? <Wifi style={{ width: '12px', height: '12px' }} /> : <WifiOff style={{ width: '12px', height: '12px' }} />}
                    {apiStatus === 'connected' ? 'En ligne' : 'Hors ligne'}
                  </div>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {/* SUPPRIMÉ: Les boutons "Changer d'année" et "Dates" qui sont maintenant dans le menu déroulant */}
              
              <button onClick={toggleDarkMode} className="btn btn-outline" style={{ padding: '0.5rem', minWidth: 'auto' }} title={darkMode ? "Mode clair" : "Mode sombre"}>
                {darkMode ? <span style={{ fontSize: '20px' }}>☀️</span> : <span style={{ fontSize: '20px' }}>🌙</span>}
              </button>

              <div style={{ fontSize: '0.875rem', color: theme.text.secondary, textAlign: 'right', marginRight: '1rem' }}>
                <div style={{ fontWeight: '500', color: theme.text.primary }}>{currentUser?.email || 'Administrateur'}</div>
                <div>{currentDate}</div>
              </div>
              
              <button className="btn btn-outline" style={{ padding: '0.5rem', minWidth: 'auto' }}>
                <Bell style={{ width: '20px', height: '20px' }} />
              </button>

              {/* Menu déroulant du profil */}
              <div className="profile-menu-container" style={{ position: 'relative', display: 'inline-block' }}>
                <div 
                  onClick={toggleProfileMenu}
                  style={{ 
                    width: '40px', 
                    height: '40px', 
                    backgroundColor: darkMode ? '#404040' : '#e5e7eb', 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    cursor: 'pointer',
                    border: `2px solid ${theme.border}`,
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = darkMode ? '#505050' : '#d1d5db'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = darkMode ? '#404040' : '#e5e7eb'}
                >
                  <User style={{ width: '20px', height: '20px', color: theme.text.secondary }} />
                </div>
                
                {/* Menu déroulant */}
                {showProfileMenu && (
                  <div style={{
                    position: 'absolute',
                    right: 0,
                    top: '100%',
                    marginTop: '0.5rem',
                    backgroundColor: theme.bg.card,
                    border: `1px solid ${theme.border}`,
                    borderRadius: '8px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                    minWidth: '220px',
                    zIndex: 1000,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                  }}>
                    <div style={{ 
                      padding: '1rem', 
                      borderBottom: `1px solid ${theme.border}`,
                      backgroundColor: darkMode ? '#2d2d2d' : '#f8f9fa'
                    }}>
                      <div style={{ fontWeight: '600', color: theme.text.primary, fontSize: '0.875rem' }}>{currentUser?.email}</div>
                      <div style={{ fontSize: '0.75rem', color: theme.text.secondary, marginTop: '0.25rem' }}>Administrateur</div>
                    </div>
                    
                    <button 
                      onClick={() => { setShowYearConfig(true); setShowProfileMenu(false); }}
                      style={{
                        padding: '0.75rem 1rem',
                        border: 'none',
                        backgroundColor: 'transparent',
                        color: theme.text.primary,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.875rem',
                        borderBottom: `1px solid ${theme.border}`
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = darkMode ? '#404040' : '#f3f4f6'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      <Calendar style={{ width: '16px', height: '16px' }} />
                      Configurer dates
                    </button>
                    
                    <button 
                      onClick={() => { toggleDarkMode(); setShowProfileMenu(false); }}
                      style={{
                        padding: '0.75rem 1rem',
                        border: 'none',
                        backgroundColor: 'transparent',
                        color: theme.text.primary,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.875rem',
                        borderBottom: `1px solid ${theme.border}`
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = darkMode ? '#404040' : '#f3f4f6'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      {darkMode ? <span>☀️</span> : <span>🌙</span>}
                      {darkMode ? 'Mode clair' : 'Mode sombre'}
                    </button>
                    
                    <button 
                      onClick={() => { handleChangeYear(); setShowProfileMenu(false); }}
                      style={{
                        padding: '0.75rem 1rem',
                        border: 'none',
                        backgroundColor: 'transparent',
                        color: theme.text.primary,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.875rem',
                        borderBottom: `1px solid ${theme.border}`
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = darkMode ? '#404040' : '#f3f4f6'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      <Calendar style={{ width: '16px', height: '16px' }} />
                      Changer d'année
                    </button>
                    
                    <button 
                      onClick={handleLogout}
                      style={{
                        padding: '0.75rem 1rem',
                        border: 'none',
                        backgroundColor: 'transparent',
                        color: '#ef4444',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.875rem'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = darkMode ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      <LogOut style={{ width: '16px', height: '16px' }} />
                    Déconnexion
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {error && (
        <div style={{ backgroundColor: '#fef2f2', borderLeft: '4px solid #dc2626', padding: '1rem', margin: '0' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#991b1b', fontSize: '0.875rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle style={{ width: '16px', height: '16px' }} />
              <span>{error}</span>
            </div>
            <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', color: '#991b1b', fontSize: '1.25rem', cursor: 'pointer', padding: '0 0.5rem' }}>×</button>
          </div>
        </div>
      )}

      {success && (
        <div style={{ backgroundColor: '#f0fdf4', borderLeft: '4px solid #16a34a', padding: '1rem', margin: '0' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#166534', fontSize: '0.875rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle style={{ width: '16px', height: '16px' }} />
              <span>{success}</span>
            </div>
            <button onClick={() => setSuccess(null)} style={{ background: 'none', border: 'none', color: '#166534', fontSize: '1.25rem', cursor: 'pointer', padding: '0 0.5rem' }}>×</button>
          </div>
        </div>
      )}

      {selectedYear && isPastYear(selectedYear) && (
        <div style={{ backgroundColor: '#fefce8', borderLeft: '4px solid #eab308', padding: '1rem', margin: '0' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#854d0e', fontSize: '0.875rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BookOpen style={{ width: '16px', height: '16px' }} />
              <span><strong>Mode consultation :</strong> Vous consultez les données de l'année {selectedYear}. Les modifications ne sont pas autorisées.</span>
            </div>
          </div>
        </div>
      )}

      {selectedYear && isFutureYear(selectedYear) && (
        <div style={{ backgroundColor: '#fffbeb', borderLeft: '4px solid #f59e0b', padding: '1rem', margin: '0' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#92400e', fontSize: '0.875rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar style={{ width: '16px', height: '16px' }} />
              <span><strong>Mode préparation :</strong> Année {selectedYear} - Aucune donnée disponible. Vous pouvez préparer la structure mais pas ajouter de données.</span>
            </div>
          </div>
        </div>
      )}

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1rem' }}>
        {activeTab !== 'home' && (
          <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: theme.bg.card, borderColor: theme.border }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button onClick={() => setActiveTab('home')} style={{ background: 'none', border: 'none', color: theme.text.secondary, fontSize: '0.875rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.5rem', borderRadius: '0.25rem' }} onMouseEnter={(e) => { e.target.style.backgroundColor = darkMode ? '#404040' : '#f3f4f6'; }} onMouseLeave={(e) => { e.target.style.backgroundColor = 'transparent'; }}>
                  <Home style={{ width: '16px', height: '16px' }} />
                  Accueil
                </button>
                <span style={{ color: theme.text.tertiary }}>›</span>
                <span style={{ color: '#3b82f6', fontSize: '0.875rem', fontWeight: '500' }}>{menuItems.find(item => item.id === activeTab)?.label}</span>
              </div>
              {apiStatus === 'disconnected' && (
                <button onClick={handleRetryConnection} disabled={isRetrying || loading} style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #3b82f6', backgroundColor: darkMode ? '#2d2d2d' : 'white', color: '#3b82f6', fontSize: '0.75rem', fontWeight: '500', cursor: (isRetrying || loading) ? 'not-allowed' : 'pointer', opacity: (isRetrying || loading) ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  {isRetrying ? 'Reconnexion...' : 'Reconnecter'}
                </button>
              )}
            </div>
          </div>
        )}

        {loading && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(2px)' }}>
            <div style={{ backgroundColor: theme.bg.secondary, padding: '2rem', borderRadius: '12px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '40px', height: '40px', border: `3px solid ${theme.border}`, borderTop: '3px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              <span style={{ fontSize: '0.875rem', color: theme.text.secondary }}>Chargement en cours...</span>
            </div>
          </div>
        )}

        <main className="fade-in">
          {activeTab === 'home' && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: theme.text.primary, marginBottom: '0.5rem' }}>Bienvenue sur EduAdmin Pro</h2>
                <p style={{ fontSize: '1.125rem', color: theme.text.secondary }}>
                  Année scolaire {selectedYear} • {selectedYear && (isPastYear(selectedYear) ? 'Mode consultation' : isFutureYear(selectedYear) ? 'Mode préparation - Données vides' : 'Mode édition')}
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isDisabled = item.disabled || loading;
                  return (
                    <button key={item.id} onClick={() => !isDisabled && setActiveTab(item.id)} disabled={isDisabled} className="card" style={{ padding: '2rem', border: 'none', cursor: isDisabled ? 'not-allowed' : 'pointer', transition: 'all 0.3s ease', backgroundColor: theme.bg.card, borderColor: theme.border, opacity: isDisabled ? 0.5 : 1, textAlign: 'left', position: 'relative', overflow: 'hidden' }} onMouseEnter={(e) => { if (!isDisabled) { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = darkMode ? '0 20px 25px -5px rgba(0, 0, 0, 0.5)' : '0 20px 25px -5px rgba(0, 0, 0, 0.1)'; } }} onMouseLeave={(e) => { if (!isDisabled) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = theme.shadow; } }}>
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', backgroundColor: item.color }} />
                      <div style={{ width: '64px', height: '64px', backgroundColor: item.bgColor, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                        <Icon style={{ width: '32px', height: '32px', color: item.color }} />
                      </div>
                      <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: theme.text.primary, marginBottom: '0.5rem' }}>{item.label}</h3>
                      <p style={{ fontSize: '0.875rem', color: theme.text.secondary, marginBottom: '1.5rem', lineHeight: '1.5' }}>{item.description}</p>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: '500', color: item.color }}>{isDisabled ? 'Non disponible' : 'Accéder'}</span>
                        {!isDisabled && <ArrowRight style={{ width: '20px', height: '20px', color: item.color }} />}
                      </div>
                      {item.id === 'subjects' && apiStatus !== 'connected' && (
                        <div style={{ position: 'absolute', top: '1rem', right: '1rem', padding: '0.25rem 0.5rem', borderRadius: '0.375rem', fontSize: '0.75rem', fontWeight: '500', backgroundColor: '#fee2e2', color: '#991b1b' }}>Hors ligne</div>
                      )}
                      {(item.id === 'subjects' || item.id === 'students-list') && selectedYear && isPastYear(selectedYear) && (
                        <div style={{ position: 'absolute', top: '1rem', right: '1rem', padding: '0.25rem 0.5rem', borderRadius: '0.375rem', fontSize: '0.75rem', fontWeight: '500', backgroundColor: '#fef3c7', color: '#d97706' }}>Consultation</div>
                      )}
                      {(item.id === 'subjects' || item.id === 'students-list') && selectedYear && isFutureYear(selectedYear) && (
                        <div style={{ position: 'absolute', top: '1rem', right: '1rem', padding: '0.25rem 0.5rem', borderRadius: '0.375rem', fontSize: '0.75rem', fontWeight: '500', backgroundColor: '#fef3c7', color: '#d97706' }}>Données vides</div>
                      )}
                      {(item.id === 'results' || item.id === 'statistics') && selectedYear && isFutureYear(selectedYear) && (
                        <div style={{ position: 'absolute', top: '1rem', right: '1rem', padding: '0.25rem 0.5rem', borderRadius: '0.375rem', fontSize: '0.75rem', fontWeight: '500', backgroundColor: '#fef3c7', color: '#d97706' }}>Aucune donnée</div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'dashboard' && (
            <Dashboard 
              students={students} 
              subjects={subjects} 
              teachers={teachers}
              onAddTeacher={handleAddTeacher}
              onEditTeacher={handleEditTeacher}
              onDeleteTeacher={handleDeleteTeacher}
              apiStatus={apiStatus} 
              darkMode={darkMode} 
              theme={theme} 
              onNavigate={setActiveTab} 
              canEdit={canEdit()}
              selectedYear={selectedYear}
              hasData={hasData()}
            />
          )}
          
          {activeTab === 'subjects' && (
            <SubjectsManager 
              subjects={subjects} 
              teachers={teachers}
              onAddSubject={handleAddSubject} 
              onEditSubject={handleEditSubject} 
              onDeleteSubject={handleDeleteSubject}
              onSendCode={handleSendCode}
              apiStatus={apiStatus} 
              darkMode={darkMode} 
              theme={theme} 
              canEdit={canEdit()}
              selectedYear={selectedYear}
              hasData={hasData()}
            />
          )}
          
          {activeTab === 'students-list' && (
            <StudentsList 
              students={students} 
              subjects={subjects} 
              onAddStudent={handleAddStudent} 
              onEditStudent={handleEditStudent} 
              onDeleteStudent={handleDeleteStudent} 
              apiStatus={apiStatus} 
              darkMode={darkMode} 
              theme={theme} 
              canEdit={canEdit()}
              selectedYear={selectedYear}
              hasData={hasData()}
            />
          )}
          
          {activeTab === 'results' && (
            <StudentsResults 
              students={students} 
              subjects={subjects} 
              apiStatus={apiStatus} 
              darkMode={darkMode} 
              theme={theme} 
              canEdit={canEdit()}
              selectedYear={selectedYear}
              hasData={hasData()}
            />
          )}
          
          {activeTab === 'statistics' && (
            <SchoolStatisticsWithHistory 
              students={students} 
              subjects={subjects} 
              selectedYear={selectedYear}
              availableYears={availableYears}
            />
          )}
        </main>
      </div>

      <footer style={{ borderTop: `1px solid ${theme.border}`, backgroundColor: theme.bg.tertiary, padding: '2rem 0', marginTop: '4rem' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1rem', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            {/* SUPPRIMÉ: Les boutons "Changer d'année" et "Configurer dates" du footer */}
            {apiStatus === 'disconnected' && (
              <button onClick={handleRetryConnection} className="btn btn-primary" style={{ fontSize: '0.875rem' }} disabled={isRetrying || loading}>
                <Wifi style={{ width: '16px', height: '16px', marginRight: '0.5rem' }} />
                {isRetrying ? 'Reconnexion...' : 'Reconnecter l\'API'}
              </button>
            )}
            {/* SUPPRIMÉ: Le bouton de déconnexion du footer */}
          </div>
          <div style={{ fontSize: '0.75rem', color: theme.text.secondary, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <span>© 2025 EduAdmin Pro - Système de Gestion Scolaire</span>
            <span>•</span>
            <span>Année: {selectedYear}</span>
            <span>•</span>
            <span>Mode: {selectedYear && (isPastYear(selectedYear) ? 'Consultation' : isFutureYear(selectedYear) ? 'Préparation - Données vides' : 'Édition')}</span>
            <span>•</span>
            <span>API: {apiStatus === 'connected' ? 'Connectée' : 'Déconnectée'}</span>
            {retryCount > 0 && (<><span>•</span><span>Tentatives: {retryCount}</span></>)}
            <span>•</span>
            <span>Utilisateur: {currentUser?.email}</span>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .fade-in {
          animation: fadeIn 0.3s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .btn {
          display: inline-flex;
          align-items: center;
          padding: 0.5rem 1rem;
          borderRadius: 0.375rem;
          fontSize: 0.875rem;
          fontWeight: '500';
          textDecoration: none;
          cursor: pointer;
          transition: all 0.2s ease-in-out;
          border: 1px solid transparent;
        }
        .btn-primary {
          backgroundColor: #3b82f6;
          color: white;
          borderColor: #3b82f6;
        }
        .btn-primary:hover:not(:disabled) {
          backgroundColor: #2563eb;
          borderColor: #2563eb;
        }
        .btn-outline {
          backgroundColor: ${darkMode ? '#2d2d2d' : 'transparent'};
          color: ${darkMode ? '#d1d5db' : '#6b7280'};
          borderColor: ${darkMode ? '#404040' : '#d1d5db'};
        }
        .btn-outline:hover:not(:disabled) {
          backgroundColor: ${darkMode ? '#404040' : '#f3f4f6'};
          color: ${darkMode ? '#f9fafb' : '#374151'};
        }
        .btn-secondary {
          backgroundColor: #6b7280;
          color: white;
          borderColor: #6b7280;
        }
        .btn-secondary:hover:not(:disabled) {
          backgroundColor: #4b5563;
          borderColor: #4b5563;
        }
        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .card {
          backgroundColor: ${theme.bg.card};
          borderRadius: 0.5rem;
          boxShadow: ${theme.shadow};
          border: 1px solid ${theme.border};
        }
      `}</style>
    </div>
  );
};

export default App;