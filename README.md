<div align="center">

# 🎓 ELAB Tutor

**Simulatore di circuiti educativo con AI tutor Galileo**

[![React 19](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)](https://vite.dev)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-000?logo=vercel&logoColor=white)](https://www.elabtutor.school)
[![License](https://img.shields.io/badge/License-Proprietary-red)](#licenza)

*Bambini 8-14 anni imparano elettronica e Arduino trascinando componenti, scrivendo codice, e parlando con un tutor AI*

**[www.elabtutor.school](https://www.elabtutor.school)**

</div>

---

## 🇮🇹 Italiano

### Panoramica

Il cuore del progetto ELAB Tutor: un simulatore di circuiti educativo costruito con React 19 e Vite 6. I ragazzi trascinano LED, resistori e fili su una breadboard virtuale, scrivono codice Arduino, e parlano con Galileo — un tutor AI che risponde in italiano, analizza screenshot, e guida passo dopo passo.

### Feature Principali

- **62 esperimenti interattivi** su 3 volumi (Vol1: 38 base, Vol2: 18 intermedio, Vol3: 6 Arduino AVR)
- **22 componenti SVG** custom: LED, resistore, breadboard, Arduino Nano, buzzer, potenziometro, fotoresistore, servo, RGB LED, LCD 16x2...
- **Motore CircuitSolver**: analisi KVL/KCL in tempo reale con MNA (Modified Nodal Analysis)
- **Emulatore AVR**: ATmega328p in-browser via Web Worker per esecuzione codice Arduino
- **Scratch/Blockly**: 22 blocchi custom per programmazione visuale → Arduino C++ → AVR
- **Editor Arduino**: CodeMirror 6 con syntax highlighting C++
- **Galileo AI**: tutor conversazionale multi-LLM con vision (analizza screenshot circuiti)
- **138 quiz** integrati + **53 sfide/giochi** (Trova il Guasto, Prevedi e Spiega, Circuito Misterioso)
- **Passo Passo**: montaggio guidato step-by-step con posizioni identiche al libro fisico
- **4 lingue**: IT, EN, DE, ES

### Stack Tecnologico

| Layer | Tecnologia |
|-------|-----------|
| Frontend | React 19, Vite 6, CSS Modules, Design Tokens |
| Editor | CodeMirror 6, Google Blockly (Scratch — 22 blocchi custom) |
| Simulazione | CircuitSolver (KVL/KCL/MNA), AVR Bridge (ATmega328p Web Worker) |
| AI Backend | [Galileo Nanobot](https://github.com/AndreaMarro/elab-galileo-nanobot) (FastAPI + Docker) su Render |
| LLM | DeepSeek + Groq (text racing), Gemini 2.5 Flash (vision) |
| Auth | bcrypt + HMAC-SHA256, RBAC, timing-safe tokens |
| Deploy | Vercel (frontend), Render (backend AI) |
| Security | CSP, HSTS, X-Frame-Options, nosniff |

### Struttura Progetto

```
elab-builder/
├── src/                    ← Sorgente React (181 file)
│   ├── components/
│   │   ├── simulator/      ← Core simulatore (engine, canvas, SVG)
│   │   ├── tutor/          ← Chat Galileo + overlay AI
│   │   ├── scratch/        ← Editor Blockly/Scratch
│   │   └── admin/          ← Dashboard admin + analytics
│   ├── pages/              ← Route principali
│   ├── hooks/              ← Custom hooks React
│   ├── utils/              ← CircuitSolver, API, helpers
│   └── styles/             ← CSS Modules + Design System
├── public/                 ← Asset statici (66 file)
├── nanobot/                ← Backend AI (→ repo separato)
├── docs/                   ← Documentazione tecnica (116 file)
├── datasets/               ← Training data Galileo Brain
├── notebooks/              ← Jupyter fine-tuning
├── scripts/                ← Script validazione/test (135)
└── tests/                  ← Test suite Vitest
```

### Comandi

```bash
npm run dev          # Dev server locale (porta 5173)
npm run build        # Build produzione
npm run preview      # Preview build locale
npm test             # Esegui test Vitest
npx vercel --prod    # Deploy produzione
```

### Score Qualita' (Marzo 2026)

| Area | Score |
|------|-------|
| Simulatore (funzionalita') | 10.0/10 |
| Scratch Universale | 10.0/10 |
| AI Integration | 10.0/10 |
| Auth + Security | 9.8/10 |
| Code Quality | 9.8/10 |
| Sito Pubblico | 9.6/10 |
| Responsive/A11y | 9.2/10 |
| Simulatore (iPad) | 8.5/10 |
| **Overall** | **~9.2/10** |

### Documentazione

- **Architettura** → [`docs/README.md`](docs/README.md)
- **Piano di sviluppo** → [`docs/roadmap/README.md`](docs/roadmap/README.md)
- **Report audit agenti** → [`docs/agents/README.md`](docs/agents/README.md)
- **Design document** → [`docs/plans/README.md`](docs/plans/README.md)

---

## 🇬🇧 English

### Overview

The heart of ELAB Tutor: an educational circuit simulator built with React 19 and Vite 6. Kids (ages 8-14) drag LEDs, resistors, and wires onto a virtual breadboard, write Arduino code, and chat with Galileo — an AI tutor that responds in Italian, analyzes screenshots, and guides step by step.

### Key Features

- **69 interactive experiments** across 3 volumes
- **22 custom SVG components** with real-time physics
- **CircuitSolver engine**: KVL/KCL/MNA real-time analysis
- **AVR emulator**: in-browser ATmega328p via Web Worker
- **Scratch/Blockly**: 22 custom blocks → Arduino C++ → AVR (Vol3)
- **Galileo AI**: conversational multi-LLM tutor with vision (circuit screenshot analysis)
- **138 quizzes** + **53 challenges/games**
- **Step-by-Step mode**: guided assembly matching physical book layouts exactly
- **4 languages**: IT, EN, DE, ES

### Commands

```bash
npm run dev          # Local dev server (port 5173)
npm run build        # Production build
npm test             # Run Vitest tests
npx vercel --prod    # Deploy to production
```

---

## Ecosistema ELAB

| Repo | Descrizione | Deploy |
|------|-------------|--------|
| [**elab-tutor**](https://github.com/AndreaMarro/elab-tutor) | Frontend React — simulatore + editor + UI | [Vercel](https://www.elabtutor.school) |
| [**elab-galileo-nanobot**](https://github.com/AndreaMarro/elab-galileo-nanobot) | Backend AI — FastAPI + multi-LLM | [Render](https://elab-galileo.onrender.com/health) |

---

## Licenza

Copyright &copy; 2026 Andrea Marro — Tutti i diritti riservati / All rights reserved.

---

<div align="center">

*Fatto con ❤️ per i futuri ingegneri*

**[ELAB Tutor](https://www.elabtutor.school)** · **[GitHub](https://github.com/AndreaMarro)**

</div>
