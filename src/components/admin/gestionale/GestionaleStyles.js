// © Andrea Marro — 13 Febbraio 2026 — Tutti i diritti riservati.
// ============================================
// ELAB Gestionale - Design System Corporate
// Palette professionale per ERP aziendale
// ============================================

export const COLORS = {
    primary: '#0F172A',
    primaryLight: '#1E293B',
    primaryHover: '#334155',
    accent: '#1E4D8C',
    accentLight: '#2563EB',
    accentBg: '#EFF6FF',
    success: '#059669',
    successBg: '#ECFDF5',
    warning: '#D97706',
    warningBg: '#FFFBEB',
    danger: '#DC2626',
    dangerBg: '#FEF2F2',
    info: '#0891B2',
    infoBg: '#ECFEFF',
    bg: '#F8FAFC',
    card: '#FFFFFF',
    border: '#E2E8F0',
    borderLight: '#F1F5F9',
    textPrimary: '#0F172A',
    textSecondary: '#475569',
    textMuted: '#64748B',
    textWhite: '#FFFFFF',
};

export const MODULES = [
    { id: 'dashboard', label: 'Dashboard', icon: '', color: COLORS.accent },
    { id: 'fatture', label: 'Fatturazione', icon: '', color: '#7C3AED' },
    { id: 'ordini', label: 'Ordini & Vendite', icon: '', color: '#2563EB' },
    { id: 'magazzino', label: 'Magazzino & Kit', icon: '', color: '#D97706' },
    { id: 'dipendenti', label: 'Dipendenti', icon: '', color: '#059669' },
    { id: 'finanze', label: 'Banche & Finanze', icon: '', color: '#0891B2' },
    { id: 'documenti', label: 'Burocrazia', icon: '', color: '#DC2626' },
    { id: 'marketing', label: 'Marketing & Clienti', icon: '', color: '#EC4899' },
    { id: 'report', label: 'Report', icon: '', color: '#7C3AED' },
    { id: 'impostazioni', label: 'Impostazioni', icon: '', color: '#64748B' },
];

export const STATUS_COLORS = {
    bozza: { bg: '#F1F5F9', text: '#475569', label: 'Bozza' },
    emessa: { bg: '#DBEAFE', text: '#1D4ED8', label: 'Emessa' },
    inviata: { bg: '#FEF3C7', text: '#B45309', label: 'Inviata' },
    pagata: { bg: '#D1FAE5', text: '#065F46', label: 'Pagata' },
    scaduta: { bg: '#FEE2E2', text: '#991B1B', label: 'Scaduta' },
    annullata: { bg: '#F1F5F9', text: '#64748B', label: 'Annullata' },
    confermato: { bg: '#DBEAFE', text: '#1D4ED8', label: 'Confermato' },
    in_lavorazione: { bg: '#FEF3C7', text: '#B45309', label: 'In Lavorazione' },
    spedito: { bg: '#E0E7FF', text: '#4338CA', label: 'Spedito' },
    consegnato: { bg: '#D1FAE5', text: '#065F46', label: 'Consegnato' },
    attivo: { bg: '#D1FAE5', text: '#065F46', label: 'Attivo' },
    in_ferie: { bg: '#FEF3C7', text: '#B45309', label: 'In Ferie' },
    malattia: { bg: '#FEE2E2', text: '#991B1B', label: 'Malattia' },
    cessato: { bg: '#F1F5F9', text: '#64748B', label: 'Cessato' },
    pianificata: { bg: '#E0E7FF', text: '#4338CA', label: 'Pianificata' },
    in_corso: { bg: '#FEF3C7', text: '#B45309', label: 'In Corso' },
    completata: { bg: '#D1FAE5', text: '#065F46', label: 'Completata' },
    sospesa: { bg: '#FEE2E2', text: '#991B1B', label: 'Sospesa' },
    valido: { bg: '#D1FAE5', text: '#065F46', label: 'Valido' },
    in_scadenza: { bg: '#FEF3C7', text: '#B45309', label: 'In Scadenza' },
    scaduto: { bg: '#FEE2E2', text: '#991B1B', label: 'Scaduto' },
    archiviato: { bg: '#F1F5F9', text: '#64748B', label: 'Archiviato' },
    da_elaborare: { bg: '#F1F5F9', text: '#475569', label: 'Da Elaborare' },
    elaborata: { bg: '#DBEAFE', text: '#1D4ED8', label: 'Elaborata' },
    entrata: { bg: '#D1FAE5', text: '#065F46', label: 'Entrata' },
    uscita: { bg: '#FEE2E2', text: '#991B1B', label: 'Uscita' },
    // SDI - Fatturazione Elettronica
    xml_generato: { bg: '#DBEAFE', text: '#1D4ED8', label: 'XML Generato' },
    firmato: { bg: '#E0E7FF', text: '#4338CA', label: 'Firmato' },
    inviato_sdi: { bg: '#FEF3C7', text: '#B45309', label: 'Inviato SDI' },
    accettato_sdi: { bg: '#D1FAE5', text: '#065F46', label: 'Accettato SDI' },
    rifiutato_sdi: { bg: '#FEE2E2', text: '#991B1B', label: 'Rifiutato SDI' },
};

export function getStatusStyle(stato) {
    const s = STATUS_COLORS[stato];
    if (!s) return { background: '#F1F5F9', color: '#475569' };
    return { background: s.bg, color: s.text, padding: '3px 10px', borderRadius: '12px', fontSize: '14px', fontWeight: '600', display: 'inline-block', textTransform: 'capitalize' };
}

