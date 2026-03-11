// ============================================
// ELAB Tutor - Servizio Email SMTP
// Configurazione SendGrid/Mailgun per email genitori
// © Andrea Marro — 15/02/2026
// ============================================

/**
 * Servizio email per comunicazioni GDPR/COPPA con i genitori.
 * 
 * Provider supportati:
 * - SendGrid (consigliato per produzione)
 * - Mailgun
 * - AWS SES
 * - SMTP generico
 * 
 * Template:
 * - Consenso parentale richiesto
 * - Verifica consenso completata
 * - Notifica eliminazione dati
 * - Export dati completato
 */

// SECURITY: API keys MUST NOT use VITE_ prefix — Vite inlines them into the JS bundle.
// Email sending requires a server-side backend (webhook). These client-side methods
// are kept for template rendering only; actual sending must go through the backend.
const EMAIL_PROVIDER = import.meta.env.VITE_EMAIL_PROVIDER || 'sendgrid';
const SENDGRID_API_KEY = ''; // Removed: was VITE_SENDGRID_API_KEY — use backend
const MAILGUN_API_KEY = ''; // Removed: was VITE_MAILGUN_API_KEY — use backend
const MAILGUN_DOMAIN = ''; // Removed: was VITE_MAILGUN_DOMAIN — use backend
const FROM_EMAIL = import.meta.env.VITE_FROM_EMAIL || 'noreply@elab-stem.com';
const FROM_NAME = import.meta.env.VITE_FROM_NAME || 'ELAB Tutor';

// ============================================
// TEMPLATE EMAIL
// ============================================

