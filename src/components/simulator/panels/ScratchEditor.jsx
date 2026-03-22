import React, { useEffect, useRef, useCallback } from 'react';
import * as Blockly from 'blockly';
import { arduinoGenerator, generateArduinoCode } from './scratchGenerator';
import './scratchBlocks';

// ─── Blockly 12.4.1 safe-disposal patch ─────────────────────────────────
// Blockly 12.4.1 has an InsertionMarkerPreviewer bug: workspace.dispose()
// crashes in removeTypedBlock (undefined type map) and removeTopBlock
// (throws on missing block). Fixed via postinstall patch in
// scripts/patch-blockly.js — guards both methods at source level.
// workspace.dispose() is now safe to call.
// ─────────────────────────────────────────────────────────────────────────

// ─── ELAB Custom Theme ───────────────────────────────────────
// Palette: Navy #1E4D8C, Lime #7CB342, Bg #1E2530, Grid #2a3040
const ELAB_THEME = Blockly.Theme.defineTheme('elab', {
    name: 'elab',
    base: Blockly.Themes.Classic,
    blockStyles: {
        // Scratch 3.0-inspired saturated colors for maximum visual impact
        logic_blocks:    { colourPrimary: '#5B80A5', colourSecondary: '#4A6D90', colourTertiary: '#3A5A7A' },
        loop_blocks:     { colourPrimary: '#59C059', colourSecondary: '#46AD46', colourTertiary: '#389438' },
        math_blocks:     { colourPrimary: '#59C0C0', colourSecondary: '#46ADAD', colourTertiary: '#389494' },
        text_blocks:     { colourPrimary: '#5CB1D6', colourSecondary: '#4A9BBF', colourTertiary: '#3A85A8' },
        colour_blocks:   { colourPrimary: '#CF63CF', colourSecondary: '#B84DB8', colourTertiary: '#A040A0' },
        variable_blocks: { colourPrimary: '#FF8C1A', colourSecondary: '#E67A0E', colourTertiary: '#CC6800' },
        list_blocks:     { colourPrimary: '#FF6680', colourSecondary: '#E64D66', colourTertiary: '#CC3450' },
        // Arduino custom categories — vivid, distinct colors
        arduino_io:      { colourPrimary: '#4C97FF', colourSecondary: '#3D87E8', colourTertiary: '#2E77D1' },
        arduino_sound:   { colourPrimary: '#CF63CF', colourSecondary: '#B84DB8', colourTertiary: '#A040A0' },
        arduino_servo:   { colourPrimary: '#0FBD8C', colourSecondary: '#0DA87B', colourTertiary: '#0B936A' },
        arduino_time:    { colourPrimary: '#FFAB19', colourSecondary: '#E69A0E', colourTertiary: '#CC8800' },
        arduino_serial:  { colourPrimary: '#5B67A5', colourSecondary: '#4A5690', colourTertiary: '#3A457A' },
        arduino_lcd:     { colourPrimary: '#855CD6', colourSecondary: '#744DBF', colourTertiary: '#633EA8' },
    },
    categoryStyles: {
        logic_category:    { colour: '#5B80A5' },
        loop_category:     { colour: '#59C059' },
        math_category:     { colour: '#59C0C0' },
        text_category:     { colour: '#5CB1D6' },
        variable_category: { colour: '#FF8C1A' },
        arduino_io_cat:    { colour: '#4C97FF' },
        arduino_sound_cat: { colour: '#CF63CF' },
        arduino_servo_cat: { colour: '#0FBD8C' },
        arduino_time_cat:  { colour: '#FFAB19' },
        arduino_serial_cat:{ colour: '#5B67A5' },
        arduino_lcd_cat:   { colour: '#855CD6' },
    },
    componentStyles: {
        workspaceBackgroundColour: '#1E2530',
        toolboxBackgroundColour: '#161B22',
        toolboxForegroundColour: '#C9D1D9',
        flyoutBackgroundColour: '#21262D',
        flyoutForegroundColour: '#C9D1D9',
        flyoutOpacity: 0.95,
        scrollbarColour: '#3A4050',
        scrollbarOpacity: 0.6,
        insertionMarkerColour: '#7CB342',
        insertionMarkerOpacity: 0.4,
        cursorColour: '#7CB342',
    },
    fontStyle: {
        family: "'Open Sans', 'Helvetica Neue', sans-serif",
        weight: '600',
        size: 12,
    },
    startHats: true,
});

