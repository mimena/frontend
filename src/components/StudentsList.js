import React, { useState } from 'react';
import { Users, Plus, Search, Edit, Trash2, Save, X, UserPlus, User, Calendar, Phone, MapPin, AlertTriangle, CheckCircle, BookOpen } from 'lucide-react';

// Modal de confirmation de suppression
const DeleteConfirmationModal = ({ student, isOpen, onClose, onConfirm, loading }) => {
  if (!isOpen) return null;

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
      zIndex: 2000,
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '0.75rem',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '480px',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          backgroundColor: '#fef2f2'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: '#fee2e2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <AlertTriangle style={{ width: '20px', height: '20px', color: '#dc2626' }} />
          </div>
          <div>
            <h3 style={{ 
              margin: 0, 
              fontSize: '1.25rem', 
              fontWeight: '600', 
              color: '#1f2937' 
            }}>
              Confirmer la suppression
            </h3>
            <p style={{ 
              margin: '0.25rem 0 0 0', 
              fontSize: '0.875rem', 
              color: '#6b7280' 
            }}>
              Cette action est irréversible
            </p>
          </div>
        </div>

        {/* Contenu */}
        <div style={{ padding: '1.5rem' }}>
          <div style={{ 
            backgroundColor: '#f8f9fa', 
            padding: '1rem', 
            borderRadius: '0.5rem',
            border: '1px solid #e9ecef'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <User style={{ width: '16px', height: '16px', color: '#6b7280' }} />
              <span style={{ fontWeight: '600', color: '#374151' }}>Étudiant à supprimer :</span>
            </div>
            <div style={{ paddingLeft: '1.75rem' }}>
              <p style={{ margin: '0.25rem 0', fontSize: '0.875rem', color: '#374151' }}>
                <strong>Nom :</strong> {student?.prenom} {student?.nom}
              </p>
              <p style={{ margin: '0.25rem 0', fontSize: '0.875rem', color: '#374151' }}>
                <strong>Matricule :</strong> {student?.matricule}
              </p>
              <p style={{ margin: '0.25rem 0', fontSize: '0.875rem', color: '#374151' }}>
                <strong>Classe :</strong> {student?.classe}
              </p>
            </div>
          </div>

          <div style={{ 
            marginTop: '1rem',
            padding: '1rem',
            backgroundColor: '#fffbeb',
            border: '1px solid #fed7aa',
            borderRadius: '0.5rem'
          }}>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <AlertTriangle style={{ width: '16px', height: '16px', color: '#d97706', flexShrink: 0 }} />
              <div>
                <p style={{ 
                  margin: 0, 
                  fontSize: '0.875rem', 
                  color: '#92400e',
                  fontWeight: '500'
                }}>
                  Attention
                </p>
                <p style={{ 
                  margin: '0.25rem 0 0 0', 
                  fontSize: '0.75rem', 
                  color: '#92400e',
                  lineHeight: '1.4'
                }}>
                  La suppression de cet étudiant entraînera également la perte de toutes ses notes et données associées. Cette action ne peut pas être annulée.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderTop: '1px solid #e5e7eb',
          backgroundColor: '#fafafa',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '0.75rem'
        }}>
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              padding: '0.625rem 1.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              backgroundColor: 'white',
              color: '#374151',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              opacity: loading ? 0.6 : 1
            }}
            onMouseOver={(e) => !loading && (e.target.style.backgroundColor = '#f9fafb')}
            onMouseOut={(e) => !loading && (e.target.style.backgroundColor = 'white')}
          >
            Annuler
          </button>
          
          <button
            onClick={() => onConfirm(student.id)}
            disabled={loading}
            style={{
              padding: '0.625rem 1.5rem',
              border: 'none',
              borderRadius: '0.5rem',
              backgroundColor: loading ? '#9ca3af' : '#dc2626',
              color: 'white',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s',
              opacity: loading ? 0.6 : 1
            }}
            onMouseOver={(e) => !loading && (e.target.style.backgroundColor = '#b91c1c')}
            onMouseOut={(e) => !loading && (e.target.style.backgroundColor = '#dc2626')}
          >
            <Trash2 style={{ width: '14px', height: '14px' }} />
            {loading ? 'Suppression...' : 'Supprimer définitivement'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Modal de succès
const SuccessModal = ({ isOpen, onClose, message }) => {
  if (!isOpen) return null;

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
      zIndex: 2000,
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '0.75rem',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '400px',
        overflow: 'hidden',
        textAlign: 'center'
      }}>
        <div style={{ padding: '2rem 1.5rem' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: '#d1fae5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem'
          }}>
            <CheckCircle style={{ width: '32px', height: '32px', color: '#10b981' }} />
          </div>
          
          <h3 style={{ 
            margin: '0 0 0.5rem 0', 
            fontSize: '1.25rem', 
            fontWeight: '600', 
            color: '#1f2937' 
          }}>
            Succès
          </h3>
          
          <p style={{ 
            margin: 0, 
            fontSize: '0.875rem', 
            color: '#6b7280',
            lineHeight: '1.5'
          }}>
            {message}
          </p>
        </div>

        <div style={{
          padding: '1rem 1.5rem',
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'center'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '0.625rem 1.5rem',
              border: 'none',
              borderRadius: '0.5rem',
              backgroundColor: '#10b981',
              color: 'white',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#059669'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#10b981'}
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

// Modal d'édition d'étudiant
const EditStudentModal = ({ student, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    matricule: '',
    nom: '',
    prenom: '',
    classe: '',
    dateNaissance: '',
    genre: 'M',
    telephone: '',
    adresse: '',
    notes: {}
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  React.useEffect(() => {
    if (student && isOpen) {
      setFormData({
        matricule: student.matricule || '',
        nom: student.nom || '',
        prenom: student.prenom || '',
        classe: student.classe || '',
        dateNaissance: student.dateNaissance || '',
        genre: student.genre || 'M',
        telephone: student.telephone || '',
        adresse: student.adresse || '',
        notes: student.notes || {}
      });
      setErrors({});
    }
  }, [student, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nom.trim()) {
      newErrors.nom = 'Le nom est requis';
    }
    if (!formData.prenom.trim()) {
      newErrors.prenom = 'Le prénom est requis';
    }
    if (!formData.classe.trim()) {
      newErrors.classe = 'La classe est requise';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    
    try {
      const success = await onSave(student.id, formData);
      
      if (success) {
        onClose();
      }
    } catch (error) {
      console.error('Erreur lors de la modification:', error);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

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
        backgroundColor: 'white',
        borderRadius: '0.5rem',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
        width: '100%',
        maxWidth: '600px',
        maxHeight: '90vh',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.25rem',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#3b82f6'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <User style={{ width: '20px', height: '20px', color: 'white' }} />
            <h2 style={{ 
              margin: 0, 
              fontSize: '1.25rem', 
              fontWeight: '600', 
              color: 'white' 
            }}>
              Modifier l'étudiant
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={saving}
            style={{
              padding: '0.5rem',
              border: 'none',
              borderRadius: '0.25rem',
              backgroundColor: 'transparent',
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.5 : 1
            }}
          >
            <X style={{ width: '18px', height: '18px', color: 'white' }} />
          </button>
        </div>

        {/* Contenu */}
        <div style={{ 
          padding: '1.25rem',
          maxHeight: 'calc(90vh - 120px)',
          overflowY: 'auto'
        }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gap: '1.25rem' }}>
              
              {/* Informations de base */}
              <div>
                <h3 style={{
                  margin: '0 0 1rem 0',
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: '#333',
                  paddingBottom: '0.5rem',
                  borderBottom: '1px solid #e5e7eb'
                }}>
                  Informations personnelles
                </h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: '#555',
                      marginBottom: '0.5rem'
                    }}>
                      Matricule
                    </label>
                    <input
                      type="text"
                      name="matricule"
                      value={formData.matricule}
                      onChange={handleInputChange}
                      disabled={saving}
                      style={{
                        width: '100%',
                        padding: '0.625rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem',
                        backgroundColor: '#f9f9f9',
                        cursor: 'not-allowed'
                      }}
                      readOnly
                    />
                    <small style={{ color: '#777', fontSize: '0.75rem' }}>
                      Le matricule ne peut pas être modifié
                    </small>
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: '#555',
                      marginBottom: '0.5rem'
                    }}>
                      Genre
                    </label>
                    <select
                      name="genre"
                      value={formData.genre}
                      onChange={handleInputChange}
                      disabled={saving}
                      style={{
                        width: '100%',
                        padding: '0.625rem',
                        border: `1px solid ${errors.genre ? '#dc2626' : '#d1d5db'}`,
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem'
                      }}
                    >
                      <option value="M">Masculin</option>
                      <option value="F">Féminin</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: '#555',
                      marginBottom: '0.5rem'
                    }}>
                      Nom *
                    </label>
                    <input
                      type="text"
                      name="nom"
                      value={formData.nom}
                      onChange={handleInputChange}
                      disabled={saving}
                      style={{
                        width: '100%',
                        padding: '0.625rem',
                        border: `1px solid ${errors.nom ? '#dc2626' : '#d1d5db'}`,
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem'
                      }}
                    />
                    {errors.nom && (
                      <span style={{ color: '#dc2626', fontSize: '0.75rem' }}>
                        {errors.nom}
                      </span>
                    )}
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: '#555',
                      marginBottom: '0.5rem'
                    }}>
                      Prénom *
                    </label>
                    <input
                      type="text"
                      name="prenom"
                      value={formData.prenom}
                      onChange={handleInputChange}
                      disabled={saving}
                      style={{
                        width: '100%',
                        padding: '0.625rem',
                        border: `1px solid ${errors.prenom ? '#dc2626' : '#d1d5db'}`,
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem'
                      }}
                    />
                    {errors.prenom && (
                      <span style={{ color: '#dc2626', fontSize: '0.75rem' }}>
                        {errors.prenom}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Informations scolaires */}
              <div>
                <h3 style={{
                  margin: '0 0 1rem 0',
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: '#333',
                  paddingBottom: '0.5rem',
                  borderBottom: '1px solid #e5e7eb'
                }}>
                  Informations scolaires
                </h3>
                
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#555',
                    marginBottom: '0.5rem'
                  }}>
                    Classe *
                  </label>
                  <input
                    type="text"
                    name="classe"
                    value={formData.classe}
                    onChange={handleInputChange}
                    disabled={saving}
                    placeholder="ex: Terminal A, 1ère S, etc."
                    style={{
                      width: '100%',
                      padding: '0.625rem',
                      border: `1px solid ${errors.classe ? '#dc2626' : '#d1d5db'}`,
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem'
                    }}
                  />
                  {errors.classe && (
                    <span style={{ color: '#dc2626', fontSize: '0.75rem' }}>
                      {errors.classe}
                    </span>
                  )}
                </div>
              </div>

              {/* Informations personnelles complémentaires */}
              <div>
                <h3 style={{
                  margin: '0 0 1rem 0',
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: '#333',
                  paddingBottom: '0.5rem',
                  borderBottom: '1px solid #e5e7eb'
                }}>
                  Informations complémentaires
                </h3>
                
                <div style={{ display: 'grid', gap: '1rem' }}>
                  <div>
                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: '#555',
                      marginBottom: '0.5rem'
                    }}>
                      <Calendar style={{ width: '14px', height: '14px' }} />
                      Date de naissance
                    </label>
                    <input
                      type="date"
                      name="dateNaissance"
                      value={formData.dateNaissance}
                      onChange={handleInputChange}
                      disabled={saving}
                      style={{
                        width: '100%',
                        padding: '0.625rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: '#555',
                      marginBottom: '0.5rem'
                    }}>
                      <Phone style={{ width: '14px', height: '14px' }} />
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      name="telephone"
                      value={formData.telephone}
                      onChange={handleInputChange}
                      disabled={saving}
                      placeholder="ex: +261 34 12 345 67"
                      style={{
                        width: '100%',
                        padding: '0.625rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem',
                        backgroundColor: 'white'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: '#555',
                      marginBottom: '0.5rem'
                    }}>
                      <MapPin style={{ width: '14px', height: '14px' }} />
                      Adresse
                    </label>
                    <textarea
                      name="adresse"
                      value={formData.adresse}
                      onChange={handleInputChange}
                      disabled={saving}
                      rows="3"
                      placeholder="Adresse complète..."
                      style={{
                        width: '100%',
                        padding: '0.625rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem',
                        resize: 'vertical',
                        backgroundColor: 'white'
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div style={{
          padding: '1.25rem',
          borderTop: '1px solid #e5e7eb',
          backgroundColor: '#fafafa',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '0.75rem'
        }}>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            style={{
              padding: '0.625rem 1.25rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              backgroundColor: 'white',
              color: '#555',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.5 : 1
            }}
          >
            Annuler
          </button>
          
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={saving}
            style={{
              padding: '0.625rem 1.25rem',
              border: 'none',
              borderRadius: '0.375rem',
              backgroundColor: saving ? '#9ca3af' : '#3b82f6',
              color: 'white',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: saving ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Save style={{ width: '14px', height: '14px' }} />
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Composant principal StudentsList
const StudentsList = ({ students, onAddStudent, onEditStudent, onDeleteStudent, subjects }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [editingStudent, setEditingStudent] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [newStudent, setNewStudent] = useState({
    matricule: '',
    nom: '',
    prenom: '',
    classe: '',
    dateNaissance: '',
    genre: '',
    telephone: '',
    adresse: ''
  });

  // États pour la suppression
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const generateMatricule = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
    return `ETU${year}${random}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    const newErrors = {};
    if (!newStudent.nom.trim()) newErrors.nom = 'Le nom est requis';
    if (!newStudent.prenom.trim()) newErrors.prenom = 'Le prénom est requis';
    if (!newStudent.classe.trim()) newErrors.classe = 'La classe est requise';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSaving(true);
    
    try {
      const student = {
        ...newStudent,
        id: Date.now(),
        matricule: newStudent.matricule || generateMatricule(),
        notes: {}
      };
      
      await onAddStudent(student);
      setNewStudent({
        matricule: '', nom: '', prenom: '', classe: '',
        dateNaissance: '', genre: '', telephone: '', adresse: ''
      });
      setShowAddModal(false);
      setErrors({});
      
      // Afficher le message de succès
      setSuccessMessage(`L'étudiant ${student.prenom} ${student.nom} a été inscrit avec succès.`);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setShowEditModal(true);
  };

  const handleSaveEdit = async (studentId, formData) => {
    try {
      await onEditStudent(studentId, formData);
      setShowEditModal(false);
      setEditingStudent(null);
      
      // Afficher le message de succès
      setSuccessMessage(`Les informations de l'étudiant ont été mises à jour avec succès.`);
      setShowSuccessModal(true);
      return true;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      return false;
    }
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingStudent(null);
  };

  const handleDeleteClick = (student) => {
    setStudentToDelete(student);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async (studentId) => {
    setDeleting(true);
    
    try {
      await onDeleteStudent(studentId);
      setShowDeleteModal(false);
      setStudentToDelete(null);
      
      // Afficher le message de succès
      setSuccessMessage("L'étudiant a été supprimé avec succès.");
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    } finally {
      setDeleting(false);
    }
  };

  const handleCloseDeleteModal = () => {
    if (!deleting) {
      setShowDeleteModal(false);
      setStudentToDelete(null);
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.matricule.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (student.telephone && student.telephone.includes(searchTerm));
    const matchesClass = selectedClass === '' || student.classe === selectedClass;
    return matchesSearch && matchesClass;
  });

  const classes = [...new Set(students.map(s => s.classe))].filter(Boolean);

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">
          <Users className="icon" />
          Liste des Étudiants Inscrits
        </h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary"
        >
          <UserPlus className="icon" />
          Inscrire Étudiant
        </button>
      </div>

      {/* Statistiques en haut */}
      {students.length > 0 && (
        <div style={{
          padding: '1.5rem',
          backgroundColor: '#f8fafc',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem'
          }}>
            <div style={{
              padding: '1.5rem',
              background: 'linear-gradient(135deg, #667eea 0%, #F3F2F4FF 100%)',
              borderRadius: '0.75rem',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: 'rgba(255, 255, 255, 0.9)',
                    marginBottom: '0.5rem'
                  }}>
                    Total Étudiants
                  </div>
                  <div style={{
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    color: 'white'
                  }}>
                    {students.length}
                  </div>
                  <div style={{
                    fontSize: '0.75rem',
                    color: 'rgba(255, 255, 255, 0.8)',
                    marginTop: '0.25rem'
                  }}>
                  </div>
                </div>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Users style={{ width: '24px', height: '24px', color: 'white' }} />
                </div>
              </div>
            </div>

            <div style={{
              padding: '1.5rem',
              background: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)',
              borderRadius: '0.75rem',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: 'rgba(255, 255, 255, 0.9)',
                    marginBottom: '0.5rem'
                  }}>
                    Classes
                  </div>
                  <div style={{
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    color: 'white'
                  }}>
                    {classes.length}
                  </div>
                  <div style={{
                    fontSize: '0.75rem',
                    color: 'rgba(255, 255, 255, 0.8)',
                    marginTop: '0.25rem'
                  }}>
                    
                  </div>
                </div>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <BookOpen style={{ width: '24px', height: '24px', color: 'white' }} />
                </div>
              </div>
            </div>

            <div style={{
              padding: '1.5rem',
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              borderRadius: '0.75rem',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: 'rgba(255, 255, 255, 0.9)',
                    marginBottom: '0.5rem'
                  }}>
                    Garçons
                  </div>
                  <div style={{
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    color: 'white'
                  }}>
                    {students.filter(s => s.genre === 'M').length}
                  </div>
                  <div style={{
                    fontSize: '0.75rem',
                    color: 'rgba(255, 255, 255, 0.8)',
                    marginTop: '0.25rem'
                  }}>
                    
                  </div>
                </div>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <User style={{ width: '24px', height: '24px', color: 'white' }} />
                </div>
              </div>
            </div>

            <div style={{
              padding: '1.5rem',
              background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
              borderRadius: '0.75rem',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: 'rgba(255, 255, 255, 0.9)',
                    marginBottom: '0.5rem'
                  }}>
                    Filles
                  </div>
                  <div style={{
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    color: 'white'
                  }}>
                    {students.filter(s => s.genre === 'F').length}
                  </div>
                  <div style={{
                    fontSize: '0.75rem',
                    color: 'rgba(255, 255, 255, 0.8)',
                    marginTop: '0.25rem'
                  }}>
                
                  </div>
                </div>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <User style={{ width: '24px', height: '24px', color: 'white' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtres de recherche */}
      <div style={{
        padding: '1.5rem',
        backgroundColor: 'white',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          gap: '1rem',
          alignItems: 'center'
        }}>
          {/* Barre de recherche */}
          <div style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center'
          }}>
            <Search style={{
              position: 'absolute',
              left: '1rem',
              width: '18px',
              height: '18px',
              color: '#9ca3af'
            }} />
            <input
              type="text"
              placeholder="Rechercher par nom, prénom, matricule ou téléphone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem 0.75rem 2.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                transition: 'all 0.2s',
                outline: 'none',
                backgroundColor: 'white'
              }}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                style={{
                  position: 'absolute',
                  right: '1rem',
                  padding: '0.25rem',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer'
                }}
              >
                <X style={{ width: '14px', height: '14px', color: '#6b7280' }} />
              </button>
            )}
          </div>

          {/* Filtre par classe */}
          <div style={{ position: 'relative', minWidth: '180px' }}>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 2.25rem 0.75rem 1rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                backgroundColor: 'white',
                cursor: 'pointer',
                appearance: 'none',
                outline: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            >
              <option value="">Toutes les classes</option>
              {classes.map(classe => (
                <option key={classe} value={classe}>{classe}</option>
              ))}
            </select>
            <div style={{
              position: 'absolute',
              right: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
              color: '#6b7280',
              fontSize: '0.75rem'
            }}>▼</div>
          </div>
        </div>

        {/* Résultats de recherche */}
        {(searchTerm || selectedClass) && (
          <div style={{
            marginTop: '1rem',
            padding: '0.75rem 1rem',
            backgroundColor: '#eff6ff',
            borderRadius: '0.375rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            border: '1px solid #bfdbfe'
          }}>
            <span style={{ fontSize: '0.875rem', color: '#1e40af', fontWeight: '500' }}>
              <strong>{filteredStudents.length}</strong> étudiant(s) trouvé(s)
            </span>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedClass('');
              }}
              style={{
                padding: '0.375rem 0.75rem',
                border: 'none',
                borderRadius: '0.375rem',
                backgroundColor: '#3b82f6',
                color: 'white',
                fontSize: '0.75rem',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              Réinitialiser
            </button>
          </div>
        )}
      </div>

      {/* Liste des étudiants */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th className="table-header">Matricule</th>
              <th className="table-header">Nom Complet</th>
              <th className="table-header">Classe</th>
              <th className="table-header">Téléphone</th>
              <th className="table-header text-center">Genre</th>
              <th className="table-header text-center">Statut</th>
              <th className="table-header text-center">Actions</th>
            </tr>
          </thead>
          <tbody style={{ backgroundColor: 'white' }}>
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan="7" className="table-empty">
                  {searchTerm || selectedClass ? 'Aucun étudiant trouvé avec ces critères.' : 'Aucun étudiant inscrit. Inscrivez votre premier étudiant.'}
                </td>
              </tr>
            ) : (
              filteredStudents.map(student => (
                <tr key={student.id} className="table-row" style={{ backgroundColor: 'white' }}>
                  <td className="table-cell">
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      backgroundColor: '#eff6ff',
                      color: '#1e40af',
                      borderRadius: '0.375rem',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      border: '1px solid #bfdbfe'
                    }}>
                      {student.matricule}
                    </span>
                  </td>
                  <td className="table-cell">
                    <div style={{ fontWeight: '600', color: '#1f2937' }}>
                      {student.prenom} {student.nom}
                    </div>
                  </td>
                  <td className="table-cell">
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      backgroundColor: '#f0f9ff',
                      color: '#0369a1',
                      borderRadius: '0.375rem',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      border: '1px solid #bae6fd'
                    }}>
                      {student.classe}
                    </span>
                  </td>
                  <td className="table-cell">
                    {student.telephone ? (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: '#374151',
                        fontSize: '0.875rem'
                      }}>
                        <Phone style={{ width: '14px', height: '14px', color: '#6b7280' }} />
                        {student.telephone}
                      </div>
                    ) : (
                      <span style={{
                        color: '#9ca3af',
                        fontSize: '0.75rem',
                        fontStyle: 'italic'
                      }}>
                        Non renseigné
                      </span>
                    )}
                  </td>
                  <td className="table-cell text-center">
                    {student.genre && (
                      <span style={{
                        padding: '0.25rem 0.5rem',
                        backgroundColor: student.genre === 'M' ? '#dbeafe' : '#fce7f3',
                        color: student.genre === 'M' ? '#1e40af' : '#be185d',
                        borderRadius: '0.375rem',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        border: `1px solid ${student.genre === 'M' ? '#93c5fd' : '#fbcfe8'}`
                      }}>
                        {student.genre === 'M' ? 'M' : 'F'}
                      </span>
                    )}
                  </td>
                  <td className="table-cell text-center">
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      backgroundColor: '#d1fae5',
                      color: '#065f46',
                      borderRadius: '0.375rem',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      border: '1px solid #6ee7b7'
                    }}>
                      Inscrit
                    </span>
                  </td>
                  <td className="table-cell text-center">
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                      <button 
                        style={{
                          padding: '0.5rem',
                          border: '1px solid #bfdbfe',
                          borderRadius: '0.375rem',
                          backgroundColor: 'white',
                          cursor: 'pointer',
                          color: '#3b82f6',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s'
                        }}
                        title="Modifier"
                        onClick={() => handleEdit(student)}
                        onMouseOver={(e) => {
                          e.currentTarget.style.backgroundColor = '#eff6ff';
                          e.currentTarget.style.borderColor = '#3b82f6';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.backgroundColor = 'white';
                          e.currentTarget.style.borderColor = '#bfdbfe';
                        }}
                      >
                        <Edit style={{ width: '14px', height: '14px' }} />
                      </button>
                      <button 
                        style={{
                          padding: '0.5rem',
                          border: '1px solid #fecaca',
                          borderRadius: '0.375rem',
                          backgroundColor: 'white',
                          cursor: 'pointer',
                          color: '#dc2626',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s'
                        }}
                        title="Supprimer"
                        onClick={() => handleDeleteClick(student)}
                        onMouseOver={(e) => {
                          e.currentTarget.style.backgroundColor = '#fef2f2';
                          e.currentTarget.style.borderColor = '#dc2626';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.backgroundColor = 'white';
                          e.currentTarget.style.borderColor = '#fecaca';
                        }}
                      >
                        <Trash2 style={{ width: '14px', height: '14px' }} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal d'ajout d'étudiant */}
      {showAddModal && (
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
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
            width: '100%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflow: 'hidden'
          }}>
            {/* Header */}
            <div style={{
              padding: '1.25rem',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#3b82f6'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <UserPlus style={{ width: '20px', height: '20px', color: 'white' }} />
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600', color: 'white' }}>
                  Inscrire un Nouvel Étudiant
                </h2>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewStudent({
                    matricule: '', nom: '', prenom: '', classe: '',
                    dateNaissance: '', genre: '', telephone: '', adresse: ''
                  });
                  setErrors({});
                }}
                disabled={saving}
                style={{
                  padding: '0.5rem',
                  border: 'none',
                  borderRadius: '0.25rem',
                  backgroundColor: 'transparent',
                  cursor: saving ? 'not-allowed' : 'pointer'
                }}
              >
                <X style={{ width: '18px', height: '18px', color: 'white' }} />
              </button>
            </div>

            {/* Contenu scrollable */}
            <div style={{ 
              padding: '1.25rem',
              maxHeight: 'calc(90vh - 200px)',
              overflowY: 'auto'
            }}>
              <form onSubmit={handleSubmit} id="addStudentForm">
                <div style={{ display: 'grid', gap: '1.25rem' }}>
                  
                  {/* Matricule */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: '#555',
                      marginBottom: '0.5rem'
                    }}>
                      Matricule (optionnel)
                    </label>
                    <input
                      type="text"
                      value={newStudent.matricule}
                      onChange={(e) => setNewStudent({...newStudent, matricule: e.target.value})}
                      disabled={saving}
                      placeholder="Auto-généré si laissé vide"
                      style={{
                        width: '100%',
                        padding: '0.625rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem',
                        backgroundColor: 'white'
                      }}
                    />
                    {!newStudent.matricule && (
                      <small style={{ color: '#666', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                        Matricule qui sera généré: <strong>{generateMatricule()}</strong>
                      </small>
                    )}
                  </div>

                  {/* Informations personnelles */}
                  <div>
                    <h3 style={{
                      margin: '0 0 1rem 0',
                      fontSize: '1rem',
                      fontWeight: '600',
                      color: '#333',
                      paddingBottom: '0.5rem',
                      borderBottom: '1px solid #e5e7eb'
                    }}>
                      Informations personnelles
                    </h3>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          color: '#555',
                          marginBottom: '0.5rem'
                        }}>
                          Nom *
                        </label>
                        <input
                          type="text"
                          value={newStudent.nom}
                          onChange={(e) => {
                            setNewStudent({...newStudent, nom: e.target.value});
                            if (errors.nom) setErrors({...errors, nom: null});
                          }}
                          disabled={saving}
                          placeholder="Ex: Rakoto"
                          style={{
                            width: '100%',
                            padding: '0.625rem',
                            border: `1px solid ${errors.nom ? '#dc2626' : '#d1d5db'}`,
                            borderRadius: '0.375rem',
                            fontSize: '0.875rem',
                            backgroundColor: 'white'
                          }}
                        />
                        {errors.nom && (
                          <span style={{ color: '#dc2626', fontSize: '0.75rem', display: 'block', marginTop: '0.25rem' }}>
                            {errors.nom}
                          </span>
                        )}
                      </div>

                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          color: '#555',
                          marginBottom: '0.5rem'
                        }}>
                          Prénom *
                        </label>
                        <input
                          type="text"
                          value={newStudent.prenom}
                          onChange={(e) => {
                            setNewStudent({...newStudent, prenom: e.target.value});
                            if (errors.prenom) setErrors({...errors, prenom: null});
                          }}
                          disabled={saving}
                          placeholder="Ex: Jean"
                          style={{
                            width: '100%',
                            padding: '0.625rem',
                            border: `1px solid ${errors.prenom ? '#dc2626' : '#d1d5db'}`,
                            borderRadius: '0.375rem',
                            fontSize: '0.875rem',
                            backgroundColor: 'white'
                          }}
                        />
                        {errors.prenom && (
                          <span style={{ color: '#dc2626', fontSize: '0.75rem', display: 'block', marginTop: '0.25rem' }}>
                            {errors.prenom}
                          </span>
                        )}
                      </div>

                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          color: '#555',
                          marginBottom: '0.5rem'
                        }}>
                          Genre
                        </label>
                        <select
                          value={newStudent.genre}
                          onChange={(e) => setNewStudent({...newStudent, genre: e.target.value})}
                          disabled={saving}
                          style={{
                            width: '100%',
                            padding: '0.625rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '0.375rem',
                            fontSize: '0.875rem',
                            cursor: 'pointer',
                            backgroundColor: 'white'
                          }}
                        >
                          <option value="">Sélectionner</option>
                          <option value="M">Masculin</option>
                          <option value="F">Féminin</option>
                        </select>
                      </div>

                      <div>
                        <label style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          color: '#555',
                          marginBottom: '0.5rem'
                        }}>
                          <Calendar style={{ width: '14px', height: '14px' }} />
                          Date de naissance
                        </label>
                        <input
                          type="date"
                          value={newStudent.dateNaissance}
                          onChange={(e) => setNewStudent({...newStudent, dateNaissance: e.target.value})}
                          disabled={saving}
                          style={{
                            width: '100%',
                            padding: '0.625rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '0.375rem',
                            fontSize: '0.875rem',
                            backgroundColor: 'white'
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Informations scolaires */}
                  <div>
                    <h3 style={{
                      margin: '0 0 1rem 0',
                      fontSize: '1rem',
                      fontWeight: '600',
                      color: '#333',
                      paddingBottom: '0.5rem',
                      borderBottom: '1px solid #e5e7eb'
                    }}>
                      Informations scolaires
                    </h3>
                    
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: '#555',
                        marginBottom: '0.5rem'
                      }}>
                        Classe *
                      </label>
                      <input
                        type="text"
                        value={newStudent.classe}
                        onChange={(e) => {
                          setNewStudent({...newStudent, classe: e.target.value});
                          if (errors.classe) setErrors({...errors, classe: null});
                        }}
                        disabled={saving}
                        placeholder="Ex: Terminal A, 1ère S, etc."
                        style={{
                          width: '100%',
                          padding: '0.625rem',
                          border: `1px solid ${errors.classe ? '#dc2626' : '#d1d5db'}`,
                          borderRadius: '0.375rem',
                          fontSize: '0.875rem',
                          backgroundColor: 'white'
                        }}
                      />
                      {errors.classe && (
                        <span style={{ color: '#dc2626', fontSize: '0.75rem', display: 'block', marginTop: '0.25rem' }}>
                          {errors.classe}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Contact */}
                  <div>
                    <h3 style={{
                      margin: '0 0 1rem 0',
                      fontSize: '1rem',
                      fontWeight: '600',
                      color: '#333',
                      paddingBottom: '0.5rem',
                      borderBottom: '1px solid #e5e7eb'
                    }}>
                      Informations de contact
                    </h3>
                    
                    <div style={{ display: 'grid', gap: '1rem' }}>
                      <div>
                        <label style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          color: '#555',
                          marginBottom: '0.5rem'
                        }}>
                          <Phone style={{ width: '14px', height: '14px' }} />
                          Téléphone
                        </label>
                        <input
                          type="tel"
                          value={newStudent.telephone}
                          onChange={(e) => setNewStudent({...newStudent, telephone: e.target.value})}
                          disabled={saving}
                          placeholder="Ex: +261 34 12 345 67"
                          style={{
                            width: '100%',
                            padding: '0.625rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '0.375rem',
                            fontSize: '0.875rem',
                            backgroundColor: 'white'
                          }}
                        />
                      </div>

                      <div>
                        <label style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          color: '#555',
                          marginBottom: '0.5rem'
                        }}>
                          <MapPin style={{ width: '14px', height: '14px' }} />
                          Adresse
                        </label>
                        <textarea
                          value={newStudent.adresse}
                          onChange={(e) => setNewStudent({...newStudent, adresse: e.target.value})}
                          disabled={saving}
                          rows="3"
                          placeholder="Adresse complète..."
                          style={{
                            width: '100%',
                            padding: '0.625rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '0.375rem',
                            fontSize: '0.875rem',
                            resize: 'vertical',
                            backgroundColor: 'white'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Footer avec boutons */}
            <div style={{
              padding: '1.25rem',
              borderTop: '1px solid #e5e7eb',
              backgroundColor: '#fafafa',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '0.75rem'
            }}>
              <button
                type="button"
                onClick={() => {
                  setShowAddModal(false);
                  setNewStudent({
                    matricule: '', nom: '', prenom: '', classe: '',
                    dateNaissance: '', genre: '', telephone: '', adresse: ''
                  });
                  setErrors({});
                }}
                disabled={saving}
                style={{
                  padding: '0.625rem 1.25rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  backgroundColor: 'white',
                  color: '#555',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  opacity: saving ? 0.5 : 1
                }}
              >
                Annuler
              </button>
              
              <button
                type="submit"
                form="addStudentForm"
                disabled={saving}
                style={{
                  padding: '0.625rem 1.25rem',
                  border: 'none',
                  borderRadius: '0.375rem',
                  backgroundColor: saving ? '#9ca3af' : '#3b82f6',
                  color: 'white',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <Save style={{ width: '14px', height: '14px' }} />
                {saving ? 'Inscription...' : 'Inscrire l\'étudiant'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'édition */}
      <EditStudentModal 
        student={editingStudent}
        isOpen={showEditModal}
        onClose={handleCloseEditModal}
        onSave={handleSaveEdit}
      />

      {/* Modal de confirmation de suppression */}
      <DeleteConfirmationModal
        student={studentToDelete}
        isOpen={showDeleteModal}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        loading={deleting}
      />

      {/* Modal de succès */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        message={successMessage}
      />

      <style jsx>{`
        .card {
          background: white;
          border-radius: 0.75rem;
          border: 1px solid #e5e7eb;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .card-header {
          padding: 1.5rem;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: linear-gradient(135deg, #EDEDF0FF 0%, #F7F6F8FF 100%);
        }

        .card-title {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 600;
          color: white;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .icon {
          width: 20px;
          height: 20px;
        }

        .btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.25rem;
          border: none;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-primary {
          background: #3b82f6;
          color: white;
          border: 2px solid #3b82f6;
        }

        .btn-primary:hover {
          background: #2563eb;
          border-color: #2563eb;
          transform: translateY(-1px);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .table-container {
          overflow-x: auto;
          background-color: white;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.875rem;
          background-color: white;
        }

        .table-header {
          background: #f8fafc;
          padding: 1rem;
          text-align: left;
          font-weight: 600;
          color: #1e40af;
          border-bottom: 2px solid #3b82f6;
          text-transform: uppercase;
          font-size: 0.75rem;
          letter-spacing: 0.05em;
        }

        .text-center {
          text-align: center;
        }

        .table-row {
          border-bottom: 1px solid #f0f0f0;
          transition: all 0.2s;
          background-color: white;
        }

        .table-row:hover {
          background: #f8fafc;
        }

        .table-cell {
          padding: 1rem;
          color: #374151;
          background-color: white;
        }

        .table-empty {
          padding: 3rem 1rem;
          text-align: center;
          color: #6b7280;
          font-style: italic;
          background-color: white;
        }
      `}</style>
    </div>
  );
};

export default StudentsList;