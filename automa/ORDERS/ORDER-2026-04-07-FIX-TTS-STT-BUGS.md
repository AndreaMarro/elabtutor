# ORDER — Fix Bug TTS/STT (Web Speech API)
**Data**: 2026-04-07
**Generato da**: elab-researcher
**Basato su**: automa/knowledge/RESEARCH-2026-04-07-TTS-STT-WEB-SPEECH-API.md
**Priorità**: ALTA
**Effort stimato**: 2-3 ore
**Tipo**: BUG FIX

---

## Problema

6 console.warn/log in produzione da `useTTS` e `useSTT`. Documentati come "bug accettati" in STATE.md G17. Causano rumore nei log e indicano comportamenti non affidabili su iOS/Safari (iPad scolastici).

Fonte delle cause root: ricerca 2026-04-07 (vedi knowledge file).

---

## Task da Eseguire

### Task 1 — Fix voiceschanged race condition (Chrome)

**File**: `src/hooks/useTTS.js` (o dove è implementato TTS)

Trovare la chiamata `speechSynthesis.getVoices()` e sostituire con pattern asincrono:

```js
const loadVoicesAsync = (callback) => {
  const voices = speechSynthesis.getVoices();
  if (voices.length > 0) {
    callback(voices);
    return;
  }
  speechSynthesis.addEventListener('voiceschanged', () => {
    callback(speechSynthesis.getVoices());
  }, { once: true });
};
```

### Task 2 — Fix iOS user gesture (Safari/iPad)

**File**: componente root layout o `App.jsx` / `ElabTutorV4.jsx`

Aggiungere unlock audio al primo evento utente:

```js
const unlockWebAudio = () => {
  if (typeof speechSynthesis !== 'undefined') {
    const u = new SpeechSynthesisUtterance('');
    speechSynthesis.speak(u);
    speechSynthesis.cancel();
  }
  document.removeEventListener('click', unlockWebAudio);
  document.removeEventListener('touchstart', unlockWebAudio);
};
document.addEventListener('click', unlockWebAudio, { once: true });
document.addEventListener('touchstart', unlockWebAudio, { once: true });
```

Aggiungere in `useEffect` al mount dell'app principale.

### Task 3 — Fix garbage collection utterance

**File**: `src/hooks/useTTS.js`

Prima di `speechSynthesis.speak(utterance)`, assegnare a variabile persistente:

```js
// Prevenire garbage collection
if (typeof window !== 'undefined') {
  window.__elab_current_utterance = utterance;
}
speechSynthesis.speak(utterance);
```

Aggiungere `window.__elab_current_utterance = null` nel callback `onend`.

### Task 4 — Fix TTS che si blocca in background iOS

**File**: `src/hooks/useTTS.js`

Aggiungere listener visibilitychange:

```js
useEffect(() => {
  const handleVisibilityChange = () => {
    if (document.hidden && speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }
  };
  document.addEventListener('visibilitychange', handleVisibilityChange);
  return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
}, []);
```

---

## Verifica

Dopo i fix:
1. `npm run test:ci` deve passare
2. `npm run build` deve passare
3. Aprire console Chrome DevTools → 0 console.warn/log da useTTS/useSTT
4. Testare su iPad/iPhone (o DevTools device emulation): TTS funziona al primo click
5. Simulare background: cambiare tab → tornare → TTS funziona ancora

---

## Note

- NON aggiungere dipendenze npm
- NON cambiare il comportamento funzionale di TTS/STT
- Solo eliminare i bug documentati
- I fix sono tutti retrocompatibili
