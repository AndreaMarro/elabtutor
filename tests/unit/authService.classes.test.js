// ============================================
// ELAB Tutor - Test Unitari AuthService — Gestione Classi
// Copre: createClass, joinClass, listClasses, removeStudent, updateClassGames
// ============================================

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    createClass,
    joinClass,
    listClasses,
    removeStudent,
    updateClassGames,
} from '../../src/services/authService';
import { mockFetchSuccess, mockFetchError, createMockHMACToken } from '../setup';

let memStore = {};

function useInMemoryStorage() {
    sessionStorage.setItem.mockImplementation((k, v) => { memStore[k] = String(v); });
    sessionStorage.getItem.mockImplementation((k) => memStore[k] ?? null);
    sessionStorage.removeItem.mockImplementation((k) => { delete memStore[k]; });
    localStorage.setItem.mockImplementation((k, v) => { memStore[k] = String(v); });
    localStorage.getItem.mockImplementation((k) => memStore[k] ?? null);
    localStorage.removeItem.mockImplementation((k) => { delete memStore[k]; });
}

function loginWithToken() {
    const token = createMockHMACToken({ userId: 'teacher1', role: 'teacher' });
    memStore['elab_auth_token'] = token;
}

// ── createClass ───────────────────────────────

describe('createClass', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        memStore = {};
        useInMemoryStorage();
        loginWithToken();
    });

    it('crea classe con successo e ritorna classCode e className', async () => {
        mockFetchSuccess({
            classCode: 'ABC123',
            className: 'Classe 1A',
            volumes: ['vol1', 'vol2'],
        });
        const result = await createClass('Classe 1A');
        expect(result.success).toBe(true);
        expect(result.classCode).toBe('ABC123');
        expect(result.className).toBe('Classe 1A');
        expect(result.volumes).toEqual(['vol1', 'vol2']);
    });

    it('ritorna success:false in caso di errore server', async () => {
        mockFetchError('Permesso negato', 403);
        const result = await createClass('Classe 1A');
        expect(result.success).toBe(false);
        expect(result.error).toBeTruthy();
    });

    it('gestisce nome classe vuoto senza crash', async () => {
        mockFetchSuccess({ classCode: 'XYZ999', className: '', volumes: [] });
        const result = await createClass('');
        expect(result.success).toBe(true);
    });

    it('include volumes nel risultato', async () => {
        mockFetchSuccess({ classCode: 'AB1', className: 'Test', volumes: ['vol3'] });
        const result = await createClass('Test');
        expect(result.volumes).toContain('vol3');
    });

    it('ritorna success:false se fetch lancia eccezione di rete', async () => {
        global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
        const result = await createClass('Classe');
        expect(result.success).toBe(false);
        expect(result.error).toContain('Network');
    });
});

// ── joinClass ─────────────────────────────────

describe('joinClass', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        memStore = {};
        useInMemoryStorage();
        loginWithToken();
    });

    it('entra in classe con successo e ritorna className', async () => {
        mockFetchSuccess({
            className: 'Classe 2B',
            volumes: ['vol1'],
            teacherName: 'Prof. Rossi',
        });
        const result = await joinClass('CLASS1');
        expect(result.success).toBe(true);
        expect(result.className).toBe('Classe 2B');
        expect(result.teacherName).toBe('Prof. Rossi');
        expect(result.volumes).toEqual(['vol1']);
    });

    it('ritorna success:false con codice classe invalido', async () => {
        mockFetchError('Codice classe non trovato', 404);
        const result = await joinClass('INVALID');
        expect(result.success).toBe(false);
        expect(result.error).toBeTruthy();
    });

    it('ritorna success:false con errore di rete', async () => {
        global.fetch = vi.fn().mockRejectedValue(new Error('Timeout'));
        const result = await joinClass('ABC123');
        expect(result.success).toBe(false);
    });

    it('gestisce volumes multipli', async () => {
        mockFetchSuccess({
            className: 'Classe 3C',
            volumes: ['vol1', 'vol2', 'vol3'],
            teacherName: 'Prof. Bianchi',
        });
        const result = await joinClass('MULTI1');
        expect(result.success).toBe(true);
        expect(result.volumes).toHaveLength(3);
    });

    it('ritorna success:false se classe piena', async () => {
        mockFetchError('Classe al completo', 409);
        const result = await joinClass('FULL01');
        expect(result.success).toBe(false);
    });
});

