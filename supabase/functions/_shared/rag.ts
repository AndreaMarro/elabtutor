/**
 * Nanobot V2 — RAG (Retrieval Augmented Generation)
 * Searches the ELAB knowledge base to find relevant experiment context.
 * Dual-mode: pgvector semantic search (246 volume chunks) + keyword fallback (62 experiment chunks).
 * Enhanced scoring with synonym expansion and concept matching.
 * (c) Andrea Marro — 02/04/2026
 */

import knowledgeBase from '../knowledge-base.json' with { type: 'json' };

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY') || '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

interface KnowledgeChunk {
  id: string;
  volume: number;
  chapter: string;
  title: string;
  content: string;
  token_estimate: number;
}

const chunks: KnowledgeChunk[] = knowledgeBase as KnowledgeChunk[];

// Italian stop words to skip (common words that dilute scores)
const STOP_WORDS = new Set([
  'come', 'cosa', 'sono', 'essere', 'fare', 'avere', 'questo', 'quello',
  'dove', 'quando', 'perché', 'anche', 'ancora', 'solo', 'sempre', 'molto',
  'ogni', 'tutti', 'tutto', 'proprio', 'così', 'dopo', 'prima', 'senza',
  'con', 'per', 'che', 'non', 'una', 'uno', 'del', 'nel', 'sul', 'alla',
  'della', 'dalla', 'nella', 'sulla', 'dei', 'degli', 'alle', 'delle',
  'può', 'deve', 'voglio', 'vorrei', 'puoi', 'dimmi', 'aiuto',
]);

