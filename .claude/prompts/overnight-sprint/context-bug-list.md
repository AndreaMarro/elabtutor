# Bug List — Antigravity QA Session 5-6

## P1 — Critical (Fix Immediately)

### BUG-1: "Codice Generato" CM6 Panel Missing in Scratch Mode
- **Where**: `NewElabSimulator.jsx` — Scratch editor section
- **Expected**: Side-by-side layout: Blockly (60%) + CodeMirror6 "Codice Generato" (40%)
- **Actual**: Blockly takes 100% width, no CodeMirror panel visible
- **Impact**: Users can't see generated C++ code in real-time
- **Fix**: Verify `editorMode === 'scratch'` flex layout renders both panels

### BUG-2: "Compila & Carica" Non-Functional in Scratch Mode
- **Where**: `ScratchEditor.jsx` / compile pipeline
- **Expected**: Compile button generates C++ from Blockly workspace and compiles
- **Actual**: compile() API returns undefined, no compilation output
- **Impact**: Scratch mode is useless without compilation
- **Fix**: Trace compile() flow from ScratchEditor → scratchGenerator.js → compile endpoint

### BUG-3: v3-cap6-blink Default C++ Code Broken
- **Where**: `experiments-vol3.js` line with v3-cap6-blink experiment
- **Expected**: Valid Arduino C++ with proper brackets
- **Actual**: Malformed brackets in default code
- **Impact**: Experiment loads with broken code, can't compile
- **Fix**: Verify and correct the `defaultCode` field syntax

## P2 — Important (Fix Soon)

### BUG-4: `setSelectedComponent is not defined` ReferenceError
- **Where**: Multiple locations (x4 occurrences)
- **Expected**: No console errors
- **Actual**: ReferenceError logged 4 times
- **Fix**: Check if `setSelectedComponent` is properly imported/defined

### BUG-5: compile() API Returns Undefined
- **Where**: `window.__ELAB_API.compile()`
- **Expected**: Returns compilation result object
- **Actual**: Returns undefined
- **Fix**: Trace the compile function in API surface

### BUG-6: clearAll() Doesn't Fully Clear Components
- **Where**: `window.__ELAB_API.clearAll()`
- **Expected**: Removes all components from breadboard
- **Actual**: Some state may persist
- **Fix**: Verify clearAll resets both visual and solver state

### BUG-7: patch-blockly.js Case C (Local Only)
- **Where**: `scripts/patch-blockly.js`
- **Expected**: Proper patching of Blockly internals
- **Actual**: Ambiguous Case C detection in patching script
- **Fix**: Review patching logic for edge cases

## P3 — Minor

### BUG-8: "Esci da schermo intero" Navigates to #teacher
- **Where**: Fullscreen exit handler
- **Expected**: Returns to previous view
- **Actual**: Navigates to #teacher route
- **Fix**: Check fullscreen exit handler routing logic