// ─── Toolbox XML (ELAB palette colours) ──────────────────────
const TOOLBOX_XML = `
<xml xmlns="https://developers.google.com/blockly/xml">
  <category name="⚡ Logica" categorystyle="logic_category">
    <block type="controls_if"></block>
    <block type="logic_compare"></block>
    <block type="logic_operation"></block>
    <block type="logic_negate"></block>
    <block type="logic_boolean"></block>
  </category>
  <category name="🔁 Cicli" categorystyle="loop_category">
    <block type="controls_repeat_ext">
      <value name="TIMES"><shadow type="math_number"><field name="NUM">10</field></shadow></value>
    </block>
    <block type="controls_whileUntil"></block>
    <block type="controls_for">
      <value name="FROM"><shadow type="math_number"><field name="NUM">1</field></shadow></value>
      <value name="TO"><shadow type="math_number"><field name="NUM">10</field></shadow></value>
      <value name="BY"><shadow type="math_number"><field name="NUM">1</field></shadow></value>
    </block>
    <block type="controls_flow_statements"></block>
  </category>
  <category name="🔢 Matematica" categorystyle="math_category">
    <block type="math_number"><field name="NUM">0</field></block>
    <block type="math_arithmetic">
      <value name="A"><shadow type="math_number"><field name="NUM">1</field></shadow></value>
      <value name="B"><shadow type="math_number"><field name="NUM">1</field></shadow></value>
    </block>
    <block type="arduino_map">
      <value name="FROM_LOW"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
      <value name="FROM_HIGH"><shadow type="math_number"><field name="NUM">1023</field></shadow></value>
      <value name="TO_LOW"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
      <value name="TO_HIGH"><shadow type="math_number"><field name="NUM">255</field></shadow></value>
    </block>
    <block type="arduino_random">
      <value name="MIN"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
      <value name="MAX"><shadow type="math_number"><field name="NUM">3</field></shadow></value>
    </block>
    <block type="math_modulo">
      <value name="DIVIDEND"><shadow type="math_number"><field name="NUM">10</field></shadow></value>
      <value name="DIVISOR"><shadow type="math_number"><field name="NUM">3</field></shadow></value>
    </block>
    <block type="math_constrain">
      <value name="VALUE"><shadow type="math_number"><field name="NUM">50</field></shadow></value>
      <value name="LOW"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
      <value name="HIGH"><shadow type="math_number"><field name="NUM">255</field></shadow></value>
    </block>
  </category>
  <category name="📦 Variabili" categorystyle="variable_category">
    <block type="arduino_variable_set">
      <value name="VALUE"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
    </block>
    <block type="arduino_variable_get"></block>
  </category>
  <category name="📝 Testo" categorystyle="text_category">
    <block type="text"></block>
    <block type="text_join"></block>
  </category>
  <sep gap="16"></sep>
  <category name="📡 Input / Output" categorystyle="arduino_io_cat">
    <block type="arduino_pin_mode"></block>
    <block type="arduino_digital_write"></block>
    <block type="arduino_digital_read"></block>
    <block type="arduino_analog_write"></block>
    <block type="arduino_analog_read"></block>
  </category>
  <category name="🔊 Suono" categorystyle="arduino_sound_cat">
    <block type="arduino_tone">
      <value name="FREQ"><shadow type="math_number"><field name="NUM">440</field></shadow></value>
    </block>
    <block type="arduino_no_tone"></block>
  </category>
  <category name="🎯 Servo" categorystyle="arduino_servo_cat">
    <block type="arduino_servo_attach"></block>
    <block type="arduino_servo_write">
      <value name="ANGLE"><shadow type="math_number"><field name="NUM">90</field></shadow></value>
    </block>
    <block type="arduino_servo_read"></block>
  </category>
  <category name="📺 LCD Display" categorystyle="arduino_lcd_cat">
    <block type="arduino_lcd_init"></block>
    <block type="arduino_lcd_print">
      <value name="TEXT"><shadow type="text"><field name="TEXT">Hello!</field></shadow></value>
    </block>
    <block type="arduino_lcd_set_cursor"></block>
    <block type="arduino_lcd_clear"></block>
  </category>
  <category name="⏱ Tempo" categorystyle="arduino_time_cat">
    <block type="arduino_delay">
      <value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow></value>
    </block>
    <block type="arduino_millis"></block>
  </category>
  <category name="💬 Seriale" categorystyle="arduino_serial_cat">
    <block type="arduino_serial_begin"></block>
    <block type="arduino_serial_print"></block>
    <block type="arduino_serial_available"></block>
    <block type="arduino_serial_read"></block>
  </category>
  <category name="📡 Sensori" categorystyle="arduino_io_cat">
    <block type="arduino_pulse_in"></block>
  </category>
</xml>`;