// ─── Synonym map: kid/casual Italian → technical terms in chunks ───
// 80+ entries covering: components, actions, concepts, errors, slang
const SYNONYM_MAP: Record<string, string[]> = {
  // ── LED & Lights ──
  'lampadina': ['led', 'diodo', 'luminosità'],
  'lucina': ['led', 'diodo'],
  'lucetta': ['led', 'diodo'],
  'luce': ['led', 'luminosità', 'accende', 'diodo'],
  'luminoso': ['led', 'luminosità', 'brightness'],
  'lampeggia': ['blink', 'lampeggio', 'intermittente', 'led'],
  'lampeggiare': ['blink', 'lampeggio', 'delay'],
  'brillare': ['led', 'luminosità', 'accende'],
  'cosino rosso': ['led', 'diodo'],
  'cosino verde': ['led', 'rgb'],

  // ── Buttons & Interaction ──
  'bottone': ['pulsante', 'push-button', 'button', 'digitalread'],
  'premere': ['pulsante', 'press', 'digitalread'],
  'schiacciare': ['pulsante', 'press', 'button'],
  'cliccare': ['pulsante', 'press'],
  'tasto': ['pulsante', 'button', 'push-button'],

  // ── Controls & Knobs ──
  'manopola': ['potenziometro', 'pot', 'analogread'],
  'girare': ['potenziometro', 'rotazione', 'analogread'],
  'ruotare': ['potenziometro', 'servo', 'rotazione'],
  'regolare': ['potenziometro', 'pwm', 'analogwrite'],
  'cursore': ['potenziometro', 'slider'],

  // ── Wires & Connections ──
  'filo': ['wire', 'connessione', 'collega', 'cavo'],
  'cavo': ['wire', 'filo', 'connessione'],
  'collegare': ['collega', 'connessione', 'wire'],
  'attaccare': ['collega', 'connessione', 'inserire'],
  'staccare': ['scollega', 'disconnetti', 'rimuovi'],
  'inserire': ['collega', 'breadboard', 'foro'],
  'connettere': ['collega', 'connessione', 'wire'],
  'ponticello': ['wire', 'jumper', 'filo'],
  'jumper': ['wire', 'filo', 'ponticello'],

  // ── Electrical Concepts ──
  'corrente': ['ampere', 'ohm', 'tensione', 'voltaggio', 'flusso'],
  'voltaggio': ['tensione', 'volt', 'batteria', 'alimentazione'],
  'tensione': ['volt', 'voltaggio', 'alimentazione', 'ddp'],
  'energia': ['corrente', 'tensione', 'potenza', 'watt'],
  'elettricità': ['corrente', 'tensione', 'circuito', 'elettroni'],
  'potenza': ['watt', 'corrente', 'tensione'],
  'frequenza': ['hertz', 'pwm', 'oscillazione'],

  // ── Power Supply ──
  'pila': ['batteria', '9v', 'alimentazione', 'tensione'],
  'batteria': ['alimentazione', '9v', 'tensione', 'pila'],
  'alimentazione': ['batteria', '9v', 'usb', '5v'],
  'carica': ['batteria', 'condensatore', 'energia'],
  'scarica': ['condensatore', 'batteria', 'energia'],

  // ── Board / Arduino ──
  'scheda': ['arduino', 'nano', 'board', 'microcontrollore'],
  'programma': ['codice', 'sketch', 'blink', 'compile', 'upload'],
  'programmazione': ['codice', 'sketch', 'arduino', 'ide'],
  'arduino': ['nano', 'board', 'microcontrollore', 'atmega'],
  'computer': ['arduino', 'microcontrollore', 'processore'],
  'cervello': ['arduino', 'microcontrollore', 'processore'],
  'caricare': ['upload', 'compile', 'sketch', 'hex'],
  'compilare': ['compile', 'errore', 'codice', 'sketch'],
  'scrivere': ['codice', 'sketch', 'programma'],

  // ── Sound ──
  'suono': ['buzzer', 'piezo', 'tone', 'frequenza'],
  'bip': ['buzzer', 'piezo', 'tone'],
  'rumorino': ['buzzer', 'piezo'],
  'musica': ['buzzer', 'tone', 'frequenza', 'melodia'],
  'nota': ['tone', 'frequenza', 'buzzer'],
  'volume': ['pwm', 'analogwrite', 'loudness'],

  // ── Sensors ──
  'sensore': ['ldr', 'fotoresistenza', 'fotoresistore', 'analogread'],
  'misurare': ['analogread', 'sensore', 'multimetro', 'valore'],
  'leggere': ['digitalread', 'analogread', 'sensore', 'input'],
  'luminosità': ['ldr', 'fotoresistenza', 'analogread'],
  'buio': ['ldr', 'fotoresistenza', 'bassa luminosità'],
  'temperatura': ['sensore', 'ntc', 'termometro'],

  // ── Motors ──
  'motore': ['servo', 'motor', 'dc', 'pwm'],
  'motorino': ['motor', 'dc', 'servo'],
  'ventola': ['motor', 'dc', 'fan'],
  'muovere': ['servo', 'motor', 'angolo', 'rotazione'],
  'braccio': ['servo', 'angolo', 'gradi'],

  // ── Display ──
  'schermo': ['lcd', 'display', '16x2', 'liquidcrystal'],
  'scrivere': ['lcd', 'print', 'display', 'testo'],
  'messaggio': ['lcd', 'serial', 'print', 'testo'],
  'testo': ['lcd', 'print', 'display', 'serial'],

  // ── Colors ──
  'colore': ['rgb', 'rosso', 'verde', 'blu', 'led'],
  'giallo': ['colore', 'rgb', 'led'],
  'bianco': ['colore', 'rgb', 'led'],
  'arancione': ['colore', 'rgb', 'led'],
  'viola': ['colore', 'rgb', 'led'],
  'mescolare': ['rgb', 'colore', 'analogwrite', 'pwm'],

  // ── Components (general) ──
  'resistenza': ['resistore', 'ohm', 'banda', 'colore'],
  'condensatore': ['capacità', 'carica', 'scarica', 'farad'],
  'diodo': ['led', 'anodo', 'catodo', 'polarità'],
  'transistor': ['mosfet', 'amplificatore', 'interruttore', 'base'],
  'relè': ['interruttore', 'bobina', 'contatto'],
  'componente': ['resistore', 'led', 'condensatore', 'breadboard'],
  'pezzo': ['componente', 'resistore', 'led', 'filo'],
  'cosa': ['componente', 'pezzo'],

  // ── Breadboard ──
  'buco': ['breadboard', 'foro', 'riga', 'colonna'],
  'foro': ['breadboard', 'buco', 'pin', 'inserire'],
  'riga': ['breadboard', 'bus', 'connessione'],
  'tavoletta': ['breadboard', 'basetta'],
  'basetta': ['breadboard', 'pcb'],
  'piastra': ['breadboard', 'basetta'],

  // ── States & Problems ──
  'accendere': ['accende', 'acceso', 'accendi', 'on'],
  'accendo': ['accende', 'acceso', 'led', 'on'],
  'spegnere': ['spegne', 'spento', 'spegni', 'off'],
  'rompere': ['bruciato', 'danneggiato', 'rotto', 'guasto'],
  'bruciat': ['bruciato', 'danneggiato', 'rotto'],
  'bruciare': ['bruciato', 'sovraccarico', 'senza resistenza'],
  'funziona': ['errore', 'problema', 'sbagliato', 'circuito'],
  'sbagliato': ['errore', 'problema', 'invertito', 'polarità'],
  'errore': ['problema', 'sbagliato', 'debug', 'compilazione'],
  'problema': ['errore', 'guasto', 'non funziona', 'debug'],
  'aiuto': ['errore', 'problema', 'come', 'spiegare'],
  'capisco': ['spiegare', 'come', 'perché', 'funziona'],

  // ── Circuit Concepts ──
  'circuito': ['schema', 'breadboard', 'collegamento', 'percorso'],
  'serie': ['collegamento', 'sequenza', 'uno dopo altro'],
  'parallelo': ['collegamento', 'fianco', 'derivazione'],
  'aperto': ['interrotto', 'scollegato', 'non chiuso'],
  'chiuso': ['collegato', 'completo', 'funzionante'],

  // ── Polarity ──
  'polarità': ['anodo', 'catodo', 'verso', 'positivo', 'negativo'],
  'positivo': ['anodo', 'più', 'vcc', '5v', '9v'],
  'negativo': ['catodo', 'meno', 'gnd', 'massa'],
  'massa': ['gnd', 'ground', 'negativo', '0v'],
  'verso': ['polarità', 'anodo', 'catodo', 'direzione'],
  'piedino': ['pin', 'anodo', 'catodo', 'gamba'],
  'gamba': ['pin', 'piedino', 'terminale'],
  'lungo': ['anodo', 'positivo', 'piedino lungo'],
  'corto': ['catodo', 'negativo', 'piedino corto'],

  // ── Arduino I/O ──
  'pin': ['digitalread', 'digitalwrite', 'analogread', 'analogwrite'],
  'digitale': ['digitalread', 'digitalwrite', 'high', 'low'],
  'analogico': ['analogread', 'analogwrite', 'pwm', 'adc'],
  'pwm': ['analogwrite', 'duty cycle', 'modulazione', 'dimmer'],
  'output': ['digitalwrite', 'analogwrite', 'uscita'],
  'input': ['digitalread', 'analogread', 'ingresso', 'sensore'],
  'high': ['acceso', 'on', '5v', 'digitalwrite'],
  'low': ['spento', 'off', '0v', 'digitalwrite'],
  'delay': ['attesa', 'pausa', 'millisecondi', 'tempo'],
  'aspettare': ['delay', 'pausa', 'millisecondi'],
  'veloce': ['delay', 'frequenza', 'velocità'],
  'lento': ['delay', 'rallentare', 'pausa'],

  // ── Code Concepts ──
  'variabile': ['int', 'valore', 'memorizzare', 'dato'],
  'ciclo': ['loop', 'for', 'while', 'ripetere'],
  'ripetere': ['loop', 'ciclo', 'for', 'while'],
  'condizione': ['if', 'else', 'confronto', 'decisione'],
  'confrontare': ['if', 'maggiore', 'minore', 'uguale'],

  // ── Serial Monitor ──
  'monitor': ['serial', 'seriale', 'print', 'debug'],
  'seriale': ['serial', 'monitor', 'baud', 'print'],
  'stampare': ['serial', 'print', 'println', 'monitor'],
  'debug': ['serial', 'monitor', 'errore', 'valore'],
};

