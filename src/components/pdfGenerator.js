import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generateStudentReport = (student, grades = [], subjects = []) => {
  const doc = new jsPDF();
  
  // En-tête du document
  doc.setFontSize(20);
  doc.text('RELEVÉ DE NOTES', 105, 15, { align: 'center' });
  doc.setFontSize(12);
  doc.text(`Étudiant: ${student.name}`, 20, 25);
  doc.text(`Matricule: ${student.matricule}`, 20, 32);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 39);

  // Préparer les données du tableau
  const tableData = grades.map(grade => {
    const subject = subjects.find(s => s.id === grade.subjectId);
    return [subject ? subject.name : 'Inconnu', grade.value];
  });

  // Calculer la moyenne
  let average = 'N/A';
  if (grades.length > 0) {
    const sum = grades.reduce((total, grade) => total + parseFloat(grade.value), 0);
    average = (sum / grades.length).toFixed(2);
    tableData.push(['MOYENNE GÉNÉRALE', average]);
  }

  // Générer le tableau
  doc.autoTable({
    startY: 50,
    head: [['Matière', 'Note']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185] },
    styles: { fontSize: 10 },
    margin: { top: 50 }
  });

  // Sauvegarder le PDF
  doc.save(`releve_notes_${student.matricule}.pdf`);
};

export const generateAllStudentsReport = (students, grades, subjects) => {
  const doc = new jsPDF();
  
  // En-tête du document
  doc.setFontSize(20);
  doc.text('RAPPORT GÉNÉRAL DES NOTES', 105, 15, { align: 'center' });
  doc.setFontSize(12);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 25);
  doc.text(`Total étudiants: ${students.length}`, 20, 32);

  // Préparer les données du tableau
  const tableData = students.map(student => {
    const studentGrades = grades.filter(grade => grade.studentId === student.id);
    let average = 'N/A';
    
    if (studentGrades.length > 0) {
      const sum = studentGrades.reduce((total, grade) => total + parseFloat(grade.value), 0);
      average = (sum / studentGrades.length).toFixed(2);
    }
    
    return [student.matricule, student.name, average, studentGrades.length];
  });

  // Générer le tableau
  doc.autoTable({
    startY: 45,
    head: [['Matricule', 'Nom', 'Moyenne', 'Nombre de notes']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185] },
    styles: { fontSize: 10 },
    margin: { top: 45 }
  });

  // Statistiques générales
  const studentsWithGrades = students.filter(student => 
    grades.some(grade => grade.studentId === student.id)
  ).length;

  const overallAverage = studentsWithGrades > 0 ? 
    (grades.reduce((total, grade) => total + parseFloat(grade.value), 0) / grades.length).toFixed(2) : 
    'N/A';

  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 20,
    head: [['Statistique', 'Valeur']],
    body: [
      ['Total étudiants', students.length],
      ['Étudiants notés', studentsWithGrades],
      ['Pourcentage notés', `${((studentsWithGrades / students.length) * 100).toFixed(1)}%`],
      ['Total notes', grades.length],
      ['Moyenne générale', overallAverage]
    ],
    theme: 'grid',
    headStyles: { fillColor: [156, 39, 176] },
    styles: { fontSize: 10 }
  });

  // Sauvegarder le PDF
  doc.save('rapport_general_notes.pdf');
};