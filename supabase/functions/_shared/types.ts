/**
 * Nanobot V2 — Shared Types
 * (c) Andrea Marro — 02/04/2026
 */

export interface ChatRequest {
  message: string;
  sessionId: string;
  circuitState?: CircuitState | null;
  experimentId?: string | null;
  simulatorContext?: SimulatorContext | null;
  images?: ImageData[];
}

export interface ChatResponse {
  success: boolean;
  response?: string;
  source?: string;
  audio?: string;
  actions?: string[];
  error?: string;
  dataProcessing?: string; // GDPR transparency: which external service processed the data
}

export interface DiagnoseRequest {
  circuitState: CircuitState;
  experimentId?: string | null;
  sessionId?: string; // For consent check
}

export interface DiagnoseResponse {
  success: boolean;
  diagnosis?: string;
  source?: string;
  error?: string;
}

export interface HintsRequest {
  experimentId: string;
  currentStep?: number;
  difficulty?: 'base' | 'intermedio' | 'avanzato';
  sessionId?: string; // For consent check
}

export interface HintsResponse {
  success: boolean;
  hints?: string;
  source?: string;
  error?: string;
}

export interface TTSRequest {
  text: string;
  voice?: string;
  language?: string;
  speed?: number;
}

export interface CircuitState {
  components?: ComponentState[];
  connections?: ConnectionState[];
  errors?: string[];
  structured?: Record<string, unknown>;
  text?: string;
}

export interface ComponentState {
  id: string;
  type: string;
  value?: number | string;
  state?: string;
}

export interface ConnectionState {
  from: string;
  to: string;
  color?: string;
}

export interface SimulatorContext {
  running?: boolean;
  errors?: string[];
  activeExperiment?: string;
}

export interface ImageData {
  base64: string;
  mimeType: string;
}

export interface StudentContext {
  completedExperiments: number;
  totalExperiments: number;
  commonMistakes: string[];
  lastSession: string | null;
  level: 'principiante' | 'intermedio' | 'avanzato';
  currentChapter: number | null;
}

export type GeminiModel =
  | 'gemini-3.1-flash-lite-preview'
  | 'gemini-3-flash-preview'
  | 'gemini-3.1-pro-preview';
