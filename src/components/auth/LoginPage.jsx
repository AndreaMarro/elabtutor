// ============================================
// ELAB Tutor - Pagina Accedi
// Tutti i diritti riservati
// ============================================

import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';

// Andrea Marro — 18/02/2026
const EyeIcon = ({ open }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {open ? (
            <>
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
            </>
        ) : (
            <>
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                <line x1="1" y1="1" x2="23" y2="23" />
            </>
        )}
    </svg>
);

const Spinner = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'loginSpin 0.8s linear infinite' }}>
        <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
    </svg>
);

export default function LoginPage({ onNavigate }) {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [focusedField, setFocusedField] = useState(null);
    const formRef = useRef(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email.trim() || !password.trim()) {
            setError('Compila tutti i campi');
            return;
        }
        setLoading(true);
        setError('');
        const result = await login(email, password);
        if (!result.success) {
            setError(result.error);
        } else {
            // Redirect basato sul ruolo — Andrea Marro — 18/02/2026
            const ruolo = result.user?.ruolo;
            if (ruolo === 'admin') {
                onNavigate('admin');
            } else if (ruolo === 'teacher') {
                onNavigate('teacher');
            } else {
                onNavigate('tutor');
            }
        }
        setLoading(false);
    };

    const inputStyle = (field) => ({
        ...styles.input,
        borderColor: focusedField === field
            ? '#4A7A25'
            : 'rgba(255,255,255,0.15)',
        boxShadow: focusedField === field
            ? '0 0 0 3px rgba(124,179,66,0.2)'
            : 'none',
        transition: 'border-color 200ms ease, box-shadow 200ms ease',
    });

    return (
        <div style={styles.page}>
            {/* Inject spinner keyframes */}
            <style>{`
                @keyframes loginSpin {
                    to { transform: rotate(360deg); }
                }
            `}</style>

            <div style={styles.card}>
                <div style={{ ...styles.logo, color: '#1E4D8C', fontWeight: 800, fontFamily: 'Oswald, sans-serif', letterSpacing: '-1px' }}>ELAB</div>
                <h1 style={styles.title}>Accedi</h1>
                <p style={styles.subtitle}>Accedi al Tutor ELAB UNLIM</p>

                <form onSubmit={handleSubmit} style={styles.form} ref={formRef} aria-label="Form di accesso">
                    <div style={styles.field}>
                        <label style={styles.label} htmlFor="login-email">Email</label>
                        <input
                            id="login-email"
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            onFocus={() => setFocusedField('email')}
                            onBlur={() => setFocusedField(null)}
                            placeholder="la-tua@email.com"
                            style={inputStyle('email')}
                            autoComplete="email"
                            autoFocus
                            disabled={loading}
                        />
                    </div>

                    <div style={styles.field}>
                        <label style={styles.label} htmlFor="login-password">Password</label>
                        <div style={styles.passwordWrap}>
                            <input
                                id="login-password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                onFocus={() => setFocusedField('password')}
                                onBlur={() => setFocusedField(null)}
                                placeholder="La tua password"
                                style={{ ...inputStyle('password'), paddingRight: '44px' }}
                                autoComplete="current-password"
                                disabled={loading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(p => !p)}
                                style={styles.eyeBtn}
                                aria-label={showPassword ? 'Nascondi password' : 'Mostra password'}
                                tabIndex={-1}
                            >
                                <EyeIcon open={showPassword} />
                            </button>
                        </div>
                    </div>

                    {error && <p style={styles.error} role="alert">{error}</p>}

                    <button
                        type="submit"
                        style={{
                            ...styles.button,
                            opacity: loading ? 0.7 : 1,
                            cursor: loading ? 'wait' : 'pointer',
                        }}
                        disabled={loading}
                    >
                        {loading ? (
                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                <Spinner /> Accesso in corso...
                            </span>
                        ) : 'Accedi'}
                    </button>
                </form>

                <p style={styles.footer}>
                    Non hai un account?{' '}
                    <button onClick={() => onNavigate('register')} style={styles.link}>Registrati</button>
                </p>

                <button onClick={() => onNavigate('showcase')} style={styles.backBtn}>
                    ← Scopri ELAB
                </button>
            </div>
        </div>
    );
}

const styles = {
    page: {
        height: '100%',
        overflowY: 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1E4D8C 0%, #0d1b2a 100%)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        padding: '16px',
    },
    card: {
        background: 'rgba(255,255,255,0.06)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        padding: window.innerWidth <= 480 ? '28px 20px' : '48px',
        textAlign: 'center',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
        maxWidth: '440px',
        width: '100%',
    },
    logo: { fontSize: '56px', marginBottom: '12px' },
    title: { color: '#fff', fontSize: '28px', fontWeight: '700', margin: '0 0 6px' },
    subtitle: { color: 'rgba(255,255,255,0.5)', fontSize: '14px', margin: '0 0 28px' },
    form: { display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' },
    field: { display: 'flex', flexDirection: 'column', gap: '6px' },
    label: { color: 'rgba(255,255,255,0.8)', fontSize: '14px', fontWeight: '600' },
    input: {
        padding: '14px 16px',
        fontSize: '15px',
        borderRadius: '10px',
        border: '1.5px solid rgba(255,255,255,0.15)',
        background: 'rgba(255,255,255,0.08)',
        color: '#fff',
        outline: 'none',
        width: '100%',
        boxSizing: 'border-box',
    },
    passwordWrap: {
        position: 'relative',
    },
    eyeBtn: {
        position: 'absolute',
        right: '12px',
        top: '50%',
        transform: 'translateY(-50%)',
        background: 'none',
        border: 'none',
        color: 'rgba(255,255,255,0.5)',
        cursor: 'pointer',
        padding: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    button: {
        padding: '14px',
        fontSize: '16px',
        fontWeight: '600',
        borderRadius: '10px',
        border: 'none',
        background: 'linear-gradient(135deg, #4A7A25, #6fa030)',
        color: '#1A1A2E',
        cursor: 'pointer',
        marginTop: '8px',
        transition: 'opacity 200ms ease, transform 100ms ease',
    },
    error: {
        color: '#ff6b6b',
        fontSize: '14px',
        margin: '0',
        padding: '10px',
        background: 'rgba(255,107,107,0.1)',
        borderRadius: '8px',
    },
    footer: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: '14px',
        marginTop: '24px',
    },
    link: {
        color: '#4A7A25',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '600',
        textDecoration: 'underline',
    },
    backBtn: {
        marginTop: '16px',
        background: 'none',
        border: '1px solid rgba(255,255,255,0.2)',
        color: 'rgba(255,255,255,0.5)',
        padding: '8px 16px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '14px',
        transition: 'border-color 200ms ease, color 200ms ease',
    },
};
