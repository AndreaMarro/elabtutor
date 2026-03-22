# ELAB Tutor — Current State (22/03/2026, updated Day 1 Sprint)

**Session**: Sprint Day 1 (23/03/2026)
**Last Production Deploy**: Session 108 (10/03/2026)
**Sprint Deploy**: Not yet (build passes, deploy after human review)
**Brutally Honest Assessment**: The core product is excellent. Automa infrastructure is now bootstrapped. Electron View PoC integrated.

---

## What Was Built Today (Day 1 Sprint — 23/03/2026)

### Automa Infrastructure (Tasks 1.1-1.9)
- **docker-compose.yml**: n8n + Ollama services, shared volumes, health checks
- **Ollama Modelfile**: Fixed to point to actual v2 GGUF (was referencing nonexistent v3)
- **galileo-tester.py**: 50 curated test messages (10 theory, 10 action, 10 circuit, 10 code, 5 quiz, 5 edge)
- **eval-200.jsonl**: 200 test cases validated (60 Vol1 + 60 Vol2 + 50 Vol3 + 30 cross-cutting)
- **pedagogy-sim.py**: 5 student profiles (Sofia 10, Marco 12, Luca 14, Prof.ssa Rossi, Edge Case) + 60 nightly interactions with Groq fallback
- **galileo-judge.py**: 5-dimension scoring (correttezza, pedagogia, sicurezza, action_tags, linguaggio) via DeepSeek
- **synthesizer.py**: Unified nightly report with WhatsApp message formatting
- **n8n health-monitor.json**: Workflow JSON ready for import (ping nanobot + Vercel every 5 min)
- **Directory structure**: automa/{agents,profiles,eval,reports/nightly,n8n-workflows,shared}

### Electron View PoC (Task 1.10)
- **WireRenderer.jsx**: Enhanced particle animation when `electronViewEnabled=true`
  - 3-12 particles per wire (proportional to current magnitude)
  - Three-layer rendering: glow halo + core particle + bright center
  - Color coding: gold (<5mA), orange (5-50mA), red (>50mA)
  - Faster animation (0.8x duration of standard)
  - Short circuit flash effect preserved
- **ControlBar.jsx**: "Vista Elettroni" toggle in Strumenti menu
- **SimulatorCanvas.jsx**: `electronViewEnabled` prop pass-through
- **NewElabSimulator.jsx**: State management + prop wiring
- **ElectronView.jsx**: Created (requestAnimationFrame approach) but NOT integrated — the CSS-based approach in WireRenderer was more pragmatic for the PoC
- **Build**: 0 errors, 32.90s

---

## What Exists and Works

### The Simulator (9.2/10 overall)
- **21 SVG components** on a virtual breadboard with snap-to-grid placement
- **67 experiments** across 3 volumes (38 Vol1 + 18 Vol2 + 11 Vol3)
- **CircuitSolver** with KVL/KCL (Gaussian elimination + partial pivoting)
- **AVR CPU emulation** via avr8js Web Worker (ATmega328p, GPIO/ADC/PWM/USART)
- **Scratch/Blockly** visual programming with side-by-side C++ preview
- **Wire bezier routing** with current flow animation
- **BOM panel, annotations, export PNG, keyboard shortcuts**
- **Passo Passo** (step-by-step guided building) with component placement matching the physical book exactly
- **LCD 16x2, Servo, 21 total component types**

### Galileo AI Tutor (10/10)
- **Nanobot v5.3.0** on Render ($7/mo Starter tier, always-on)
- **Multi-provider racing**: DeepSeek + Groq for text (Gemini reserved for vision only)
- **26+ action tags**: play, pause, clearall, addcomponent, addwire, highlight, quiz, compile, loadexp, etc.
- **Vision analysis**: Student takes photo or auto-screenshot, Gemini analyzes circuit
- **Multi-component intent**: "costruisci un circuito con LED e resistenza" parses correctly
- **Safety filter**: Blocks dangerous/inappropriate content
- **Quiz generation**: Contextual quizzes based on current experiment
- **YAML knowledge base**: circuit.yml v5.3, scratch.yml, code.yml, nanobot.yml, vision.yml

