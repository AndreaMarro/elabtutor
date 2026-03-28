// ============================================
// ELAB Tutor - useTTS Hook
// Text-to-Speech hook for Galileo AI responses
// © Andrea Marro — 24/03/2026
// ============================================

import { useState, useEffect, useCallback, useRef } from 'react';
import logger from '../utils/logger';

/**
 * Custom hook per gestire Text-to-Speech
 * Usa Web Speech API con fallback e controlli avanzati
 */
export function useTTS() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [availableVoices, setAvailableVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const utteranceRef = useRef(null);
  const synthRef = useRef(null);
  const pendingTextRef = useRef(null); // BUG-03 fix: queue text if voices not loaded yet

  // Inizializza il TTS e carica le voci
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const supported = 'speechSynthesis' in window;
    setIsSupported(supported);

    if (supported) {
      synthRef.current = window.speechSynthesis;
      
      // Funzione per caricare le voci
      const loadVoices = () => {
        const voices = synthRef.current.getVoices();
        setAvailableVoices(voices);
        
        // Cerca una voce italiana di qualità
        const italianVoices = voices.filter(voice => 
          voice.lang.startsWith('it') || 
          voice.name.toLowerCase().includes('italian') ||
          voice.name.toLowerCase().includes('giulia') ||
          voice.name.toLowerCase().includes('luca')
        );
        
        // Preferisci voci locali (non remote) per migliori performance
        const localItalian = italianVoices.filter(v => v.localService);
        const bestVoice = localItalian[0] || italianVoices[0] || voices[0];
        
        setSelectedVoice(bestVoice);
      };

      // Le voci potrebbero non essere immediatamente disponibili
      loadVoices();
      
      // Listener per quando le voci vengono caricate
      synthRef.current.addEventListener('voiceschanged', loadVoices);
      
      return () => {
        if (synthRef.current) {
          synthRef.current.removeEventListener('voiceschanged', loadVoices);
        }
      };
    }
  }, []);

  // BUG-03 fix: quando le voci vengono caricate, parla il testo in coda
  useEffect(() => {
    if (selectedVoice && pendingTextRef.current) {
      const { text, options } = pendingTextRef.current;
      pendingTextRef.current = null;
      // speak sarà chiamato al prossimo render con selectedVoice disponibile
      // Usiamo un micro-delay per assicurarci che lo stato sia committato
      const t = setTimeout(() => speak(text, options), 50);
      return () => clearTimeout(t);
    }
  }, [selectedVoice]); // eslint-disable-line react-hooks/exhaustive-deps

  // Pulisce l'utterance corrente
  const cleanup = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    utteranceRef.current = null;
    setIsSpeaking(false);
    setIsPaused(false);
    setIsLoading(false);
  }, []);

  // Funzione principale per far parlare il testo
  const speak = useCallback((text, options = {}) => {
    if (!isSupported || !text) return false;
    // BUG-03 fix: se voce non ancora caricata, metti in coda
    if (!selectedVoice) {
      pendingTextRef.current = { text, options };
      return true; // "accettato" — sarà parlato quando le voci arrivano
    }

    // Stop del speech precedente
    cleanup();
    setIsLoading(true);

    try {
      // Pulisce il testo dalle action tags ELAB e markdown semplice
      const cleanText = text
        .replace(/\[AZIONE:[^\]]+\]/gi, '') // Remove ELAB action tags
        .replace(/\*\*(.*?)\*\*/g, '$1')    // Remove bold markdown
        .replace(/\*(.*?)\*/g, '$1')        // Remove italic markdown
        .replace(/`([^`]+)`/g, '$1')        // Remove code markdown
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links, keep text
        .replace(/#+\s*/g, '')              // Remove headers
        .trim();

      if (!cleanText) {
        setIsLoading(false);
        return false;
      }

      const utterance = new SpeechSynthesisUtterance(cleanText);
      
      // Configurazione voce
      utterance.voice = selectedVoice;
      utterance.rate = options.rate || 0.9;     // Leggermente più lento per chiarezza
      utterance.pitch = options.pitch || 1.0;   // Pitch normale
      utterance.volume = options.volume || 0.8; // Volume al 80%
      utterance.lang = 'it-IT';

      // Event handlers
      utterance.onstart = () => {
        setIsLoading(false);
        setIsSpeaking(true);
        setIsPaused(false);
      };

      utterance.onerror = (event) => {
        // 'interrupted' and 'canceled' are normal when speech is stopped early
        if (event.error !== 'interrupted' && event.error !== 'canceled') {
          logger.error('TTS Error:', event.error);
        }
        cleanup();
      };

      utterance.onpause = () => {
        setIsPaused(true);
      };

      utterance.onresume = () => {
        setIsPaused(false);
      };

      utteranceRef.current = utterance;
      synthRef.current.speak(utterance);

      // BH-03 fix: safety timeout — if onend never fires (Firefox bug),
      // reset isSpeaking after estimated duration (text length * 80ms + 3s buffer)
      const safetyMs = Math.min(cleanText.length * 80 + 3000, 30000);
      const safetyTimer = setTimeout(() => {
        if (utteranceRef.current === utterance) {
          setIsSpeaking(false);
          setIsPaused(false);
          utteranceRef.current = null;
        }
      }, safetyMs);
      utterance.onend = () => {
        clearTimeout(safetyTimer);
        setIsSpeaking(false);
        setIsPaused(false);
        utteranceRef.current = null;
      };

      return true;
    } catch (error) {
      logger.error('Errore TTS:', error);
      setIsLoading(false);
      return false;
    }
  }, [isSupported, selectedVoice, cleanup]);

  // Pausa/riprendi
  const togglePause = useCallback(() => {
    if (!isSupported || !isSpeaking) return false;

    try {
      if (isPaused) {
        synthRef.current.resume();
      } else {
        synthRef.current.pause();
      }
      return true;
    } catch (error) {
      logger.error('Errore toggle pause TTS:', error);
      return false;
    }
  }, [isSupported, isSpeaking, isPaused]);

  // Stop
  const stop = useCallback(() => {
// © Andrea Marro — 29/03/2026 — ELAB Tutor — Tutti i diritti riservati
    cleanup();
    return true;
  }, [cleanup]);

  // Cambia voce
  const changeVoice = useCallback((voice) => {
    setSelectedVoice(voice);
  }, []);

  // Test della voce corrente
  const testVoice = useCallback(() => {
    const testText = "Ciao! Sono UNLIM, il tuo compagno di avventure nell'elettronica!";
    return speak(testText);
  }, [speak]);

  return {
    // Stato
    isSupported,
    isSpeaking,
    isPaused,
    isLoading,
    availableVoices,
    selectedVoice,
    
    // Azioni
    speak,
    stop,
    togglePause,
    changeVoice,
    testVoice,
    
    // Utility
    cleanup,
  };
}

export default useTTS;