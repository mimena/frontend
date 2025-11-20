import React, { useState, useEffect, useCallback } from 'react';
import { 
  AlertCircle,
  RefreshCw,
  Users,
  GraduationCap,
  Home,
  ArrowLeft,
  BookOpen,
  ChevronRight,
  Download,
  FileText
} from 'lucide-react';

const API_BASE_URL = 'https://scolaire.onrender.com/api';

const apiService = {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (parseError) {}
        throw new Error(errorMessage);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`API Error [${config.method || 'GET'} ${endpoint}]:`, error);
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Erreur de connexion à l\'API');
      }
      throw error;
    }
  },

  async getAllStudents() {
    return await this.request('/students');
  },

  async getAllResults() {
    return await this.request('/results');
  }
};

const StudentResults = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [classesList, setClassesList] = useState([]);
  
  // Navigation states
  const [currentView, setCurrentView] = useState('classes');
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const groupStudentsByClass = (studentsMap, results) => {
    const classesList = {};
    
    Object.values(studentsMap)
      .filter(student => {
        return Object.keys(student.subjects).length > 0 && 
               student.classe && 
               student.classe !== 'Sans classe' &&
               student.classe.trim() !== '';
      })
      .forEach(student => {
        let totalWeightedScore = 0;
        let totalCoefficients = 0;
        
        // Pour chaque matière, utiliser uniquement la dernière note
        Object.values(student.subjects).forEach(subject => {
          if (subject.scores.length > 0) {
            // La dernière note (la plus récente)
            const lastScore = subject.scores[subject.scores.length - 1];
            subject.average = lastScore;
            subject.lastScore = lastScore;
            subject.noteOver20 = lastScore; // C'est déjà sur 20
            
            // Calcul avec coefficient
            const weightedScore = lastScore * subject.coefficient;
            totalWeightedScore += weightedScore;
            totalCoefficients += subject.coefficient;
          }
        });
        
        // Moyenne générale avec coefficients
        student.averageScore = totalCoefficients > 0 ? totalWeightedScore / totalCoefficients : 0;
        student.totalCoefficients = totalCoefficients;
        student.totalWeightedScore = totalWeightedScore;
        student.maxWeightedPoints = totalCoefficients * 20;
        student.totalSubjects = Object.keys(student.subjects).length;
        
        let className = student.classe.trim();
        className = className.split(' ').map(word => {
          return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        }).join(' ');
        
        if (!classesList[className]) {
          classesList[className] = {
            name: className,
            students: [],
            totalStudents: 0,
            averageScore: 0,
            totalCorrections: 0,
            totalCoefficients: 0,
            totalWeightedScore: 0
          };
        }
        
        classesList[className].students.push(student);
        classesList[className].totalStudents++;
        classesList[className].totalCorrections += Object.values(student.subjects)
          .reduce((sum, s) => sum + s.corrections, 0);
        classesList[className].totalCoefficients += totalCoefficients;
        classesList[className].totalWeightedScore += totalWeightedScore;
      });
  
    // Moyenne de classe avec coefficients
    Object.values(classesList).forEach(classe => {
      const totalWeights = classe.students.reduce((sum, student) => {
        return sum + student.totalCoefficients;
      }, 0);
      
      classe.averageScore = totalWeights > 0 ? classe.totalWeightedScore / totalWeights : 0;
      classe.maxWeightedPoints = classe.totalCoefficients * 20;
      classe.students.sort((a, b) => a.nom.localeCompare(b.nom));
    });
  
    return classesList;
  };

  const loadAllData = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      else setRefreshing(true);

      const [resultsData, studentsData] = await Promise.all([
        apiService.getAllResults(),
        apiService.getAllStudents()
      ]);
      
      if (resultsData.success && studentsData.success) {
        const students = studentsData.students || [];
        const results = resultsData.results || [];
        
        const studentsMap = {};
        
        // Initialiser tous les étudiants
        students.forEach(student => {
          const matricule = student.matricule || student.id;
          const classe = student.classe || student.class || null;
          
          if (!classe) {
            console.warn('Étudiant sans classe ignoré:', student);
            return;
          }
          
          studentsMap[matricule] = {
            matricule,
            nom: student.nom || student.name || matricule,
            prenom: student.prenom || '',
            classe: classe,
            subjects: {}
          };
        });
        
        // Trier les résultats par date (plus récent en premier)
        const sortedResults = [...results].sort((a, b) => 
          new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at)
        );
        
        // Traiter les résultats
        sortedResults.forEach(result => {
          const matricule = result.student_matricule;
          const analysisResult = result.analysis_result || {};
          
          // CORRECTION: Utiliser le score qui est DÉJÀ sur 20
          let finalNote = parseFloat(result.score);
          
          // Si le score n'existe pas, essayer de le recalculer
          if (isNaN(finalNote) || finalNote === 0) {
            const noteSur20 = parseFloat(analysisResult.note_sur_20);
            const finalNoteFromAnalysis = parseFloat(analysisResult.final_note);
            finalNote = finalNoteFromAnalysis || noteSur20 || 0;
          }
          
          const coefficient = parseFloat(result.subject_coefficient) || 1.0;
          
          if (isNaN(finalNote) || finalNote < 0 || finalNote > 20) {
            console.warn('Score invalide ignoré:', result);
            return;
          }
          
          if (!studentsMap[matricule]) {
            console.warn('Résultat pour étudiant non trouvé ou sans classe:', result);
            return;
          }
          
          if (!studentsMap[matricule].classe) {
            console.warn('Étudiant sans classe ignoré pour ce résultat:', result);
            return;
          }
          
          const subjectName = result.subject_name || 'Matière inconnue';
          
          if (!studentsMap[matricule].subjects[subjectName]) {
            studentsMap[matricule].subjects[subjectName] = {
              name: subjectName,
              scores: [],
              corrections: 0,
              coefficient: coefficient,
              maxPoints: 20
            };
          }
          
          // Ajouter la note (déjà sur 20)
          studentsMap[matricule].subjects[subjectName].scores.push(finalNote);
          studentsMap[matricule].subjects[subjectName].corrections++;
        });

        const classesList = groupStudentsByClass(studentsMap, results);
        const classesArray = Object.values(classesList).sort((a, b) => a.name.localeCompare(b.name));
        
        setClassesList(classesArray);
        setError(null);
      } else {
        setError(resultsData.message || studentsData.message || 'Erreur de chargement');
      }
    } catch (err) {
      const errorMsg = `Erreur de connexion: ${err.message}`;
      setError(errorMsg);
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
    const interval = setInterval(() => {
      loadAllData(true);
    }, 30000);
    return () => clearInterval(interval);
  }, [loadAllData]);

  const getScoreColor = (score) => {
    if (isNaN(score)) return '#6b7280';
    if (score >= 16) return '#10b981';
    if (score >= 12) return '#f59e0b';
    return '#ef4444';
  };

  const getScoreBgColor = (score) => {
    if (isNaN(score)) return '#f3f4f6';
    if (score >= 16) return '#ecfdf5';
    if (score >= 12) return '#fffbeb';
    return '#fef2f2';
  };

  const getAppreciation = (score) => {
    if (isNaN(score) || score === 0) return '—';
    if (score >= 16) return '🌟 Excellent';
    if (score >= 14) return '👍 Très bien';
    if (score >= 12) return '✓ Bien';
    if (score >= 10) return '→ Assez bien';
    return '⚠️ À améliorer';
  };

  const formatScoreSur20 = (score) => {
    if (isNaN(score)) return '—';
    return `${score.toFixed(1)}/20`;
  };

  const formatScoreAvecCoefficient = (score, coefficient = 1) => {
    if (isNaN(score)) return '—';
    const scoreAvecCoefficient = score * coefficient;
    const maxAvecCoefficient = 20 * coefficient;
    return `${scoreAvecCoefficient.toFixed(1)}/${maxAvecCoefficient.toFixed(0)}`;
  };

  // Export CSV corrigé pour Excel
  const exportClassCSV = (classe) => {
    const allSubjectsSet = new Set();
    classe.students.forEach(student => {
      Object.keys(student.subjects).forEach(subjectName => {
        allSubjectsSet.add(subjectName);
      });
    });
    const allSubjects = Array.from(allSubjectsSet).sort();

    // En-tête CSV avec séparateur point-virgule pour Excel
    let csv = 'Matricule;Nom et Prenom';
    allSubjects.forEach(subject => {
      csv += `;${subject} (/20);${subject} (avec coef.)`;
    });
    csv += ';Moyenne Generale (/20);Moyenne Generale (avec coef.)\n';

    // Données des étudiants
    classe.students.forEach(student => {
      // Échapper les guillemets et utiliser le point comme séparateur décimal
      csv += `${student.matricule};"${student.nom} ${student.prenom}"`;
      allSubjects.forEach(subjectName => {
        const subject = student.subjects[subjectName];
        if (subject) {
          csv += `;${subject.lastScore.toFixed(1).replace('.', ',')}/20;${formatScoreAvecCoefficient(subject.lastScore, subject.coefficient).replace('.', ',')}`;
        } else {
          csv += ';;';
        }
      });
      csv += `;${student.averageScore.toFixed(2).replace('.', ',')}/20;${formatScoreAvecCoefficient(student.averageScore, student.totalCoefficients).replace('.', ',')}\n`;
    });

    // Créer le fichier avec BOM pour Excel
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Bulletin_${classe.name}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const exportStudentCSV = (student, className) => {
    // En-tête avec séparateur point-virgule
    let csv = 'Matiere;Coefficient;Note/20;Note avec Coefficient\n';
    
    Object.values(student.subjects)
      .sort((a, b) => a.name.localeCompare(b.name))
      .forEach(subject => {
        // Remplacer les points par des virgules pour Excel français
        csv += `"${subject.name}";${subject.coefficient};${subject.lastScore.toFixed(1).replace('.', ',')}/20;${formatScoreAvecCoefficient(subject.lastScore, subject.coefficient).replace('.', ',')}\n`;
      });
    
    csv += `\nMOYENNE GENERALE;${student.totalCoefficients};${student.averageScore.toFixed(2).replace('.', ',')}/20;${formatScoreAvecCoefficient(student.averageScore, student.totalCoefficients).replace('.', ',')}\n`;
    csv += `APPRECIATION;;${getAppreciation(student.averageScore)};\n`;

    // Ajouter BOM pour Excel
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Bulletin_${student.nom}_${student.prenom}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Export PDF sans "https"
  const exportClassPDF = (classe) => {
    const allSubjectsSet = new Set();
    classe.students.forEach(student => {
      Object.keys(student.subjects).forEach(subjectName => {
        allSubjectsSet.add(subjectName);
      });
    });
    const allSubjects = Array.from(allSubjectsSet).sort();

    const studentsWithRanks = [...classe.students]
      .sort((a, b) => b.averageScore - a.averageScore)
      .map((student, index) => ({
        ...student,
        rank: index + 1
      }));

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Bulletin de Classe - ${classe.name}</title>
        <style>
          @media print {
            @page { margin: 1cm; }
            body { margin: 0; }
          }
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
            color: #000;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #3b82f6;
            padding-bottom: 15px;
          }
          .header h1 {
            margin: 0;
            color: #1e40af;
            font-size: 28px;
          }
          .header p {
            margin: 5px 0;
            color: #6b7280;
            font-size: 14px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            font-size: 11px;
          }
          th, td {
            border: 1px solid #d1d5db;
            padding: 8px;
            text-align: center;
          }
          th {
            background-color: #eff6ff;
            font-weight: bold;
            color: #1e40af;
          }
          .rank-col {
            font-weight: bold;
            color: #1f2937;
          }
          .student-name {
            text-align: left;
            font-weight: 600;
          }
          .matricule {
            font-family: monospace;
            font-size: 10px;
            color: #6b7280;
          }
          .moyenne-col {
            background-color: #f0f9ff;
            font-weight: bold;
            color: #1f2937;
          }
          .score-cell {
            color: #1f2937;
            font-weight: 600;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 10px;
            color: #9ca3af;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📚 Bulletin de Classe</h1>
          <p><strong>${classe.name}</strong></p>
          <p>${classe.totalStudents} étudiant${classe.totalStudents > 1 ? 's' : ''} • ${new Date().toLocaleDateString('fr-FR')}</p>
        </div>
        
        <table>
          <thead>
            <tr>
              <th style="width: 50px;">Rang</th>
              <th style="width: 80px;">Matricule</th>
              <th style="width: 150px;">Nom et Prénom</th>
              ${allSubjects.map(subject => `<th>${subject}</th>`).join('')}
              <th class="moyenne-col">Moyenne Générale</th>
            </tr>
          </thead>
          <tbody>
            ${studentsWithRanks.map(student => {
              return `
                <tr>
                  <td class="rank-col">${student.rank}</td>
                  <td class="matricule">${student.matricule}</td>
                  <td class="student-name">${student.nom} ${student.prenom}</td>
                  ${allSubjects.map(subjectName => {
                    const subject = student.subjects[subjectName];
                    if (!subject) return '<td>—</td>';
                    return `<td class="score-cell">${formatScoreAvecCoefficient(subject.lastScore, subject.coefficient)}</td>`;
                  }).join('')}
                  <td class="moyenne-col">${formatScoreAvecCoefficient(student.averageScore, student.totalCoefficients)}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
        
        <div class="footer">
          <p>Document généré le ${new Date().toLocaleString('fr-FR')}</p>
          <p>Système de Gestion des Résultats Scolaires</p>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  const exportStudentPDF = (student, className) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Bulletin - ${student.nom} ${student.prenom}</title>
        <style>
          @media print {
            @page { margin: 1.5cm; }
            body { margin: 0; }
          }
          body {
            font-family: Arial, sans-serif;
            padding: 30px;
            color: #000;
          }
          .header {
            text-align: center;
            margin-bottom: 40px;
            border: 3px solid #3b82f6;
            padding: 20px;
            border-radius: 10px;
            background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
          }
          .header h1 {
            margin: 0;
            color: #1e40af;
            font-size: 32px;
          }
          .header .student-info {
            margin-top: 15px;
            font-size: 18px;
            color: #1f2937;
          }
          .header .student-info strong {
            color: #1e40af;
          }
          .moyenne-generale {
            text-align: center;
            margin: 30px 0;
            padding: 20px;
            background-color: #f0f9ff;
            border: 2px solid #3b82f6;
            border-radius: 10px;
          }
          .moyenne-generale .score {
            font-size: 48px;
            font-weight: bold;
            color: #1f2937;
            margin: 10px 0;
          }
          .moyenne-generale .appreciation {
            font-size: 20px;
            color: #6b7280;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 30px;
            font-size: 14px;
          }
          th, td {
            border: 1px solid #d1d5db;
            padding: 12px;
            text-align: left;
          }
          th {
            background-color: #eff6ff;
            font-weight: bold;
            color: #1e40af;
            text-align: center;
          }
          .subject-name {
            font-weight: 600;
            color: #1f2937;
          }
          .coeff-badge {
            display: inline-block;
            width: 30px;
            height: 30px;
            background-color: #10b981;
            color: white;
            border-radius: 50%;
            text-align: center;
            line-height: 30px;
            font-weight: bold;
          }
          .score-cell {
            text-align: center;
            font-size: 16px;
            font-weight: bold;
            color: #1f2937;
          }
          .note-over-20 {
            padding: 8px 12px;
            border-radius: 6px;
            font-weight: bold;
            display: inline-block;
            background-color: #f3f4f6;
            color: #1f2937;
          }
          .footer-row {
            background-color: #f8fafc;
            font-weight: bold;
            border-top: 3px solid #3b82f6;
          }
          .footer-row td {
            font-size: 16px;
            color: #1f2937;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 12px;
            color: #9ca3af;
            border-top: 1px solid #e5e7eb;
            padding-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📚 BULLETIN DE NOTES</h1>
          <div class="student-info">
            <p><strong>Nom:</strong> ${student.nom} ${student.prenom}</p>
            <p><strong>Matricule:</strong> ${student.matricule}</p>
            <p><strong>Classe:</strong> ${className}</p>
            <p><strong>Nombre de matières:</strong> ${student.totalSubjects}</p>
          </div>
        </div>
        
        <div class="moyenne-generale">
          <div style="font-size: 18px; color: #6b7280;">MOYENNE GÉNÉRALE</div>
          <div class="score">${formatScoreAvecCoefficient(student.averageScore, student.totalCoefficients)}</div>
          <div class="appreciation">${getAppreciation(student.averageScore)}</div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th style="width: 40%;">Matière</th>
              <th style="width: 15%;">Coeff.</th>
              <th style="width: 25%;">Note avec Coefficient</th>
              <th style="width: 20%;">Note/20</th>
            </tr>
          </thead>
          <tbody>
            ${Object.values(student.subjects)
              .sort((a, b) => a.name.localeCompare(b.name))
              .map(subject => {
                return `
                  <tr>
                    <td class="subject-name">${subject.name}</td>
                    <td style="text-align: center;">
                      <span class="coeff-badge">${subject.coefficient}</span>
                    </td>
                    <td class="score-cell">
                      ${formatScoreAvecCoefficient(subject.lastScore, subject.coefficient)}
                    </td>
                    <td style="text-align: center;">
                      <span class="note-over-20">${subject.lastScore.toFixed(1)}/20</span>
                    </td>
                  </tr>
                `;
              }).join('')}
            <tr class="footer-row">
              <td colspan="2"><strong>MOYENNE GÉNÉRALE</strong></td>
              <td class="score-cell" style="font-size: 18px;">
                <strong>${formatScoreAvecCoefficient(student.averageScore, student.totalCoefficients)}</strong>
              </td>
              <td style="text-align: center; color: #6b7280;">
                ${getAppreciation(student.averageScore)}
              </td>
            </tr>
          </tbody>
        </table>
        
        <div class="footer">
          <p>Document généré le ${new Date().toLocaleString('fr-FR')}</p>
          <p>Système de Gestion des Résultats Scolaires</p>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  // Navigation
  const goToClasses = () => {
    setCurrentView('classes');
    setSelectedClass(null);
    setSelectedStudent(null);
  };

  const goToClassStudents = (classe) => {
    setSelectedClass(classe);
    setCurrentView('class-students');
    setSelectedStudent(null);
  };

  const goToStudentDetails = (student) => {
    setSelectedStudent(student);
    setCurrentView('student-details');
  };

  const goBackFromStudentDetails = () => {
    setCurrentView('class-students');
    setSelectedStudent(null);
  };

  // Render Views
  const renderClassesView = () => {
    if (classesList.length === 0) {
      return (
        <div className="card">
          <div className="card-body">
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <GraduationCap style={{ width: '48px', height: '48px', color: '#9ca3af', margin: '0 auto 1rem' }} />
              <h3>Aucune classe trouvée</h3>
              <p style={{ color: '#6b7280' }}>
                Aucune donnée disponible.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div>
        <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))' }}>
          {classesList.map((classe) => (
            <div 
              key={classe.name} 
              className="card clickable-card"
              onClick={() => goToClassStudents(classe)}
              style={{ cursor: 'pointer', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}
            >
              <div className="card-header" style={{ backgroundColor: '#eff6ff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ 
                      width: '50px', 
                      height: '50px', 
                      borderRadius: '0.5rem', 
                      backgroundColor: '#3b82f6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <GraduationCap style={{ width: '24px', height: '24px', color: 'white' }} />
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.5rem', color: '#1e40af' }}>
                        {classe.name}
                      </h3>
                      <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#6b7280' }}>
                        {classe.totalStudents} étudiant{classe.totalStudents > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <ChevronRight style={{ width: '24px', height: '24px', color: '#3b82f6' }} />
                </div>
              </div>
              
              <div className="card-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280' }}>
                    <Users style={{ width: '16px', height: '16px' }} />
                    <span>{classe.totalCorrections} corrections</span>
                  </div>
                  <div style={{ 
                    padding: '0.5rem 0.75rem', 
                    borderRadius: '0.375rem', 
                    backgroundColor: getScoreBgColor(classe.averageScore),
                    color: getScoreColor(classe.averageScore),
                    fontWeight: '600',
                    fontSize: '0.875rem'
                  }}>
                    {formatScoreAvecCoefficient(classe.averageScore, classe.totalCoefficients)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderClassStudentsView = () => {
    if (!selectedClass) return null;

    const allSubjectsSet = new Set();
    selectedClass.students.forEach(student => {
      Object.keys(student.subjects).forEach(subjectName => {
        allSubjectsSet.add(subjectName);
      });
    });
    const allSubjects = Array.from(allSubjectsSet).sort();

    const studentsWithRanks = [...selectedClass.students]
      .sort((a, b) => b.averageScore - a.averageScore)
      .map((student, index) => ({
        ...student,
        rank: index + 1
      }));

    return (
      <div>
        <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button 
            className="btn btn-secondary btn-sm"
            onClick={goToClasses}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <ArrowLeft style={{ width: '16px', height: '16px' }} />
            Retour aux classes
          </button>
          <span style={{ color: '#9ca3af' }}>/</span>
          <span style={{ fontWeight: '600', color: '#1f2937' }}>{selectedClass.name}</span>
        </div>

        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="card-header" style={{ backgroundColor: '#eff6ff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ 
                  width: '60px', 
                  height: '60px', 
                  borderRadius: '0.5rem', 
                  backgroundColor: '#3b82f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <GraduationCap style={{ width: '32px', height: '32px', color: 'white' }} />
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.875rem', color: '#1e40af' }}>
                    {selectedClass.name}
                  </h2>
                  <p style={{ margin: '0.25rem 0 0 0', fontSize: '1rem', color: '#6b7280' }}>
                    {selectedClass.totalStudents} étudiant{selectedClass.totalStudents > 1 ? 's' : ''} • {selectedClass.totalCorrections} corrections
                  </p>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button 
                  className="btn btn-success btn-sm"
                  onClick={() => exportClassCSV(selectedClass)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <Download style={{ width: '16px', height: '16px' }} />
                  Export CSV
                </button>
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={() => exportClassPDF(selectedClass)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <FileText style={{ width: '16px', height: '16px' }} />
                  Export PDF
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Users style={{ display: 'inline', marginRight: '0.5rem' }} />
              Bulletin de Classe - {selectedClass.name}
            </h3>
          </div>
          <div className="card-body" style={{ padding: '0' }}>
            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th style={{ minWidth: '60px', position: 'sticky', left: 0, backgroundColor: '#f8fafc', zIndex: 10, textAlign: 'center' }}>Rang</th>
                    <th style={{ minWidth: '100px', position: 'sticky', left: '60px', backgroundColor: '#f8fafc', zIndex: 10 }}>Matricule</th>
                    <th style={{ minWidth: '200px', position: 'sticky', left: '160px', backgroundColor: '#f8fafc', zIndex: 10 }}>Nom et Prénom</th>
                    {allSubjects.map((subjectName, idx) => (
                      <th key={idx} style={{ minWidth: '90px', textAlign: 'center' }}>
                        {subjectName}
                      </th>
                    ))}
                    <th style={{ minWidth: '120px', textAlign: 'center', backgroundColor: '#eff6ff', fontWeight: 'bold' }}>
                      Moyenne Générale
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {studentsWithRanks.map((student) => (
                    <tr 
                      key={student.matricule} 
                      className="clickable-row"
                      onClick={() => goToStudentDetails(student)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td style={{ position: 'sticky', left: 0, backgroundColor: 'white', zIndex: 5, textAlign: 'center', fontWeight: 'bold', color: '#1f2937' }}>
                        {student.rank}
                      </td>
                      <td style={{ position: 'sticky', left: '60px', backgroundColor: 'white', zIndex: 5, fontFamily: 'monospace', fontSize: '0.875rem', color: '#6b7280' }}>
                        {student.matricule}
                      </td>
                      <td style={{ position: 'sticky', left: '160px', backgroundColor: 'white', zIndex: 5, fontWeight: '600', color: '#1f2937' }}>
                        {student.nom} {student.prenom}
                      </td>
                      {allSubjects.map((subjectName, idx) => {
                        const subject = student.subjects[subjectName];
                        if (!subject) {
                          return <td key={idx} style={{ textAlign: 'center', color: '#9ca3af' }}>—</td>;
                        }
                        const lastScore = subject.lastScore;
                        const coefficient = subject.coefficient;
                        
                        return (
                          <td key={idx} style={{ textAlign: 'center' }}>
                            <span style={{
                              padding: '0.375rem 0.5rem',
                              borderRadius: '0.375rem',
                              backgroundColor: '#f3f4f6',
                              color: '#1f2937',
                              fontWeight: '600',
                              fontSize: '0.875rem',
                              display: 'inline-block',
                              minWidth: '65px'
                            }}>
                              {formatScoreAvecCoefficient(lastScore, coefficient)}
                            </span>
                          </td>
                        );
                      })}
                      <td style={{ textAlign: 'center', backgroundColor: '#f0f9ff' }}>
                        <span style={{
                          padding: '0.5rem 0.75rem',
                          borderRadius: '0.5rem',
                          fontWeight: 'bold',
                          fontSize: '1rem',
                          backgroundColor: '#e0e7ff',
                          color: '#1f2937',
                          display: 'inline-block',
                          minWidth: '70px'
                        }}>
                          {formatScoreAvecCoefficient(student.averageScore, student.totalCoefficients)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderStudentDetailsView = () => {
    if (!selectedStudent || !selectedClass) return null;

    const subjectsArray = Object.values(selectedStudent.subjects);

    return (
      <div>
        <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button 
            className="btn btn-secondary btn-sm"
            onClick={goToClasses}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Home style={{ width: '14px', height: '14px' }} />
            Classes
          </button>
          <span style={{ color: '#9ca3af' }}>/</span>
          <button 
            className="btn btn-secondary btn-sm"
            onClick={goBackFromStudentDetails}
          >
            {selectedClass.name}
          </button>
          <span style={{ color: '#9ca3af' }}>/</span>
          <span style={{ fontWeight: '600', color: '#1f2937' }}>{selectedStudent.nom} {selectedStudent.prenom}</span>
        </div>

        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="card-header" style={{ backgroundColor: '#f0f9ff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ 
                  width: '80px', 
                  height: '80px', 
                  borderRadius: '50%', 
                  backgroundColor: '#3b82f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '2rem',
                  color: 'white'
                }}>
                  {selectedStudent.nom.substring(0, 1).toUpperCase()}
                  {selectedStudent.prenom.substring(0, 1).toUpperCase()}
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '2rem', color: '#1e40af' }}>
                    {selectedStudent.nom} {selectedStudent.prenom}
                  </h2>
                  <p style={{ margin: '0.5rem 0 0 0', fontSize: '1rem', color: '#6b7280' }}>
                    Matricule: {selectedStudent.matricule} • Classe: {selectedClass.name}
                  </p>
                  <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#6b7280' }}>
                    {selectedStudent.totalSubjects} matière{selectedStudent.totalSubjects > 1 ? 's' : ''} • Total coefficients: {selectedStudent.totalCoefficients}
                  </p>
                </div>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontSize: '2.5rem', 
                  fontWeight: 'bold',
                  color: getScoreColor(selectedStudent.averageScore)
                }}>
                  {formatScoreAvecCoefficient(selectedStudent.averageScore, selectedStudent.totalCoefficients)}
                </div>
                <div style={{ fontSize: '1rem', color: '#6b7280', marginTop: '0.25rem' }}>
                  {getAppreciation(selectedStudent.averageScore)}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button 
            className="btn btn-success btn-sm"
            onClick={() => exportStudentCSV(selectedStudent, selectedClass.name)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Download style={{ width: '16px', height: '16px' }} />
            Export CSV
          </button>
          <button 
            className="btn btn-primary btn-sm"
            onClick={() => exportStudentPDF(selectedStudent, selectedClass.name)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <FileText style={{ width: '16px', height: '16px' }} />
            Export PDF
          </button>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <BookOpen style={{ display: 'inline', marginRight: '0.5rem' }} />
              Bulletin de Notes Détaillé
            </h3>
          </div>
          <div className="card-body" style={{ padding: '0' }}>
            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th style={{ width: '50%' }}>Matière</th>
                    <th style={{ textAlign: 'center', width: '15%' }}>Coeff</th>
                    <th style={{ textAlign: 'center', width: '20%' }}>Note avec Coefficient</th>
                    <th style={{ textAlign: 'center', width: '15%' }}>Note/20</th>
                  </tr>
                </thead>
                <tbody>
                  {subjectsArray
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((subject, index) => {
                      const coefficient = subject.coefficient || 1;
                      const lastScore = subject.lastScore;
                      
                      return (
                        <tr key={index}>
                          <td>
                            <div style={{ fontWeight: '600', color: '#1f2937', fontSize: '1rem' }}>
                              {subject.name}
                            </div>
                          </td>
                          
                          <td style={{ textAlign: 'center' }}>
                            <span style={{
                              width: '32px',
                              height: '32px',
                              backgroundColor: '#10b981',
                              color: 'white',
                              borderRadius: '50%',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 'bold',
                              fontSize: '0.875rem'
                            }}>
                              {coefficient}
                            </span>
                          </td>
                          
                          <td style={{ textAlign: 'center' }}>
                            <span style={{
                              fontSize: '1.25rem',
                              fontWeight: 'bold',
                              color: '#1f2937'
                            }}>
                              {formatScoreAvecCoefficient(lastScore, coefficient)}
                            </span>
                          </td>
                          
                          <td style={{ textAlign: 'center' }}>
                            <span style={{
                              padding: '0.5rem 0.75rem',
                              borderRadius: '0.375rem',
                              backgroundColor: '#f3f4f6',
                              color: '#1f2937',
                              fontWeight: 'bold',
                              fontSize: '1rem'
                            }}>
                              {lastScore.toFixed(1)}/20
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  
                  <tr style={{ 
                    backgroundColor: '#f8fafc', 
                    fontWeight: 'bold',
                    borderTop: '2px solid #e5e7eb'
                  }}>
                    <td style={{ fontSize: '1.125rem' }}>MOYENNE GÉNÉRALE</td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{
                        width: '32px',
                        height: '32px',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        borderRadius: '50%',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        fontSize: '0.875rem'
                      }}>
                        {selectedStudent.totalCoefficients}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
                        {formatScoreAvecCoefficient(selectedStudent.averageScore, selectedStudent.totalCoefficients)}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ fontSize: '1rem', color: '#6b7280' }}>
                        {getAppreciation(selectedStudent.averageScore)}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', padding: '2rem' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ margin: 0, fontSize: '2.5rem', color: '#1f2937', fontWeight: 'bold' }}>
            Gestion Scolaire
          </h1>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.125rem', color: '#6b7280' }}>
            Consultation des notes et bulletins scolaires
          </p>
        </div>

        {currentView === 'classes' && (
          <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button 
              className="btn btn-secondary btn-sm" 
              onClick={() => loadAllData()}
              disabled={refreshing}
            >
              <RefreshCw style={{ width: '16px', height: '16px', marginRight: '0.5rem' }} />
              Actualiser
            </button>
          </div>
        )}

        {loading ? (
          <div className="card">
            <div className="card-body">
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <div style={{ 
                  width: '40px', 
                  height: '40px', 
                  border: '4px solid #f3f4f6', 
                  borderTop: '4px solid #3b82f6',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto 1rem'
                }}></div>
                <p>Chargement des données...</p>
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="card">
            <div className="card-body">
              <div className="alert alert-danger">
                <AlertCircle style={{ width: '20px', height: '20px', display: 'inline', marginRight: '0.5rem' }} />
                {error}
              </div>
              <button className="btn btn-primary" onClick={() => loadAllData()}>
                Réessayer
              </button>
            </div>
          </div>
        ) : (
          <>
            {currentView === 'classes' && renderClassesView()}
            {currentView === 'class-students' && renderClassStudentsView()}
            {currentView === 'student-details' && renderStudentDetailsView()}
          </>
        )}

        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            
            .card {
              background: white;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              border: 1px solid #e5e7eb;
            }
            
            .card:hover {
              box-shadow: 0 4px 8px rgba(0,0,0,0.15);
            }

            .clickable-card:hover {
              transform: translateY(-2px);
              box-shadow: 0 6px 12px rgba(0,0,0,0.15);
            }

            .clickable-row:hover {
              background-color: #f8fafc !important;
              transform: scale(1.01);
              transition: all 0.2s ease;
            }
            
            .card-header {
              padding: 1.5rem;
              border-bottom: 1px solid #e5e7eb;
              background-color: #f8fafc;
            }
            
            .card-body {
              padding: 1.5rem;
            }
            
            .card-title {
              margin: 0;
              font-size: 1.25rem;
              font-weight: 600;
              color: #1f2937;
            }
            
            .btn {
              padding: 0.5rem 1rem;
              border-radius: 0.375rem;
              border: 1px solid transparent;
              font-weight: 500;
              cursor: pointer;
              display: inline-flex;
              align-items: center;
              text-decoration: none;
              transition: all 0.2s ease;
            }
            
            .btn:disabled {
              opacity: 0.6;
              cursor: not-allowed;
            }
            
            .btn-primary {
              background-color: #3b82f6;
              color: white;
            }
            
            .btn-primary:hover:not(:disabled) {
              background-color: #2563eb;
            }
            
            .btn-secondary {
              background-color: #6b7280;
              color: white;
            }
            
            .btn-secondary:hover:not(:disabled) {
              background-color: #4b5563;
            }

            .btn-success {
              background-color: #10b981;
              color: white;
            }
            
            .btn-success:hover:not(:disabled) {
              background-color: #059669;
            }
            
            .btn-sm {
              padding: 0.375rem 0.75rem;
              font-size: 0.875rem;
            }
            
            .table-responsive {
              overflow-x: auto;
            }
            
            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 0.875rem;
            }
            
            th, td {
              padding: 0.75rem;
              text-align: left;
              border-bottom: 1px solid #e5e7eb;
            }
            
            th {
              background-color: #f8fafc;
              font-weight: 600;
              color: #374151;
            }
            
            tbody tr:hover {
              background-color: #f9fafb;
            }
            
            .alert {
              padding: 1rem;
              border-radius: 0.5rem;
              border: 1px solid;
              margin-bottom: 1rem;
            }
            
            .alert-danger {
              background-color: #fef2f2;
              border-color: #fecaca;
              color: #991b1b;
            }
          `}
        </style>
      </div>
    </div>
  );
};

export default StudentResults;