/**
 * Simple Italian suffix stemmer.
 * Reduces inflected forms to a common stem for better matching.
 * E.g., "collegato" → "colleg", "resistori" → "resistor", "acceso" → "acces"
 * Not linguistically perfect, but catches 80%+ of Italian inflections.
 */
function italianStem(word: string): string {
  if (word.length < 4) return word; // Don't stem short words

  // Remove common Italian suffixes (longest first)
  const suffixes = [
    'amento', 'imento', 'azione', 'zione',
    'mente', 'atore', 'atrice', 'abile', 'ibile',
    'ando', 'endo', 'endo', 'ante', 'ente', 'ione',
    'ato', 'ata', 'ati', 'ate', 'ito', 'ita', 'iti', 'ite',
    'oso', 'osa', 'osi', 'ose', 'ura', 'ore', 'ice',
    'are', 'ere', 'ire', 'ano', 'ono', 'ino',
    'to', 'ta', 'ti', 'te', // past participles
    'no', 'na', 'ni', 'ne', // adjective endings
    'so', 'sa', 'si', 'se',
    'lo', 'la', 'li', 'le',
    'io', 'ia', 'ii', 'ie',
    'al', 'il',
    'i', 'e', 'o', 'a', // singular/plural endings
  ];

  for (const suffix of suffixes) {
    if (word.endsWith(suffix) && word.length - suffix.length >= 3) {
      return word.slice(0, -suffix.length);
    }
  }
  return word;
}

