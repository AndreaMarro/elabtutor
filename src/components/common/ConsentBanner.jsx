/**
 * ELAB — Analytics Consent Banner (GDPR-K / COPPA)
 * Banner per consenso cookie analitici - Ottimizzato per bambini 8-14 anni.
 * Mostra solo se l'utente non ha ancora scelto.
 * Include link alla Privacy Policy.
 *
 * Consent values:
 *   'accepted' — analytics attivi (anonimizzati, no ID persistente)
 *   'rejected' — analytics bloccati
 *   'parental_required' — richiesto consenso genitore
 *   'parental_verified' — consenso genitore verificato
 *   null       — nessuna scelta (mostra banner)
 *
 * © Andrea Marro — 15/02/2026
 */

import React, { useState, useEffect } from 'react';
import { getConsent, saveConsent, isCOPPAApplicable } from '../../services/gdprService';
import { showToast } from './Toast';

const CONSENT_KEY = 'elab_consent_v2';

export default function ConsentBanner() {
  const [visible, setVisible] = useState(false);
  const [userAge, setUserAge] = useState(null);

  useEffect(() => {
    try {
      // Controlla consenso esistente
      const consent = getConsent();
      if (consent === null) {
        setVisible(true);
      }
      
      // Recupera età se disponibile
      const storedAge = sessionStorage.getItem('elab_user_age');
      if (storedAge) {
        setUserAge(parseInt(storedAge, 10));
      }
    } catch {
      // localStorage non disponibile — non mostrare banner
    }
  }, []);

  const handleAccept = () => {
    try {
      // Per bambini <16, serve consenso parentale
      if (userAge && userAge < 16) {
        saveConsent({
          status: 'parental_required',
          age: userAge,
          timestamp: new Date().toISOString(),
        });
        // Non nascondere banner - mostra messaggio per genitore
        showToast('Chiedi a un genitore o tutore di confermare!', 'info');
        return;
      }
      
      // Per utenti ≥16
      saveConsent({
        status: 'accepted',
        age: userAge,
        timestamp: new Date().toISOString(),
        analyticsAnonymized: true,
      });
      localStorage.setItem(CONSENT_KEY, 'accepted');
    } catch {}
    setVisible(false);
  };

  const handleReject = () => {
    try {
      saveConsent({
        status: 'rejected',
        age: userAge,
        timestamp: new Date().toISOString(),
      });
      localStorage.setItem(CONSENT_KEY, 'rejected');
    } catch {}
    setVisible(false);
  };

  // Messaggio adattato per bambini
  const isChild = userAge && userAge < 14;
  
  return (
    <>
      {visible && (
        <div style={styles.banner}>
          <div style={styles.content}>
            <div style={styles.textContainer}>
              <p style={isChild ? styles.textChild : styles.text}>
                {isChild 
                  ? "Questo sito usa dei 'biscottini' (cookie) per funzionare meglio. Non preoccuparti: non raccontiamo i tuoi segreti a nessuno!"
                  : "Questo sito raccoglie informazioni anonime per migliorare l'esperienza. I dati sono protetti e non condivisi con terze parti."
                }
                {' '}
                <a
                  href="/privacy"
                  style={styles.privacyLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {isChild ? "Cosa sono i cookie?" : "Informativa Privacy"}
                </a>
              </p>
              
              {userAge && isCOPPAApplicable(userAge) && (
                <p style={styles.coppaNotice}>
                  <strong>Per i genitori:</strong> Se tuo figlio ha meno di 13 anni,
                  il consenso deve essere dato da un genitore o tutore legale.
                </p>
              )}
            </div>
          </div>
          
          <div style={styles.buttons}>
            <button style={styles.btnAccept} onClick={handleAccept}>
              {isChild ? "Ok, va bene!" : "Accetto"}
            </button>
            <button style={styles.btnReject} onClick={handleReject}>
              {isChild ? "No, grazie" : "Rifiuto"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

const styles = {
  banner: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 99999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    padding: '16px 24px',
    backgroundColor: '#1E4D8C',
    color: '#ffffff',
    fontFamily: "'Open Sans', sans-serif",
    fontSize: '14px',
    boxShadow: '0 -2px 8px rgba(0,0,0,0.3)',
    flexWrap: 'wrap',
  },
  content: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    flex: '1 1 400px',
  },
  icon: {
    fontSize: '24px',
    flexShrink: 0,
  },
  textContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  text: {
    margin: 0,
    lineHeight: '1.5',
  },
  textChild: {
    margin: 0,
    lineHeight: '1.5',
    fontSize: '15px',
  },
  privacyLink: {
    background: 'none',
    border: 'none',
    color: '#4A7A25',
    textDecoration: 'underline',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 600,
    padding: '8px 4px',
    display: 'inline-block',
    minHeight: '44px',
    fontFamily: "'Open Sans', sans-serif",
  },
  coppaNotice: {
    margin: '4px 0 0 0',
    padding: '8px 12px',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: '6px',
    fontSize: '14px',
    lineHeight: '1.4',
  },
  buttons: {
    display: 'flex',
    gap: '8px',
    flexShrink: 0,
  },
  btnAccept: {
    padding: '10px 24px',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: '#4A7A25',
    color: '#1A1A2E',
    fontWeight: 600,
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'transform 0.2s, background-color 0.2s',
  },
  btnReject: {
    padding: '10px 24px',
    border: '1px solid #ffffff',
    borderRadius: '8px',
    backgroundColor: 'transparent',
    color: '#ffffff',
    fontWeight: 600,
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'transform 0.2s',
  },
};
