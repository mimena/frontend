import React, { useState, useEffect } from 'react';
import { Calendar, BookOpen, ArrowRight, CheckCircle } from 'lucide-react';

// Composant de sélection d'année scolaire
const YearSelectionScreen = ({ darkMode, onYearSelected, availableYears }) => {
  const [selectedYear, setSelectedYear] = useState('');
  const [loading, setLoading] = useState(false);

  const theme = {
    bg: { primary: darkMode ? '#1a1a1a' : '#f8fafc', card: darkMode ? '#2d2d2d' : '#ffffff' },
    text: { primary: darkMode ? '#f9fafb' : '#1f2937', secondary: darkMode ? '#d1d5db' : '#6b7280' },
    border: darkMode ? '#404040' : '#e5e7eb',
    shadow: darkMode ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
  };

  const handleContinue = () => {
    if (selectedYear) {
      setLoading(true);
      onYearSelected(selectedYear);
    }
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
              📚 Toutes les données affichées seront filtrées pour l'année sélectionnée
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
              }}>Créez votre première année en ajoutant des étudiants</p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gap: '1rem',
              marginBottom: '2rem'
            }}>
              {availableYears.map((year) => (
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
                    textAlign: 'left'
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
                      backgroundColor: selectedYear === year ? '#3b82f6' : (darkMode ? '#404040' : '#f3f4f6'),
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Calendar style={{
                        width: '24px',
                        height: '24px',
                        color: selectedYear === year ? 'white' : theme.text.secondary
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
                      }}>Année scolaire</div>
                    </div>
                  </div>
                  {selectedYear === year && (
                    <CheckCircle style={{
                      width: '24px',
                      height: '24px',
                      color: '#3b82f6'
                    }} />
                  )}
                </button>
              ))}
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
              backgroundColor: darkMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)',
              borderRadius: '8px',
              border: `1px solid ${darkMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)'}`,
              textAlign: 'center'
            }}>
              <p style={{
                fontSize: '0.875rem',
                color: theme.text.secondary,
                margin: 0
              }}>
                ✓ Vous travaillerez sur l'année <strong style={{ color: '#10b981' }}>{selectedYear}</strong>
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

// Exemple d'utilisation dans App.js
const ExampleApp = () => {
  const [currentAnneeScolaire, setCurrentAnneeScolaire] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [availableYears, setAvailableYears] = useState(['2024-2025', '2023-2024', '2022-2023']);

  const handleYearSelected = (year) => {
    console.log('Année sélectionnée:', year);
    // Sauvegarder l'année dans le state ou localStorage
    setCurrentAnneeScolaire(year);
    localStorage.setItem('anneeScolaire', year);
    
    // Charger les données pour cette année
    // loadDataForYear(year);
  };

  if (!currentAnneeScolaire) {
    return (
      <YearSelectionScreen 
        darkMode={darkMode}
        onYearSelected={handleYearSelected}
        availableYears={availableYears}
      />
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: darkMode ? '#1a1a1a' : '#f8fafc',
      padding: '2rem'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        textAlign: 'center'
      }}>
        <h1 style={{
          fontSize: '2rem',
          color: darkMode ? '#f9fafb' : '#1f2937',
          marginBottom: '1rem'
        }}>
          Application - Année {currentAnneeScolaire}
        </h1>
        <p style={{
          color: darkMode ? '#d1d5db' : '#6b7280',
          marginBottom: '2rem'
        }}>
          Toutes les données affichées sont pour l'année {currentAnneeScolaire}
        </p>
        
        <button
          onClick={() => setCurrentAnneeScolaire(null)}
          style={{
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            border: 'none',
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            color: 'white',
            fontSize: '0.875rem',
            fontWeight: '500',
            cursor: 'pointer'
          }}
        >
          Changer d'année
        </button>
      </div>
    </div>
  );
};

export default ExampleApp;