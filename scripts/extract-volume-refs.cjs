#!/usr/bin/env node
/**
 * extract-volume-refs.cjs
 * Parsing dei raw text dei 3 volumi ELAB per estrarre:
 *  - pagina esatta di ogni ESPERIMENTO
 *  - titolo del capitolo
 *  - testo introduttivo (primi paragrafi vicini all'esperimento)
 *  - contesto narrativo
 *
 * Produce JSON per ciascun volume + file aggregato volume-refs-raw.json
 *
 * © Andrea Marro — 15/04/2026
 */
const fs = require('fs');
const path = require('path');

const RAW_DIR = path.resolve(__dirname, '../data/rag');
const OUT_PATH = path.resolve(__dirname, '../data/rag/volume-refs-raw.json');

/** Parse singolo file raw: ritorna array di pagine con numero e contenuto */
function parseRawPages(text) {
  const pages = [];
  const re = /^=+\s+PAGINA\s+(\d+)\s+=+\s*$/gm;
  const matches = [...text.matchAll(re)];
  for (let i = 0; i < matches.length; i++) {
    const m = matches[i];
    const pageNum = parseInt(m[1], 10);
    const start = m.index + m[0].length;
    const end = i + 1 < matches.length ? matches[i + 1].index : text.length;
    pages.push({ page: pageNum, text: text.slice(start, end).trim() });
  }
  return pages;
}

/** Ripulisce testo da caratteri PDF artifact (cid:...) ripetizioni e doppi spazi */
function cleanText(txt) {
  return txt
    .replace(/\(cid:\d+\)/g, '')
    .replace(/[\u2019\u2018]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Estrae esperimenti dalle pagine: trova "ESPERIMENTO N" e associa al capitolo corrente.
 * Poi per ciascuno: prende le ~400 lettere dopo come bookText e tenta i primi 60 char come quote.
 */
function extractExperiments(pages) {
  const results = [];
  let currentChapter = null; // { num, title, startPage }

  // 1) Prima passata: identifica capitoli (CAPITOLO N + titolo)
  // Il titolo di un capitolo spesso appare sotto "CAPITOLO N" o come header
  // Per semplicità ci basiamo su una mappa manuale chapter→titolo se serve
  const chapterTitlesV1 = {
    1: "La Storia dell'Elettronica",
    2: "Le grandezze elettriche e la legge di Ohm",
    3: "Cos'è un resistore?",
    4: "Cos'è la breadboard?",
    5: "Cosa sono le batterie?",
    6: "Cos'è il diodo LED?",
    7: "Cos'è il LED RGB?",
    8: "Cos'è un pulsante?",
    9: "Cos'è un potenziometro?",
    10: "Cos'è un fotoresistore?",
    11: "Cos'è un cicalino?",
    12: "L'interruttore magnetico",
    13: "Cos'è l'elettropongo?",
    14: "Costruiamo il nostro primo robot",
  };

  for (let i = 0; i < pages.length; i++) {
    const { page, text } = pages[i];
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

    // rileva capitolo
    for (const line of lines) {
      const m = line.match(/^CAPITOLO\s+(\d+)\s*$/);
      if (m) {
        const num = parseInt(m[1], 10);
        currentChapter = { num, page };
      }
    }

    // rileva esperimenti: ESPERIMENTO N
    const expRe = /^ESPERIMENTO\s+(\d+)\s*$/gm;
    let em;
    while ((em = expRe.exec(text)) !== null) {
      const expNum = parseInt(em[1], 10);
      // testo dopo il marker: prende 400 char
      const after = text.slice(em.index + em[0].length, em.index + em[0].length + 600);
      const bookText = cleanText(after).slice(0, 320);
      results.push({
        chapter: currentChapter?.num ?? null,
        experiment: expNum,
        page,
        bookText,
      });
    }
  }
  return { experiments: results, chapterTitlesV1 };
}

function main() {
  const out = {};
  for (const n of [1, 2, 3]) {
    const fp = path.join(RAW_DIR, `volume-${n}-raw.txt`);
    if (!fs.existsSync(fp)) {
      console.error(`❌ ${fp} non trovato`);
      continue;
    }
    const raw = fs.readFileSync(fp, 'utf8');
    const pages = parseRawPages(raw);
    const { experiments } = extractExperiments(pages);
    out[`v${n}`] = {
      volume: n,
      totalPages: pages.length,
      experimentsFound: experiments.length,
      experiments,
    };
    console.log(`✅ Vol${n}: ${pages.length} pagine, ${experiments.length} esperimenti rilevati`);
  }
  fs.writeFileSync(OUT_PATH, JSON.stringify(out, null, 2));
  console.log(`📄 Scritto: ${OUT_PATH}`);
}

main();
