import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

// Custom per-chunk obfuscation — preserves code-splitting, skips vendor libs
// Session 42: MAXIMUM obfuscation — RC4 100%, CFG 75%, dead code, selfDefending, domain lock
function obfuscateChunks(obfuscatorOptions = {}) {
    // Vendor chunk names to skip (3rd-party libs don't need obfuscation)
    const SKIP_PATTERNS = [
        'react-vendor', 'mammoth', 'codemirror', 'avr-',
        'html2canvas', 'react-pdf', 'DashboardGestionale',
        'ElabTutorV4',  // S47: RC4+CFG causes TDZ crash on this 3.5MB chunk — still minified by Vite
        'ScratchEditor', // S112: Blockly is already Closure-compiled — 2nd obfuscator breaks internal refs (removeElem$module$ ReferenceError)
    ];

    return {
        name: 'elab-obfuscate-chunks',
        apply: 'build',
        enforce: 'post',
        async renderChunk(code, chunk) {
            // Skip vendor/library chunks
            if (SKIP_PATTERNS.some(p => chunk.fileName.includes(p))) return null;
            // Skip tiny chunks (<1KB) — likely empty stubs
            if (code.length < 1000) return null;

            // selfDefending only on main entry chunk — breaks cross-chunk refs otherwise
            const isMainChunk = chunk.isEntry || chunk.fileName.startsWith('index-');
            const chunkOptions = {
                ...obfuscatorOptions,
                selfDefending: isMainChunk ? true : false,
                sourceMap: false,
                inputFileName: chunk.fileName,
            };

            const JavaScriptObfuscator = (await import('javascript-obfuscator')).default;
            const result = JavaScriptObfuscator.obfuscate(code, chunkOptions);
            return { code: result.getObfuscatedCode(), map: null };
        },
    };
}