// ── listClasses ───────────────────────────────

describe('listClasses', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        memStore = {};
        useInMemoryStorage();
        loginWithToken();
    });

    it('ritorna lista classi con successo', async () => {
        mockFetchSuccess({
            classes: [
                { id: 'c1', name: 'Classe 1A', studentCount: 20 },
                { id: 'c2', name: 'Classe 2B', studentCount: 18 },
            ],
        });
        const result = await listClasses();
        expect(result.success).toBe(true);
        expect(result.classes).toHaveLength(2);
        expect(result.classes[0].name).toBe('Classe 1A');
    });

    it('ritorna lista vuota se nessuna classe', async () => {
        mockFetchSuccess({ classes: [] });
        const result = await listClasses();
        expect(result.success).toBe(true);
        expect(result.classes).toHaveLength(0);
    });

    it('ritorna success:false in caso di errore', async () => {
        mockFetchError('Non autorizzato', 401);
        const result = await listClasses();
        expect(result.success).toBe(false);
        expect(result.error).toBeTruthy();
    });

    it('ritorna success:false con errore di rete', async () => {
        global.fetch = vi.fn().mockRejectedValue(new Error('Connection refused'));
        const result = await listClasses();
        expect(result.success).toBe(false);
    });
});

// ── removeStudent ─────────────────────────────

describe('removeStudent', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        memStore = {};
        useInMemoryStorage();
        loginWithToken();
    });

    it('rimuove studente con successo', async () => {
        mockFetchSuccess({ removed: true });
        const result = await removeStudent('class1', 'student1');
        expect(result.success).toBe(true);
    });

    it('ritorna success:false se studente non trovato', async () => {
        mockFetchError('Studente non trovato', 404);
        const result = await removeStudent('class1', 'ghost1');
        expect(result.success).toBe(false);
        expect(result.error).toBeTruthy();
    });

    it('ritorna success:false se non si hanno permessi', async () => {
        mockFetchError('Permesso negato', 403);
        const result = await removeStudent('class1', 'student1');
        expect(result.success).toBe(false);
    });

    it('ritorna success:false con errore di rete', async () => {
        global.fetch = vi.fn().mockRejectedValue(new Error('Network'));
        const result = await removeStudent('class1', 'student1');
        expect(result.success).toBe(false);
    });
});

// ── updateClassGames ──────────────────────────

describe('updateClassGames', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        memStore = {};
        useInMemoryStorage();
        loginWithToken();
    });

    it('aggiorna giochi attivi con successo', async () => {
        const activeGames = ['detective', 'poe', 'reverse'];
        mockFetchSuccess({ activeGames });
        const result = await updateClassGames('class1', activeGames);
        expect(result.success).toBe(true);
        expect(result.activeGames).toEqual(activeGames);
    });

    it('disabilita tutti i giochi (array vuoto)', async () => {
        mockFetchSuccess({ activeGames: [] });
        const result = await updateClassGames('class1', []);
        expect(result.success).toBe(true);
        expect(result.activeGames).toHaveLength(0);
    });

    it('ritorna success:false se classe non trovata', async () => {
        mockFetchError('Classe non trovata', 404);
        const result = await updateClassGames('nonexistent', ['detective']);
        expect(result.success).toBe(false);
        expect(result.error).toBeTruthy();
    });

    it('ritorna success:false con errore di rete', async () => {
        global.fetch = vi.fn().mockRejectedValue(new Error('Offline'));
        const result = await updateClassGames('class1', ['detective']);
        expect(result.success).toBe(false);
    });

    it('ritorna activeGames aggiornati dal server', async () => {
        mockFetchSuccess({ activeGames: ['detective'] });
        const result = await updateClassGames('class1', ['detective', 'extra']);
        expect(result.activeGames).toEqual(['detective']);
    });

    it('gestisce singolo gioco attivo', async () => {
        mockFetchSuccess({ activeGames: ['poe'] });
        const result = await updateClassGames('class1', ['poe']);
        expect(result.success).toBe(true);
        expect(result.activeGames[0]).toBe('poe');
    });
});
