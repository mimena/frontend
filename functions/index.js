const functions = require('firebase-functions');
const sgMail = require('@sendgrid/mail');

// Configurez votre API Key SendGrid
sgMail.setApiKey('SG.votre_api_key_sendgrid');

exports.sendSubjectCode = functions.https.onCall(async (data, context) => {
  const { subjectCode, subjectName, recipients } = data;

  try {
    // Créer les emails pour chaque destinataire
    const emailPromises = recipients.map(recipient => {
      const msg = {
        to: recipient.email,
        from: 'votre-email@example.com', // Doit être vérifié dans SendGrid
        subject: `Code de la matière: ${subjectName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #3b82f6; border-bottom: 3px solid #3b82f6; padding-bottom: 10px;">
              Code de Matière
            </h2>
            
            <p>Bonjour <strong>${recipient.name}</strong>,</p>
            
            <p>Voici le code pour accéder à la matière <strong>${subjectName}</strong> :</p>
            
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        padding: 30px; 
                        border-radius: 12px; 
                        text-align: center; 
                        margin: 30px 0;">
              <div style="background-color: white; 
                          padding: 20px; 
                          border-radius: 8px; 
                          display: inline-block;">
                <h1 style="color: #1e40af; 
                           font-size: 36px; 
                           margin: 0; 
                           letter-spacing: 4px;">
                  ${subjectCode}
                </h1>
              </div>
            </div>
            
            <p>Utilisez ce code pour accéder aux ressources de la matière dans le système.</p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            
            <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px;">
              <p style="margin: 0; font-size: 14px; color: #6b7280;">
                📧 <strong>Système de Gestion Scolaire - EduAdmin Pro</strong><br>
                🏫 [Nom de votre école]<br>
                📞 [Votre contact]
              </p>
            </div>
            
            <p style="color: #9ca3af; font-size: 12px; margin-top: 20px; text-align: center;">
              Cet email a été envoyé automatiquement. Merci de ne pas répondre à ce message.
            </p>
          </div>
        `
      };
      
      return sgMail.send(msg);
    });

    await Promise.all(emailPromises);

    return { 
      success: true, 
      message: `Emails envoyés à ${recipients.length} destinataire(s)` 
    };
  } catch (error) {
    console.error('Erreur SendGrid:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});