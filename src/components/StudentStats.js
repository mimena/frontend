import React, { useState, useEffect, useCallback } from 'react';
import { 
  CheckCircle, 
  TrendingUp, 
  FileText, 
  Clock, 
  Award,
  AlertCircle,
  Camera,
  MessageSquare,
  RefreshCw,
  Eye,
  BarChart3,
  User,
  Bug,
  BookOpen,
  GraduationCap
} from 'lucide-react';

const StudentResults = ({ 
  studentMatricule = "21L2345", 
  showAllStudents = false,
  // Props pour s'intégrer avec votre système existant
  students = [],
  grades = [],
  subjects = []
}) => {
  const [results, setResults] = useState([]);
  const [mobileResults, setMobileResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedResult, setSelectedResult] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [studentInfo, setStudentInfo] = useState(null);
  const [allStudentsResults, setAllStudentsResults] = useState([]);
  const [viewMode, setViewMode] = useState(showAllStudents ? 'all' : 'individual');
  const [debugInfo, setDebugInfo] = useState('');
  const [dataSource, setDataSource] = useState('api'); // 'api' ou 'props'

  // URL de votre API
  const API_BASE_URL = 'https://scolaire.onrender.com/api';

  const addDebug = (message) => {
    console.log(message);
    setDebugInfo(prev => prev + '\n' + new Date().toLocaleTimeString() + ': ' + message);
  };

  // Fonction pour convertir les données Material-UI en format de résultats
  const convertGradesToResults = useCallback(() => {
    addDebug('Conversion des notes en résultats');
    
    if (!students.length || !grades.length || !subjects.length) {
      addDebug('Données manquantes pour la conversion');
      return [];
    }

    const studentData = students.find(s => s.matricule === studentMatricule || s.id === studentMatricule);
    if (!studentData) {
      addDebug(`Étudiant ${studentMatricule} non trouvé dans les props`);
      return [];
    }

    const studentGrades = grades.filter(grade => 
      grade.studentId === studentData.id || 
      grade.student_matricule === studentMatricule
    );

    const convertedResults = studentGrades.map(grade => {
      const subject = subjects.find(s => s.id === grade.subjectId);
      return {
        id: `grade_${grade.id}`,
        score: parseFloat(grade.value || grade.score || 0),
        subject_name: subject?.name || subject?.subject_name || 'Matière inconnue',
        subject_code: subject?.code || subject?.subject_code || 'N/A',
        created_at: grade.createdAt || grade.created_at || new Date().toISOString(),
        feedback: grade.feedback || `Note de ${grade.value}/20 en ${subject?.name}`,
        strengths: grade.strengths || 'Bon travail dans cette matière',
        improvements: grade.improvements || 'Continuez vos efforts',
        next_steps: grade.next_steps || 'Réviser les points faibles',
        correction_type: 'manual',
        image_count: 1,
        extracted_text: grade.comments || ''
      };
    });

    addDebug(`${convertedResults.length} notes converties en résultats`);
    return convertedResults;
  }, [students, grades, subjects, studentMatricule]);

  const loadStudentInfo = useCallback(async () => {
    try {
      // Essayer d'abord avec les données props
      if (students.length > 0) {
        const student = students.find(s => 
          s.matricule === studentMatricule || 
          s.id === studentMatricule
        );
        if (student) {
          setStudentInfo(student);
          addDebug('Info étudiant trouvée dans les props');
          return;
        }
      }

      // Sinon essayer l'API
      addDebug(`Chargement info étudiant ${studentMatricule} via API`);
      const response = await fetch(`${API_BASE_URL}/students/${studentMatricule}`);
      const data = await response.json();
      
      if (data.success && data.student) {
        setStudentInfo(data.student);
        addDebug('Info étudiant chargée via API');
      } else {
        addDebug('Aucune info étudiant trouvée');
      }
    } catch (err) {
      addDebug(`Erreur chargement info étudiant: ${err.message}`);
    }
  }, [studentMatricule, students]);

  const loadStudentResults = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      else setRefreshing(true);

      // Essayer d'abord avec les données props
      if (grades.length > 0 && students.length > 0) {
        addDebug('Utilisation des données props (grades)');
        const convertedResults = convertGradesToResults();
        setResults(convertedResults);
        setDataSource('props');
        setError(null);
        return;
      }

      // Sinon essayer l'API mobile
      addDebug(`Chargement résultats mobile pour ${studentMatricule}`);
      const response = await fetch(`${API_BASE_URL}/results/student/${studentMatricule}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      addDebug(`Réponse API mobile: ${JSON.stringify(data).substring(0, 200)}...`);
      
      if (data.success) {
        setMobileResults(data.results || []);
        setResults(data.results || []);
        setDataSource('api');
        setError(null);
        addDebug(`${data.results?.length || 0} résultats mobiles trouvés`);
      } else {
        setError(data.message);
        addDebug(`Erreur API: ${data.message}`);
      }
    } catch (err) {
      const errorMsg = `Erreur de connexion: ${err.message}`;
      setError(errorMsg);
      addDebug(errorMsg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [studentMatricule, convertGradesToResults, grades, students]);

  const loadAllResults = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      else setRefreshing(true);

      // Essayer d'abord avec les données props
      if (students.length > 0 && grades.length > 0) {
        addDebug('Création vue globale depuis les props');
        const groupedResults = {};
        
        students.forEach(student => {
          const studentGrades = grades.filter(grade => 
            grade.studentId === student.id
          );
          
          if (studentGrades.length > 0) {
            const convertedResults = studentGrades.map(grade => {
              const subject = subjects.find(s => s.id === grade.subjectId);
              return {
                id: `grade_${grade.id}`,
                score: parseFloat(grade.value || grade.score || 0),
                subject_name: subject?.name || 'Matière',
                created_at: grade.createdAt || new Date().toISOString(),
                feedback: `Note de ${grade.value}/20`
              };
            });

            const scores = convertedResults.map(r => r.score);
            const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
            const lastUpdate = new Date(Math.max(...convertedResults.map(r => new Date(r.created_at))));

            groupedResults[student.matricule || student.id] = {
              matricule: student.matricule || student.id,
              nom: student.nom || student.name,
              results: convertedResults,
              totalResults: convertedResults.length,
              averageScore,
              lastUpdate
            };
          }
        });

        setAllStudentsResults(Object.values(groupedResults));
        setDataSource('props');
        setError(null);
        addDebug(`${Object.keys(groupedResults).length} étudiants avec notes`);
        return;
      }

      // Sinon essayer l'API
      addDebug('Chargement de tous les résultats via API');
      const response = await fetch(`${API_BASE_URL}/results`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      addDebug(`Réponse API tous résultats: ${JSON.stringify(data).substring(0, 200)}...`);
      
      if (data.success) {
        // Grouper les résultats par étudiant
        const groupedResults = {};
        (data.results || []).forEach(result => {
          const matricule = result.student_matricule;
          if (!groupedResults[matricule]) {
            groupedResults[matricule] = {
              matricule,
              results: [],
              totalResults: 0,
              averageScore: 0,
              lastUpdate: null
            };
          }
          groupedResults[matricule].results.push(result);
          groupedResults[matricule].totalResults++;
          
          const resultDate = new Date(result.created_at);
          if (!groupedResults[matricule].lastUpdate || resultDate > groupedResults[matricule].lastUpdate) {
            groupedResults[matricule].lastUpdate = resultDate;
          }
        });

        // Calculer les moyennes
        Object.values(groupedResults).forEach(student => {
          const scores = student.results.map(r => r.score);
          student.averageScore = scores.length > 0 
            ? scores.reduce((sum, score) => sum + score, 0) / scores.length 
            : 0;
        });

        setAllStudentsResults(Object.values(groupedResults));
        setDataSource('api');
        setError(null);
        addDebug(`${Object.keys(groupedResults).length} étudiants avec résultats API`);
      } else {
        setError(data.message);
        addDebug(`Erreur API tous résultats: ${data.message}`);
      }
    } catch (err) {
      const errorMsg = `Erreur de connexion: ${err.message}`;
      setError(errorMsg);
      addDebug(errorMsg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [students, grades, subjects]);

  useEffect(() => {
    addDebug(`Initialisation - showAllStudents: ${showAllStudents}, studentMatricule: ${studentMatricule}`);
    addDebug(`Props disponibles - students: ${students.length}, grades: ${grades.length}, subjects: ${subjects.length}`);
    
    if (showAllStudents) {
      loadAllResults();
    } else if (studentMatricule) {
      loadStudentResults();
      loadStudentInfo();
    } else {
      addDebug('Aucun matricule fourni');
      setLoading(false);
      setError('Aucun matricule d\'étudiant fourni');
    }
  }, [studentMatricule, showAllStudents, loadStudentInfo, loadStudentResults, loadAllResults, students, grades, subjects]);

  const getScoreColor = (score) => {
    if (score >= 16) return '#10b981';
    if (score >= 12) return '#f59e0b';
    return '#ef4444';
  };

  const getScoreBgColor = (score) => {
    if (score >= 16) return '#ecfdf5';
    if (score >= 12) return '#fffbeb';
    return '#fef2f2';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPerformanceStats = () => {
    if (viewMode === 'individual' && results.length > 0) {
      const scores = results.map(r => r.score);
      const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      const highest = Math.max(...scores);
      const latest = results.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
      
      return {
        average: average.toFixed(1),
        highest: highest.toFixed(1),
        total: results.length,
        latestScore: latest.score.toFixed(1),
        trend: scores.length > 1 ? (scores[scores.length - 1] > scores[0] ? 'up' : 'down') : 'stable'
      };
    } else if (viewMode === 'all' && allStudentsResults.length > 0) {
      const allScores = allStudentsResults.flatMap(student => student.results.map(r => r.score));
      const average = allScores.length > 0 ? allScores.reduce((sum, score) => sum + score, 0) / allScores.length : 0;
      const totalCorrections = allScores.length;
      const studentsWithResults = allStudentsResults.length;
      
      return {
        average: average.toFixed(1),
        totalCorrections,
        studentsWithResults,
        trend: 'stable'
      };
    }
    return null;
  };

  // Panneau de debug et source de données
  const renderDebugPanel = () => (
    <div className="card" style={{ marginBottom: '1.5rem', backgroundColor: '#1f2937' }}>
      <div className="card-header" style={{ backgroundColor: '#374151' }}>
        <h4 style={{ color: 'white', margin: 0 }}>
          <Bug style={{ display: 'inline', marginRight: '0.5rem' }} />
          Debug Info - Source: {dataSource === 'props' ? 'Données locales' : 'API Mobile'}
        </h4>
      </div>
      <div className="card-body" style={{ maxHeight: '200px', overflow: 'auto' }}>
        <div style={{ marginBottom: '1rem' }}>
          <span style={{ color: '#10b981', fontWeight: 'bold' }}>
            Students: {students.length} | Grades: {grades.length} | Subjects: {subjects.length}
          </span>
        </div>
        <pre style={{ color: '#10b981', fontSize: '12px', margin: 0, whiteSpace: 'pre-wrap' }}>
          {debugInfo || 'Aucune info de debug...'}
        </pre>
      </div>
    </div>
  );

  // Interface pour vue individuelle (identique mais avec indicateur de source)
  const renderIndividualView = () => {
    if (loading) {
      return (
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
              <p>Chargement des résultats...</p>
            </div>
          </div>
        </div>
      );
    }

    if (error && results.length === 0) {
      return (
        <div className="card">
          <div className="card-body">
            <div className="alert alert-danger">
              <AlertCircle style={{ width: '20px', height: '20px', display: 'inline', marginRight: '0.5rem' }} />
              {error}
            </div>
            <button className="btn btn-primary" onClick={() => loadStudentResults()}>
              Réessayer
            </button>
          </div>
        </div>
      );
    }

    const stats = getPerformanceStats();

    return (
      <div>
        {/* Informations étudiant et statistiques */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="card-header">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 className="card-title">
                  {dataSource === 'props' ? 
                    <GraduationCap style={{ display: 'inline', marginRight: '0.5rem' }} /> :
                    <Award style={{ display: 'inline', marginRight: '0.5rem' }} />
                  }
                  {dataSource === 'props' ? 'Notes Scolaires' : 'Corrections Mobile'}
                  {studentInfo && ` - ${studentInfo.nom || studentInfo.name}`}
                </h3>
                <p className="card-subtitle">
                  Matricule: {studentMatricule} | {results.length} {dataSource === 'props' ? 'note' : 'correction'}{results.length > 1 ? 's' : ''} reçue{results.length > 1 ? 's' : ''}
                  <span style={{ 
                    marginLeft: '1rem', 
                    padding: '0.25rem 0.5rem', 
                    backgroundColor: dataSource === 'props' ? '#dbeafe' : '#dcfce7',
                    color: dataSource === 'props' ? '#1e40af' : '#166534',
                    borderRadius: '0.25rem',
                    fontSize: '0.75rem'
                  }}>
                    {dataSource === 'props' ? 'DONNÉES LOCALES' : 'API MOBILE'}
                  </span>
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                {refreshing && (
                  <RefreshCw style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
                )}
                <button 
                  className="btn btn-secondary btn-sm" 
                  onClick={() => loadStudentResults()}
                  disabled={refreshing}
                >
                  <RefreshCw style={{ width: '16px', height: '16px', marginRight: '0.5rem' }} />
                  Actualiser
                </button>
              </div>
            </div>
          </div>
          
          {/* Statistiques rapides */}
          {stats && (
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                <div style={{ textAlign: 'center', padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '0.5rem' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: getScoreColor(stats.average) }}>
                    {stats.average}/20
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Moyenne</div>
                </div>
                <div style={{ textAlign: 'center', padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '0.5rem' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>
                    {stats.highest}/20
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Meilleure</div>
                </div>
                <div style={{ textAlign: 'center', padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '0.5rem' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3b82f6' }}>
                    {stats.total}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{dataSource === 'props' ? 'Notes' : 'Corrections'}</div>
                </div>
                <div style={{ textAlign: 'center', padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '0.5rem' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: getScoreColor(stats.latestScore) }}>
                    {stats.latestScore}/20
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Dernière</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Liste des résultats */}
        {results.length > 0 ? (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {results.map((result, index) => (
              <div key={result.id} className="card">
                <div className="card-body">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                    <div>
                      <h4 style={{ margin: '0 0 0.5rem 0', color: '#1f2937' }}>
                        <BookOpen style={{ width: '18px', height: '18px', display: 'inline', marginRight: '0.5rem' }} />
                        {result.subject_name || result.subject_code}
                      </h4>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.25rem' }}>
                        <Clock style={{ width: '16px', height: '16px', marginRight: '0.5rem', color: '#6b7280' }} />
                        <span style={{ fontSize: '14px', color: '#6b7280' }}>
                          {formatDate(result.created_at)}
                        </span>
                      </div>
                      {dataSource === 'api' && (
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <Camera style={{ width: '16px', height: '16px', marginRight: '0.5rem', color: '#6b7280' }} />
                          <span style={{ fontSize: '14px', color: '#6b7280' }}>
                            {result.image_count || 1} image{(result.image_count || 1) > 1 ? 's' : ''} analysée{(result.image_count || 1) > 1 ? 's' : ''}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div style={{ textAlign: 'center' }}>
                      <div style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '0.5rem',
                        fontWeight: 'bold',
                        fontSize: '18px',
                        backgroundColor: getScoreBgColor(result.score),
                        color: getScoreColor(result.score)
                      }}>
                        {result.score.toFixed(1)}/20
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '0.25rem' }}>
                        {result.score >= 16 ? 'Excellent' : result.score >= 12 ? 'Bien' : result.score >= 10 ? 'Assez Bien' : 'À améliorer'}
                      </div>
                    </div>
                  </div>

                  {/* Feedback et détails */}
                  {result.feedback && (
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ 
                        padding: '0.75rem', 
                        backgroundColor: '#f9fafb', 
                        borderRadius: '0.375rem',
                        border: '1px solid #e5e7eb'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                          <MessageSquare style={{ width: '16px', height: '16px', marginRight: '0.5rem', color: '#4b5563' }} />
                          <strong style={{ fontSize: '14px', color: '#374151' }}>
                            {dataSource === 'props' ? 'Commentaire' : 'Analyse générale'}
                          </strong>
                        </div>
                        <p style={{ margin: 0, fontSize: '14px', color: '#4b5563', lineHeight: '1.4' }}>
                          {result.feedback}
                        </p>
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                      {dataSource === 'props' ? 'Note' : 'Correction'} #{index + 1} • 
                      Type: {dataSource === 'props' ? 'Note scolaire' : (result.correction_type === 'automatic' ? 'Automatique' : 'Manuelle')}
                    </div>
                    {(result.strengths || result.improvements || result.next_steps || result.extracted_text) && (
                      <button 
                        className="btn btn-secondary btn-sm"
                        onClick={() => setSelectedResult(selectedResult === result.id ? null : result.id)}
                      >
                        <Eye style={{ width: '14px', height: '14px', marginRight: '0.25rem' }} />
                        {selectedResult === result.id ? 'Masquer' : 'Détails'}
                      </button>
                    )}
                  </div>

                  {/* Détails étendus */}
                  {selectedResult === result.id && (
                    <div style={{ 
                      marginTop: '1rem', 
                      padding: '1rem', 
                      backgroundColor: '#f8fafc',
                      borderRadius: '0.375rem',
                      border: '1px solid #e2e8f0'
                    }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                        {result.strengths && (
                          <div>
                            <h5 style={{ color: '#10b981', marginBottom: '0.5rem', fontSize: '14px' }}>
                              <CheckCircle style={{ width: '16px', height: '16px', display: 'inline', marginRight: '0.25rem' }} />
                              Points forts
                            </h5>
                            <p style={{ margin: 0, fontSize: '13px', color: '#4b5563' }}>{result.strengths}</p>
                          </div>
                        )}
                        
                        {result.improvements && (
                          <div>
                            <h5 style={{ color: '#f59e0b', marginBottom: '0.5rem', fontSize: '14px' }}>
                              <TrendingUp style={{ width: '16px', height: '16px', display: 'inline', marginRight: '0.25rem' }} />
                              À améliorer
                            </h5>
                            <p style={{ margin: 0, fontSize: '13px', color: '#4b5563' }}>{result.improvements}</p>
                          </div>
                        )}
                        
                        {result.next_steps && (
                          <div>
                            <h5 style={{ color: '#6366f1', marginBottom: '0.5rem', fontSize: '14px' }}>
                              <FileText style={{ width: '16px', height: '16px', display: 'inline', marginRight: '0.25rem' }} />
                              Recommandations
                            </h5>
                            <p style={{ margin: 0, fontSize: '13px', color: '#4b5563' }}>{result.next_steps}</p>
                          </div>
                        )}
                      </div>
                      
                      {result.extracted_text && (
                        <div style={{ marginTop: '1rem' }}>
                          <h5 style={{ color: '#6b7280', marginBottom: '0.5rem', fontSize: '14px' }}>
                            {dataSource === 'props' ? 'Commentaires' : 'Texte extrait'}
                          </h5>
                          <div style={{ 
                            padding: '0.5rem', 
                            backgroundColor: 'white', 
                            borderRadius: '0.25rem',
                            border: '1px solid #cbd5e1',
                            maxHeight: '120px',
                            overflow: 'auto',
                            fontFamily: 'monospace',
                            fontSize: '12px'
                          }}>
                            {result.extracted_text.substring(0, 500)}
                            {result.extracted_text.length > 500 && '...'}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card">
            <div className="card-body">
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                {dataSource === 'props' ? 
                  <GraduationCap style={{ width: '48px', height: '48px', color: '#9ca3af', margin: '0 auto 1rem' }} /> :
                  <FileText style={{ width: '48px', height: '48px', color: '#9ca3af', margin: '0 auto 1rem' }} />
                }
                <h3>
                {dataSource === 'props' ? 'Aucune note trouvée' : 'Aucune correction trouvée'}
                </h3>
                <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
                  {dataSource === 'props' ? 
                    'Cet étudiant n\'a pas encore de notes enregistrées dans le système.' :
                    'Aucune correction mobile n\'a été trouvée pour cet étudiant.'
                  }
                </p>
                {dataSource === 'api' && (
                  <button className="btn btn-primary" onClick={() => loadStudentResults()}>
                    <RefreshCw style={{ width: '16px', height: '16px', marginRight: '0.5rem' }} />
                    Vérifier à nouveau
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Interface pour vue globale (tous les étudiants)
  const renderAllStudentsView = () => {
    if (loading) {
      return (
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
              <p>Chargement des résultats...</p>
            </div>
          </div>
        </div>
      );
    }

    if (error && allStudentsResults.length === 0) {
      return (
        <div className="card">
          <div className="card-body">
            <div className="alert alert-danger">
              <AlertCircle style={{ width: '20px', height: '20px', display: 'inline', marginRight: '0.5rem' }} />
              {error}
            </div>
            <button className="btn btn-primary" onClick={() => loadAllResults()}>
              Réessayer
            </button>
          </div>
        </div>
      );
    }

    const stats = getPerformanceStats();

    return (
      <div>
        {/* En-tête avec statistiques globales */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="card-header">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 className="card-title">
                  <BarChart3 style={{ display: 'inline', marginRight: '0.5rem' }} />
                  Vue Globale des {dataSource === 'props' ? 'Notes' : 'Corrections'}
                </h3>
                <p className="card-subtitle">
                  {allStudentsResults.length} étudiant{allStudentsResults.length > 1 ? 's' : ''} avec des résultats
                  <span style={{ 
                    marginLeft: '1rem', 
                    padding: '0.25rem 0.5rem', 
                    backgroundColor: dataSource === 'props' ? '#dbeafe' : '#dcfce7',
                    color: dataSource === 'props' ? '#1e40af' : '#166534',
                    borderRadius: '0.25rem',
                    fontSize: '0.75rem'
                  }}>
                    {dataSource === 'props' ? 'DONNÉES LOCALES' : 'API MOBILE'}
                  </span>
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                {refreshing && (
                  <RefreshCw style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
                )}
                <button 
                  className="btn btn-secondary btn-sm" 
                  onClick={() => loadAllResults()}
                  disabled={refreshing}
                >
                  <RefreshCw style={{ width: '16px', height: '16px', marginRight: '0.5rem' }} />
                  Actualiser
                </button>
              </div>
            </div>
          </div>
          
          {/* Statistiques globales */}
          {stats && (
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                <div style={{ textAlign: 'center', padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '0.5rem' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3b82f6' }}>
                    {stats.average}/20
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Moyenne générale</div>
                </div>
                <div style={{ textAlign: 'center', padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '0.5rem' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>
                    {stats.studentsWithResults}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Étudiants évalués</div>
                </div>
                <div style={{ textAlign: 'center', padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '0.5rem' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#6366f1' }}>
                    {stats.totalCorrections}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{dataSource === 'props' ? 'Notes' : 'Corrections'}</div>
                </div>
                <div style={{ textAlign: 'center', padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '0.5rem' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f59e0b' }}>
                    {stats.trend === 'up' ? '↗' : stats.trend === 'down' ? '↘' : '→'}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Tendance</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Liste des étudiants avec leurs résultats */}
        {allStudentsResults.length > 0 ? (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {allStudentsResults.map((student) => (
              <div key={student.matricule} className="card">
                <div className="card-body">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                    <div>
                      <h4 style={{ margin: '0 0 0.5rem 0', color: '#1f2937' }}>
                        <User style={{ width: '18px', height: '18px', display: 'inline', marginRight: '0.5rem' }} />
                        {student.nom || `Étudiant ${student.matricule}`}
                      </h4>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.25rem' }}>
                        <span style={{ fontSize: '14px', color: '#6b7280' }}>
                          Matricule: {student.matricule}
                        </span>
                      </div>
                      {student.lastUpdate && (
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <Clock style={{ width: '16px', height: '16px', marginRight: '0.5rem', color: '#6b7280' }} />
                          <span style={{ fontSize: '14px', color: '#6b7280' }}>
                            Dernière mise à jour: {formatDate(student.lastUpdate)}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div style={{ textAlign: 'center' }}>
                      <div style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '0.5rem',
                        fontWeight: 'bold',
                        fontSize: '18px',
                        backgroundColor: getScoreBgColor(student.averageScore),
                        color: getScoreColor(student.averageScore)
                      }}>
                        {student.averageScore.toFixed(1)}/20
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '0.25rem' }}>
                        {student.totalResults} {dataSource === 'props' ? 'note' : 'correction'}{student.totalResults > 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>

                  {/* Détails des résultats de l'étudiant */}
                  <div style={{ marginTop: '1rem' }}>
                    <button 
                      className="btn btn-secondary btn-sm"
                      onClick={() => setSelectedResult(selectedResult === student.matricule ? null : student.matricule)}
                    >
                      <Eye style={{ width: '14px', height: '14px', marginRight: '0.25rem' }} />
                      {selectedResult === student.matricule ? 'Masquer' : 'Voir les détails'}
                    </button>

                    {selectedResult === student.matricule && (
                      <div style={{ 
                        marginTop: '1rem', 
                        padding: '1rem', 
                        backgroundColor: '#f8fafc',
                        borderRadius: '0.375rem',
                        border: '1px solid #e2e8f0'
                      }}>
                        <h5 style={{ marginBottom: '0.75rem', fontSize: '16px' }}>
                          Détails des {dataSource === 'props' ? 'notes' : 'corrections'}
                        </h5>
                        
                        {student.results.length > 0 ? (
                          <div style={{ display: 'grid', gap: '0.75rem' }}>
                            {student.results.map((result, index) => (
                              <div key={result.id} style={{ 
                                padding: '0.75rem', 
                                backgroundColor: 'white', 
                                borderRadius: '0.375rem',
                                border: '1px solid #e5e7eb'
                              }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <div>
                                    <strong>{result.subject_name || result.subject_code || 'Matière'}</strong>
                                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                                      {formatDate(result.created_at)}
                                    </div>
                                  </div>
                                  <div style={{
                                    padding: '0.25rem 0.5rem',
                                    borderRadius: '0.25rem',
                                    fontWeight: 'bold',
                                    fontSize: '14px',
                                    backgroundColor: getScoreBgColor(result.score),
                                    color: getScoreColor(result.score)
                                  }}>
                                    {result.score.toFixed(1)}/20
                                  </div>
                                </div>
                                {result.feedback && (
                                  <div style={{ marginTop: '0.5rem', fontSize: '13px', color: '#4b5563' }}>
                                    {result.feedback}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div style={{ textAlign: 'center', padding: '1rem', color: '#6b7280' }}>
                            Aucun détail disponible
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card">
            <div className="card-body">
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <FileText style={{ width: '48px', height: '48px', color: '#9ca3af', margin: '0 auto 1rem' }} />
                <h3>Aucun résultat trouvé</h3>
                <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
                  {dataSource === 'props' ? 
                    'Aucune note n\'a été enregistrée dans le système.' :
                    'Aucune correction mobile n\'a été trouvée.'
                  }
                </p>
                <button className="btn btn-primary" onClick={() => loadAllResults()}>
                  <RefreshCw style={{ width: '16px', height: '16px', marginRight: '0.5rem' }} />
                  Actualiser
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Styles CSS pour l'animation de rotation
  const styles = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      <style>{styles}</style>
      
      {/* En-tête avec sélecteur de vue */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, color: '#1f2937' }}>
          {viewMode === 'individual' ? 'Résultats de l\'Étudiant' : 'Vue Globale des Résultats'}
        </h2>
        
        {students.length > 0 && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              className={`btn ${viewMode === 'individual' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setViewMode('individual')}
              disabled={!studentMatricule}
            >
              <User style={{ width: '16px', height: '16px', marginRight: '0.5rem' }} />
              Vue Individuelle
            </button>
            <button 
              className={`btn ${viewMode === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setViewMode('all')}
            >
              <BarChart3 style={{ width: '16px', height: '16px', marginRight: '0.5rem' }} />
              Vue Globale
            </button>
          </div>
        )}
      </div>

      {/* Panneau de debug (optionnel) */}
      {process.env.NODE_ENV === 'development' && renderDebugPanel()}

      {/* Contenu principal */}
      {viewMode === 'individual' ? renderIndividualView() : renderAllStudentsView()}
    </div>
  );
};

export default StudentResults;