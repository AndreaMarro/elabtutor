// ============================================
// ELAB Tutor — Vetrina Simulatore (utenti senza licenza)
// Landing page di conversione: mostra cosa offre il simulatore
// Numeri verificati dal codebase (70 exp, 21 comp, 53 sfide, 3 vol)
// Andrea Marro — 24/02/2026
// ============================================

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
const AMAZON_URL = 'https://www.amazon.it/s?k=ELAB+elettronica';

// ── Verified numbers from codebase ──
const STATS = [
    { value: 70, label: 'Esperimenti', icon: '\u26A1' },
    { value: 21, label: 'Componenti',  icon: '\uD83D\uDD27' },
    { value: 53, label: 'Sfide',       icon: '\uD83C\uDFAF' },
    { value:  3, label: 'Volumi',      icon: '\uD83D\uDCDA' },
];

const VOLUMES = [
    {
        num: 1, color: '#4A7A25', gradient: 'linear-gradient(135deg, #4A7A25 0%, #9CCC65 100%)',
        title: 'Basi', experiments: 38,
        desc: 'LED, resistori, condensatori, pulsanti — dal primo circuito alle basi solide',
        chapters: '11 capitoli',
    },
    {
        num: 2, color: '#E8941C', gradient: 'linear-gradient(135deg, #E8941C 0%, #FFB74D 100%)',
        title: 'Intermedio', experiments: 18,
        desc: 'Sensori, motori, display LCD, servo — progetti via via pi\u00F9 complessi',
        chapters: '5 capitoli',
    },
    {
        num: 3, color: '#E54B3D', gradient: 'linear-gradient(135deg, #E54B3D 0%, #EF5350 100%)',
        title: 'Avanzato', experiments: 14,
        desc: 'Arduino Nano, MOSFET, comunicazione seriale — programmazione e robotica',
        chapters: '5 capitoli',
    },
];

const FEATURES = [
    { icon: '\uD83D\uDCBB', title: 'Circuiti Interattivi', desc: 'Costruisci circuiti reali su breadboard con 21 componenti elettronici', accent: '#4A7A25' },
    { icon: '\u26A1', title: 'Simulazione Tempo-Reale', desc: 'Vedi correnti, tensioni e LED accendersi davvero', accent: '#E8941C' },
    { icon: '\uD83D\uDE80', title: 'Compilatore Arduino', desc: 'Scrivi codice C++ e flashalo sul simulatore ATmega328p', accent: '#1E4D8C' },
    { icon: '\uD83D\uDC63', title: '"Passo Passo" Guidato', desc: 'Assemblaggio step-by-step identico alle illustrazioni del libro', accent: '#4A7A25' },
    { icon: '\uD83E\uDD16', title: 'UNLIM AI Tutor', desc: 'Assistente AI che spiega i concetti in modo semplice e chiaro', accent: '#E54B3D' },
    { icon: '\uD83C\uDFC6', title: '53 Sfide Interattive', desc: 'Trova il guasto, prevedi il risultato, decodifica circuiti', accent: '#E8941C' },
];

const SHOWCASE = [
    { src: '/assets/showcase/01-simulatore-rgb.png', title: 'Simulatore Circuiti', desc: 'Breadboard interattiva con componenti reali', tag: 'Simulatore' },
    { src: '/assets/showcase/02-simulatore-running.png', title: 'Simulazione Attiva', desc: 'LED accesi, correnti visibili in tempo reale', tag: 'Live' },
    { src: '/assets/showcase/04-gioco-trova-guasto.png', title: 'Circuit Detective', desc: 'Trova il guasto nascosto nel circuito', tag: 'Gioco' },
    { src: '/assets/showcase/05-unlim-chat.png', title: 'UNLIM AI', desc: 'L\'assistente che spiega ogni concetto', tag: 'AI' },
];

const COMPONENTS_LIST = [
    'LED', 'RGB LED', 'Resistore', 'Condensatore', 'Diodo', 'MOSFET-N',
    'Pulsante', 'Potenziometro', 'Fotoresistore', 'Fototransistore',
    'Reed Switch', 'Buzzer Piezo', 'Motore DC', 'Servo',
    'Display LCD 16x2', 'Multimetro', 'Batteria 9V',
    'Arduino Nano R4', 'Breadboard', 'Fili', 'Half Breadboard',
];

