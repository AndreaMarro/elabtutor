// ============================================
// ELAB Tutor - Dashboard Professore "La Serra"
// Monitoraggio classe: giardino, meteo,
// attività, confusione, nudge, documenti
// © Andrea Marro — 08/02/2026
// Tutti i diritti riservati
// ============================================

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import studentService from '../../services/studentService';
import { adminService, usersLookup } from '../../services/userService';
import { createClass, listClasses, removeStudent, updateClassGames } from '../../services/authService';
import { useConfirmModal } from '../common/ConfirmModal';
// Colori ELAB ufficiali
const C = {
    navy: '#1E4D8C',
    navyDark: '#152a5c',
    lime: '#7CB342',
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

// ─── INLINE SVG ICONS ─────────────────────────────────
const svgProps = { xmlns: 'http://www.w3.org/2000/svg', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' };

// Weather icons
const IconSun = ({ size = 18, color }) => (
    <svg {...svgProps} width={size} height={size} viewBox="0 0 20 20" style={{ color: color || 'currentColor', display: 'inline-block', verticalAlign: 'middle' }}>
        <circle cx="10" cy="10" r="4" />
        <line x1="10" y1="1" x2="10" y2="3.5" /><line x1="10" y1="16.5" x2="10" y2="19" />
        <line x1="1" y1="10" x2="3.5" y2="10" /><line x1="16.5" y1="10" x2="19" y2="10" />
        <line x1="3.6" y1="3.6" x2="5.4" y2="5.4" /><line x1="14.6" y1="14.6" x2="16.4" y2="16.4" />
        <line x1="3.6" y1="16.4" x2="5.4" y2="14.6" /><line x1="14.6" y1="5.4" x2="16.4" y2="3.6" />
    </svg>
);
const IconStorm = ({ size = 18, color }) => (
    <svg {...svgProps} width={size} height={size} viewBox="0 0 20 20" style={{ color: color || 'currentColor', display: 'inline-block', verticalAlign: 'middle' }}>
        <path d="M4 10a5 5 0 0 1 9.9-1H15a3 3 0 0 1 0 6H4.5a3.5 3.5 0 0 1-.5-7z" />
        <polyline points="10 13 8 17 12 17 10 20" strokeWidth="2" />
    </svg>
);
const IconRain = ({ size = 18, color }) => (
    <svg {...svgProps} width={size} height={size} viewBox="0 0 20 20" style={{ color: color || 'currentColor', display: 'inline-block', verticalAlign: 'middle' }}>
        <path d="M4 9a5 5 0 0 1 9.9-1H15a3 3 0 0 1 0 6H4.5a3.5 3.5 0 0 1-.5-7z" />
        <line x1="7" y1="16" x2="6" y2="19" /><line x1="11" y1="16" x2="10" y2="19" /><line x1="15" y1="16" x2="14" y2="19" />
    </svg>
);
const IconCloud = ({ size = 18, color }) => (
    <svg {...svgProps} width={size} height={size} viewBox="0 0 20 20" style={{ color: color || 'currentColor', display: 'inline-block', verticalAlign: 'middle' }}>
        <path d="M4 11a5 5 0 0 1 9.9-1H15a3 3 0 0 1 0 6H4.5a3.5 3.5 0 0 1-.5-7z" />
    </svg>
);
const IconPartlyCloudy = ({ size = 18, color }) => (
    <svg {...svgProps} width={size} height={size} viewBox="0 0 20 20" style={{ color: color || 'currentColor', display: 'inline-block', verticalAlign: 'middle' }}>
        <circle cx="7" cy="7" r="3" />
        <line x1="7" y1="1" x2="7" y2="2.5" /><line x1="2" y1="7" x2="3.5" y2="7" />
        <line x1="3.5" y1="3.5" x2="4.6" y2="4.6" /><line x1="10.5" y1="3.5" x2="9.4" y2="4.6" />
        <path d="M6 12.5a4 4 0 0 1 7.9-.8H15a2.5 2.5 0 0 1 0 5H6.4a2.8 2.8 0 0 1-.4-5.6z" />
    </svg>
);

// Plant/growth stage icons
const IconSeedDormant = ({ size = 18 }) => (
    <svg {...svgProps} width={size} height={size} viewBox="0 0 20 20" style={{ color: '#8D6E63', display: 'inline-block', verticalAlign: 'middle' }}>
        <ellipse cx="10" cy="13" rx="4" ry="3" fill="#D7CCC8" stroke="#8D6E63" />
        <line x1="4" y1="17" x2="16" y2="17" stroke="#8D6E63" />
    </svg>
);
const IconSeed = ({ size = 18 }) => (
    <svg {...svgProps} width={size} height={size} viewBox="0 0 20 20" style={{ color: '#7CB342', display: 'inline-block', verticalAlign: 'middle' }}>
        <ellipse cx="10" cy="14" rx="4" ry="3" fill="#D7CCC8" stroke="#8D6E63" />
        <path d="M10 14 Q10 11 10 9" stroke="#7CB342" />
        <path d="M10 10 Q12 8 13 9" stroke="#7CB342" />
        <line x1="4" y1="17" x2="16" y2="17" stroke="#8D6E63" />
    </svg>
);
const IconSprout = ({ size = 18 }) => (
    <svg {...svgProps} width={size} height={size} viewBox="0 0 20 20" style={{ color: '#7CB342', display: 'inline-block', verticalAlign: 'middle' }}>
        <line x1="10" y1="17" x2="10" y2="8" stroke="#7CB342" />
        <path d="M10 10 Q7 7 5 8" stroke="#7CB342" fill="none" />
        <path d="M10 8 Q13 5 15 6" stroke="#7CB342" fill="none" />
        <line x1="4" y1="17" x2="16" y2="17" stroke="#8D6E63" />
    </svg>
);
const IconBush = ({ size = 18 }) => (
    <svg {...svgProps} width={size} height={size} viewBox="0 0 20 20" style={{ color: '#7CB342', display: 'inline-block', verticalAlign: 'middle' }}>
        <line x1="10" y1="17" x2="10" y2="10" stroke="#6D4C41" />
        <circle cx="10" cy="7" r="5" fill="#A5D6A7" stroke="#7CB342" />
        <circle cx="7" cy="9" r="3" fill="#81C784" stroke="#7CB342" />
        <circle cx="13" cy="9" r="3" fill="#81C784" stroke="#7CB342" />
        <line x1="4" y1="17" x2="16" y2="17" stroke="#8D6E63" />
    </svg>
);
const IconPine = ({ size = 18 }) => (
    <svg {...svgProps} width={size} height={size} viewBox="0 0 20 20" style={{ color: '#7CB342', display: 'inline-block', verticalAlign: 'middle' }}>
        <rect x="9" y="15" width="2" height="3" fill="#6D4C41" stroke="#6D4C41" />
        <polygon points="10,2 4,10 7,10 3,15 17,15 13,10 16,10" fill="#66BB6A" stroke="#43A047" />
        <line x1="4" y1="18" x2="16" y2="18" stroke="#8D6E63" />
    </svg>
);
const IconOak = ({ size = 18 }) => (
    <svg {...svgProps} width={size} height={size} viewBox="0 0 20 20" style={{ color: '#7CB342', display: 'inline-block', verticalAlign: 'middle' }}>
        <rect x="9" y="14" width="2" height="4" fill="#5D4037" stroke="#5D4037" />
        <circle cx="10" cy="8" r="6" fill="#66BB6A" stroke="#43A047" />
        <circle cx="6" cy="10" r="3.5" fill="#81C784" stroke="#43A047" />
        <circle cx="14" cy="10" r="3.5" fill="#81C784" stroke="#43A047" />
        <circle cx="10" cy="5" r="3" fill="#A5D6A7" stroke="#43A047" />
        <line x1="4" y1="18" x2="16" y2="18" stroke="#8D6E63" />
    </svg>
);

// Mood icons
const IconEnergico = ({ size = 16 }) => (
    <svg {...svgProps} width={size} height={size} viewBox="0 0 20 20" style={{ color: '#F5A623', display: 'inline-block', verticalAlign: 'middle' }}>
        <polygon points="10,1 12,8 19,8 13.5,12 15.5,19 10,14.5 4.5,19 6.5,12 1,8 8,8" fill="#F5A623" stroke="none" />
    </svg>
);
const IconConcentrato = ({ size = 16 }) => (
    <svg {...svgProps} width={size} height={size} viewBox="0 0 20 20" style={{ color: '#1E4D8C', display: 'inline-block', verticalAlign: 'middle' }}>
        <circle cx="10" cy="10" r="8" stroke="#1E4D8C" />
        <circle cx="10" cy="10" r="4" stroke="#1E4D8C" />
        <circle cx="10" cy="10" r="1" fill="#1E4D8C" stroke="none" />
    </svg>
);
const IconConfuso = ({ size = 16 }) => (
    <svg {...svgProps} width={size} height={size} viewBox="0 0 20 20" style={{ color: '#9333EA', display: 'inline-block', verticalAlign: 'middle' }}>
        <circle cx="10" cy="10" r="8" stroke="#9333EA" />
        <path d="M7 7.5 Q7 5 10 5 Q13 5 13 7.5 Q13 9 10 10 L10 12" stroke="#9333EA" fill="none" />
        <circle cx="10" cy="15" r="0.8" fill="#9333EA" stroke="none" />
    </svg>
);
const IconBloccato = ({ size = 16 }) => (
    <svg {...svgProps} width={size} height={size} viewBox="0 0 20 20" style={{ color: '#E53935', display: 'inline-block', verticalAlign: 'middle' }}>
        <rect x="4" y="9" width="12" height="8" rx="2" stroke="#E53935" />
        <path d="M7 9 V6 Q7 3 10 3 Q13 3 13 6 V9" stroke="#E53935" fill="none" />
    </svg>
);
const IconFelice = ({ size = 16 }) => (
    <svg {...svgProps} width={size} height={size} viewBox="0 0 20 20" style={{ color: '#7CB342', display: 'inline-block', verticalAlign: 'middle' }}>
        <circle cx="10" cy="10" r="8" stroke="#7CB342" />
        <circle cx="7" cy="8" r="1" fill="#7CB342" stroke="none" />
        <circle cx="13" cy="8" r="1" fill="#7CB342" stroke="none" />
        <path d="M6 12 Q10 16 14 12" stroke="#7CB342" fill="none" />
    </svg>
);
const IconFrustrato = ({ size = 16 }) => (
    <svg {...svgProps} width={size} height={size} viewBox="0 0 20 20" style={{ color: '#EF4444', display: 'inline-block', verticalAlign: 'middle' }}>
        <circle cx="10" cy="10" r="8" stroke="#EF4444" />
        <circle cx="7" cy="8" r="1" fill="#EF4444" stroke="none" />
        <circle cx="13" cy="8" r="1" fill="#EF4444" stroke="none" />
        <path d="M6 15 Q10 11 14 15" stroke="#EF4444" fill="none" />
    </svg>
);
const IconCurioso = ({ size = 16 }) => (
    <svg {...svgProps} width={size} height={size} viewBox="0 0 20 20" style={{ color: '#00B4D8', display: 'inline-block', verticalAlign: 'middle' }}>
        <circle cx="10" cy="10" r="8" stroke="#00B4D8" />
        <circle cx="7" cy="8" r="1" fill="#00B4D8" stroke="none" />
        <circle cx="13" cy="8" r="1" fill="#00B4D8" stroke="none" />
        <circle cx="10" cy="14" r="2" stroke="#00B4D8" fill="none" />
    </svg>
);
const IconCreativo = ({ size = 16 }) => (
    <svg {...svgProps} width={size} height={size} viewBox="0 0 20 20" style={{ color: '#EC4899', display: 'inline-block', verticalAlign: 'middle' }}>
        <path d="M10 3 Q6 3 6 7 Q6 10 10 12 Q14 10 14 7 Q14 3 10 3z" stroke="#EC4899" fill="none" />
        <line x1="10" y1="12" x2="10" y2="16" stroke="#EC4899" />
        <line x1="8" y1="16" x2="12" y2="16" stroke="#EC4899" />
        <line x1="8" y1="7" x2="12" y2="7" stroke="#EC4899" />
        <line x1="8" y1="9" x2="12" y2="9" stroke="#EC4899" />
    </svg>
);

// Game icons
const IconDetective = ({ size = 16 }) => (
    <svg {...svgProps} width={size} height={size} viewBox="0 0 20 20" style={{ color: 'currentColor', display: 'inline-block', verticalAlign: 'middle' }}>
        <circle cx="8" cy="8" r="5" />
        <line x1="12" y1="12" x2="18" y2="18" strokeWidth="2" />
    </svg>
);
const IconPredict = ({ size = 16 }) => (
    <svg {...svgProps} width={size} height={size} viewBox="0 0 20 20" style={{ color: 'currentColor', display: 'inline-block', verticalAlign: 'middle' }}>
        <circle cx="10" cy="10" r="8" />
        <path d="M10 4 L10 10 L14 14" />
    </svg>
);
const IconReverse = ({ size = 16 }) => (
    <svg {...svgProps} width={size} height={size} viewBox="0 0 20 20" style={{ color: 'currentColor', display: 'inline-block', verticalAlign: 'middle' }}>
        <polyline points="3 10 7 6 7 14 3 10" fill="currentColor" stroke="none" />
        <polyline points="17 10 13 6 13 14 17 10" fill="currentColor" stroke="none" />
        <line x1="7" y1="10" x2="13" y2="10" />
    </svg>
);
const IconReview = ({ size = 16 }) => (
    <svg {...svgProps} width={size} height={size} viewBox="0 0 20 20" style={{ color: 'currentColor', display: 'inline-block', verticalAlign: 'middle' }}>
        <rect x="3" y="2" width="14" height="16" rx="2" />
        <line x1="7" y1="7" x2="13" y2="7" /><line x1="7" y1="10" x2="13" y2="10" /><line x1="7" y1="13" x2="11" y2="13" />
    </svg>
);

// Status icons
const IconCheck = ({ size = 14, color }) => (
    <svg {...svgProps} width={size} height={size} viewBox="0 0 20 20" style={{ color: color || '#7CB342', display: 'inline-block', verticalAlign: 'middle' }}>
        <circle cx="10" cy="10" r="8" stroke="currentColor" />
        <polyline points="6 10 9 13 14 7" stroke="currentColor" />
    </svg>
);
const IconQuestion = ({ size = 14, color }) => (
    <svg {...svgProps} width={size} height={size} viewBox="0 0 20 20" style={{ color: color || '#F5A623', display: 'inline-block', verticalAlign: 'middle' }}>
        <circle cx="10" cy="10" r="8" stroke="currentColor" />
        <path d="M7 7.5 Q7 5 10 5 Q13 5 13 7.5 Q13 9 10 10 L10 12" stroke="currentColor" fill="none" />
        <circle cx="10" cy="15" r="0.8" fill="currentColor" stroke="none" />
    </svg>
);
const IconAlert = ({ size = 14, color }) => (
    <svg {...svgProps} width={size} height={size} viewBox="0 0 20 20" style={{ color: color || '#E53935', display: 'inline-block', verticalAlign: 'middle' }}>
        <polygon points="10,2 19,18 1,18" stroke="currentColor" fill="none" />
        <line x1="10" y1="8" x2="10" y2="13" stroke="currentColor" />
        <circle cx="10" cy="15.5" r="0.8" fill="currentColor" stroke="none" />
    </svg>
);

// Nudge envelope icon
const IconNudge = ({ size = 16 }) => (
    <svg {...svgProps} width={size} height={size} viewBox="0 0 20 20" style={{ color: '#1E4D8C', display: 'inline-block', verticalAlign: 'middle' }}>
        <rect x="2" y="4" width="16" height="12" rx="2" stroke="currentColor" />
        <polyline points="2 4 10 11 18 4" stroke="currentColor" />
    </svg>
);

// Weather icon lookup (returns JSX element)
const WEATHER_ICONS = {
    S: (size) => <IconSun size={size} />,
    T: (size) => <IconStorm size={size} />,
    P: (size) => <IconRain size={size} />,
    N: (size) => <IconCloud size={size} />,
    PN: (size) => <IconPartlyCloudy size={size} />,
};

// Plant icon lookup (returns JSX element)
const PLANT_ICONS = {
    '[0]': (size) => <IconSeedDormant size={size} />,
    '[1]': (size) => <IconSeed size={size} />,
    '[2]': (size) => <IconSprout size={size} />,
    '[3]': (size) => <IconBush size={size} />,
    '[4]': (size) => <IconPine size={size} />,
    '[5]': (size) => <IconOak size={size} />,
};

const MOOD_EMOJI = {
    energico: <IconEnergico />, concentrato: <IconConcentrato />,
    confuso: <IconConfuso />, bloccato: <IconBloccato />,
    felice: <IconFelice />, frustrato: <IconFrustrato />,
    curioso: <IconCurioso />, creativo: <IconCreativo />,
};

const MOOD_COLORS = {
    energico: '#F5A623', concentrato: '#1E4D8C', confuso: '#9333EA', bloccato: '#E53935',
    felice: '#7CB342', frustrato: '#EF4444', curioso: '#00B4D8', creativo: '#EC4899',
};

// Avatar color from name hash (deterministic)
const AVATAR_COLORS = ['#1E4D8C', '#7CB342', '#E8941C', '#E54B3D', '#9333EA', '#00B4D8', '#EC4899', '#6D4C41'];
function getAvatarColor(name) {
    let hash = 0;
    for (let i = 0; i < (name || '').length; i++) hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}
function getInitials(name) {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
}

// "Pianta" styles in base all'attività
function getPlantStyle(studentData) {
    if (!studentData) return { emoji: '[1]', size: 30, label: 'Seme' };
    const esp = studentData.stats?.esperimentiTotali || 0;
    const tempo = studentData.tempoTotale || 0;
    const concetti = studentData.concetti?.length || 0;

    if (esp >= 15 && concetti >= 10) return { emoji: '[5]', size: 50, label: 'Quercia' };
    if (esp >= 10 || concetti >= 8) return { emoji: '[4]', size: 44, label: 'Pino' };
    if (esp >= 5 || concetti >= 4) return { emoji: '[3]', size: 38, label: 'Cespuglio' };
    if (esp >= 2) return { emoji: '[2]', size: 34, label: 'Germoglio' };
    if (tempo > 300) return { emoji: '[1]', size: 30, label: 'Seme' };
    return { emoji: '[0]', size: 26, label: 'Seme dormiente' };
}

function getWeatherForConcept(allData, concettoId) {
    let totalConfusione = 0;
    let count = 0;
    Object.values(allData).forEach(d => {
        d.confusione?.filter(c => c.concettoId === concettoId).forEach(c => {
            totalConfusione += c.livello;
            count++;
        });
    });
    if (count === 0) return { icon: 'S', label: 'Sereno' };
    const media = totalConfusione / count;
    if (media > 7) return { icon: 'T', label: 'Tempesta' };
    if (media > 5) return { icon: 'P', label: 'Pioggia' };
    if (media > 3) return { icon: 'N', label: 'Nuvoloso' };
    return { icon: 'PN', label: 'Poco nuvoloso' };
}

// ─── DATI DEMO (quando non ci sono studenti reali) ──────────────
const DEMO_USERS = [
    { id: 'demo-1', nome: 'Marco Rossi', email: 'marco@demo.elab', ruolo: 'user', stato: 'attivo', scuola: 'IC Leonardo da Vinci' },
    { id: 'demo-2', nome: 'Sofia Bianchi', email: 'sofia@demo.elab', ruolo: 'user', stato: 'attivo', scuola: 'IC Leonardo da Vinci' },
    { id: 'demo-3', nome: 'Luca Ferrari', email: 'luca@demo.elab', ruolo: 'user', stato: 'attivo', scuola: 'IC Leonardo da Vinci' },
    { id: 'demo-4', nome: 'Giulia Esposito', email: 'giulia@demo.elab', ruolo: 'user', stato: 'attivo', scuola: 'IC UNLIM Galilei' },
    { id: 'demo-5', nome: 'Alessandro Russo', email: 'ale@demo.elab', ruolo: 'user', stato: 'attivo', scuola: 'IC UNLIM Galilei' },
    { id: 'demo-6', nome: 'Emma Colombo', email: 'emma@demo.elab', ruolo: 'user', stato: 'attivo', scuola: 'IC UNLIM Galilei' },
];

const now = Date.now();
const day = 86400000;

function makeDemoStudentData() {
    const data = {};
    const moods = ['energico', 'concentrato', 'confuso', 'felice', 'curioso', 'creativo'];
    const concettiPool = [
        { id: 'ohm', nome: 'Legge di Ohm' }, { id: 'led', nome: 'LED e Resistenze' },
        { id: 'pwm', nome: 'PWM e Dimming' }, { id: 'serial', nome: 'Comunicazione Seriale' },
        { id: 'adc', nome: 'Conversione Analogico-Digitale' }, { id: 'pot', nome: 'Potenziometro' },
    ];
    const expIds = ['cap1-led-semplice', 'cap2-resistenza-serie', 'cap3-potenziometro', 'cap4-buzzer', 'cap5-fotoresistenza', 'cap6-pulsante', 'cap7-led-rgb', 'cap8-servo', 'cap9-motor-dc', 'cap10-lcd'];

    DEMO_USERS.forEach((u, idx) => {
        const numExp = 3 + idx * 2;
        const tempo = 1200 + idx * 800;
        data[u.id] = {
            userId: u.id,
            esperimenti: expIds.slice(0, numExp).map((eid, i) => ({
                experimentId: eid, completato: i < numExp - 1,
                timestamp: new Date(now - (numExp - i) * day).toISOString(), durata: 180 + i * 60,
            })),
            tempoTotale: tempo,
            sessioni: Array.from({ length: 3 + idx }, (_, i) => ({
                inizio: new Date(now - (5 - i) * day).toISOString(),
                fine: new Date(now - (5 - i) * day + 1800000).toISOString(),
                durata: 1800 + i * 300,
            })),
            concetti: concettiPool.slice(0, 2 + idx).map((c, i) => ({
                ...c, contatore: 2 + i, primaVisita: new Date(now - 10 * day).toISOString(),
                ultimaVisita: new Date(now - i * day).toISOString(),
            })),
            diario: [{ testo: 'Ho imparato come funziona un LED!', timestamp: new Date(now - 3 * day).toISOString() }],
            confusione: idx > 2 ? [{ concettoId: 'pwm', livello: 6 + idx, timestamp: new Date(now - 2 * day).toISOString() }] : [],
            meraviglie: idx % 2 === 0 ? [{ domanda: 'Perché il LED si accende solo in un verso?', timestamp: new Date(now - day).toISOString() }] : [],
            difficolta: [],
            moods: [{ mood: moods[idx % moods.length], nota: '', timestamp: new Date(now - day * 0.5).toISOString() }],
            stats: { giorniConsecutivi: 1 + idx, ultimoGiornoAttivo: new Date(now - day).toISOString(), esperimentiTotali: numExp, mediaConfusione: 3 + idx * 0.5, meraviglieTotali: idx % 2 === 0 ? 1 : 0, tempoMedioSessione: 600 + idx * 200 },
            creato: new Date(now - 15 * day).toISOString(),
            ultimoSalvataggio: new Date(now - day).toISOString(),
        };
    });
    return data;
}

function makeDemoClassReport() {
    return {
        totaleStudenti: 6,
        concettiConfusione: { pwm: { totale: 22, conteggio: 3 }, adc: { totale: 8, conteggio: 2 } },
        esperimentiCount: { 'cap1-led-semplice': 6, 'cap2-resistenza-serie': 5, 'cap3-potenziometro': 4, 'cap4-buzzer': 3, 'cap5-fotoresistenza': 2 },
        attivitaRecente: DEMO_USERS.map((u, i) => ({ userId: u.id, sessioni: 2 + i, tempoSettimana: 1800 + i * 600, esperimentiSettimana: 1 + i })),
        inattivi: ['demo-1'],
        moodCount: { energico: 1, concentrato: 1, confuso: 1, felice: 1, curioso: 1, creativo: 1 },
        tempoMedioTotale: 3400,
        mediaEsperimenti: 8,
    };
}

// © Andrea Marro — 20/02/2026
// ─── VOLUME DETECTION ────────────────────────────────────
// Experiment IDs: cap1-..cap10 = Vol1, cap11-..cap20 = Vol2 (future), cap21+ = Vol3 (future)
// Vol3 experiments have IDs starting with "v3-" or "cap-v3-"
function getExperimentVolume(experimentId) {
    if (!experimentId) return null;
    const id = experimentId.toLowerCase();
    if (id.startsWith('v3-') || id.startsWith('cap-v3-') || id.includes('-vol3')) return 3;
    if (id.startsWith('v2-') || id.startsWith('cap-v2-') || id.includes('-vol2')) return 2;
    // Default: Vol 1 (cap1- through cap10-, or any other prefix)
    return 1;
}

function getStudentVolumes(studentData) {
    if (!studentData?.esperimenti?.length) return new Set();
    const vols = new Set();
    studentData.esperimenti.forEach(e => {
        const v = getExperimentVolume(e.experimentId);
        if (v) vols.add(v);
    });
    return vols;
}

// ─── CSV EXPORT ──────────────────────────────────────────
function exportStudentsCSV(users, allData, classReport, formatTempo) {
    const headers = ['#', 'Nome', 'Email', 'Scuola', 'Sessioni', 'Tempo Totale', 'Esperimenti', 'Stato'];
    const rows = users.map((u, i) => {
        const sd = allData[u.id];
        const att = classReport?.attivitaRecente?.find(a => a.userId === u.id);
        const isInattivo = classReport?.inattivi?.includes(u.id);
        const stato = isInattivo ? 'Inattivo' : (att?.sessioni > 3 ? 'Attivo' : 'Leggero');
        return [
            i + 1,
            `"${(u.nome || '').replace(/"/g, '""')}"`,
            `"${(u.email || '').replace(/"/g, '""')}"`,
            `"${(u.scuola || '').replace(/"/g, '""')}"`,
            att?.sessioni || 0,
            formatTempo(sd?.tempoTotale || 0),
            sd?.stats?.esperimentiTotali || 0,
            stato,
        ];
    });
    const csv = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const bom = '\uFEFF';
    const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `studenti_export_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

export default function TeacherDashboard({ onNavigate }) {
    const { user, isDocente, isAdmin } = useAuth();
    const { confirm: confirmModal, ConfirmDialog } = useConfirmModal();
    const [activeTab, setActiveTab] = useState('giardino');
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [nudgeText, setNudgeText] = useState('');
    const [nudgesSent, setNudgesSent] = useState([]);
    const [filterSearch, setFilterSearch] = useState('');
    const [volumeFilter, setVolumeFilter] = useState('tutti'); // 'tutti' | '1' | '2' | '3'
    const [allStudentData, setAllStudentData] = useState({});
    const [classReport, setClassReport] = useState(null);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [dataSource, setDataSource] = useState('loading'); // 'server' | 'local' | 'demo' | 'loading'

    // Carica tutti gli utenti studenti
    const realUsers = useMemo(() => {
        return adminService.getAllUsers().filter(u => u.ruolo === 'user' && u.stato === 'attivo');
    }, []);

    // Fallback a demo se nessuno studente reale E nessun dato server
    const isDemoMode = realUsers.length === 0 && Object.keys(allStudentData).length === 0 && !isLoadingData;
    const allUsers = useMemo(() => {
        if (isDemoMode) return DEMO_USERS;
        if (realUsers.length > 0) return realUsers;
        // Se abbiamo dati server ma non utenti locali, costruisci lista da dati server
        // Cerca nome in tutti i campi possibili — MAI mostrare UUID
        return Object.entries(allStudentData).map(([id, data]) => {
            const nome = data.nome || data.name || data.displayName
                || (data.email ? data.email.split('@')[0] : null)
                || `Studente ${id.slice(0, 6)}`;
            return {
                id,
                nome,
                email: data.email || '',
                ruolo: 'user',
                stato: 'attivo',
            };
        });
    }, [realUsers, allStudentData, isDemoMode, isLoadingData]);

    // Fetch dati studenti dal server (asincrono)
    useEffect(() => {
        let cancelled = false;
        async function loadData() {
            setIsLoadingData(true);
            try {
                // Prima prova dal server
                const serverData = await studentService.fetchStudentsFromServer();
                if (!cancelled && Object.keys(serverData).length > 0) {
                    setAllStudentData(serverData);
                    setDataSource('server');
                    const report = await studentService.getClassReportFromServer();
                    if (!cancelled) setClassReport(report);
                    setIsLoadingData(false);
                    return;
                }
                // Fallback: localStorage (per compatibilità)
                if (!cancelled) {
                    const localData = studentService.getAllStudentsData();
                    if (Object.keys(localData).length > 0) {
                        setAllStudentData(localData);
                        setDataSource('local');
                        const ids = Object.keys(localData);
                        setClassReport(studentService.getClassReport(ids));
                    } else {
                        // Demo mode
                        setAllStudentData(makeDemoStudentData());
                        setClassReport(makeDemoClassReport());
                        setDataSource('demo');
                    }
                }
            } catch {
                // Fallback completo a demo
                if (!cancelled) {
                    setAllStudentData(makeDemoStudentData());
                    setClassReport(makeDemoClassReport());
                    setDataSource('demo');
                }
            } finally {
                if (!cancelled) setIsLoadingData(false);
            }
        }
        loadData();
        return () => { cancelled = true; };
    }, []);

    // Filtro studenti (testo + volume)
    const filteredUsers = useMemo(() => {
        let result = allUsers;
        if (filterSearch) {
            const q = filterSearch.toLowerCase();
            result = result.filter(u =>
                u.nome.toLowerCase().includes(q) ||
                u.email.toLowerCase().includes(q) ||
                (u.scuola && u.scuola.toLowerCase().includes(q))
            );
        }
        if (volumeFilter !== 'tutti') {
            const vol = parseInt(volumeFilter);
            result = result.filter(u => {
                const vols = getStudentVolumes(allStudentData[u.id]);
                return vols.has(vol);
            });
        }
        return result;
    }, [allUsers, filterSearch, volumeFilter, allStudentData]);

    if (!user || (!isDocente && !isAdmin)) {
        return (
            <div style={{ padding: 40, textAlign: 'center', color: C.textMuted }}>
                <h2 style={{ color: C.navy }}>Area riservata ai docenti</h2>
                <p>Accedi con un account docente per monitorare i tuoi studenti.</p>
            </div>
        );
    }

    if (isLoadingData) {
        return (
            <div style={{ padding: 60, textAlign: 'center', color: C.textMuted }}>
                <h2 style={{ color: C.navy }}>Caricamento dati studenti...</h2>
                <p>Sincronizzazione con il server in corso.</p>
            </div>
        );
    }

    const tabs = [
        { id: 'giardino', label: 'Il Giardino' },
        { id: 'meteo', label: 'Meteo Classe' },
        { id: 'attivita', label: 'Attività' },
        { id: 'studente', label: 'Dettaglio Studente' },
        { id: 'nudge', label: 'Nudge' },
        { id: 'documenti', label: 'Documentazione' },
        { id: 'classi', label: 'Le mie classi' },
    ];

    const handleSendNudge = () => {
        if (!nudgeText.trim() || !selectedStudent) return;
        setNudgesSent(prev => [...prev, {
            id: Date.now().toString(36),
            studentId: selectedStudent,
            testo: nudgeText,
            timestamp: new Date().toISOString(),
        }]);
        setNudgeText('');
    };

    const formatTempo = (secondi) => {
        if (!secondi) return '0s';
        if (secondi < 60) return `${secondi}s`;
        if (secondi < 3600) return `${Math.round(secondi / 60)}min`;
        return `${Math.round(secondi / 3600 * 10) / 10}h`;
    };

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <div style={styles.headerLeft}>
                    <span style={{ fontSize: 20, fontWeight: 700, color: C.limeLight }}></span>
                    <div>
                        <h1 style={styles.headerTitle}>La Serra del Prof. {user.nome?.split(' ')[0]}</h1>
                        <p style={styles.headerSubtitle}>
                            {allUsers.length} studenti nel giardino
                            {isDemoMode && <span style={{ color: '#F59E0B', fontWeight: 600 }}> (Demo)</span>}
                        </p>
                    </div>
                </div>
            </div>
            {isDemoMode && (
                <div style={{
                    background: 'linear-gradient(90deg, #F59E0B22 0%, #F59E0B11 100%)',
                    border: '1px solid #F59E0B44',
                    borderRadius: 8,
                    padding: '8px 16px',
                    margin: '0 20px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: 14,
                    color: '#92400E',
                }}>
                    <span style={{ fontSize: 14, fontWeight: 700 }}></span>
                    <span><strong>Modalità Demo</strong> — Dati fittizi di 6 studenti. Quando i tuoi studenti si registreranno, vedrai i loro dati reali.</span>
                </div>
            )}
            {dataSource === 'local' && (
                <div style={{
                    background: 'linear-gradient(90deg, #3B82F622 0%, #3B82F611 100%)',
                    border: '1px solid #3B82F644',
                    borderRadius: 8,
                    padding: '8px 16px',
                    margin: '0 20px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: 14,
                    color: '#1E40AF',
                }}>
                    <span style={{ fontSize: 14, fontWeight: 700 }}></span>
                    <span><strong>Dati locali</strong> — Il server non è raggiungibile. I dati sono salvati sul tuo dispositivo.</span>
                </div>
            )}

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
                {activeTab === 'giardino' && (
                    <GiardinoTab
                        users={filteredUsers}
                        allData={allStudentData}
                        onSelectStudent={(id) => { setSelectedStudent(id); setActiveTab('studente'); }}
                        filterSearch={filterSearch}
                        setFilterSearch={setFilterSearch}
                        volumeFilter={volumeFilter}
                        setVolumeFilter={setVolumeFilter}
                    />
                )}
                {activeTab === 'meteo' && (
                    <MeteoTab allData={allStudentData} classReport={classReport} />
                )}
                {activeTab === 'attivita' && (
                    <AttivitaTab
                        users={filteredUsers}
                        allUsers={allUsers}
                        allData={allStudentData}
                        classReport={classReport}
                        formatTempo={formatTempo}
                        volumeFilter={volumeFilter}
                        setVolumeFilter={setVolumeFilter}
                    />
                )}
                {activeTab === 'studente' && (
                    <StudenteDetailTab
                        users={allUsers}
                        allData={allStudentData}
                        selectedId={selectedStudent}
                        onSelectStudent={setSelectedStudent}
                        formatTempo={formatTempo}
                    />
                )}
                {activeTab === 'nudge' && (
                    <NudgeTab
                        users={allUsers}
                        selectedStudent={selectedStudent}
                        setSelectedStudent={setSelectedStudent}
                        nudgeText={nudgeText}
                        setNudgeText={setNudgeText}
                        handleSendNudge={handleSendNudge}
                        nudgesSent={nudgesSent}
                    />
                )}
                {activeTab === 'documenti' && (
                    <DocumentiTab
                        users={allUsers}
                        allData={allStudentData}
                        classReport={classReport}
                        formatTempo={formatTempo}
                    />
                )}
                {activeTab === 'classi' && (
                    <ClassiTab />
                )}
            </div>
        </div>
    );
}

// ─── IL GIARDINO ───────────────────────────────────────
function GiardinoTab({ users, allData, onSelectStudent, filterSearch, setFilterSearch, volumeFilter, setVolumeFilter }) {
    return (
        <div>
            <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Il Giardino — Ogni studente è una pianta</h3>
                <p style={{ color: C.textMuted, fontSize: 14, marginBottom: 16 }}>
                    La dimensione riflette l'impegno. La forma riflette il tipo di esplorazione.
                    Nessuna pianta è migliore di un'altra — un pino alto e una quercia ampia sono ugualmente sani.
                </p>

                <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
                    <input
                        type="text"
                        value={filterSearch}
                        onChange={e => setFilterSearch(e.target.value)}
                        placeholder="Cerca studente per nome, email o scuola..."
                        style={{ ...styles.searchInput, marginBottom: 0, flex: 1, minWidth: 200 }}
                    />
                    <select
                        value={volumeFilter}
                        onChange={e => setVolumeFilter(e.target.value)}
                        style={{ ...styles.select, width: 'auto', minWidth: 140 }}
                    >
                        <option value="tutti">Tutti i volumi</option>
                        <option value="1">Volume 1</option>
                        <option value="2">Volume 2</option>
                        <option value="3">Volume 3</option>
                    </select>
                </div>

                {/* Giardino visuale */}
                <div style={styles.gardenGrid}>
                    {users.map(u => {
                        const sd = allData[u.id];
                        const plant = getPlantStyle(sd);
                        const ultimoMood = sd?.moods?.[sd.moods.length - 1];

                        return (
                            <div
                                key={u.id}
                                onClick={() => onSelectStudent(u.id)}
                                style={styles.gardenPlant}
                                title={`${u.nome} — ${plant.label}`}
                            >
                                <div style={{
                                    width: 28, height: 28, borderRadius: '50%',
                                    background: getAvatarColor(u.nome),
                                    color: 'white', fontSize: 14, fontWeight: 700,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontFamily: 'Oswald, sans-serif',
                                    marginBottom: 2,
                                }}>
                                    {getInitials(u.nome)}
                                </div>
                                <span style={{ fontSize: plant.size }}>{PLANT_ICONS[plant.emoji] ? PLANT_ICONS[plant.emoji](plant.size) : plant.emoji}</span>
                                <div style={styles.plantName}>{u.nome?.split(' ')[0]}</div>
                                {ultimoMood && (
                                    <span style={styles.plantMood}>
                                        {MOOD_EMOJI[ultimoMood.mood] || ''}
                                    </span>
                                )}
                                <div style={styles.plantStats}>
                                    <span>{sd?.stats?.esperimentiTotali || 0} esp</span>
                                    <span>{sd ? Math.round((sd.tempoTotale || 0) / 60) + 'm' : '0m'}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {users.length === 0 && (
                    <p style={{ textAlign: 'center', color: C.textMuted, padding: 30 }}>
                        Nessuno studente trovato.
                    </p>
                )}
            </div>
        </div>
    );
}

// ─── METEO CLASSE ──────────────────────────────────────
function MeteoTab({ allData, classReport }) {
    // Raccolta tutti i concetti con confusione
    const concettiConConfusione = useMemo(() => {
        if (!classReport?.concettiConfusione) return [];
        return Object.entries(classReport.concettiConfusione)
            .map(([id, data]) => ({
                id,
                media: Math.round(data.totale / data.conteggio * 10) / 10,
                conteggio: data.conteggio,
                weather: data.totale / data.conteggio > 7 ? 'T' :
                         data.totale / data.conteggio > 5 ? 'P' :
                         data.totale / data.conteggio > 3 ? 'N' : 'PN',
            }))
            .sort((a, b) => b.media - a.media);
    }, [classReport]);

    // Mood aggregato
    const moodSummary = classReport?.moodCount || {};

    return (
        <div>
            {/* Meteo generale */}
            <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Il Meteo della Classe</h3>
                <p style={{ color: C.textMuted, fontSize: 14, marginBottom: 16 }}>
                    La "nebbia" indica zone di confusione diffusa. Non è un problema — è un segnale
                    per decidere se intervenire o lasciar fare.
                </p>

                {/* Mood distribution */}
                {Object.keys(moodSummary).length > 0 && (
                    <div style={styles.weatherRow}>
                        <strong style={{ color: C.navy, marginRight: 12 }}>Mood attuale della classe:</strong>
                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                            {Object.entries(moodSummary).sort((a, b) => b[1] - a[1]).map(([mood, count]) => (
                                <span key={mood} style={{
                                    ...styles.weatherChip,
                                    borderColor: MOOD_COLORS[mood] || C.border,
                                }}>
                                    {MOOD_EMOJI[mood] || '?'} {mood} ({count})
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Zone di confusione */}
            <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Zone di Nebbia (Concetti con Alta Confusione)</h3>
                {concettiConConfusione.length === 0 ? (
                    <p style={{ color: C.textMuted, textAlign: 'center', padding: 20 }}>
                        Cielo sereno! Nessuna zona di confusione significativa rilevata.
                    </p>
                ) : (
                    concettiConConfusione.map(c => (
                        <div key={c.id} style={styles.fogRow}>
                            <span style={{ fontSize: 24 }}>{WEATHER_ICONS[c.weather] ? WEATHER_ICONS[c.weather](24) : c.weather}</span>
                            <div style={{ flex: 1 }}>
                                <strong>{c.id}</strong>
                                <div style={{ fontSize: 14, color: C.textMuted }}>
                                    {c.conteggio} segnalazioni, media {c.media}/10
                                </div>
                            </div>
                            <div style={{
                                ...styles.confusionBar,
                                width: `${Math.min(c.media * 10, 100)}%`,
                                background: c.media > 7 ? C.red :
                                            c.media > 5 ? C.orange :
                                            c.media > 3 ? '#F5D623' : C.lime,
                            }} />
                        </div>
                    ))
                )}
            </div>

            {/* Studenti inattivi */}
            {classReport?.inattivi?.length > 0 && (
                <div style={styles.section}>
                    <h3 style={styles.sectionTitle}>Studenti Inattivi (7+ giorni)</h3>
                    <p style={{ color: C.textMuted, fontSize: 14, marginBottom: 12 }}>
                        Non un allarme — solo un'informazione. Puoi scegliere di inviare un nudge.
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {classReport.inattivi.map(id => {
                            const u = usersLookup.getUser(id);
                            return u ? (
                                <span key={id} style={styles.inactiveBadge}>
                                    {u.nome}
                                </span>
                            ) : null;
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── ATTIVITÀ ──────────────────────────────────────────
function AttivitaTab({ users, allUsers, allData, classReport, formatTempo, volumeFilter, setVolumeFilter }) {
    return (
        <div>
            {/* Header con filtro e export */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
                <select
                    value={volumeFilter}
                    onChange={e => setVolumeFilter(e.target.value)}
                    style={{ ...styles.select, width: 'auto', minWidth: 140 }}
                >
                    <option value="tutti">Tutti i volumi</option>
                    <option value="1">Volume 1</option>
                    <option value="2">Volume 2</option>
                    <option value="3">Volume 3</option>
                </select>
                <button
                    onClick={() => exportStudentsCSV(users, allData, classReport, formatTempo)}
                    style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '8px 16px', borderRadius: 8,
                        background: C.navy, color: C.white,
                        border: 'none', cursor: 'pointer',
                        fontSize: 14, fontWeight: 600, minHeight: 44,
                        transition: 'opacity 150ms',
                    }}
                >
                    Esporta CSV
                </button>
            </div>

            {/* Stats aggregate */}
            <div style={styles.statGrid}>
                <div style={styles.statCard}>
                    <div style={{ ...styles.statValue, color: C.navy }}>{classReport?.totaleStudenti || 0}</div>
                    <div style={styles.statLabel}>Studenti</div>
                </div>
                <div style={styles.statCard}>
                    <div style={{ ...styles.statValue, color: C.lime }}>{classReport?.mediaEsperimenti || 0}</div>
                    <div style={styles.statLabel}>Media esperimenti</div>
                </div>
                <div style={styles.statCard}>
                    <div style={{ ...styles.statValue, color: C.cyan }}>{formatTempo(classReport?.tempoMedioTotale || 0)}</div>
                    <div style={styles.statLabel}>Tempo medio</div>
                </div>
                <div style={styles.statCard}>
                    <div style={{ ...styles.statValue, color: C.orange }}>{classReport?.inattivi?.length || 0}</div>
                    <div style={styles.statLabel}>Inattivi (7gg)</div>
                </div>
            </div>

            {/* Classifica attività settimanale */}
            <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Attività Settimanale</h3>
                <div style={{ overflowX: 'auto' }}>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.th}>Studente</th>
                                <th style={styles.th}>Sessioni</th>
                                <th style={styles.th}>Tempo</th>
                                <th style={styles.th}>Esperimenti</th>
                                <th style={styles.th}>Stato</th>
                            </tr>
                        </thead>
                        <tbody>
                            {classReport?.attivitaRecente?.filter(att => users.some(u => u.id === att.userId)).sort((a, b) => b.tempoSettimana - a.tempoSettimana).map((att, i) => {
                                const u = users.find(u => u.id === att.userId);
                                const isInattivo = classReport.inattivi.includes(att.userId);
                                return (
                                    <tr key={att.userId} style={i % 2 === 0 ? styles.trEven : {}}>
                                        <td style={styles.td}>{u?.nome || u?.email?.split('@')[0] || `Studente ${att.userId.slice(0, 6)}`}</td>
                                        <td style={styles.td}>{att.sessioni}</td>
                                        <td style={styles.td}>{formatTempo(att.tempoSettimana)}</td>
                                        <td style={styles.td}>{att.esperimentiSettimana}</td>
                                        <td style={styles.td}>
                                            {isInattivo ? (
                                                <span style={{ color: C.orange }}>Inattivo</span>
                                            ) : att.sessioni > 3 ? (
                                                <span style={{ color: C.lime }}>Attivo</span>
                                            ) : (
                                                <span style={{ color: C.textMuted }}>Leggero</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Esperimenti più popolari */}
            {classReport?.esperimentiCount && Object.keys(classReport.esperimentiCount).length > 0 && (
                <div style={styles.section}>
                    <h3 style={styles.sectionTitle}>Esperimenti Più Popolari</h3>
                    {Object.entries(classReport.esperimentiCount)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 10)
                        .map(([id, count]) => (
                            <div key={id} style={styles.popularRow}>
                                <span style={{ flex: 1, fontWeight: 500 }}>{id}</span>
                                <div style={styles.popularBar}>
                                    <div style={{
                                        height: '100%',
                                        background: `linear-gradient(90deg, ${C.lime}, ${C.limeDark})`,
                                        borderRadius: 4,
                                        width: `${Math.min(count / (classReport.totaleStudenti || 1) * 100, 100)}%`,
                                    }} />
                                </div>
                                <span style={{ color: C.textMuted, fontSize: 14, minWidth: 30, textAlign: 'right' }}>
                                    {count}
                                </span>
                            </div>
                        ))}
                </div>
            )}
        </div>
    );
}

// ─── DETTAGLIO STUDENTE ────────────────────────────────
function StudenteDetailTab({ users, allData, selectedId, onSelectStudent, formatTempo }) {
    const studentData = selectedId ? allData[selectedId] : null;
    const studentUser = selectedId ? users.find(u => u.id === selectedId) : null;

    return (
        <div>
            {/* Selettore studente */}
            <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Seleziona Studente</h3>
                <select
                    value={selectedId || ''}
                    onChange={e => onSelectStudent(e.target.value || null)}
                    style={styles.select}
                >
                    <option value="">-- Scegli uno studente --</option>
                    {users.map(u => (
                        <option key={u.id} value={u.id}>{u.nome} ({u.email})</option>
                    ))}
                </select>
            </div>

            {selectedId && studentUser && (
                <>
                    {/* Info studente */}
                    <div style={styles.studentHeader}>
                        <div style={styles.studentAvatar}>
                            {studentUser.avatar ? (
                                <img src={studentUser.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                            ) : (
                                <span style={{ fontSize: 24 }}>{studentUser.nome?.charAt(0).toUpperCase()}</span>
                            )}
                        </div>
                        <div>
                            <h2 style={{ margin: 0, color: C.white, fontSize: 20 }}>{studentUser.nome}</h2>
                            <p style={{ margin: '4px 0 0', color: C.limeLight, fontSize: 14 }}>
                                {studentUser.scuola || 'Scuola non specificata'} • Registrato {new Date(studentUser.dataRegistrazione).toLocaleDateString('it-IT')}
                            </p>
                        </div>
                        <span style={{ fontSize: 40, marginLeft: 'auto' }}>
                            {(() => { const ps = getPlantStyle(studentData); return PLANT_ICONS[ps.emoji] ? PLANT_ICONS[ps.emoji](40) : ps.emoji; })()}
                        </span>
                    </div>

                    {studentData ? (
                        <>
                            {/* Stats */}
                            <div style={styles.statGrid}>
                                <div style={styles.statCard}>
                                    <div style={{ ...styles.statValue, color: C.lime }}>{studentData.stats?.esperimentiTotali || 0}</div>
                                    <div style={styles.statLabel}>Esperimenti</div>
                                </div>
                                <div style={styles.statCard}>
                                    <div style={{ ...styles.statValue, color: C.cyan }}>{formatTempo(studentData.tempoTotale || 0)}</div>
                                    <div style={styles.statLabel}>Tempo totale</div>
                                </div>
                                <div style={styles.statCard}>
                                    <div style={{ ...styles.statValue, color: C.orange }}>{studentData.concetti?.length || 0}</div>
                                    <div style={styles.statLabel}>Concetti</div>
                                </div>
                                <div style={styles.statCard}>
                                    <div style={{ ...styles.statValue, color: C.navy }}>{studentData.meraviglie?.length || 0}</div>
                                    <div style={styles.statLabel}>Meraviglie</div>
                                </div>
                            </div>

                            {/* Ultimo mood */}
                            {studentData.moods?.length > 0 && (
                                <div style={styles.section}>
                                    <h3 style={styles.sectionTitle}>Mood recenti</h3>
                                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                        {studentData.moods.slice(-10).map((m, i) => (
                                            <span key={i} style={{
                                                ...styles.weatherChip,
                                                borderColor: MOOD_COLORS[m.mood] || C.border,
                                            }}>
                                                {MOOD_EMOJI[m.mood]} {m.mood}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Meraviglie dello studente */}
                            {studentData.meraviglie?.length > 0 && (
                                <div style={styles.section}>
                                    <h3 style={styles.sectionTitle}>Le sue meraviglie</h3>
                                    {studentData.meraviglie.slice(-10).reverse().map(m => (
                                        <div key={m.id} style={{ padding: '8px 0', borderBottom: `1px solid ${C.border}` }}>
                                            <span style={{ color: m.risolta ? C.lime : C.orange, marginRight: 8 }}>
                                                {m.risolta ? <IconCheck color={C.lime} /> : <IconQuestion color={C.orange} />}
                                            </span>
                                            {m.domanda}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Diario (lettura silenziosa) */}
                            {studentData.diario?.length > 0 && (
                                <div style={styles.section}>
                                    <h3 style={styles.sectionTitle}>Dal suo diario (osservazione silenziosa)</h3>
                                    <p style={{ color: C.textMuted, fontSize: 14, marginBottom: 12, fontStyle: 'italic' }}>
                                        Leggere senza commentare, a meno che non sia invitato. — Montessori
                                    </p>
                                    {studentData.diario.slice(-5).reverse().map(e => (
                                        <div key={e.id} style={{ padding: '10px 0', borderBottom: `1px solid ${C.border}` }}>
                                            <span style={{ fontSize: 14, color: C.textMuted }}>
                                                {new Date(e.timestamp).toLocaleDateString('it-IT', {
                                                    day: 'numeric', month: 'long'
                                                })}
                                            </span>
                                            <p style={{ margin: '4px 0 0', fontSize: 14, lineHeight: 1.5 }}>{e.contenuto}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Difficoltà */}
                            {studentData.difficolta?.length > 0 && (
                                <div style={styles.section}>
                                    <h3 style={styles.sectionTitle}>Difficoltà segnalate</h3>
                                    {studentData.difficolta.slice(-5).reverse().map(d => (
                                        <div key={d.id} style={{ padding: '8px 0', borderBottom: `1px solid ${C.border}` }}>
                                            <span style={{ color: d.risolta ? C.lime : C.red, marginRight: 8 }}>
                                                {d.risolta ? <IconCheck color={C.lime} /> : <IconAlert color={C.red} />}
                                            </span>
                                            {d.descrizione}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <div style={{ ...styles.section, textAlign: 'center', padding: 30 }}>
                            <p style={{ color: C.textMuted }}>Questo studente non ha ancora iniziato ad usare il tutor.</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

// ─── NUDGE ─────────────────────────────────────────────
function NudgeTab({ users, selectedStudent, setSelectedStudent, nudgeText, setNudgeText, handleSendNudge, nudgesSent }) {
    return (
        <div>
            <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Invia un Nudge</h3>
                <p style={{ color: C.textMuted, fontSize: 14, marginBottom: 16 }}>
                    Un nudge è un suggerimento gentile, come un bigliettino piegato.
                    Lo studente può accettarlo o ignorarlo. Non è un compito — è un invito.
                </p>

                <select
                    value={selectedStudent || ''}
                    onChange={e => setSelectedStudent(e.target.value || null)}
                    style={{ ...styles.select, marginBottom: 12 }}
                >
                    <option value="">-- Scegli uno studente --</option>
                    {users.map(u => (
                        <option key={u.id} value={u.id}>{u.nome}</option>
                    ))}
                </select>

                <textarea
                    value={nudgeText}
                    onChange={e => setNudgeText(e.target.value)}
                    placeholder="Hai provato a collegare il tuo buzzer a un sensore di luce? Potrebbe piacerti quello che succede..."
                    style={styles.textarea}
                    rows={3}
                />

                <button
                    onClick={handleSendNudge}
                    disabled={!nudgeText.trim() || !selectedStudent}
                    style={{
                        ...styles.primaryBtn,
                        opacity: (nudgeText.trim() && selectedStudent) ? 1 : 0.5,
                    }}
                >
                    Invia Nudge
                </button>
            </div>

            {/* Nudge inviati */}
            {nudgesSent.length > 0 && (
                <div style={styles.section}>
                    <h3 style={styles.sectionTitle}>Nudge Inviati ({nudgesSent.length})</h3>
                    {[...nudgesSent].reverse().map(n => {
                        const u = users.find(u => u.id === n.studentId);
                        return (
                            <div key={n.id} style={styles.nudgeItem}>
                                <IconNudge size={18} />
                                <div style={{ flex: 1 }}>
                                    <strong style={{ color: C.navy }}>{u?.nome || 'Studente'}</strong>
                                    <p style={{ margin: '4px 0 0', fontSize: 14, fontStyle: 'italic' }}>"{n.testo}"</p>
                                    <span style={{ fontSize: 14, color: C.textMuted }}>
                                        {new Date(n.timestamp).toLocaleDateString('it-IT', {
                                            day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
                                        })}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Nudge suggeriti */}
            <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Idee per Nudge</h3>
                {[
                    'Hai provato a collegare il tuo buzzer a un sensore di luce? Potrebbe piacerti quello che succede.',
                    'Sai che puoi far lampeggiare un LED senza usare delay()? Prova con millis()!',
                    'C\'è un componente misterioso nel tuo workspace. Riesci a scoprire cosa fa?',
                    'Il tuo circuito potrebbe diventare ancora più interessante con un sensore di temperatura.',
                    'Hai mai provato a far "cantare" il tuo circuito? Prova con un buzzer e tone()!',
                ].map((idea, i) => (
                    <div
                        key={i}
                        onClick={() => setNudgeText(idea)}
                        style={styles.nudgeSuggestion}
                    >
                        {idea}
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── DOCUMENTAZIONE ────────────────────────────────────
function DocumentiTab({ users, allData, classReport, formatTempo }) {
    return (
        <div>
            <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Pannelli di Documentazione</h3>
                <p style={{ color: C.textMuted, fontSize: 14, marginBottom: 16 }}>
                    Ispirati a Reggio Emilia: narrazioni del percorso, non valutazioni.
                    Documenti visuali condivisibili con la classe e le famiglie.
                </p>

                {/* Report riassuntivo */}
                <div style={styles.docPanel}>
                    <h4 style={{ margin: '0 0 12px', color: C.navy }}>Report Settimanale della Classe</h4>
                    <div style={{ fontSize: 14, lineHeight: 1.8 }}>
                        <p>La classe ha <strong>{classReport?.totaleStudenti || 0}</strong> studenti attivi.</p>
                        <p>In media hanno completato <strong>{classReport?.mediaEsperimenti || 0}</strong> esperimenti ciascuno.</p>
                        <p>Il tempo medio di utilizzo è <strong>{formatTempo(classReport?.tempoMedioTotale || 0)}</strong>.</p>
                        {classReport?.inattivi?.length > 0 && (
                            <p>Ci sono <strong style={{ color: C.orange }}>{classReport.inattivi.length}</strong> studenti inattivi da più di 7 giorni.</p>
                        )}
                        {classReport?.moodCount && Object.keys(classReport.moodCount).length > 0 && (
                            <p>Il mood prevalente della classe è: <strong style={{ color: C.lime }}>
                                {Object.entries(classReport.moodCount).sort((a, b) => b[1] - a[1])[0]?.[0] || '—'}
                            </strong></p>
                        )}
                    </div>
                </div>

                {/* Dashboard dell'Assenza */}
                <div style={styles.docPanel}>
                    <h4 style={{ margin: '0 0 12px', color: C.navy }}>Dashboard dell'Assenza</h4>
                    <p style={{ color: C.textMuted, fontSize: 14, marginBottom: 12 }}>
                        Non cosa fanno, ma cosa NON sta succedendo.
                    </p>
                    <ul style={{ paddingLeft: 20, fontSize: 14, lineHeight: 1.8 }}>
                        {classReport?.inattivi?.length > 0 && (
                            <li><strong>{classReport.inattivi.length}</strong> studenti non si connettono da 7+ giorni</li>
                        )}
                        {classReport?.esperimentiCount && Object.keys(classReport.esperimentiCount).length < 5 && (
                            <li>Solo <strong>{Object.keys(classReport.esperimentiCount).length}</strong> esperimenti diversi sono stati provati</li>
                        )}
                        <li style={{ color: C.textMuted, fontStyle: 'italic' }}>
                            Questo è un segnale, non un giudizio. Decidi tu se agire o osservare.
                        </li>
                    </ul>
                </div>
            </div>

            {/* Nessun voto — Filosofia */}
            <div style={{ ...styles.section, background: C.limeSoft, border: `2px solid ${C.lime}` }}>
                <h3 style={{ ...styles.sectionTitle, color: C.limeDark }}>Filosofia della Serra</h3>
                <p style={{ fontSize: 14, lineHeight: 1.8, color: C.text }}>
                    Questa dashboard non genera pagelle. Non classifica i ragazzi. Non calcola medie.
                    Mostra percorsi individuali, pattern di gruppo, e la salute dell'ecosistema.
                </p>
                <p style={{ fontSize: 14, lineHeight: 1.8, color: C.text, fontStyle: 'italic' }}>
                    "Il giardiniere crea un ecosistema ricco e diversificato dove molti tipi di piante
                    possono fiorire. Non cerca di scolpire ogni pianta in una forma predeterminata."
                    — Alison Gopnik
                </p>
            </div>
        </div>
    );
}

// ─── LE MIE CLASSI (Sprint 1 Session 30) ──────────────
function ClassiTab() {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newClassName, setNewClassName] = useState('');
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const fetchClasses = useCallback(async () => {
        setLoading(true);
        const result = await listClasses();
        if (result.success) {
            setClasses(result.classes || []);
        } else {
            setError(result.error || 'Errore nel caricamento delle classi.');
        }
        setLoading(false);
    }, []);

    useEffect(() => { fetchClasses(); }, [fetchClasses]);

    const handleCreate = async () => {
        if (!newClassName.trim()) return;
        setCreating(true);
        setError('');
        setSuccess('');
        const result = await createClass(newClassName.trim());
        if (result.success) {
            setSuccess(`Classe "${result.className}" creata! Codice: ${result.classCode}`);
            setNewClassName('');
            fetchClasses();
        } else {
            setError(result.error || 'Errore nella creazione.');
        }
        setCreating(false);
    };

    const handleRemoveStudent = async (classId, studentId, studentName) => {
        if (!await confirmModal(`Rimuovere ${studentName || 'lo studente'} dalla classe?`)) return;
        const result = await removeStudent(classId, studentId);
        if (result.success) {
            setSuccess('Studente rimosso.');
            fetchClasses();
        } else {
            setError(result.error || 'Errore nella rimozione.');
        }
    };

    return (
        <div>
            {/* Crea nuova classe */}
            <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Crea una nuova classe</h3>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <input
                        type="text"
                        value={newClassName}
                        onChange={e => setNewClassName(e.target.value)}
                        placeholder="Nome della classe (es. 3A Informatica)"
                        style={{ ...styles.searchInput, marginBottom: 0, flex: 1 }}
                        onKeyDown={e => e.key === 'Enter' && handleCreate()}
                    />
                    <button
                        onClick={handleCreate}
                        disabled={creating || !newClassName.trim()}
                        style={{
                            ...styles.primaryBtn,
                            marginTop: 0,
                            opacity: creating || !newClassName.trim() ? 0.5 : 1,
                        }}
                    >
                        {creating ? '...' : '+ Crea'}
                    </button>
                </div>
                {error && (
                    <p style={{ color: C.red, fontSize: 14, marginTop: 8, marginBottom: 0 }}>{error}</p>
                )}
                {success && (
                    <p style={{ color: C.lime, fontSize: 14, marginTop: 8, marginBottom: 0, fontWeight: 600 }}>{success}</p>
                )}
            </div>

            {/* Elenco classi */}
            <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Le tue classi</h3>
                {loading ? (
                    <p style={{ color: C.textMuted, fontSize: 14 }}>Caricamento...</p>
                ) : classes.length === 0 ? (
                    <div style={{
                        padding: '24px 20px',
                        background: 'linear-gradient(135deg, #F0F7FF 0%, #E8F4D9 100%)',
                        borderRadius: 16,
                        border: `2px dashed ${C.lime}`,
                    }}>
                        <h3 style={{
                            color: C.navy, fontSize: 20, fontWeight: 700, margin: '0 0 8px',
                            fontFamily: 'Oswald, sans-serif',
                        }}>
                            Benvenuto nella tua Area Docente!
                        </h3>
                        <p style={{ color: C.textMuted, fontSize: 15, margin: '0 0 20px', lineHeight: 1.6 }}>
                            Configura la tua classe in 3 semplici passi. Non serve nessuna esperienza tecnica!
                        </p>
                        {[
                            { step: '1', emoji: '\u270F\uFE0F', title: 'Crea la tua classe', text: 'Scrivi il nome della classe nel campo qui sopra e premi "Crea"' },
                            { step: '2', emoji: '\uD83D\uDCE2', title: 'Condividi il codice', text: 'Verrà generato un codice. Dettalo ai tuoi studenti, loro lo inseriranno al momento della registrazione' },
                            { step: '3', emoji: '\uD83C\uDFAE', title: 'Attiva i giochi', text: 'Scegli quali giochi rendere disponibili per la classe. Puoi cambiarli in qualsiasi momento' },
                        ].map(s => (
                            <div key={s.step} style={{
                                display: 'flex', alignItems: 'flex-start', gap: 14,
                                padding: '14px 16px', marginBottom: 10,
                                background: 'white', borderRadius: 12,
                                borderLeft: `4px solid ${C.lime}`,
                                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                            }}>
                                <span style={{
                                    fontSize: 28, lineHeight: '1',
                                    minWidth: 36, textAlign: 'center',
                                }}>{s.emoji}</span>
                                <div>
                                    <div style={{ fontSize: 16, fontWeight: 700, color: C.navy, marginBottom: 2 }}>
                                        Passo {s.step}: {s.title}
                                    </div>
                                    <div style={{ fontSize: 14, color: C.textMuted, lineHeight: 1.5 }}>
                                        {s.text}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {classes.map(cls => (
                            <ClassCard
                                key={cls.id}
                                cls={cls}
                                onRemoveStudent={handleRemoveStudent}
                                onUpdateGames={async (classId, games) => {
                                    const result = await updateClassGames(classId, games);
                                    if (result.success) fetchClasses();
                                    return result;
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

const ALL_GAMES = [
    { key: 'CircuitDetective', label: 'Circuit Detective', icon: <IconDetective /> },
    { key: 'PredictObserveExplain', label: 'Predict-Observe-Explain', icon: <IconPredict /> },
    { key: 'ReverseEngineering', label: 'Reverse Engineering', icon: <IconReverse /> },
    { key: 'CircuitReview', label: 'Circuit Review', icon: <IconReview /> },
];

function ClassCard({ cls, onRemoveStudent, onUpdateGames }) {
    const [expanded, setExpanded] = useState(false);
    const [saving, setSaving] = useState(false);

    const activeSet = new Set(cls.gamesActive || []);

    const handleToggleGame = async (gameKey) => {
        if (saving || !onUpdateGames) return;
        const newGames = activeSet.has(gameKey)
            ? [...activeSet].filter(g => g !== gameKey)
            : [...activeSet, gameKey];
        setSaving(true);
        await onUpdateGames(cls.id, newGames);
        setSaving(false);
    };

    return (
        <div style={{
            background: C.white,
            border: `1px solid ${cls.active ? C.lime : C.border}`,
            borderRadius: 12,
            padding: 16,
            borderLeft: `4px solid ${cls.active ? C.lime : C.textMuted}`,
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                <div>
                    <h4 style={{ margin: 0, fontSize: 16, color: C.navy, fontFamily: 'Oswald, sans-serif' }}>
                        {cls.name}
                    </h4>
                    <div style={{ display: 'flex', gap: 12, marginTop: 4, flexWrap: 'wrap' }}>
                        <span
                            style={{ fontSize: 14, color: C.textMuted, cursor: 'pointer' }}
                            title="Clicca per copiare il codice classe"
                            onClick={() => {
                                navigator.clipboard?.writeText(cls.classCode);
                            }}
                        >
                            Codice: <strong style={{ color: C.navy, fontFamily: 'monospace', letterSpacing: 1 }}>{cls.classCode}</strong> <span style={{ fontSize: 14, color: C.textMuted }}>(Copia)</span>
                        </span>
                        <span style={{ fontSize: 14, color: C.textMuted }}>
                            {cls.studentCount} {cls.studentCount === 1 ? 'studente' : 'studenti'}
                        </span>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    {cls.volumes?.map(v => (
                        <span key={v} style={{
                            fontSize: 14, padding: '2px 8px', borderRadius: 6,
                            background: v === 'Volume 1' ? '#7CB34222' : v === 'Volume 2' ? '#E8941C22' : '#E54B3D22',
                            color: v === 'Volume 1' ? '#7CB342' : v === 'Volume 2' ? '#E8941C' : '#E54B3D',
                            fontWeight: 600,
                        }}>
                            {v}
                        </span>
                    ))}
                    <span style={{
                        fontSize: 14, padding: '2px 8px', borderRadius: 6,
                        background: cls.active ? '#7CB34222' : '#E5393522',
                        color: cls.active ? '#7CB342' : '#E53935',
                        fontWeight: 600,
                    }}>
                        {cls.active ? 'Attiva' : 'Disattivata'}
                    </span>
                </div>
            </div>

            {/* Sprint 3: Game toggles */}
            <div style={{ marginTop: 12, padding: '10px 12px', background: '#F8FAFC', borderRadius: 8 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.navy, marginBottom: 8 }}
                    title="Attiva o disattiva i giochi che i tuoi studenti possono vedere nella sidebar"
                >
                    Giochi attivi per la classe
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {ALL_GAMES.map(game => {
                        const isActive = activeSet.has(game.key);
                        return (
                            <label key={game.key} style={{
                                display: 'flex', alignItems: 'center', gap: 10,
                                cursor: saving ? 'wait' : 'pointer',
                                opacity: saving ? 0.6 : 1,
                                fontSize: 14,
                            }}>
                                <div
                                    onClick={() => handleToggleGame(game.key)}
                                    style={{
                                        width: 36, height: 20, borderRadius: 10,
                                        background: isActive ? C.lime : '#CBD5E1',
                                        position: 'relative',
                                        transition: 'background 0.2s',
                                        flexShrink: 0,
                                    }}
                                >
                                    <div style={{
                                        width: 16, height: 16, borderRadius: '50%',
                                        background: C.white,
                                        position: 'absolute', top: 2,
                                        left: isActive ? 18 : 2,
                                        transition: 'left 0.2s',
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                                    }} />
                                </div>
                                <span style={{ color: isActive ? C.navy : C.textMuted }}>
                                    {game.icon} {game.label}
                                </span>
                            </label>
                        );
                    })}
                </div>
            </div>

            {cls.studentCount > 0 && (
                <button
                    onClick={() => setExpanded(!expanded)}
                    style={{
                        background: 'none', border: 'none', color: C.navy,
                        cursor: 'pointer', fontSize: 14, padding: '8px 0 0', fontWeight: 500,
                    }}
                >
                    {expanded ? '▼ Nascondi studenti' : '▶ Mostra studenti'}
                </button>
            )}

            {expanded && (
                <div style={{ marginTop: 8, fontSize: 14, color: C.textMuted }}>
                    <p>La lista studenti è disponibile nelle altre tab della dashboard (Giardino, Attività, ecc.).</p>
                    <p style={{ fontSize: 14 }}>
                        Per rimuovere uno studente, usa la funzione dedicata quando il backend sarà collegato
                        alla lista studenti della classe.
                    </p>
                </div>
            )}
            {/* S99: Custom confirmation modal */}
            <ConfirmDialog />
        </div>
    );
}

// © Andrea Marro — 20/02/2026

// ─── STILI ─────────────────────────────────────────────
const styles = {
    container: {
        maxWidth: 1000,
        margin: '0 auto',
        padding: '24px 16px',
        fontFamily: 'Open Sans, -apple-system, sans-serif',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '24px 28px',
        background: `linear-gradient(135deg, ${C.navy}, ${C.navyDark})`,
        borderRadius: 16,
        marginBottom: 20,
        flexWrap: 'wrap',
        gap: 16,
    },
    headerLeft: { display: 'flex', alignItems: 'center', gap: 16 },
    headerTitle: { color: C.white, margin: 0, fontSize: 22, fontWeight: 700, fontFamily: 'Oswald, sans-serif' },
    headerSubtitle: { color: C.limeLight, margin: '4px 0 0', fontSize: 14 },
    tabBar: {
        display: 'flex', gap: 6, marginBottom: 24,
        overflowX: 'auto', paddingBottom: 4,
        WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none',
    },
    tab: {
        border: 'none', padding: '10px 16px', borderRadius: 10,
        cursor: 'pointer', fontSize: 14, fontWeight: 600,
        whiteSpace: 'nowrap', transition: 'all 0.2s',
        flexShrink: 0, minHeight: 44,
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
    searchInput: {
        width: '100%', padding: '10px 14px', border: `1px solid ${C.border}`,
        borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box',
        marginBottom: 16,
    },
    gardenGrid: {
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
        gap: 12,
    },
    gardenPlant: {
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: 16, borderRadius: 12, background: 'rgba(31,61,133,0.03)',
        border: `1px solid ${C.border}`, cursor: 'pointer',
        transition: 'all 0.2s', textAlign: 'center',
        position: 'relative',
    },
    plantName: { fontSize: 14, fontWeight: 600, color: C.navy, marginTop: 6 },
    plantMood: { position: 'absolute', top: 8, right: 8, fontSize: 14 },
    plantStats: {
        display: 'flex', gap: 8, fontSize: 14, color: C.textMuted, marginTop: 6,
    },
    statGrid: {
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
        gap: 12, marginBottom: 16,
    },
    statCard: {
        background: C.white, borderRadius: 12, padding: 16,
        textAlign: 'center', border: `1px solid ${C.border}`,
    },
    statValue: { fontSize: 24, fontWeight: 800, fontFamily: 'Oswald, sans-serif', margin: '4px 0' },
    statLabel: { fontSize: 14, color: C.textMuted, fontWeight: 600 },
    weatherRow: {
        display: 'flex', alignItems: 'center', flexWrap: 'wrap',
        padding: '12px 0', gap: 8,
    },
    weatherChip: {
        padding: '4px 12px', borderRadius: 20, fontSize: 14,
        border: `2px solid ${C.border}`, fontWeight: 500,
    },
    fogRow: {
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 0', borderBottom: `1px solid ${C.border}`,
        position: 'relative',
    },
    confusionBar: {
        height: 6, borderRadius: 3, transition: 'width 0.3s',
        position: 'absolute', bottom: 0, left: 0,
    },
    inactiveBadge: {
        padding: '6px 12px', borderRadius: 8, fontSize: 14,
        background: 'rgba(245,166,35,0.1)', color: C.orange,
        fontWeight: 500,
    },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: 14 },
    th: {
        padding: '10px 12px', textAlign: 'left', fontWeight: 700,
        color: C.navy, borderBottom: `2px solid ${C.navy}`, fontSize: 14,
    },
    td: { padding: '10px 12px', borderBottom: `1px solid ${C.border}` },
    trEven: { background: 'rgba(31,61,133,0.02)' },
    popularRow: {
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '8px 0',
    },
    popularBar: {
        width: 100, height: 8, background: C.border,
        borderRadius: 4, overflow: 'hidden',
    },
    select: {
        width: '100%', padding: '10px 14px', border: `1px solid ${C.border}`,
        borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box',
        background: C.white,
    },
    studentHeader: {
        display: 'flex', alignItems: 'center', gap: 16,
        padding: '20px 24px', background: `linear-gradient(135deg, ${C.navy}, ${C.navyDark})`,
        borderRadius: 12, marginBottom: 16,
    },
    studentAvatar: {
        width: 48, height: 48, borderRadius: '50%',
        background: `linear-gradient(135deg, ${C.lime}, ${C.limeDark})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: C.white, fontWeight: 700, overflow: 'hidden', flexShrink: 0,
    },
    textarea: {
        width: '100%', padding: '12px 14px', border: `1px solid ${C.border}`,
        borderRadius: 8, fontSize: 14, fontFamily: 'Open Sans, sans-serif',
        outline: 'none', resize: 'vertical', boxSizing: 'border-box',
    },
    primaryBtn: {
        background: `linear-gradient(135deg, ${C.lime}, ${C.limeDark})`,
        border: 'none', color: C.white, padding: '10px 20px',
        borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600,
        marginTop: 8,
    },
    nudgeItem: {
        display: 'flex', gap: 12, padding: '14px 0',
        borderBottom: `1px solid ${C.border}`,
    },
    nudgeSuggestion: {
        padding: '10px 12px', borderRadius: 8, fontSize: 14,
        cursor: 'pointer', transition: 'background 0.2s',
        borderBottom: `1px solid ${C.border}`,
    },
    docPanel: {
        padding: 20, borderRadius: 12,
        background: 'rgba(31,61,133,0.03)',
        border: `1px solid ${C.border}`,
        marginBottom: 12,
    },
};
