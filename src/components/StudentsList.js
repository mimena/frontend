// components/StudentsList.js
import React, { useState } from 'react';
import { Users, Plus, Search, Edit, Trash2, Save, X, UserPlus, User, Calendar, Phone, MapPin } from 'lucide-react';

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

  // Remplir le formulaire avec les données de l'étudiant
  React.useEffect(() => {
    if (student && isOpen) {
      console.log('Chargement données étudiant pour édition:', student);
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
    
    // Supprimer l'erreur du champ modifié
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
      console.log('Soumission modification étudiant:', formData);
      const success = await onSave(student.id, formData);
      
      if (success) {
        console.log('Modification réussie');
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
          backgroundColor: '#fafafa'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <User style={{ width: '20px', height: '20px', color: '#555' }} />
            <h2 style={{ 
              margin: 0, 
              fontSize: '1.25rem', 
              fontWeight: '600', 
              color: '#333' 
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
            <X style={{ width: '18px', height: '18px', color: '#666' }} />
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
                        resize: 'vertical'
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
              backgroundColor: saving ? '#9ca3af' : '#555',
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
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (student) => {
    console.log('Ouverture du modal pour éditer:', student);
    setEditingStudent(student);
    setShowEditModal(true);
  };

  const handleSaveEdit = async (studentId, formData) => {
    try {
      console.log('Sauvegarde des modifications:', studentId, formData);
      await onEditStudent(studentId, formData);
      setShowEditModal(false);
      setEditingStudent(null);
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

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.matricule.toLowerCase().includes(searchTerm.toLowerCase());
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
          backgroundColor: '#fafafa',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem'
          }}>
            <div style={{
              padding: '1.25rem',
              backgroundColor: 'white',
              borderRadius: '0.5rem',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
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
                    color: '#666',
                    marginBottom: '0.5rem'
                  }}>
                    Total Étudiants
                  </div>
                  <div style={{
                    fontSize: '1.75rem',
                    fontWeight: 'bold',
                    color: '#333'
                  }}>
                    {students.length}
                  </div>
                </div>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '0.5rem',
                  backgroundColor: '#f5f5f5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Users style={{ width: '20px', height: '20px', color: '#555' }} />
                </div>
              </div>
            </div>

            <div style={{
              padding: '1.25rem',
              backgroundColor: 'white',
              borderRadius: '0.5rem',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
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
                    color: '#666',
                    marginBottom: '0.5rem'
                  }}>
                    Classes
                  </div>
                  <div style={{
                    fontSize: '1.75rem',
                    fontWeight: 'bold',
                    color: '#333'
                  }}>
                    {classes.length}
                  </div>
                </div>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '0.5rem',
                  backgroundColor: '#f5f5f5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span style={{ fontSize: '1.25rem' }}>📚</span>
                </div>
              </div>
            </div>

            <div style={{
              padding: '1.25rem',
              backgroundColor: 'white',
              borderRadius: '0.5rem',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
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
                    color: '#666',
                    marginBottom: '0.5rem'
                  }}>
                    Garçons
                  </div>
                  <div style={{
                    fontSize: '1.75rem',
                    fontWeight: 'bold',
                    color: '#333'
                  }}>
                    {students.filter(s => s.genre === 'M').length}
                  </div>
                </div>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '0.5rem',
                  backgroundColor: '#f5f5f5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span style={{ fontSize: '1.25rem' }}>👨‍🎓</span>
                </div>
              </div>
            </div>

            <div style={{
              padding: '1.25rem',
              backgroundColor: 'white',
              borderRadius: '0.5rem',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
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
                    color: '#666',
                    marginBottom: '0.5rem'
                  }}>
                    Filles
                  </div>
                  <div style={{
                    fontSize: '1.75rem',
                    fontWeight: 'bold',
                    color: '#333'
                  }}>
                    {students.filter(s => s.genre === 'F').length}
                  </div>
                </div>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '0.5rem',
                  backgroundColor: '#f5f5f5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span style={{ fontSize: '1.25rem' }}>👩‍🎓</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtres de recherche améliorés */}
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
              placeholder="Rechercher par nom, prénom ou matricule..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem 0.75rem 2.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                transition: 'all 0.2s',
                outline: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = '#555'}
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
              onFocus={(e) => e.target.style.borderColor = '#555'}
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
            backgroundColor: '#f5f5f5',
            borderRadius: '0.375rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span style={{ fontSize: '0.875rem', color: '#555' }}>
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
                backgroundColor: '#555',
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
              <th className="table-header text-center">Genre</th>
              <th className="table-header text-center">Statut</th>
              <th className="table-header text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan="6" className="table-empty">
                  {searchTerm || selectedClass ? 'Aucun étudiant trouvé avec ces critères.' : 'Aucun étudiant inscrit. Inscrivez votre premier étudiant.'}
                </td>
              </tr>
            ) : (
              filteredStudents.map(student => (
                <tr key={student.id} className="table-row">
                  <td className="table-cell">
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      backgroundColor: '#f5f5f5',
                      color: '#333',
                      borderRadius: '0.375rem',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      border: '1px solid #e5e7eb'
                    }}>
                      {student.matricule}
                    </span>
                  </td>
                  <td className="table-cell">
                    <div style={{ fontWeight: '500', color: '#333' }}>
                      {student.prenom} {student.nom}
                    </div>
                    {student.telephone && (
                      <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.25rem' }}>{student.telephone}</div>
                    )}
                  </td>
                  <td className="table-cell">
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      backgroundColor: '#f8f8f8',
                      color: '#333',
                      borderRadius: '0.375rem',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      border: '1px solid #e5e7eb'
                    }}>
                      {student.classe}
                    </span>
                  </td>
                  <td className="table-cell text-center">
                    {student.genre && (
                      <span style={{
                        padding: '0.25rem 0.5rem',
                        backgroundColor: student.genre === 'M' ? '#f0f0f0' : '#f5f5f5',
                        color: '#333',
                        borderRadius: '0.375rem',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        border: `1px solid ${student.genre === 'M' ? '#d1d5db' : '#e5e7eb'}`
                      }}>
                        {student.genre === 'M' ? 'M' : 'F'}
                      </span>
                    )}
                  </td>
                  <td className="table-cell text-center">
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      backgroundColor: '#f0f9f0',
                      color: '#166534',
                      borderRadius: '0.375rem',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      border: '1px solid #bbf7d0'
                    }}>
                      Inscrit
                    </span>
                  </td>
                  <td className="table-cell text-center">
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                      <button 
                        style={{
                          padding: '0.5rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '0.375rem',
                          backgroundColor: 'white',
                          cursor: 'pointer',
                          color: '#555',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        title="Modifier"
                        onClick={() => handleEdit(student)}
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
                          justifyContent: 'center'
                        }}
                        title="Supprimer"
                        onClick={() => onDeleteStudent(student.id)}
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
              backgroundColor: '#fafafa'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <UserPlus style={{ width: '20px', height: '20px', color: '#555' }} />
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600', color: '#333' }}>
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
                <X style={{ width: '18px', height: '18px', color: '#666' }} />
              </button>
            </div>

            {/* Contenu scrollable */}
            <div style={{ 
              padding: '1.25rem',
              maxHeight: 'calc(90vh - 120px)',
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
                        fontSize: '0.875rem'
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
                            fontSize: '0.875rem'
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
                            fontSize: '0.875rem'
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
                            cursor: 'pointer'
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
                            fontSize: '0.875rem'
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
                          fontSize: '0.875rem'
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
                            resize: 'vertical'
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
                  backgroundColor: saving ? '#9ca3af' : '#555',
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

      <style jsx>{`
        .card {
          background: white;
          border-radius: 0.5rem;
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
          background: #fafafa;
        }

        .card-title {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 600;
          color: #333;
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
          border-radius: 0.375rem;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-primary {
          background: #555;
          color: white;
        }

        .btn-primary:hover {
          background: #444;
        }

        .table-container {
          overflow-x: auto;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.875rem;
        }

        .table-header {
          background: #f8f8f8;
          padding: 1rem;
          text-align: left;
          font-weight: 600;
          color: #333;
          border-bottom: 1px solid #e5e7eb;
        }

        .text-center {
          text-align: center;
        }

        .table-row {
          border-bottom: 1px solid #f0f0f0;
        }

        .table-row:hover {
          background: #fafafa;
        }

        .table-cell {
          padding: 1rem;
          color: #555;
        }

        .table-empty {
          padding: 3rem 1rem;
          text-align: center;
          color: #666;
          font-style: italic;
        }
      `}</style>
    </div>
  );
};

export default StudentsList;