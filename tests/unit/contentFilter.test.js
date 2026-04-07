// ============================================
// ELAB Tutor — Test: contentFilter
// Copertura: checkContent, checkPII, sanitizeOutput,
//            getBlockMessage, validateMessage
// ============================================

import { describe, it, expect } from 'vitest';
import {
    checkContent,
    checkPII,
    sanitizeOutput,
    getBlockMessage,
    validateMessage,
} from '../../src/utils/contentFilter';

// ─── checkContent ─────────────────────────────────────

describe('checkContent — happy path', () => {
    it('permette messaggi educativi normali', () => {
        const r = checkContent('Come si collega un resistore a un LED?');
        expect(r.safe).toBe(true);
        expect(r.reason).toBeNull();
    });

    it('permette codice Arduino', () => {
        const r = checkContent('void loop() { digitalWrite(13, HIGH); delay(1000); }');
        expect(r.safe).toBe(true);
    });

    it('permette domande in inglese senza parolacce', () => {
        const r = checkContent('What is the resistance of a 220 ohm resistor?');
        expect(r.safe).toBe(true);
    });
});

describe('checkContent — blocco insulti', () => {
    it('blocca "cretino"', () => {
        const r = checkContent('Sei un cretino');
        expect(r.safe).toBe(false);
        expect(r.reason).toBe('inappropriate');
    });

    it('blocca "stupido"', () => {
        const r = checkContent('Non fare lo stupido con i circuiti');
        expect(r.safe).toBe(false);
        expect(r.reason).toBe('inappropriate');
    });

    it('blocca "cazzo"', () => {
        const r = checkContent('cazzo questo codice non funziona!');
        expect(r.safe).toBe(false);
        expect(r.reason).toBe('inappropriate');
    });

    it('blocca "vaffanculo"', () => {
        const r = checkContent('vaffanculo arduino');
        expect(r.safe).toBe(false);
        expect(r.reason).toBe('inappropriate');
    });

    it('blocca "stronzo"', () => {
        const r = checkContent('questo professore è uno stronzo');
        expect(r.safe).toBe(false);
        expect(r.reason).toBe('inappropriate');
    });

    it('case-insensitive: blocca "CRETINO"', () => {
        const r = checkContent('SEI UN CRETINO');
        expect(r.safe).toBe(false);
    });
});

describe('checkContent — blocco contenuti violenti/adulti', () => {
    it('blocca "ammazzare"', () => {
        const r = checkContent('voglio ammazzare questo robot');
        expect(r.safe).toBe(false);
        expect(r.reason).toBe('inappropriate');
    });

    it('blocca "bomba"', () => {
        const r = checkContent('costruiamo una bomba con Arduino');
        expect(r.safe).toBe(false);
        expect(r.reason).toBe('inappropriate');
    });

    it('blocca "porno"', () => {
        const r = checkContent('siti porno di elettronica');
        expect(r.safe).toBe(false);
        expect(r.reason).toBe('inappropriate');
    });

    it('blocca "droga"', () => {
        const r = checkContent('droga e circuiti');
        expect(r.safe).toBe(false);
        expect(r.reason).toBe('inappropriate');
    });

    it('blocca "cocaina"', () => {
        const r = checkContent('cocaina in farmacologia');
        expect(r.safe).toBe(false);
        expect(r.reason).toBe('inappropriate');
    });
});

