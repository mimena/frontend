import React, { useState } from 'react';
import { 
  Users,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  AlertCircle,
  Mail,
  UserPlus,
  BookOpen,
  Award,
  GraduationCap,
  Building
} from 'lucide-react';

// ===== MODAL MODIFICATION ENSEIGNANT =====
const TeacherEditModal = ({ 
  teacher, 
  isOpen, 
  onClose, 
  onSave 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    classes: []
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newClass, setNewClass] = useState('');

  React.useEffect(() => {
    if (teacher) {
      console.log('=== INITIALISATION FORMULAIRE MODIFICATION ENSEIGNANT ===');
      console.log('Enseignant à modifier:', teacher);
      
      setFormData({
        name: teacher.name || '',
        email: teacher.email || '',
        subject: teacher.subject || '',
        classes: teacher.classes || []
      });
      
      setError(null);
    }
  }, [teacher]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Changement champ ${name}:`, value);
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddClass = () => {
    if (newClass.trim() && !formData.classes.includes(newClass.trim())) {
      setFormData(prev => ({
        ...prev,
        classes: [...prev.classes, newClass.trim()]
      }));
      setNewClass('');
    }
  };

  const handleRemoveClass = (classToRemove) => {
    setFormData(prev => ({
      ...prev,
      classes: prev.classes.filter(cls => cls !== classToRemove)
    }));
  };

  const validateForm = () => {
    const errors = [];
    
    if (!formData.name.trim()) {
      errors.push('Le nom est requis');
    }
    
    if (!formData.email.trim()) {
      errors.push('L\'email est requis');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.push('Email invalide');
    }

    if (!formData.subject.trim()) {
      errors.push('La matière enseignée est requise');
    }

    return errors;
  };

  const handleSave = async () => {
    console.log('=== DÉBUT SAUVEGARDE MODIFICATION ENSEIGNANT ===');
    
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(validationErrors.join(', '));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Données à envoyer:', formData);
      console.log('ID enseignant:', teacher.id);
      
      const success = await onSave(teacher.id, formData);
      
      if (success) {
        console.log('✅ Modification réussie');
        onClose();
      } else {
        console.error('❌ Échec de la modification');
        setError('Erreur lors de la modification');
      }
    } catch (error) {
      console.error('💥 Erreur sauvegarde:', error);
      setError('Erreur lors de la sauvegarde: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !teacher) return null;

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
              backgroundColor: '#8b5cf6',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Edit2 style={{ width: '20px', height: '20px', color: 'white' }} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937' }}>
                Modifier l'enseignant
              </h2>
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>
                {teacher.name}
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
            
            {/* Nom de l'enseignant */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                Nom complet *
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
                placeholder="Ex: Jean Dupont"
              />
            </div>

            {/* Email */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
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
                placeholder="Ex: jean.dupont@ecole.com"
              />
            </div>

            {/* Matière enseignée */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                Matière enseignée *
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
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

            {/* Classes enseignées */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                Classes enseignées
              </label>
              
              {/* Liste des classes */}
              <div style={{ marginBottom: '0.75rem' }}>
                {formData.classes.length === 0 ? (
                  <p style={{ fontSize: '0.875rem', color: '#6b7280', fontStyle: 'italic' }}>
                    Aucune classe assignée
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {formData.classes.map((cls, index) => (
                      <span
                        key={index}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          padding: '0.375rem 0.75rem',
                          backgroundColor: '#f0fdf4',
                          color: '#166534',
                          fontSize: '0.75rem',
                          fontWeight: '500',
                          borderRadius: '20px',
                          border: '1px solid #bbf7d0'
                        }}
                      >
                        <Building style={{ width: '12px', height: '12px' }} />
                        {cls}
                        <button
                          type="button"
                          onClick={() => handleRemoveClass(cls)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#dc2626',
                            cursor: 'pointer',
                            padding: '0',
                            marginLeft: '0.25rem'
                          }}
                        >
                          <X style={{ width: '12px', height: '12px' }} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Ajouter une classe */}
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  value={newClass}
                  onChange={(e) => setNewClass(e.target.value)}
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: '0.5rem 0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Ex: Terminale A, 1ère B..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddClass())}
                />
                <button
                  type="button"
                  onClick={handleAddClass}
                  disabled={loading || !newClass.trim()}
                  style={{
                    padding: '0.5rem 1rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    cursor: (loading || !newClass.trim()) ? 'not-allowed' : 'pointer'
                  }}
                >
                  Ajouter
                </button>
              </div>
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
            disabled={loading || !formData.name.trim() || !formData.email.trim()}
            style={{
              padding: '0.75rem 1.5rem',
              border: 'none',
              borderRadius: '6px',
              backgroundColor: '#8b5cf6',
              color: 'white',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: (loading || !formData.name.trim() || !formData.email.trim()) ? 'not-allowed' : 'pointer',
              opacity: (loading || !formData.name.trim() || !formData.email.trim()) ? 0.5 : 1,
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

// ===== COMPOSANT PRINCIPAL GESTION DES ENSEIGNANTS =====
const TeachersManager = ({ 
  teachers = [],
  onAddTeacher,
  onEditTeacher,
  onDeleteTeacher
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [newTeacher, setNewTeacher] = useState({ 
    name: '', 
    email: '',
    subject: '',
    classes: []
  });
  const [formError, setFormError] = useState(null);
  const [newClass, setNewClass] = useState('');

  // Calcul des statistiques
  const totalTeachers = teachers.length;
  const totalSubjects = [...new Set(teachers.map(t => t.subject))].length;
  const totalClasses = [...new Set(teachers.flatMap(t => t.classes || []))].length;
  const subjectsDistribution = teachers.reduce((acc, teacher) => {
    acc[teacher.subject] = (acc[teacher.subject] || 0) + 1;
    return acc;
  }, {});

  const handleAddClass = () => {
    if (newClass.trim() && !newTeacher.classes.includes(newClass.trim())) {
      setNewTeacher(prev => ({
        ...prev,
        classes: [...prev.classes, newClass.trim()]
      }));
      setNewClass('');
    }
  };

  const handleRemoveClass = (classToRemove) => {
    setNewTeacher(prev => ({
      ...prev,
      classes: prev.classes.filter(cls => cls !== classToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!newTeacher.name.trim()) {
      setFormError('Le nom est requis');
      return;
    }

    if (!newTeacher.email.trim()) {
      setFormError('L\'email est requis');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newTeacher.email)) {
      setFormError('Email invalide');
      return;
    }

    if (!newTeacher.subject.trim()) {
      setFormError('La matière est requise');
      return;
    }

    const success = await onAddTeacher(newTeacher);
    
    if (success) {
      setNewTeacher({ name: '', email: '', subject: '', classes: [] });
      setShowAddForm(false);
    }
  };

  const handleEdit = (teacher) => {
    console.log('Ouverture modal modification pour:', teacher);
    setEditingTeacher(teacher);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingTeacher(null);
  };

  const handleDelete = async (teacher) => {
    console.log('Tentative suppression enseignant:', teacher);
    setDeletingId(teacher.id);
    
    try {
      const success = await onDeleteTeacher(teacher.id);
      if (!success) {
        console.error('Échec suppression enseignant');
      }
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="fade-in">
      {/* Header avec titre */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header">
          <h1 className="card-title" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            margin: 0,
            fontSize: '1.75rem',
            fontWeight: 'bold',
            color: '#1f2937'
          }}>
            <Users style={{ width: '32px', height: '32px', color: '#8b5cf6' }} />
            Gestion des Enseignants
          </h1>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '1rem', color: '#6b7280' }}>
            Administration complète du corps professoral
          </p>
        </div>
      </div>

      {/* STATISTIQUES PROFESSIONNELLES EN HAUT */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: '1.5rem', 
        marginBottom: '2rem' 
      }}>
        {/* Carte Total Enseignants */}
        <div style={{
          background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
          borderRadius: '12px',
          padding: '2rem',
          color: 'white',
          boxShadow: '0 10px 25px -5px rgba(139, 92, 246, 0.3)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              marginBottom: '1rem'
            }}>
              <div>
                <div style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.5rem' }}>
                  Total Enseignants
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', lineHeight: 1 }}>
                  {totalTeachers}
                </div>
              </div>
              <div style={{
                width: '60px',
                height: '60px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Users style={{ width: '28px', height: '28px' }} />
              </div>
            </div>
            <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>
              Corps professoral actif
            </div>
          </div>
          <div style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            width: '120px',
            height: '120px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '50%'
          }}></div>
        </div>

        {/* Carte Matières enseignées */}
        <div style={{
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          borderRadius: '12px',
          padding: '2rem',
          color: 'white',
          boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.3)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              marginBottom: '1rem'
            }}>
              <div>
                <div style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.5rem' }}>
                  Matières enseignées
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', lineHeight: 1 }}>
                  {totalSubjects}
                </div>
              </div>
              <div style={{
                width: '60px',
                height: '60px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <BookOpen style={{ width: '28px', height: '28px' }} />
              </div>
            </div>
            <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>
              Disciplines différentes
            </div>
          </div>
          <div style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            width: '120px',
            height: '120px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '50%'
          }}></div>
        </div>

        {/* Carte Classes couvertes */}
        <div style={{
          background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
          borderRadius: '12px',
          padding: '2rem',
          color: 'white',
          boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.3)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              marginBottom: '1rem'
            }}>
              <div>
                <div style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.5rem' }}>
                  Classes couvertes
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', lineHeight: 1 }}>
                  {totalClasses}
                </div>
              </div>
              <div style={{
                width: '60px',
                height: '60px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Building style={{ width: '28px', height: '28px' }} />
              </div>
            </div>
            <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>
              Niveaux d'enseignement
            </div>
          </div>
          <div style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            width: '120px',
            height: '120px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '50%'
          }}></div>
        </div>
      </div>

      {/* Section Gestion des Enseignants */}
      <div className="card">
        <div className="card-header" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <h2 style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            margin: 0,
            fontSize: '1.5rem',
            fontWeight: '600',
            color: '#1f2937'
          }}>
            <GraduationCap style={{ width: '24px', height: '24px', color: '#8b5cf6' }} />
            Liste des Enseignants
          </h2>
          
          <button
            onClick={() => setShowAddForm(true)}
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
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <UserPlus style={{ width: '16px', height: '16px' }} />
            Nouvel Enseignant
          </button>
        </div>

        {/* Formulaire d'ajout */}
        {showAddForm && (
          <div className="form-container" style={{
            margin: '1.5rem',
            padding: '1.5rem',
            backgroundColor: '#f8fafc',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <UserPlus style={{ width: '20px', height: '20px', color: '#8b5cf6' }} />
              Ajouter un nouvel enseignant
            </h3>
            
            {formError && (
              <div style={{
                marginBottom: '1.5rem',
                padding: '1rem',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <AlertCircle style={{ width: '18px', height: '18px', color: '#dc2626' }} />
                <span style={{ fontSize: '0.875rem', color: '#dc2626', fontWeight: '500' }}>
                  {formError}
                </span>
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1.5rem',
                marginBottom: '1.5rem'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Nom complet *
                  </label>
                  <input
                    type="text"
                    value={newTeacher.name}
                    onChange={(e) => {
                      setNewTeacher({...newTeacher, name: e.target.value});
                      setFormError(null);
                    }}
                    style={{
                      width: '100%',
                      padding: '0.875rem',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.2s'
                    }}
                    placeholder="Ex: Prof. Jean Dupont"
                    required
                  />
                </div>
                
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Email professionnel *
                  </label>
                  <input
                    type="email"
                    value={newTeacher.email}
                    onChange={(e) => {
                      setNewTeacher({...newTeacher, email: e.target.value});
                      setFormError(null);
                    }}
                    style={{
                      width: '100%',
                      padding: '0.875rem',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.2s'
                    }}
                    placeholder="Ex: j.dupont@ecole.com"
                    required
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Matière enseignée *
                  </label>
                  <input
                    type="text"
                    value={newTeacher.subject}
                    onChange={(e) => {
                      setNewTeacher({...newTeacher, subject: e.target.value});
                      setFormError(null);
                    }}
                    style={{
                      width: '100%',
                      padding: '0.875rem',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.2s'
                    }}
                    placeholder="Ex: Mathématiques Avancées"
                    required
                  />
                </div>
              </div>

              {/* Section Classes */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '0.75rem'
                }}>
                  Classes enseignées
                </label>
                
                {/* Liste des classes */}
                <div style={{ marginBottom: '1rem' }}>
                  {newTeacher.classes.length === 0 ? (
                    <p style={{ fontSize: '0.875rem', color: '#6b7280', fontStyle: 'italic' }}>
                      Aucune classe assignée
                    </p>
                  ) : (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {newTeacher.classes.map((cls, index) => (
                        <span
                          key={index}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            padding: '0.5rem 1rem',
                            backgroundColor: '#f0fdf4',
                            color: '#166534',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            borderRadius: '20px',
                            border: '1px solid #bbf7d0'
                          }}
                        >
                          <Building style={{ width: '14px', height: '14px' }} />
                          {cls}
                          <button
                            type="button"
                            onClick={() => handleRemoveClass(cls)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#dc2626',
                              cursor: 'pointer',
                              padding: '0',
                              marginLeft: '0.25rem'
                            }}
                          >
                            <X style={{ width: '14px', height: '14px' }} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Ajouter une classe */}
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <input
                    type="text"
                    value={newClass}
                    onChange={(e) => setNewClass(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.2s'
                    }}
                    placeholder="Ex: Terminale A, 1ère B..."
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddClass())}
                  />
                  <button
                    type="button"
                    onClick={handleAddClass}
                    disabled={!newClass.trim()}
                    style={{
                      padding: '0.75rem 1.5rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      backgroundColor: '#f3f4f6',
                      color: '#374151',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      cursor: !newClass.trim() ? 'not-allowed' : 'pointer'
                    }}
                  >
                    Ajouter
                  </button>
                </div>
              </div>

              <div style={{
                display: 'flex',
                gap: '1rem',
                justifyContent: 'flex-end',
                paddingTop: '1rem',
                borderTop: '1px solid #e5e7eb'
              }}>
                <button 
                  type="submit" 
                  style={{
                    padding: '0.875rem 2rem',
                    border: 'none',
                    borderRadius: '8px',
                    backgroundColor: '#10b981',
                    color: 'white',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.2s'
                  }}
                >
                  <Save style={{ width: '16px', height: '16px' }} />
                  Enregistrer l'enseignant
                </button>
                
                <button 
                  type="button" 
                  onClick={() => {
                    setShowAddForm(false);
                    setNewTeacher({ name: '', email: '', subject: '', classes: [] });
                    setFormError(null);
                  }}
                  style={{
                    padding: '0.875rem 2rem',
                    border: '2px solid #d1d5db',
                    borderRadius: '8px',
                    backgroundColor: 'white',
                    color: '#374151',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.2s'
                  }}
                >
                  <X style={{ width: '16px', height: '16px' }} />
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Liste des enseignants */}
        <div style={{ margin: '1.5rem', overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'separate',
            borderSpacing: 0,
            backgroundColor: 'white',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <thead style={{ backgroundColor: '#f8fafc' }}>
              <tr>
                <th style={{
                  padding: '1.25rem 1rem',
                  textAlign: 'left',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#374151',
                  borderBottom: '2px solid #e5e7eb',
                  backgroundColor: '#f8fafc'
                }}>
                  Enseignant
                </th>
                <th style={{
                  padding: '1.25rem 1rem',
                  textAlign: 'left',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#374151',
                  borderBottom: '2px solid #e5e7eb',
                  backgroundColor: '#f8fafc'
                }}>
                  Contact
                </th>
                <th style={{
                  padding: '1.25rem 1rem',
                  textAlign: 'left',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#374151',
                  borderBottom: '2px solid #e5e7eb',
                  backgroundColor: '#f8fafc'
                }}>
                  Spécialité
                </th>
                <th style={{
                  padding: '1.25rem 1rem',
                  textAlign: 'left',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#374151',
                  borderBottom: '2px solid #e5e7eb',
                  backgroundColor: '#f8fafc'
                }}>
                  Classes
                </th>
                <th style={{
                  padding: '1.25rem 1rem',
                  textAlign: 'center',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#374151',
                  borderBottom: '2px solid #e5e7eb',
                  backgroundColor: '#f8fafc'
                }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {teachers.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{
                    padding: '4rem 2rem',
                    textAlign: 'center',
                    color: '#6b7280',
                    fontSize: '1rem',
                    fontStyle: 'italic'
                  }}>
                    <Users style={{ width: '48px', height: '48px', color: '#d1d5db', marginBottom: '1rem' }} />
                    <div>Aucun enseignant enregistré</div>
                    <div style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                      Commencez par ajouter votre premier enseignant
                    </div>
                  </td>
                </tr>
              ) : (
                teachers.map(teacher => (
                  <tr key={teacher.id} style={{
                    borderBottom: '1px solid #f3f4f6',
                    transition: 'background-color 0.2s'
                  }}>
                    <td style={{ padding: '1.25rem 1rem' }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem'
                      }}>
                        <div style={{
                          width: '48px',
                          height: '48px',
                          backgroundColor: '#8b5cf6',
                          borderRadius: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: 'bold',
                          fontSize: '1rem',
                          boxShadow: '0 2px 4px rgba(139, 92, 246, 0.2)'
                        }}>
                          {teacher.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{
                            fontSize: '1rem',
                            fontWeight: '600',
                            color: '#1f2937',
                            marginBottom: '0.25rem'
                          }}>
                            {teacher.name}
                          </div>
                          <div style={{
                            fontSize: '0.875rem',
                            color: '#6b7280'
                          }}>
                            Professeur
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1.25rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Mail style={{ width: '16px', height: '16px', color: '#8b5cf6' }} />
                        <span style={{ fontSize: '0.875rem', color: '#374151' }}>
                          {teacher.email}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '1.25rem 1rem' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 1rem',
                        backgroundColor: '#f3f4f6',
                        color: '#374151',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        borderRadius: '20px',
                        border: '1px solid #e5e7eb'
                      }}>
                        <BookOpen style={{ width: '14px', height: '14px' }} />
                        {teacher.subject}
                      </span>
                    </td>
                    <td style={{ padding: '1.25rem 1rem' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {(teacher.classes || []).length === 0 ? (
                          <span style={{
                            fontSize: '0.875rem',
                            color: '#9ca3af',
                            fontStyle: 'italic'
                          }}>
                            Aucune classe
                          </span>
                        ) : (
                          (teacher.classes || []).slice(0, 3).map((cls, index) => (
                            <span
                              key={index}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                padding: '0.375rem 0.75rem',
                                backgroundColor: '#f0fdf4',
                                color: '#166534',
                                fontSize: '0.75rem',
                                fontWeight: '500',
                                borderRadius: '12px',
                                border: '1px solid #bbf7d0'
                              }}
                            >
                              <Building style={{ width: '12px', height: '12px' }} />
                              {cls}
                            </span>
                          ))
                        )}
                        {(teacher.classes || []).length > 3 && (
                          <span style={{
                            padding: '0.375rem 0.75rem',
                            backgroundColor: '#f3f4f6',
                            color: '#6b7280',
                            fontSize: '0.75rem',
                            fontWeight: '500',
                            borderRadius: '12px'
                          }}>
                            +{(teacher.classes || []).length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '1.25rem 1rem', textAlign: 'center' }}>
                      <div style={{
                        display: 'flex',
                        gap: '0.75rem',
                        justifyContent: 'center'
                      }}>
                        <button 
                          onClick={() => handleEdit(teacher)}
                          style={{
                            padding: '0.75rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            backgroundColor: 'white',
                            color: '#8b5cf6',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s'
                          }}
                          title="Modifier"
                        >
                          <Edit2 style={{ width: '16px', height: '16px' }} />
                        </button>
                        
                        <button 
                          onClick={() => handleDelete(teacher)}
                          disabled={deletingId === teacher.id}
                          style={{
                            padding: '0.75rem',
                            border: '1px solid #fecaca',
                            borderRadius: '8px',
                            backgroundColor: deletingId === teacher.id ? '#fecaca' : 'white',
                            color: '#dc2626',
                            cursor: deletingId === teacher.id ? 'not-allowed' : 'pointer',
                            opacity: deletingId === teacher.id ? 0.6 : 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s'
                          }}
                          title="Supprimer"
                        >
                          {deletingId === teacher.id ? (
                            <div style={{
                              width: '16px',
                              height: '16px',
                              border: '2px solid rgba(220,38,38,0.3)',
                              borderTop: '2px solid #dc2626',
                              borderRadius: '50%',
                              animation: 'spin 1s linear infinite'
                            }} />
                          ) : (
                            <Trash2 style={{ width: '16px', height: '16px' }} />
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
      </div>

      {/* Modal de modification */}
      <TeacherEditModal
        teacher={editingTeacher}
        isOpen={showEditModal}
        onClose={handleCloseEditModal}
        onSave={onEditTeacher}
      />

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .fade-in {
          animation: fadeIn 0.5s ease-in;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .card {
          background-color: white;
          border-radius: 12px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          border: 1px solid #e5e7eb;
          overflow: hidden;
        }
        
        .card-header {
          padding: 1.5rem 2rem;
          border-bottom: 1px solid #e5e7eb;
          background-color: #f8fafc;
        }
        
        .card-title {
          font-size: 1.75rem;
          font-weight: bold;
          color: #1f2937;
          margin: 0;
        }
        
        input:focus {
          outline: none;
          border-color: #8b5cf6 !important;
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1) !important;
        }
        
        button:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        
        tr:hover {
          background-color: #f9fafb;
        }
      `}</style>
    </div>
  );
};

export default TeachersManager;