// ============================================
// ELAB Tutor - Context Autenticazione Server-Side
// Tutti i diritti riservati
// ============================================

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';
import logger from '../utils/logger';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [hasLicense, setHasLicense] = useState(false);
    const [licenseExpired, setLicenseExpired] = useState(false);
    const [loading, setLoading] = useState(true);

    // Al mount: verifica token in sessionStorage → chiedi profilo al server
    useEffect(() => {
        let cancelled = false;

        async function initAuth() {
            if (!authService.isAuthenticated()) {
                // DEV bypass: su localhost senza token, usa mock user per testing
                if (import.meta.env.DEV && !cancelled) {
                    logger.warn('[AuthContext] DEV mode — mock user attivo');
                    setUser({
                        id: 'dev-mock-001', email: 'dev@localhost',
                        username: 'dev.test', name: 'Dev', surname: 'Tester',
                        ruolo: 'admin', userType: 'family',
                        kits: ['Volume 1', 'Volume 2', 'Volume 3'],
                        premium: true, points: 999, level: 99
                    });
                    setHasLicense(true);
                }
                setLoading(false);
                return;
            }

            try {
                const profile = await authService.getProfile();
                if (!cancelled && profile) {
                    setUser(profile.user);
                    setHasLicense(profile.hasLicense);
                    setLicenseExpired(profile.licenseExpired || false);

                    // Timer per notifica scadenza token
                    authService.startAutoRefresh(() => {
                        // Token sta per scadere → forza logout
                        setUser(null);
                        setHasLicense(false);
                        setLicenseExpired(false);
                    });
                }
            } catch {
                // Token invalido o server non raggiungibile
                // DEV fallback: se il server non risponde in dev, usa mock
                if (import.meta.env.DEV && !cancelled) {
                    logger.warn('[AuthContext] DEV mode — server unreachable, mock user attivo');
                    setUser({
                        id: 'dev-mock-001', email: 'dev@localhost',
                        username: 'dev.test', name: 'Dev', surname: 'Tester',
                        ruolo: 'admin', userType: 'family',
                        kits: ['Volume 1', 'Volume 2', 'Volume 3'],
                        premium: true, points: 999, level: 99
                    });
                    setHasLicense(true);
                }
            }

            if (!cancelled) setLoading(false);
        }

        initAuth();
        return () => { cancelled = true; authService.stopAutoRefresh(); };
    }, []);

    // Andrea Marro — 18/02/2026

    const login = useCallback(async (emailOrUsername, password) => {
        const result = await authService.login(emailOrUsername, password);
        if (result.success) {
            setUser(result.user);
            setHasLicense(result.hasLicense || false);
            setLicenseExpired(false); // Fresh login → not expired

            authService.startAutoRefresh(() => {
                setUser(null);
                setHasLicense(false);
                setLicenseExpired(false);
            });
        }
        return result;
    }, []);

    const register = useCallback(async (data) => {
        const result = await authService.register(data);
        if (result.success) {
            setUser(result.user);
            setHasLicense(false); // Nuovi utenti non hanno licenza

            authService.startAutoRefresh(() => {
                setUser(null);
                setHasLicense(false);
            });
        }
        return result;
    }, []);

    const logout = useCallback(async () => {
        authService.stopAutoRefresh();
        await authService.logout();
        setUser(null);
        setHasLicense(false);
        setLicenseExpired(false);
        // Always redirect to login after logout (fix: teacher/admin pages staying on protected routes)
        window.history.replaceState(null, '', '#login');
    }, []);

    const activateLicense = useCallback(async (licenseCode) => {
        const result = await authService.activateLicense(licenseCode);
        if (result.success) {
            setHasLicense(true);
            // Aggiorna user con nuovi kits
            if (user) {
                setUser(prev => ({
                    ...prev,
                    kits: result.kits || prev.kits,
                    premium: true,
                }));
            }
        }
        return result;
    }, [user]);

    const refreshUser = useCallback(async () => {
        const profile = await authService.getProfile();
        if (profile) {
            setUser(profile.user);
            setHasLicense(profile.hasLicense);
            setLicenseExpired(profile.licenseExpired || false);
        }
    }, []);

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            hasLicense,
            licenseExpired,
            isAuthenticated: !!user,
            isAdmin: user?.ruolo === 'admin',
            isDocente: user?.ruolo === 'teacher',
            isStudente: user?.ruolo === 'student',
            login,
            register,
            logout,
            activateLicense,
            refreshUser,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth deve essere usato dentro AuthProvider');
    return ctx;
}

export default AuthContext;