// ─── CSS overrides for ELAB dark theme + iPad touch ──────────
const ELAB_BLOCKLY_CSS = `
/* Toolbox — iPad touch-friendly (≥44px targets) */
.blocklyToolboxDiv {
  background: var(--color-blockly-toolbox, #161B22) !important;
  border-right: 1px solid var(--color-blockly-grid, #2a3040) !important;
  padding: 4px 0 !important;
  -webkit-overflow-scrolling: touch !important;
}
.blocklyToolboxCategory {
  padding: 10px 12px !important;
  margin: 2px 4px !important;
  border-radius: 8px !important;
  min-height: 44px !important;
  display: flex !important;
  align-items: center !important;
  transition: background 0.15s ease !important;
}
.blocklyToolboxCategory:hover {
  background: var(--color-accent-subtle, rgba(124, 179, 66, 0.12)) !important;
}
.blocklyToolboxCategory[aria-selected="true"],
.blocklyToolboxCategory.blocklyTreeSelected {
  background: var(--color-code-selection, rgba(124, 179, 66, 0.2)) !important;
}
.blocklyToolboxCategoryLabel {
  font-family: var(--font-sans, 'Open Sans', sans-serif) !important;
  font-size: 14px !important;
  font-weight: 600 !important;
  color: var(--color-blockly-text, #C9D1D9) !important;
  letter-spacing: 0.02em !important;
}
.blocklyToolboxCategoryIcon {
  width: 20px !important;
  height: 20px !important;
  border-radius: 4px !important;
}

/* Flyout */
.blocklyFlyoutBackground {
  fill: var(--color-blockly-flyout, #21262D) !important;
  fill-opacity: 0.97 !important;
}

/* Workspace — touch-action for iPad drag */
.blocklyMainBackground {
  fill: var(--color-blockly-bg, #1E2530) !important;
}
.blocklySvg {
  touch-action: none !important;
}
.blocklyDraggable {
  touch-action: none !important;
}

/* Block text */
.blocklyText {
  font-family: var(--font-sans, 'Open Sans', sans-serif) !important;
  font-size: 12px !important;
  font-weight: 500 !important;
  fill: var(--color-text-inverse, #fff) !important;
}
.blocklyEditableText > .blocklyText {
  fill: var(--color-text-inverse, #fff) !important;
}
.blocklyEditableText > rect {
  fill: rgba(255,255,255,0.15) !important;
  rx: 4 !important;
  ry: 4 !important;
}

/* Field inputs */
.blocklyHtmlInput {
  font-family: var(--font-mono, 'Fira Code', monospace) !important;
  font-size: 14px !important;
  background: var(--color-blockly-input-bg, #0D1117) !important;
  color: var(--color-blockly-text, #C9D1D9) !important;
  border: 1px solid var(--color-accent, #7CB342) !important;
  border-radius: 4px !important;
  padding: 4px 6px !important;
  min-height: 32px !important;
}

/* Dropdown arrow */
.blocklyDropdownRect {
  fill: rgba(255,255,255,0.12) !important;
  rx: 4 !important;
  ry: 4 !important;
}

/* Scrollbar — wider for touch */
.blocklyScrollbarHandle {
  fill: var(--color-blockly-scrollbar, #3A4050) !important;
  rx: 4 !important;
  ry: 4 !important;
}
.blocklyScrollbarBackground {
  fill: transparent !important;
}

/* Trashcan */
.blocklyTrash image {
  opacity: 0.6 !important;
}
.blocklyTrash image:hover {
  opacity: 0.9 !important;
}

/* Zoom controls */
.blocklyZoom > image {
  opacity: 0.6 !important;
}
.blocklyZoom > image:hover {
  opacity: 0.9 !important;
}

/* Connection highlight — wider for touch precision */
.blocklyHighlightedConnectionPath {
  stroke: var(--color-accent, #7CB342) !important;
  stroke-width: 4px !important;
}

/* Selected block glow */
.blocklySelected > .blocklyPath {
  stroke: var(--color-accent, #7CB342) !important;
  stroke-width: 3px !important;
}

/* Separator in toolbox */
.blocklyTreeSeparator {
  border-bottom: 1px solid var(--color-blockly-grid, #2a3040) !important;
  margin: 6px 8px !important;
}

/* Flyout blocks — bigger touch targets */
.blocklyFlyout .blocklyDraggable {
  cursor: grab !important;
}
`;

