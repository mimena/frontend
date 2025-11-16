import React, { useState, useEffect } from 'react';
import { 
  RefreshCw,
  Clock,
  Users,
  BookOpen,
  Target,
  TrendingUp,
  Award,
  BarChart3,
  Filter,
  Calendar,
  Archive,
  Download,
  Upload
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Legend } from 'recharts';

const SchoolStatisticsWithHistory = ({ students, subjects, selectedYear: propSelectedYear, availableYears: propAvailableYears }) => {
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedYear, setSelectedYear] = useState(propSelectedYear || '');
  const [mobileResults, setMobileResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [viewMode, setViewMode] = useState('overview');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [historicalData, setHistoricalData] = useState({});
  const [availableYears, setAvailableYears] = useState(propAvailableYears || []);

  const API_BASE_URL = 'https://scolaire.onrender.com/api';

  // Obtenir l'année scolaire actuelle
  const getCurrentSchoolYear = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0-11 (janvier=0)
    
    // Si on est après août (mois 7), l'année scolaire commence cette année
    // Sinon, elle a commencé l'année précédente
    if (month >= 8) { // Septembre à Décembre
      return `${year}-${year + 1}`;
    } else { // Janvier à Août
      return `${year - 1}-${year}`;
    }
  };

  // Génération des années scolaires si non fournies en props
  useEffect(() => {
    if (propAvailableYears && propAvailableYears.length > 0) {
      setAvailableYears(propAvailableYears);
      if (propSelectedYear) {
        setSelectedYear(propSelectedYear);
      } else {
        setSelectedYear(propAvailableYears[0]);
      }
      return;
    }

    const currentYear = getCurrentSchoolYear();
    const years = [];
    
    // Générer les 5 dernières années scolaires
    for (let i = 4; i >= 0; i--) {
      const startYear = parseInt(currentYear.split('-')[0]) - i;
      years.push(`${startYear}-${startYear + 1}`);
    }
    
    setAvailableYears(years);
    if (!propSelectedYear) {
      setSelectedYear(years[years.length - 1]); // Année en cours par défaut (la plus récente)
    }
  }, [propAvailableYears, propSelectedYear]);

  useEffect(() => {
    if (selectedYear) {
      loadMobileResults();
      loadHistoricalData();
      const interval = setInterval(loadMobileResults, 60000);
      return () => clearInterval(interval);
    }
  }, [selectedYear]);

  const loadMobileResults = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/results`);
      const data = await response.json();
      
      if (data.success) {
        setMobileResults(data.results || []);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Erreur chargement résultats mobile:', error);
    } finally {
      setLoading(false);
    }
  };

  // Chargement des données historiques depuis le backend ou localStorage
  const loadHistoricalData = () => {
    try {
      const stored = localStorage.getItem('schoolHistoricalData');
      if (stored) {
        setHistoricalData(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Erreur chargement historique:', error);
    }
  };

  // Sauvegarde des données de l'année en cours
  const saveCurrentYearData = () => {
    const yearKey = selectedYear;
    const currentData = {
      year: yearKey,
      students: students.map(s => ({
        matricule: s.matricule,
        nom: s.nom,
        prenom: s.prenom,
        classe: s.classe,
        notes: s.notes
      })),
      mobileResults: mobileResults,
      savedAt: new Date().toISOString(),
      stats: calculateGlobalStats()
    };

    const newHistoricalData = {
      ...historicalData,
      [yearKey]: currentData
    };

    setHistoricalData(newHistoricalData);
    localStorage.setItem('schoolHistoricalData', JSON.stringify(newHistoricalData));
    
    alert(`Données de l'année ${yearKey} sauvegardées avec succès !`);
  };

  // Récupération des données pour l'année sélectionnée
  const getYearData = () => {
    if (!selectedYear) return { students: [], mobileResults: [] };
    
    // Si c'est l'année en cours (dernière dans la liste), utiliser les données live
    const currentYear = getCurrentSchoolYear();
    if (selectedYear === currentYear) {
      return { students, mobileResults };
    }
    
    // Sinon, charger depuis l'historique
    const yearData = historicalData[selectedYear];
    if (yearData) {
      return {
        students: yearData.students || [],
        mobileResults: yearData.mobileResults || []
      };
    }
    
    return { students: [], mobileResults: [] };
  };

  const calculateGlobalStats = () => {
    const yearData = getYearData();
    const yearStudents = yearData.students;
    const yearResults = yearData.mobileResults;

    const filteredStudents = selectedClass 
      ? yearStudents.filter(s => s.classe === selectedClass)
      : yearStudents;

    if (filteredStudents.length === 0) {
      return {
        totalStudents: 0,
        classAverage: 0,
        excellent: 0,
        good: 0,
        satisfactory: 0,
        unsatisfactory: 0,
        successRate: 0,
        mobileCorrections: 0
      };
    }

    const averages = filteredStudents.map(student => {
      const traditionalNotes = student.notes || {};
      const studentMobileResults = yearResults.filter(
        result => result.student_matricule === student.matricule
      );
      
      const mobileNotes = {};
      studentMobileResults.forEach(result => {
        if (!mobileNotes[result.subject_code] || 
            new Date(result.created_at) > new Date(mobileNotes[result.subject_code].created_at)) {
          mobileNotes[result.subject_code] = result;
        }
      });

      const allNotes = { ...traditionalNotes };
      Object.keys(mobileNotes).forEach(subjectCode => {
        allNotes[subjectCode] = mobileNotes[subjectCode].score;
      });

      const subjects_with_coeff = subjects.map(subject => ({
        ...subject,
        note: allNotes[subject.code] || 0
      }));
      
      const totalPoints = subjects_with_coeff.reduce((sum, subject) => 
        sum + (subject.note * subject.coefficient), 0);
      const totalCoeff = subjects_with_coeff.reduce((sum, subject) => 
        sum + subject.coefficient, 0);
      
      return totalCoeff > 0 ? totalPoints / totalCoeff : 0;
    });

    const totalStudents = filteredStudents.length;
    const classAverage = averages.reduce((sum, avg) => sum + avg, 0) / totalStudents;
    const excellent = averages.filter(avg => avg >= 16).length;
    const good = averages.filter(avg => avg >= 14 && avg < 16).length;
    const satisfactory = averages.filter(avg => avg >= 10 && avg < 14).length;
    const unsatisfactory = averages.filter(avg => avg < 10).length;

    const mobileCorrectionsCount = yearResults.filter(result =>
      filteredStudents.some(student => student.matricule === result.student_matricule)
    ).length;

    return {
      totalStudents,
      classAverage: classAverage.toFixed(2),
      excellent,
      good,
      satisfactory,
      unsatisfactory,
      successRate: ((totalStudents - unsatisfactory) / totalStudents * 100).toFixed(1),
      mobileCorrections: mobileCorrectionsCount
    };
  };

  const getYearlyComparison = () => {
    return availableYears.map(year => {
      let yearStats;
      
      const currentYear = getCurrentSchoolYear();
      if (year === currentYear) {
        // Année en cours - calculer à partir des données live
        yearStats = calculateGlobalStats();
      } else if (historicalData[year]) {
        yearStats = historicalData[year].stats;
      } else {
        yearStats = {
          totalStudents: 0,
          classAverage: 0,
          successRate: 0
        };
      }

      return {
        year,
        students: yearStats.totalStudents || 0,
        average: parseFloat(yearStats.classAverage) || 0,
        successRate: parseFloat(yearStats.successRate) || 0,
        hasData: year === currentYear || !!historicalData[year]
      };
    }).reverse();
  };

  const getSubjectStats = (subjectCode) => {
    const yearData = getYearData();
    const yearStudents = yearData.students;
    const yearResults = yearData.mobileResults;

    const filteredStudents = selectedClass 
      ? yearStudents.filter(s => s.classe === selectedClass)
      : yearStudents;

    const subject = subjects.find(s => s.code === subjectCode);
    if (!subject) return null;

    const finalNotes = [];
    filteredStudents.forEach(student => {
      const studentMobileResults = yearResults.filter(
        result => result.student_matricule === student.matricule && result.subject_code === subjectCode
      );
      
      if (studentMobileResults.length > 0) {
        const latestResult = studentMobileResults.sort((a, b) => 
          new Date(b.created_at) - new Date(a.created_at)
        )[0];
        finalNotes.push(latestResult.score);
      } else if ((student.notes || {})[subjectCode] !== undefined) {
        finalNotes.push((student.notes || {})[subjectCode]);
      }
    });

    if (finalNotes.length === 0) {
      return {
        subject,
        average: 0,
        averageOver20: 0,
        participationRate: 0,
        notesCount: 0,
        maxPoints: 20 * (subject.coefficient || 1)
      };
    }

    const maxPoints = 20 * (subject.coefficient || 1);
    const average = finalNotes.reduce((sum, note) => sum + note, 0) / finalNotes.length;
    const averageOver20 = (average / maxPoints) * 20;
    const participationRate = (finalNotes.length / filteredStudents.length * 100).toFixed(1);

    return {
      subject,
      average: average.toFixed(2),
      averageOver20: averageOver20.toFixed(2),
      participationRate,
      notesCount: finalNotes.length,
      finalNotes,
      maxPoints
    };
  };

  const getSubjectsPerformance = () => {
    return subjects.map(subject => {
      const stats = getSubjectStats(subject.code);
      return {
        subject: subject.name,
        students: stats ? stats.notesCount : 0,
        average: stats ? parseFloat(stats.average) : 0,
        averageOver20: stats ? parseFloat(stats.averageOver20) : 0,
        participation: stats ? parseFloat(stats.participationRate) : 0,
        coefficient: subject.coefficient,
        maxPoints: stats ? stats.maxPoints : (20 * subject.coefficient)
      };
    }).filter(item => item.students > 0).slice(0, 10);
  };

  const getAllClassesStats = () => {
    const yearData = getYearData();
    const yearStudents = yearData.students;
    const yearResults = yearData.mobileResults;

    const classes = [...new Set(yearStudents.map(s => s.classe))].filter(Boolean);
    
    return classes.map(classe => {
      const classStudents = yearStudents.filter(s => s.classe === classe);
      const averages = classStudents.map(student => {
        const traditionalNotes = student.notes || {};
        const studentMobileResults = yearResults.filter(
          result => result.student_matricule === student.matricule
        );
        
        const mobileNotes = {};
        studentMobileResults.forEach(result => {
          if (!mobileNotes[result.subject_code] || 
              new Date(result.created_at) > new Date(mobileNotes[result.subject_code].created_at)) {
            mobileNotes[result.subject_code] = result;
          }
        });

        const allNotes = { ...traditionalNotes };
        Object.keys(mobileNotes).forEach(subjectCode => {
          allNotes[subjectCode] = mobileNotes[subjectCode].score;
        });

        const subjects_with_coeff = subjects.map(subject => ({
          ...subject,
          note: allNotes[subject.code] || 0
        }));
        
        const totalPoints = subjects_with_coeff.reduce((sum, subject) => 
          sum + (subject.note * subject.coefficient), 0);
        const totalCoeff = subjects_with_coeff.reduce((sum, subject) => 
          sum + subject.coefficient, 0);
        
        return totalCoeff > 0 ? totalPoints / totalCoeff : 0;
      });

      const classAverage = averages.length > 0 ? averages.reduce((sum, avg) => sum + avg, 0) / averages.length : 0;
      const successRate = averages.length > 0 ? (averages.filter(avg => avg >= 10).length / averages.length * 100) : 0;

      const distribution = {
        excellent: averages.filter(avg => avg >= 16).length,
        good: averages.filter(avg => avg >= 14 && avg < 16).length,
        satisfactory: averages.filter(avg => avg >= 10 && avg < 14).length,
        unsatisfactory: averages.filter(avg => avg < 10).length
      };

      return {
        classe,
        studentCount: classStudents.length,
        average: classAverage.toFixed(2),
        successRate: successRate.toFixed(1),
        distribution
      };
    });
  };

  const getSubjectLevelDistribution = () => {
    if (!selectedSubject) return [];

    const stats = getSubjectStats(selectedSubject);
    if (!stats || !stats.finalNotes) return [];

    const finalNotes = stats.finalNotes;
    const maxPoints = stats.maxPoints;
    
    // Convertir toutes les notes sur 20 pour la distribution
    const notesOver20 = finalNotes.map(note => (note / maxPoints) * 20);
    
    return [
      { name: 'Excellent (≥16)', value: notesOver20.filter(n => n >= 16).length, color: '#10b981' },
      { name: 'Très Bien (14-16)', value: notesOver20.filter(n => n >= 14 && n < 16).length, color: '#3b82f6' },
      { name: 'Satisfaisant (10-14)', value: notesOver20.filter(n => n >= 10 && n < 14).length, color: '#f59e0b' },
      { name: 'Insuffisant (<10)', value: notesOver20.filter(n => n < 10).length, color: '#ef4444' }
    ];
  };

  const getGlobalDistribution = () => {
    const stats = calculateGlobalStats();
    return [
      { name: 'Excellent', value: stats.excellent, color: '#10b981' },
      { name: 'Très Bien', value: stats.good, color: '#3b82f6' },
      { name: 'Satisfaisant', value: stats.satisfactory, color: '#f59e0b' },
      { name: 'Insuffisant', value: stats.unsatisfactory, color: '#ef4444' }
    ];
  };

  // Fonction pour exporter en CSV
  const exportToCSV = () => {
    const yearData = getYearData();
    const stats = calculateGlobalStats();
    
    // En-têtes CSV
    let csvContent = "Données Statistiques Scolaires - Année " + selectedYear + "\\n";
    csvContent += "Exporté le: " + new Date().toLocaleDateString('fr-FR') + "\\n\\n";
    
    // Statistiques globales
    csvContent += "STATISTIQUES GLOBALES\\n";
    csvContent += "Nombre d'étudiants," + stats.totalStudents + "\\n";
    csvContent += "Moyenne générale," + stats.classAverage + "/20\\n";
    csvContent += "Taux de réussite," + stats.successRate + "%\\n";
    csvContent += "Corrections mobiles," + stats.mobileCorrections + "\\n";
    csvContent += "Excellent (≥16)," + stats.excellent + "\\n";
    csvContent += "Très Bien (14-16)," + stats.good + "\\n";
    csvContent += "Satisfaisant (10-14)," + stats.satisfactory + "\\n";
    csvContent += "Insuffisant (<10)," + stats.unsatisfactory + "\\n\\n";
    
    // Performance par matière
    csvContent += "PERFORMANCE PAR MATIERE\\n";
    csvContent += "Matière,Étudiants notés,Moyenne (avec coeff),Moyenne /20,Taux participation,Coefficient\\n";
    
    subjectsPerformance.forEach(item => {
      csvContent += `"${item.subject}",${item.students},${item.average.toFixed(2)}/${item.maxPoints.toFixed(0)},${item.averageOver20.toFixed(2)}/20,${item.participation}%,${item.coefficient}\\n`;
    });
    
    csvContent += "\\n";
    
    // Statistiques par classe
    csvContent += "STATISTIQUES PAR CLASSE\\n";
    csvContent += "Classe,Nombre d'étudiants,Moyenne,Taux de réussite,Excellent,Très Bien,Satisfaisant,Insuffisant\\n";
    
    allClassesStats.forEach(classe => {
      csvContent += `"${classe.classe}",${classe.studentCount},${classe.average}/20,${classe.successRate}%,${classe.distribution.excellent},${classe.distribution.good},${classe.distribution.satisfactory},${classe.distribution.unsatisfactory}\\n`;
    });
    
    // Créer et télécharger le fichier CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `statistiques_scolaires_${selectedYear}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Fonction pour exporter en PDF (version simplifiée)
  const exportToPDF = () => {
    // Créer une nouvelle fenêtre pour l'impression/PDF
    const printWindow = window.open('', '_blank');
    const stats = calculateGlobalStats();
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Statistiques Scolaires ${selectedYear}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #333; text-align: center; }
          h2 { color: #555; border-bottom: 2px solid #eee; padding-bottom: 5px; }
          .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin: 20px 0; }
          .stat-card { background: #f9f9f9; padding: 15px; border-radius: 5px; border-left: 4px solid #0078d4; }
          .stat-value { font-size: 24px; font-weight: bold; color: #0078d4; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <h1>📊 Tableau de Bord des Performances Académiques</h1>
        <h2>Année Scolaire: ${selectedYear}</h2>
        <p>Exporté le: ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</p>
        
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">${stats.totalStudents}</div>
            <div>Étudiants Total</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${stats.classAverage}/20</div>
            <div>Moyenne Générale</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${stats.successRate}%</div>
            <div>Taux de Réussite</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${stats.mobileCorrections}</div>
            <div>Corrections Mobile</div>
          </div>
        </div>
        
        <h2>Répartition des Niveaux</h2>
        <table>
          <tr><th>Niveau</th><th>Nombre d'étudiants</th></tr>
          <tr><td>Excellent (≥16)</td><td>${stats.excellent}</td></tr>
          <tr><td>Très Bien (14-16)</td><td>${stats.good}</td></tr>
          <tr><td>Satisfaisant (10-14)</td><td>${stats.satisfactory}</td></tr>
          <tr><td>Insuffisant (<10)</td><td>${stats.unsatisfactory}</td></tr>
        </table>
        
        <h2>Performance par Matière</h2>
        <table>
          <tr>
            <th>Matière</th>
            <th>Étudiants Notés</th>
            <th>Moyenne /20</th>
            <th>Participation</th>
            <th>Coefficient</th>
          </tr>
          ${subjectsPerformance.map(item => `
            <tr>
              <td>${item.subject}</td>
              <td>${item.students}</td>
              <td>${item.averageOver20.toFixed(2)}</td>
              <td>${item.participation}%</td>
              <td>${item.coefficient}</td>
            </tr>
          `).join('')}
        </table>
        
        <div class="footer">
          <p>Système de gestion avec historique multi-années • Données sauvegardées localement</p>
        </div>
      </body>
      </html>
    `;
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Attendre que le contenu soit chargé avant d'imprimer
    setTimeout(() => {
      printWindow.print();
      // printWindow.close(); // Optionnel: fermer la fenêtre après impression
    }, 500);
  };

  const globalStats = calculateGlobalStats();
  const yearlyComparison = getYearlyComparison();
  const subjectLevelDistribution = getSubjectLevelDistribution();
  const subjectsPerformance = getSubjectsPerformance();
  const allClassesStats = getAllClassesStats();
  const globalDistribution = getGlobalDistribution();
  
  const yearData = getYearData();
  const classes = [...new Set(yearData.students.map(s => s.classe))].filter(Boolean);
  const currentYear = getCurrentSchoolYear();
  const isCurrentYear = selectedYear === currentYear;

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-header-modern">
        <div className="header-content">
          <div className="title-section">
            <h1>📊 Tableau de Bord des Performances Académiques</h1>
            <p className="subtitle">
              Analyse complète des statistiques scolaires avec historique multi-années. 
              Consultez les performances par année, classe et matière avec des graphiques interactifs.
            </p>
          </div>
          <div className="header-actions-modern">
            <div className="filter-group-modern">
              <Calendar size={16} />
              <select 
                value={selectedYear} 
                onChange={(e) => setSelectedYear(e.target.value)}
                className="select-modern year-select"
              >
                {availableYears.map(year => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="filter-group-modern">
              <Filter size={16} />
              <select 
                value={selectedClass} 
                onChange={(e) => setSelectedClass(e.target.value)}
                className="select-modern"
              >
                <option value="">Toutes les classes</option>
                {classes.map(classe => (
                  <option key={classe} value={classe}>{classe}</option>
                ))}
              </select>
            </div>

            {isCurrentYear && (
              <>
                <button 
                  className="refresh-button-modern"
                  onClick={loadMobileResults}
                  disabled={loading}
                >
                  <RefreshCw size={16} className={loading ? 'spinning' : ''} />
                  {loading ? 'Actualisation...' : 'Actualiser'}
                </button>
                
                <button 
                  className="save-button-modern"
                  onClick={saveCurrentYearData}
                  title="Sauvegarder les données de l'année en cours"
                >
                  <Archive size={16} />
                  Archiver
                </button>
              </>
            )}

            <div className="export-dropdown">
              <button className="export-button-modern">
                <Download size={16} />
                Exporter
              </button>
              <div className="export-dropdown-content">
                <button onClick={exportToCSV}>📊 Exporter en CSV</button>
                <button onClick={exportToPDF}>📄 Exporter en PDF</button>
              </div>
            </div>
          </div>
        </div>

        <div className="navigation-tabs">
          <button 
            className={`tab-btn ${viewMode === 'overview' ? 'active' : ''}`}
            onClick={() => setViewMode('overview')}
          >
            <BarChart3 size={16} />
            Vue d'Ensemble
          </button>
          <button 
            className={`tab-btn ${viewMode === 'history' ? 'active' : ''}`}
            onClick={() => setViewMode('history')}
          >
            <Calendar size={16} />
            Historique
          </button>
          <button 
            className={`tab-btn ${viewMode === 'subjects' ? 'active' : ''}`}
            onClick={() => setViewMode('subjects')}
          >
            <BookOpen size={16} />
            Par Matière
          </button>
          <button 
            className={`tab-btn ${viewMode === 'classes' ? 'active' : ''}`}
            onClick={() => setViewMode('classes')}
          >
            <Users size={16} />
            Par Classe
          </button>
        </div>
      </div>

      {/* Badge année sélectionnée */}
      <div className="year-indicator">
        <Calendar size={18} />
        <span>Année Scolaire: <strong>{selectedYear}</strong></span>
        {!isCurrentYear && historicalData[selectedYear] && (
          <span className="archived-badge">
            <Archive size={14} />
            Archivé le {new Date(historicalData[selectedYear].savedAt).toLocaleDateString('fr-FR')}
          </span>
        )}
        {!isCurrentYear && !historicalData[selectedYear] && (
          <span className="no-data-badge">⚠️ Aucune donnée archivée</span>
        )}
      </div>

      {viewMode === 'overview' && (
        <div className="dashboard-grid-modern">
          <div className="kpi-section">
            <div className="kpi-card-modern blue">
              <div className="kpi-icon-modern">
                <Users size={24} />
              </div>
              <div className="kpi-content-modern">
                <div className="kpi-value-modern">{globalStats.totalStudents}</div>
                <div className="kpi-label-modern">Étudiants Total</div>
              </div>
            </div>
            
            <div className="kpi-card-modern green">
              <div className="kpi-icon-modern">
                <Award size={24} />
              </div>
              <div className="kpi-content-modern">
                <div className="kpi-value-modern">{globalStats.classAverage}<span className="kpi-unit">/20</span></div>
                <div className="kpi-label-modern">Moyenne Générale</div>
              </div>
            </div>

            <div className="kpi-card-modern cyan">
              <div className="kpi-icon-modern">
                <Target size={24} />
              </div>
              <div className="kpi-content-modern">
                <div className="kpi-value-modern">{globalStats.successRate}<span className="kpi-unit">%</span></div>
                <div className="kpi-label-modern">Taux de Réussite</div>
              </div>
            </div>

            <div className="kpi-card-modern orange">
              <div className="kpi-icon-modern">
                <TrendingUp size={24} />
              </div>
              <div className="kpi-content-modern">
                <div className="kpi-value-modern">{globalStats.mobileCorrections}</div>
                <div className="kpi-label-modern">Corrections Mobile</div>
              </div>
            </div>
          </div>

          <div className="card-modern large-card">
            <div className="card-header-modern">
              <h3>Répartition des Niveaux</h3>
              <span className="time-badge">Distribution {selectedYear}</span>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={globalDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {globalDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="pie-legend-modern">
              {globalDistribution.map((item, index) => (
                <div key={index} className="legend-item-flex">
                  <div className="legend-dot-modern" style={{ backgroundColor: item.color }}></div>
                  <span className="legend-text-flex">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card-modern">
            <div className="card-header-modern">
              <h3>Classement des Classes</h3>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={allClassesStats.sort((a, b) => b.average - a.average)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="classe" tick={{fontSize: 11}} />
                <YAxis tick={{fontSize: 11}} domain={[0, 20]} />
                <Tooltip />
                <Bar dataKey="average" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card-modern full-width">
            <div className="card-header-modern">
              <h3>Performance Détaillée par Matière - {selectedYear}</h3>
            </div>
            <div className="table-wrapper">
              <table className="performance-table">
                <thead>
                  <tr>
                    <th className="table-header-subject">Matière</th>
                    <th className="table-header">Étudiants</th>
                    <th className="table-header">Moyenne (avec coeff)</th>
                    <th className="table-header">Moyenne /20</th>
                    <th className="table-header">Participation</th>
                    <th className="table-header">Coefficient</th>
                  </tr>
                </thead>
                <tbody>
                  {subjectsPerformance.map((item, index) => (
                    <tr key={index} className="table-row">
                      <td className="table-cell-subject">{item.subject}</td>
                      <td className="table-cell">{item.students}</td>
                      <td className="table-cell">{item.average.toFixed(2)}/{item.maxPoints.toFixed(0)}</td>
                      <td className="table-cell">{item.averageOver20.toFixed(2)}/20</td>
                      <td className="table-cell">{item.participation}%</td>
                      <td className="table-cell">{item.coefficient}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {viewMode === 'history' && (
        <div className="history-view-modern">
          <div className="card-modern full-width">
            <div className="card-header-modern">
              <h3>Évolution Multi-Années</h3>
              <span className="time-badge">Comparaison {availableYears[0]} - {availableYears[availableYears.length - 1]}</span>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={yearlyComparison}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="year" tick={{fontSize: 12}} />
                <YAxis yAxisId="left" tick={{fontSize: 11}} />
                <YAxis yAxisId="right" orientation="right" tick={{fontSize: 11}} domain={[0, 20]} />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="students" stroke="#3b82f6" strokeWidth={2} name="Nombre d'étudiants" />
                <Line yAxisId="right" type="monotone" dataKey="average" stroke="#10b981" strokeWidth={2} name="Moyenne /20" />
                <Line yAxisId="left" type="monotone" dataKey="successRate" stroke="#f59e0b" strokeWidth={2} name="Taux de réussite %" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="history-cards-grid">
            {availableYears.map(year => {
              const currentYear = getCurrentSchoolYear();
              const yearStats = year === currentYear ? globalStats : (historicalData[year]?.stats || null);
              const hasData = year === currentYear || !!historicalData[year];
              
              return (
                <div key={year} className={`history-card ${!hasData ? 'no-data' : ''}`}>
                  <div className="history-card-header">
                    <h3>{year}</h3>
                    {year === currentYear && <span className="current-badge">En cours</span>}
                    {year !== currentYear && hasData && <span className="archived-badge-small">Archivé</span>}
                  </div>
                  
                  {hasData && yearStats ? (
                    <>
                      <div className="history-stats-grid">
                        <div className="history-stat">
                          <div className="history-stat-value">{yearStats.totalStudents}</div>
                          <div className="history-stat-label">Étudiants</div>
                        </div>
                        <div className="history-stat">
                          <div className="history-stat-value">{yearStats.classAverage}/20</div>
                          <div className="history-stat-label">Moyenne</div>
                        </div>
                        <div className="history-stat">
                          <div className="history-stat-value">{yearStats.successRate}%</div>
                          <div className="history-stat-label">Réussite</div>
                        </div>
                      </div>
                      
                      <div className="history-distribution">
                        <div className="dist-bar">
                          <div className="dist-segment excellent" style={{ width: `${(yearStats.excellent / yearStats.totalStudents * 100)}%` }}></div>
                          <div className="dist-segment good" style={{ width: `${(yearStats.good / yearStats.totalStudents * 100)}%` }}></div>
                          <div className="dist-segment satisfactory" style={{ width: `${(yearStats.satisfactory / yearStats.totalStudents * 100)}%` }}></div>
                          <div className="dist-segment unsatisfactory" style={{ width: `${(yearStats.unsatisfactory / yearStats.totalStudents * 100)}%` }}></div>
                        </div>
                        <div className="dist-legend-small">
                          <span>🟢 {yearStats.excellent}</span>
                          <span>🔵 {yearStats.good}</span>
                          <span>🟡 {yearStats.satisfactory}</span>
                          <span>🔴 {yearStats.unsatisfactory}</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="no-data-message">
                      <Archive size={32} color="#ccc" />
                      <p>Aucune donnée archivée</p>
                      <small>Les données de cette année n'ont pas été sauvegardées</small>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="card-modern full-width">
            <div className="card-header-modern">
              <h3>Comparaison des Taux de Réussite</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={yearlyComparison.filter(y => y.hasData)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="year" tick={{fontSize: 12}} />
                <YAxis tick={{fontSize: 11}} domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="successRate" fill="#10b981" radius={[8, 8, 0, 0]} name="Taux de réussite %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {viewMode === 'subjects' && (
        <div className="subjects-view-modern">
          <div className="subject-selector-section">
            <div className="card-modern">
              <div className="card-header-modern">
                <h3>Sélectionner une Matière</h3>
              </div>
              <select 
                value={selectedSubject} 
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="select-large"
              >
                <option value="">Choisir une matière...</option>
                {subjects.map(subject => (
                  <option key={subject.code} value={subject.code}>
                    {subject.name} (Coeff: {subject.coefficient})
                  </option>
                ))}
              </select>

              {selectedSubject && (
                <div className="subject-stats-grid">
                  {(() => {
                    const stats = getSubjectStats(selectedSubject);
                    return stats && (
                      <>
                        <div className="stat-box">
                          <div className="stat-value-large">{stats.average}/{stats.maxPoints.toFixed(0)}</div>
                          <div className="stat-label-small">Moyenne (avec coeff)</div>
                        </div>
                        <div className="stat-box">
                          <div className="stat-value-large">{stats.averageOver20}/20</div>
                          <div className="stat-label-small">Moyenne sur 20</div>
                        </div>
                        <div className="stat-box">
                          <div className="stat-value-large">{stats.participationRate}%</div>
                          <div className="stat-label-small">Participation</div>
                        </div>
                        <div className="stat-box">
                          <div className="stat-value-large">{stats.notesCount}</div>
                          <div className="stat-label-small">Notes</div>
                        </div>
                        <div className="stat-box">
                          <div className="stat-value-large">{stats.subject.coefficient}</div>
                          <div className="stat-label-small">Coefficient</div>
                        </div>
                        <div className="stat-box">
                          <div className="stat-value-large">{stats.maxPoints.toFixed(0)}</div>
                          <div className="stat-label-small">Note Max</div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>

          <div className="subject-charts-section">
            {selectedSubject && subjectLevelDistribution.length > 0 ? (
              <>
                <div className="card-modern">
                  <div className="card-header-modern">
                    <h3>Distribution des Notes</h3>
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={subjectLevelDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={110}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {subjectLevelDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="pie-legend-modern">
                    {subjectLevelDistribution.map((item, index) => (
                      <div key={index} className="legend-item-flex">
                        <div className="legend-dot-modern" style={{ backgroundColor: item.color }}></div>
                        <span className="legend-text-flex">{item.name}: {item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card-modern">
                  <div className="card-header-modern">
                    <h3>Analyse des Notes</h3>
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={subjectLevelDistribution}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" tick={{fontSize: 10}} />
                      <YAxis tick={{fontSize: 11}} />
                      <Tooltip />
                      <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                        {subjectLevelDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </>
            ) : (
              <div className="card-modern placeholder-card">
                <div className="placeholder-content">
                  <BookOpen size={64} color="#ccc" />
                  <h3>Sélectionnez une matière</h3>
                  <p>Choisissez une matière pour voir ses statistiques détaillées</p>
                </div>
              </div>
            )}
          </div>

          <div className="card-modern full-width-subjects">
            <div className="card-header-modern">
              <h3>Toutes les Matières - Vue d'Ensemble ({selectedYear})</h3>
            </div>
            <div className="table-wrapper">
              <table className="performance-table">
                <thead>
                  <tr>
                    <th className="table-header-subject">Matière</th>
                    <th className="table-header">Étudiants Notés</th>
                    <th className="table-header">Moyenne (avec coeff)</th>
                    <th className="table-header">Moyenne /20</th>
                    <th className="table-header">Taux Participation</th>
                    <th className="table-header">Coefficient</th>
                  </tr>
                </thead>
                <tbody>
                  {subjectsPerformance.map((item, index) => (
                    <tr key={index} className="table-row">
                      <td className="table-cell-subject">{item.subject}</td>
                      <td className="table-cell">{item.students}</td>
                      <td className="table-cell">{item.average.toFixed(2)}/{item.maxPoints.toFixed(0)}</td>
                      <td className="table-cell">{item.averageOver20.toFixed(2)}/20</td>
                      <td className="table-cell">{item.participation}%</td>
                      <td className="table-cell">{item.coefficient}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {viewMode === 'classes' && (
        <div className="classes-view-modern">
          <div className="classes-grid-modern">
            {allClassesStats.map((classe, index) => (
              <div key={classe.classe} className="class-card-modern">
                <div className="class-card-header">
                  <h3>{classe.classe}</h3>
                  <div className="rank-badge-modern">#{index + 1}</div>
                </div>

                <div className="class-stats-main">
                  <div className="stat-main">
                    <div className="stat-value-xl">{classe.average}/20</div>
                    <div className="stat-label-main">Moyenne de classe</div>
                  </div>
                  <div className="stat-main">
                    <div className="stat-value-xl">{classe.successRate}%</div>
                    <div className="stat-label-main">Taux de réussite</div>
                  </div>
                  <div className="stat-main">
                    <div className="stat-value-xl">{classe.studentCount}</div>
                    <div className="stat-label-main">Étudiants</div>
                  </div>
                </div>

                <div className="class-chart-container">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Excellent', value: classe.distribution.excellent, color: '#10b981' },
                          { name: 'Très Bien', value: classe.distribution.good, color: '#3b82f6' },
                          { name: 'Satisfaisant', value: classe.distribution.satisfactory, color: '#f59e0b' },
                          { name: 'Insuffisant', value: classe.distribution.unsatisfactory, color: '#ef4444' }
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {[
                          { color: '#10b981' },
                          { color: '#3b82f6' },
                          { color: '#f59e0b' },
                          { color: '#ef4444' }
                        ].map((entry, idx) => (
                          <Cell key={`cell-${idx}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="class-distribution-legend">
                  <div className="legend-row">
                    <span className="legend-indicator excellent"></span>
                    <span>Excellent: {classe.distribution.excellent}</span>
                  </div>
                  <div className="legend-row">
                    <span className="legend-indicator good"></span>
                    <span>Très Bien: {classe.distribution.good}</span>
                  </div>
                  <div className="legend-row">
                    <span className="legend-indicator satisfactory"></span>
                    <span>Satisfaisant: {classe.distribution.satisfactory}</span>
                  </div>
                  <div className="legend-row">
                    <span className="legend-indicator unsatisfactory"></span>
                    <span>Insuffisant: {classe.distribution.unsatisfactory}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="card-modern full-width">
            <div className="card-header-modern">
              <h3>Comparaison des Moyennes par Classe ({selectedYear})</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={allClassesStats.sort((a, b) => b.average - a.average)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="classe" tick={{fontSize: 12}} />
                <YAxis tick={{fontSize: 11}} domain={[0, 20]} />
                <Tooltip />
                <Bar dataKey="average" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="footer-note">
        <p>📚 Système de gestion avec historique multi-années • Données sauvegardées localement</p>
        {lastUpdate && isCurrentYear && (
          <span className="last-update-time">
            <Clock size={14} />
            Dernière mise à jour: {lastUpdate.toLocaleTimeString('fr-FR')}
          </span>
        )}
      </div>

      <style jsx>{`
        .dashboard-wrapper {
          background: #ffffff;
          min-height: 100vh;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        .dashboard-header-modern {
          background: white;
          border-bottom: 2px solid #e0e0e0;
          padding: 0;
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 24px 32px;
          gap: 24px;
          border-bottom: 1px solid #f0f0f0;
        }

        .title-section {
          flex: 1;
        }

        .title-section h1 {
          font-size: 22px;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0 0 10px 0;
          line-height: 1.3;
        }

        .subtitle {
          font-size: 12px;
          color: #666;
          margin: 0;
          line-height: 1.6;
          max-width: 900px;
        }

        .header-actions-modern {
          display: flex;
          gap: 12px;
          align-items: center;
          flex-wrap: wrap;
        }

        .filter-group-modern {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: white;
          border: 1px solid #d0d0d0;
          border-radius: 6px;
        }

        .select-modern {
          border: none;
          background: none;
          font-size: 13px;
          outline: none;
          cursor: pointer;
          color: #333;
          min-width: 120px;
        }

        .year-select {
          min-width: 180px;
          font-weight: 600;
          color: #0078d4;
        }

        .refresh-button-modern, .save-button-modern, .export-button-modern {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 500;
          transition: background 0.2s;
        }

        .refresh-button-modern {
          background: #0078d4;
        }

        .refresh-button-modern:hover {
          background: #005a9e;
        }

        .save-button-modern {
          background: #10b981;
        }

        .save-button-modern:hover {
          background: #059669;
        }

        .export-button-modern {
          background: #f59e0b;
        }

        .export-button-modern:hover {
          background: #d97706;
        }

        .refresh-button-modern:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .export-dropdown {
          position: relative;
          display: inline-block;
        }

        .export-dropdown-content {
          display: none;
          position: absolute;
          right: 0;
          background-color: white;
          min-width: 180px;
          box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
          z-index: 1;
          border-radius: 6px;
          overflow: hidden;
          margin-top: 4px;
        }

        .export-dropdown-content button {
          width: 100%;
          padding: 12px 16px;
          border: none;
          background: white;
          text-align: left;
          cursor: pointer;
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: background 0.2s;
        }

        .export-dropdown-content button:hover {
          background: #f5f5f5;
        }

        .export-dropdown:hover .export-dropdown-content {
          display: block;
        }

        .spinning {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .navigation-tabs {
          display: flex;
          padding: 0 32px;
          gap: 0;
          background: #fafafa;
        }

        .tab-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 14px 24px;
          background: none;
          border: none;
          border-bottom: 3px solid transparent;
          color: #666;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s;
        }

        .tab-btn.active {
          color: #0078d4;
          border-bottom-color: #0078d4;
          background: white;
        }

        .tab-btn:hover {
          color: #333;
          background: #f5f5f5;
        }

        .year-indicator {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 12px 32px;
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 14px;
        }

        .year-indicator strong {
          font-weight: 700;
          font-size: 16px;
        }

        .archived-badge, .archived-badge-small {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(255,255,255,0.2);
          padding: 4px 12px;
          border-radius: 4px;
          font-size: 11px;
        }

        .archived-badge-small {
          font-size: 10px;
          padding: 3px 8px;
        }

        .no-data-badge {
          background: rgba(239, 68, 68, 0.2);
          padding: 4px 12px;
          border-radius: 4px;
          font-size: 11px;
        }

        .current-badge {
          background: #10b981;
          color: white;
          padding: 3px 10px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
        }

        .dashboard-grid-modern {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          padding: 24px;
          background: #f5f5f5;
        }

        .kpi-section {
          grid-column: span 3;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }

        .kpi-card-modern {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          background: white;
          border-radius: 8px;
          border: 1px solid #e0e0e0;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }

        .kpi-card-modern.blue { border-left: 4px solid #3b82f6; }
        .kpi-card-modern.green { border-left: 4px solid #10b981; }
        .kpi-card-modern.cyan { border-left: 4px solid #06b6d4; }
        .kpi-card-modern.orange { border-left: 4px solid #f59e0b; }

        .kpi-icon-modern {
          width: 52px;
          height: 52px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .kpi-card-modern.blue .kpi-icon-modern { background: #dbeafe; color: #3b82f6; }
        .kpi-card-modern.green .kpi-icon-modern { background: #d1fae5; color: #10b981; }
        .kpi-card-modern.cyan .kpi-icon-modern { background: #cffafe; color: #06b6d4; }
        .kpi-card-modern.orange .kpi-icon-modern { background: #fed7aa; color: #f59e0b; }

        .kpi-content-modern {
          flex: 1;
        }

        .kpi-value-modern {
          font-size: 26px;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 4px;
        }

        .kpi-unit {
          font-size: 14px;
          color: #666;
          font-weight: 500;
          margin-left: 2px;
        }

        .kpi-label-modern {
          font-size: 13px;
          color: #666;
        }

        .card-modern {
          background: white;
          border-radius: 8px;
          border: 1px solid #e0e0e0;
          overflow: hidden;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }

        .large-card {
          grid-column: span 2;
        }

        .full-width {
          grid-column: span 3;
        }

        .card-header-modern {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid #f0f0f0;
        }

        .card-header-modern h3 {
          font-size: 15px;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0;
        }

        .time-badge {
          font-size: 11px;
          color: #666;
          background: #f5f5f5;
          padding: 4px 10px;
          border-radius: 4px;
        }

        .pie-legend-modern {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          padding: 16px 20px;
        }

        .legend-item-flex {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .legend-dot-modern {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }

        .legend-text-flex {
          font-size: 11px;
          color: #333;
        }

        .table-wrapper {
          overflow-x: auto;
          padding: 20px;
        }

        .performance-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
        }

        .table-header-subject {
          background: #ff6b35;
          color: white;
          padding: 12px;
          text-align: left;
          font-weight: 600;
          border: 1px solid #ff6b35;
        }

        .table-header {
          background: #4a90e2;
          color: white;
          padding: 12px;
          text-align: center;
          font-weight: 600;
          border: 1px solid #4a90e2;
        }

        .table-row {
          border-bottom: 1px solid #e0e0e0;
        }

        .table-row:hover {
          background: #f9f9f9;
        }

        .table-cell-subject {
          background: #ff8c5a;
          color: white;
          padding: 12px;
          text-align: left;
          font-weight: 500;
          border: 1px solid #ff8c5a;
        }

        .table-cell {
          padding: 12px;
          text-align: center;
          border: 1px solid #e0e0e0;
          color: #333;
        }

        .history-view-modern {
          padding: 24px;
          background: #f5f5f5;
        }

        .history-cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
          margin: 20px 0;
        }

        .history-card {
          background: white;
          border-radius: 8px;
          border: 1px solid #e0e0e0;
          overflow: hidden;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }

        .history-card.no-data {
          opacity: 0.6;
          border-style: dashed;
        }

        .history-card-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 16px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .history-card-header h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
        }

        .history-stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          padding: 20px;
        }

        .history-stat {
          text-align: center;
        }

        .history-stat-value {
          font-size: 24px;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 4px;
        }

        .history-stat-label {
          font-size: 11px;
          color: #666;
        }

        .history-distribution {
          padding: 0 20px 20px 20px;
        }

        .dist-bar {
          height: 30px;
          display: flex;
          border-radius: 6px;
          overflow: hidden;
          margin-bottom: 12px;
        }

        .dist-segment {
          transition: width 0.3s ease;
        }

        .dist-segment.excellent { background: #10b981; }
        .dist-segment.good { background: #3b82f6; }
        .dist-segment.satisfactory { background: #f59e0b; }
        .dist-segment.unsatisfactory { background: #ef4444; }

        .dist-legend-small {
          display: flex;
          justify-content: space-around;
          font-size: 11px;
          color: #666;
        }

        .no-data-message {
          text-align: center;
          padding: 40px 20px;
          color: #999;
        }

        .no-data-message h3 {
          margin: 20px 0 10px 0;
          color: #666;
          font-size: 16px;
        }

        .no-data-message p {
          margin: 0 0 8px 0;
          font-size: 13px;
        }

        .no-data-message small {
          font-size: 11px;
          color: #aaa;
        }

        .subjects-view-modern {
          padding: 24px;
          background: #f5f5f5;
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 20px;
        }

        .subject-selector-section {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .select-large {
          width: 100%;
          padding: 12px;
          border: 1px solid #d0d0d0;
          border-radius: 6px;
          background: white;
          font-size: 14px;
          margin-bottom: 16px;
          cursor: pointer;
        }

        .subject-stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-top: 16px;
        }

        .stat-box {
          background: #f8f9fa;
          padding: 16px;
          border-radius: 6px;
          text-align: center;
          border: 1px solid #e9ecef;
        }

        .stat-value-large {
          font-size: 22px;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 6px;
        }

        .stat-label-small {
          font-size: 11px;
          color: #666;
        }

        .subject-charts-section {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }

        .placeholder-card {
          grid-column: span 2;
        }

        .placeholder-content {
          text-align: center;
          padding: 80px 20px;
          color: #999;
        }

        .placeholder-content h3 {
          margin: 20px 0 10px 0;
          color: #666;
        }

        .placeholder-content p {
          margin: 0;
          font-size: 13px;
        }

        .full-width-subjects {
          grid-column: span 3;
        }

        .classes-view-modern {
          padding: 24px;
          background: #f5f5f5;
        }

        .classes-grid-modern {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 20px;
          margin-bottom: 20px;
        }

        .class-card-modern {
          background: white;
          border-radius: 8px;
          border: 1px solid #e0e0e0;
          overflow: hidden;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }

        .class-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .class-card-header h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
        }

        .rank-badge-modern {
          background: rgba(255,255,255,0.3);
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }

        .class-stats-main {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          padding: 20px;
          background: #f8f9fa;
        }

        .stat-main {
          text-align: center;
        }

        .stat-value-xl {
          font-size: 20px;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 4px;
        }

        .stat-label-main {
          font-size: 11px;
          color: #666;
        }

        .class-chart-container {
          padding: 10px 20px;
        }

        .class-distribution-legend {
          padding: 16px 20px;
          background: #f8f9fa;
          border-top: 1px solid #e9ecef;
        }

        .legend-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 8px;
          font-size: 12px;
          color: #333;
        }

        .legend-indicator {
          width: 14px;
          height: 14px;
          border-radius: 3px;
        }

        .legend-indicator.excellent { background: #10b981; }
        .legend-indicator.good { background: #3b82f6; }
        .legend-indicator.satisfactory { background: #f59e0b; }
        .legend-indicator.unsatisfactory { background: #ef4444; }

        .footer-note {
          background: white;
          padding: 16px 32px;
          border-top: 1px solid #e0e0e0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .footer-note p {
          font-size: 11px;
          color: #666;
          margin: 0;
          font-style: italic;
        }

        .last-update-time {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          color: #0078d4;
          font-weight: 500;
        }

        @media (max-width: 1400px) {
          .dashboard-grid-modern {
            grid-template-columns: repeat(2, 1fr);
          }

          .kpi-section {
            grid-column: span 2;
            grid-template-columns: repeat(2, 1fr);
          }

          .full-width, .large-card {
            grid-column: span 2;
          }

          .subjects-view-modern {
            grid-template-columns: 1fr;
          }

          .subject-charts-section {
            grid-column: span 1;
          }

          .full-width-subjects {
            grid-column: span 1;
          }
        }

        @media (max-width: 768px) {
          .dashboard-grid-modern {
            grid-template-columns: 1fr;
          }

          .kpi-section {
            grid-column: span 1;
            grid-template-columns: 1fr;
          }

          .full-width, .large-card {
            grid-column: span 1;
          }

          .header-content {
            flex-direction: column;
          }

          .header-actions-modern {
            width: 100%;
            justify-content: flex-start;
          }

          .title-section h1 {
            font-size: 18px;
          }

          .classes-grid-modern {
            grid-template-columns: 1fr;
          }

          .subject-charts-section {
            grid-template-columns: 1fr;
          }

          .placeholder-card {
            grid-column: span 1;
          }

          .subject-stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .navigation-tabs {
            overflow-x: auto;
            padding: 0 16px;
          }

          .tab-btn {
            padding: 12px 16px;
            font-size: 12px;
          }

          .export-dropdown-content {
            left: 0;
            right: auto;
          }
        }
      `}</style>
    </div>
  );
};

export default SchoolStatisticsWithHistory;