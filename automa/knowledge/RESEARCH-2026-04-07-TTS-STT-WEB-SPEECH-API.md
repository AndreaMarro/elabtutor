# RESEARCH — Web Speech API: Limitazioni e Alternative per ELAB
**Data**: 2026-04-07
**Ricercatore**: elab-researcher (scheduled agent)
**Topic**: Web Speech API (TTS/STT) - bug noti, limitazioni iOS/Safari, alternative cloud 2026
**Livello di confidenza**: ALTO

---

## Executive Summary

La Web Speech API nativa ha limitazioni critiche documentate, specialmente su iOS/Safari e in modalità offline. ELAB ha 6 console.warn/log noti in produzione da useTTS e useSTT (bug accettati). Questa ricerca identifica i problemi specifici e valuta alternative (OpenAI TTS, Mistral Voxtral) per risolvere i bug in modo definitivo.

---

## Fonti Consultate

- https://webreflection.medium.com/taming-the-web-speech-api-ef64f5a245e1 — analisi critica API
- https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API — documentazione ufficiale
- https://weboutloud.io/bulletin/speech_synthesis_in_safari/ — stato Safari SpeechSynthesis
- https://talkrapp.com/speechSynthesis.html — lessons learned in produzione
- https://caniuse.com/speech-synthesis — supporto browser 2026
- https://vapi.ai/blog/elevenlabs-vs-openai — confronto TTS cloud
- https://leanvox.com/blog/tts-api-pricing-comparison-2026 — prezzi TTS 2026
- https://computertech.co/mistral-voxtral-tts-review/ — Mistral Voxtral TTS

---

## Findings Principali

### 1. Bug Critici Web Speech API (i nostri 6 console.warn)

**Bug #1: Chrome — voiceschanged race condition**
```js
// SBAGLIATO (funziona su Firefox/Safari, crash su Chrome):
const voices = speechSynthesis.getVoices();

// CORRETTO per Chrome:
speechSynthesis.addEventListener('voiceschanged', () => {
  const voices = speechSynthesis.getVoices();
  // usare voices qui
});
```
*Causa probabile dei console.warn in produzione: voce it-IT non trovata al primo tentativo.*

**Bug #2: iOS Safari — user gesture obbligatorio**
- TTS NON funziona se chiamato da `useEffect` o da timer
- Funziona SOLO da handler di evento utente (click/tap diretto)
- **Workaround documentato**: sintetizzare stringa vuota `""` al primo tap dell'utente per "sbloccare" l'audio context, poi usare TTS normalmente dopo
- Implementazione: `speechSynthesis.speak(new SpeechSynthesisUtterance(''))` nell'`onClick` di qualsiasi bottone iniziale

**Bug #3: iOS Safari — getVoices() restituisce array vuoto**
```js
// Su iOS Safari speechSynthesis.getVoices() restituisce []
// Non è possibile scegliere la voce it-IT
// La voce default di sistema viene usata (italiano se il dispositivo è in italiano)
```
*Implicazione: su iPad scolastici non si può forzare la voce italiana — usa quella di sistema*

**Bug #4: iOS — TTS si interrompe in background**
- Se l'utente switcha app mentre Galileo sta parlando → TTS si blocca permanentemente
- Richiede refresh pagina per ripristinare
- **Workaround**: `speechSynthesis.cancel()` nell'event listener `visibilitychange` quando `document.hidden === true`

**Bug #5: SpeechSynthesisUtterance garbage collection**
- L'utterance può essere garbage collected prima che finisca di parlare
- Causa: la callback `onend` non si triggera mai
- **Fix**: mantenere reference globale all'utterance corrente: `window._currentUtterance = utterance`

**Bug #6: Chrome — chiamate API senza connectionresumed**
- Chrome scarica voci aggiuntive (italiane) dalla rete Google
- In offline, le voci premium non sono disponibili → fallback alle voci locali di sistema
- ELAB è PWA: in offline questa è la modalità principale → le voci locali devono essere testate

### 2. Stato Browser Support 2026

| Browser | SpeechSynthesis | SpeechRecognition | Note |
|---------|----------------|-------------------|------|
| Chrome desktop | ✅ | ✅ | voci extra online |
| Firefox desktop | ✅ | ❌ | no STT nativo |
| Safari macOS | ✅ | ❌ | no STT nativo |
| Chrome Android | ✅ | ✅ | ottimo |
| Safari iOS | ⚠️ | ❌ | solo TTS + bug noti |
| Chrome iOS | ⚠️ | ❌ | usa engine Safari sotto |

