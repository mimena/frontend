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
    const month = now.getMonth();
    
    if (month >= 8) {
      return `${year}-${year + 1}`;
    } else {
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

  // CORRECTION : Calcul simplifié et plus précis
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

    let totalAverage = 0;
    let studentsWithNotes = 0;
    const averages = [];

    filteredStudents.forEach(student => {
      const traditionalNotes = student.notes || {};
      const studentMobileResults = yearResults.filter(
        result => result.student_matricule === student.matricule
      );
      
      // Fusion des notes
      const allNotes = { ...traditionalNotes };
      studentMobileResults.forEach(result => {
        allNotes[result.subject_code] = result.score;
      });

      // Calcul moyenne étudiant
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
        mobileCorrections: yearResults.length
      };
    }

    const classAverage = totalAverage / studentsWithNotes;
    
    // Répartition par niveau
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

  const getYearlyComparison = () => {
    return availableYears.map(year => {
      let yearStats;
      
      const currentYear = getCurrentSchoolYear();
      if (year === currentYear) {
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
      
      // Priorité aux notes mobiles
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

  const getAllClassesStats = () => {
    const yearData = getYearData();
    const yearStudents = yearData.students;
    const yearResults = yearData.mobileResults;

    const classes = [...new Set(yearStudents.map(s => s.classe))].filter(Boolean);
    
    return classes.map(classe => {
      const classStudents = yearStudents.filter(s => s.classe === classe);
      
      let totalAverage = 0;
      let studentsWithNotes = 0;
      const averages = [];

      classStudents.forEach(student => {
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

      const classAverage = studentsWithNotes > 0 ? totalAverage / studentsWithNotes : 0;
      const successRate = studentsWithNotes > 0 ? (averages.filter(avg => avg >= 10).length / studentsWithNotes * 100) : 0;

      const distribution = {
        excellent: averages.filter(avg => avg >= 16).length,
        good: averages.filter(avg => avg >= 14 && avg < 16).length,
        satisfactory: averages.filter(avg => avg >= 10 && avg < 14).length,
        unsatisfactory: averages.filter(avg => avg < 10).length
      };

      return {
        classe,
        studentCount: classStudents.length,
        studentsWithNotes,
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

  // CORRECTION : Fonction d'export CSV qui fonctionne
  const exportToCSV = () => {
    try {
      const stats = calculateGlobalStats();
      const subjectsPerformance = getSubjectsPerformance();
      const allClassesStats = getAllClassesStats();
      
      let csvContent = "Données Statistiques Scolaires - Année " + selectedYear + "\n";
      csvContent += "Exporté le: " + new Date().toLocaleDateString('fr-FR') + "\n\n";
      
      csvContent += "STATISTIQUES GLOBALES\n";
      csvContent += "Nombre d'étudiants," + stats.totalStudents + "\n";
      csvContent += "Étudiants notés," + stats.studentsWithNotes + "\n";
      csvContent += "Moyenne générale," + stats.classAverage + "/20\n";
      csvContent += "Taux de réussite," + stats.successRate + "%\n";
      csvContent += "Corrections mobiles," + stats.mobileCorrections + "\n";
      csvContent += "Excellent (≥16)," + stats.excellent + "\n";
      csvContent += "Très Bien (14-16)," + stats.good + "\n";
      csvContent += "Satisfaisant (10-14)," + stats.satisfactory + "\n";
      csvContent += "Insuffisant (<10)," + stats.unsatisfactory + "\n\n";
      
      csvContent += "PERFORMANCE PAR MATIERE\n";
      csvContent += "Matière,Étudiants notés,Moyenne (avec coeff),Moyenne /20,Taux participation,Coefficient\n";
      
      subjectsPerformance.forEach(item => {
        csvContent += `"${item.subject}",${item.students},${item.average.toFixed(2)}/${item.maxPoints.toFixed(0)},${item.averageOver20.toFixed(2)}/20,${item.participation}%,${item.coefficient}\n`;
      });
      
      csvContent += "\n";
      
      csvContent += "STATISTIQUES PAR CLASSE\n";
      csvContent += "Classe,Nombre d'étudiants,Étudiants notés,Moyenne,Taux de réussite,Excellent,Très Bien,Satisfaisant,Insuffisant\n";
      
      allClassesStats.forEach(classe => {
        csvContent += `"${classe.classe}",${classe.studentCount},${classe.studentsWithNotes},${classe.average}/20,${classe.successRate}%,${classe.distribution.excellent},${classe.distribution.good},${classe.distribution.satisfactory},${classe.distribution.unsatisfactory}\n`;
      });
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `statistiques_scolaires_${selectedYear.replace('/', '-')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur export CSV:', error);
      alert('Erreur lors de l\'export CSV: ' + error.message);
    }
  };

  // CORRECTION : Fonction d'export PDF qui fonctionne
  const exportToPDF = () => {
    try {
      const stats = calculateGlobalStats();
      const subjectsPerformance = getSubjectsPerformance();
      
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert('Veuillez autoriser les pop-ups pour l\'export PDF');
        return;
      }
      
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
            @media print {
              body { margin: 10px; }
              .no-print { display: none; }
            }
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
          
          <button class="no-print" onclick="window.print()" style="position: fixed; top: 20px; right: 20px; padding: 10px 20px; background: #0078d4; color: white; border: none; border-radius: 5px; cursor: pointer;">
            Imprimer
          </button>
        </body>
        </html>
      `;
      
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
    } catch (error) {
      console.error('Erreur export PDF:', error);
      alert('Erreur lors de l\'export PDF: ' + error.message);
    }
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
            className={`nav-btn ${viewMode === 'history' ? 'active' : ''}`}
            onClick={() => setViewMode('history')}
          >
            <Calendar size={16} />
            Historique
          </button>
          <button 
            className={`nav-btn ${viewMode === 'subjects' ? 'active' : ''}`}
            onClick={() => setViewMode('subjects')}
          >
            <BookOpen size={16} />
            Par Matière
          </button>
          <button 
            className={`nav-btn ${viewMode === 'classes' ? 'active' : ''}`}
            onClick={() => setViewMode('classes')}
          >
            <Users size={16} />
            Par Classe
          </button>
        </div>
      </div>

      {/* Le reste du contenu reste identique mais avec les données corrigées */}
      <div className="content-area">
        {viewMode === 'overview' && (
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

            {/* Les autres sections restent identiques */}
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

              <div className="chart-card">
                <div className="chart-header">
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
        )}

        {/* Les autres vues (history, subjects, classes) restent identiques */}
        {viewMode === 'history' && (
          <div className="history-view">
            <div className="chart-card full-width">
              <div className="chart-header">
                <h3>Évolution Multi-Années</h3>
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

            <div className="history-cards">
              {availableYears.map(year => {
                const currentYear = getCurrentSchoolYear();
                const yearStats = year === currentYear ? globalStats : (historicalData[year]?.stats || null);
                const hasData = year === currentYear || !!historicalData[year];
                
                return (
                  <div key={year} className={`history-card ${!hasData ? 'no-data' : ''}`}>
                    <div className="history-card-header">
                      <h3>{year}</h3>
                      {year === currentYear && <span className="current-badge">En cours</span>}
                      {year !== currentYear && hasData && <span className="archived-badge">Archivé</span>}
                    </div>
                    
                    {hasData && yearStats ? (
                      <>
                        <div className="history-stats">
                          <div className="history-stat">
                            <div className="history-value">{yearStats.totalStudents}</div>
                            <div className="history-label">Étudiants</div>
                          </div>
                          <div className="history-stat">
                            <div className="history-value">{yearStats.classAverage}/20</div>
                            <div className="history-label">Moyenne</div>
                          </div>
                          <div className="history-stat">
                            <div className="history-value">{yearStats.successRate}%</div>
                            <div className="history-label">Réussite</div>
                          </div>
                        </div>
                        
                        <div className="distribution-bar">
                          <div className="bar-segment excellent" style={{ width: `${(yearStats.excellent / yearStats.totalStudents * 100)}%` }}></div>
                          <div className="bar-segment good" style={{ width: `${(yearStats.good / yearStats.totalStudents * 100)}%` }}></div>
                          <div className="bar-segment satisfactory" style={{ width: `${(yearStats.satisfactory / yearStats.totalStudents * 100)}%` }}></div>
                          <div className="bar-segment unsatisfactory" style={{ width: `${(yearStats.unsatisfactory / yearStats.totalStudents * 100)}%` }}></div>
                        </div>
                        <div className="distribution-legend">
                          <span>🟢 {yearStats.excellent}</span>
                          <span>🔵 {yearStats.good}</span>
                          <span>🟡 {yearStats.satisfactory}</span>
                          <span>🔴 {yearStats.unsatisfactory}</span>
                        </div>
                      </>
                    ) : (
                      <div className="no-data-content">
                        <Archive size={32} color="#ccc" />
                        <p>Aucune donnée archivée</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {viewMode === 'subjects' && (
          <div className="subjects-view">
            <div className="subject-controls">
              <div className="control-card">
                <h3>Sélectionner une Matière</h3>
                <select 
                  value={selectedSubject} 
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="subject-select"
                >
                  <option value="">Choisir une matière...</option>
                  {subjects.map(subject => (
                    <option key={subject.code} value={subject.code}>
                      {subject.name} (Coeff: {subject.coefficient})
                    </option>
                  ))}
                </select>

                {selectedSubject && (
                  <div className="subject-stats">
                    {(() => {
                      const stats = getSubjectStats(selectedSubject);
                      return stats && (
                        <>
                          <div className="subject-stat">
                            <div className="subject-value">{stats.average}/{stats.maxPoints.toFixed(0)}</div>
                            <div className="subject-label">Moyenne (avec coeff)</div>
                          </div>
                          <div className="subject-stat">
                            <div className="subject-value">{stats.averageOver20}/20</div>
                            <div className="subject-label">Moyenne sur 20</div>
                          </div>
                          <div className="subject-stat">
                            <div className="subject-value">{stats.participationRate}%</div>
                            <div className="subject-label">Participation</div>
                          </div>
                          <div className="subject-stat">
                            <div className="subject-value">{stats.notesCount}</div>
                            <div className="subject-label">Notes</div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>

            <div className="subject-charts">
              {selectedSubject && subjectLevelDistribution.length > 0 ? (
                <>
                  <div className="chart-card">
                    <div className="chart-header">
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
                    <div className="chart-legend">
                      {subjectLevelDistribution.map((item, index) => (
                        <div key={index} className="legend-item">
                          <div className="legend-color" style={{ backgroundColor: item.color }}></div>
                          <span className="legend-text">{item.name}: {item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="chart-card">
                    <div className="chart-header">
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
                <div className="placeholder-card">
                  <BookOpen size={64} color="#ccc" />
                  <h3>Sélectionnez une matière</h3>
                  <p>Choisissez une matière pour voir ses statistiques détaillées</p>
                </div>
              )}
            </div>
          </div>
        )}

        {viewMode === 'classes' && (
          <div className="classes-view">
            <div className="classes-grid">
              {allClassesStats.map((classe, index) => (
                <div key={classe.classe} className="class-card">
                  <div className="class-header">
                    <h3>{classe.classe}</h3>
                    <div className="class-rank">#{index + 1}</div>
                  </div>

                  <div className="class-main-stats">
                    <div className="main-stat">
                      <div className="main-value">{classe.average}/20</div>
                      <div className="main-label">Moyenne de classe</div>
                    </div>
                    <div className="main-stat">
                      <div className="main-value">{classe.successRate}%</div>
                      <div className="main-label">Taux de réussite</div>
                    </div>
                    <div className="main-stat">
                      <div className="main-value">{classe.studentCount}</div>
                      <div className="main-label">Étudiants</div>
                    </div>
                  </div>

                  <div className="class-chart">
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

                  <div className="class-distribution">
                    <div className="dist-item">
                      <span className="dist-indicator excellent"></span>
                      <span>Excellent: {classe.distribution.excellent}</span>
                    </div>
                    <div className="dist-item">
                      <span className="dist-indicator good"></span>
                      <span>Très Bien: {classe.distribution.good}</span>
                    </div>
                    <div className="dist-item">
                      <span className="dist-indicator satisfactory"></span>
                      <span>Satisfaisant: {classe.distribution.satisfactory}</span>
                    </div>
                    <div className="dist-item">
                      <span className="dist-indicator unsatisfactory"></span>
                      <span>Insuffisant: {classe.distribution.unsatisfactory}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="footer">
        <p>Système de gestion avec historique multi-années </p>
        {lastUpdate && isCurrentYear && (
          <span className="update-time">
            <Clock size={14} />
            Dernière mise à jour: {lastUpdate.toLocaleTimeString('fr-FR')}
          </span>
        )}
      </div>

      {/* Le CSS reste identique */}
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

        .year-select {
          font-weight: 500;
          color: #495057;
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

        .btn-secondary:hover {
          background: #5a6268;
        }

        .btn-primary {
          background: #007bff;
          color: white;
        }

        .btn-primary:hover {
          background: #0056b3;
        }

        .btn-accent {
          background: #17a2b8;
          color: white;
        }

        .btn-accent:hover {
          background: #138496;
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
          transition: background 0.2s;
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
          transition: all 0.2s;
        }

        .nav-btn.active {
          color: #007bff;
          border-bottom-color: #007bff;
          background: white;
        }

        .nav-btn:hover {
          color: #495057;
          background: #e9ecef;
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

        .data-table tr:hover {
          background: #f8f9fa;
        }

        .full-width {
          grid-column: 1 / -1;
        }

        .history-view {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .history-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 16px;
        }

        .history-card {
          background: white;
          border-radius: 8px;
          border: 1px solid #e9ecef;
          padding: 20px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .history-card.no-data {
          opacity: 0.6;
          border-style: dashed;
        }

        .history-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .history-card-header h3 {
          font-size: 16px;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0;
        }

        .current-badge, .archived-badge {
          font-size: 10px;
          padding: 4px 8px;
          border-radius: 4px;
          font-weight: 500;
        }

        .current-badge {
          background: #28a745;
          color: white;
        }

        .archived-badge {
          background: #6c757d;
          color: white;
        }

        .history-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 16px;
        }

        .history-stat {
          text-align: center;
        }

        .history-value {
          font-size: 18px;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 4px;
        }

        .history-label {
          font-size: 11px;
          color: #6c757d;
        }

        .distribution-bar {
          height: 24px;
          display: flex;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 8px;
        }

        .bar-segment {
          transition: width 0.3s ease;
        }

        .bar-segment.excellent { background: #10b981; }
        .bar-segment.good { background: #3b82f6; }
        .bar-segment.satisfactory { background: #f59e0b; }
        .bar-segment.unsatisfactory { background: #ef4444; }

        .distribution-legend {
          display: flex;
          justify-content: space-around;
          font-size: 10px;
          color: #6c757d;
        }

        .no-data-content {
          text-align: center;
          padding: 20px;
          color: #6c757d;
        }

        .no-data-content p {
          margin: 12px 0 0 0;
          font-size: 13px;
        }

        .subjects-view {
          display: grid;
          grid-template-columns: 300px 1fr;
          gap: 20px;
        }

        .subject-controls {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .control-card {
          background: white;
          border-radius: 8px;
          border: 1px solid #e9ecef;
          padding: 20px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .control-card h3 {
          font-size: 14px;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0 0 16px 0;
        }

        .subject-select {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #dee2e6;
          border-radius: 6px;
          background: white;
          font-size: 13px;
          margin-bottom: 16px;
          cursor: pointer;
        }

        .subject-stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .subject-stat {
          background: #f8f9fa;
          padding: 12px;
          border-radius: 6px;
          text-align: center;
        }

        .subject-value {
          font-size: 16px;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 4px;
        }

        .subject-label {
          font-size: 10px;
          color: #6c757d;
        }

        .subject-charts {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .placeholder-card {
          grid-column: 1 / -1;
          background: white;
          border-radius: 8px;
          border: 1px solid #e9ecef;
          padding: 60px 20px;
          text-align: center;
          color: #6c757d;
        }

        .placeholder-card h3 {
          margin: 20px 0 8px 0;
          color: #495057;
          font-size: 16px;
        }

        .placeholder-card p {
          margin: 0;
          font-size: 13px;
        }

        .classes-view {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .classes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 20px;
        }

        .class-card {
          background: white;
          border-radius: 8px;
          border: 1px solid #e9ecef;
          padding: 20px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .class-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .class-header h3 {
          font-size: 16px;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0;
        }

        .class-rank {
          background: #007bff;
          color: white;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
        }

        .class-main-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 16px;
        }

        .main-stat {
          text-align: center;
        }

        .main-value {
          font-size: 18px;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 4px;
        }

        .main-label {
          font-size: 11px;
          color: #6c757d;
        }

        .class-chart {
          margin-bottom: 16px;
        }

        .class-distribution {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .dist-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 12px;
          color: #495057;
        }

        .dist-indicator {
          width: 12px;
          height: 12px;
          border-radius: 2px;
        }

        .dist-indicator.excellent { background: #10b981; }
        .dist-indicator.good { background: #3b82f6; }
        .dist-indicator.satisfactory { background: #f59e0b; }
        .dist-indicator.unsatisfactory { background: #ef4444; }

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
          font-style: italic;
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

        @media (max-width: 1200px) {
          .chart-section {
            grid-template-columns: 1fr;
          }

          .subject-charts {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .header-main {
            flex-direction: column;
          }

          .header-controls {
            width: 100%;
            min-width: auto;
          }

          .control-group {
            flex-direction: column;
          }

          .action-buttons {
            flex-wrap: wrap;
          }

          .subjects-view {
            grid-template-columns: 1fr;
          }

          .subject-stats {
            grid-template-columns: repeat(4, 1fr);
          }

          .classes-grid {
            grid-template-columns: 1fr;
          }

          .view-navigation {
            overflow-x: auto;
          }

          .nav-btn {
            padding: 10px 16px;
            font-size: 12px;
          }

          .footer {
            flex-direction: column;
            gap: 8px;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
};

export default SchoolStatisticsWithHistory;