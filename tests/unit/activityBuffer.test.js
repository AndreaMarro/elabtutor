// ============================================
// ELAB Tutor — Test: activityBuffer + sessionMetrics
// Copertura: pushActivity, getRecentActivities,
//            formatForContext, clearActivities,
//            trackExperimentLoad, trackCompilation,
//            trackInteraction, formatForContext (metrics),
//            resetMetrics
// ============================================

import { describe, it, expect, beforeEach } from 'vitest';
import {
    pushActivity,
    getRecentActivities,
    formatForContext,
    clearActivities,
} from '../../src/services/activityBuffer';
import {
    trackExperimentLoad,
    trackCompilation,
    trackInteraction,
    formatForContext as metricsFormatForContext,
    resetMetrics,
} from '../../src/services/sessionMetrics';

// ─── activityBuffer ─────────────────────────────────────

describe('activityBuffer — happy path', () => {
    beforeEach(() => {
        clearActivities();
    });

    it('push e recupero di una singola attività', () => {
        pushActivity('compile_error', 'undefined reference to loop');
        const activities = getRecentActivities(5);
        expect(activities).toHaveLength(1);
        expect(activities[0].type).toBe('compile_error');
        expect(activities[0].detail).toBe('undefined reference to loop');
    });

    it('restituisce le N attività più recenti', () => {
        pushActivity('play', '');
        pushActivity('tab_switch', 'breadboard');
        pushActivity('compile_error', 'syntax error');
        pushActivity('component_added', 'led-1');
        pushActivity('component_added', 'led-2');

        const last3 = getRecentActivities(3);
        expect(last3).toHaveLength(3);
        expect(last3[2].type).toBe('component_added');
        expect(last3[2].detail).toBe('led-2');
    });

    it('le attività hanno timestamp', () => {
        const before = Date.now();
        pushActivity('play', '');
        const after = Date.now();
        const activities = getRecentActivities(1);
        expect(activities[0].ts).toBeGreaterThanOrEqual(before);
        expect(activities[0].ts).toBeLessThanOrEqual(after);
    });

    it('clearActivities svuota il buffer', () => {
        pushActivity('play', '');
        pushActivity('compile_error', 'error');
        clearActivities();
        expect(getRecentActivities()).toHaveLength(0);
    });
});

describe('activityBuffer — ring buffer (MAX_SIZE = 20)', () => {
    beforeEach(() => {
        clearActivities();
    });

    it('non supera MAX_SIZE (20) elementi', () => {
        for (let i = 0; i < 25; i++) {
            pushActivity('play', `round-${i}`);
        }
        const all = getRecentActivities(100);
        expect(all).toHaveLength(20);
    });

    it('mantiene le attività più recenti quando il buffer è pieno', () => {
        for (let i = 0; i < 25; i++) {
            pushActivity('play', `round-${i}`);
        }
        const all = getRecentActivities(20);
        // Le prime 5 (round-0..4) devono essere scartate
        expect(all[0].detail).toBe('round-5');
        expect(all[19].detail).toBe('round-24');
    });
});

describe('activityBuffer — formatForContext', () => {
    beforeEach(() => {
        clearActivities();
    });

    it('restituisce stringa vuota con buffer vuoto', () => {
        expect(formatForContext()).toBe('');
    });

    it('include header [ATTIVITÀ RECENTE]', () => {
        pushActivity('play', '');
        const ctx = formatForContext(1);
        expect(ctx).toContain('[ATTIVITÀ RECENTE]');
    });

    it('include tipo e dettaglio attività', () => {
        pushActivity('compile_error', 'ledPin non dichiarato');
        const ctx = formatForContext(1);
        expect(ctx).toContain('compile_error');
        expect(ctx).toContain('ledPin non dichiarato');
    });

    it('include timestamp formattato HH:MM:SS', () => {
        pushActivity('play', '');
        const ctx = formatForContext(1);
        expect(ctx).toMatch(/\[\d{2}:\d{2}:\d{2}\]/);
    });

    it('numera le attività in sequenza', () => {
        pushActivity('play', '');
        pushActivity('compile_error', 'err');
        const ctx = formatForContext(2);
        expect(ctx).toContain('1.');
        expect(ctx).toContain('2.');
    });

    it('non mostra dettaglio per attività senza detail', () => {
        pushActivity('play', '');
        const ctx = formatForContext(1);
        expect(ctx).toContain('play');
        // Non deve apparire ": " finale vuoto
        expect(ctx).not.toMatch(/play: $/m);
    });

    it('limita a n attività anche se ci sono di più', () => {
        for (let i = 0; i < 10; i++) {
            pushActivity('step', `${i}`);
        }
        const ctx = formatForContext(3);
        const lines = ctx.split('\n').filter(l => l.match(/^\d+\./));
        expect(lines).toHaveLength(3);
    });
});