// ── Inject CSS animations (runs once) ──
const ANIM_CSS = `
@keyframes vetrina-fadeIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
@keyframes vetrina-pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.04); } }
@keyframes vetrina-shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
@keyframes vetrina-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
@keyframes vetrina-progress { from { width: 0%; } to { width: 100%; } }
.vetrina-showcaseImg { transition: opacity 0.5s ease-in-out; }
.vetrina-featureCard:hover { transform: translateY(-4px) !important; box-shadow: 0 12px 32px rgba(30,77,140,0.15) !important; }
.vetrina-volumeCard:hover { transform: translateY(-3px) !important; box-shadow: 0 10px 28px rgba(0,0,0,0.12) !important; }
.vetrina-amazonBtn:hover { transform: translateY(-2px) !important; box-shadow: 0 8px 24px rgba(255,153,0,0.4) !important; }
.vetrina-schoolsBtn:hover { transform: translateY(-2px) !important; box-shadow: 0 8px 24px rgba(30,77,140,0.3) !important; }
.vetrina-activateBtn:hover:not(:disabled) { transform: translateY(-2px) !important; box-shadow: 0 8px 24px rgba(124,179,66,0.4) !important; }
.vetrina-thumb { transition: all 0.2s ease; }
.vetrina-thumb:hover { transform: scale(1.05); }
.vetrina-waFloat:hover { transform: scale(1.1) !important; box-shadow: 0 6px 20px rgba(37,211,102,0.5) !important; }
.vetrina-waFloat:hover .vetrina-waTip { opacity: 1 !important; }
.vetrina-waTip strong { color: #075E54; font-size: 14px; }
.vetrina-waTip > div:not(:first-child) span { color: #25D366; font-weight: 600; }
@media(max-width:480px) { .vetrina-waTip { display: none !important; } .vetrina-waFloat { bottom: 16px !important; right: 16px !important; width: 54px !important; height: 54px !important; } }
`;

let animInjected = false;
function injectAnimCSS() {
    if (animInjected) return;
    animInjected = true;
    const el = document.createElement('style');
    el.textContent = ANIM_CSS;
    document.head.appendChild(el);
}

// ── Animated counter with easing ──
function AnimatedNumber({ target, duration = 1400 }) {
    const [val, setVal] = useState(0);
    const ref = useRef(null);
    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                const t0 = performance.now();
                const animate = (now) => {
                    const elapsed = now - t0;
                    const progress = Math.min(elapsed / duration, 1);
                    // easeOutExpo
                    const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
                    setVal(Math.round(eased * target));
                    if (progress < 1) requestAnimationFrame(animate);
                };
                requestAnimationFrame(animate);
                observer.disconnect();
            }
        }, { threshold: 0.3 });
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [target, duration]);
    return <span ref={ref}>{val}</span>;
}

