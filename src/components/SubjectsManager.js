import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Edit2, Trash2, Save, X, AlertCircle, CheckCircle, Wifi, WifiOff, Send, Mail, Award, TrendingUp, Users } from 'lucide-react';

// ===== MODAL ENVOI CODE PAR EMAIL =====
const SendCodeModal = ({ 
  subject, 
  teachers = [],
  isOpen, 
  onClose, 
  onSend 
}) => {
  const [selectedTeachers, setSelectedTeachers] = useState([]);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState(null);

  // Filtrer les enseignants qui enseignent cette matière OU sont titulaires de la classe
  const filteredTeachers = teachers.filter(teacher => {
    if (!teacher || !subject) return false;
    
    const teacherSubject = teacher.subject?.toLowerCase().trim() || '';
    const currentSubject = subject.name?.toLowerCase().trim() || '';
    const teacherClasses = Array.isArray(teacher.classes) ? teacher.classes : [];
    const subjectClass = subject.class || '';
    
    // Vérifie si le prof enseigne cette matière ET enseigne dans cette classe
    const teachesSubject = teacherSubject === currentSubject;
    const teachesInThisClass = subjectClass && teacherClasses.includes(subjectClass);
    const isSubjectTeacher = teachesSubject && teachesInThisClass;
    
    // OU est titulaire de la classe (même s'il n'enseigne pas cette matière)
    const isClassTeacher = !teachesSubject && teachesInThisClass;
    
    return isSubjectTeacher || isClassTeacher;
  });

  useEffect(() => {
    if (isOpen && subject) {
      console.log('=== MODAL ENVOI CODE ===');
      console.log('Matière:', subject);
      console.log('Tous les enseignants:', teachers);
      console.log('Enseignants filtrés:', filteredTeachers);
      setSelectedTeachers([]);
      setMessage(null);
    }
  }, [isOpen, subject, teachers]);

  if (!isOpen || !subject) {
    return null;
  }

  const handleToggleTeacher = (teacherId) => {
    setSelectedTeachers(prev => {
      const isAlreadySelected = prev.some(id => String(id) === String(teacherId));
      return isAlreadySelected
        ? prev.filter(id => String(id) !== String(teacherId))
        : [...prev, teacherId];
    });
  };

  const handleSelectAll = () => {
    if (selectedTeachers.length === filteredTeachers.length) {
      setSelectedTeachers([]);
    } else {
      const allTeacherIds = filteredTeachers.map(t => t.id);
      setSelectedTeachers(allTeacherIds);
    }
  };

  const handleSend = async () => {
    if (selectedTeachers.length === 0) {
      setMessage({ type: 'error', text: 'Veuillez sélectionner au moins un enseignant' });
      return;
    }

    setSending(true);
    setMessage(null);

    try {
      const selectedEmails = filteredTeachers
        .filter(t => selectedTeachers.includes(t.id))
        .map(t => ({ 
          name: t.name, 
          email: t.email,
          type: getTeacherType(t, subject)
        }));
      
      const success = await onSend(subject.code, subject.name, selectedEmails);
      
      if (success) {
        setMessage({ 
          type: 'success', 
          text: `Code "${subject.code}" envoyé à ${selectedEmails.length} enseignant(s) ✓` 
        });
        setTimeout(() => {
          onClose();
          setSelectedTeachers([]);
          setMessage(null);
        }, 2500);
      } else {
        setMessage({ type: 'error', text: 'Erreur lors de l\'envoi des emails' });
      }
    } catch (error) {
      console.error('💥 Erreur envoi:', error);
      setMessage({ type: 'error', text: 'Erreur: ' + error.message });
    } finally {
      setSending(false);
    }
  };

  // Déterminer le type d'enseignant
  const getTeacherType = (teacher, subject) => {
    const teacherSubject = teacher.subject?.toLowerCase() || '';
    const currentSubject = subject.name?.toLowerCase() || '';
    const teacherClasses = Array.isArray(teacher.classes) ? teacher.classes : [];
    const subjectClass = subject.class || '';
    
    const teachesSubject = teacherSubject.includes(currentSubject) || 
                          currentSubject.includes(teacherSubject);
    const isClassTeacher = subjectClass && teacherClasses.includes(subjectClass);
    
    if (teachesSubject && isClassTeacher) {
      return 'Enseignant et Titulaire';
    } else if (teachesSubject) {
      return 'Enseignant de la matière';
    } else if (isClassTeacher) {
      return 'Titulaire de la classe';
    }
    
    return 'Enseignant';
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
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        width: '90%',
        maxWidth: '700px',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '48px',
              height: '48px',
              backgroundColor: '#3b82f6',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Send style={{ width: '24px', height: '24px', color: 'white' }} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937' }}>
                Envoyer le code par email
              </h2>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#6b7280' }}>
                {subject?.name || 'Matière inconnue'} • Code: <strong>{subject?.code || 'N/A'}</strong>
                {subject?.class && ` • Classe: ${subject.class}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={sending}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: 'none',
              backgroundColor: '#f3f4f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: sending ? 'not-allowed' : 'pointer'
            }}
          >
            <X style={{ width: '16px', height: '16px', color: '#6b7280' }} />
          </button>
        </div>

        {/* Message */}
        {message && (
          <div style={{
            margin: '1rem 1.5rem 0',
            padding: '0.75rem 1rem',
            backgroundColor: message.type === 'success' ? '#ecfdf5' : '#fef2f2',
            border: `1px solid ${message.type === 'success' ? '#6ee7b7' : '#fecaca'}`,
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            {message.type === 'success' ? (
              <CheckCircle style={{ width: '18px', height: '18px', color: '#059669' }} />
            ) : (
              <AlertCircle style={{ width: '18px', height: '18px', color: '#dc2626' }} />
            )}
            <span style={{ 
              fontSize: '0.875rem', 
              fontWeight: '500',
              color: message.type === 'success' ? '#065f46' : '#dc2626' 
            }}>
              {message.text}
            </span>
          </div>
        )}

        {/* Contenu */}
        <div style={{ padding: '1.5rem' }}>
          {/* Info */}
          <div style={{
            padding: '1rem',
            backgroundColor: '#eff6ff',
            borderRadius: '8px',
            border: '1px solid #bfdbfe',
            marginBottom: '1.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Mail style={{ width: '16px', height: '16px', color: '#2563eb' }} />
              <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1e40af' }}>
                Enseignants concernés
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#1e40af', margin: 0 }}>
              Enseignants de <strong>{subject?.name || 'cette matière'}</strong>
              {subject?.class && ` et titulaires de la classe ${subject.class}`}.
              {filteredTeachers.length === 0 && ' Aucun enseignant concerné trouvé.'}
            </p>
          </div>

          {/* Bouton Tout sélectionner */}
          {filteredTeachers.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <button
                onClick={handleSelectAll}
                disabled={sending}
                style={{
                  padding: '0.5rem 1rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  backgroundColor: 'white',
                  color: '#374151',
                  fontSize: '0.75rem',
                  fontWeight: '500',
                  cursor: sending ? 'not-allowed' : 'pointer'
                }}
              >
                {selectedTeachers.length === filteredTeachers.length ? '✓ Tout désélectionner' : 'Tout sélectionner'}
              </button>
              <span style={{ fontSize: '0.75rem', color: '#6b7280', marginLeft: '1rem' }}>
                {selectedTeachers.length} / {filteredTeachers.length} sélectionné(s)
              </span>
            </div>
          )}

          {/* Liste des enseignants */}
          {filteredTeachers.length === 0 ? (
            <div style={{
              padding: '3rem',
              textAlign: 'center',
              backgroundColor: '#f9fafb',
              borderRadius: '8px',
              border: '2px dashed #e5e7eb'
            }}>
              <AlertCircle style={{ 
                width: '48px', 
                height: '48px', 
                color: '#9ca3af', 
                margin: '0 auto 1rem' 
              }} />
              <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: 0 }}>
                Aucun enseignant concerné trouvé.
              </p>
              <p style={{ color: '#9ca3af', fontSize: '0.75rem', marginTop: '0.5rem' }}>
                Vérifiez que des enseignants sont assignés à cette matière ou à la classe {subject?.class}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '400px', overflowY: 'auto' }}>
              {filteredTeachers.map(teacher => {
                const isSelected = selectedTeachers.some(id => String(id) === String(teacher.id));
                const teacherType = getTeacherType(teacher, subject);
                
                return (
                  <div 
                    key={teacher.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '1rem',
                      backgroundColor: isSelected ? '#dbeafe' : '#f9fafb',
                      borderRadius: '8px',
                      border: `2px solid ${isSelected ? '#3b82f6' : '#e5e7eb'}`,
                      cursor: sending ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onClick={() => !sending && handleToggleTeacher(teacher.id)}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleTeacher(teacher.id)}
                      disabled={sending}
                      style={{ 
                        marginRight: '1rem', 
                        cursor: sending ? 'not-allowed' : 'pointer',
                        width: '18px',
                        height: '18px'
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div style={{
                      width: '40px',
                      height: '40px',
                      backgroundColor: teacherType.includes('Titulaire') ? '#10b981' : '#8b5cf6',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '1rem',
                      marginRight: '1rem',
                      flexShrink: 0
                    }}>
                      {teacher?.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: '600', fontSize: '0.875rem', color: '#1f2937' }}>
                        {teacher?.name || 'Nom inconnu'}
                      </div>
                      <div style={{ 
                        fontSize: '0.75rem', 
                        color: '#6b7280', 
                        marginTop: '0.25rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        <Mail style={{ width: '12px', height: '12px' }} />
                        {teacher?.email || 'Email non disponible'}
                      </div>
                      <div style={{
                        fontSize: '0.7rem',
                        color: teacherType.includes('Titulaire') ? '#059669' : '#7c3aed',
                        fontWeight: '500',
                        marginTop: '0.25rem',
                        padding: '0.25rem 0.5rem',
                        backgroundColor: teacherType.includes('Titulaire') ? '#d1fae5' : '#f3f0ff',
                        borderRadius: '4px',
                        display: 'inline-block'
                      }}>
                        {teacherType}
                      </div>
                    </div>
                    {isSelected && (
                      <CheckCircle style={{ width: '20px', height: '20px', color: '#3b82f6', flexShrink: 0 }} />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer avec boutons */}
        <div style={{
          padding: '1.5rem',
          borderTop: '1px solid #e5e7eb',
          backgroundColor: '#f9fafb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            {selectedTeachers.length > 0 && (
              <span style={{ fontWeight: '500', color: '#3b82f6' }}>
                {selectedTeachers.length} enseignant(s) sélectionné(s)
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={onClose}
              disabled={sending}
              style={{
                padding: '0.75rem 1.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                backgroundColor: 'white',
                color: '#374151',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: sending ? 'not-allowed' : 'pointer',
                opacity: sending ? 0.5 : 1
              }}
            >
              Annuler
            </button>
            
            <button
              onClick={handleSend}
              disabled={sending || selectedTeachers.length === 0 || filteredTeachers.length === 0}
              style={{
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: '6px',
                backgroundColor: '#3b82f6',
                color: 'white',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: (sending || selectedTeachers.length === 0 || filteredTeachers.length === 0) ? 'not-allowed' : 'pointer',
                opacity: (sending || selectedTeachers.length === 0 || filteredTeachers.length === 0) ? 0.5 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              {sending ? (
                <>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <Send style={{ width: '16px', height: '16px' }} />
                  Envoyer le code
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ===== MODAL MODIFICATION MATIÈRE =====
const SubjectEditModal = ({ 
  subject, 
  isOpen, 
  onClose, 
  onSave 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    coefficient: 1,
    description: '',
    class: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (subject) {
      setFormData({
        name: subject.name || '',
        coefficient: subject.coefficient || 1,
        description: subject.description || '',
        class: subject.class || ''
      });
      setError(null);
    }
  }, [subject]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'coefficient' ? parseInt(value) || 1 : value
    }));
  };

  const validateForm = () => {
    const errors = [];
    
    if (!formData.name.trim()) {
      errors.push('Le nom de la matière est requis');
    }
    
    if (formData.coefficient < 1 || formData.coefficient > 5) {
      errors.push('Le coefficient doit être entre 1 et 5');
    }

    return errors;
  };

  const handleSave = async () => {
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(validationErrors.join(', '));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const success = await onSave(subject.id, formData);
      
      if (success) {
        onClose();
      } else {
        setError('Erreur lors de la modification');
      }
    } catch (error) {
      console.error('💥 Erreur sauvegarde:', error);
      setError('Erreur lors de la sauvegarde: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !subject) return null;

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
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        width: '90%',
        maxWidth: '600px',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              backgroundColor: '#3b82f6',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Edit2 style={{ width: '20px', height: '20px', color: 'white' }} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937' }}>
                Modifier la matière
              </h2>
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>
                {subject.name} - Code: {subject.code}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: 'none',
              backgroundColor: '#f3f4f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            <X style={{ width: '16px', height: '16px', color: '#6b7280' }} />
          </button>
        </div>

        {/* Message d'erreur */}
        {error && (
          <div style={{
            margin: '1rem 1.5rem 0',
            padding: '0.75rem',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertCircle style={{ width: '16px', height: '16px', color: '#dc2626' }} />
            <span style={{ fontSize: '0.875rem', color: '#dc2626' }}>{error}</span>
          </div>
        )}

        {/* Contenu du formulaire */}
        <div style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Nom de la matière */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                Nom de la matière *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  boxSizing: 'border-box'
                }}
                placeholder="Ex: Mathématiques"
              />
            </div>

            {/* Coefficient */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                Coefficient *
              </label>
              <select
                name="coefficient"
                value={formData.coefficient}
                onChange={handleChange}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  backgroundColor: 'white',
                  boxSizing: 'border-box'
                }}
              >
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
                <option value={4}>4</option>
                <option value={5}>5</option>
              </select>
            </div>

            {/* Classe */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                Classe
              </label>
              <input
                type="text"
                name="class"
                value={formData.class}
                onChange={handleChange}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  boxSizing: 'border-box'
                }}
                placeholder="Ex: Terminale A, 1ère B, etc."
              />
            </div>

            {/* Description */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                Description (optionnelle)
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                disabled={loading}
                rows={3}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  resize: 'vertical',
                  boxSizing: 'border-box'
                }}
                placeholder="Description de la matière..."
              />
            </div>
          </div>
        </div>

        {/* Footer avec boutons */}
        <div style={{
          padding: '1.5rem',
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '0.75rem'
        }}>
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              padding: '0.75rem 1.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              backgroundColor: 'white',
              color: '#374151',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.5 : 1
            }}
          >
            Annuler
          </button>
          
          <button
            onClick={handleSave}
            disabled={loading || !formData.name.trim()}
            style={{
              padding: '0.75rem 1.5rem',
              border: 'none',
              borderRadius: '6px',
              backgroundColor: '#3b82f6',
              color: 'white',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: (loading || !formData.name.trim()) ? 'not-allowed' : 'pointer',
              opacity: (loading || !formData.name.trim()) ? 0.5 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            {loading ? (
              <>
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                Sauvegarde...
              </>
            ) : (
              <>
                <Save style={{ width: '16px', height: '16px' }} />
                Sauvegarder
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ===== COMPOSANT PRINCIPAL SUBJECTSMANAGER =====
const SubjectsManager = ({ 
  subjects = [], 
  teachers = [],
  onAddSubject, 
  onEditSubject, 
  onDeleteSubject,
  onSendCode,
  apiStatus 
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [sendingSubject, setSendingSubject] = useState(null);
  const [showSendModal, setShowSendModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [newSubject, setNewSubject] = useState({ 
    name: '', 
    coefficient: 1,
    description: '',
    class: ''
  });
  const [formError, setFormError] = useState(null);

  const generateSubjectCode = (name) => {
    const cleanName = name.replace(/[^a-zA-Z]/g, '').substring(0, 4).toUpperCase();
    const year = new Date().getFullYear();
    return `${cleanName}${year}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!newSubject.name.trim()) {
      setFormError('Le nom de la matière est requis');
      return;
    }

    const subject = {
      ...newSubject,
      code: generateSubjectCode(newSubject.name)
    };

    const success = await onAddSubject(subject);
    
    if (success) {
      setNewSubject({ name: '', coefficient: 1, description: '', class: '' });
      setShowAddForm(false);
    }
  };

  const handleEdit = (subject) => {
    setEditingSubject(subject);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingSubject(null);
  };

  const handleSendCode = (subject) => {
    setSendingSubject(subject);
    setShowSendModal(true);
  };

  const handleCloseSendModal = () => {
    setShowSendModal(false);
    setSendingSubject(null);
  };

  const handleDelete = async (subject) => {
    setDeletingId(subject.id);
    
    try {
      const success = await onDeleteSubject(subject.id);
      if (!success) {
        console.error('Échec suppression matière');
      }
    } finally {
      setDeletingId(null);
    }
  };

  const isOffline = apiStatus !== 'connected';

  return (
    <div className="card">
      {/* Header avec statut et statistiques */}
      <div className="card-header" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        padding: '1.5rem 2rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <h2 className="card-title" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            margin: 0,
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#1f2937'
          }}>
            <BookOpen style={{ width: '24px', height: '24px' }} />
            Gestion des Matières
          </h2>
          
          {/* Indicateur de statut */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            padding: '0.25rem 0.5rem',
            borderRadius: '0.375rem',
            fontSize: '0.75rem',
            fontWeight: '500',
            backgroundColor: isOffline ? '#fee2e2' : '#d1fae5',
            color: isOffline ? '#991b1b' : '#065f46'
          }}>
            {isOffline ? (
              <WifiOff style={{ width: '12px', height: '12px' }} />
            ) : (
              <Wifi style={{ width: '12px', height: '12px' }} />
            )}
            {isOffline ? 'Hors ligne' : 'En ligne'}
          </div>
        </div>
        
        {/* STATISTIQUE PROFESSIONNELLE EN HAUT - TOTAL MATIERES SEULEMENT */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            borderRadius: '12px',
            padding: '1rem 1.5rem',
            color: 'white',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
            minWidth: '140px'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Award style={{ width: '20px', height: '20px' }} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', opacity: 0.9, marginBottom: '0.25rem' }}>
                  Total Matières
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', lineHeight: 1 }}>
                  {subjects.length}
                </div>
              </div>
            </div>
          </div>
        
          <button
            onClick={() => setShowAddForm(true)}
            disabled={isOffline}
            className="btn btn-primary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              backgroundColor: '#8b5cf6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: isOffline ? 'not-allowed' : 'pointer',
              opacity: isOffline ? 0.5 : 1,
              transition: 'all 0.2s'
            }}
          >
            <Plus style={{ width: '16px', height: '16px' }} />
            Ajouter Matière
          </button>
        </div>
      </div>

      {/* Message hors ligne */}
      {isOffline && (
        <div style={{
          margin: '1rem',
          padding: '0.75rem',
          backgroundColor: '#fef3c7',
          border: '1px solid #f59e0b',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <AlertCircle style={{ width: '16px', height: '16px', color: '#d97706' }} />
          <span style={{ fontSize: '0.875rem', color: '#92400e' }}>
            Mode hors ligne - Les modifications ne sont pas disponibles
          </span>
        </div>
      )}

      {/* Formulaire d'ajout */}
      {showAddForm && (
        <div className="form-container" style={{
          margin: '1rem',
          padding: '1.5rem',
          backgroundColor: '#f8fafc',
          borderRadius: '8px',
          border: '1px solid #e2e8f0'
        }}>
          <h3 className="form-title" style={{
            fontSize: '1.125rem',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '1rem'
          }}>
            Nouvelle Matière
          </h3>
          
          {formError && (
            <div style={{
              marginBottom: '1rem',
              padding: '0.75rem',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <AlertCircle style={{ width: '16px', height: '16px', color: '#dc2626' }} />
              <span style={{ fontSize: '0.875rem', color: '#dc2626' }}>{formError}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="form-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1rem',
              marginBottom: '1rem'
            }}>
              <div className="form-group">
                <label className="form-label" style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '0.25rem'
                }}>
                  Nom de la matière *
                </label>
                <input
                  type="text"
                  value={newSubject.name}
                  onChange={(e) => {
                    setNewSubject({...newSubject, name: e.target.value});
                    setFormError(null);
                  }}
                  className="form-input"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Ex: Mathématiques"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label" style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '0.25rem'
                }}>
                  Coefficient *
                </label>
                <select
                  value={newSubject.coefficient}
                  onChange={(e) => setNewSubject({...newSubject, coefficient: parseInt(e.target.value)})}
                  className="form-select"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    backgroundColor: 'white',
                    boxSizing: 'border-box'
                  }}
                  required
                >
                  <option value={1}>1</option>
                  <option value={2}>2</option>
                  <option value={3}>3</option>
                  <option value={4}>4</option>
                  <option value={5}>5</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '0.25rem'
                }}>
                  Classe
                </label>
                <input
                  type="text"
                  value={newSubject.class}
                  onChange={(e) => setNewSubject({...newSubject, class: e.target.value})}
                  className="form-input"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Ex: Terminale A, 1ère B, etc."
                />
              </div>
            </div>
            
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label" style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '0.25rem'
              }}>
                Description (optionnelle)
              </label>
              <textarea
                value={newSubject.description}
                onChange={(e) => setNewSubject({...newSubject, description: e.target.value})}
                rows={3}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  resize: 'vertical',
                  boxSizing: 'border-box'
                }}
                placeholder="Description de la matière, objectifs, programme..."
              />
            </div>
            
            {newSubject.name && (
              <div className="info-box" style={{
                padding: '0.75rem',
                backgroundColor: '#e0f2fe',
                borderRadius: '6px',
                marginBottom: '1rem'
              }}>
                <p className="info-text" style={{
                  fontSize: '0.875rem',
                  color: '#0277bd',
                  margin: 0
                }}>
                  <strong>Code généré :</strong> {generateSubjectCode(newSubject.name)}
                </p>
              </div>
            )}

            <div className="form-actions" style={{
              display: 'flex',
              gap: '0.75rem',
              justifyContent: 'flex-end'
            }}>
              <button 
                type="submit" 
                className="btn btn-success"
                style={{
                  padding: '0.75rem 1.5rem',
                  border: 'none',
                  borderRadius: '6px',
                  backgroundColor: '#16a34a',
                  color: 'white',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <Save style={{ width: '16px', height: '16px' }} />
                Enregistrer
              </button>
              
              <button 
                type="button" 
                onClick={() => {
                  setShowAddForm(false);
                  setNewSubject({ name: '', coefficient: 1, description: '', class: '' });
                  setFormError(null);
                }}
                className="btn btn-secondary"
                style={{
                  padding: '0.75rem 1.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  backgroundColor: 'white',
                  color: '#374151',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <X style={{ width: '16px', height: '16px' }} />
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Liste des matières */}
      <div className="table-container" style={{ margin: '1rem', overflowX: 'auto' }}>
        <table className="data-table" style={{
          width: '100%',
          borderCollapse: 'collapse',
          backgroundColor: 'white',
          borderRadius: '8px',
          overflow: 'hidden',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
        }}>
          <thead style={{ backgroundColor: '#f8fafc' }}>
            <tr>
              <th className="table-header" style={{
                padding: '0.75rem',
                textAlign: 'left',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#374151',
                borderBottom: '1px solid #e5e7eb'
              }}>
                Matière
              </th>
              <th className="table-header" style={{
                padding: '0.75rem',
                textAlign: 'left',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#374151',
                borderBottom: '1px solid #e5e7eb'
              }}>
                Code Généré
              </th>
              <th className="table-header" style={{
                padding: '0.75rem',
                textAlign: 'left',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#374151',
                borderBottom: '1px solid #e5e7eb'
              }}>
                Classe
              </th>
              <th className="table-header text-center" style={{
                padding: '0.75rem',
                textAlign: 'center',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#374151',
                borderBottom: '1px solid #e5e7eb'
              }}>
                Coefficient
              </th>
              <th className="table-header text-center" style={{
                padding: '0.75rem',
                textAlign: 'center',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#374151',
                borderBottom: '1px solid #e5e7eb'
              }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {subjects.length === 0 ? (
              <tr>
                <td colSpan="5" className="table-empty" style={{
                  padding: '3rem',
                  textAlign: 'center',
                  color: '#6b7280',
                  fontSize: '0.875rem'
                }}>
                  {isOffline ? 
                    'Aucune données disponible en mode hors ligne' : 
                    'Aucune matière enregistrée. Ajoutez votre première matière.'
                  }
                </td>
              </tr>
            ) : (
              subjects.map(subject => (
                <tr key={subject.id} className="table-row" style={{
                  borderBottom: '1px solid #e5e7eb'
                }}>
                  <td className="table-cell" style={{ padding: '0.75rem' }}>
                    <div>
                      <div className="table-cell-primary" style={{
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: '#1f2937'
                      }}>
                        {subject.name}
                      </div>
                      {subject.description && (
                        <div style={{
                          fontSize: '0.75rem',
                          color: '#6b7280',
                          marginTop: '0.25rem'
                        }}>
                          {subject.description}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="table-cell" style={{ padding: '0.75rem' }}>
                    <span className="badge badge-primary" style={{
                      display: 'inline-block',
                      padding: '0.25rem 0.5rem',
                      backgroundColor: '#dbeafe',
                      color: '#1e40af',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      borderRadius: '0.375rem'
                    }}>
                      {subject.code}
                    </span>
                  </td>
                  <td className="table-cell" style={{ padding: '0.75rem' }}>
                    {subject.class ? (
                      <span className="badge badge-class" style={{
                        display: 'inline-block',
                        padding: '0.25rem 0.5rem',
                        backgroundColor: '#f0fdf4',
                        color: '#166534',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        borderRadius: '0.375rem',
                        border: '1px solid #bbf7d0'
                      }}>
                        <Users style={{ width: '12px', height: '12px', marginRight: '0.25rem', display: 'inline' }} />
                        {subject.class}
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: '#9ca3af', fontStyle: 'italic' }}>
                        Non assigné
                      </span>
                    )}
                  </td>
                  <td className="table-cell text-center" style={{
                    padding: '0.75rem',
                    textAlign: 'center'
                  }}>
                    <span className="coefficient-badge" style={{
                      display: 'inline-block',
                      width: '24px',
                      height: '24px',
                      backgroundColor: '#10b981',
                      color: 'white',
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto'
                    }}>
                      {subject.coefficient}
                    </span>
                  </td>
                  <td className="table-cell text-center" style={{
                    padding: '0.75rem',
                    textAlign: 'center'
                  }}>
                    <div className="action-buttons" style={{
                      display: 'flex',
                      gap: '0.5rem',
                      justifyContent: 'center'
                    }}>
                      {/* Bouton Envoyer Email */}
                      <button 
                        onClick={() => handleSendCode(subject)}
                        disabled={isOffline}
                        className="btn-icon btn-send"
                        title="Envoyer le code par email"
                        style={{
                          padding: '0.5rem',
                          border: '1px solid #93c5fd',
                          borderRadius: '4px',
                          backgroundColor: isOffline ? 'white' : '#dbeafe',
                          color: isOffline ? '#9ca3af' : '#2563eb',
                          cursor: isOffline ? 'not-allowed' : 'pointer',
                          opacity: isOffline ? 0.5 : 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Send style={{ width: '14px', height: '14px' }} />
                      </button>

                      <button 
                        onClick={() => handleEdit(subject)}
                        disabled={isOffline}
                        className="btn-icon btn-edit"
                        title="Modifier"
                        style={{
                          padding: '0.5rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px',
                          backgroundColor: 'white',
                          color: isOffline ? '#9ca3af' : '#3b82f6',
                          cursor: isOffline ? 'not-allowed' : 'pointer',
                          opacity: isOffline ? 0.5 : 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Edit2 style={{ width: '14px', height: '14px' }} />
                      </button>
                      
                      <button 
                        onClick={() => handleDelete(subject)}
                        disabled={isOffline || deletingId === subject.id}
                        className="btn-icon btn-delete"
                        title="Supprimer"
                        style={{
                          padding: '0.5rem',
                          border: '1px solid #fca5a5',
                          borderRadius: '4px',
                          backgroundColor: (deletingId === subject.id) ? '#fca5a5' : 'white',
                          color: isOffline ? '#9ca3af' : '#dc2626',
                          cursor: (isOffline || deletingId === subject.id) ? 'not-allowed' : 'pointer',
                          opacity: (isOffline || deletingId === subject.id) ? 0.5 : 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {deletingId === subject.id ? (
                          <div style={{
                            width: '14px',
                            height: '14px',
                            border: '2px solid rgba(220,38,38,0.3)',
                            borderTop: '2px solid #dc2626',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                          }} />
                        ) : (
                          <Trash2 style={{ width: '14px', height: '14px' }} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de modification */}
      <SubjectEditModal
        subject={editingSubject}
        isOpen={showEditModal}
        onClose={handleCloseEditModal}
        onSave={onEditSubject}
      />

      {/* Modal d'envoi de code */}
      <SendCodeModal
        subject={sendingSubject}
        teachers={teachers}
        isOpen={showSendModal}
        onClose={handleCloseSendModal}
        onSend={onSendCode}
      />

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        .btn-icon:hover:not(:disabled) {
          transform: scale(1.1);
          transition: all 0.2s;
        }
        
        .btn-icon.btn-send:hover:not(:disabled) {
          background-color: #3b82f6 !important;
          color: white !important;
        }
        
        .table-row:hover {
          background-color: #f9fafb;
        }
        
        .card {
          background-color: white;
          border-radius: 0.5rem;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
          border: 1px solid #e5e7eb;
          overflow: hidden;
        }
        
        .card-header {
          border-bottom: 1px solid #e5e7eb;
          background-color: #f8fafc;
        }
        
        .form-input:focus,
        .form-select:focus,
        textarea:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        
        .badge:hover {
          background-color: #bfdbfe;
        }
        
        .coefficient-badge:hover {
          background-color: #059669;
        }

        .badge-class:hover {
          background-color: #dcfce7;
        }
      `}</style>
    </div>
  );
};

export default SubjectsManager;