const ScratchEditor = ({ onChange, initialCode }) => {
    const blocklyDiv = useRef(null);
    const workspaceRef = useRef(null);
    const onChangeRef = useRef(onChange);
    const isMountedRef = useRef(false);
    const isReloadingRef = useRef(false); // S112: Guard against onChange during programmatic workspace reloads
    useEffect(() => { onChangeRef.current = onChange; }, [onChange]);

    // Inject ELAB CSS overrides once
    useEffect(() => {
        const id = 'elab-blockly-theme-css';
        if (!document.getElementById(id)) {
            const style = document.createElement('style');
            style.id = id;
            style.textContent = ELAB_BLOCKLY_CSS;
            document.head.appendChild(style);
        }
    }, []);

    useEffect(() => {
        if (!blocklyDiv.current) return;

        // S161.4: Clean up any orphaned Blockly DOM from previous failed mount
        // (prevents InsertionMarker crash cascade on ErrorBoundary retry)
        while (blocklyDiv.current.firstChild) {
            blocklyDiv.current.removeChild(blocklyDiv.current.firstChild);
        }

        workspaceRef.current = Blockly.inject(blocklyDiv.current, {
            toolbox: TOOLBOX_XML,
            theme: ELAB_THEME,
            renderer: 'zelos', // Rounded blocks — cleaner, more modern look
            grid: {
                spacing: 24,
                length: 2,
                colour: '#2a3040',
                snap: true,
            },
            zoom: {
                controls: true,
                wheel: true,
                pinch: true,
                startScale: 1.0,
                maxScale: 2.5,
                minScale: 0.3,
                scaleSpeed: 1.15,
            },
            trashcan: true,
            sounds: false,
            move: {
                scrollbars: { horizontal: true, vertical: true },
                drag: true,
                wheel: true,
            },
        });

        const workspace = workspaceRef.current;

        // S112: Guard — suppress onChange during initial XML load
        isReloadingRef.current = true;
        // Load initial code if exists as XML
        if (initialCode && initialCode.startsWith('<xml')) {
            try {
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(initialCode, 'text/xml');
                Blockly.Xml.domToWorkspace(xmlDoc.documentElement, workspace);
            } catch (e) {
                console.error('[ScratchEditor] Invalid XML for Blockly', e);
            }
        } else {
            const xml = `
            <xml xmlns="https://developers.google.com/blockly/xml">
              <block type="arduino_base" x="40" y="30" deletable="false"></block>
            </xml>`;
            Blockly.Xml.domToWorkspace(Blockly.utils.xml.textToDom(xml), workspace);
        }
        isReloadingRef.current = false;
        // S112: Emit initial onChange with correctly loaded workspace
        try {
            const xmlDom = Blockly.Xml.workspaceToDom(workspace);
            const xmlText = Blockly.Xml.domToText(xmlDom);
            const code = generateArduinoCode(workspace);
            // Use setTimeout to ensure change listener is registered first
            setTimeout(() => onChangeRef.current?.(xmlText, code), 0);
        } catch (_) { /* ignore */ }

        // S83: Wrapped in try-catch to prevent Blockly crash on block move/disconnect
        const onChangeHandler = (event) => {
            if (event?.type === Blockly.Events?.UI || event?.isUiEvent) return;
            // S112: Skip onChange during programmatic workspace reloads (experiment switch)
            // to prevent saving intermediate/cleared workspace XML to localStorage
            if (isReloadingRef.current) return;
            try {
                const xmlDom = Blockly.Xml.workspaceToDom(workspace);
                const xmlText = Blockly.Xml.domToText(xmlDom);
                const code = generateArduinoCode(workspace);
                onChangeRef.current?.(xmlText, code);
            } catch (err) {
                console.warn('[ScratchEditor] Code generation error:', err?.message);
                // Still save workspace XML even if code gen fails
                try {
                    const xmlDom = Blockly.Xml.workspaceToDom(workspace);
                    const xmlText = Blockly.Xml.domToText(xmlDom);
                    onChangeRef.current?.(xmlText, '// Errore generazione codice\n');
                } catch (_) { /* ignore */ }
            }
        };

        workspace.addChangeListener(onChangeHandler);

        // S83: ResizeObserver — recalculate Blockly layout when container resizes
        let resizeObserver;
        if (blocklyDiv.current) {
            resizeObserver = new ResizeObserver(() => {
                try { Blockly.svgResize(workspace); } catch (_) { /* ignore */ }
            });
            resizeObserver.observe(blocklyDiv.current);
        }

        return () => {
            resizeObserver?.disconnect();
            if (workspace) {
                workspace.removeChangeListener(onChangeHandler);
                // Safe to dispose — patched by scripts/patch-blockly.js
                try { workspace.dispose(); } catch (_) { /* ignore residual */ }
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Reload workspace when initialCode changes AFTER mount (e.g., Passo Passo step change, experiment switch)
    useEffect(() => {
        if (!isMountedRef.current) {
            isMountedRef.current = true;
            return;
        }
        if (!workspaceRef.current || !initialCode) return;
        const workspace = workspaceRef.current;
        // S112: Guard — suppress onChange during programmatic clear+load to prevent
        // saving intermediate (empty/wrong) workspace XML to localStorage
        isReloadingRef.current = true;
        workspace.clear();
        if (initialCode.startsWith('<xml')) {
            try {
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(initialCode, 'text/xml');
                Blockly.Xml.domToWorkspace(xmlDoc.documentElement, workspace);
            } catch (e) {
                console.error('[ScratchEditor] Invalid XML reload', e);
            }
        } else {
            const xml = `<xml xmlns="https://developers.google.com/blockly/xml">
              <block type="arduino_base" x="40" y="30" deletable="false"></block>
            </xml>`;
            Blockly.Xml.domToWorkspace(Blockly.utils.xml.textToDom(xml), workspace);
        }
        isReloadingRef.current = false;
        // S112: Emit one final onChange with the correct loaded workspace
        try {
            const xmlDom = Blockly.Xml.workspaceToDom(workspace);
            const xmlText = Blockly.Xml.domToText(xmlDom);
            const code = generateArduinoCode(workspace);
            onChangeRef.current?.(xmlText, code);
        } catch (_) { /* ignore */ }
    }, [initialCode]);

    return (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div
                ref={blocklyDiv}
                style={{ flex: 1, width: '100%', minHeight: '200px' }}
                className="blockly-container"
            />
        </div>
    );
};

export default ScratchEditor;
