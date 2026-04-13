#!/usr/bin/env node
/**
 * Estende supabase/functions/knowledge-base.json con i chunk Vol3 mancanti.
 *
 * Uso: node scripts/extend-kb-vol3.mjs
 *
 * Firma: Andrea Marro + Claude Code Web — 13/04/2026
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const KB_PATH = path.join(__dirname, '..', 'supabase', 'functions', 'knowledge-base.json');
const VOL3_MOD = await import(path.join(__dirname, '..', 'src', 'data', 'experiments-vol3.js'));
const VOL3 = VOL3_MOD.default;

function chunkFromExperiment(e) {
  const componentList = e.components
    ? (Array.isArray(e.components)
        ? e.components.map(c => c.id || c.type).join(', ')
        : Object.keys(e.components).join(', '))
    : 'n/d';

  const concept = typeof e.concept === 'string'
    ? e.concept
    : Array.isArray(e.concept)
      ? e.concept.join(', ')
      : (e.concept && typeof e.concept === 'object' ? JSON.stringify(e.concept).slice(0, 200) : 'n/d');

  const unlimPrompt = typeof e.unlimPrompt === 'string'
    ? e.unlimPrompt
    : (e.unlimPrompt && typeof e.unlimPrompt === 'object' ? JSON.stringify(e.unlimPrompt).slice(0, 400) : '');

  const observeText = Array.isArray(e.observe) ? e.observe.join('. ') : (e.observe || '');

  const content = [
    `ESPERIMENTO: ${e.title}`,
    `Volume: Volume 3 - Arduino Programmato`,
    `Capitolo: ${e.chapter || 'n/d'}`,
    `Difficoltà: ${e.difficulty || 'n/d'}/5`,
    `Descrizione: ${e.desc || ''}`,
    `Concetti chiave: ${concept}`,
    `Componenti utilizzati: ${componentList}`,
    observeText ? `Cosa osservare: ${observeText}` : '',
    `Contesto pedagogico: ${unlimPrompt.slice(0, 800)}`,
  ].filter(Boolean).join('\n');

  return {
    id: e.id,
    volume: 3,
    chapter: e.chapter || '',
    title: e.title,
    content,
    token_estimate: Math.ceil(content.length / 4),
  };
}

const kb = JSON.parse(fs.readFileSync(KB_PATH, 'utf8'));
const existingIds = new Set(kb.map(c => c.id));

const v3Exps = VOL3.experiments;
const toAdd = v3Exps.filter(e => !existingIds.has(e.id));

console.log(`Chunks esistenti: ${kb.length}`);
console.log(`Vol3 esperimenti totali: ${v3Exps.length}`);
console.log(`Vol3 già in KB: ${v3Exps.length - toAdd.length}`);
console.log(`Vol3 da aggiungere: ${toAdd.length}`);

const newChunks = toAdd.map(chunkFromExperiment);
const merged = [...kb, ...newChunks];

fs.writeFileSync(KB_PATH, JSON.stringify(merged, null, 2) + '\n', 'utf8');
console.log(`✓ Scritti ${merged.length} chunks totali`);
console.log(`  Vol1: ${merged.filter(c => c.volume === 1).length}`);
console.log(`  Vol2: ${merged.filter(c => c.volume === 2).length}`);
console.log(`  Vol3: ${merged.filter(c => c.volume === 3).length}`);
