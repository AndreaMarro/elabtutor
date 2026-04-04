/**
 * ELAB — Analytics Consent Banner (GDPR Art. 8 / COPPA)
 * Banner per consenso cookie analitici - Ottimizzato per bambini 8-14 anni.
 * Mostra solo se l'utente non ha ancora scelto.
 * Include link alla Privacy Policy.
 *
 * Flow:
 *   Phase 'age'      — selettore eta (prima visita)
 *   Phase 'consent'   — accept/reject (>=14 anni)
 *   Phase 'parental'  — richiesta email genitore (<14 anni, Art. 8 GDPR Italia)
 *   Phase 'sent'      — conferma invio email genitore
 *
 * Consent values:
 *   'accepted' — analytics attivi (anonimizzati, no ID persistente)
 *   'rejected' — analytics bloccati
 *   'parental_required' — richiesto consenso genitore
 *   'parental_sent' — email inviata al genitore
 *   'parental_verified' — consenso genitore verificato
 *   null       — nessuna scelta (mostra banner)
 *
 * Italy digital age of consent: 14 (D.Lgs. 101/2018, Art. 2-quinquies)
 *
 * © Andrea Marro — 15/02/2026
 */

import React, { useState, useEffect } from 'react';
import { getConsent, saveConsent, isCOPPAApplicable } from '../../services/gdprService';
import gdprService from '../../services/gdprService';
import studentTracker from '../../services/studentTracker';
import { showToast } from './Toast';
import useFocusTrap from '../../hooks/useFocusTrap';
import styles from './ConsentBanner.module.css';

const CONSENT_KEY = 'elab_consent_v2';

/** Soglia eta digitale Italia (Art. 8 GDPR + D.Lgs. 101/2018) */
const ITALY_DIGITAL_AGE = 14;

/** Opzioni eta per il selettore */
const AGE_OPTIONS = [
  { value: '', label: 'Scegli...' },
  ...Array.from({ length: 10 }, (_, i) => ({
    value: String(8 + i),
    label: `${8 + i} anni`,
  })),
  { value: '18', label: '18+ anni' },
];