### Public Site
- **16 pages** with WhatsApp+Galileo widget
- Netlify deploy at `funny-pika-3d1029.netlify.app`
- CSP header, HSTS, nosniff, X-Frame-Options

### Authentication
- Timing-safe tokens, CORS whitelist, session management
- Stripe DISABLED (all sales via Amazon)

---

## What Does NOT Exist Yet (Honest Gaps)

| Gap | Impact | Difficulty |
|-----|--------|-----------|
| **No i18n** — Italian only. Zero multilingual support. | Limits TAM to ~500K Italian students | Medium (react-i18next + LLM translation) |
| **No offline/PWA** — requires internet for everything, including Galileo | Schools with bad internet cannot use it | Medium (service workers + local cache) |
| **No teacher tools** — no dashboard, no class management, no lesson plans, no progress tracking | Teachers cannot adopt without preparation materials | Medium-Hard |
| **No student model** — Galileo does not remember who the student is or what they know | Every session starts from zero. No personalization. | Low-Medium |
| **No Electron View** — current flow is invisible, the core conceptual barrier in electronics education | Biggest missed pedagogical opportunity | Medium |
| **No automated testing** — zero E2E tests, zero nightly audits, zero regression detection | Regressions discovered manually, sometimes weeks late | Medium |
| **No self-improvement loop** — AI quality is static, no data flywheel, no A/B testing | System does not learn from its own failures | Hard |
| **No observability** — no structured logging, no metrics dashboard, no alerting | Cannot measure AI quality systematically | Medium |

---

## Scores Per Area (10/03/2026 — Session 108 Audit)

| Area | Score | Honest Notes |
|------|-------|-------------|
| Auth + Security | **9.8/10** | Solid. Timing-safe tokens, CORS, HSTS, CSP. Email flow untested. |
| Sito Pubblico | **9.6/10** | 61 orphan files (~11.7MB) still sitting in the deploy. |
| Simulatore (funzionalita) | **10.0/10** | LCD Blockly blocks, Ralph Loop 21/22, Scratch Gate 18/18. Genuinely excellent. |
| Simulatore (estetica) | **8.5/10** | Inline styles, inconsistent padding, grid misalignments. Functional but not polished. |
| Simulatore (iPad) | **8.5/10** | 8/8 viewport pass, but slide-over UX awkward, RotateOverlay needed. |
| Simulatore (physics) | **8.0/10** | KVL/KCL works, AVR emulation works. No dynamic capacitor/transient simulation. No visual current flow. |
| Scratch Universale | **10.0/10** | 22 blocks, all AVR experiments, compile parity. |
| AI Integration | **10.0/10** | Vision, actions, quiz, wiring, debug all verified. |
| Responsive/A11y | **9.2/10** | Skip-to-content, focus-visible, SVG aria-labels. No aria-live, window.confirm blocks UI. |
| Code Quality | **9.8/10** | 0 build errors, Main 304KB gzip, ScratchEditor 902KB gzip. |
| **Overall** | **~9.2/10** | The simulator itself is world-class. Everything around it is missing. |

---

## Known Bugs (22/03/2026)

### P1 Important (3 remaining)
1. **Notion DB ID mismatch**: frontend `notionService.js` vs backend `notion-config.js` use different IDs. Partial fix from H12.
2. **STUDENT_TRACKING DB not shared** with integration (M20 — requires Notion UI action by human).
3. **Email E2E not verified** — auth flow works in theory but email delivery never tested end-to-end.