// ── Main component ──
export default function VetrinaSimulatore({ onNavigate }) {
    const { activateLicense, user } = useAuth();
    const [licenseCode, setLicenseCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [activeShowcase, setActiveShowcase] = useState(0);
    const [showcaseProgress, setShowcaseProgress] = useState(0);
    const [showComponents, setShowComponents] = useState(false);
    const progressRef = useRef(null);

    useEffect(() => { injectAnimCSS(); }, []);

    // Auto-advance showcase with progress bar
    useEffect(() => {
        const INTERVAL = 6000;
        let start = Date.now();
        const progressTimer = setInterval(() => {
            const elapsed = Date.now() - start;
            setShowcaseProgress(Math.min((elapsed / INTERVAL) * 100, 100));
        }, 50);
        const advanceTimer = setInterval(() => {
            setActiveShowcase(prev => (prev + 1) % SHOWCASE.length);
            start = Date.now();
            setShowcaseProgress(0);
        }, INTERVAL);
        return () => { clearInterval(progressTimer); clearInterval(advanceTimer); };
    }, []);

    const selectShowcase = useCallback((idx) => {
        setActiveShowcase(idx);
        setShowcaseProgress(0);
    }, []);

    const handleActivate = async (e) => {
        e.preventDefault();
        if (!licenseCode.trim()) return;
        setError('');
        setLoading(true);
        const result = await activateLicense(licenseCode.trim());
        if (result.success) {
            setSuccess(true);
            setTimeout(() => onNavigate?.('tutor'), 1500);
        } else {
            setError(result.error || 'Codice non valido');
        }
        setLoading(false);
    };

    const current = SHOWCASE[activeShowcase];

    return (
        <div style={S.container}>

            {/* ══════════════════ HERO ══════════════════ */}
            <div style={S.hero}>
                {/* Decorative orbs */}
                <div style={S.heroOrb1} />
                <div style={S.heroOrb2} />
                <div style={S.heroContent}>
                    <div style={S.heroBadge}>Simulatore di Elettronica</div>
                    <h1 style={S.heroTitle}>
                        <span style={S.heroTitleAccent}>ELAB</span> Tutor
                    </h1>
                    <p style={S.heroSubtitle}>
                        Il laboratorio completo per imparare l'elettronica.<br />
                        Costruisci circuiti, programma Arduino, supera sfide interattive.
                    </p>

                    {/* Stats */}
                    <div style={S.statsRow}>
                        {STATS.map((s, i) => (
                            <div key={i} style={S.statCard}>
                                <span style={S.statIcon}>{s.icon}</span>
                                <span style={S.statValue}>
                                    <AnimatedNumber target={s.value} />
                                </span>
                                <span style={S.statLabel}>{s.label}</span>
                            </div>
                        ))}
                    </div>

                    {/* CTA Prova Subito — zero login */}
                    <button
                        onClick={() => onNavigate?.('prova')}
                        style={{
                            marginTop: '24px',
                            padding: '14px 32px',
                            background: '#4A7A25',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            fontSize: '17px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            fontFamily: "'Open Sans', sans-serif",
                            boxShadow: '0 4px 16px rgba(74,122,37,0.3)',
                            minHeight: '48px',
                            minWidth: '200px',
                            transition: 'transform 0.15s, box-shadow 0.15s',
                        }}
                        onMouseEnter={(e) => { e.target.style.transform = 'scale(1.04)'; e.target.style.boxShadow = '0 6px 24px rgba(74,122,37,0.4)'; }}
                        onMouseLeave={(e) => { e.target.style.transform = 'scale(1)'; e.target.style.boxShadow = '0 4px 16px rgba(74,122,37,0.3)'; }}
                        aria-label="Prova il simulatore senza registrazione"
                    >
                        Prova Subito — Senza Login
                    </button>
                </div>
            </div>
{/* (c) Andrea Marro — 24/02/2026 — ELAB Tutor — Tutti i diritti riservati */}

            {/* ══════════════════ SHOWCASE ══════════════════ */}
            <div style={S.sectionWide}>
                <div style={S.sectionHeader}>
                    <span style={S.sectionTag}>ANTEPRIMA</span>
                    <h2 style={S.sectionTitle}>Il simulatore in azione</h2>
                </div>
                <div style={S.showcaseWrap}>
                    {/* Featured image */}
                    <div style={S.showcaseFeatured}>
                        <img
                            key={activeShowcase}
                            className="vetrina-showcaseImg"
                            src={current.src}
                            alt={current.title}
                            style={S.showcaseFeaturedImg}
                        />
                        {/* Progress bar */}
                        <div style={S.showcaseProgressBar}>
                            <div style={{ ...S.showcaseProgressFill, width: `${showcaseProgress}%` }} />
                        </div>
                        {/* Overlay */}
                        <div style={S.showcaseOverlay}>
                            <span style={S.showcaseTag}>{current.tag}</span>
                            <h3 style={S.showcaseOvTitle}>{current.title}</h3>
                            <p style={S.showcaseOvDesc}>{current.desc}</p>
                        </div>
                    </div>
                    {/* Thumbnails */}
                    <div style={S.thumbRow}>
                        {SHOWCASE.map((s, i) => (
                            <button
                                key={i}
                                className="vetrina-thumb"
                                onClick={() => selectShowcase(i)}
                                style={{
                                    ...S.thumb,
                                    ...(i === activeShowcase ? S.thumbActive : {}),
                                }}
                            >
                                <img src={s.src} alt={s.title} style={S.thumbImg} />
                                <div style={S.thumbInfo}>
                                    <span style={S.thumbTag}>{s.tag}</span>
                                    <span style={S.thumbLabel}>{s.title}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ══════════════════ FEATURES ══════════════════ */}
            <div style={S.sectionAlt}>
                <div style={S.sectionInner}>
                    <div style={S.sectionHeader}>
                        <span style={S.sectionTag}>FUNZIONALIT\u00C0</span>
                        <h2 style={S.sectionTitle}>Tutto ci\u00F2 che include</h2>
                    </div>
                    <div style={S.featuresGrid}>
                        {FEATURES.map((f, i) => (
                            <div key={i} className="vetrina-featureCard" style={S.featureCard}>
                                <div style={{ ...S.featureIconWrap, background: f.accent + '18' }}>
                                    <span style={S.featureIcon}>{f.icon}</span>
                                </div>
                                <h3 style={S.featureTitle}>{f.title}</h3>
                                <p style={S.featureDesc}>{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ══════════════════ VOLUMES ══════════════════ */}
            <div style={S.sectionInner}>
                <div style={S.sectionHeader}>
                    <span style={S.sectionTag}>PERCORSO</span>
                    <h2 style={S.sectionTitle}>3 Volumi Progressivi</h2>
                    <p style={S.sectionSubtitle}>Ogni volume amplia le competenze del precedente</p>
                </div>
                <div style={S.volumeRow}>
                    {VOLUMES.map(v => (
                        <div key={v.num} className="vetrina-volumeCard" style={S.volumeCard}>
                            {/* Top accent bar */}
                            <div style={{ ...S.volumeAccent, background: v.gradient }} />
                            <div style={S.volumeBody}>
                                <div style={S.volumeTop}>
                                    <span style={{ ...S.volNum, color: v.color }}>
                                        {v.num}
                                    </span>
                                    <div>
                                        <span style={{ ...S.volBadge, background: v.gradient }}>
                                            Volume {v.num}
                                        </span>
                                        <h3 style={S.volTitle}>{v.title}</h3>
                                    </div>
                                </div>
                                <p style={S.volDesc}>{v.desc}</p>
                                <div style={S.volFooter}>
                                    <div style={S.volStat}>
                                        <span style={{ ...S.volStatNum, color: v.color }}>{v.experiments}</span>
                                        <span style={S.volStatLabel}>esperimenti</span>
                                    </div>
                                    <span style={S.volChapters}>{v.chapters}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ══════════════════ COMPONENTS ══════════════════ */}
            <div style={S.sectionInner}>
                <button
                    onClick={() => setShowComponents(p => !p)}
                    style={S.expandBtn}
                >
                    <span style={S.expandIcon}>{showComponents ? '\u25BE' : '\u25B8'}</span>
                    <span style={S.expandText}>21 Componenti Elettronici Simulati</span>
                    <span style={S.expandHint}>{showComponents ? 'Chiudi' : 'Mostra'}</span>
                </button>
                {showComponents && (
                    <div style={S.chipGrid}>
                        {COMPONENTS_LIST.map((c, i) => (
                            <span key={i} style={S.chip}>{c}</span>
                        ))}
                    </div>
                )}
            </div>

            {/* ══════════════════ LICENSE ACTIVATION ══════════════════ */}
            <div style={S.sectionInner}>
                <div style={S.activationCard}>
                    {/* Decorative gradient top */}
                    <div style={S.activationGradientTop} />
                    <div style={S.activationContent}>
                        <div style={S.activationIconWrap}>
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                        </div>
                        <h2 style={S.activationTitle}>
                            {success ? '\u2705 Licenza attivata!' : 'Hai un codice licenza?'}
                        </h2>

                        {success ? (
                            <p style={S.successText}>Reindirizzamento al simulatore...</p>
                        ) : (
                            <>
                                <p style={S.activationDesc}>
                                    Inserisci il codice incluso nel tuo kit ELAB per sbloccare tutti gli esperimenti
                                </p>
                                <form onSubmit={handleActivate} style={S.form}>
                                    <input
                                        type="text"
                                        placeholder="Es: ELAB-XXXX-XXXX"
                                        value={licenseCode}
                                        onChange={(e) => setLicenseCode(e.target.value)}
                                        style={S.input}
                                        disabled={loading}
                                    />
                                    <button
                                        type="submit"
                                        className="vetrina-activateBtn"
                                        style={{
                                            ...S.activateBtn,
                                            opacity: loading || !licenseCode.trim() ? 0.5 : 1,
                                        }}
                                        disabled={loading || !licenseCode.trim()}
                                    >
                                        {loading ? 'Verifica...' : 'Attiva Licenza'}
                                    </button>
                                </form>
                                {error && <p style={S.errorText}>{error}</p>}

                                <div style={S.divider}>
                                    <div style={S.dividerLine} />
                                    <span style={S.dividerText}>oppure</span>
                                    <div style={S.dividerLine} />
                                </div>

                                <a
                                    href={AMAZON_URL}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="vetrina-amazonBtn"
                                    style={S.amazonBtn}
                                >
                                    \uD83D\uDED2 Acquista il Kit ELAB su Amazon
                                </a>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* ══════════════════ SCHOOLS CTA ══════════════════ */}
            <div style={S.sectionInner}>
                <div style={S.schoolsCard}>
{/* (c) Andrea Marro — 24/02/2026 — ELAB Tutor — Tutti i diritti riservati */}
                    <div style={S.schoolsLeft}>
                        <span style={S.schoolsEmoji}>\uD83C\uDF93</span>
                        <h3 style={S.schoolsTitle}>Sei un docente o una scuola?</h3>
                        <p style={S.schoolsDesc}>
                            Kit didattici, licenze per classi e supporto tecnico dedicato
                            per l'insegnamento dell'elettronica.
                        </p>
                        <a
                            href="/scuole/pnrr"
                            className="vetrina-schoolsBtn"
                            style={S.schoolsBtn}
                        >
                            Scopri le soluzioni per le scuole \u2192
                        </a>
                    </div>
                </div>
            </div>

            {/* ══════════════════ WHATSAPP FLOATING BUTTON ══════════════════ */}
            <a
                href="https://wa.me/393461653930?text=Ciao!%20Vorrei%20maggiori%20informazioni%20su%20ELAB."
                target="_blank"
                rel="noopener noreferrer"
                className="vetrina-waFloat"
                style={S.waFloat}
                title="Contattaci su WhatsApp"
            >
                <svg viewBox="0 0 24 24" width="28" height="28" fill="white">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                <div className="vetrina-waTip" style={S.waTip}>
                    <div style={S.waTipHeader}>
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                        <span>Scrivici su WhatsApp</span>
                    </div>
                    <div style={S.waTipContact}><strong>ANDREA</strong><span>346 165 3930</span></div>
                    <div style={S.waTipContact}><strong>Omaric SRL</strong><span>346 809 3661</span></div>
                </div>
            </a>

            {/* ══════════════════ FOOTER ══════════════════ */}
            <div style={S.footer}>
                {user?.ruolo === 'admin' && (
                    <button onClick={() => onNavigate?.('admin')} style={S.adminBtn}>
                        Pannello Admin
                    </button>
                )}
                <button onClick={() => onNavigate?.('tutor')} style={S.backLink}>
                    {'\u2190'} Torna alla home
                </button>
            </div>
        </div>
    );
}

// (c) Andrea Marro — 24/02/2026

// ═══════════════════════════════════════
// STYLES
// ═══════════════════════════════════════
const S = {
    container: {
        height: '100%', overflowY: 'auto',
        background: '#F5F7FA',
        fontFamily: "'Open Sans', -apple-system, BlinkMacSystemFont, sans-serif",
    },

    /* ── Hero ── */
    hero: {
        position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(155deg, #06111f 0%, #0d2240 35%, #1E4D8C 70%, #2563A8 100%)',
        padding: '52px 20px 48px', textAlign: 'center',
    },
    heroOrb1: {
        position: 'absolute', width: '300px', height: '300px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(124,179,66,0.15) 0%, transparent 70%)',
        top: '-80px', right: '-60px', pointerEvents: 'none',
    },
    heroOrb2: {
        position: 'absolute', width: '250px', height: '250px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(30,77,140,0.2) 0%, transparent 70%)',
        bottom: '-60px', left: '-40px', pointerEvents: 'none',
    },
    heroContent: {
        position: 'relative', zIndex: 1, maxWidth: '760px', margin: '0 auto',
    },
    heroBadge: {
        display: 'inline-block',
        background: 'rgba(124,179,66,0.2)', border: '1px solid rgba(124,179,66,0.4)',
        color: '#9CCC65', fontSize: '14px', fontWeight: '600',
        padding: '4px 16px', borderRadius: '20px',
        letterSpacing: '1px', textTransform: 'uppercase',
        marginBottom: '16px',
    },
    heroTitle: {
        color: 'white', fontSize: '40px', fontWeight: '800',
        margin: '0 0 14px', fontFamily: "'Oswald', sans-serif",
        letterSpacing: '2px', textTransform: 'uppercase',
        lineHeight: '1.1',
    },
    heroTitleAccent: {
        background: 'linear-gradient(135deg, #4A7A25, #AED581)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
    },
    heroSubtitle: {
        color: 'rgba(255,255,255,0.8)', fontSize: '17px',
        lineHeight: '1.7', margin: '0 0 32px', maxWidth: '560px',
        marginLeft: 'auto', marginRight: 'auto',
    },
    statsRow: {
        display: 'flex', justifyContent: 'center',
        gap: '12px', flexWrap: 'wrap',
    },
    statCard: {
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: '2px', minWidth: '82px',
        background: 'rgba(255,255,255,0.07)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '14px', padding: '14px 16px',
    },
    statIcon: { fontSize: '20px', marginBottom: '2px' },
    statValue: {
        fontSize: '30px', fontWeight: '800', color: 'white',
        fontFamily: "'Oswald', sans-serif",
    },
    statLabel: {
        color: 'rgba(255,255,255,0.6)', fontSize: '14px', fontWeight: '500',
    },

    /* ── Section helpers ── */
    sectionWide: { maxWidth: '900px', margin: '0 auto', padding: '36px 20px' },
    sectionInner: { maxWidth: '860px', margin: '0 auto', padding: '32px 20px' },
    sectionAlt: {
        background: 'white', padding: '40px 0',
        borderTop: '1px solid #E8ECF0', borderBottom: '1px solid #E8ECF0',
    },
    sectionHeader: { textAlign: 'center', marginBottom: '28px' },
    sectionTag: {
        display: 'inline-block', fontSize: '14px', fontWeight: '700',
        color: '#4A7A25', letterSpacing: '2px', textTransform: 'uppercase',
        marginBottom: '6px',
    },
    sectionTitle: {
        color: '#1A2B4A', fontSize: '26px', fontWeight: '700',
        margin: '0 0 4px', fontFamily: "'Oswald', sans-serif",
        letterSpacing: '0.5px',
    },
    sectionSubtitle: {
        color: '#6B7A8D', fontSize: '15px', margin: '6px 0 0', fontWeight: '400',
    },

    /* ── Showcase ── */
    showcaseWrap: { display: 'flex', flexDirection: 'column', gap: '14px' },
    showcaseFeatured: {
        position: 'relative', borderRadius: '16px', overflow: 'hidden',
        background: '#0D1B2A',
        boxShadow: '0 12px 40px rgba(0,0,0,0.2)',
    },
    showcaseFeaturedImg: {
        width: '100%', height: 'auto', display: 'block',
        maxHeight: '440px', objectFit: 'cover',
    },
    showcaseProgressBar: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: '3px', background: 'rgba(255,255,255,0.15)', zIndex: 3,
    },
    showcaseProgressFill: {
        height: '100%', background: '#4A7A25',
        transition: 'width 0.05s linear', borderRadius: '0 2px 2px 0',
    },
    showcaseOverlay: {
        position: 'absolute', bottom: '3px', left: 0, right: 0,
        background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
        padding: '40px 24px 20px', zIndex: 2,
    },
    showcaseTag: {
        display: 'inline-block', background: 'rgba(124,179,66,0.9)',
        color: '#1A1A2E', fontSize: '14px', fontWeight: '700',
        padding: '2px 10px', borderRadius: '4px',
        textTransform: 'uppercase', letterSpacing: '1px',
        marginBottom: '8px',
    },
    showcaseOvTitle: {
        color: 'white', fontSize: '20px', fontWeight: '700', margin: '0 0 4px',
        fontFamily: "'Oswald', sans-serif",
    },
    showcaseOvDesc: {
        color: 'rgba(255,255,255,0.75)', fontSize: '14px', margin: 0,
    },
    thumbRow: {
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px',
    },
    thumb: {
        background: 'white', border: '2px solid #E8ECF0',
        borderRadius: '12px', overflow: 'hidden', cursor: 'pointer',
        padding: 0, textAlign: 'left',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    },
    thumbActive: {
        border: '2px solid #1E4D8C',
        boxShadow: '0 4px 16px rgba(30,77,140,0.2)',
    },
    thumbImg: {
        width: '100%', height: '64px', objectFit: 'cover', display: 'block',
    },
    thumbInfo: {
        padding: '6px 8px 8px',
        display: 'flex', flexDirection: 'column', gap: '1px',
    },
    thumbTag: {
        fontSize: '14px', fontWeight: '700', color: '#4A7A25',
        textTransform: 'uppercase', letterSpacing: '0.5px',
    },
    thumbLabel: {
        fontSize: '14px', fontWeight: '600', color: '#1A2B4A',
        lineHeight: '1.2',
    },

    /* ── Features ── */
    featuresGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '16px', maxWidth: '860px', margin: '0 auto',
        padding: '0 20px',
    },
    featureCard: {
        background: '#F8FAFB', borderRadius: '14px', padding: '24px 20px',
        textAlign: 'center',
        border: '1px solid #EEF1F5',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        cursor: 'default',
    },
    featureIconWrap: {
        width: '52px', height: '52px', borderRadius: '14px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 14px',
    },
    featureIcon: { fontSize: '24px' },
    featureTitle: {
        color: '#1A2B4A', fontSize: '16px', fontWeight: '700',
        margin: '0 0 6px', fontFamily: "'Oswald', sans-serif",
    },
    featureDesc: {
        color: '#6B7D94', fontSize: '14px', lineHeight: '1.55', margin: 0,
    },

    /* ── Volumes ── */
    volumeRow: {
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '16px',
    },
    volumeCard: {
        background: 'white', borderRadius: '16px', overflow: 'hidden',
        boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        cursor: 'default',
    },
    volumeAccent: {
        height: '5px', width: '100%',
    },
    volumeBody: { padding: '22px 22px 18px' },
    volumeTop: {
        display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px',
    },
    volNum: {
        fontSize: '36px', fontWeight: '800', fontFamily: "'Oswald', sans-serif",
        lineHeight: 1, opacity: 0.2,
    },
    volBadge: {
        display: 'inline-block', color: '#1A1A2E', fontWeight: '700', fontSize: '14px',
        borderRadius: '6px', padding: '2px 10px',
        fontFamily: "'Oswald', sans-serif", letterSpacing: '0.5px',
    },
    volTitle: {
        fontWeight: '700', color: '#1A2B4A', fontSize: '18px', margin: '4px 0 0',
        fontFamily: "'Oswald', sans-serif",
    },
    volDesc: {
        color: '#6B7D94', fontSize: '14px', lineHeight: '1.55', margin: '0 0 16px',
    },
    volFooter: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
        borderTop: '1px solid #F0F2F5', paddingTop: '12px',
    },
    volStat: { display: 'flex', flexDirection: 'column' },
    volStatNum: { fontSize: '22px', fontWeight: '800', fontFamily: "'Oswald', sans-serif", lineHeight: 1 },
    volStatLabel: { color: '#6B7A8D', fontSize: '14px', fontWeight: '500' },
    volChapters: { color: '#AAB8C8', fontSize: '14px', fontWeight: '500' },

    /* ── Components ── */
    expandBtn: {
        background: 'white', border: '1px solid #E0E6ED', borderRadius: '14px',
        padding: '16px 20px', fontSize: '15px', fontWeight: '600',
        color: '#1A2B4A', cursor: 'pointer', width: '100%',
        display: 'flex', alignItems: 'center', gap: '10px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        transition: 'box-shadow 0.2s ease',
    },
    expandIcon: { fontSize: '14px', color: '#4A7A25', fontWeight: '700' },
    expandText: { flex: 1, textAlign: 'left' },
    expandHint: {
        fontSize: '14px', color: '#6B7A8D', fontWeight: '500',
    },
    chipGrid: {
        display: 'flex', flexWrap: 'wrap', gap: '8px',
        padding: '16px 0', animation: 'vetrina-fadeIn 0.3s ease',
    },
    chip: {
        background: 'linear-gradient(135deg, #E8F0FE 0%, #F0F5FF 100%)',
        color: '#1E4D8C', borderRadius: '10px',
        padding: '8px 14px', fontSize: '14px', fontWeight: '600',
        border: '1px solid #D0DBEF',
    },

    /* ── Activation ── */
    activationCard: {
        position: 'relative', background: 'white', borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
    },
    activationGradientTop: {
        height: '4px',
        background: 'linear-gradient(90deg, #4A7A25, #1E4D8C, #E8941C, #E54B3D)',
    },
    activationContent: {
        padding: '36px 32px', textAlign: 'center',
    },
    activationIconWrap: {
        width: '60px', height: '60px', borderRadius: '50%',
        background: 'linear-gradient(135deg, #1E4D8C, #2D6DB5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 18px',
        boxShadow: '0 4px 16px rgba(30,77,140,0.3)',
    },
    activationTitle: {
        color: '#1A2B4A', fontSize: '24px', fontWeight: '700', margin: '0 0 8px',
        fontFamily: "'Oswald', sans-serif",
    },
    activationDesc: {
        color: '#6B7D94', fontSize: '15px', margin: '0 0 24px', lineHeight: '1.55',
    },
    form: {
        display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap',
    },
    input: {
        padding: '14px 18px', border: '2px solid #E0E6ED', borderRadius: '12px',
        fontSize: '16px', width: '280px', textAlign: 'center',
        fontFamily: "'Fira Code', monospace", letterSpacing: '2px',
        outline: 'none', transition: 'border-color 0.2s',
        background: '#F8FAFB',
    },
    activateBtn: {
        padding: '14px 32px', border: 'none', borderRadius: '12px',
        background: 'linear-gradient(135deg, #4A7A25, #6AA033)',
        color: '#1A1A2E', fontSize: '16px', fontWeight: '700',
        cursor: 'pointer', letterSpacing: '0.3px',
        transition: 'transform 0.2s, box-shadow 0.2s',
    },
    errorText: { color: '#E54B3D', fontSize: '14px', marginTop: '14px', fontWeight: '500' },
    successText: {
        color: '#4A7A25', fontSize: '18px', fontWeight: '700',
        animation: 'vetrina-pulse 1.5s infinite',
    },
    divider: {
        display: 'flex', alignItems: 'center', gap: '16px', margin: '28px 0',
    },
    dividerLine: {
        flex: 1, height: '1px', background: '#E8ECF0',
    },
    dividerText: {
        color: '#AAB8C8', fontSize: '14px', fontWeight: '600',
        letterSpacing: '0.5px', whiteSpace: 'nowrap',
    },
    amazonBtn: {
        display: 'inline-block', padding: '16px 36px',
        background: 'linear-gradient(135deg, #FF9900, #FFB347)',
        color: '#1A1A2E', borderRadius: '12px', fontSize: '16px',
        fontWeight: '700', textDecoration: 'none',
        transition: 'transform 0.2s, box-shadow 0.2s',
        boxShadow: '0 4px 16px rgba(255,153,0,0.25)',
    },

    /* ── Schools CTA ── */
    schoolsCard: {
        background: 'linear-gradient(155deg, #0D2240 0%, #1E4D8C 50%, #2D6DB5 100%)',
        borderRadius: '20px', padding: '40px 32px',
        textAlign: 'center', color: 'white',
        boxShadow: '0 12px 40px rgba(30,77,140,0.3)',
        position: 'relative', overflow: 'hidden',
    },
    schoolsLeft: { position: 'relative', zIndex: 1 },
    schoolsEmoji: { fontSize: '52px', display: 'block', marginBottom: '14px' },
    schoolsTitle: {
        fontSize: '24px', fontWeight: '700', margin: '0 0 12px',
        fontFamily: "'Oswald', sans-serif",
    },
    schoolsDesc: {
        fontSize: '15px', lineHeight: '1.6', margin: '0 0 24px',
        opacity: 0.85, maxWidth: '500px', marginLeft: 'auto', marginRight: 'auto',
    },
    schoolsBtn: {
        display: 'inline-block', padding: '14px 36px',
        background: 'white', color: '#1E4D8C', borderRadius: '12px',
        fontSize: '15px', fontWeight: '700', textDecoration: 'none',
        transition: 'transform 0.2s, box-shadow 0.2s',
        boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
    },

    /* ── Footer ── */
    footer: {
        textAlign: 'center', padding: '28px 0 56px',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: '14px',
    },
    adminBtn: {
        background: 'linear-gradient(135deg, #1E4D8C, #2D6DB5)',
        border: 'none', color: 'white',
        fontSize: '15px', fontWeight: '700', padding: '14px 32px',
        borderRadius: '12px', cursor: 'pointer',
        boxShadow: '0 4px 16px rgba(30,77,140,0.2)',
    },
    backLink: {
        background: 'none', border: 'none', color: '#6B7D94',
        fontSize: '14px', cursor: 'pointer', fontWeight: '500',
        padding: '8px 16px',
    },

    /* ── WhatsApp Float ── */
    waFloat: {
        position: 'fixed', bottom: '24px', right: '24px',
        width: '60px', height: '60px', borderRadius: '50%',
        background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 12px rgba(37,211,102,0.4)', zIndex: 9999,
        textDecoration: 'none', transition: 'transform 0.3s',
    },
    waTip: {
        position: 'absolute', right: '70px', background: '#fff', color: '#333',
        padding: '12px 14px', borderRadius: '12px', fontSize: '14px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.15)', opacity: 0, pointerEvents: 'none',
        transition: 'opacity 0.3s', display: 'flex', flexDirection: 'column', gap: '6px',
        minWidth: '200px', whiteSpace: 'nowrap', fontFamily: 'sans-serif',
    },
    waTipHeader: {
        display: 'flex', alignItems: 'center', gap: '8px',
        fontWeight: 600, color: '#075E54', fontSize: '14px',
        paddingBottom: '6px', borderBottom: '1px solid #eee',
    },
    waTipContact: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        gap: '12px', fontSize: '14px', color: '#555',
    },
};