describe('activityBuffer — edge case', () => {
    beforeEach(() => {
        clearActivities();
    });

    it('gestisce type vuoto', () => {
        pushActivity('', '');
        const activities = getRecentActivities(1);
        expect(activities[0].type).toBe('');
    });

    it('gestisce detail null (converte a stringa)', () => {
        pushActivity('test', null);
        const activities = getRecentActivities(1);
        expect(typeof activities[0].detail).toBe('string');
    });

    it('gestisce detail undefined (usa default "")', () => {
        pushActivity('test');
        const activities = getRecentActivities(1);
        expect(activities[0].detail).toBe('');
    });

    it('tronca detail a 120 caratteri', () => {
        const longDetail = 'x'.repeat(200);
        pushActivity('test', longDetail);
        const activities = getRecentActivities(1);
        expect(activities[0].detail.length).toBeLessThanOrEqual(120);
    });

    it('getRecentActivities con n=1 restituisce solo ultima attività', () => {
        pushActivity('play', 'primo');
        pushActivity('compile_error', 'secondo');
        const result = getRecentActivities(1);
        expect(result).toHaveLength(1);
        expect(result[0].detail).toBe('secondo');
    });

    it('getRecentActivities senza argomenti usa default n=5', () => {
        for (let i = 0; i < 10; i++) pushActivity('play', `${i}`);
        expect(getRecentActivities()).toHaveLength(5);
    });

    it('pushActivity con XSS input nel detail', () => {
        const xss = '<script>alert("xss")</script>';
        pushActivity('user_input', xss);
        const activities = getRecentActivities(1);
        // Deve essere memorizzato così com'è (sanitizzazione non di competenza del buffer)
        expect(activities[0].detail).toContain('<script>');
    });

    it('doppia clear non causa errori', () => {
        clearActivities();
        clearActivities();
        expect(getRecentActivities()).toHaveLength(0);
    });

    it('pushActivity molte volte in rapida successione (race simulation)', () => {
        for (let i = 0; i < 100; i++) {
            pushActivity('rapid', `${i}`);
        }
        const all = getRecentActivities(20);
        expect(all).toHaveLength(20);
        // L'ultimo deve essere round-99
        expect(all[19].detail).toBe('99');
    });
});

// ─── sessionMetrics ─────────────────────────────────────