const EMAIL_TEMPLATES = {
  /**
   * Template: Richiesta consenso parentale
   */
  parentalConsentRequest: (data) => ({
    subject: `Richiesta consenso parentale per ${data.childName} - ELAB Tutor`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Consenso Parentale ELAB Tutor</title>
  <style>
    body { font-family: 'Open Sans', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #1E4D8C 0%, #0d1b2a 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .header h1 { color: #fff; margin: 0; font-size: 24px; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .button { display: inline-block; background: #7CB342; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
    .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
    .info-box { background: #e8f4fd; border-left: 4px solid #1E4D8C; padding: 15px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="header">
    <h1>ELAB Tutor - Piattaforma Educativa STEM</h1>
  </div>
  
  <div class="content">
    <p>Gentile ${data.parentName || 'Genitore/Tutore'},</p>
    
    <p>Suo figlio/a <strong>${data.childName}</strong> ha richiesto di registrarsi su ELAB Tutor, 
    una piattaforma educativa per l'apprendimento dell'elettronica e della programmazione Arduino.</p>
    
    <div class="warning">
      <strong>Importante:</strong> Poiché ${data.childName} ha ${data.childAge} anni, 
      ${data.childAge < 13 ? 'secondo il COPPA (Children\'s Online Privacy Protection Act) statunitense' : 'secondo il GDPR europeo'}, 
      è necessario il suo consenso esplicito come genitore o tutore legale.
    </div>
    
    <div class="info-box">
      <strong>Cosa è ELAB Tutor?</strong><br>
      • Piattaforma educativa per bambini e ragazzi 8-14 anni<br>
      • Simulatore circuiti elettronici e Arduino<br>
      • 67 esperimenti guidati<br>
      • Nessuna pubblicità o profilazione commerciale<br>
      • Dati protetti e cifrati
    </div>
    
    <h3>Dati che raccogliamo:</h3>
    <ul>
      <li>Nome e email (solo per accesso)</li>
      <li>Progressi negli esperimenti</li>
      <li>Esperimenti completati</li>
      ${data.childAge >= 16 ? '' : '<li>Stati emotivi durante l\'apprendimento (cifrati, solo per migliorare l\'esperienza)</li>'}
    </ul>
    
    <h3>I suoi diritti:</h3>
    <ul>
      <li>Accedere ai dati di suo figlio in qualsiasi momento</li>
      <li>Richiedere la cancellazione completa dei dati</li>
      <li>Revocare il consenso in qualsiasi momento</li>
      <li>Ricevere i dati in formato portabile</li>
    </ul>
    
    <p style="text-align: center;">
      <a href="${data.confirmationUrl}" class="button">✓ Do il mio consenso</a>
    </p>
    
    <p style="text-align: center; font-size: 12px; color: #666;">
      O copi e incolli questo link nel browser:<br>
      ${data.confirmationUrl}
    </p>
    
    <p><strong>Questo link scade tra 7 giorni.</strong></p>
    
    <div class="footer">
      <p><strong>Contatti:</strong><br>
      Email: privacy@elab-stem.com<br>
      DPO: privacy@elab-stem.com<br>
      Indirizzo: [Inserire indirizzo legale]</p>
      
      <p>Per maggiori informazioni sulla privacy: 
      <a href="https://elab-builder.vercel.app/privacy">Privacy Policy</a></p>
      
      <p>Se non è il genitore/tutore di ${data.childName}, ignori questa email.</p>
      
      <p style="font-size: 11px; color: #999;">
        ELAB STEM - © 2026 Andrea Marro. Tutti i diritti riservati.<br>
        Questa email è stata inviata automaticamente da ELAB Tutor.
      </p>
    </div>
  </div>
</body>
</html>
    `,
    text: `Gentile ${data.parentName || 'Genitore/Tutore'},

Suo figlio/a ${data.childName} ha richiesto di registrarsi su ELAB Tutor.

Poiché ${data.childName} ha ${data.childAge} anni, è necessario il suo consenso come genitore/tutore legale.

Per dare il consenso, visiti questo link (scade tra 7 giorni):
${data.confirmationUrl}

Cosa è ELAB Tutor:
- Piattaforma educativa STEM per bambini 8-14 anni
- Simulatore circuiti elettronici e Arduino
- Nessuna pubblicità
- Dati protetti

I suoi diritti:
- Accedere ai dati di suo figlio
- Richiedere cancellazione dati
- Revocare il consenso
- Ricevere dati in formato portabile

Contatti:
Email: privacy@elab-stem.com
Privacy Policy: https://elab-builder.vercel.app/privacy

Se non è il genitore/tutore di ${data.childName}, ignori questa email.

ELAB STEM - © 2026 Andrea Marro`
  }),

  /**
   * Template: Conferma consenso completato
   */
  parentalConsentConfirmed: (data) => ({
    subject: `Consenso confermato - Account ${data.childName} attivato`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Open Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
    .success { background: #d4edda; border: 1px solid #c3e6cb; padding: 20px; border-radius: 10px; text-align: center; }
    .icon { font-size: 48px; margin-bottom: 10px; }
    h1 { color: #155724; margin: 0; }
  </style>
</head>
<body>
  <div class="success">
    <div class="icon" style="font-size:36px;color:#155724;">&#10003;</div>
    <h1>Consenso Confermato!</h1>
    <p>L'account di <strong>${data.childName}</strong> è ora attivo.</p>
  </div>
  
  <p>Gentile ${data.parentName},</p>
  
  <p>La ringraziamo per aver confermato il consenso parentale. L'account di ${data.childName} 
  su ELAB Tutor è stato attivato con successo.</p>
  
  <h3>Riepilogo:</h3>
  <ul>
    <li>Nome bambino/a: ${data.childName}</li>
    <li>Email registrata: ${data.childEmail}</li>
    <li>Data attivazione: ${new Date().toLocaleDateString('it-IT')}</li>
    <li>Consenso valido fino a: revoca o 18 anni del bambino</li>
  </ul>
  
  <h3>Può gestire il consenso:</h3>
// © Andrea Marro — 11/03/2026 — ELAB Tutor — Tutti i diritti riservati
  <p>In qualsiasi momento può:</p>
  <ul>
    <li>Accedere ai dati di suo figlio: <a href="${data.parentDashboardUrl}">Area Genitori</a></li>
    <li>Richiedere l'eliminazione completa dei dati</li>
    <li>Revocare il consenso</li>
  </ul>
  
  <p>Per qualsiasi domanda: <a href="mailto:privacy@elab-stem.com">privacy@elab-stem.com</a></p>
  
  <p style="font-size: 12px; color: #666; margin-top: 30px;">
    ELAB STEM - © 2026 Andrea Marro<br>
    <a href="https://elab-builder.vercel.app/privacy">Privacy Policy</a>
  </p>
</body>
</html>
    `,
    text: `Consenso Confermato!

Gentile ${data.parentName},

Grazie per aver confermato il consenso parentale. L'account di ${data.childName} è attivo.

Riepilogo:
- Nome: ${data.childName}
- Email: ${data.childEmail}
- Data: ${new Date().toLocaleDateString('it-IT')}

Può gestire il consenso qui: ${data.parentDashboardUrl}

Per domande: privacy@elab-stem.com

ELAB STEM - © 2026 Andrea Marro`
  }),

  /**
   * Template: Notifica eliminazione dati
   */
  dataDeletionConfirmed: (data) => ({
    subject: 'Conferma eliminazione dati - ELAB Tutor',
    html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Open Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
    .deleted { background: #f8d7da; border: 1px solid #f5c6cb; padding: 20px; border-radius: 10px; }
    h1 { color: #721c24; margin: 0; }
    .timestamp { font-family: monospace; background: #f5f5f5; padding: 5px 10px; border-radius: 4px; }
  </style>
</head>
<body>
  <div class="deleted">
    <h1>Dati Eliminati</h1>
    <p>Tutti i dati dell'account sono stati eliminati in conformità con l'Art. 17 del GDPR.</p>
  </div>
  
  <p>Gentile Utente,</p>
  
  <p>La informiamo che in data <span class="timestamp">${new Date().toISOString()}</span> 
  sono stati eliminati tutti i dati personali associati al suo account.</p>
  
  <h3>Dati eliminati:</h3>
  <ul>
    <li>Profilo utente</li>
    <li>Progressi e completamenti</li>
    <li>Esperimenti e progetti salvati</li>
    <li>Stati emotivi e log attività</li>
    <li>Post e commenti (se presenti)</li>
    <li>Dati di sessione</li>
  </ul>
  
  <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
    <strong>Nota sui backup:</strong> I backup potrebbero contenere i suoi dati per un massimo 
    di 30 giorni per motivi di sicurezza, dopodiché saranno cancellati definitivamente.
  </div>
  
  <p>ID richiesta eliminazione: <code>${data.deletionId}</code></p>
  
  <p>Per qualsiasi domanda: <a href="mailto:privacy@elab-stem.com">privacy@elab-stem.com</a></p>
  
  <p style="font-size: 12px; color: #666; margin-top: 30px;">
    ELAB STEM - DPO: privacy@elab-stem.com<br>
    <a href="https://elab-builder.vercel.app/privacy">Privacy Policy</a>
  </p>
</body>
</html>
    `,
    text: `Dati Eliminati - ELAB Tutor

Gentile Utente,

In data ${new Date().toISOString()} sono stati eliminati tutti i dati del suo account.

Dati eliminati:
- Profilo utente
- Progressi e completamenti
- Esperimenti salvati
- Log attività
- Post e commenti
- Dati di sessione

Nota: Backup conservati per max 30 giorni.

ID richiesta: ${data.deletionId}

Per domande: privacy@elab-stem.com

ELAB STEM - DPO: privacy@elab-stem.com`
  }),

  /**
   * Template: Export dati completato
   */
  dataExportReady: (data) => ({
    subject: 'I tuoi dati sono pronti - ELAB Tutor',
    html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Open Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
    .ready { background: #d4edda; border: 1px solid #c3e6cb; padding: 20px; border-radius: 10px; }
    .button { display: inline-block; background: #7CB342; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
    .expiry { color: #856404; background: #fff3cd; padding: 10px; border-radius: 5px; }
  </style>
</head>
<body>
  <div class="ready">
    <h1>I tuoi dati sono pronti!</h1>
    <p>Il tuo export dati è stato completato con successo.</p>
  </div>
  
  <p>Gentile ${data.userName || 'Utente'},</p>
  
  <p>In conformità con l'Art. 20 del GDPR (diritto alla portabilità), 
  i tuoi dati sono pronti per il download.</p>
  
  <div style="text-align: center;">
    <a href="${data.downloadUrl}" class="button">Scarica i miei dati (JSON)</a>
  </div>
  
  <div class="expiry">
    <strong>Importante:</strong> Questo link scade il 
    <strong>${new Date(data.expiresAt).toLocaleDateString('it-IT')}</strong> 
    (7 giorni dalla richiesta).
  </div>
  
  <h3>Cosa include l'export:</h3>
  <ul>
    <li>Dati profilo</li>
    <li>Progressi esperimenti</li>
    <li>Cronologia attività</li>
    <li>Post e commenti (se presenti)</li>
  </ul>
  
  <p>I dati sono in formato JSON, un formato aperto e leggibile.</p>
  
  <p>Per qualsiasi domanda: <a href="mailto:privacy@elab-stem.com">privacy@elab-stem.com</a></p>
  
  <p style="font-size: 12px; color: #666; margin-top: 30px;">
    ELAB STEM - DPO: privacy@elab-stem.com<br>
    <a href="https://elab-builder.vercel.app/privacy">Privacy Policy</a>
  </p>
</body>
</html>
    `,
    text: `I tuoi dati sono pronti - ELAB Tutor

Gentile ${data.userName || 'Utente'},

I tuoi dati sono pronti per il download:
${data.downloadUrl}

Scade il: ${new Date(data.expiresAt).toLocaleDateString('it-IT')}

Include:
- Dati profilo
- Progressi
- Cronologia
- Post e commenti

Per domande: privacy@elab-stem.com

ELAB STEM - DPO: privacy@elab-stem.com`
  })
};

// ============================================
// SERVIZIO EMAIL
// ============================================

class EmailService {
  constructor() {
    this.provider = EMAIL_PROVIDER;
  }

  /**
   * Invia email via API
   * @param {Object} options - { to, subject, html, text, from }
   * @returns {Promise<Object>}
// © Andrea Marro — 11/03/2026 — ELAB Tutor — Tutti i diritti riservati
   */
  async send(options) {
    const { to, subject, html, text, from = { email: FROM_EMAIL, name: FROM_NAME } } = options;

    switch (this.provider) {
      case 'sendgrid':
        return this.sendViaSendGrid({ to, subject, html, text, from });
      case 'mailgun':
        return this.sendViaMailgun({ to, subject, html, text, from });
      default:
        throw new Error(`Provider email non supportato: ${this.provider}`);
    }
  }

  /**
   * Invia via SendGrid
   */
  async sendViaSendGrid({ to, subject, html, text, from }) {
    if (!SENDGRID_API_KEY) {
      throw new Error('VITE_SENDGRID_API_KEY non configurata');
    }

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: to }],
        }],
        from: { email: from.email, name: from.name },
        subject,
        content: [
          { type: 'text/plain', value: text },
          { type: 'text/html', value: html },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`SendGrid error: ${error}`);
    }

    return { success: true, provider: 'sendgrid' };
  }

  /**
   * Invia via Mailgun
   */
  async sendViaMailgun({ to, subject, html, text, from }) {
    if (!MAILGUN_API_KEY || !MAILGUN_DOMAIN) {
      throw new Error('Configurazione Mailgun mancante');
    }

    const formData = new URLSearchParams();
    formData.append('from', `${from.name} <${from.email}>`);
    formData.append('to', to);
    formData.append('subject', subject);
    formData.append('text', text);
    formData.append('html', html);

    const response = await fetch(`https://api.mailgun.net/v3/${MAILGUN_DOMAIN}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`api:${MAILGUN_API_KEY}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Mailgun error: ${error}`);
    }

    return { success: true, provider: 'mailgun' };
  }

  // ============================================
  // METODI CONVENIENZA
  // ============================================

  /**
   * Invia richiesta consenso parentale
   * @param {Object} data - { parentEmail, parentName, childName, childAge, confirmationUrl }
   */
  async sendParentalConsentRequest(data) {
    const template = EMAIL_TEMPLATES.parentalConsentRequest(data);
    return this.send({
      to: data.parentEmail,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  /**
   * Invia conferma consenso
   * @param {Object} data - { parentEmail, parentName, childName, childEmail, parentDashboardUrl }
   */
  async sendParentalConsentConfirmed(data) {
    const template = EMAIL_TEMPLATES.parentalConsentConfirmed(data);
    return this.send({
      to: data.parentEmail,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  /**
   * Invia conferma eliminazione dati
   * @param {Object} data - { userEmail, deletionId }
   */
  async sendDataDeletionConfirmed(data) {
    const template = EMAIL_TEMPLATES.dataDeletionConfirmed(data);
    return this.send({
      to: data.userEmail,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  /**
   * Invia notifica export dati pronto
   * @param {Object} data - { userEmail, userName, downloadUrl, expiresAt }
   */
  async sendDataExportReady(data) {
    const template = EMAIL_TEMPLATES.dataExportReady(data);
    return this.send({
      to: data.userEmail,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  /**
   * Verifica configurazione email
   * @returns {Object}
   */
  checkConfiguration() {
    const config = {
      provider: this.provider,
      fromEmail: FROM_EMAIL,
      fromName: FROM_NAME,
      configured: false,
      missing: [],
    };

    switch (this.provider) {
      case 'sendgrid':
        if (SENDGRID_API_KEY) {
          config.configured = true;
        } else {
          config.missing.push('VITE_SENDGRID_API_KEY');
        }
        break;
      case 'mailgun':
        if (MAILGUN_API_KEY && MAILGUN_DOMAIN) {
          config.configured = true;
        } else {
          if (!MAILGUN_API_KEY) config.missing.push('VITE_MAILGUN_API_KEY');
          if (!MAILGUN_DOMAIN) config.missing.push('VITE_MAILGUN_DOMAIN');
        }
        break;
    }

    return config;
  }
}

// Singleton
const emailService = new EmailService();

// Export
export default emailService;
// Named convenience exports removed — unused across codebase.
// Use the default export (emailService singleton) if needed.