### P2 Medium (3 remaining)
1. **P2-TDZ**: obfuscator/minifier identifier collision in ElabTutorV4. Mitigated by SKIP_PATTERNS but not root-caused.
2. **P2-NAN-5**: circuitState not sanitized before sending to nanobot.
3. **P2-NAN-7**: Session messages not sanitized (XSS potential in chat history).

### P3 Minor (4 remaining)
1. No automated E2E test suite.
2. `window.confirm()` blocks UI (15 calls in admin pages).
3. `notionService` has no 429 retry logic.
4. No `aria-live` region for simulation state changes.

---

## What Was Built Today (22/03/2026 Research Session)

### Research Completed (6 parallel agents via Claude Desktop)
1. **Context Management for Small LLMs** — RAG, memory systems, prompt compression, knowledge distillation, curriculum-aware context. Recommendation: ChromaDB + structured prompts + entity memory + cloud fallback.
2. **20 Genius Ideas** — Ranked by impact. Top 3: Electron View (10/10), 12 Languages (10/10), School District Dashboard (9/10).
3. **Self-Improving AI Architectures** — Automated evals, data flywheel, curriculum learning, A/B testing, continuous fine-tuning, observability. Recommendation: Start with observability + eval suite, then build flywheel on top.
4. **Academic Papers** — AI tutoring effectiveness studies, Socratic questioning, scaffolding, multimodal learning research (search initiated, full results in conversation logs).
5. **Multi-Agent Orchestration** — CrewAI, AutoGen, LangGraph comparison. n8n recommended as practical orchestrator for ELAB's multi-tool setup.
6. **Offline EdTech** — PWA, edge AI, Kolibri/KA Lite examples, Italian school infrastructure reality.

### Simulator Fidelity Audit (conversation log)
- Detailed component-by-component audit comparing simulator behavior to real-world electronics.

### Automa v3 Design Document
- Complete 24-hour cycle design: n8n + 8 agents + 5 student profiles + auto-fix pipeline.
- Docker Compose architecture.
- Cost analysis: ~$2/month extra beyond existing subscriptions.

### Galileo Brain PoC (Session 75, existing)
- Qwen3-4B fine-tuned with Unsloth LoRA on 500 ChatML examples.
- Training: 189 steps, 3 epochs, loss 1.48 to 0.013, 57min.
- Inference 3/3 PASS. GGUF q4_k_m downloaded (~2.5GB).
- Ready for Ollama integration but not yet deployed.

---

## Brutally Honest Assessment

### What is genuinely excellent
- The circuit simulator is probably the best browser-based educational electronics simulator that exists. 21 components, KVL/KCL physics, AVR emulation, Scratch integration, vision analysis — nobody has all of these in one product.
- Galileo at 10/10 is real. 26+ action tags, multi-component intent, vision, quiz, wiring guidance. The AI integration is deep, not superficial.
- The codebase is clean: 0 build errors, reasonable bundle sizes, proper component architecture.

### What is honestly mediocre
- **The product around the simulator is thin.** No teacher tools, no student tracking, no offline mode, no multilingual support. These are not nice-to-haves — they are table stakes for any educational product that wants school adoption.
- **Design is functional, not beautiful.** 8.5/10 estetica means there are visible rough edges. Inline styles, inconsistent spacing. It works but it does not delight.
- **No automated quality assurance.** Every session I find bugs that were introduced in previous sessions. There is no safety net.

### What is missing entirely
- **Go-to-market strategy.** The product is good but nobody knows it exists. No content marketing, no teacher outreach, no conference presence, no pricing strategy beyond "Amazon sells the book."
- **User analytics.** We have no idea how real users interact with the product. No Mixpanel, no PostHog, no event tracking in production (analytics webhook exists but points to n8n, not a real analytics platform).
- **Community.** Zero user community. No forum, no Discord, no teacher network.

### The core tension
The simulator is 10/10 but it is trapped inside a 6/10 product. The sprint plan addresses this by building the missing layers (i18n, offline, teacher tools, self-improvement) while maintaining the existing quality floor.