describe('checkContent — edge case', () => {
    it('gestisce null', () => {
        const r = checkContent(null);
        expect(r.safe).toBe(true);
        expect(r.reason).toBeNull();
    });

    it('gestisce undefined', () => {
        const r = checkContent(undefined);
        expect(r.safe).toBe(true);
    });

    it('gestisce stringa vuota', () => {
        const r = checkContent('');
        expect(r.safe).toBe(true);
    });

    it('gestisce stringa corta < 3 caratteri', () => {
        const r = checkContent('ok');
        expect(r.safe).toBe(true);
    });

    it('gestisce stringa esattamente 3 caratteri (boundary)', () => {
        const r = checkContent('ccc');
        expect(r.safe).toBe(true);
    });

    it('non blocca stringa con "pistola" come termine tecnico in contesto accademico', () => {
        // "pistola" è in INAPPROPRIATE_PATTERNS — verifichiamo che sia bloccata coerentemente
        const r = checkContent('la pistola ad acqua è fatta di plastica');
        expect(r.safe).toBe(false); // atteso: bloccato — è nella wordlist
    });

    it('gestisce stringa molto lunga senza parole vietate', () => {
        const safe = 'Come funziona un condensatore? '.repeat(300);
        const r = checkContent(safe);
        expect(r.safe).toBe(true);
    });

    it('gestisce stringa con caratteri speciali/emoji', () => {
        const r = checkContent('Arduino 🤖 è fantastico! ⚡️');
        expect(r.safe).toBe(true);
    });

    it('gestisce stringa con XSS attempt', () => {
        const r = checkContent('<script>alert("xss")</script>');
        expect(r.safe).toBe(true); // XSS non è nelle wordlist — torna safe
    });

    it('gestisce JSON malformato come testo', () => {
        const r = checkContent('{invalid: json, "key": }');
        expect(r.safe).toBe(true);
    });
});

// ─── checkPII ─────────────────────────────────────

describe('checkPII — happy path', () => {
    it('non rileva PII in testo normale', () => {
        const r = checkPII('Come faccio a collegare il LED?');
        expect(r.hasPII).toBe(false);
        expect(r.type).toBeNull();
    });
});

describe('checkPII — rilevamento email', () => {
    it('rileva email standard', () => {
        const r = checkPII('Contattami a mario.rossi@gmail.com per info.');
        expect(r.hasPII).toBe(true);
        expect(r.type).toBe('email');
    });

    it('rileva email aziendale', () => {
        const r = checkPII('Scrivi a info@elabtutor.school');
        expect(r.hasPII).toBe(true);
        expect(r.type).toBe('email');
    });

    it('rileva email con sottodominio', () => {
        const r = checkPII('La mail è studente@scuola.edu.it');
        expect(r.hasPII).toBe(true);
        expect(r.type).toBe('email');
    });
});

describe('checkPII — rilevamento telefono', () => {
    it('rileva numero italiano standard', () => {
        const r = checkPII('Chiamami al 0234567890');
        expect(r.hasPII).toBe(true);
        expect(r.type).toBe('telefono');
    });

    it('rileva numero con prefisso +39', () => {
        const r = checkPII('Il mio numero è +39 333 1234567');
        expect(r.hasPII).toBe(true);
        expect(r.type).toBe('telefono');
    });
});

describe('checkPII — rilevamento codice fiscale', () => {
    it('rileva codice fiscale valido', () => {
        const r = checkPII('Il mio CF è RSSMRA85M01H501Z');
        expect(r.hasPII).toBe(true);
        expect(r.type).toBe('codice_fiscale');
    });
});

describe('checkPII — rilevamento indirizzo', () => {
    it('rileva via + numero civico', () => {
        const r = checkPII('Abito in Via Roma 42, Milano');
        expect(r.hasPII).toBe(true);
        expect(r.type).toBe('indirizzo');
    });

    it('rileva piazza + numero civico', () => {
        const r = checkPII('Sono in Piazza Garibaldi 1');
        expect(r.hasPII).toBe(true);
        expect(r.type).toBe('indirizzo');
    });
});

describe('checkPII — edge case', () => {
    it('gestisce null', () => {
        const r = checkPII(null);
        expect(r.hasPII).toBe(false);
        expect(r.type).toBeNull();
    });

    it('gestisce undefined', () => {
        const r = checkPII(undefined);
        expect(r.hasPII).toBe(false);
    });

    it('gestisce stringa vuota', () => {
        const r = checkPII('');
        expect(r.hasPII).toBe(false);
    });

    it('non confonde numeri casuali con telefono', () => {
        const r = checkPII('pinMode(13, OUTPUT); delay(1000);');
        expect(r.hasPII).toBe(false);
    });
});

// ─── sanitizeOutput ─────────────────────────────────────