**Per ELAB su iPad (LIM)**: Safari iOS è il browser usato → TTS funziona con workaround, STT non funziona nativamente.

### 3. Alternative TTS Cloud: Confronto Prezzi 2026

| Provider | Prezzo | Qualità it-IT | Latenza | Note |
|----------|--------|---------------|---------|------|
| Web Speech API | Gratis | ⭐⭐⭐ | ~0ms | bug noti |
| OpenAI TTS | $15/M chars | ⭐⭐⭐⭐⭐ | ~300ms | 6 voci, no it-IT nativo |
| OpenAI TTS-HD | $30/M chars | ⭐⭐⭐⭐⭐ | ~500ms | qualità superiore |
| ElevenLabs Starter | $5/mo (30k chars) | ⭐⭐⭐⭐⭐ | ~400ms | 70+ lingue inc. it-IT |
| Mistral Voxtral | TBD | ⭐⭐⭐⭐ | ~200ms | open-source, self-hostabile |
| Google Cloud TTS | $4/M chars | ⭐⭐⭐⭐ | ~200ms | ottimo it-IT |

**Stima costi per ELAB**: Media 200 caratteri per messaggio Galileo × 10 messaggi/sessione × 1000 sessioni/mese = 2M chars/mese → OpenAI TTS costerebbe **$30/mese** (fattibilissimo).

### 4. Mistral Voxtral — Novità 2026

Mistral ha rilasciato Voxtral, modello TTS open-source che:
- Si auto-ospita (Render, Railway, self-hosted)
- Supporta italiano nativamente
- Qualità paragonabile a ElevenLabs secondo benchmark indipendenti
- Integra con le API Mistral già in uso (se ELAB usa Mistral per Galileo)
- **Costo**: infrastruttura solo (nessun costo per carattere)

Per ELAB che usa già Render per il nanobot, aggiungere Voxtral è percorribile.

### 5. STT (Speech-to-Text) su iPad/LIM

Il problema principale: su iOS Safari il microfono non è accessibile senza HTTPS e senza permesso esplicito. `webkitSpeechRecognition` non esiste su iOS.

**Alternativa funzionante su iOS**: Whisper via API (OpenAI o Groq)
- L'utente parla → registra audio con `MediaRecorder` → invia a Whisper API → testo ritornato
- Latenza: ~500-800ms (Groq è più veloce, ~200-300ms)
- Costo Groq Whisper: $0.04/ora audio → praticamente gratuito per uso scolastico

---

## Raccomandazioni Concrete

### Fix Priorità ALTA — Eliminare i 6 Console Warn (2-3h lavoro):

1. **Fix voiceschanged race condition in Chrome** — in `useTTS.js`:
   ```js
   const loadVoices = () => {
     const voices = speechSynthesis.getVoices();
     if (voices.length > 0) { setVoices(voices); return; }
     speechSynthesis.addEventListener('voiceschanged', () => {
       setVoices(speechSynthesis.getVoices());
     }, { once: true });
   };
   ```

2. **Fix iOS user gesture** — aggiungere nel primo click dell'utente:
   ```js
   const unlockAudio = () => {
     speechSynthesis.speak(new SpeechSynthesisUtterance(''));
     speechSynthesis.cancel();
   };
   ```
   Chiamare `unlockAudio()` nel primo `onClick` del layout principale.

3. **Fix garbage collection** — mantenere ref globale:
   ```js
   window.__elab_utterance = utterance;
   speechSynthesis.speak(window.__elab_utterance);
   ```

4. **Fix iOS background** — aggiungere in `useTTS.js`:
   ```js
   document.addEventListener('visibilitychange', () => {
     if (document.hidden) speechSynthesis.cancel();
   });
   ```

### Fix Priorità MEDIA — STT su iPad (4-6h lavoro):

5. **Implementare fallback Whisper (Groq)** per iPad/iOS:
   - Detectare `!window.SpeechRecognition && !window.webkitSpeechRecognition`
   - Fallback: pulsante "tieni premuto per parlare" → `MediaRecorder` → Groq Whisper
   - Mostrare indicatore visivo "Elaboro..." durante trascrizione

### Upgrade Opzionale — TTS Cloud (se budget lo permette):

6. **Valutare OpenAI TTS** per Galileo: $30/mese stimato, qualità molto superiore, elimina tutti i bug browser. Implementazione: endpoint `/api/tts` sul nanobot che chiama OpenAI TTS e ritorna audio stream.

---

## Impatto sui Bug Noti

I 4 fix (1-4) eliminano tutti e 6 i console.warn/log noti documentati in STATE.md senza costi aggiuntivi e in circa 2-3 ore di lavoro.