/**
 * Valida un indirizzo email con un pattern base.
 * @param {string} email
 * @returns {boolean}
 */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function ConsentBanner() {
  const [visible, setVisible] = useState(false);
  const [userAge, setUserAge] = useState(null);
  const [phase, setPhase] = useState('age'); // 'age' | 'consent' | 'parental' | 'sent'
  const [parentEmail, setParentEmail] = useState('');
  const [parentEmailError, setParentEmailError] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    try {
      const consent = getConsent();
      if (consent === null) {
        setVisible(true);
      } else if (consent.status === 'parental_required' || consent.status === 'parental_sent') {
        // Minore senza consenso parentale verificato — mostra stato attesa
        setVisible(true);
        setPhase('sent');
        if (consent.parentEmail) {
          setParentEmail(consent.parentEmail);
        }
      }

      // Recupera eta se disponibile
      const storedAge = sessionStorage.getItem('elab_user_age');
      if (storedAge) {
        const age = parseInt(storedAge, 10);
        setUserAge(age);
        // Se l'eta e' gia' nota, salta la fase age
        if (age >= ITALY_DIGITAL_AGE) {
          setPhase('consent');
        } else {
          // Se non e' gia' in fase 'sent', mostra flusso parentale
          setPhase(prev => prev === 'sent' ? 'sent' : 'parental');
        }
      }
    } catch {
      // localStorage non disponibile — non mostrare banner
    }
  }, []);

  /** Gestione selezione eta */
  const handleAgeConfirm = () => {
    if (!userAge) return;

    try {
      sessionStorage.setItem('elab_user_age', String(userAge));
    } catch {
      // ignore
    }

    if (userAge >= ITALY_DIGITAL_AGE) {
      setPhase('consent');
    } else {
      setPhase('parental');
    }
  };

  /** Accetta consenso (solo >=14) */
  const handleAccept = () => {
    try {
      saveConsent({
        status: 'accepted',
        age: userAge,
        timestamp: new Date().toISOString(),
        analyticsAnonymized: true,
      });
      localStorage.setItem(CONSENT_KEY, 'accepted');
    } catch {
      // ignore
    }
    // GDPR Art.7: attivare tracking SOLO dopo consenso esplicito
    studentTracker.initAfterConsent();
    setVisible(false);
  };

  /** Rifiuta consenso */
  const handleReject = () => {
    try {
      saveConsent({
        status: 'rejected',
        age: userAge,
        timestamp: new Date().toISOString(),
      });
      localStorage.setItem(CONSENT_KEY, 'rejected');
    } catch {
      // ignore
    }
    setVisible(false);
  };

  /** Invio richiesta consenso parentale */
  const handleParentalRequest = async () => {
    setParentEmailError('');

    if (!parentEmail.trim()) {
      setParentEmailError("Inserisci l'email del tuo genitore");
      return;
    }

    if (!isValidEmail(parentEmail.trim())) {
      setParentEmailError("Questa email non sembra corretta. Controlla bene!");
      return;
    }

    setSending(true);
    try {
      await gdprService.requestParentalConsent({
        childAge: userAge,
        parentEmail: parentEmail.trim(),
        consentMethod: 'email',
      });

      // Salva stato locale
      saveConsent({
        status: 'parental_required',
        age: userAge,
        parentEmail: parentEmail.trim(),
        timestamp: new Date().toISOString(),
      });

      setPhase('sent');
      showToast('Email inviata al tuo genitore!', 'success');
    } catch {
      // Webhook fallito: NON fingere che l'email sia stata inviata (COPPA compliance)
      setParentEmailError("Non siamo riusciti a inviare l'email. Riprova tra poco o chiedi al tuo insegnante.");
      showToast("Invio email fallito — riprova", 'error');
    } finally {
      setSending(false);
    }
  };

  // Messaggio adattato per bambini
  const isChild = userAge && userAge < ITALY_DIGITAL_AGE;

  // Maschera parziale dell'email genitore per conferma
  const maskedEmail = parentEmail
    ? parentEmail.replace(/^(.{2})(.*)(@.*)$/, (_, a, b, c) => a + '*'.repeat(Math.min(b.length, 5)) + c)
    : '';

  const trapRef = useFocusTrap(visible);

  if (!visible) return null;

  return (
    <div ref={trapRef} className={styles.banner} role="dialog" aria-label="Consenso privacy" aria-modal="true">
      {/* ── FASE 1: Selezione eta ── */}
      {phase === 'age' && (
        <div className={styles.content}>
          <div className={styles.textContainer}>
            <p className={styles.textChild}>
              Prima di iniziare, dicci quanti anni hai. Ci serve per proteggerti al meglio!
            </p>
            <div className={styles.ageRow}>
              <label htmlFor="elab-age-select" className={styles.ageLabel}>
                Quanti anni hai?
              </label>
              <select
                id="elab-age-select"
                className={styles.ageSelect}
                value={userAge || ''}
                onChange={(e) => {
                  const v = e.target.value;
                  setUserAge(v ? parseInt(v, 10) : null);
                }}
              >
                {AGE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <button
                className={styles.btnAccept}
                onClick={handleAgeConfirm}
                disabled={!userAge}
              >
                Avanti
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── FASE 2a: Consenso standard (>=14) ── */}
      {phase === 'consent' && (
        <>
          <div className={styles.content}>
            <div className={styles.textContainer}>
              <p className={isChild ? styles.textChild : styles.text}>
                {isChild
                  ? "Questo sito usa dei 'biscottini' (cookie) per funzionare meglio. Non preoccuparti: non raccontiamo i tuoi segreti a nessuno!"
                  : "Questo sito raccoglie informazioni anonime per migliorare l'esperienza. I dati sono protetti e non condivisi con terze parti."
                }
                {' '}
                <a
                  href="/privacy"
                  className={styles.privacyLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {isChild ? "Cosa sono i cookie?" : "Informativa Privacy"}
                </a>
              </p>

              {userAge && isCOPPAApplicable(userAge) && (
                <p className={styles.coppaNotice}>
                  <strong>Per i genitori:</strong> Se tuo figlio ha meno di 13 anni,
                  il consenso deve essere dato da un genitore o tutore legale.
                </p>
              )}
            </div>
          </div>

          <div className={styles.buttons}>
            <button className={styles.btnAccept} onClick={handleAccept}>
              {isChild ? "Ok, va bene!" : "Accetto"}
            </button>
            <button className={styles.btnReject} onClick={handleReject}>
              {isChild ? "No, grazie" : "Rifiuto"}
            </button>
          </div>
        </>
      )}

      {/* ── FASE 2b: Flusso parentale (<14 anni) ── */}
      {phase === 'parental' && (
        <div className={styles.content}>
          <div className={styles.textContainer}>
            <p className={styles.textChild}>
              Hai meno di 14 anni, quindi serve il permesso di un genitore o tutore.
              Niente paura, ci mettiamo pochissimo!
            </p>
            <p className={styles.parentalExplain}>
              Scrivi l'email di mamma o papa e noi gli mandiamo un messaggio per chiedere il permesso.
            </p>

            <div className={styles.parentalForm}>
              <label htmlFor="elab-parent-email" className={styles.ageLabel}>
                Email del genitore
              </label>
              <input
                id="elab-parent-email"
                type="email"
                className={styles.parentInput}
                placeholder="nome@email.com"
                value={parentEmail}
                onChange={(e) => {
                  setParentEmail(e.target.value);
                  setParentEmailError('');
                }}
                disabled={sending}
              />
              {parentEmailError && (
                <p className={styles.emailError}>{parentEmailError}</p>
              )}
              <button
                className={styles.btnParental}
                onClick={handleParentalRequest}
                disabled={sending}
              >
                {sending ? 'Invio in corso...' : 'Chiedi al genitore'}
              </button>
            </div>

            <p className={styles.parentalNote}>
              Intanto puoi usare ELAB in modalita limitata:
              i tuoi dati restano solo su questo dispositivo.
            </p>
          </div>
        </div>
      )}

      {/* ── FASE 3: Conferma invio ── */}
      {phase === 'sent' && (
        <div className={styles.content}>
          <div className={styles.textContainer}>
            <p className={styles.textChild}>
              Abbiamo mandato un'email a <strong>{maskedEmail}</strong>.
              Chiedi al tuo genitore di confermare!
            </p>
            <p className={styles.parentalNote}>
              Intanto puoi continuare a usare ELAB. I tuoi dati restano al sicuro
              solo su questo dispositivo: niente analytics, niente dati inviati fuori.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