/**
 * Expand a query with synonyms for better matching.
 */
function expandQuery(queryWords: string[]): string[] {
  const expanded = new Set(queryWords);
  for (const word of queryWords) {
    const synonyms = SYNONYM_MAP[word];
    if (synonyms) {
      for (const syn of synonyms) expanded.add(syn);
    }
    // Also check if any key partially matches
    for (const [key, syns] of Object.entries(SYNONYM_MAP)) {
      if (word.includes(key) || key.includes(word)) {
        for (const syn of syns) expanded.add(syn);
      }
    }
  }
  return [...expanded];
}

/**
 * Find the most relevant knowledge chunks for a query.
 * Enhanced scoring: synonym expansion, bigram matching, concept weighting.
 */
export function retrieveContext(
  query: string,
  experimentId?: string | null,
  maxTokens: number = 800,
): string {
  if (!chunks || chunks.length === 0) return '';

  const queryLower = query.toLowerCase();
  const queryWords = queryLower
    .split(/\s+/)
    .map(w => w.replace(/[^a-zàèéìòùç0-9]/g, ''))
    .filter(w => w.length > 1 && !STOP_WORDS.has(w)); // Keep 2+ char words (led, 9v, ohm), skip stop words

  // Expand with synonyms
  const expandedWords = expandQuery(queryWords);

  // Build stems for fuzzy matching (e.g., "collegato" matches "collega")
  const queryStems = queryWords.map(italianStem).filter(s => s.length >= 3);

  // Build bigrams for phrase matching
  const bigrams: string[] = [];
  for (let i = 0; i < queryWords.length - 1; i++) {
    bigrams.push(`${queryWords[i]} ${queryWords[i + 1]}`);
  }

  const scored = chunks.map(chunk => {
    let score = 0;
    const contentLower = chunk.content.toLowerCase();
    const titleLower = chunk.title.toLowerCase();
    const chapterLower = chunk.chapter.toLowerCase();

    // Exact experiment ID match = highest priority
    if (experimentId && chunk.id === experimentId) {
      score += 100;
    }

    // Expanded keyword matching (includes synonyms)
    // Use word boundary check for short terms (<4 chars) to avoid false positives
    for (const word of expandedWords) {
      const isShort = word.length < 4;
      const wordRegex = isShort ? new RegExp(`\\b${word}\\b`, 'i') : null;
      const matches = isShort
        ? wordRegex!.test(contentLower)
        : contentLower.includes(word);

      if (matches) {
        score += 2;
        const titleMatch = isShort ? wordRegex!.test(titleLower) : titleLower.includes(word);
        const chapterMatch = isShort ? wordRegex!.test(chapterLower) : chapterLower.includes(word);
        if (titleMatch) score += 3;
        if (chapterMatch) score += 2;
      }
    }

    // Stemmed matching — catches inflected forms (collegato↔collega, resistori↔resistore)
    for (const stem of queryStems) {
      if (contentLower.includes(stem)) {
        score += 1; // Lower weight than exact match to avoid noise
      }
    }

    // Bigram matching (phrase proximity)
    for (const bigram of bigrams) {
      if (contentLower.includes(bigram)) score += 5;
    }

    // Component type matching (boosted)
    const componentKeywords = [
      'led', 'resistore', 'pulsante', 'buzzer', 'potenziometro',
      'batteria', 'condensatore', 'motore', 'servo', 'lcd',
      'arduino', 'breadboard', 'rgb', 'ldr', 'fotoresistenza',
      'transistor', 'mosfet', 'relè', 'diodo',
    ];
    for (const comp of componentKeywords) {
      if (queryLower.includes(comp) && contentLower.includes(comp)) {
        score += 5;
      }
    }

    // Concept matching (electrical concepts)
    const conceptKeywords = [
      'legge di ohm', 'tensione', 'corrente', 'resistenza',
      'circuito aperto', 'circuito chiuso', 'parallelo', 'serie',
      'polarità', 'anodo', 'catodo', 'pwm', 'analogico', 'digitale',
    ];
    for (const concept of conceptKeywords) {
      if (queryLower.includes(concept) && contentLower.includes(concept)) {
        score += 8; // High weight for concept matches
      }
    }

    return { chunk, score };
  });

  scored.sort((a, b) => b.score - a.score);

  // ── Confidence threshold: avoid hallucination from irrelevant chunks ──
  // If best score < MIN_CONFIDENCE, RAG adds nothing (UNLIM answers from its own knowledge)
  const MIN_CONFIDENCE = 5;
  const topScore = scored.length > 0 ? scored[0].score : 0;

  if (topScore < MIN_CONFIDENCE) {
    return ''; // No confident match — better to say nothing than inject noise
  }

  const selected: KnowledgeChunk[] = [];
  let totalTokens = 0;

  for (const { chunk, score } of scored) {
    if (score < MIN_CONFIDENCE) break; // Stop at low-confidence chunks
    if (totalTokens + chunk.token_estimate > maxTokens) continue;
    selected.push(chunk);
    totalTokens += chunk.token_estimate;
    if (selected.length >= 4) break; // Up from 3 → 4 chunks for richer context
  }

  if (selected.length === 0) return '';

  const contextParts = selected.map(c =>
    `--- ${c.title} (${c.chapter}) ---\n${c.content}`
  );

  return `\n[CONOSCENZA DAI VOLUMI ELAB]\n${contextParts.join('\n\n')}`;
}

