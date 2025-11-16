// services/apiService.js

// Configuration de l'URL de base de l'API
// DEV - Backend local
//const API_BASE_URL = 'http://localhost:5000/api';
const API_BASE_URL = 'https://scolaire.onrender.com/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    console.log('API Base URL:', this.baseURL);
    
    // Configuration par défaut pour toutes les requêtes
    this.defaultConfig = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'same-origin'
    };
  }

  // Méthode générique pour les requêtes avec gestion d'erreurs améliorée
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      ...this.defaultConfig,
      ...options,
      headers: {
        ...this.defaultConfig.headers,
        ...options.headers,
      },
    };

    console.log(`Making ${config.method || 'GET'} request to:`, url);

    try {
      const response = await fetch(url, config);
      
      console.log(`Response status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        try {
          const errorData = await response.json();
          console.error('Error response data:', errorData);
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (parseError) {
          console.error('Could not parse error response:', parseError);
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Response data received');
      return data;
      
    } catch (error) {
      console.error(`API Error [${config.method || 'GET'} ${endpoint}]:`, error);
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Erreur de connexion à l\'API. Vérifiez votre connexion internet.');
      }
      
      throw error;
    }
  }

  // === VÉRIFICATION DE LA SANTÉ DE L'API ===
  
  async checkHealth() {
    try {
      return await this.request('/health');
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  }

  // === GESTION DES ÉTUDIANTS ===
  
  async getAllStudents() {
    try {
      console.log('=== FETCHING ALL STUDENTS ===');
      const response = await this.request('/students');
      return response;
    } catch (error) {
      console.error('Error fetching students:', error);
      throw error;
    }
  }

  async getStudentById(id) {
    try {
      console.log(`=== FETCHING STUDENT ${id} ===`);
      const response = await this.request(`/students/${id}`);
      return response;
    } catch (error) {
      console.error(`Error fetching student ${id}:`, error);
      throw error;
    }
  }

  async addStudent(studentData) {
    try {
      console.log('=== ADDING STUDENT ===');
      const response = await this.request('/students', {
        method: 'POST',
        body: JSON.stringify(studentData),
      });
      return response;
    } catch (error) {
      console.error('Error adding student:', error);
      throw error;
    }
  }

  async updateStudent(id, studentData) {
    try {
      console.log(`=== UPDATING STUDENT ${id} ===`);
      const response = await this.request(`/students/${id}`, {
        method: 'PUT',
        body: JSON.stringify(studentData),
      });
      return response;
    } catch (error) {
      console.error(`Error updating student ${id}:`, error);
      throw error;
    }
  }

  async deleteStudent(id) {
    try {
      console.log(`=== DELETING STUDENT ${id} ===`);
      const response = await this.request(`/students/${id}`, {
        method: 'DELETE',
      });
      return response;
    } catch (error) {
      console.error(`Error deleting student ${id}:`, error);
      throw error;
    }
  }

  // === GESTION DES MATIÈRES ===
  
  async getAllSubjects() {
    try {
      console.log('=== FETCHING ALL SUBJECTS ===');
      const response = await this.request('/subjects');
      return response;
    } catch (error) {
      console.error('Error fetching subjects:', error);
      throw error;
    }
  }

  async getSubjectById(id) {
    try {
      console.log(`=== FETCHING SUBJECT ${id} ===`);
      const response = await this.request(`/subjects/${id}`);
      return response;
    } catch (error) {
      console.error(`Error fetching subject ${id}:`, error);
      throw error;
    }
  }

  async addSubject(subjectData) {
    try {
      console.log('=== ADDING SUBJECT ===');
      const response = await this.request('/subjects', {
        method: 'POST',
        body: JSON.stringify(subjectData),
      });
      return response;
    } catch (error) {
      console.error('Error adding subject:', error);
      throw error;
    }
  }

  async updateSubject(id, subjectData) {
    try {
      console.log(`=== UPDATING SUBJECT ${id} ===`);
      const response = await this.request(`/subjects/${id}`, {
        method: 'PUT',
        body: JSON.stringify(subjectData),
      });
      return response;
    } catch (error) {
      console.error(`Error updating subject ${id}:`, error);
      throw error;
    }
  }

  async deleteSubject(id) {
    try {
      console.log(`=== DELETING SUBJECT ${id} ===`);
      const response = await this.request(`/subjects/${id}`, {
        method: 'DELETE',
      });
      return response;
    } catch (error) {
      console.error(`Error deleting subject ${id}:`, error);
      throw error;
    }
  }

  // === GESTION DES ENSEIGNANTS ===
  
  async getAllTeachers() {
    try {
      console.log('=== FETCHING ALL TEACHERS ===');
      const response = await this.request('/teachers');
      return response;
    } catch (error) {
      console.error('Error fetching teachers:', error);
      return { success: true, teachers: [] };
    }
  }

  async getTeacherById(id) {
    try {
      console.log(`=== FETCHING TEACHER ${id} ===`);
      const response = await this.request(`/teachers/${id}`);
      return response;
    } catch (error) {
      console.error(`Error fetching teacher ${id}:`, error);
      throw error;
    }
  }

  async addTeacher(teacherData) {
    try {
      console.log('=== ADDING TEACHER ===');
      const response = await this.request('/teachers', {
        method: 'POST',
        body: JSON.stringify(teacherData),
      });
      return response;
    } catch (error) {
      console.error('Error adding teacher:', error);
      throw error;
    }
  }

  async updateTeacher(id, teacherData) {
    try {
      console.log(`=== UPDATING TEACHER ${id} ===`);
      const response = await this.request(`/teachers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(teacherData),
      });
      return response;
    } catch (error) {
      console.error(`Error updating teacher ${id}:`, error);
      throw error;
    }
  }

  async deleteTeacher(id) {
    try {
      console.log(`=== DELETING TEACHER ${id} ===`);
      const response = await this.request(`/teachers/${id}`, {
        method: 'DELETE',
      });
      return response;
    } catch (error) {
      console.error(`Error deleting teacher ${id}:`, error);
      throw error;
    }
  }

  // === STATISTIQUES ET RAPPORTS ===
  
  async getSubjectsStatistics() {
    try {
      console.log('=== FETCHING SUBJECTS STATISTICS ===');
      const response = await this.request('/subjects/statistics');
      return response;
    } catch (error) {
      console.error('Error fetching subjects statistics:', error);
      throw error;
    }
  }

  async getStudentsStatistics() {
    try {
      console.log('=== FETCHING STUDENTS STATISTICS ===');
      const response = await this.request('/students/statistics');
      return response;
    } catch (error) {
      console.error('Error fetching students statistics:', error);
      throw error;
    }
  }

  // === MÉTHODES UTILITAIRES ===
  
  calculateClientSideStats(students, subjects) {
    try {
      const totalStudents = students.length;
      const totalSubjects = subjects.length;
      
      let totalNotes = 0;
      let noteCount = 0;
      let classDistribution = {};
      
      students.forEach(student => {
        if (student.classe) {
          classDistribution[student.classe] = (classDistribution[student.classe] || 0) + 1;
        }
        
        if (student.notes && Object.keys(student.notes).length > 0) {
          Object.values(student.notes).forEach(note => {
            if (typeof note === 'number' && !isNaN(note)) {
              totalNotes += note;
              noteCount++;
            }
          });
        }
      });
      
      const averageGrade = noteCount > 0 ? (totalNotes / noteCount).toFixed(2) : 0;
      
      return {
        success: true,
        statistics: {
          totalStudents,
          totalSubjects,
          averageGrade: parseFloat(averageGrade),
          classDistribution,
          totalNotes: noteCount
        }
      };
    } catch (error) {
      console.error('Error calculating client-side stats:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  validateStudentData(studentData) {
    const errors = [];
    
    if (!studentData.nom || !studentData.nom.trim()) {
      errors.push('Le nom est requis');
    }
    
    if (!studentData.prenom || !studentData.prenom.trim()) {
      errors.push('Le prénom est requis');
    }
    
    if (!studentData.matricule || !studentData.matricule.trim()) {
      errors.push('Le matricule est requis');
    }
    
    if (!studentData.classe || !studentData.classe.trim()) {
      errors.push('La classe est requise');
    }
    
    if (studentData.notes) {
      Object.entries(studentData.notes).forEach(([subject, note]) => {
        if (note !== null && note !== undefined) {
          const numNote = parseFloat(note);
          if (isNaN(numNote) || numNote < 0 || numNote > 20) {
            errors.push(`La note pour ${subject} doit être entre 0 et 20`);
          }
        }
      });
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  validateSubjectData(subjectData) {
    const errors = [];
    
    if (!subjectData.name || !subjectData.name.trim()) {
      errors.push('Le nom de la matière est requis');
    }
    
    if (!subjectData.coefficient || subjectData.coefficient < 1 || subjectData.coefficient > 5) {
      errors.push('Le coefficient doit être entre 1 et 5');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  validateTeacherData(teacherData) {
    const errors = [];
    
    if (!teacherData.name || !teacherData.name.trim()) {
      errors.push('Le nom de l\'enseignant est requis');
    }
    
    if (!teacherData.email || !teacherData.email.trim()) {
      errors.push('L\'email est requis');
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(teacherData.email)) {
        errors.push('L\'email n\'est pas valide');
      }
    }
    
    if (!teacherData.subject || !teacherData.subject.trim()) {
      errors.push('La matière enseignée est requise');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  async retryRequest(requestFn, maxRetries = 3, delay = 1000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Attempt ${attempt}/${maxRetries}`);
        return await requestFn();
      } catch (error) {
        console.error(`Attempt ${attempt} failed:`, error.message);
        
        if (attempt === maxRetries) {
          throw error;
        }
        
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
  }

  startConnectionMonitoring(callback, interval = 30000) {
    return setInterval(async () => {
      try {
        const isConnected = await this.isApiAvailable();
        callback(isConnected);
      } catch (error) {
        console.error('Connection monitoring error:', error);
        callback(false);
      }
    }, interval);
  }

  stopConnectionMonitoring(intervalId) {
    if (intervalId) {
      clearInterval(intervalId);
    }
  }
}

// Exporter une instance singleton
const apiService = new ApiService();

// Ajouter des méthodes de debug en développement
if (process.env.NODE_ENV === 'development') {
  window.apiService = apiService;
  
  apiService.enableDebugMode = () => {
    console.log('🔧 API Service Debug Mode Enabled');
    return {
      baseURL: apiService.baseURL,
      defaultConfig: apiService.defaultConfig
    };
  };
}

export default apiService;