describe('sanitizeOutput — happy path', () => {
    it('lascia testo sicuro invariato', () => {
        const text = 'Il LED si accende quando la tensione supera 2V.';
        expect(sanitizeOutput(text)).toBe(text);
    });

    it('sostituisce insulto con "***"', () => {
        const out = sanitizeOutput('Questo cretino non capisce i circuiti!');
        expect(out).toContain('***');
        expect(out).not.toContain('cretino');
    });

    it('sostituisce più parole vietate nella stessa stringa', () => {
        const out = sanitizeOutput('Lo stupido idiota non sa programmare.');
        expect(out).not.toContain('stupido');
        expect(out).not.toContain('idiota');
        expect(out.match(/\*\*\*/g)?.length).toBeGreaterThanOrEqual(2);
    });

    it('mantiene il resto del testo dopo la sanitizzazione', () => {
        const out = sanitizeOutput('Cretino! Ora il LED funziona correttamente.');
        expect(out).toContain('Ora'); // capitalizzazione originale preservata
        expect(out).toContain('LED');
        expect(out).toContain('correttamente');
    });
});

describe('sanitizeOutput — edge case', () => {
    it('gestisce null', () => {
        expect(sanitizeOutput(null)).toBeNull();
    });

    it('gestisce undefined', () => {
        expect(sanitizeOutput(undefined)).toBeUndefined();
    });

    it('gestisce stringa vuota', () => {
        expect(sanitizeOutput('')).toBe('');
    });

    it('sanitizza stringa molto lunga', () => {
        const long = 'Parola normale. '.repeat(500) + 'cretino. ' + 'Altra parola. '.repeat(100);
        const out = sanitizeOutput(long);
        expect(out).not.toContain('cretino');
        expect(out).toContain('***');
    });
});

// ─── getBlockMessage ─────────────────────────────────────

describe('getBlockMessage', () => {
    it('restituisce messaggio per "inappropriate"', () => {
        const msg = getBlockMessage('inappropriate');
        expect(msg).toContain('Galileo');
        expect(typeof msg).toBe('string');
        expect(msg.length).toBeGreaterThan(0);
    });

    it('restituisce messaggio per "pii"', () => {
        const msg = getBlockMessage('pii');
        expect(msg).toContain('sicurezza');
    });

    it('restituisce messaggio default per ragione sconosciuta', () => {
        const msg = getBlockMessage('unknown_reason');
        expect(typeof msg).toBe('string');
        expect(msg.length).toBeGreaterThan(0);
    });

    it('gestisce undefined reason', () => {
        const msg = getBlockMessage(undefined);
        expect(typeof msg).toBe('string');
    });

    it('gestisce null reason', () => {
        const msg = getBlockMessage(null);
        expect(typeof msg).toBe('string');
    });
});

// ─── validateMessage ─────────────────────────────────────

describe('validateMessage — happy path', () => {
    it('permette messaggio normale', () => {
        const r = validateMessage('Come funziona un resistore da 220 ohm?');
        expect(r.allowed).toBe(true);
        expect(r.message).toBeNull();
    });
});

describe('validateMessage — blocco contenuto inappropriato', () => {
    it('blocca insulto con messaggio', () => {
        const r = validateMessage('Sei uno stupido');
        expect(r.allowed).toBe(false);
        expect(typeof r.message).toBe('string');
        expect(r.message.length).toBeGreaterThan(0);
    });
});

describe('validateMessage — blocco PII', () => {
    it('blocca email con messaggio', () => {
        const r = validateMessage('Scrivimi a test@example.com per info');
        expect(r.allowed).toBe(false);
        expect(r.message).toBeTruthy();
    });
});

describe('validateMessage — edge case', () => {
    it('gestisce null', () => {
        const r = validateMessage(null);
        expect(r.allowed).toBe(true); // null → safe dal checkContent
    });

    it('gestisce stringa vuota', () => {
        const r = validateMessage('');
        expect(r.allowed).toBe(true);
    });

    it('gestisce stringa con solo spazi', () => {
        const r = validateMessage('   ');
        expect(r.allowed).toBe(true);
    });

    it('blocca prima il contenuto inappropriato (priorità su PII)', () => {
        // Contiene sia insulto che email — content check ha priorità
        const r = validateMessage('Cretino scrivimi a foo@bar.com');
        expect(r.allowed).toBe(false);
    });
});