// Copyright watermark — injects comment every ~200 lines in built JS
function copyrightWatermark() {
    const stamp = `/* (c) Andrea Marro — ${new Date().toISOString().slice(0,10)} — ELAB Tutor — Tutti i diritti riservati */`;
    return {
        name: 'elab-copyright-watermark',
        apply: 'build',
        enforce: 'post',
        generateBundle(_, bundle) {
            for (const [fileName, chunk] of Object.entries(bundle)) {
                if (chunk.type !== 'chunk' || !fileName.endsWith('.js')) continue;
                const lines = chunk.code.split('\n');
                if (lines.length < 200) { chunk.code = stamp + '\n' + chunk.code; continue; }
                const result = [];
                for (let i = 0; i < lines.length; i++) {
                    if (i > 0 && i % 200 === 0) result.push(stamp);
                    result.push(lines[i]);
                }
                chunk.code = stamp + '\n' + result.join('\n');
            }
        },
    };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
            manifest: {
                name: 'ELAB Tutor — Simulatore Arduino',
                short_name: 'ELAB Tutor',
                description: 'Simulatore di circuiti e tutor AI per imparare elettronica e Arduino',
                theme_color: '#1E4D8C',
                background_color: '#F8FAFC',
                display: 'standalone',
                orientation: 'any',
                start_url: '/',
                icons: [
                    { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
                    { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
                    { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
                ],
            },
            workbox: {
                maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
                // G11: Only precache critical path — NOT all chunks
                // Lazy chunks (react-pdf, mammoth, admin, games) cached at runtime
                globPatterns: [
                    'index.html',
                    'assets/index-*.js',          // main entry + react-vendor
                    'assets/index-*.css',          // main CSS
                    'assets/ElabTutorV4-*.js',     // tutor core
                    'assets/ElabTutorV4-*.css',    // tutor CSS
                    'assets/codemirror-*.js',       // code editor
                    'assets/avr-*.js',             // AVR emulation (if separate)
                    'registerSW.js',
                    'fonts/*.woff2',
                ],
                // Exclude heavy chunks from precache
                globIgnores: [
                    'assets/react-pdf*',
                    'assets/mammoth*',
                    'assets/html2canvas*',
                    'assets/DashboardGestionale*',
                    'assets/ScratchEditor*',
                    'assets/GestionalePage*',
                    'assets/Admin*',
                    'assets/Fatturazione*',
                    'assets/CircuitDetective*',
                    'assets/ReverseEngineering*',
                    'assets/PredictObserve*',
                    'assets/TeacherDashboard*',
                    'assets/StudentDashboard*',
                    'assets/VetrinaSimulatore*',
                ],
                runtimeCaching: [
                    {
                        // Lazy-loaded JS chunks — cache after first load
                        urlPattern: /\/assets\/.*\.js$/i,
                        handler: 'StaleWhileRevalidate',
                        options: {
                            cacheName: 'elab-lazy-chunks',
                            expiration: { maxEntries: 60, maxAgeSeconds: 604800 }, // 7 days
                        },
                    },
                    {
                        // Images and SVGs
                        urlPattern: /\/assets\/.*\.(png|svg|jpg|webp)$/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'elab-images',
                            expiration: { maxEntries: 100, maxAgeSeconds: 2592000 }, // 30 days
                        },
                    },
                    {
                        // Hex files for AVR
                        urlPattern: /\/hex\/.*\.hex$/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'elab-hex',
                            expiration: { maxEntries: 30, maxAgeSeconds: 2592000 },
                        },
                    },
                    {
                        urlPattern: /^https:\/\/elab-galileo\.onrender\.com\/.*/i,
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'galileo-api',
                            expiration: { maxEntries: 50, maxAgeSeconds: 86400 },
                            networkTimeoutSeconds: 10,
                        },
                    },
                    {
                        urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'google-fonts',
                            expiration: { maxEntries: 20, maxAgeSeconds: 31536000 },
                        },
                    },
                ],
            },
        }),
        ...(mode === 'production' ? [obfuscateChunks({
            compact: true,
            // Control flow — DISABLED: causes TDZ errors across chunk boundaries
            controlFlowFlattening: false,
            controlFlowFlatteningThreshold: 0,
            // Dead code injection — DISABLED: interacts with CFG to cause TDZ
            deadCodeInjection: false,
            deadCodeInjectionThreshold: 0,
            // Debug protection — DISABLED: causes infinite debugger loops
            // that conflict with browser environments and crash the app
            debugProtection: false,
            debugProtectionInterval: 0,
            // selfDefending is per-chunk (see renderChunk above)
            // String encryption — 100% RC4 (was 75%)
            stringArray: true,
            stringArrayEncoding: ['rc4'],
            stringArrayThreshold: 1.0,
            stringArrayWrappersCount: 5,
            stringArrayWrappersChainedCalls: true,
            // Protect dynamic import paths + asset refs from string encryption
            reservedStrings: ['\\.js', '\\.css', '\\.svg', '\\.png', '\\.jpg', 'assets/'],
            // String splitting — break long strings into chunks (min 10 to protect import paths)
            splitStrings: true,
            splitStringsChunkLength: 10,
            // Transform everything
            transformObjectKeys: true,
            unicodeEscapeSequence: true,
            numbersToExpressions: true,
            // Console output — DISABLED: conflicts with runtime code protection
            // detection and any library that expects console to be callable
            disableConsoleOutput: false,
            // Domain lock — only our domains
            domainLock: [
                '.elabtutor.school',
                '.vercel.app',
                'localhost',
            ],
            domainLockRedirectUrl: 'https://www.elabtutor.school',
            // Identifiers
            identifierNamesGenerator: 'hexadecimal',
            renameGlobals: false,
        }), copyrightWatermark()] : []),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    worker: {
        format: 'es',
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    'codemirror': [
                        'codemirror',
                        '@codemirror/view',
                        '@codemirror/state',
                        '@codemirror/commands',
                        '@codemirror/lang-cpp',
                        '@codemirror/autocomplete',
                        '@codemirror/search',
                        '@codemirror/language',
                        '@codemirror/lint',
                    ],
                    'avr': ['avr8js'],
                    'react-vendor': ['react', 'react-dom'],
                    'html2canvas': ['html2canvas'],
                    'mammoth': ['mammoth'],
                },
            },
        },
        chunkSizeWarningLimit: 1000,
        sourcemap: false,
        // minify: default (esbuild) — TDZ crash is obfuscator/minifier identifier collision (S57: confirmed NOT Rollup chunking)
    },
}))