export function getStatusLabel(stato) {
    return STATUS_COLORS[stato]?.label || stato;
}

// Stili riutilizzabili
export const S = {
    pageHeader: {
        marginBottom: '20px',
    },
    pageTitle: {
        fontSize: '20px', fontWeight: '700', color: COLORS.textPrimary, margin: '0 0 4px',
    },
    pageSubtitle: {
        fontSize: '14px', color: COLORS.textSecondary, margin: 0,
    },
    card: {
        background: COLORS.card, borderRadius: '10px', border: `1px solid ${COLORS.border}`,
        padding: '20px', marginBottom: '16px',
    },
    cardCompact: {
        background: COLORS.card, borderRadius: '8px', border: `1px solid ${COLORS.border}`,
        padding: '14px',
    },
    toolbar: {
        display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', flexWrap: 'wrap',
    },
    searchInput: {
        flex: 1, minWidth: '180px', padding: '9px 14px', border: `1px solid ${COLORS.border}`,
        borderRadius: '8px', fontSize: '14px', outline: 'none', background: COLORS.card,
    },
    select: {
        padding: '9px 12px', border: `1px solid ${COLORS.border}`, borderRadius: '8px',
        fontSize: '14px', background: COLORS.card, cursor: 'pointer', outline: 'none',
    },
    btnPrimary: {
        padding: '9px 18px', background: COLORS.accent, color: '#fff', border: 'none',
        borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer',
        transition: 'all 0.15s',
    },
    btnSecondary: {
        padding: '9px 18px', background: COLORS.bg, color: COLORS.textPrimary,
        border: `1px solid ${COLORS.border}`, borderRadius: '8px', fontSize: '14px',
        fontWeight: '500', cursor: 'pointer', transition: 'all 0.15s',
    },
    btnDanger: {
        padding: '9px 18px', background: COLORS.danger, color: '#fff', border: 'none',
        borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer',
    },
    btnSuccess: {
        padding: '9px 18px', background: COLORS.success, color: '#fff', border: 'none',
        borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer',
    },
    btnSmall: {
        padding: '5px 12px', fontSize: '14px', border: 'none', borderRadius: '6px',
        cursor: 'pointer', fontWeight: '500',
    },
    input: {
        width: '100%', padding: '9px 12px', border: `1px solid ${COLORS.border}`,
        borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
    },
    label: {
        fontSize: '14px', fontWeight: '600', color: COLORS.textSecondary, marginBottom: '4px',
        display: 'block', textTransform: 'uppercase', letterSpacing: '0.3px',
    },
    formGroup: {
        marginBottom: '14px',
    },
    formGrid: (isMobile) => ({
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: '14px',
    }),
    table: {
        width: '100%', borderCollapse: 'separate', borderSpacing: 0,
    },
    th: {
        padding: '10px 14px', background: COLORS.bg, color: COLORS.textSecondary,
        fontSize: '14px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px',
        textAlign: 'left', borderBottom: `2px solid ${COLORS.border}`,
        position: 'sticky', top: 0, zIndex: 1,
    },
    td: {
        padding: '10px 14px', fontSize: '14px', color: COLORS.textPrimary,
        borderBottom: `1px solid ${COLORS.borderLight}`,
    },
    emptyState: {
        textAlign: 'center', padding: '40px 20px', color: COLORS.textMuted,
    },
    emptyIcon: {
        fontSize: '40px', marginBottom: '12px',
    },
    emptyText: {
        fontSize: '14px', marginBottom: '8px',
    },
    divider: {
        height: '1px', background: COLORS.border, margin: '20px 0',
    },
    badge: (color) => ({
        display: 'inline-block', padding: '2px 8px', borderRadius: '10px',
        fontSize: '14px', fontWeight: '600', background: color + '20', color: color,
    }),
    alertBox: (type) => {
        const map = {
            danger: { bg: COLORS.dangerBg, border: COLORS.danger, icon: '' },
            warning: { bg: COLORS.warningBg, border: COLORS.warning, icon: '' },
            success: { bg: COLORS.successBg, border: COLORS.success, icon: '' },
            info: { bg: COLORS.infoBg, border: COLORS.info, icon: '' },
        };
        const m = map[type] || map.info;
        return {
            background: m.bg, borderLeft: `4px solid ${m.border}`,
            padding: '12px 16px', borderRadius: '0 8px 8px 0', marginBottom: '12px',
            fontSize: '14px', color: COLORS.textPrimary,
        };
    },
// © Andrea Marro — 14/04/2026 — ELAB Tutor — Tutti i diritti riservati
    modal: {
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
        justifyContent: 'center', zIndex: 9999, padding: '20px',
    },
    modalContent: (isMobile) => ({
        background: COLORS.card, borderRadius: '12px', padding: '24px',
        width: isMobile ? '100%' : '600px', maxWidth: '90vw', maxHeight: '85vh',
        overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    }),
    modalTitle: {
        fontSize: '18px', fontWeight: '700', color: COLORS.textPrimary,
        margin: '0 0 16px', paddingBottom: '12px', borderBottom: `1px solid ${COLORS.border}`,
    },
    modalActions: {
        display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px',
        paddingTop: '16px', borderTop: `1px solid ${COLORS.border}`,
    },
};
