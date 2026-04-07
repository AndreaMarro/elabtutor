// ============================================
// ELAB Tutor - Configurazione Test Vitest
// © Andrea Marro — 15/02/2026
// ============================================

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    test: {
        environment: 'jsdom',
        globals: true,
        css: false,
        setupFiles: ['./tests/setup.js'],
        env: {
            VITE_N8N_AUTH_URL: 'https://api.elab-tutor.test/auth',
            VITE_N8N_GDPR_URL: 'https://api.elab-tutor.test/gdpr',
            VITE_AUTH_URL: 'https://api.elab-tutor.test/auth',
        },
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            thresholds: {
                global: {
                    branches: 60,
                    functions: 60,
                    lines: 60,
                    statements: 60,
                },
            },
            include: [
                'src/services/authService.js',
                'src/utils/crypto.js',
                'src/services/gdprService.js',
                'src/components/simulator/engine/CircuitSolver.js',
                'src/components/simulator/engine/AVRBridge.js',
                'src/components/simulator/engine/PlacementEngine.js',
            ],
        },
        include: ['tests/**/*.{test,spec}.{js,jsx}'],
        exclude: ['node_modules', 'dist', '.idea', '.git', '.cache'],
    },
});