describe('sessionMetrics — happy path', () => {
    beforeEach(() => {
        resetMetrics();
    });

    it('formatForContext restituisce stringa vuota senza esperimento caricato', () => {
        expect(metricsFormatForContext()).toBe('');
    });

    it('trackExperimentLoad inizia a tracciare', () => {
        trackExperimentLoad('exp-001');
        const ctx = metricsFormatForContext();
        expect(ctx).toContain('[METRICHE]');
    });

    it('include sessione e esperimento nel contesto', () => {
        trackExperimentLoad('exp-001');
        const ctx = metricsFormatForContext();
        expect(ctx).toContain('sessione=');
        expect(ctx).toContain('esperimento=');
    });

    it('traccia compilazioni di successo', () => {
        trackExperimentLoad('exp-001');
        trackCompilation(true);
        trackCompilation(true);
        const ctx = metricsFormatForContext();
        expect(ctx).toContain('compilazioni=2');
    });

    it('traccia compilazioni fallite', () => {
        trackExperimentLoad('exp-001');
        trackCompilation(true);
        trackCompilation(false);
        trackCompilation(false);
        const ctx = metricsFormatForContext();
        expect(ctx).toContain('compilazioni=3');
        expect(ctx).toContain('fallite=2');
    });

    it('non mostra "fallite" se tutte le compilazioni hanno successo', () => {
        trackExperimentLoad('exp-001');
        trackCompilation(true);
        trackCompilation(true);
        const ctx = metricsFormatForContext();
        expect(ctx).not.toContain('fallite');
    });

    it('non mostra "compilazioni" se non ci sono compilazioni', () => {
        trackExperimentLoad('exp-001');
        const ctx = metricsFormatForContext();
        expect(ctx).not.toContain('compilazioni');
    });

    it('resetMetrics azzera i contatori', () => {
        trackExperimentLoad('exp-001');
        trackCompilation(false);
        trackCompilation(false);
        resetMetrics();
        expect(metricsFormatForContext()).toBe('');
    });
});

describe('sessionMetrics — trackExperimentLoad reset contatori', () => {
    beforeEach(() => {
        resetMetrics();
    });

    it('caricare un nuovo esperimento azzera compilazioni', () => {
        trackExperimentLoad('exp-001');
        trackCompilation(false);
        trackCompilation(false);
        trackExperimentLoad('exp-002'); // nuovo esperimento
        const ctx = metricsFormatForContext();
        expect(ctx).not.toContain('compilazioni');
        expect(ctx).not.toContain('fallite');
    });

    it('aggiorna experimentId al caricamento', () => {
        trackExperimentLoad('exp-XYZ');
        // Non esponiamo experimentId direttamente, ma il contesto deve funzionare
        const ctx = metricsFormatForContext();
        expect(ctx).toContain('[METRICHE]');
    });
});

describe('sessionMetrics — trackInteraction', () => {
    beforeEach(() => {
        resetMetrics();
    });

    it('trackInteraction aggiorna lastInteraction senza errori', () => {
        trackExperimentLoad('exp-001');
        const before = Date.now();
        trackInteraction();
        // Non mostra "inattivo" subito dopo un'interazione
        const ctx = metricsFormatForContext();
        expect(ctx).not.toContain('inattivo');
    });
});

describe('sessionMetrics — edge case', () => {
    beforeEach(() => {
        resetMetrics();
    });

    it('molte compilazioni fallite consecutive', () => {
        trackExperimentLoad('exp-001');
        for (let i = 0; i < 50; i++) trackCompilation(false);
        const ctx = metricsFormatForContext();
        expect(ctx).toContain('compilazioni=50');
        expect(ctx).toContain('fallite=50');
    });

    it('trackCompilation con valore truthy non-boolean', () => {
        trackExperimentLoad('exp-001');
        trackCompilation(1); // truthy → success
        const ctx = metricsFormatForContext();
        expect(ctx).toContain('compilazioni=1');
        expect(ctx).not.toContain('fallite');
    });

    it('trackCompilation con valore falsy non-boolean (0)', () => {
        trackExperimentLoad('exp-001');
        trackCompilation(0); // falsy → failure
        const ctx = metricsFormatForContext();
        expect(ctx).toContain('fallite=1');
    });

    it('trackExperimentLoad con ID null non causa eccezioni', () => {
        expect(() => trackExperimentLoad(null)).not.toThrow();
        const ctx = metricsFormatForContext();
        expect(ctx).toContain('[METRICHE]');
    });

    it('doppio resetMetrics non causa errori', () => {
        trackExperimentLoad('exp-001');
        resetMetrics();
        resetMetrics();
        expect(metricsFormatForContext()).toBe('');
    });
});
