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
        'recharts', 'd3-vendor', 'supabase', 'experiments-vol', // Vendor/data chunks — no obfuscation needed
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
                maximumFileSizeToCacheInBytes: 1600 * 1024, // 1.6MB max per file — excludes large vendor chunks (cached at runtime)
                // G11: Only precache critical path — NOT all chunks
                // Lazy chunks (react-pdf, mammoth, admin, games) cached at runtime
                globPatterns: [
                    'index.html',
                    'assets/index-*.js',          // main entry + react-vendor
                    'assets/index-*.css',          // main CSS
                    'assets/ElabTutorV4-*.js',     // tutor core
                    'assets/ElabTutorV4-*.css',    // tutor CSS
                    // CodeMirror excluded from precache — runtime cached on first use (saves ~460KB)
                    // 'assets/codemirror-*.js',
                    'assets/avr-*.js',             // AVR emulation (if separate)
                    'registerSW.js',
                    'fonts/*.woff2',
                    'hex/*.hex',               // G40: pre-compiled HEX for offline use
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
                            // G40: 30s for Render free tier cold-start (20-50s)
                            networkTimeoutSeconds: 30,
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
                manualChunks(id) {
                    // --- Vendor libraries (explicit splits) ---

                    // React core
                    if (id.includes('node_modules/react-dom/') || id.includes('node_modules/react/')) {
                        return 'react-vendor';
                    }

                    // CodeMirror
                    if (id.includes('node_modules/codemirror/') || id.includes('node_modules/@codemirror/')) {
                        return 'codemirror';
                    }

                    // AVR emulation
                    if (id.includes('node_modules/avr8js/')) {
                        return 'avr';
                    }

                    // react-pdf + pdfjs-dist (always loaded together, lazy-loaded via VolumeViewer)
                    if (id.includes('node_modules/react-pdf/') || id.includes('node_modules/pdfjs-dist/') || id.includes('node_modules/@react-pdf/')) {
                        return 'react-pdf';
                    }

                    // recharts (only used in TeacherDashboard/admin charts)
                    if (id.includes('node_modules/recharts/')) {
                        return 'recharts';
                    }

                    // d3 sub-packages (recharts dependency, split separately)
                    if (id.includes('node_modules/d3-')) {
                        return 'd3-vendor';
                    }

                    // Supabase client
                    if (id.includes('node_modules/@supabase/')) {
                        return 'supabase';
                    }

                    // html2canvas
                    if (id.includes('node_modules/html2canvas/')) {
                        return 'html2canvas';
                    }

                    // mammoth (docx)
                    if (id.includes('node_modules/mammoth/')) {
                        return 'mammoth';
                    }

                    // --- App data splits (experiment data is ~600KB total) ---

                    // Split experiment data per volume
                    if (id.includes('/data/experiments-vol1')) {
                        return 'experiments-vol1';
                    }
                    if (id.includes('/data/experiments-vol2')) {
                        return 'experiments-vol2';
                    }
                    if (id.includes('/data/experiments-vol3')) {
                        return 'experiments-vol3';
                    }
                },
            },
        },
        chunkSizeWarningLimit: 1000,
        sourcemap: false,
        // minify: default (esbuild) — TDZ crash is obfuscator/minifier identifier collision (S57: confirmed NOT Rollup chunking)
    },
}))
