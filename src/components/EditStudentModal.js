// components/EditStudentModal.js
import React, { useState, useEffect } from 'react';
import { X, Save, User, Calendar, Phone, MapPin } from 'lucide-react';

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
  useEffect(() => {
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
        borderRadius: '0.75rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        width: '100%',
        maxWidth: '600px',
        maxHeight: '90vh',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#f8fafc'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <User style={{ width: '24px', height: '24px', color: '#3b82f6' }} />
            <h2 style={{ 
              margin: 0, 
              fontSize: '1.5rem', 
              fontWeight: '600', 
              color: '#1f2937' 
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
              borderRadius: '0.375rem',
              backgroundColor: 'transparent',
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.5 : 1
            }}
          >
            <X style={{ width: '20px', height: '20px', color: '#6b7280' }} />
          </button>
        </div>

        {/* Contenu */}
        <div style={{ 
          padding: '1.5rem',
          maxHeight: 'calc(90vh - 140px)',
          overflowY: 'auto'
        }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              
              {/* Informations de base */}
              <div style={{
                padding: '1rem',
                backgroundColor: '#f8fafc',
                borderRadius: '0.5rem',
                border: '1px solid #e2e8f0'
              }}>
                <h3 style={{
                  margin: '0 0 1rem 0',
                  fontSize: '1.125rem',
                  fontWeight: '500',
                  color: '#374151'
                }}>
                  Informations personnelles
                </h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: '#374151',
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
                        padding: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem',
                        backgroundColor: '#f9fafb',
                        cursor: 'not-allowed'
                      }}
                      readOnly
                    />
                    <small style={{ color: '#6b7280', fontSize: '0.75rem' }}>
                      Le matricule ne peut pas être modifié
                    </small>
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: '0.5rem'
                    }}>
                      Genre *
                    </label>
                    <select
                      name="genre"
                      value={formData.genre}
                      onChange={handleInputChange}
                      disabled={saving}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: `1px solid ${errors.genre ? '#ef4444' : '#d1d5db'}`,
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
                      color: '#374151',
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
                        padding: '0.75rem',
                        border: `1px solid ${errors.nom ? '#ef4444' : '#d1d5db'}`,
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem'
                      }}
                    />
                    {errors.nom && (
                      <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>
                        {errors.nom}
                      </span>
                    )}
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: '#374151',
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
                        padding: '0.75rem',
                        border: `1px solid ${errors.prenom ? '#ef4444' : '#d1d5db'}`,
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem'
                      }}
                    />
                    {errors.prenom && (
                      <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>
                        {errors.prenom}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Informations scolaires */}
              <div style={{
                padding: '1rem',
                backgroundColor: '#f0f9ff',
                borderRadius: '0.5rem',
                border: '1px solid #bae6fd'
              }}>
                <h3 style={{
                  margin: '0 0 1rem 0',
                  fontSize: '1.125rem',
                  fontWeight: '500',
                  color: '#374151'
                }}>
                  Informations scolaires
                </h3>
                
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
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
                      padding: '0.75rem',
                      border: `1px solid ${errors.classe ? '#ef4444' : '#d1d5db'}`,
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem'
                    }}
                  />
                  {errors.classe && (
                    <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>
                      {errors.classe}
                    </span>
                  )}
                </div>
              </div>

              {/* Informations personnelles complémentaires */}
              <div style={{
                padding: '1rem',
                backgroundColor: '#f0fdf4',
                borderRadius: '0.5rem',
                border: '1px solid #bbf7d0'
              }}>
                <h3 style={{
                  margin: '0 0 1rem 0',
                  fontSize: '1.125rem',
                  fontWeight: '500',
                  color: '#374151'
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
                      color: '#374151',
                      marginBottom: '0.5rem'
                    }}>
                      <Calendar style={{ width: '16px', height: '16px' }} />
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
                        padding: '0.75rem',
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
                      color: '#374151',
                      marginBottom: '0.5rem'
                    }}>
                      <Phone style={{ width: '16px', height: '16px' }} />
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
                        padding: '0.75rem',
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
                      color: '#374151',
                      marginBottom: '0.5rem'
                    }}>
                      <MapPin style={{ width: '16px', height: '16px' }} />
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
                        padding: '0.75rem',
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
          padding: '1.5rem',
          borderTop: '1px solid #e5e7eb',
          backgroundColor: '#f8fafc',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '0.75rem'
        }}>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            style={{
              padding: '0.75rem 1.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              backgroundColor: 'white',
              color: '#374151',
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
              padding: '0.75rem 1.5rem',
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
            <Save style={{ width: '16px', height: '16px' }} />
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditStudentModal;