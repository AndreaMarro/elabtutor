// ============================================
// ELAB Tutor - Dashboard Studente
// La mappa personale: costellazione, diario,
// meraviglie, mood, esperimenti, progressi
// © Andrea Marro — 08/02/2026
// Tutti i diritti riservati
// ============================================

import React, { useState, useMemo, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import studentService from '../../services/studentService';
import { joinClass } from '../../services/authService';

// ============================================
// SVG ICON COMPONENTS (inline, 20px)
// ============================================
const StudentIcon = ({ children }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
        {children}
    </svg>
);
const IcoFlask = () => <StudentIcon><path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2" /><path d="M8.5 2h7" /><path d="M7 16.5h10" /></StudentIcon>;
const IcoClock = () => <StudentIcon><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></StudentIcon>;
const IcoLightbulb = () => <StudentIcon><path d="M9 18h6" /><path d="M10 22h4" /><path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z" /></StudentIcon>;
const IcoWave = () => <StudentIcon><path d="M2 12c1.5-3 3.5-3 5 0s3.5 3 5 0 3.5-3 5 0 3.5 3 5 0" /></StudentIcon>;
const IcoBook = () => <StudentIcon><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></StudentIcon>;

// Colori ELAB ufficiali
const C = {
    navy: '#1E4D8C',
    navyDark: '#152a5c',
    lime: '#4A7A25',
    limeDark: '#7da93d',
    limeLight: '#BBD789',
    limeSoft: '#E8F4D9',
    bg: '#F0F4F8',
    red: '#E53935',
    orange: '#F5A623',
    cyan: '#00B4D8',
    text: '#1a1a2e',
    textMuted: '#64748B',
    white: '#FFFFFF',
    border: '#E2E8F0',
};

const MOOD_EMOJI = {
    energico: 'E',
    concentrato: 'C',
    confuso: '~',
    bloccato: 'X',
    felice: ':)',
    frustrato: '>:(',
    curioso: '?',
    creativo: '*',
};

const MOOD_COLORS = {
    energico: '#F5A623',
    concentrato: '#1E4D8C',
    confuso: '#9333EA',
    bloccato: '#E53935',
    felice: '#4A7A25',
    frustrato: '#EF4444',
    curioso: '#00B4D8',
    creativo: '#EC4899',
};

export default function StudentDashboard({ onNavigate }) {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('panoramica');
    const [moodInput, setMoodInput] = useState('');
    const [meravigliaInput, setMeravigliaInput] = useState('');
    const [diarioInput, setDiarioInput] = useState('');

    const data = useMemo(() => {
        if (!user) return null;
        return studentService.getData(user.id);
    }, [user]);

    if (!user || !data) {
        return (
            <div style={{ padding: 40, textAlign: 'center', color: C.textMuted }}>
                <p style={{ fontSize: 48, color: '#1E4D8C', fontWeight: 800, fontFamily: 'Oswald, sans-serif' }}>ELAB</p>
                <h2 style={{ color: C.navy }}>Accedi per vedere la tua dashboard</h2>
            </div>
        );
    }

    const tabs = [
        { id: 'panoramica', label: 'Panoramica', emoji: '*' },
        { id: 'diario', label: 'Diario', emoji: 'D' },
        { id: 'meraviglie', label: 'Meraviglie', emoji: '?' },
        { id: 'esperimenti', label: 'Esperimenti', emoji: 'E' },
        { id: 'costellazione', label: 'Mappa', emoji: 'M' },
        { id: 'classe', label: 'La mia classe', emoji: 'C' },
    ];

    // Handlers
    const handleMood = (mood) => {
        studentService.logMood(user.id, { mood, nota: moodInput });
        setMoodInput('');
    };

    const handleMeraviglia = () => {
        if (!meravigliaInput.trim()) return;
        studentService.addMeraviglia(user.id, { domanda: meravigliaInput });
        setMeravigliaInput('');
    };

    const handleDiario = () => {
        if (!diarioInput.trim()) return;
        studentService.addDiarioEntry(user.id, {
            tipo: 'riflessione',
            contenuto: diarioInput,
        });
        setDiarioInput('');
    };

    // Formatta tempo
    const formatTempo = (secondi) => {
        if (secondi < 60) return `${secondi}s`;
        if (secondi < 3600) return `${Math.round(secondi / 60)}min`;
        return `${Math.round(secondi / 3600 * 10) / 10}h`;
    };

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <div style={styles.headerLeft}>
                    <div style={styles.avatarLarge}>
                        {user.avatar ? (
                            <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                        ) : (
                            <span style={{ fontSize: 28 }}>{user.nome?.charAt(0).toUpperCase()}</span>
                        )}
                    </div>
                    <div>
                        <h1 style={styles.headerTitle}>Ciao, {user.nome?.split(' ')[0]}!</h1>
                        <p style={styles.headerSubtitle}>
                            {data.stats.giorniConsecutivi > 0
                                ? `${data.stats.giorniConsecutivi} giorni consecutivi!`
                                : 'Inizia la tua avventura!'}
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => onNavigate('tutor')}
                    style={styles.goToTutorBtn}
                >
                    Vai al Tutor
                </button>
            </div>

            {/* Tabs */}
            <div style={styles.tabBar}>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            ...styles.tab,
                            background: activeTab === tab.id ? C.navy : 'transparent',
                            color: activeTab === tab.id ? C.white : C.navy,
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div style={styles.content}>
                {activeTab === 'panoramica' && (
                    <PanoramicaTab data={data} formatTempo={formatTempo} />
                )}
                {activeTab === 'diario' && (
                    <DiarioTab
                        data={data}
                        diarioInput={diarioInput}
                        setDiarioInput={setDiarioInput}
                        handleDiario={handleDiario}
                        moodInput={moodInput}
                        setMoodInput={setMoodInput}
                        handleMood={handleMood}
                    />
                )}
                {activeTab === 'meraviglie' && (
                    <MeraviglieTab
                        data={data}
                        meravigliaInput={meravigliaInput}
                        setMeravigliaInput={setMeravigliaInput}
                        handleMeraviglia={handleMeraviglia}
                    />
                )}
                {activeTab === 'esperimenti' && (
                    <EsperimentiTab data={data} formatTempo={formatTempo} />
                )}
                {activeTab === 'costellazione' && (
                    <CostellazioneTab data={data} />
                )}
                {activeTab === 'classe' && (
                    <ClasseTab user={user} />
                )}
            </div>
        </div>
    );
}

// ─── PANORAMICA ────────────────────────────────────────
function PanoramicaTab({ data, formatTempo }) {
    const stats = data.stats;
    const ultimoMood = data.moods[data.moods.length - 1];
    const meraviglie = data.meraviglie.filter(m => !m.risolta);

    const cards = [
        {
            icon: <IcoFlask />,
            label: 'Esperimenti',
            value: stats.esperimentiTotali,
            color: C.lime,
        },
        {
            icon: <IcoClock />,
            label: 'Tempo totale',
            value: formatTempo(data.tempoTotale),
            color: C.cyan,
        },
        {
            icon: <IcoLightbulb />,
            label: 'Meraviglie',
            value: stats.meraviglieTotali,
            color: C.orange,
        },
        {
            icon: <IcoWave />,
            label: 'Confusione media',
            value: `${stats.mediaConfusione}/10`,
            color: stats.mediaConfusione > 7 ? C.red : stats.mediaConfusione > 4 ? C.orange : C.lime,
        },
    ];

    return (
        <div>
            {/* Stat Cards */}
            <div style={styles.statGrid}>
                {cards.map((card, i) => (
                    <div key={i} style={styles.statCard}>
                        <span style={{ color: card.color, display: 'flex', justifyContent: 'center' }}>{card.icon}</span>
                        <div style={{ ...styles.statValue, color: card.color }}>{card.value}</div>
                        <div style={styles.statLabel}>{card.label}</div>
                    </div>
                ))}
            </div>

            {/* Ultimo mood */}
            {ultimoMood && (
                <div style={styles.moodCard}>
                    <span style={{ fontSize: 24 }}>{MOOD_EMOJI[ultimoMood.mood] || '?'}</span>
                    <div>
                        <strong style={{ color: MOOD_COLORS[ultimoMood.mood] || C.navy }}>
                            {ultimoMood.mood.charAt(0).toUpperCase() + ultimoMood.mood.slice(1)}
                        </strong>
                        {ultimoMood.nota && <p style={{ margin: '4px 0 0', color: C.textMuted, fontSize: 14 }}>{ultimoMood.nota}</p>}
                    </div>
                    <span style={{ marginLeft: 'auto', fontSize: 14, color: C.textMuted }}>
                        {new Date(ultimoMood.timestamp).toLocaleDateString('it-IT')}
                    </span>
                </div>
            )}

            {/* Meraviglie aperte */}
            {meraviglie.length > 0 && (
                <div style={styles.section}>
                    <h3 style={styles.sectionTitle}>Domande aperte ({meraviglie.length})</h3>
                    {meraviglie.slice(0, 5).map(m => (
                        <div key={m.id} style={styles.meravigliaItem}>
                            <span style={{ color: C.orange, marginRight: 8 }}>?</span>
                            <span>{m.domanda}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Attività recente */}
            {data.esperimenti.length > 0 && (
                <div style={styles.section}>
                    <h3 style={styles.sectionTitle}>Ultimi esperimenti</h3>
                    {data.esperimenti.slice(-5).reverse().map(e => (
                        <div key={e.id} style={styles.experimentItem}>
                            <span style={{ color: e.completato ? C.lime : C.orange }}>
                                {e.completato ? '\u2713' : '\u27F3'}
                            </span>
                            <div style={{ flex: 1 }}>
                                <strong>{e.nome || e.experimentId}</strong>
                                {e.volume && <span style={styles.volumeBadge}>Vol. {e.volume}</span>}
                            </div>
                            <span style={{ fontSize: 14, color: C.textMuted }}>
                                {new Date(e.timestamp).toLocaleDateString('it-IT')}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── DIARIO ────────────────────────────────────────────
function DiarioTab({ data, diarioInput, setDiarioInput, handleDiario, moodInput, setMoodInput, handleMood }) {
    return (
        <div>
            {/* Mood check-in */}
            <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Come ti senti adesso?</h3>
                <div style={styles.moodGrid}>
                    {Object.entries(MOOD_EMOJI).map(([mood, emoji]) => (
                        <button
                            key={mood}
                            onClick={() => handleMood(mood)}
                            style={{
                                ...styles.moodBtn,
                                background: C.white,
                                border: `2px solid ${MOOD_COLORS[mood]}`,
                            }}
                        >
                            <span style={{ fontSize: 24 }}>{emoji}</span>
                            <span style={{ fontSize: 14, color: MOOD_COLORS[mood], fontWeight: 600 }}>
                                {mood.charAt(0).toUpperCase() + mood.slice(1)}
                            </span>
                        </button>
                    ))}
                </div>
                <input
                    type="text"
                    value={moodInput}
                    onChange={e => setMoodInput(e.target.value)}
                    placeholder="Vuoi aggiungere una nota? (opzionale)"
                    style={styles.input}
                />
            </div>

            {/* Nuova voce di diario */}
            <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Scrivi nel tuo diario</h3>
                <textarea
                    value={diarioInput}
                    onChange={e => setDiarioInput(e.target.value)}
                    placeholder="Cosa hai scoperto oggi? Cosa ti ha sorpreso? Cosa è stato difficile?"
                    style={styles.textarea}
                    rows={4}
                />
                <button
                    onClick={handleDiario}
                    disabled={!diarioInput.trim()}
                    style={{
                        ...styles.primaryBtn,
                        opacity: diarioInput.trim() ? 1 : 0.5,
                    }}
                >
                    Salva nel diario
                </button>
            </div>

            {/* Voci del diario */}
            <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Il tuo diario di bordo</h3>
                {data.diario.length === 0 ? (
                    <p style={{ color: C.textMuted, textAlign: 'center', padding: 20 }}>
                        Il tuo diario è vuoto. Inizia a scrivere le tue scoperte!
                    </p>
                ) : (
                    [...data.diario].reverse().map(entry => (
                        <div key={entry.id} style={styles.diarioEntry}>
                            <div style={styles.diarioHeader}>
                                <span style={{ fontSize: 16 }}>
                                    {entry.tipo === 'riflessione' ? '\u2022' :
                                     entry.tipo === 'prima' ? '\u25CB' :
                                     entry.tipo === 'dopo' ? '\u2726' :
                                     entry.tipo === 'mood' ? MOOD_EMOJI[entry.mood] || '?' : '\u2013'}
                                </span>
                                <span style={styles.diarioDate}>
                                    {new Date(entry.timestamp).toLocaleDateString('it-IT', {
                                        day: 'numeric', month: 'long', year: 'numeric',
                                        hour: '2-digit', minute: '2-digit'
                                    })}
                                </span>
                            </div>
                            <p style={styles.diarioText}>{entry.contenuto}</p>
                        </div>
                    ))
                )}
            </div>

            {/* Storia mood */}
            {data.moods.length > 0 && (
                <div style={styles.section}>
                    <h3 style={styles.sectionTitle}>I tuoi mood recenti</h3>
                    <div style={styles.moodHistory}>
                        {data.moods.slice(-14).map((m, i) => (
                            <div key={i} style={styles.moodHistoryItem} title={`${m.mood} - ${new Date(m.timestamp).toLocaleDateString('it-IT')}`}>
                                <span style={{ fontSize: 20 }}>{MOOD_EMOJI[m.mood] || '?'}</span>
                                <span style={{ fontSize: 14, color: C.textMuted }}>
                                    {new Date(m.timestamp).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── MERAVIGLIE ────────────────────────────────────────
function MeraviglieTab({ data, meravigliaInput, setMeravigliaInput, handleMeraviglia }) {
    const aperte = data.meraviglie.filter(m => !m.risolta);
    const risolte = data.meraviglie.filter(m => m.risolta);

    return (
        <div>
            {/* Input nuova meraviglia */}
            <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Cosa ti stai chiedendo?</h3>
                <p style={{ color: C.textMuted, fontSize: 14, marginBottom: 12 }}>
                    Non esiste domanda sbagliata. Ogni domanda è una porta verso la scoperta.
                </p>
                <div style={{ display: 'flex', gap: 8 }}>
                    <input
                        type="text"
                        value={meravigliaInput}
                        onChange={e => setMeravigliaInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleMeraviglia()}
                        placeholder="Scrivi la tua domanda..."
                        style={{ ...styles.input, flex: 1 }}
                    />
                    <button
                        onClick={handleMeraviglia}
                        disabled={!meravigliaInput.trim()}
                        style={{
                            ...styles.primaryBtn,
                            opacity: meravigliaInput.trim() ? 1 : 0.5,
                            whiteSpace: 'nowrap',
                        }}
                    >
                        Chiedi
                    </button>
                </div>
            </div>

            {/* Counter */}
            <div style={styles.meraviglieCounter}>
                <span style={{ fontSize: 36, display: 'block', color: C.orange, fontWeight: 700 }}>?</span>
                <strong style={{ fontSize: 28, color: C.orange }}>{data.meraviglie.length}</strong>
                <span style={{ color: C.textMuted, fontSize: 14 }}>
                    {data.meraviglie.length === 1 ? 'meraviglia' : 'meraviglie'} totali
                </span>
                <span style={{ color: C.lime, fontSize: 14, fontWeight: 600 }}>
                    La tua curiosità è {data.meraviglie.length > 20 ? 'straordinaria!' :
                    data.meraviglie.length > 10 ? 'fantastica!' :
                    data.meraviglie.length > 5 ? 'in crescita!' : 'appena iniziata!'}
                </span>
            </div>

            {/* Domande aperte */}
            {aperte.length > 0 && (
                <div style={styles.section}>
                    <h3 style={styles.sectionTitle}>Domande aperte ({aperte.length})</h3>
                    {aperte.map(m => (
                        <div key={m.id} style={styles.meravigliaCard}>
                            <span style={{ color: C.orange, fontSize: 20, fontWeight: 700 }}>?</span>
                            <div style={{ flex: 1 }}>
                                <p style={{ margin: 0, fontWeight: 500 }}>{m.domanda}</p>
                                <span style={{ fontSize: 14, color: C.textMuted }}>
                                    {new Date(m.timestamp).toLocaleDateString('it-IT')}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Domande risolte */}
            {risolte.length > 0 && (
                <div style={styles.section}>
                    <h3 style={styles.sectionTitle}>Domande risolte ({risolte.length})</h3>
                    {risolte.map(m => (
                        <div key={m.id} style={{ ...styles.meravigliaCard, opacity: 0.7 }}>
                            <span style={{ color: C.lime, fontSize: 20, fontWeight: 700 }}>{'\u2713'}</span>
                            <div style={{ flex: 1 }}>
                                <p style={{ margin: 0, textDecoration: 'line-through', color: C.textMuted }}>{m.domanda}</p>
                                {m.risposta && <p style={{ margin: '4px 0 0', fontSize: 14, color: C.lime }}>{m.risposta}</p>}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── ESPERIMENTI ───────────────────────────────────────
function EsperimentiTab({ data, formatTempo }) {
    const completati = data.esperimenti.filter(e => e.completato);
    const inCorso = data.esperimenti.filter(e => !e.completato);

    return (
        <div>
            <div style={styles.statGrid}>
                <div style={styles.statCard}>
                    <span style={{ fontSize: 32, color: C.lime, fontWeight: 700 }}>{'\u2713'}</span>
                    <div style={{ ...styles.statValue, color: C.lime }}>{completati.length}</div>
                    <div style={styles.statLabel}>Completati</div>
                </div>
                <div style={styles.statCard}>
                    <span style={{ fontSize: 32, color: C.orange, fontWeight: 700 }}>{'\u27F3'}</span>
                    <div style={{ ...styles.statValue, color: C.orange }}>{inCorso.length}</div>
                    <div style={styles.statLabel}>In corso</div>
                </div>
                <div style={styles.statCard}>
                    <span style={{ color: C.navy, display: 'flex', justifyContent: 'center' }}><IcoBook /></span>
                    <div style={{ ...styles.statValue, color: C.navy }}>
                        {[...new Set(data.esperimenti.map(e => e.volume).filter(Boolean))].length}
                    </div>
                    <div style={styles.statLabel}>Volumi toccati</div>
                </div>
            </div>

            {/* Lista esperimenti */}
            <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Tutti gli esperimenti</h3>
                {data.esperimenti.length === 0 ? (
                    <p style={{ color: C.textMuted, textAlign: 'center', padding: 20 }}>
                        Non hai ancora fatto esperimenti. Vai al Tutor e inizia a esplorare!
                    </p>
                ) : (
                    [...data.esperimenti].reverse().map(e => (
                        <div key={e.id} style={styles.experimentRow}>
                            <span style={{ fontSize: 18 }}>{e.completato ? '\u2713' : '\u27F3'}</span>
                            <div style={{ flex: 1 }}>
                                <strong style={{ color: C.text }}>{e.nome || e.experimentId}</strong>
                                <div style={{ display: 'flex', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
                                    {e.volume && <span style={styles.badge}>Vol. {e.volume}</span>}
                                    {e.capitolo && <span style={styles.badge}>Cap. {e.capitolo}</span>}
                                    {e.durata > 0 && <span style={styles.badge}>{formatTempo(e.durata)}</span>}
                                </div>
                                {e.note && <p style={{ margin: '4px 0 0', fontSize: 14, color: C.textMuted }}>{e.note}</p>}
                            </div>
                            <span style={{ fontSize: 14, color: C.textMuted, whiteSpace: 'nowrap' }}>
                                {new Date(e.timestamp).toLocaleDateString('it-IT')}
                            </span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

// ─── COSTELLAZIONE ─────────────────────────────────────
function CostellazioneTab({ data }) {
    const concetti = data.concetti;

    // Genera posizioni pseudo-casuali per i "pianeti"
    const positions = useMemo(() => {
        return concetti.map((c, i) => {
            const angle = (i / Math.max(concetti.length, 1)) * Math.PI * 2;
            const radius = 80 + (c.visite * 10);
            return {
                x: 50 + Math.cos(angle) * (30 + i * 3),
                y: 50 + Math.sin(angle) * (30 + i * 3),
                size: Math.min(8 + c.visite * 3, 30),
            };
        });
    }, [concetti]);

    return (
        <div>
            <div style={styles.section}>
                <h3 style={styles.sectionTitle}>La tua mappa delle stelle</h3>
                <p style={{ color: C.textMuted, fontSize: 14, marginBottom: 16 }}>
                    Ogni stella è un concetto che hai esplorato. Più è grande, più l'hai approfondito.
                    Ci sarà sempre un cielo infinito da esplorare.
                </p>

                {concetti.length === 0 ? (
                    <div style={styles.emptyConstellation}>
                        <span style={{ fontSize: 64, color: C.navy }}>{'\u2726'}</span>
                        <p style={{ color: C.textMuted }}>Il tuo cielo è ancora vuoto.</p>
                        <p style={{ color: C.textMuted, fontSize: 14 }}>Ogni concetto che esplori diventerà una stella.</p>
                    </div>
                ) : (
                    <div style={styles.constellationMap}>
                        <svg viewBox="0 0 100 100" style={{ width: '100%', height: 300 }}>
                            {/* Sfondo stellato */}
                            {Array.from({ length: 30 }).map((_, i) => (
                                <circle
                                    key={`bg-${i}`}
                                    cx={Math.random() * 100}
                                    cy={Math.random() * 100}
                                    r={0.3}
                                    fill="rgba(255,255,255,0.3)"
                                />
                            ))}
                            {/* Linee tra concetti vicini */}
                            {positions.map((p1, i) =>
                                positions.slice(i + 1).map((p2, j) => {
                                    const dist = Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
                                    if (dist < 25) {
                                        return (
                                            <line
                                                key={`line-${i}-${j}`}
                                                x1={p1.x} y1={p1.y}
                                                x2={p2.x} y2={p2.y}
                                                stroke="rgba(145,191,69,0.2)"
                                                strokeWidth={0.3}
                                            />
                                        );
                                    }
                                    return null;
                                })
                            )}
                            {/* Stelle (concetti) */}
                            {concetti.map((c, i) => (
                                <g key={c.concettoId}>
                                    {/* Glow */}
                                    <circle
                                        cx={positions[i]?.x || 50}
                                        cy={positions[i]?.y || 50}
                                        r={(positions[i]?.size || 8) / 2 + 2}
                                        fill={`rgba(145,191,69,${Math.min(0.1 + c.visite * 0.05, 0.4)})`}
                                    />
                                    {/* Star */}
                                    <circle
                                        cx={positions[i]?.x || 50}
                                        cy={positions[i]?.y || 50}
                                        r={(positions[i]?.size || 8) / 2}
                                        fill={C.lime}
                                        opacity={Math.min(0.5 + c.visite * 0.1, 1)}
                                    />
                                    {/* Label */}
                                    <text
                                        x={positions[i]?.x || 50}
                                        y={(positions[i]?.y || 50) + (positions[i]?.size || 8) / 2 + 4}
                                        textAnchor="middle"
                                        fill="rgba(255,255,255,0.7)"
                                        fontSize={2.5}
                                        fontFamily="Open Sans, sans-serif"
                                    >
                                        {c.nome}
                                    </text>
                                </g>
                            ))}
                        </svg>
                    </div>
                )}
            </div>

            {/* Lista concetti */}
            {concetti.length > 0 && (
                <div style={styles.section}>
                    <h3 style={styles.sectionTitle}>Concetti esplorati ({concetti.length})</h3>
                    {[...concetti].sort((a, b) => b.visite - a.visite).map(c => (
                        <div key={c.concettoId} style={styles.concettoRow}>
                            <div style={{
                                ...styles.concettoDot,
                                width: Math.min(8 + c.visite * 2, 24),
                                height: Math.min(8 + c.visite * 2, 24),
                            }} />
                            <div style={{ flex: 1 }}>
                                <strong>{c.nome}</strong>
                                <span style={styles.badge}>{c.categoria}</span>
                            </div>
                            <div style={{ textAlign: 'right', fontSize: 14, color: C.textMuted }}>
                                <div>{c.visite} visite</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── LA MIA CLASSE (Sprint 1 Session 30) ──────────────
function ClasseTab({ user }) {
    const [classCode, setClassCode] = useState('');
    const [joining, setJoining] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Se lo studente è già in una classe (dal profilo utente)
    const classInfo = user?.classInfo;

    const handleJoin = useCallback(async () => {
        const code = classCode.toUpperCase().trim();
        if (!code || code.length !== 6) {
            setError('Il codice classe deve essere di 6 caratteri.');
            return;
        }
        setJoining(true);
        setError('');
        setSuccess('');
        const result = await joinClass(code);
        if (result.success) {
            setSuccess(`Sei entrato nella classe "${result.className}" del Prof. ${result.teacherName || ''}!`);
            setClassCode('');
        } else {
            setError(result.error || 'Errore nell\'ingresso alla classe.');
        }
        setJoining(false);
    }, [classCode]);

    return (
        <div>
            {classInfo ? (
                <div style={styles.section}>
                    <h3 style={styles.sectionTitle}>La tua classe</h3>
                    <div style={{
                        background: 'linear-gradient(135deg, #1E4D8C08, #4A7A2508)',
                        borderRadius: 12, padding: 20,
                        border: `1px solid ${C.border}`,
                    }}>
                        <p style={{ fontSize: 18, fontWeight: 700, color: C.navy, margin: '0 0 8px' }}>
                            {classInfo.className}
                        </p>
                        <p style={{ fontSize: 14, color: C.textMuted, margin: 0 }}>
                            Codice: <strong style={{ fontFamily: 'monospace', color: C.navy }}>{classInfo.classCode}</strong>
                        </p>
                    </div>
                </div>
            ) : (
                <div style={styles.section}>
                    <h3 style={styles.sectionTitle}>Entra in una classe</h3>
                    <p style={{ color: C.textMuted, fontSize: 14, marginBottom: 16 }}>
                        Il tuo insegnante ti darà un codice di 6 lettere per entrare nella classe.
                        Inseriscilo qui sotto per unirti.
                    </p>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <input
                            type="text"
                            value={classCode}
                            onChange={e => setClassCode(e.target.value.toUpperCase().slice(0, 6))}
                            placeholder="CODICE"
                            maxLength={6}
                            style={{
                                ...styles.searchInput,
                                marginBottom: 0,
                                width: 160,
                                textAlign: 'center',
                                fontFamily: 'monospace',
                                fontSize: 20,
                                letterSpacing: 4,
                                fontWeight: 700,
                            }}
                            onKeyDown={e => e.key === 'Enter' && handleJoin()}
                        />
                        <button
                            onClick={handleJoin}
                            disabled={joining || classCode.length !== 6}
                            style={{
                                ...styles.primaryBtn,
                                marginTop: 0,
                                opacity: joining || classCode.length !== 6 ? 0.5 : 1,
                            }}
                        >
                            {joining ? '...' : 'Entra'}
                        </button>
                    </div>
                    {error && (
                        <p style={{ color: C.red, fontSize: 14, marginTop: 8, marginBottom: 0 }}>{error}</p>
                    )}
                    {success && (
                        <p style={{ color: C.lime, fontSize: 14, marginTop: 8, marginBottom: 0, fontWeight: 600 }}>{success}</p>
                    )}
                </div>
            )}
        </div>
    );
}

// © Andrea Marro — 20/02/2026

// ─── STILI ─────────────────────────────────────────────
const styles = {
    container: {
        maxWidth: 900,
        margin: '0 auto',
        padding: '24px 16px',
        fontFamily: 'Open Sans, -apple-system, sans-serif',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: window.innerWidth <= 480 ? '16px' : '24px 28px',
        background: `linear-gradient(135deg, ${C.navy}, ${C.navyDark})`,
        borderRadius: 16,
        marginBottom: 20,
        flexWrap: 'wrap',
        gap: 12,
    },
    headerLeft: { display: 'flex', alignItems: 'center', gap: 16 },
    avatarLarge: {
        width: 56, height: 56, borderRadius: '50%',
        background: `linear-gradient(135deg, ${C.lime}, ${C.limeDark})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: C.white, fontWeight: 700, overflow: 'hidden', flexShrink: 0,
    },
    headerTitle: { color: C.white, margin: 0, fontSize: window.innerWidth <= 480 ? 18 : 22, fontWeight: 700, fontFamily: 'Oswald, sans-serif' },
    headerSubtitle: { color: C.limeLight, margin: '4px 0 0', fontSize: 14 },
    goToTutorBtn: {
        background: `linear-gradient(135deg, ${C.lime}, ${C.limeDark})`,
        border: 'none', color: C.white, padding: '10px 24px',
        borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: 700,
        width: window.innerWidth <= 480 ? '100%' : 'auto',
    },
    tabBar: {
        display: 'flex', gap: 6, marginBottom: 24,
        overflowX: 'auto', paddingBottom: 4,
    },
    tab: {
        border: 'none', padding: '10px 18px', borderRadius: 10,
        cursor: 'pointer', fontSize: 14, fontWeight: 600,
        whiteSpace: 'nowrap', transition: 'all 0.2s',
    },
    content: { minHeight: 400 },
    section: {
        background: C.white, borderRadius: 12, padding: 20,
        marginBottom: 16, border: `1px solid ${C.border}`,
    },
    sectionTitle: {
        margin: '0 0 16px', fontSize: 16, fontWeight: 700,
        color: C.navy, fontFamily: 'Oswald, sans-serif',
    },
    statGrid: {
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: 12, marginBottom: 16,
    },
    statCard: {
        background: C.white, borderRadius: 12, padding: 20,
        textAlign: 'center', border: `1px solid ${C.border}`,
    },
    statValue: { fontSize: 28, fontWeight: 800, fontFamily: 'Oswald, sans-serif', margin: '8px 0 4px' },
    statLabel: { fontSize: 14, color: C.textMuted, fontWeight: 600 },
    moodCard: {
        display: 'flex', alignItems: 'center', gap: 12,
        background: C.white, borderRadius: 12, padding: 16,
        border: `1px solid ${C.border}`, marginBottom: 16,
    },
    moodGrid: {
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
        gap: 8, marginBottom: 12,
    },
    moodBtn: {
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: 4, padding: '12px 8px', borderRadius: 10,
        cursor: 'pointer', transition: 'all 0.2s',
    },
    moodHistory: {
        display: 'flex', gap: 8, flexWrap: 'wrap',
    },
    moodHistoryItem: {
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: 2, padding: 6, borderRadius: 8,
        background: 'rgba(31,61,133,0.04)',
    },
    input: {
        width: '100%', padding: '10px 14px', border: `1px solid ${C.border}`,
        borderRadius: 8, fontSize: 14, fontFamily: 'Open Sans, sans-serif',
        outline: 'none', boxSizing: 'border-box',
    },
    textarea: {
        width: '100%', padding: '12px 14px', border: `1px solid ${C.border}`,
        borderRadius: 8, fontSize: 14, fontFamily: 'Patrick Hand, Caveat, Open Sans, sans-serif',
        outline: 'none', resize: 'vertical', boxSizing: 'border-box',
        lineHeight: 1.6,
    },
    primaryBtn: {
        background: `linear-gradient(135deg, ${C.lime}, ${C.limeDark})`,
        border: 'none', color: C.white, padding: '10px 20px',
        borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600,
        marginTop: 8,
    },
    diarioEntry: {
        padding: '14px 0', borderBottom: `1px solid ${C.border}`,
    },
    diarioHeader: {
        display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6,
    },
    diarioDate: { fontSize: 14, color: C.textMuted },
    diarioText: { margin: 0, fontSize: 14, lineHeight: 1.6, color: C.text },
    experimentItem: {
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 0', borderBottom: `1px solid ${C.border}`,
    },
    experimentRow: {
        display: 'flex', alignItems: 'flex-start', gap: 10,
        padding: '12px 0', borderBottom: `1px solid ${C.border}`,
    },
    volumeBadge: {
        background: C.limeSoft, color: C.limeDark, fontSize: 14,
        fontWeight: 700, padding: '2px 8px', borderRadius: 4, marginLeft: 8,
    },
    badge: {
        background: 'rgba(31,61,133,0.08)', color: C.navy, fontSize: 14,
        fontWeight: 600, padding: '2px 8px', borderRadius: 4, marginLeft: 4,
    },
    meraviglieCounter: {
        textAlign: 'center', padding: '24px 20px',
        background: C.white, borderRadius: 12,
        border: `1px solid ${C.border}`, marginBottom: 16,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
    },
    meravigliaCard: {
        display: 'flex', alignItems: 'flex-start', gap: 10,
        padding: '12px 0', borderBottom: `1px solid ${C.border}`,
    },
    meravigliaItem: {
        display: 'flex', alignItems: 'flex-start', gap: 8,
        padding: '8px 0', fontSize: 14,
    },
    constellationMap: {
        background: `linear-gradient(180deg, ${C.navyDark}, #0d1b2a)`,
        borderRadius: 12, padding: 16, overflow: 'hidden',
    },
    emptyConstellation: {
        textAlign: 'center', padding: '40px 20px',
        background: `linear-gradient(180deg, ${C.navyDark}, #0d1b2a)`,
        borderRadius: 12,
    },
    concettoRow: {
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 0', borderBottom: `1px solid ${C.border}`,
    },
    concettoDot: {
        borderRadius: '50%', background: C.lime, flexShrink: 0,
    },
};