/**
 * Get the full content for a specific experiment by ID.
 */
export function getExperimentKnowledge(experimentId: string): string | null {
  const chunk = chunks.find(c => c.id === experimentId);
  return chunk?.content || null;
}

/**
 * Generate embedding using Gemini API.
 */
async function generateEmbedding(text: string): Promise<number[] | null> {
  if (!GEMINI_API_KEY) return null;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000); // 5s timeout

    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': GEMINI_API_KEY,
        },
        body: JSON.stringify({
          model: 'models/gemini-embedding-001',
          content: { parts: [{ text: text.slice(0, 2048) }] },
        }),
        signal: controller.signal,
      },
    );

    clearTimeout(timeout);
    if (!resp.ok) return null;
    const data = await resp.json();
    return data?.embedding?.values || null;
  } catch {
    return null;
  }
}

/**
 * Semantic search using Supabase pgvector.
 * Falls back to keyword search if pgvector is not configured.
 */
export async function retrieveVolumeContext(
  query: string,
  experimentId?: string | null,
  maxChunks: number = 3,
): Promise<string> {
  // Try semantic search first
  if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY && GEMINI_API_KEY) {
    try {
      const embedding = await generateEmbedding(query);
      if (embedding && embedding.length > 0) {
        const searchController = new AbortController();
        const searchTimeout = setTimeout(() => searchController.abort(), 5000); // 5s timeout

        const searchResp = await fetch(
          `${SUPABASE_URL}/rest/v1/rpc/search_chunks`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
              'apikey': SUPABASE_SERVICE_ROLE_KEY,
            },
            body: JSON.stringify({
              query_embedding: embedding,
              match_threshold: 0.55, // Raised from 0.45 → 0.55 to reduce irrelevant matches
              match_count: maxChunks + 1, // Fetch 1 extra, filter by quality
            }),
            signal: searchController.signal,
          },
        );

        clearTimeout(searchTimeout);

        if (searchResp.ok) {
          const results = await searchResp.json();
          if (results && results.length > 0) {
            // Deduplicate: skip chunks with >60% content overlap (avoids repetitive context)
            const unique: typeof results = [];
            for (const r of results) {
              const isDuplicate = unique.some(u => {
                const overlap = r.content.split(' ').filter((w: string) =>
                  u.content.includes(w)).length / r.content.split(' ').length;
                return overlap > 0.6;
              });
              if (!isDuplicate) unique.push(r);
            }
            if (unique.length > 0) {
              const parts = unique.slice(0, maxChunks).map((r: { chapter: string; section: string; content: string; similarity: number }) =>
                `--- ${r.chapter}${r.section ? ` / ${r.section}` : ''} ---\n${r.content}`
              );
              return `\n[CONOSCENZA DAI VOLUMI ELAB]\n${parts.join('\n\n')}`;
            }
          }
        }
      }
    } catch {
      // Fall through to keyword search
    }
  }

  // Fallback: enhanced keyword search on inline knowledge base (1200 tokens for richer context)
  return retrieveContext(query, experimentId, 1200);
}
