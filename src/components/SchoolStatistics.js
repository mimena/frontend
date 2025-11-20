import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, Clock, Users, BookOpen, Target, TrendingUp, Award, 
  BarChart3, Filter, Calendar, Archive, Download 
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

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

  const getCurrentSchoolYear = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    
    if (month >= 8) {
      return `${year}-${year + 1}`;
    } else {
      return `${year - 1}-${year}`;
    }
  };

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
    
    for (let i = 4; i >= 0; i--) {
      const startYear = parseInt(currentYear.split('-')[0]) - i;
      years.push(`${startYear}-${startYear + 1}`);
    }
    
    setAvailableYears(years);
    if (!propSelectedYear) {
      setSelectedYear(years[years.length - 1]);
    }
  }, [propAvailableYears, propSelectedYear]);

  useEffect(() => {
    if (selectedYear) {
      loadMobileResults();
      loadHistoricalData();
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

  const getYearData = () => {
    if (!selectedYear) return { students: [], mobileResults: [] };
    
    const currentYear = getCurrentSchoolYear();
    if (selectedYear === currentYear) {
      return { students, mobileResults };
    }
    
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
        mobileCorrections: 0,
        studentsWithNotes: 0
      };
    }

    let totalAverage = 0;
    let studentsWithNotes = 0;
    const averages = [];

    filteredStudents.forEach(student => {
      const traditionalNotes = student.notes || {};
      const studentMobileResults = yearResults.filter(
        result => result.student_matricule === student.matricule
      );
      
      const allNotes = { ...traditionalNotes };
      studentMobileResults.forEach(result => {
        allNotes[result.subject_code] = result.score;
      });

      let studentTotalPoints = 0;
      let studentTotalCoeff = 0;
      let hasNotes = false;

      subjects.forEach(subject => {
        const note = allNotes[subject.code];
        if (note !== undefined && note !== null) {
          studentTotalPoints += note * subject.coefficient;
          studentTotalCoeff += subject.coefficient;
          hasNotes = true;
        }
      });

      if (hasNotes && studentTotalCoeff > 0) {
        const studentAverage = studentTotalPoints / studentTotalCoeff;
        averages.push(studentAverage);
        totalAverage += studentAverage;
        studentsWithNotes++;
      }
    });

    if (studentsWithNotes === 0) {
      return {
        totalStudents: filteredStudents.length,
        classAverage: 0,
        excellent: 0,
        good: 0,
        satisfactory: 0,
        unsatisfactory: 0,
        successRate: 0,
        mobileCorrections: yearResults.length,
        studentsWithNotes: 0
      };
    }

    const classAverage = totalAverage / studentsWithNotes;
    const excellent = averages.filter(avg => avg >= 16).length;
    const good = averages.filter(avg => avg >= 14 && avg < 16).length;
    const satisfactory = averages.filter(avg => avg >= 10 && avg < 14).length;
    const unsatisfactory = averages.filter(avg => avg < 10).length;
    const successRate = ((studentsWithNotes - unsatisfactory) / studentsWithNotes * 100);

    const mobileCorrectionsCount = yearResults.filter(result =>
      filteredStudents.some(student => student.matricule === result.student_matricule)
    ).length;

    return {
      totalStudents: filteredStudents.length,
      classAverage: classAverage.toFixed(2),
      excellent,
      good,
      satisfactory,
      unsatisfactory,
      successRate: successRate.toFixed(1),
      mobileCorrections: mobileCorrectionsCount,
      studentsWithNotes
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
    }).filter(item => item.students > 0);
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
    const participationRate = (finalNotes.length / filteredStudents.length * 100);

    return {
      subject,
      average: average.toFixed(2),
      averageOver20: averageOver20.toFixed(2),
      participationRate: participationRate.toFixed(1),
      notesCount: finalNotes.length,
      finalNotes,
      maxPoints
    };
  };

  // FONCTION CSV CORRIGÉE
  const exportToCSV = () => {
    try {
      const stats = calculateGlobalStats();
      const subjectsPerformance = getSubjectsPerformance();
      
      let csvContent = "Données Statistiques Scolaires - Année " + selectedYear + "\n";
      csvContent += "Exporté le: " + new Date().toLocaleDateString('fr-FR') + "\n\n";
      
      csvContent += "STATISTIQUES GLOBALES\n";
      csvContent += "Nombre d'étudiants," + stats.totalStudents + "\n";
      csvContent += "Étudiants notés," + stats.studentsWithNotes + "\n";
      csvContent += "Moyenne générale," + stats.classAverage + "/20\n";
      csvContent += "Taux de réussite," + stats.successRate + "%\n";
      csvContent += "Corrections mobiles," + stats.mobileCorrections + "\n\n";
      
      csvContent += "PERFORMANCE PAR MATIERE\n";
      csvContent += "Matière,Étudiants notés,Moyenne (avec coeff),Moyenne /20,Taux participation,Coefficient\n";
      
      subjectsPerformance.forEach(item => {
        csvContent += `"${item.subject}",${item.students},${item.average.toFixed(2)}/${item.maxPoints.toFixed(0)},${item.averageOver20.toFixed(2)}/20,${item.participation}%,${item.coefficient}\n`;
      });
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `statistiques_${selectedYear.replace('/', '-')}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Erreur export CSV:', error);
      alert('Erreur lors de l\'export CSV');
    }
  };

  // FONCTION PDF CORRIGÉE
  const exportToPDF = () => {
    try {
      const stats = calculateGlobalStats();
      const subjectsPerformance = getSubjectsPerformance();
      
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Statistiques Scolaires</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px;
              color: #333;
            }
            h1 { 
              text-align: center; 
              color: #2c3e50;
              margin-bottom: 10px;
            }
            h2 { 
              color: #34495e; 
              border-bottom: 2px solid #bdc3c7; 
              padding-bottom: 5px;
              margin-top: 25px;
            }
            .stats-grid { 
              display: grid; 
              grid-template-columns: repeat(2, 1fr); 
              gap: 15px; 
              margin: 20px 0; 
            }
            .stat-card { 
              background: #ecf0f1; 
              padding: 15px; 
              border-radius: 8px; 
              border-left: 4px solid #3498db;
              text-align: center;
            }
            .stat-value { 
              font-size: 24px; 
              font-weight: bold; 
              color: #2c3e50; 
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin: 20px 0; 
              font-size: 12px;
            }
            th, td { 
              border: 1px solid #bdc3c7; 
              padding: 8px; 
              text-align: left; 
            }
            th { 
              background-color: #34495e; 
              color: white;
              font-weight: bold;
            }
            tr:nth-child(even) {
              background-color: #f8f9fa;
            }
            .footer { 
              text-align: center; 
              margin-top: 30px; 
              color: #7f8c8d; 
              font-size: 11px;
              border-top: 1px solid #bdc3c7;
              padding-top: 10px;
            }
            .header-info {
              text-align: center;
              margin-bottom: 20px;
              color: #7f8c8d;
            }
            @media print {
              body { margin: 15px; }
              .no-print { display: none; }
              @page { margin: 2cm; }
            }
          </style>
        </head>
        <body>
          <h1>📊 Tableau de Bord des Performances Académiques</h1>
          <div class="header-info">
            <strong>Année Scolaire:</strong> ${selectedYear} | 
            <strong>Exporté le:</strong> ${new Date().toLocaleDateString('fr-FR')}
          </div>
          
          <h2>Statistiques Globales</h2>
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
            <tr><th>Niveau</th><th>Nombre d'étudiants</th><th>Pourcentage</th></tr>
            <tr><td>Excellent (≥16)</td><td>${stats.excellent}</td><td>${stats.totalStudents > 0 ? ((stats.excellent / stats.totalStudents * 100).toFixed(1) + '%') : '0%'}</td></tr>
            <tr><td>Très Bien (14-16)</td><td>${stats.good}</td><td>${stats.totalStudents > 0 ? ((stats.good / stats.totalStudents * 100).toFixed(1) + '%') : '0%'}</td></tr>
            <tr><td>Satisfaisant (10-14)</td><td>${stats.satisfactory}</td><td>${stats.totalStudents > 0 ? ((stats.satisfactory / stats.totalStudents * 100).toFixed(1) + '%') : '0%'}</td></tr>
            <tr><td>Insuffisant (<10)</td><td>${stats.unsatisfactory}</td><td>${stats.totalStudents > 0 ? ((stats.unsatisfactory / stats.totalStudents * 100).toFixed(1) + '%') : '0%'}</td></tr>
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
            <p>Système de gestion avec historique multi-années • Généré automatiquement</p>
          </div>
          
          <div class="no-print" style="text-align: center; margin-top: 20px;">
            <button onclick="window.print()" style="padding: 10px 20px; background: #3498db; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 14px;">
              🖨️ Imprimer le PDF
            </button>
            <button onclick="window.close()" style="padding: 10px 20px; background: #e74c3c; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 14px; margin-left: 10px;">
              ❌ Fermer
            </button>
          </div>

          <script>
            // Focus sur le bouton d'impression
            window.onload = function() {
              const printBtn = document.querySelector('button[onclick="window.print()"]');
              if (printBtn) printBtn.focus();
            };
          </script>
        </body>
        </html>
      `;
      
      const printWindow = window.open('', '_blank', 'width=1000,height=700');
      if (!printWindow) {
        alert('Veuillez autoriser les pop-ups pour l\'export PDF');
        return;
      }
      
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
    } catch (error) {
      console.error('Erreur export PDF:', error);
      alert('Erreur lors de l\'export PDF');
    }
  };

  const globalStats = calculateGlobalStats();
  const subjectsPerformance = getSubjectsPerformance();
  const globalDistribution = [
    { name: 'Excellent', value: globalStats.excellent, color: '#10b981' },
    { name: 'Très Bien', value: globalStats.good, color: '#3b82f6' },
    { name: 'Satisfaisant', value: globalStats.satisfactory, color: '#f59e0b' },
    { name: 'Insuffisant', value: globalStats.unsatisfactory, color: '#ef4444' }
  ];
  
  const yearData = getYearData();
  const classes = [...new Set(yearData.students.map(s => s.classe))].filter(Boolean);
  const currentYear = getCurrentSchoolYear();
  const isCurrentYear = selectedYear === currentYear;

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-header">
        <div className="header-main">
          <div className="header-title">
            <h1>Tableau de Bord des Performances Académiques</h1>
            <p className="subtitle">
              Analyse complète des statistiques scolaires avec historique multi-années
            </p>
          </div>
          
          <div className="header-controls">
            <div className="control-group">
              <div className="filter-control">
                <Filter size={16} />
                <select 
                  value={selectedClass} 
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="select-control"
                >
                  <option value="">Toutes les classes</option>
                  {classes.map(classe => (
                    <option key={classe} value={classe}>{classe}</option>
                  ))}
                </select>
              </div>

              <div className="year-selector">
                <Calendar size={16} />
                <select 
                  value={selectedYear} 
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="select-control year-select"
                >
                  {availableYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="action-buttons">
              {isCurrentYear && (
                <>
                  <button 
                    className="btn btn-secondary"
                    onClick={loadMobileResults}
                    disabled={loading}
                  >
                    <RefreshCw size={16} className={loading ? 'spinning' : ''} />
                    Actualiser
                  </button>
                  
                  <button 
                    className="btn btn-primary"
                    onClick={saveCurrentYearData}
                  >
                    <Archive size={16} />
                    Archiver
                  </button>
                </>
              )}

              <div className="export-dropdown">
                <button className="btn btn-accent">
                  <Download size={16} />
                  Exporter
                </button>
                <div className="export-options">
                  <button onClick={exportToCSV}>📊 Exporter en CSV</button>
                  <button onClick={exportToPDF}>📄 Exporter en PDF</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="view-navigation">
          <button 
            className={`nav-btn ${viewMode === 'overview' ? 'active' : ''}`}
            onClick={() => setViewMode('overview')}
          >
            <BarChart3 size={16} />
            Vue d'Ensemble
          </button>
          <button 
            className={`nav-btn ${viewMode === 'subjects' ? 'active' : ''}`}
            onClick={() => setViewMode('subjects')}
          >
            <BookOpen size={16} />
            Par Matière
          </button>
        </div>
      </div>

      <div className="content-area">
        <div className="overview-grid">
          <div className="stats-cards">
            <div className="stat-card">
              <div className="stat-icon">
                <Users size={20} />
              </div>
              <div className="stat-content">
                <div className="stat-value">{globalStats.totalStudents}</div>
                <div className="stat-label">Étudiants Total</div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">
                <Award size={20} />
              </div>
              <div className="stat-content">
                <div className="stat-value">{globalStats.classAverage}<span className="unit">/20</span></div>
                <div className="stat-label">Moyenne Générale</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <Target size={20} />
              </div>
              <div className="stat-content">
                <div className="stat-value">{globalStats.successRate}<span className="unit">%</span></div>
                <div className="stat-label">Taux de Réussite</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <TrendingUp size={20} />
              </div>
              <div className="stat-content">
                <div className="stat-value">{globalStats.mobileCorrections}</div>
                <div className="stat-label">Corrections Mobile</div>
              </div>
            </div>
          </div>

          <div className="chart-section">
            <div className="chart-card">
              <div className="chart-header">
                <h3>Répartition des Niveaux</h3>
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
              <div className="chart-legend">
                {globalDistribution.map((item, index) => (
                  <div key={index} className="legend-item">
                    <div className="legend-color" style={{ backgroundColor: item.color }}></div>
                    <span className="legend-text">{item.name}: {item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="table-section">
            <div className="table-card">
              <div className="table-header">
                <h3>Performance Détaillée par Matière</h3>
              </div>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Matière</th>
                      <th>Étudiants</th>
                      <th>Moyenne (avec coeff)</th>
                      <th>Moyenne /20</th>
                      <th>Participation</th>
                      <th>Coefficient</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjectsPerformance.map((item, index) => (
                      <tr key={index}>
                        <td className="subject-cell">{item.subject}</td>
                        <td>{item.students}</td>
                        <td>{item.average.toFixed(2)}/{item.maxPoints.toFixed(0)}</td>
                        <td>{item.averageOver20.toFixed(2)}/20</td>
                        <td>{item.participation}%</td>
                        <td>{item.coefficient}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="footer">
        <p>Système de gestion avec historique multi-années</p>
        {lastUpdate && isCurrentYear && (
          <span className="update-time">
            <Clock size={14} />
            Dernière mise à jour: {lastUpdate.toLocaleTimeString('fr-FR')}
          </span>
        )}
      </div>

      <style jsx>{`
        .dashboard-wrapper {
          background: #f8f9fa;
          min-height: 100vh;
          font-family: 'Segoe UI', system-ui, sans-serif;
        }
        .dashboard-header {
          background: white;
          border-bottom: 1px solid #e9ecef;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .header-main {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 20px 24px;
          gap: 20px;
        }
        .header-title h1 {
          font-size: 20px;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0 0 4px 0;
        }
        .subtitle {
          font-size: 12px;
          color: #6c757d;
          margin: 0;
        }
        .header-controls {
          display: flex;
          flex-direction: column;
          gap: 12px;
          min-width: 300px;
        }
        .control-group {
          display: flex;
          gap: 12px;
        }
        .filter-control, .year-selector {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: white;
          border: 1px solid #dee2e6;
          border-radius: 6px;
          flex: 1;
        }
        .select-control {
          border: none;
          background: none;
          font-size: 13px;
          outline: none;
          cursor: pointer;
          color: #495057;
          width: 100%;
        }
        .action-buttons {
          display: flex;
          gap: 8px;
        }
        .btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 500;
          transition: all 0.2s;
        }
        .btn-secondary {
          background: #6c757d;
          color: white;
        }
        .btn-primary {
          background: #007bff;
          color: white;
        }
        .btn-accent {
          background: #17a2b8;
          color: white;
        }
        .btn:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
        .export-dropdown {
          position: relative;
        }
        .export-options {
          display: none;
          position: absolute;
          right: 0;
          background: white;
          min-width: 160px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          border-radius: 6px;
          overflow: hidden;
          z-index: 1000;
          margin-top: 4px;
        }
        .export-options button {
          width: 100%;
          padding: 12px 16px;
          border: none;
          background: white;
          text-align: left;
          cursor: pointer;
          font-size: 13px;
        }
        .export-options button:hover {
          background: #f8f9fa;
        }
        .export-dropdown:hover .export-options {
          display: block;
        }
        .view-navigation {
          display: flex;
          padding: 0 24px;
          background: #f8f9fa;
          border-top: 1px solid #e9ecef;
        }
        .nav-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          background: none;
          border: none;
          border-bottom: 2px solid transparent;
          color: #6c757d;
          cursor: pointer;
          font-size: 13px;
          font-weight: 500;
        }
        .nav-btn.active {
          color: #007bff;
          border-bottom-color: #007bff;
          background: white;
        }
        .content-area {
          padding: 24px;
        }
        .overview-grid {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .stats-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }
        .stat-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          background: white;
          border-radius: 8px;
          border: 1px solid #e9ecef;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .stat-icon {
          width: 44px;
          height: 44px;
          border-radius: 8px;
          background: #e9ecef;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #495057;
        }
        .stat-content {
          flex: 1;
        }
        .stat-value {
          font-size: 24px;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 4px;
        }
        .unit {
          font-size: 14px;
          color: #6c757d;
          font-weight: 500;
          margin-left: 2px;
        }
        .stat-label {
          font-size: 12px;
          color: #6c757d;
        }
        .chart-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        .chart-card {
          background: white;
          border-radius: 8px;
          border: 1px solid #e9ecef;
          padding: 20px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .chart-header {
          margin-bottom: 16px;
        }
        .chart-header h3 {
          font-size: 14px;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0;
        }
        .chart-legend {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-top: 16px;
        }
        .legend-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .legend-color {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }
        .legend-text {
          font-size: 11px;
          color: #495057;
        }
        .table-section {
          margin-top: 20px;
        }
        .table-card {
          background: white;
          border-radius: 8px;
          border: 1px solid #e9ecef;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .table-header {
          padding: 16px 20px;
          border-bottom: 1px solid #e9ecef;
        }
        .table-header h3 {
          font-size: 14px;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0;
        }
        .table-container {
          overflow-x: auto;
        }
        .data-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
        }
        .data-table th {
          background: #f8f9fa;
          padding: 12px;
          text-align: left;
          font-weight: 600;
          color: #495057;
          border-bottom: 1px solid #e9ecef;
        }
        .data-table td {
          padding: 12px;
          border-bottom: 1px solid #e9ecef;
          color: #495057;
        }
        .subject-cell {
          font-weight: 500;
          color: #1a1a1a;
        }
        .footer {
          background: white;
          padding: 16px 24px;
          border-top: 1px solid #e9ecef;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .footer p {
          font-size: 11px;
          color: #6c757d;
          margin: 0;
        }
        .update-time {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          color: #6c757d;
        }
        .spinning {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @media (max-width: 768px) {
          .header-main {
            flex-direction: column;
          }
          .header-controls {
            width: 100%;
          }
          .control-group {
            flex-direction: column;
          }
          .action-buttons {
            flex-wrap: wrap;
          }
          .chart-section {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default SchoolStatisticsWithHistory;