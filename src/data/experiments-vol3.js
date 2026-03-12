/**
 * ELAB Experiments — Volume 3: Arduino Programmato
 * 13 esperimenti — Arduino Nano R4, pin digitali, input e analogici
 * Verificato CoVe dai PDF reali del Volume 3 (Cap 6-8)
 * Layout ricalcolato: componenti posizionati SUI fori della breadboard
 * © Andrea Marro — 10/02/2026 — UPDATED 19/02/2026 (components shifted right to avoid Nano overlap)
 *
 * ── Coordinate Reference (NanoR4 HORIZONTAL — OVERLAPPING BB) ────
 * Arduino (nano1) at { x: 230, y: 10 } (HORIZONTAL, overlapping breadboard left side)
 *   - Board body: 139.5 wide x 99 tall, wing extends right
 *     x range: 230 → 369.5 (width = 139.5)
 *     y range: 10 → 109 (board body)
 *     Rect body starts at x=279.5 (SEMI_R=49.5 from origin) — flush with bb1 left edge (280)
 *     Wing pins extend from x=296 to x=365 — fully INSIDE breadboard hole area
 *     Nano body sits ON TOP of breadboard left portion (plugged-in effect)
 *     Nano covers approximately columns 1-14 of the breadboard
 *   - SVG render order: bb1 FIRST, nano1 SECOND (nano appears ON TOP of breadboard)
 *   - IMPORTANT: All components shifted to cols 18+ (resistor pin1 at col 18 minimum to clear Nano right edge at x=397.58)
 *
 * Breadboard (bb1) always at { x: 280, y: 10 }
 *
 * Breadboard hole formula (absolute coords, with bb1 at {280, 10}):
 *   holeX(col) = 297.75 + (col - 1) * 7.5     (col 1-30, 1-based)
 *   rowY = { a: 43.75, b: 51.25, c: 58.75, d: 66.25, e: 73.75,
 *            f: 91.25, g: 98.75, h: 106.25, i: 113.75, j: 121.25 }
 *
 * Component pin offsets (CORRECTED 21/02/2026 from JSX source):
 *   Resistor: pin1=(-26.25,0), pin2=(26.25,0) → spans 52.5px (7 cols)
 *   LED: anode=(-3.75,22.5), cathode=(3.75,22.5) — below center
 *   PushButton: pin1=(-15,-7.5), pin2=(15,-7.5), pin3=(-15,7.5), pin4=(15,7.5)
 *   Potentiometer: vcc=(-7.5,22.5), signal=(0,22.5), gnd=(7.5,22.5)
 *
 * Placement formulas (place specific pin on a breadboard hole):
 *   Resistor pin1 at (col, row):  origin = (holeX(col) + 26.25, rowY[row])
 *   LED anode at (col, row):      origin = (holeX(col) + 3.75,  rowY[row] - 22.5)
 *   Button pin1 at row e (gap):   origin = (holeX(col) + 15,    rowY.e + 7.5) = (..., 81.25)
 *   Pot vcc at (col, row):        origin = (holeX(col) + 7.5,   rowY[row] - 22.5)
 * ──────────────────────────────────────────────────────────────────────
 */

// ═══ Simon Game — Scratch XML Workspaces (progressivi) ═══════════════════

// Step 4: LED rosso completo — blink semplice
const SIMON_SCRATCH_STEP4 = `<xml xmlns="https://developers.google.com/blockly/xml">
<block type="arduino_base" x="40" y="30" deletable="false">
<statement name="SETUP">
<block type="arduino_pin_mode"><field name="PIN">9</field><field name="MODE">OUTPUT</field>
<next><block type="arduino_pin_mode"><field name="PIN">8</field><field name="MODE">OUTPUT</field>
</block></next></block>
</statement>
<statement name="LOOP">
<block type="arduino_digital_write"><field name="PIN">9</field><field name="STATE">HIGH</field>
<next><block type="arduino_tone"><field name="PIN">8</field>
<value name="FREQ"><shadow type="math_number"><field name="NUM">262</field></shadow></value>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">500</field></shadow></value>
<next><block type="arduino_digital_write"><field name="PIN">9</field><field name="STATE">LOW</field>
<next><block type="arduino_no_tone"><field name="PIN">8</field>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">500</field></shadow></value>
</block></next></block></next></block></next></block></next></block></next></block>
</statement>
</block></xml>`;

// Step 16: tutti i 4 LED — random + accensione condizionale
const SIMON_SCRATCH_STEP16 = `<xml xmlns="https://developers.google.com/blockly/xml">
<block type="arduino_base" x="40" y="30" deletable="false">
<statement name="SETUP">
<block type="arduino_pin_mode"><field name="PIN">9</field><field name="MODE">OUTPUT</field>
<next><block type="arduino_pin_mode"><field name="PIN">10</field><field name="MODE">OUTPUT</field>
<next><block type="arduino_pin_mode"><field name="PIN">11</field><field name="MODE">OUTPUT</field>
<next><block type="arduino_pin_mode"><field name="PIN">12</field><field name="MODE">OUTPUT</field>
<next><block type="arduino_pin_mode"><field name="PIN">8</field><field name="MODE">OUTPUT</field>
</block></next></block></next></block></next></block></next></block>
</statement>
<statement name="LOOP">
<block type="arduino_variable_set"><field name="TYPE">int</field><field name="VAR">ledNum</field>
<value name="VALUE"><block type="arduino_random">
<value name="MIN"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
<value name="MAX"><shadow type="math_number"><field name="NUM">3</field></shadow></value>
</block></value>
<next><block type="controls_if">
<value name="IF0"><block type="logic_compare"><field name="OP">EQ</field>
<value name="A"><block type="arduino_variable_get"><field name="VAR">ledNum</field></block></value>
<value name="B"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
</block></value>
<statement name="DO0">
<block type="arduino_digital_write"><field name="PIN">9</field><field name="STATE">HIGH</field>
<next><block type="arduino_tone"><field name="PIN">8</field><value name="FREQ"><shadow type="math_number"><field name="NUM">262</field></shadow></value>
</block></next></block>
</statement>
<next><block type="controls_if">
<value name="IF0"><block type="logic_compare"><field name="OP">EQ</field>
<value name="A"><block type="arduino_variable_get"><field name="VAR">ledNum</field></block></value>
<value name="B"><shadow type="math_number"><field name="NUM">1</field></shadow></value>
</block></value>
<statement name="DO0">
<block type="arduino_digital_write"><field name="PIN">10</field><field name="STATE">HIGH</field>
<next><block type="arduino_tone"><field name="PIN">8</field><value name="FREQ"><shadow type="math_number"><field name="NUM">330</field></shadow></value>
</block></next></block>
</statement>
<next><block type="controls_if">
<value name="IF0"><block type="logic_compare"><field name="OP">EQ</field>
<value name="A"><block type="arduino_variable_get"><field name="VAR">ledNum</field></block></value>
<value name="B"><shadow type="math_number"><field name="NUM">2</field></shadow></value>
</block></value>
<statement name="DO0">
<block type="arduino_digital_write"><field name="PIN">11</field><field name="STATE">HIGH</field>
<next><block type="arduino_tone"><field name="PIN">8</field><value name="FREQ"><shadow type="math_number"><field name="NUM">392</field></shadow></value>
</block></next></block>
</statement>
<next><block type="controls_if">
<value name="IF0"><block type="logic_compare"><field name="OP">EQ</field>
<value name="A"><block type="arduino_variable_get"><field name="VAR">ledNum</field></block></value>
<value name="B"><shadow type="math_number"><field name="NUM">3</field></shadow></value>
</block></value>
<statement name="DO0">
<block type="arduino_digital_write"><field name="PIN">12</field><field name="STATE">HIGH</field>
<next><block type="arduino_tone"><field name="PIN">8</field><value name="FREQ"><shadow type="math_number"><field name="NUM">523</field></shadow></value>
</block></next></block>
</statement>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">500</field></shadow></value>
<next><block type="arduino_digital_write"><field name="PIN">9</field><field name="STATE">LOW</field>
<next><block type="arduino_digital_write"><field name="PIN">10</field><field name="STATE">LOW</field>
<next><block type="arduino_digital_write"><field name="PIN">11</field><field name="STATE">LOW</field>
<next><block type="arduino_digital_write"><field name="PIN">12</field><field name="STATE">LOW</field>
<next><block type="arduino_no_tone"><field name="PIN">8</field>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">300</field></shadow></value>
</block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block>
</next></block>
</statement>
</block></xml>`;

// Step 28: tutti i pulsanti — setup completo + lettura bottoni
const SIMON_SCRATCH_STEP28 = `<xml xmlns="https://developers.google.com/blockly/xml">
<block type="arduino_base" x="40" y="30" deletable="false">
<statement name="SETUP">
<block type="arduino_pin_mode"><field name="PIN">9</field><field name="MODE">OUTPUT</field>
<next><block type="arduino_pin_mode"><field name="PIN">10</field><field name="MODE">OUTPUT</field>
<next><block type="arduino_pin_mode"><field name="PIN">11</field><field name="MODE">OUTPUT</field>
<next><block type="arduino_pin_mode"><field name="PIN">12</field><field name="MODE">OUTPUT</field>
<next><block type="arduino_pin_mode"><field name="PIN">8</field><field name="MODE">OUTPUT</field>
<next><block type="arduino_pin_mode"><field name="PIN">3</field><field name="MODE">INPUT_PULLUP</field>
<next><block type="arduino_pin_mode"><field name="PIN">5</field><field name="MODE">INPUT_PULLUP</field>
<next><block type="arduino_pin_mode"><field name="PIN">6</field><field name="MODE">INPUT_PULLUP</field>
<next><block type="arduino_pin_mode"><field name="PIN">13</field><field name="MODE">INPUT_PULLUP</field>
<next><block type="arduino_serial_begin"><field name="BAUD">9600</field>
</block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block>
</statement>
<statement name="LOOP">
<block type="controls_if">
<value name="IF0"><block type="logic_compare"><field name="OP">EQ</field>
<value name="A"><block type="arduino_digital_read"><field name="PIN">3</field></block></value>
<value name="B"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
</block></value>
<statement name="DO0">
<block type="arduino_digital_write"><field name="PIN">9</field><field name="STATE">HIGH</field>
<next><block type="arduino_tone"><field name="PIN">8</field><value name="FREQ"><shadow type="math_number"><field name="NUM">262</field></shadow></value>
<next><block type="arduino_serial_print"><field name="NEWLINE">TRUE</field>
<value name="CONTENT"><shadow type="text"><field name="TEXT">Rosso!</field></shadow></value>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">300</field></shadow></value>
<next><block type="arduino_digital_write"><field name="PIN">9</field><field name="STATE">LOW</field>
<next><block type="arduino_no_tone"><field name="PIN">8</field>
</block></next></block></next></block></next></block></next></block></next></block>
</statement>
<next><block type="controls_if">
<value name="IF0"><block type="logic_compare"><field name="OP">EQ</field>
<value name="A"><block type="arduino_digital_read"><field name="PIN">5</field></block></value>
<value name="B"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
</block></value>
<statement name="DO0">
<block type="arduino_digital_write"><field name="PIN">10</field><field name="STATE">HIGH</field>
<next><block type="arduino_tone"><field name="PIN">8</field><value name="FREQ"><shadow type="math_number"><field name="NUM">330</field></shadow></value>
<next><block type="arduino_serial_print"><field name="NEWLINE">TRUE</field>
<value name="CONTENT"><shadow type="text"><field name="TEXT">Verde!</field></shadow></value>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">300</field></shadow></value>
<next><block type="arduino_digital_write"><field name="PIN">10</field><field name="STATE">LOW</field>
<next><block type="arduino_no_tone"><field name="PIN">8</field>
</block></next></block></next></block></next></block></next></block></next></block>
</statement>
<next><block type="controls_if">
<value name="IF0"><block type="logic_compare"><field name="OP">EQ</field>
<value name="A"><block type="arduino_digital_read"><field name="PIN">6</field></block></value>
<value name="B"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
</block></value>
<statement name="DO0">
<block type="arduino_digital_write"><field name="PIN">11</field><field name="STATE">HIGH</field>
<next><block type="arduino_tone"><field name="PIN">8</field><value name="FREQ"><shadow type="math_number"><field name="NUM">392</field></shadow></value>
<next><block type="arduino_serial_print"><field name="NEWLINE">TRUE</field>
<value name="CONTENT"><shadow type="text"><field name="TEXT">Blu!</field></shadow></value>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">300</field></shadow></value>
<next><block type="arduino_digital_write"><field name="PIN">11</field><field name="STATE">LOW</field>
<next><block type="arduino_no_tone"><field name="PIN">8</field>
</block></next></block></next></block></next></block></next></block></next></block>
</statement>
<next><block type="controls_if">
<value name="IF0"><block type="logic_compare"><field name="OP">EQ</field>
<value name="A"><block type="arduino_digital_read"><field name="PIN">13</field></block></value>
<value name="B"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
</block></value>
<statement name="DO0">
<block type="arduino_digital_write"><field name="PIN">12</field><field name="STATE">HIGH</field>
// © Andrea Marro — 12/03/2026 — ELAB Tutor — Tutti i diritti riservati
<next><block type="arduino_tone"><field name="PIN">8</field><value name="FREQ"><shadow type="math_number"><field name="NUM">523</field></shadow></value>
<next><block type="arduino_serial_print"><field name="NEWLINE">TRUE</field>
<value name="CONTENT"><shadow type="text"><field name="TEXT">Giallo!</field></shadow></value>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">300</field></shadow></value>
<next><block type="arduino_digital_write"><field name="PIN">12</field><field name="STATE">LOW</field>
<next><block type="arduino_no_tone"><field name="PIN">8</field>
</block></next></block></next></block></next></block></next></block></next></block>
</statement>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">50</field></shadow></value>
</block></next></block></next></block></next></block></next></block>
</statement>
</block></xml>`;

// Workspace COMPLETO — Simon semplificato (random + accendi LED + leggi pulsanti + verifica)
const SIMON_SCRATCH_FULL = `<xml xmlns="https://developers.google.com/blockly/xml">
<block type="arduino_base" x="40" y="30" deletable="false">
<statement name="SETUP">
<block type="arduino_pin_mode"><field name="PIN">9</field><field name="MODE">OUTPUT</field>
<next><block type="arduino_pin_mode"><field name="PIN">10</field><field name="MODE">OUTPUT</field>
<next><block type="arduino_pin_mode"><field name="PIN">11</field><field name="MODE">OUTPUT</field>
<next><block type="arduino_pin_mode"><field name="PIN">12</field><field name="MODE">OUTPUT</field>
<next><block type="arduino_pin_mode"><field name="PIN">8</field><field name="MODE">OUTPUT</field>
<next><block type="arduino_pin_mode"><field name="PIN">3</field><field name="MODE">INPUT_PULLUP</field>
<next><block type="arduino_pin_mode"><field name="PIN">5</field><field name="MODE">INPUT_PULLUP</field>
<next><block type="arduino_pin_mode"><field name="PIN">6</field><field name="MODE">INPUT_PULLUP</field>
<next><block type="arduino_pin_mode"><field name="PIN">13</field><field name="MODE">INPUT_PULLUP</field>
<next><block type="arduino_serial_begin"><field name="BAUD">9600</field>
</block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block>
</statement>
<statement name="LOOP">
<block type="arduino_variable_set"><field name="TYPE">int</field><field name="VAR">nuovoLed</field>
<value name="VALUE"><block type="arduino_random">
<value name="MIN"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
<value name="MAX"><shadow type="math_number"><field name="NUM">3</field></shadow></value>
</block></value>
<next><block type="arduino_serial_print"><field name="NEWLINE">TRUE</field>
<value name="CONTENT"><block type="text_join"><mutation items="2"/>
<value name="ADD0"><shadow type="text"><field name="TEXT">LED: </field></shadow></value>
<value name="ADD1"><block type="arduino_variable_get"><field name="VAR">nuovoLed</field></block></value>
</block></value>
<next><block type="controls_if">
<value name="IF0"><block type="logic_compare"><field name="OP">EQ</field>
<value name="A"><block type="arduino_variable_get"><field name="VAR">nuovoLed</field></block></value>
<value name="B"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
</block></value>
<statement name="DO0">
<block type="arduino_digital_write"><field name="PIN">9</field><field name="STATE">HIGH</field>
<next><block type="arduino_tone"><field name="PIN">8</field><value name="FREQ"><shadow type="math_number"><field name="NUM">262</field></shadow></value>
</block></next></block>
</statement>
<next><block type="controls_if">
<value name="IF0"><block type="logic_compare"><field name="OP">EQ</field>
<value name="A"><block type="arduino_variable_get"><field name="VAR">nuovoLed</field></block></value>
<value name="B"><shadow type="math_number"><field name="NUM">1</field></shadow></value>
</block></value>
<statement name="DO0">
<block type="arduino_digital_write"><field name="PIN">10</field><field name="STATE">HIGH</field>
<next><block type="arduino_tone"><field name="PIN">8</field><value name="FREQ"><shadow type="math_number"><field name="NUM">330</field></shadow></value>
</block></next></block>
</statement>
<next><block type="controls_if">
<value name="IF0"><block type="logic_compare"><field name="OP">EQ</field>
<value name="A"><block type="arduino_variable_get"><field name="VAR">nuovoLed</field></block></value>
<value name="B"><shadow type="math_number"><field name="NUM">2</field></shadow></value>
</block></value>
<statement name="DO0">
<block type="arduino_digital_write"><field name="PIN">11</field><field name="STATE">HIGH</field>
<next><block type="arduino_tone"><field name="PIN">8</field><value name="FREQ"><shadow type="math_number"><field name="NUM">392</field></shadow></value>
</block></next></block>
</statement>
<next><block type="controls_if">
<value name="IF0"><block type="logic_compare"><field name="OP">EQ</field>
<value name="A"><block type="arduino_variable_get"><field name="VAR">nuovoLed</field></block></value>
<value name="B"><shadow type="math_number"><field name="NUM">3</field></shadow></value>
</block></value>
<statement name="DO0">
<block type="arduino_digital_write"><field name="PIN">12</field><field name="STATE">HIGH</field>
<next><block type="arduino_tone"><field name="PIN">8</field><value name="FREQ"><shadow type="math_number"><field name="NUM">523</field></shadow></value>
</block></next></block>
</statement>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">500</field></shadow></value>
<next><block type="arduino_digital_write"><field name="PIN">9</field><field name="STATE">LOW</field>
<next><block type="arduino_digital_write"><field name="PIN">10</field><field name="STATE">LOW</field>
<next><block type="arduino_digital_write"><field name="PIN">11</field><field name="STATE">LOW</field>
<next><block type="arduino_digital_write"><field name="PIN">12</field><field name="STATE">LOW</field>
<next><block type="arduino_no_tone"><field name="PIN">8</field>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow></value>
<next><block type="controls_if">
<value name="IF0"><block type="logic_compare"><field name="OP">EQ</field>
<value name="A"><block type="arduino_digital_read"><field name="PIN">3</field></block></value>
<value name="B"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
</block></value>
<statement name="DO0">
<block type="arduino_digital_write"><field name="PIN">9</field><field name="STATE">HIGH</field>
<next><block type="arduino_tone"><field name="PIN">8</field><value name="FREQ"><shadow type="math_number"><field name="NUM">262</field></shadow></value>
<next><block type="arduino_serial_print"><field name="NEWLINE">TRUE</field>
<value name="CONTENT"><shadow type="text"><field name="TEXT">Rosso premuto!</field></shadow></value>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">200</field></shadow></value>
<next><block type="arduino_digital_write"><field name="PIN">9</field><field name="STATE">LOW</field>
<next><block type="arduino_no_tone"><field name="PIN">8</field>
</block></next></block></next></block></next></block></next></block></next></block>
</statement>
<next><block type="controls_if">
<value name="IF0"><block type="logic_compare"><field name="OP">EQ</field>
<value name="A"><block type="arduino_digital_read"><field name="PIN">5</field></block></value>
<value name="B"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
</block></value>
<statement name="DO0">
<block type="arduino_digital_write"><field name="PIN">10</field><field name="STATE">HIGH</field>
<next><block type="arduino_tone"><field name="PIN">8</field><value name="FREQ"><shadow type="math_number"><field name="NUM">330</field></shadow></value>
<next><block type="arduino_serial_print"><field name="NEWLINE">TRUE</field>
<value name="CONTENT"><shadow type="text"><field name="TEXT">Verde premuto!</field></shadow></value>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">200</field></shadow></value>
<next><block type="arduino_digital_write"><field name="PIN">10</field><field name="STATE">LOW</field>
<next><block type="arduino_no_tone"><field name="PIN">8</field>
</block></next></block></next></block></next></block></next></block></next></block>
</statement>
<next><block type="controls_if">
<value name="IF0"><block type="logic_compare"><field name="OP">EQ</field>
<value name="A"><block type="arduino_digital_read"><field name="PIN">6</field></block></value>
<value name="B"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
</block></value>
<statement name="DO0">
<block type="arduino_digital_write"><field name="PIN">11</field><field name="STATE">HIGH</field>
<next><block type="arduino_tone"><field name="PIN">8</field><value name="FREQ"><shadow type="math_number"><field name="NUM">392</field></shadow></value>
<next><block type="arduino_serial_print"><field name="NEWLINE">TRUE</field>
<value name="CONTENT"><shadow type="text"><field name="TEXT">Blu premuto!</field></shadow></value>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">200</field></shadow></value>
<next><block type="arduino_digital_write"><field name="PIN">11</field><field name="STATE">LOW</field>
<next><block type="arduino_no_tone"><field name="PIN">8</field>
</block></next></block></next></block></next></block></next></block></next></block>
</statement>
<next><block type="controls_if">
<value name="IF0"><block type="logic_compare"><field name="OP">EQ</field>
<value name="A"><block type="arduino_digital_read"><field name="PIN">13</field></block></value>
<value name="B"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
</block></value>
<statement name="DO0">
<block type="arduino_digital_write"><field name="PIN">12</field><field name="STATE">HIGH</field>
<next><block type="arduino_tone"><field name="PIN">8</field><value name="FREQ"><shadow type="math_number"><field name="NUM">523</field></shadow></value>
<next><block type="arduino_serial_print"><field name="NEWLINE">TRUE</field>
<value name="CONTENT"><shadow type="text"><field name="TEXT">Giallo premuto!</field></shadow></value>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">200</field></shadow></value>
<next><block type="arduino_digital_write"><field name="PIN">12</field><field name="STATE">LOW</field>
<next><block type="arduino_no_tone"><field name="PIN">8</field>
</block></next></block></next></block></next></block></next></block></next></block>
</statement>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">50</field></shadow></value>
</block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block>
</next></block>
</statement>
</block></xml>`;

// ═══ Scratch XML Workspaces — Esperimenti Vol3 ═══════════════════════════

// Cap.6 Esp.1 — LED Blink esterno (pin 13)
const BLINK_SCRATCH = `<xml xmlns="https://developers.google.com/blockly/xml">
<block type="arduino_base" x="40" y="30" deletable="false">
<statement name="SETUP">
<block type="arduino_pin_mode"><field name="PIN">13</field><field name="MODE">OUTPUT</field></block>
</statement>
<statement name="LOOP">
<block type="arduino_digital_write"><field name="PIN">13</field><field name="STATE">HIGH</field>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow></value>
<next><block type="arduino_digital_write"><field name="PIN">13</field><field name="STATE">LOW</field>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow></value>
</block></next></block></next></block></next></block>
</statement>
</block></xml>`;

// Cap.6 Esp.2 — Cambia pin D5
const PIN5_SCRATCH = `<xml xmlns="https://developers.google.com/blockly/xml">
<block type="arduino_base" x="40" y="30" deletable="false">
<statement name="SETUP">
<block type="arduino_pin_mode"><field name="PIN">5</field><field name="MODE">OUTPUT</field></block>
</statement>
<statement name="LOOP">
<block type="arduino_digital_write"><field name="PIN">5</field><field name="STATE">HIGH</field>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow></value>
<next><block type="arduino_digital_write"><field name="PIN">5</field><field name="STATE">LOW</field>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow></value>
</block></next></block></next></block></next></block>
</statement>
</block></xml>`;

// Cap.6 Esp.4 — Sirena 2 LED (pin 10, pin 9)
const SIRENA_SCRATCH = `<xml xmlns="https://developers.google.com/blockly/xml">
<block type="arduino_base" x="40" y="30" deletable="false">
<statement name="SETUP">
<block type="arduino_pin_mode"><field name="PIN">10</field><field name="MODE">OUTPUT</field>
<next><block type="arduino_pin_mode"><field name="PIN">9</field><field name="MODE">OUTPUT</field>
</block></next></block>
</statement>
<statement name="LOOP">
<block type="arduino_digital_write"><field name="PIN">10</field><field name="STATE">HIGH</field>
<next><block type="arduino_digital_write"><field name="PIN">9</field><field name="STATE">LOW</field>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">200</field></shadow></value>
<next><block type="arduino_digital_write"><field name="PIN">10</field><field name="STATE">LOW</field>
<next><block type="arduino_digital_write"><field name="PIN">9</field><field name="STATE">HIGH</field>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">200</field></shadow></value>
// © Andrea Marro — 12/03/2026 — ELAB Tutor — Tutti i diritti riservati
</block></next></block></next></block></next></block></next></block></next></block>
</statement>
</block></xml>`;

// Cap.6 Esp.5 — Semaforo 3 LED (pin 5 verde, pin 6 giallo, pin 3 rosso)
const SEMAFORO_SCRATCH = `<xml xmlns="https://developers.google.com/blockly/xml">
<block type="arduino_base" x="40" y="30" deletable="false">
<statement name="SETUP">
<block type="arduino_pin_mode"><field name="PIN">5</field><field name="MODE">OUTPUT</field>
<next><block type="arduino_pin_mode"><field name="PIN">6</field><field name="MODE">OUTPUT</field>
<next><block type="arduino_pin_mode"><field name="PIN">3</field><field name="MODE">OUTPUT</field>
</block></next></block></next></block>
</statement>
<statement name="LOOP">
<block type="arduino_digital_write"><field name="PIN">5</field><field name="STATE">HIGH</field>
<next><block type="arduino_digital_write"><field name="PIN">6</field><field name="STATE">LOW</field>
<next><block type="arduino_digital_write"><field name="PIN">3</field><field name="STATE">LOW</field>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">3000</field></shadow></value>
<next><block type="arduino_digital_write"><field name="PIN">5</field><field name="STATE">LOW</field>
<next><block type="arduino_digital_write"><field name="PIN">6</field><field name="STATE">HIGH</field>
<next><block type="arduino_digital_write"><field name="PIN">3</field><field name="STATE">LOW</field>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow></value>
<next><block type="arduino_digital_write"><field name="PIN">5</field><field name="STATE">LOW</field>
<next><block type="arduino_digital_write"><field name="PIN">6</field><field name="STATE">LOW</field>
<next><block type="arduino_digital_write"><field name="PIN">3</field><field name="STATE">HIGH</field>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">3000</field></shadow></value>
</block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block>
</statement>
</block></xml>`;

// Cap.7 Esp.2 — Pulsante accende LED (pin 6 input, pin 10 output)
const PULSANTE_SCRATCH = `<xml xmlns="https://developers.google.com/blockly/xml">
<block type="arduino_base" x="40" y="30" deletable="false">
<statement name="SETUP">
<block type="arduino_pin_mode"><field name="PIN">6</field><field name="MODE">INPUT_PULLUP</field>
<next><block type="arduino_pin_mode"><field name="PIN">10</field><field name="MODE">OUTPUT</field>
</block></next></block>
</statement>
<statement name="LOOP">
<block type="controls_if">
<mutation else="1"/>
<value name="IF0">
<block type="logic_compare"><field name="OP">EQ</field>
<value name="A"><block type="arduino_digital_read"><field name="PIN">6</field></block></value>
<value name="B"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
</block>
</value>
<statement name="DO0">
<block type="arduino_digital_write"><field name="PIN">10</field><field name="STATE">HIGH</field></block>
</statement>
<statement name="ELSE">
<block type="arduino_digital_write"><field name="PIN">10</field><field name="STATE">LOW</field></block>
</statement>
</block>
</statement>
</block></xml>`;

// Cap.8 Esp.3 — analogRead + Serial Monitor (A0 + serial 9600)
const SERIAL_SCRATCH = `<xml xmlns="https://developers.google.com/blockly/xml">
<block type="arduino_base" x="40" y="30" deletable="false">
<statement name="SETUP">
<block type="arduino_serial_begin"><field name="BAUD">9600</field></block>
</statement>
<statement name="LOOP">
<block type="arduino_variable_set"><field name="TYPE">int</field><field name="VAR">valore</field>
<value name="VALUE"><block type="arduino_analog_read"><field name="PIN">A0</field></block></value>
<next><block type="arduino_serial_print"><field name="NEWLINE">TRUE</field>
<value name="CONTENT"><block type="arduino_variable_get"><field name="VAR">valore</field></block></value>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">200</field></shadow></value>
</block></next></block></next></block>
</statement>
</block></xml>`;

// Extra — Servo Sweep (pin 9, semplificato: 0° → 180° → ripeti)
const SERVO_SCRATCH = `<xml xmlns="https://developers.google.com/blockly/xml">
<block type="arduino_base" x="40" y="30" deletable="false">
<statement name="SETUP">
<block type="arduino_servo_attach"><field name="PIN">9</field></block>
</statement>
<statement name="LOOP">
<block type="arduino_servo_write">
<value name="ANGLE"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow></value>
<next><block type="arduino_servo_write">
<value name="ANGLE"><shadow type="math_number"><field name="NUM">180</field></shadow></value>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow></value>
</block></next></block></next></block></next></block>
</statement>
</block></xml>`;

// ═══════════════════════════════════════════════════════════════════════════

// Cap.6 Esp.3 — SOS Morse (pin 13, Ripeti blocchi per punto/linea)
// Cap.7 Esp.1 — Pulsante INPUT_PULLUP (pin 6, solo digitalRead, nessun output)
const PULLUP_SCRATCH = `<xml xmlns="https://developers.google.com/blockly/xml"><block type="arduino_base" x="40" y="30" deletable="false"><statement name="SETUP"><block type="arduino_pin_mode"><field name="PIN">6</field><field name="MODE">INPUT_PULLUP</field></block></statement><statement name="LOOP"><block type="arduino_variable_set"><field name="TYPE">int</field><field name="VAR">stato</field><value name="VALUE"><block type="arduino_digital_read"><field name="PIN">6</field></block></value></block></statement></block></xml>`;

const MORSE_SCRATCH = `<xml xmlns="https://developers.google.com/blockly/xml">
<block type="arduino_base" x="40" y="30" deletable="false">
<statement name="SETUP">
<block type="arduino_pin_mode"><field name="PIN">13</field><field name="MODE">OUTPUT</field></block>
</statement>
<statement name="LOOP">
<block type="controls_repeat_ext">
<value name="TIMES"><shadow type="math_number"><field name="NUM">3</field></shadow></value>
<statement name="DO">
<block type="arduino_digital_write"><field name="PIN">13</field><field name="STATE">HIGH</field>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">200</field></shadow></value>
<next><block type="arduino_digital_write"><field name="PIN">13</field><field name="STATE">LOW</field>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">200</field></shadow></value>
</block></next></block></next></block></next></block>
</statement>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">600</field></shadow></value>
<next><block type="controls_repeat_ext">
<value name="TIMES"><shadow type="math_number"><field name="NUM">3</field></shadow></value>
<statement name="DO">
<block type="arduino_digital_write"><field name="PIN">13</field><field name="STATE">HIGH</field>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">600</field></shadow></value>
<next><block type="arduino_digital_write"><field name="PIN">13</field><field name="STATE">LOW</field>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">200</field></shadow></value>
</block></next></block></next></block></next></block>
</statement>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">600</field></shadow></value>
<next><block type="controls_repeat_ext">
<value name="TIMES"><shadow type="math_number"><field name="NUM">3</field></shadow></value>
<statement name="DO">
<block type="arduino_digital_write"><field name="PIN">13</field><field name="STATE">HIGH</field>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">200</field></shadow></value>
<next><block type="arduino_digital_write"><field name="PIN">13</field><field name="STATE">LOW</field>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">200</field></shadow></value>
</block></next></block></next></block></next></block>
</statement>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">2000</field></shadow></value>
</block></next></block></next></block></next></block></next></block></next></block>
</statement>
</block></xml>`;

// Cap.7 Esp.3 — 2 LED + Pulsante semplificato (D6=btn, D10=verde, D9=rosso)
const MINI_TOGGLE_SCRATCH = `<xml xmlns="https://developers.google.com/blockly/xml">
<block type="arduino_base" x="40" y="30" deletable="false">
<statement name="SETUP">
<block type="arduino_pin_mode"><field name="PIN">6</field><field name="MODE">INPUT_PULLUP</field>
<next><block type="arduino_pin_mode"><field name="PIN">10</field><field name="MODE">OUTPUT</field>
<next><block type="arduino_pin_mode"><field name="PIN">9</field><field name="MODE">OUTPUT</field>
</block></next></block></next></block>
</statement>
<statement name="LOOP">
<block type="controls_if">
<mutation else="1"/>
<value name="IF0">
<block type="logic_compare"><field name="OP">EQ</field>
<value name="A"><block type="arduino_digital_read"><field name="PIN">6</field></block></value>
<value name="B"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
</block>
</value>
<statement name="DO0">
<block type="arduino_digital_write"><field name="PIN">10</field><field name="STATE">HIGH</field>
<next><block type="arduino_digital_write"><field name="PIN">9</field><field name="STATE">LOW</field>
</block></next></block>
</statement>
<statement name="ELSE">
<block type="arduino_digital_write"><field name="PIN">10</field><field name="STATE">LOW</field>
<next><block type="arduino_digital_write"><field name="PIN">9</field><field name="STATE">HIGH</field>
</block></next></block>
</statement>
</block>
</statement>
</block></xml>`;

const EXPERIMENTS_VOL3 = {
  title: "Volume 3 - Arduino Programmato",
  subtitle: "Programmazione Arduino: LED, pulsanti, sensori analogici",
  icon: "\u{1F4D5}",
  color: "#E54B3D",
  experiments: [
    // ═══════════════════════════════════════════════════
    // CAPITOLO 6 — I pin digitali (5 esperimenti)
    // ═══════════════════════════════════════════════════
    {
      id: "v3-cap6-blink",
      title: "Cap. 6 Esp. 1 - LED Blink esterno",
      desc: "Il classico blink! Fai lampeggiare un LED collegato al pin 13 dell'Arduino.",
      chapter: "Capitolo 6 - I pin digitali",
      difficulty: 1,
      icon: "\u{1F4A1}",
      simulationMode: "avr",
      components: [
        { type: "breadboard-half", id: "bb1" },
        { type: "nano-r4", id: "nano1" },
        { type: "resistor", id: "r1", value: 470 },
        { type: "led", id: "led1", color: "red" }
      ],
      pinAssignments: {
        "r1:pin1": "bb1:c18",
        "r1:pin2": "bb1:c25",
        "led1:anode": "bb1:d27",
        "led1:cathode": "bb1:d28"
      },
      connections: [
        { from: "nano1:W_D13", to: "bb1:a18", color: "orange" },
        { from: "bb1:d25", to: "bb1:d27", color: "green" },
// © Andrea Marro — 12/03/2026 — ELAB Tutor — Tutti i diritti riservati
        { from: "bb1:a28", to: "bb1:bus-bot-minus-28", color: "black" },
        { from: "nano1:GND_R", to: "bb1:bus-bot-minus-1", color: "black" },
        { from: "nano1:5V", to: "bb1:bus-bot-plus-1", color: "red" }
      ],
      // R1: pin1 on row c col 18, pin2 at col 25
      // LED1: anode on row d col 27 (shifted +2 from r1:pin2), cathode d28
      // Bridge d25→d27 connects R1 to LED. D13 → a18, cathode → GND bus
      layout: {
        "nano1": { x: 230, y: 10 },
        "bb1": { x: 280, y: 10 },
        "r1": { x: 451.5, y: 58.75 },
        "led1": { x: 496.5, y: 43.75 }
      },
      steps: [
        "Posiziona l'Arduino Nano sulla breadboard e collegalo al computer con il cavo USB-C.",
        "Inserisci il resistore da 470\u03A9 tra la fila c colonna 18 e la fila c colonna 25.",
        "Inserisci il LED rosso: anodo (+, gamba lunga) sulla fila d colonna 27, catodo (-) sulla fila d colonna 28.",
        "Collega un filo verde dalla fila d colonna 25 alla fila d colonna 27 (ponte resistore-LED).",
        "Collega il pin D13 dell'Arduino alla fila a colonna 18 con un filo arancione (stessa colonna del resistore).",
        "Collega la fila a colonna 28 al binario GND (-) con un filo nero.",
        "Collega il GND dell'Arduino al binario GND e il 5V al binario +. Carica il programma!"
      ],
      observe: "Il LED rosso si accende per 1 secondo, poi si spegne per 1 secondo, e continua a ripetere all'infinito. Questo è il programma più semplice di Arduino: accendi, aspetta, spegni, aspetta!",
      galileoPrompt: "Sei Galileo, il tutor AI di ELAB. Lo studente sta guardando l'esperimento 'LED Blink esterno' del Volume 3 — Arduino Programmato. Questo è il primo programma Arduino in assoluto! Il codice usa pinMode(13, OUTPUT) per dire ad Arduino che il pin 13 è un'uscita, poi nel loop() usa digitalWrite(13, HIGH) per accendere il LED e digitalWrite(13, LOW) per spegnerlo, con delay(1000) per aspettare 1 secondo tra ogni cambio. Spiega il codice riga per riga in modo semplice, usando analogie adatte a bambini di 8-12 anni. Rispondi in italiano.",
      code: `// LED Blink esterno — Pin 13
void setup() {
  pinMode(13, OUTPUT);
}

void loop() {
  digitalWrite(13, HIGH);
  delay(1000);
  digitalWrite(13, LOW);
  delay(1000);
}`,
      hexFile: "/hex/v3-cap6-blink.hex",
      scratchXml: BLINK_SCRATCH,
      concept: "pinMode, digitalWrite, delay, ciclo loop",
      layer: "terra",
      buildSteps: [
        {
          step: 1,
          text: "Prendi il resistore da 470Ω e posizionalo sulla breadboard nei fori C18 e C25",
          componentId: "r1",
          componentType: "resistor",
          targetPins: { "r1:pin1": "bb1:c18", "r1:pin2": "bb1:c25" },
          hint: "Il resistore protegge il LED dalla troppa corrente. Mettilo in orizzontale nella fila C."
        },
        {
          step: 2,
          text: "Ora prendi il LED rosso e mettilo nei fori D27 e D28. L'anodo (+, gamba lunga) va in D27!",
          componentId: "led1",
          componentType: "led",
          targetPins: { "led1:anode": "bb1:d27", "led1:cathode": "bb1:d28" },
          hint: "L'anodo (+) in D27, il catodo (−) in D28. Due colonne a destra del resistore."
        },
        {
          step: 3,
          text: "Collega un filo VERDE dal foro D25 al foro D27 (ponte resistore→LED)",
          wireFrom: "bb1:d25",
          wireTo: "bb1:d27",
          wireColor: "green",
          hint: "Questo filo collega il resistore al LED attraverso le colonne della breadboard."
        },
        {
          step: 4,
          text: "Collega un filo ARANCIONE dal pin D13 dell'Arduino al foro A18 della breadboard",
          wireFrom: "nano1:W_D13",
          wireTo: "bb1:a18",
          wireColor: "orange",
          hint: "Il segnale parte dal pin D13 e arriva alla stessa colonna del resistore."
        },
        {
          step: 5,
          text: "Collega un filo NERO dal foro A28 al binario GND (−) della breadboard",
          wireFrom: "bb1:a28",
          wireTo: "bb1:bus-bot-minus-28",
          wireColor: "black",
          hint: "Questo filo porta la corrente dal catodo del LED alla massa."
        },
        {
          step: 6,
          text: "Collega un filo NERO dal pin GND dell'Arduino al binario GND (−) della breadboard",
          wireFrom: "nano1:GND_R",
          wireTo: "bb1:bus-bot-minus-1",
          wireColor: "black",
          hint: "Collegamento massa: serve per chiudere il circuito verso l'Arduino."
        },
        {
          step: 7,
          text: "Collega un filo ROSSO dal pin 5V dell'Arduino al binario + della breadboard",
          wireFrom: "nano1:5V",
          wireTo: "bb1:bus-bot-plus-1",
          wireColor: "red",
          hint: "Ultimo filo! Il circuito è completo. Carica il programma!"
        }
      ],
      // S80: Code steps for Passo Passo — progressive Scratch workspace build
      scratchSteps: [
        {
          label: "Apri l'editor blocchi",
          description: "Ora programmiamo! Apri l'editor e vai sulla tab 🧩 Blocchi. Vedrai il blocco Setup/Loop.",
          explanation: "Ogni programma Arduino ha due parti: Setup (eseguito una sola volta all'accensione) e Loop (ripetuto all'infinito). È come preparare gli ingredienti e poi cucinare in ciclo!",
          xml: `<xml xmlns="https://developers.google.com/blockly/xml"><block type="arduino_base" x="40" y="30" deletable="false"></block></xml>`,
        },
        {
          label: "Configura il pin 13",
          description: "Trascina un blocco 'PinMode' dentro Setup. Imposta pin 13, modalità OUTPUT.",
          explanation: "PinMode dice ad Arduino come usare un pin: OUTPUT = mandare corrente (per accendere cose), INPUT = ricevere segnali (per leggere sensori). Qui usiamo OUTPUT perché vogliamo comandare il LED.",
          xml: `<xml xmlns="https://developers.google.com/blockly/xml"><block type="arduino_base" x="40" y="30" deletable="false"><statement name="SETUP"><block type="arduino_pin_mode"><field name="PIN">13</field><field name="MODE">OUTPUT</field></block></statement></block></xml>`,
        },
        {
          label: "Accendi il LED",
          description: "Nel Loop, trascina 'DigitalWrite'. Pin 13, valore HIGH. Il LED si accenderà!",
          explanation: "HIGH = 5 volt (corrente accesa), LOW = 0 volt (corrente spenta). DigitalWrite è come un interruttore: HIGH accende, LOW spegne.",
          xml: `<xml xmlns="https://developers.google.com/blockly/xml"><block type="arduino_base" x="40" y="30" deletable="false"><statement name="SETUP"><block type="arduino_pin_mode"><field name="PIN">13</field><field name="MODE">OUTPUT</field></block></statement><statement name="LOOP"><block type="arduino_digital_write"><field name="PIN">13</field><field name="STATE">HIGH</field></block></statement></block></xml>`,
        },
        {
          label: "Aspetta 1 secondo",
          description: "Dopo l'accensione, aggiungi un 'Attendi (ms)' con valore 1000. Arduino aspetta 1 secondo.",
          explanation: "Senza il delay, Arduino eseguirebbe milioni di istruzioni al secondo — il LED lampeggerebbe così veloce che sembrerebbe sempre acceso! Il delay ci permette di vedere il cambiamento.",
          xml: `<xml xmlns="https://developers.google.com/blockly/xml"><block type="arduino_base" x="40" y="30" deletable="false"><statement name="SETUP"><block type="arduino_pin_mode"><field name="PIN">13</field><field name="MODE">OUTPUT</field></block></statement><statement name="LOOP"><block type="arduino_digital_write"><field name="PIN">13</field><field name="STATE">HIGH</field><next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow></value></block></next></block></statement></block></xml>`,
        },
        {
          label: "Spegni e aspetta",
          description: "Aggiungi un altro 'DigitalWrite' (pin 13, LOW) e un altro 'Attendi 1000ms'. Il LED lampeggerà!",
          explanation: "Accendi → aspetta → spegni → aspetta: questo ciclo si ripete all'infinito grazie al Loop. Hai appena creato il tuo primo programma Arduino!",
          xml: BLINK_SCRATCH,
        },
      ],
      quiz: [
        {
          question: "Cosa fa il comando delay(1000) nel programma?",
          options: ["Mette in pausa il programma per 1 secondo", "Accende il LED per 1000 secondi", "Spegne Arduino dopo 1000 millisecondi"],
          correct: 0,
          explanation: "delay(1000) mette in pausa il programma per 1000 millisecondi, cioè 1 secondo. Durante la pausa, il LED resta nello stato in cui si trova."
        },
        {
          question: "Cosa significa scrivere pinMode(13, OUTPUT)?",
          options: ["Legge il valore del pin 13", "Collega il pin 13 al computer", "Dice ad Arduino che il pin 13 è un'uscita (per comandare il LED)"],
          correct: 2,
          explanation: "pinMode(13, OUTPUT) configura il pin 13 come uscita. Così Arduino può mandare corrente al LED per accenderlo o spegnerlo."
        }
      ]
    },
    {
      id: "v3-cap6-pin5",
      title: "Cap. 6 Esp. 2 - Cambia pin (D5)",
      desc: "Stesso blink, ma sul pin 5! Impara che puoi usare qualsiasi pin digitale.",
      chapter: "Capitolo 6 - I pin digitali",
      difficulty: 1,
      icon: "\u{1F4A1}",
      simulationMode: "avr",
      components: [
        { type: "breadboard-half", id: "bb1" },
        { type: "nano-r4", id: "nano1" },
        { type: "resistor", id: "r1", value: 470 },
        { type: "led", id: "led1", color: "red" }
      ],
      pinAssignments: {
        "r1:pin1": "bb1:g18",
        "r1:pin2": "bb1:g25",
        "led1:anode": "bb1:h27",
        "led1:cathode": "bb1:h28"
      },
      connections: [
        { from: "nano1:W_D5", to: "bb1:f18", color: "orange" },
        { from: "bb1:h25", to: "bb1:h27", color: "green" },
        { from: "bb1:f28", to: "bb1:bus-bot-minus-28", color: "black" },
        { from: "nano1:GND_R", to: "bb1:bus-bot-minus-1", color: "black" },
        { from: "nano1:5V", to: "bb1:bus-bot-plus-1", color: "red" }
      ],
      // R1: pin1 on row g col 18, pin2 at col 25
      // LED1: anode on row h col 27 (shifted +2 from r1:pin2), cathode h28
      // Bridge h25→h27 connects R1 to LED. D5 → f18, cathode → GND bus
      layout: {
        "nano1": { x: 230, y: 10 },
        "bb1": { x: 280, y: 10 },
        "r1": { x: 451.5, y: 98.75 },
        "led1": { x: 496.5, y: 83.75 }
      },
      steps: [
        "Posiziona l'Arduino Nano sopra la breadboard e collegalo via USB-C.",
        "Inserisci il resistore da 470\u03A9 sulla fila g, da colonna 18 a colonna 25.",
        "Inserisci il LED rosso: anodo sulla fila h colonna 27, catodo sulla fila h colonna 28.",
        "Collega un filo verde dalla fila h colonna 25 alla fila h colonna 27 (ponte resistore-LED).",
        "Collega il pin D5 dell'Arduino alla fila f colonna 18 con un filo arancione.",
        "Collega la fila f colonna 28 al binario GND (-) con un filo nero.",
        "Collega GND e 5V dell'Arduino ai binari della breadboard. Carica il programma!"
      ],
      observe: "Il LED lampeggia esattamente come prima, ma stavolta è collegato al pin D5. Questo dimostra che puoi usare qualsiasi pin digitale dell'Arduino come uscita!",
      galileoPrompt: "Sei Galileo, il tutor AI di ELAB. Lo studente sta guardando l'esperimento 'Cambia pin (D5)' del Volume 3 — Arduino Programmato. Questo esperimento insegna che Arduino ha tanti pin digitali e puoi scegliere quale usare! Il codice è quasi identico al blink, ma usa il pin 5 invece del 13: pinMode(5, OUTPUT) e digitalWrite(5, HIGH/LOW). È come avere tante porte in una casa: puoi accendere la luce in qualsiasi stanza! Spiega il codice riga per riga in modo semplice, usando analogie adatte a bambini di 8-12 anni. Rispondi in italiano.",
      code: `// Blink su Pin 5
void setup() {
  pinMode(5, OUTPUT);
}

void loop() {
  digitalWrite(5, HIGH);
  delay(1000);
// © Andrea Marro — 12/03/2026 — ELAB Tutor — Tutti i diritti riservati
  digitalWrite(5, LOW);
  delay(1000);
}`,
      hexFile: "/hex/v3-cap6-pin5.hex",
      scratchXml: PIN5_SCRATCH,
      concept: "Cambio pin, qualsiasi pin digitale funziona",
      layer: "terra",
      buildSteps: [
        {
          step: 1,
          text: "Prendi il resistore da 470Ω e posizionalo sulla breadboard nei fori G18 e G25",
          componentId: "r1",
          componentType: "resistor",
          targetPins: { "r1:pin1": "bb1:g18", "r1:pin2": "bb1:g25" },
          hint: "Questa volta usiamo la fila G (parte bassa della breadboard)."
        },
        {
          step: 2,
          text: "Prendi il LED rosso e mettilo nei fori H27 e H28. L'anodo (+) va in H27!",
          componentId: "led1",
          componentType: "led",
          targetPins: { "led1:anode": "bb1:h27", "led1:cathode": "bb1:h28" },
          hint: "L'anodo (+) in H27, il catodo (−) in H28. Due colonne a destra del resistore."
        },
        {
          step: 3,
          text: "Collega un filo VERDE dal foro H25 al foro H27 (ponte resistore→LED)",
          wireFrom: "bb1:h25",
          wireTo: "bb1:h27",
          wireColor: "green",
          hint: "Questo filo collega il resistore al LED attraverso le colonne."
        },
        {
          step: 4,
          text: "Collega un filo ARANCIONE dal pin D5 dell'Arduino al foro F18 della breadboard",
          wireFrom: "nano1:W_D5",
          wireTo: "bb1:f18",
          wireColor: "orange",
          hint: "Stavolta il segnale parte dal pin D5, non dal D13!"
        },
        {
          step: 5,
          text: "Collega un filo NERO dal foro F28 al binario GND (−)",
          wireFrom: "bb1:f28",
          wireTo: "bb1:bus-bot-minus-28",
          wireColor: "black",
          hint: "Il catodo del LED va collegato a massa."
        },
        {
          step: 6,
          text: "Collega un filo NERO dal pin GND dell'Arduino al binario GND (−)",
          wireFrom: "nano1:GND_R",
          wireTo: "bb1:bus-bot-minus-1",
          wireColor: "black",
          hint: "Collegamento massa dell'Arduino."
        },
        {
          step: 7,
          text: "Collega un filo ROSSO dal pin 5V dell'Arduino al binario + della breadboard",
          wireFrom: "nano1:5V",
          wireTo: "bb1:bus-bot-plus-1",
          wireColor: "red",
          hint: "Circuito completo! Stessa configurazione del blink, ma su un pin diverso."
        }
      ],
      scratchSteps: [
        {
          label: "Apri l'editor blocchi",
          description: "Apri l'editor e vai sulla tab 🧩 Blocchi. Stavolta programmiamo il pin 5!",
          explanation: "Arduino ha tanti pin digitali (D0–D13). Ognuno può essere usato per controllare un LED, un buzzer o altri componenti. Il pin 13 non è speciale!",
          xml: `<xml xmlns="https://developers.google.com/blockly/xml"><block type="arduino_base" x="40" y="30" deletable="false"></block></xml>`,
        },
        {
          label: "Configura il pin 5",
          description: "Trascina 'PinMode' in Setup. Imposta pin 5 (non 13!), modalità OUTPUT.",
          explanation: "Cambiare pin nel codice è semplice: basta sostituire il numero. Il circuito fisico deve corrispondere — il filo va dal pin 5 alla breadboard, non dal 13.",
          xml: `<xml xmlns="https://developers.google.com/blockly/xml"><block type="arduino_base" x="40" y="30" deletable="false"><statement name="SETUP"><block type="arduino_pin_mode"><field name="PIN">5</field><field name="MODE">OUTPUT</field></block></statement></block></xml>`,
        },
        {
          label: "Blink completo su pin 5",
          description: "Nel Loop: DigitalWrite pin 5 HIGH, delay 1000, DigitalWrite pin 5 LOW, delay 1000. Identico al blink, ma sul pin 5!",
          explanation: "Il codice è identico al Blink del pin 13, cambia solo il numero del pin. Questo è il bello della programmazione: lo stesso schema funziona ovunque!",
          xml: PIN5_SCRATCH,
        },
      ],
      quiz: [
        {
          question: "Si può usare qualsiasi pin digitale di Arduino come uscita per un LED?",
          options: ["No, solo il pin 13 funziona", "Sì, tutti i pin digitali possono essere configurati come uscita", "Solo i pin pari funzionano"],
          correct: 1,
          explanation: "Tutti i pin digitali di Arduino possono essere configurati come OUTPUT. Il pin 13 non è speciale: possiamo usare D5, D8 o qualsiasi altro pin!"
        },
        {
          question: "Cosa bisogna cambiare nel codice per spostare il LED dal pin 13 al pin 5?",
          options: ["Basta cambiare il numero del pin da 13 a 5 in tutte le istruzioni", "Bisogna aggiungere una nuova libreria", "Non si può cambiare pin nel codice"],
          correct: 0,
          explanation: "Basta sostituire il numero 13 con 5 in pinMode e digitalWrite. Il codice funziona esattamente allo stesso modo su un pin diverso!"
        }
      ]
    },
    {
      id: "v3-cap6-morse",
      title: "Cap. 6 Esp. 3 - SOS Morse",
      desc: "Trasmetti SOS in codice Morse! Punto = 200ms, Linea = 600ms.",
      chapter: "Capitolo 6 - I pin digitali",
      difficulty: 2,
      icon: "\u{1F198}",
      simulationMode: "avr",
      components: [
        { type: "breadboard-half", id: "bb1" },
        { type: "nano-r4", id: "nano1" },
        { type: "resistor", id: "r1", value: 470 },
        { type: "led", id: "led1", color: "red" }
      ],
      pinAssignments: {
        "r1:pin1": "bb1:c18",
        "r1:pin2": "bb1:c25",
        "led1:anode": "bb1:d27",
        "led1:cathode": "bb1:d28"
      },
      connections: [
        { from: "nano1:W_D13", to: "bb1:a18", color: "orange" },
        { from: "bb1:d25", to: "bb1:d27", color: "green" },
        { from: "bb1:a28", to: "bb1:bus-bot-minus-28", color: "black" },
        { from: "nano1:GND_R", to: "bb1:bus-bot-minus-1", color: "black" },
        { from: "nano1:5V", to: "bb1:bus-bot-plus-1", color: "red" }
      ],
      // Same circuit as blink — R1 on row c col 18, LED1 shifted to row d col 27
      // Bridge d25→d27. D13 → a18, cathode col 28 → GND bus
      layout: {
        "nano1": { x: 230, y: 10 },
        "bb1": { x: 280, y: 10 },
        "r1": { x: 451.5, y: 58.75 },
        "led1": { x: 496.5, y: 43.75 }
      },
      steps: [
        "Costruisci lo stesso circuito dell'esperimento 1 (LED + resistore su pin D13).",
        "Carica il nuovo programma che contiene le funzioni punto() e linea().",
        "punto() accende il LED per 200ms (lampo corto = punto Morse).",
        "linea() accende il LED per 600ms (lampo lungo = linea Morse).",
        "Nel loop() le funzioni vengono chiamate nella sequenza S-O-S.",
        "Osserva il LED e prova a decodificare il messaggio Morse!"
      ],
      observe: "Il LED trasmette SOS in codice Morse: 3 lampi corti (S = ...), 3 lampi lunghi (O = ---), 3 lampi corti (S = ...), poi una pausa di 2 secondi prima di ripetere. È il segnale internazionale di soccorso!",
      galileoPrompt: "Sei Galileo, il tutor AI di ELAB. Lo studente sta guardando l'esperimento 'SOS Morse' del Volume 3 — Arduino Programmato. Qui si impara a creare funzioni personalizzate in Arduino! Il codice definisce due funzioni: punto() che accende il LED per 200ms (un lampo corto) e linea() che lo accende per 600ms (un lampo lungo). Nel loop() queste funzioni vengono chiamate nella sequenza S-O-S: tre punti, tre linee, tre punti. Le funzioni sono come ricette: le scrivi una volta e le usi quante volte vuoi! Spiega il codice riga per riga in modo semplice, usando analogie adatte a bambini di 8-12 anni. Rispondi in italiano.",
      code: `// SOS in codice Morse
// S = ...  O = ---  S = ...
// Punto = 200ms, Linea = 600ms

void punto() {
  digitalWrite(13, HIGH);
  delay(200);
  digitalWrite(13, LOW);
  delay(200);
}

void linea() {
  digitalWrite(13, HIGH);
  delay(600);
  digitalWrite(13, LOW);
  delay(200);
}

void setup() {
  pinMode(13, OUTPUT);
}

void loop() {
  // S = . . .
  punto(); punto(); punto();
  delay(600);

  // O = - - -
  linea(); linea(); linea();
  delay(600);

  // S = . . .
  punto(); punto(); punto();
  delay(2000);
}`,
      hexFile: "/hex/v3-cap6-morse.hex",
      scratchXml: MORSE_SCRATCH,
      concept: "Funzioni personalizzate, codice Morse, timing",
      layer: "schema",
      buildSteps: [
        {
          step: 1,
          text: "Prendi il resistore da 470Ω e posizionalo nei fori C18 e C25",
          componentId: "r1",
          componentType: "resistor",
          targetPins: { "r1:pin1": "bb1:c18", "r1:pin2": "bb1:c25" },
          hint: "Stesso circuito del blink! Resistore nella fila C."
        },
        {
          step: 2,
          text: "Prendi il LED rosso e mettilo nei fori D27 e D28. L'anodo (+) va in D27!",
          componentId: "led1",
          componentType: "led",
          targetPins: { "led1:anode": "bb1:d27", "led1:cathode": "bb1:d28" },
          hint: "LED spostato di 2 colonne a destra del resistore per chiarezza."
// © Andrea Marro — 12/03/2026 — ELAB Tutor — Tutti i diritti riservati
        },
        {
          step: 3,
          text: "Collega un filo VERDE dal foro D25 al foro D27 (ponte resistore→LED)",
          wireFrom: "bb1:d25",
          wireTo: "bb1:d27",
          wireColor: "green",
          hint: "Collega il resistore al LED attraverso le colonne della breadboard."
        },
        {
          step: 4,
          text: "Collega un filo ARANCIONE dal pin D13 dell'Arduino al foro A18",
          wireFrom: "nano1:W_D13",
          wireTo: "bb1:a18",
          wireColor: "orange",
          hint: "Segnale dal pin D13 al resistore."
        },
        {
          step: 5,
          text: "Collega un filo NERO dal foro A28 al binario GND (−)",
          wireFrom: "bb1:a28",
          wireTo: "bb1:bus-bot-minus-28",
          wireColor: "black",
          hint: "Catodo del LED verso massa."
        },
        {
          step: 6,
          text: "Collega un filo NERO dal pin GND dell'Arduino al binario GND (−)",
          wireFrom: "nano1:GND_R",
          wireTo: "bb1:bus-bot-minus-1",
          wireColor: "black",
          hint: "Massa dell'Arduino."
        },
        {
          step: 7,
          text: "Collega un filo ROSSO dal pin 5V al binario +. Il circuito è identico al blink — cambia solo il programma!",
          wireFrom: "nano1:5V",
          wireTo: "bb1:bus-bot-plus-1",
          wireColor: "red",
          hint: "Con lo stesso circuito, il codice Morse usa tempi diversi: 200ms (punto) e 600ms (linea)."
        }
      ],
      // S102: Scratch steps for Passo Passo — SOS Morse con blocchi Ripeti
      scratchSteps: [
        {
          label: "Apri l'editor blocchi",
          description: "Ora programmiamo il Morse! Apri l'editor e vai sulla tab 🧩 Blocchi. Vedrai il blocco Setup/Loop.",
          explanation: "In Arduino C++ il Morse usa funzioni personalizzate (punto e linea). Con i blocchi faremo la stessa cosa usando 'Ripeti' — un modo diverso per non ripetere il codice!",
          xml: `<xml xmlns="https://developers.google.com/blockly/xml"><block type="arduino_base" x="40" y="30" deletable="false"></block></xml>`,
        },
        {
          label: "Configura il pin 13",
          description: "Trascina un blocco 'PinMode' dentro Setup. Imposta pin 13, modalità OUTPUT.",
          explanation: "Stesso circuito del blink! Il LED è collegato al pin 13 tramite il resistore da 470Ω.",
          xml: `<xml xmlns="https://developers.google.com/blockly/xml"><block type="arduino_base" x="40" y="30" deletable="false"><statement name="SETUP"><block type="arduino_pin_mode"><field name="PIN">13</field><field name="MODE">OUTPUT</field></block></statement></block></xml>`,
        },
        {
          label: "Crea un punto Morse",
          description: "Nel Loop, metti: DigitalWrite pin 13 HIGH, Attendi 200ms, DigitalWrite pin 13 LOW, Attendi 200ms. Un lampo corto!",
          explanation: "Un punto Morse dura 200 millisecondi — un lampo veloce. La pausa dopo (200ms) separa un punto dal successivo. È come battere un colpetto veloce su un tavolo!",
          xml: `<xml xmlns="https://developers.google.com/blockly/xml"><block type="arduino_base" x="40" y="30" deletable="false"><statement name="SETUP"><block type="arduino_pin_mode"><field name="PIN">13</field><field name="MODE">OUTPUT</field></block></statement><statement name="LOOP"><block type="arduino_digital_write"><field name="PIN">13</field><field name="STATE">HIGH</field><next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">200</field></shadow></value><next><block type="arduino_digital_write"><field name="PIN">13</field><field name="STATE">LOW</field><next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">200</field></shadow></value></block></next></block></next></block></next></block></statement></block></xml>`,
        },
        {
          label: "Ripeti 3 volte = lettera S",
          description: "Avvolgi i 4 blocchi del punto in un blocco 'Ripeti 3 volte' dal menu Cicli. Tre punti = la lettera S in Morse!",
          explanation: "Il blocco 'Ripeti' fa la stessa cosa della funzione punto() nel codice C++, ma senza dover definire una funzione. In Scratch, i loop sono il modo principale per riusare codice!",
          xml: `<xml xmlns="https://developers.google.com/blockly/xml"><block type="arduino_base" x="40" y="30" deletable="false"><statement name="SETUP"><block type="arduino_pin_mode"><field name="PIN">13</field><field name="MODE">OUTPUT</field></block></statement><statement name="LOOP"><block type="controls_repeat_ext"><value name="TIMES"><shadow type="math_number"><field name="NUM">3</field></shadow></value><statement name="DO"><block type="arduino_digital_write"><field name="PIN">13</field><field name="STATE">HIGH</field><next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">200</field></shadow></value><next><block type="arduino_digital_write"><field name="PIN">13</field><field name="STATE">LOW</field><next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">200</field></shadow></value></block></next></block></next></block></next></block></statement></block></statement></block></xml>`,
        },
        {
          label: "Completa il SOS!",
          description: "Dopo la S, aggiungi Attendi 600ms (pausa tra lettere), poi un Ripeti 3x con delay 600ms (= O, tre linee), altra pausa 600ms, altra S con Ripeti 3x, e infine Attendi 2000ms (pausa tra parole). SOS completo!",
          explanation: "S-O-S: 3 punti (200ms), 3 linee (600ms), 3 punti (200ms). La pausa tra lettere è 600ms, tra parole 2000ms. Hai trasmesso il segnale di soccorso internazionale! Confronta i blocchi col codice C++ a destra — stessa logica, forma diversa.",
          xml: MORSE_SCRATCH,
        },
      ],
      quiz: [
        {
          question: "Qual è il vantaggio di creare le funzioni punto() e linea() nel codice Morse?",
          options: ["Il programma va più veloce", "Le funzioni servono solo a decorare il codice", "Si può riutilizzare lo stesso codice senza riscriverlo ogni volta"],
          correct: 2,
          explanation: "Le funzioni evitano di ripetere lo stesso codice. Invece di riscrivere accendi-aspetta-spegni ogni volta, basta chiamare punto() o linea()!"
        },
        {
          question: "Come si scrive SOS in codice Morse?",
          options: ["Tre linee, tre punti, tre linee", "Tre punti, tre linee, tre punti", "Un punto, una linea, un punto"],
          correct: 1,
          explanation: "SOS in Morse è: tre punti (S) + tre linee (O) + tre punti (S). Il punto dura 200ms e la linea 600ms."
        }
      ]
    },
    {
      id: "v3-cap6-sirena",
      title: "Cap. 6 Esp. 4 - Sirena 2 LED",
      desc: "Due LED alternati come una sirena! Pin D10 e D9 sul breakout wing, si scambiano ogni 200ms.",
      chapter: "Capitolo 6 - I pin digitali",
      difficulty: 2,
      icon: "\u{1F6A8}",
      simulationMode: "avr",
      components: [
        { type: "breadboard-half", id: "bb1" },
        { type: "nano-r4", id: "nano1" },
        { type: "resistor", id: "r1", value: 470 },
        { type: "resistor", id: "r2", value: 470 },
        { type: "led", id: "led1", color: "red" },
        { type: "led", id: "led2", color: "blue" }
      ],
      pinAssignments: {
        "r1:pin1": "bb1:c18",
        "r1:pin2": "bb1:c25",
        "led1:anode": "bb1:d27",
        "led1:cathode": "bb1:d28",
        "r2:pin1": "bb1:g18",
        "r2:pin2": "bb1:g25",
        "led2:anode": "bb1:h27",
        "led2:cathode": "bb1:h28"
      },
      connections: [
        { from: "nano1:W_D10", to: "bb1:a18", color: "orange" },
        { from: "bb1:d25", to: "bb1:d27", color: "green" },
        { from: "bb1:a28", to: "bb1:bus-bot-minus-28", color: "black" },
        { from: "nano1:W_D9", to: "bb1:f18", color: "blue" },
        { from: "bb1:h25", to: "bb1:h27", color: "green" },
        { from: "bb1:f28", to: "bb1:bus-bot-minus-28", color: "black" },
        { from: "nano1:GND_R", to: "bb1:bus-bot-minus-1", color: "black" },
        { from: "nano1:5V", to: "bb1:bus-bot-plus-1", color: "red" }
      ],
      // R1 on row c col 18-25, LED1 shifted to d27-d28 (top half)
      // R2 on row g col 18-25, LED2 shifted to h27-h28 (bottom half)
      // Bridge d25→d27, h25→h27. D10 (W_D10) → a18, D9 (W_D9) → f18, cathodes col 28 → GND bus
      layout: {
        "nano1": { x: 230, y: 10 },
        "bb1": { x: 280, y: 10 },
        "r1": { x: 451.5, y: 58.75 },
        "led1": { x: 496.5, y: 43.75 },
        "r2": { x: 451.5, y: 98.75 },
        "led2": { x: 496.5, y: 83.75 }
      },
      steps: [
        "Posiziona l'Arduino Nano sopra la breadboard.",
        "Circuito LED rosso: resistore 470\u03A9 fila c col 18-25, LED rosso anodo fila d col 27, catodo d col 28. Ponte verde d25-d27.",
        "Collega D10 (breakout wing) alla fila a col 18 (stessa colonna del resistore). Catodo col 28 al binario GND.",
        "Circuito LED blu: resistore 470\u03A9 fila g col 18-25, LED blu anodo fila h col 27, catodo h col 28. Ponte verde h25-h27.",
        "Collega D9 alla fila f col 18. Catodo col 28 al binario GND.",
        "Collega GND e 5V dell'Arduino ai binari. Carica il programma e osserva l'effetto sirena!"
      ],
      observe: "I due LED si alternano velocemente ogni 200ms: quando il rosso è acceso il blu è spento, e viceversa. L'effetto ricorda le luci di una sirena della polizia!",
      galileoPrompt: "Sei Galileo, il tutor AI di ELAB. Lo studente sta guardando l'esperimento 'Sirena 2 LED' del Volume 3 — Arduino Programmato. Qui Arduino controlla DUE pin di output contemporaneamente! Il codice usa pinMode per configurare sia il pin 10 che il pin 9 come OUTPUT (collegati ai pin W_D10 e W_D9 del breakout wing). Nel loop(), quando uno è HIGH l'altro è LOW, poi si scambiano dopo 200ms con delay(200). È come una sirena della polizia: quando la luce rossa è accesa, quella blu è spenta, e viceversa! Spiega il codice riga per riga in modo semplice, usando analogie adatte a bambini di 8-12 anni. Rispondi in italiano.",
      code: `// Sirena 2 LED — Pin D10 e D9 (breakout wing)
// Alternanza ogni 200ms

void setup() {
  pinMode(10, OUTPUT);
  pinMode(9, OUTPUT);
}

void loop() {
  digitalWrite(10, HIGH);
  digitalWrite(9, LOW);
  delay(200);

  digitalWrite(10, LOW);
  digitalWrite(9, HIGH);
  delay(200);
}`,
      hexFile: "/hex/v3-cap6-sirena.hex",
      scratchXml: SIRENA_SCRATCH,
      concept: "Due output, alternanza, effetto sirena",
      layer: "schema",
      buildSteps: [
        {
          step: 1,
          text: "Prendi il primo resistore da 470Ω (R1) e posizionalo nei fori C18 e C25",
          componentId: "r1",
          componentType: "resistor",
          targetPins: { "r1:pin1": "bb1:c18", "r1:pin2": "bb1:c25" },
          hint: "R1 protegge il LED rosso. Va nella fila C (parte alta)."
        },
        {
          step: 2,
          text: "Prendi il LED rosso e mettilo nei fori D27 e D28. L'anodo (+) in D27!",
          componentId: "led1",
          componentType: "led",
          targetPins: { "led1:anode": "bb1:d27", "led1:cathode": "bb1:d28" },
          hint: "Primo LED della sirena: il rosso, spostato a destra del resistore."
        },
        {
          step: 3,
          text: "Collega un filo VERDE dal foro D25 al foro D27 (ponte R1→LED rosso)",
          wireFrom: "bb1:d25",
          wireTo: "bb1:d27",
          wireColor: "green",
          hint: "Collega il resistore al LED rosso."
        },
        {
          step: 4,
          text: "Prendi il secondo resistore da 470Ω (R2) e posizionalo nei fori G18 e G25",
          componentId: "r2",
          componentType: "resistor",
          targetPins: { "r2:pin1": "bb1:g18", "r2:pin2": "bb1:g25" },
          hint: "R2 protegge il LED blu. Va nella fila G (parte bassa)."
// © Andrea Marro — 12/03/2026 — ELAB Tutor — Tutti i diritti riservati
        },
        {
          step: 5,
          text: "Prendi il LED blu e mettilo nei fori H27 e H28. L'anodo (+) in H27!",
          componentId: "led2",
          componentType: "led",
          targetPins: { "led2:anode": "bb1:h27", "led2:cathode": "bb1:h28" },
          hint: "Secondo LED della sirena: il blu, spostato a destra del resistore."
        },
        {
          step: 6,
          text: "Collega un filo VERDE dal foro H25 al foro H27 (ponte R2→LED blu)",
          wireFrom: "bb1:h25",
          wireTo: "bb1:h27",
          wireColor: "green",
          hint: "Collega il resistore al LED blu."
        },
        {
          step: 7,
          text: "Collega un filo ARANCIONE dal pin D10 (breakout wing W_D10) al foro A18",
          wireFrom: "nano1:W_D10",
          wireTo: "bb1:a18",
          wireColor: "orange",
          hint: "D10 (wing) controlla il LED rosso (stessa colonna di R1)."
        },
        {
          step: 8,
          text: "Collega un filo NERO dal foro A28 al binario GND (−) — catodo rosso",
          wireFrom: "bb1:a28",
          wireTo: "bb1:bus-bot-minus-28",
          wireColor: "black",
          hint: "Catodo del LED rosso verso massa."
        },
        {
          step: 9,
          text: "Collega un filo BLU dal pin D9 dell'Arduino al foro F18",
          wireFrom: "nano1:W_D9",
          wireTo: "bb1:f18",
          wireColor: "blue",
          hint: "D9 controlla il LED blu (stessa colonna di R2)."
        },
        {
          step: 10,
          text: "Collega un filo NERO dal foro F28 al binario GND (−) — catodo blu",
          wireFrom: "bb1:f28",
          wireTo: "bb1:bus-bot-minus-28",
          wireColor: "black",
          hint: "Catodo del LED blu verso massa."
        },
        {
          step: 11,
          text: "Collega un filo NERO dal pin GND dell'Arduino al binario GND (−)",
          wireFrom: "nano1:GND_R",
          wireTo: "bb1:bus-bot-minus-1",
          wireColor: "black",
          hint: "Massa dell'Arduino."
        },
        {
          step: 12,
          text: "Collega un filo ROSSO dal pin 5V al binario +. Sirena pronta!",
          wireFrom: "nano1:5V",
          wireTo: "bb1:bus-bot-plus-1",
          wireColor: "red",
          hint: "Due circuiti LED identici, controllati da due pin wing: D10 e D9."
        }
      ],
      scratchSteps: [
        {
          label: "Configura 2 pin",
          description: "In Setup, trascina due blocchi 'PinMode': pin 10 OUTPUT e pin 9 OUTPUT. Due LED = due pin!",
          explanation: "Puoi configurare quanti pin vuoi nel Setup. Ogni LED ha bisogno del suo pin dedicato — Arduino li controlla in modo indipendente.",
          xml: `<xml xmlns="https://developers.google.com/blockly/xml"><block type="arduino_base" x="40" y="30" deletable="false"><statement name="SETUP"><block type="arduino_pin_mode"><field name="PIN">10</field><field name="MODE">OUTPUT</field><next><block type="arduino_pin_mode"><field name="PIN">9</field><field name="MODE">OUTPUT</field></block></next></block></statement></block></xml>`,
        },
        {
          label: "Accendi rosso, spegni blu",
          description: "Nel Loop: DigitalWrite pin 10 HIGH (rosso acceso), DigitalWrite pin 9 LOW (blu spento).",
          explanation: "L'effetto sirena si ottiene tenendo un LED acceso mentre l'altro è spento. Arduino esegue le istruzioni una dopo l'altra, dall'alto verso il basso.",
          xml: `<xml xmlns="https://developers.google.com/blockly/xml"><block type="arduino_base" x="40" y="30" deletable="false"><statement name="SETUP"><block type="arduino_pin_mode"><field name="PIN">10</field><field name="MODE">OUTPUT</field><next><block type="arduino_pin_mode"><field name="PIN">9</field><field name="MODE">OUTPUT</field></block></next></block></statement><statement name="LOOP"><block type="arduino_digital_write"><field name="PIN">10</field><field name="STATE">HIGH</field><next><block type="arduino_digital_write"><field name="PIN">9</field><field name="STATE">LOW</field></block></next></block></statement></block></xml>`,
        },
        {
          label: "Completa la sirena",
          description: "Aggiungi delay 200ms, poi inverti: pin 10 LOW, pin 9 HIGH, delay 200ms. I LED si alternano come una sirena!",
          explanation: "200 ms è un quinto di secondo — abbastanza veloce per sembrare una sirena! Prova a cambiare il delay: più basso = lampeggio frenetico, più alto = alternanza lenta.",
          xml: SIRENA_SCRATCH,
        },
      ],
      quiz: [
        {
          question: "Come si fa ad alternare due LED come una sirena?",
          options: ["Quando uno è acceso, l'altro è spento, e viceversa", "Si accendono entrambi insieme", "Si usa un solo pin per entrambi"],
          correct: 0,
          explanation: "Per l'effetto sirena, quando un LED è HIGH (acceso) l'altro è LOW (spento). Poi si invertono i valori dopo un breve delay."
        },
        {
          question: "Cosa succede se si aumenta il valore del delay da 200 a 2000?",
          options: ["I LED lampeggiano più velocemente", "I LED lampeggiano più lentamente (ogni 2 secondi)", "I LED restano sempre accesi"],
          correct: 1,
          explanation: "Aumentando il delay, ogni LED resta acceso più a lungo prima di cambiare. Con 2000ms l'alternanza diventa molto più lenta."
        }
      ]
    },
    {
      id: "v3-cap6-semaforo",
      title: "Cap. 6 Esp. 5 - Semaforo 3 LED",
      desc: "Un vero semaforo! Verde 3s, Giallo 1s, Rosso 3s. Pin D5, D6, D3 sul breakout wing.",
      chapter: "Capitolo 6 - I pin digitali",
      difficulty: 2,
      icon: "\u{1F6A6}",
      simulationMode: "avr",
      components: [
        { type: "breadboard-half", id: "bb1" },
        { type: "nano-r4", id: "nano1" },
        { type: "resistor", id: "r1", value: 470 },
        { type: "resistor", id: "r2", value: 470 },
        { type: "resistor", id: "r3", value: 470 },
        { type: "led", id: "led1", color: "green" },
        { type: "led", id: "led2", color: "yellow" },
        { type: "led", id: "led3", color: "red" }
      ],
      pinAssignments: {
        "r1:pin1": "bb1:b16",
        "r1:pin2": "bb1:b23",
        "led1:anode": "bb1:d25",
        "led1:cathode": "bb1:d26",
        "r2:pin1": "bb1:e22",
        "r2:pin2": "bb1:e29",
        "led2:anode": "bb1:d29",
        "led2:cathode": "bb1:d30",
        "r3:pin1": "bb1:i16",
        "r3:pin2": "bb1:i23",
        "led3:anode": "bb1:h30",
        "led3:cathode": "bb1:h29"
      },
      connections: [
        { from: "nano1:W_D5", to: "bb1:a16", color: "green" },
        { from: "bb1:d23", to: "bb1:d25", color: "green" },
        { from: "bb1:a26", to: "bb1:bus-bot-minus-26", color: "black" },
        { from: "nano1:W_D6", to: "bb1:a22", color: "yellow" },
        { from: "bb1:a30", to: "bb1:bus-bot-minus-30", color: "black" },
        { from: "nano1:W_D3", to: "bb1:f16", color: "red" },
        { from: "bb1:h23", to: "bb1:h30", color: "green" },
        { from: "bb1:f29", to: "bb1:bus-bot-minus-29", color: "black" },
        { from: "nano1:GND_R", to: "bb1:bus-bot-minus-1", color: "black" },
        { from: "nano1:5V", to: "bb1:bus-bot-plus-1", color: "red" }
      ],
      // 3 LED circuits:
      // R1 (green): row b col 16-23, LED1 shifted to d25-d26 (bridge d23→d25)
      // R2 (yellow): row e col 22-29, LED2 anode d29, cathode d30 (below LEDs to avoid overlap)
      // R3 (red): row i col 16-23, LED3 shifted to h30-h29 (bridge h23→h30)
      // D5 (W_D5) → a16, D6 (W_D6) → a22, D3 (W_D3) → f16; cathodes → GND bus
      layout: {
        "nano1": { x: 230, y: 10 },
        "bb1": { x: 280, y: 10 },
        "r1": { x: 436.5, y: 51.25 },
        "led1": { x: 481.5, y: 43.75 },
        "r2": { x: 481.5, y: 73.75 },
        "led2": { x: 511.5, y: 43.75 },
        "r3": { x: 436.5, y: 113.75 },
        "led3": { x: 519, y: 83.75 }
      },
      steps: [
        "Posiziona l'Arduino Nano sopra la breadboard.",
        "Circuito verde: resistore 470\u03A9 fila b col 16-23, LED verde anodo fila d col 25, catodo d col 26. Ponte verde d23-d25. D5 alla fila a col 16.",
        "Circuito giallo: resistore 470\u03A9 fila e col 22-29, LED giallo anodo fila d col 29, catodo d col 30. D6 alla fila a col 22.",
        "Circuito rosso: resistore 470\u03A9 fila i col 16-23, LED rosso anodo fila h col 30, catodo h col 29. Ponte verde h23-h30. D3 (breakout wing W_D3) alla fila f col 16.",
        "Collega le colonne dei catodi (26, 30, 29) al binario GND (-) con fili neri.",
        "Collega GND e 5V dell'Arduino ai binari. Carica il programma e osserva il semaforo!"
      ],
      observe: "I LED si accendono in sequenza come un vero semaforo: verde per 3 secondi, giallo per 1 secondo, rosso per 3 secondi. Solo un colore alla volta è acceso, esattamente come al semaforo stradale!",
      galileoPrompt: "Sei Galileo, il tutor AI di ELAB. Lo studente sta guardando l'esperimento 'Semaforo 3 LED' del Volume 3 — Arduino Programmato. Questo esperimento usa TRE pin di output sul breakout wing (W_D5, W_D6, W_D3) per creare un semaforo vero! Il codice nel loop() ha tre blocchi: prima accende solo il verde (pin 5 HIGH, gli altri LOW) e aspetta 3 secondi, poi solo il giallo (pin 6) per 1 secondo, poi solo il rosso (pin 3) per 3 secondi. È una sequenza di stati, come le fasi di un semaforo reale! Spiega il codice riga per riga in modo semplice, usando analogie adatte a bambini di 8-12 anni. Rispondi in italiano.",
      code: `// Semaforo 3 LED — Pin D5 (verde), D6 (giallo), D3 (rosso)
// Breakout wing: W_D5, W_D6, W_D3
// Timing: Verde 3s, Giallo 1s, Rosso 3s

void setup() {
  pinMode(5, OUTPUT);
  pinMode(6, OUTPUT);
  pinMode(3, OUTPUT);
}

void loop() {
  // Verde acceso
  digitalWrite(5, HIGH);
  digitalWrite(6, LOW);
  digitalWrite(3, LOW);
  delay(3000);

  // Giallo acceso
  digitalWrite(5, LOW);
  digitalWrite(6, HIGH);
  digitalWrite(3, LOW);
  delay(1000);

  // Rosso acceso
  digitalWrite(5, LOW);
  digitalWrite(6, LOW);
  digitalWrite(3, HIGH);
  delay(3000);
}`,
      hexFile: "/hex/v3-cap6-semaforo.hex",
// © Andrea Marro — 12/03/2026 — ELAB Tutor — Tutti i diritti riservati
      scratchXml: SEMAFORO_SCRATCH,
      concept: "Sequenza stati, semaforo reale, timing multiplo",
      layer: "schema",
      buildSteps: [
        {
          step: 1,
          text: "Prendi il resistore R1 (470Ω) e posizionalo nei fori B16 e B23 — circuito verde",
          componentId: "r1",
          componentType: "resistor",
          targetPins: { "r1:pin1": "bb1:b16", "r1:pin2": "bb1:b23" },
          hint: "R1 è il resistore del LED verde, nella fila B a sinistra."
        },
        {
          step: 2,
          text: "Prendi il LED verde e mettilo nei fori D25 e D26. L'anodo (+) in D25!",
          componentId: "led1",
          componentType: "led",
          targetPins: { "led1:anode": "bb1:d25", "led1:cathode": "bb1:d26" },
          hint: "Il verde è il primo colore del semaforo. Spostato a destra del resistore."
        },
        {
          step: 3,
          text: "Collega un filo VERDE dal foro D23 al foro D25 (ponte R1→LED verde)",
          wireFrom: "bb1:d23",
          wireTo: "bb1:d25",
          wireColor: "green",
          hint: "Collega il resistore al LED verde attraverso le colonne."
        },
        {
          step: 4,
          text: "Prendi il resistore R2 (470Ω) e posizionalo nei fori E22 e E29 — circuito giallo",
          componentId: "r2",
          componentType: "resistor",
          targetPins: { "r2:pin1": "bb1:e22", "r2:pin2": "bb1:e29" },
          hint: "R2 è il resistore del LED giallo, nella fila E (sotto i LED)."
        },
        {
          step: 5,
          text: "Prendi il LED giallo e mettilo nei fori D29 e D30. L'anodo (+) in D29!",
          componentId: "led2",
          componentType: "led",
          targetPins: { "led2:anode": "bb1:d29", "led2:cathode": "bb1:d30" },
          hint: "Il giallo è il secondo colore del semaforo."
        },
        {
          step: 6,
          text: "Prendi il resistore R3 (470Ω) e posizionalo nei fori I16 e I23 — circuito rosso",
          componentId: "r3",
          componentType: "resistor",
          targetPins: { "r3:pin1": "bb1:i16", "r3:pin2": "bb1:i23" },
          hint: "R3 è il resistore del LED rosso, nella fila I (parte bassa)."
        },
        {
          step: 7,
          text: "Prendi il LED rosso e mettilo nei fori H30 e H29. L'anodo (+) in H30!",
          componentId: "led3",
          componentType: "led",
          targetPins: { "led3:anode": "bb1:h30", "led3:cathode": "bb1:h29" },
          hint: "Il rosso è il terzo colore del semaforo. Spostato a destra per evitare sovrapposizioni."
        },
        {
          step: 8,
          text: "Collega un filo VERDE dal foro H23 al foro H30 (ponte R3→LED rosso)",
          wireFrom: "bb1:h23",
          wireTo: "bb1:h30",
          wireColor: "green",
          hint: "Collega il resistore al LED rosso attraverso le colonne."
        },
        {
          step: 9,
          text: "Collega un filo VERDE dal pin D5 dell'Arduino al foro A16",
          wireFrom: "nano1:W_D5",
          wireTo: "bb1:a16",
          wireColor: "green",
          hint: "D5 controlla il LED verde."
        },
        {
          step: 10,
          text: "Collega un filo NERO dal foro A26 al binario GND (−) — catodo verde",
          wireFrom: "bb1:a26",
          wireTo: "bb1:bus-bot-minus-26",
          wireColor: "black",
          hint: "Il catodo del LED verde va a massa."
        },
        {
          step: 11,
          text: "Collega un filo GIALLO dal pin D6 dell'Arduino al foro A22",
          wireFrom: "nano1:W_D6",
          wireTo: "bb1:a22",
          wireColor: "yellow",
          hint: "D6 controlla il LED giallo."
        },
        {
          step: 12,
          text: "Collega un filo NERO dal foro A30 al binario GND (−) — catodo giallo",
          wireFrom: "bb1:a30",
          wireTo: "bb1:bus-bot-minus-30",
          wireColor: "black",
          hint: "Il catodo del LED giallo va a massa."
        },
        {
          step: 13,
          text: "Collega un filo ROSSO dal pin D3 (breakout wing W_D3) al foro F16",
          wireFrom: "nano1:W_D3",
          wireTo: "bb1:f16",
          wireColor: "red",
          hint: "D3 (wing) controlla il LED rosso."
        },
        {
          step: 14,
          text: "Collega un filo NERO dal foro F29 al binario GND (−) — catodo rosso",
          wireFrom: "bb1:f29",
          wireTo: "bb1:bus-bot-minus-29",
          wireColor: "black",
          hint: "Il catodo del LED rosso va a massa."
        },
        {
          step: 15,
          text: "Collega un filo NERO dal pin GND dell'Arduino al binario GND (−)",
          wireFrom: "nano1:GND_R",
          wireTo: "bb1:bus-bot-minus-1",
          wireColor: "black",
          hint: "Massa dell'Arduino."
        },
        {
          step: 16,
          text: "Collega un filo ROSSO dal pin 5V al binario +. Il semaforo è pronto!",
          wireFrom: "nano1:5V",
          wireTo: "bb1:bus-bot-plus-1",
          wireColor: "red",
          hint: "3 circuiti LED su 3 pin diversi. Il programma li accende in sequenza!"
        }
      ],
      scratchSteps: [
        {
          step: 1,
          text: "🧩 Configura i 3 pin — trascina 3 blocchi PinMode nel Setup: pin 5 OUTPUT (verde), pin 6 OUTPUT (giallo), pin 3 OUTPUT (rosso)",
          explanation: "Un semaforo ha 3 luci indipendenti, quindi servono 3 pin diversi. Ogni blocco PinMode configura un pin — puoi impilarli uno sotto l'altro nel Setup.",
          xml: `<xml xmlns="https://developers.google.com/blockly/xml">
<block type="arduino_base" x="40" y="30" deletable="false">
<statement name="SETUP">
<block type="arduino_pin_mode"><field name="PIN">5</field><field name="MODE">OUTPUT</field>
<next><block type="arduino_pin_mode"><field name="PIN">6</field><field name="MODE">OUTPUT</field>
<next><block type="arduino_pin_mode"><field name="PIN">3</field><field name="MODE">OUTPUT</field>
</block></next></block></next></block>
</statement>
</block></xml>`
        },
        {
          step: 2,
          text: "🧩 Fase VERDE — nel Loop: DigitalWrite pin 5 HIGH, pin 6 LOW, pin 3 LOW, poi Attendi 3000 ms",
          explanation: "Nella fase verde, accendiamo solo il pin 5 (verde) e spegniamo gli altri due. Il delay 3000 ms = 3 secondi, come un vero semaforo.",
          xml: `<xml xmlns="https://developers.google.com/blockly/xml">
<block type="arduino_base" x="40" y="30" deletable="false">
<statement name="SETUP">
<block type="arduino_pin_mode"><field name="PIN">5</field><field name="MODE">OUTPUT</field>
<next><block type="arduino_pin_mode"><field name="PIN">6</field><field name="MODE">OUTPUT</field>
<next><block type="arduino_pin_mode"><field name="PIN">3</field><field name="MODE">OUTPUT</field>
</block></next></block></next></block>
</statement>
<statement name="LOOP">
<block type="arduino_digital_write"><field name="PIN">5</field><field name="STATE">HIGH</field>
<next><block type="arduino_digital_write"><field name="PIN">6</field><field name="STATE">LOW</field>
<next><block type="arduino_digital_write"><field name="PIN">3</field><field name="STATE">LOW</field>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">3000</field></shadow></value>
</block></next></block></next></block></next></block>
</statement>
</block></xml>`
        },
        {
          step: 3,
          text: "🧩 Completa il semaforo — aggiungi fase GIALLA (pin 6 HIGH, 1000 ms) e fase ROSSA (pin 3 HIGH, 3000 ms). Il ciclo si ripete!",
          explanation: "Il giallo dura solo 1 secondo (1000 ms) perché nella realtà è una fase di transizione breve. Il Loop ripete tutto all'infinito: verde → giallo → rosso → verde...",
          xml: SEMAFORO_SCRATCH
        }
      ],
      quiz: [
        {
          question: "Perché nel semaforo si accende un solo LED alla volta?",
          options: ["Perché Arduino non ha abbastanza corrente per tutti", "Perché i LED sono collegati in serie", "Perché il codice spegne gli altri prima di accenderne uno nuovo"],
          correct: 2,
          explanation: "Il programma usa digitalWrite LOW per spegnere tutti i LED, poi accende solo quello giusto. Così funziona come un vero semaforo!"
        },
        {
          question: "Quale colore del semaforo resta acceso più a lungo?",
          options: ["Il giallo, con 3 secondi", "Il verde e il rosso, con 3 secondi ciascuno", "Tutti restano accesi lo stesso tempo"],
          correct: 1,
          explanation: "Il verde e il rosso hanno delay(3000) cioè 3 secondi, mentre il giallo ha delay(1000) cioè solo 1 secondo, come nei semafori veri!"
        }
      ]
    },

    // ═══════════════════════════════════════════════════
    // CAPITOLO 7 — I pin di input (3 esperimenti)
    // ═══════════════════════════════════════════════════
    {
      id: "v3-cap7-pullup",
      title: "Cap. 7 Esp. 1 - Pulsante INPUT_PULLUP",
      desc: "Collegamento base del pulsante con INPUT_PULLUP. Solo pulsante e GND, nessun LED.",
      chapter: "Capitolo 7 - I pin di input",
// © Andrea Marro — 12/03/2026 — ELAB Tutor — Tutti i diritti riservati
      difficulty: 1,
      icon: "\u{1F518}",
      simulationMode: "avr",
      components: [
        { type: "breadboard-half", id: "bb1" },
        { type: "nano-r4", id: "nano1" },
        { type: "push-button", id: "btn1" }
      ],
      pinAssignments: {
        "btn1:pin1": "bb1:e20",
        "btn1:pin2": "bb1:f20"
      },
      connections: [
        { from: "nano1:W_D6", to: "bb1:a20", color: "yellow" },
        { from: "bb1:j20", to: "bb1:bus-bot-minus-20", color: "black" },
        { from: "nano1:GND_R", to: "bb1:bus-bot-minus-1", color: "black" },
        { from: "nano1:5V", to: "bb1:bus-bot-plus-1", color: "red" }
      ],
      // Button straddles center gap at col 20: pin1 on e20, pin2 on f20
      // D6 (W_D6) → a20 (same column as btn1:pin1), f20 → GND bus (via j20)
      layout: {
        "nano1": { x: 230, y: 10 },
        "bb1": { x: 280, y: 10 },
        "btn1": { x: 455.25, y: 81.25 }
      },
      steps: [
        "Posiziona l'Arduino Nano sopra la breadboard.",
        "Inserisci il pulsante a cavallo della scanalatura centrale della breadboard (fila e/f, colonna 20).",
        "Collega il pin D6 dell'Arduino (breakout wing W_D6) alla fila a colonna 20 con un filo giallo (stessa colonna del pin1 del pulsante).",
        "Collega la fila j colonna 20 al binario GND (-) con un filo nero (stessa colonna del pin2 del pulsante).",
        "Collega GND dell'Arduino al binario GND. Carica il programma: usa INPUT_PULLUP.",
        "Premi il pulsante nel simulatore e osserva cosa succede al valore letto!"
      ],
      observe: "Quando NON premi il pulsante, digitalRead(6) legge HIGH (1) grazie al resistore di pull-up interno. Quando premi, il pulsante collega D6 a GND e digitalRead legge LOW (0). È una logica invertita: premere = LOW!",
      galileoPrompt: "Sei Galileo, il tutor AI di ELAB. Lo studente sta guardando l'esperimento 'Pulsante INPUT_PULLUP' del Volume 3 — Arduino Programmato. Questo è il primo esperimento con un INPUT! Il codice usa pinMode(6, INPUT_PULLUP) che attiva un resistore interno dell'Arduino. Quando il pulsante NON è premuto, digitalRead(6) legge HIGH (1). Quando è premuto, il pulsante collega il pin a GND e digitalRead(6) legge LOW (0). È come un interruttore della luce al contrario: quando premi, il valore scende! Spiega il codice riga per riga in modo semplice, usando analogie adatte a bambini di 8-12 anni. Rispondi in italiano.",
      code: `// Pulsante con INPUT_PULLUP — Pin D6 (breakout wing W_D6)
// Solo collegamento pulsante, nessun LED output
// Resistore di pull-up interno attivato

void setup() {
  pinMode(6, INPUT_PULLUP);
}

void loop() {
  int stato = digitalRead(6);
  // stato = HIGH quando NON premuto (pull-up)
  // stato = LOW quando premuto (collegato a GND)
}`,
      hexFile: "/hex/v3-cap7-pullup.hex",
      scratchXml: PULLUP_SCRATCH,
      // S102: Scratch steps — INPUT_PULLUP: solo lettura digitale, nessun output
      scratchSteps: [
        {
          label: "Apri l'editor blocchi",
          description: "Programmiamo la lettura del pulsante! Apri l'editor e vai sulla tab 🧩 Blocchi.",
          explanation: "Questo è il primo esperimento con un INPUT — il pulsante. Il codice è cortissimo: 2 blocchi! Ma il concetto è fondamentale: Arduino legge il mondo esterno.",
          xml: `<xml xmlns="https://developers.google.com/blockly/xml"><block type="arduino_base" x="40" y="30" deletable="false"></block></xml>`,
        },
        {
          label: "Configura il pulsante",
          description: "Nel Setup, trascina un blocco 'PinMode' e imposta pin 6, modalità INPUT_PULLUP.",
          explanation: "INPUT_PULLUP attiva un resistore interno dell'Arduino che tiene il pin a HIGH (1). Quando premi il pulsante, il pin va a LOW (0). È come un interruttore al contrario: premere = spegnere!",
          xml: `<xml xmlns="https://developers.google.com/blockly/xml"><block type="arduino_base" x="40" y="30" deletable="false"><statement name="SETUP"><block type="arduino_pin_mode"><field name="PIN">6</field><field name="MODE">INPUT_PULLUP</field></block></statement></block></xml>`,
        },
        {
          label: "Leggi lo stato del pulsante",
          description: "Nel Loop, trascina un blocco 'Dichiara variabile': tipo int, nome 'stato', e come valore un blocco 'DigitalRead' con pin 6. Compila e osserva il valore nel simulatore!",
          explanation: "digitalRead(6) legge il pin e restituisce 1 (non premuto) o 0 (premuto). Salvarlo in una variabile 'stato' ti permette di usarlo dopo in un Se/Altrimenti. Premi il pulsante nel simulatore e guarda il valore cambiare!",
          xml: PULLUP_SCRATCH,
        },
      ],
      concept: "INPUT_PULLUP, resistore interno, digitalRead",
      layer: "terra",
      buildSteps: [
        {
          step: 1,
          text: "Prendi il pulsante dalla palette e posizionalo a cavallo della scanalatura, nei fori E20 e F20",
          componentId: "btn1",
          componentType: "push-button",
          targetPins: { "btn1:pin1": "bb1:e20", "btn1:pin2": "bb1:f20" },
          hint: "Il pulsante ha 4 piedini: quelli che contano sono E20 (sopra) e F20 (sotto la scanalatura)."
        },
        {
          step: 2,
          text: "Collega un filo GIALLO dal pin D6 dell'Arduino (breakout wing W_D6) al foro A20",
          wireFrom: "nano1:W_D6",
          wireTo: "bb1:a20",
          wireColor: "yellow",
          hint: "D6 è configurato come INPUT_PULLUP: ha un resistore interno verso 5V."
        },
        {
          step: 3,
          text: "Collega un filo NERO dal foro J20 al binario GND (−)",
          wireFrom: "bb1:j20",
          wireTo: "bb1:bus-bot-minus-20",
          wireColor: "black",
          hint: "Quando premi il pulsante, D6 viene collegato a GND e legge LOW."
        },
        {
          step: 4,
          text: "Collega un filo NERO dal pin GND dell'Arduino al binario GND (−)",
          wireFrom: "nano1:GND_R",
          wireTo: "bb1:bus-bot-minus-1",
          wireColor: "black",
          hint: "Massa dell'Arduino."
        },
        {
          step: 5,
          text: "Collega un filo ROSSO dal pin 5V al binario +. Solo 3 componenti: Arduino, breadboard e pulsante!",
          wireFrom: "nano1:5V",
          wireTo: "bb1:bus-bot-plus-1",
          wireColor: "red",
          hint: "Circuito semplicissimo: il resistore di pull-up è DENTRO l'Arduino!"
        }
      ],
      quiz: [
        {
          question: "Cosa fa INPUT_PULLUP quando si configura un pin?",
          options: ["Attiva un resistore interno che tiene il pin a HIGH quando il pulsante non è premuto", "Rende il pin più potente per accendere LED grandi", "Disattiva il pin fino alla pressione del pulsante"],
          correct: 0,
          explanation: "INPUT_PULLUP attiva un resistore interno ad Arduino che tiene il pin a livello HIGH. Quando premi il pulsante, il pin va a LOW."
        },
        {
          question: "Con INPUT_PULLUP, cosa legge il pin quando il pulsante è premuto?",
          options: ["HIGH (livello alto)", "Un valore casuale", "LOW (livello basso)"],
          correct: 2,
          explanation: "Con il pull-up interno, premere il pulsante collega il pin a GND, quindi digitalRead legge LOW. È la logica invertita!"
        }
      ]
    },
    {
      id: "v3-cap7-pulsante",
      title: "Cap. 7 Esp. 2 - Pulsante accende LED",
      desc: "Premi il pulsante su D6 e il LED su D10 si accende! Logica invertita con pull-up.",
      chapter: "Capitolo 7 - I pin di input",
      difficulty: 2,
      icon: "\u{1F4A1}",
      simulationMode: "avr",
      components: [
        { type: "breadboard-half", id: "bb1" },
        { type: "nano-r4", id: "nano1" },
        { type: "push-button", id: "btn1" },
        { type: "resistor", id: "r1", value: 470 },
        { type: "led", id: "led1", color: "red" }
      ],
      pinAssignments: {
        "btn1:pin1": "bb1:e20",
        "btn1:pin2": "bb1:f20",
        "r1:pin1": "bb1:i22",
        "r1:pin2": "bb1:i29",
        "led1:anode": "bb1:h29",
        "led1:cathode": "bb1:h30"
      },
      connections: [
        { from: "nano1:W_D6", to: "bb1:a20", color: "yellow" },
        { from: "bb1:j20", to: "bb1:bus-bot-minus-20", color: "black" },
        { from: "nano1:W_D10", to: "bb1:f22", color: "orange" },
        { from: "bb1:f30", to: "bb1:bus-bot-minus-30", color: "black" },
        { from: "nano1:GND_R", to: "bb1:bus-bot-minus-1", color: "black" },
        { from: "nano1:5V", to: "bb1:bus-bot-plus-1", color: "red" }
      ],
      // Button at col 20: pin1 e20, pin2 f20. D6 (W_D6) → a20, f20 col → GND bus (via j20)
      // R1 on row i col 22-29 (moved from g to i for visual clearance). LED1 anode h29, cathode h30.
      // D10 (W_D10) → f22, connects to r1:pin1 via f-j column strip. cathode col 30 → GND bus
      layout: {
        "nano1": { x: 230, y: 10 },
        "bb1": { x: 280, y: 10 },
        "btn1": { x: 455.25, y: 81.25 },
        "r1": { x: 481.5, y: 113.75 },
        "led1": { x: 511.5, y: 83.75 }
      },
      steps: [
        "Posiziona l'Arduino Nano sopra la breadboard.",
        "Inserisci il pulsante a cavallo della scanalatura (fila e/f, colonna 20).",
        "Collega D6 (breakout wing W_D6) alla fila a col 20 (filo giallo). Collega fila j col 20 al binario GND (filo nero).",
        "Inserisci il resistore da 470\u03A9 sulla fila i, colonne 22-29.",
        "Inserisci il LED rosso: anodo fila h col 29, catodo fila h col 30.",
        "Collega D10 (breakout wing W_D10) alla fila f col 22. Catodo col 30 al binario GND. Carica il programma!"
      ],
      observe: "Quando premi il pulsante, il LED rosso si accende. Quando rilasci, si spegne. Il codice usa un if/else: se digitalRead(6) è LOW (pulsante premuto), accende il LED. Come un campanello: premi il bottone e la luce si accende!",
      galileoPrompt: "Sei Galileo, il tutor AI di ELAB. Lo studente sta guardando l'esperimento 'Pulsante accende LED' del Volume 3 — Arduino Programmato. Questo esperimento combina INPUT e OUTPUT! Il codice usa digitalRead(6) per leggere il pulsante e un if/else per decidere: se digitalRead(6) è LOW (pulsante premuto), allora digitalWrite(10, HIGH) accende il LED; altrimenti digitalWrite(10, LOW) lo spegne. La logica è invertita perché con INPUT_PULLUP premere il pulsante dà LOW. È come un campanello: premi il bottone e la luce si accende! Spiega il codice riga per riga in modo semplice, usando analogie adatte a bambini di 8-12 anni. Rispondi in italiano.",
      code: `// Pulsante D6 accende LED D10
// Pin D6 (breakout wing W_D6) = pulsante INPUT_PULLUP
// Pin D10 (breakout wing W_D10) = LED OUTPUT

void setup() {
  pinMode(6, INPUT_PULLUP);
  pinMode(10, OUTPUT);
}

void loop() {
  if (digitalRead(6) == LOW) {
    digitalWrite(10, HIGH);
  } else {
    digitalWrite(10, LOW);
  }
}`,
      hexFile: "/hex/v3-cap7-pulsante.hex",
      scratchXml: PULSANTE_SCRATCH,
      concept: "Input + output, if/else, logica invertita pull-up",
// © Andrea Marro — 12/03/2026 — ELAB Tutor — Tutti i diritti riservati
      layer: "schema",
      buildSteps: [
        {
          step: 1,
          text: "Prendi il pulsante e posizionalo a cavallo della scanalatura, nei fori E20 e F20",
          componentId: "btn1",
          componentType: "push-button",
          targetPins: { "btn1:pin1": "bb1:e20", "btn1:pin2": "bb1:f20" },
          hint: "Il pulsante è l'INPUT: lo premi e Arduino legge il segnale."
        },
        {
          step: 2,
          text: "Prendi il resistore da 470Ω e posizionalo nei fori I22 e I29",
          componentId: "r1",
          componentType: "resistor",
          targetPins: { "r1:pin1": "bb1:i22", "r1:pin2": "bb1:i29" },
          hint: "R1 protegge il LED. Lo mettiamo nella fila I (parte bassa della breadboard)."
        },
        {
          step: 3,
          text: "Prendi il LED rosso e mettilo nei fori H29 e H30. L'anodo (+) in H29!",
          componentId: "led1",
          componentType: "led",
          targetPins: { "led1:anode": "bb1:h29", "led1:cathode": "bb1:h30" },
          hint: "Il LED è l'OUTPUT: si accende quando premi il pulsante."
        },
        {
          step: 4,
          text: "Collega un filo GIALLO dal pin D6 dell'Arduino (breakout wing W_D6) al foro A20",
          wireFrom: "nano1:W_D6",
          wireTo: "bb1:a20",
          wireColor: "yellow",
          hint: "D6 legge il pulsante (INPUT_PULLUP)."
        },
        {
          step: 5,
          text: "Collega un filo NERO dal foro J20 al binario GND (−)",
          wireFrom: "bb1:j20",
          wireTo: "bb1:bus-bot-minus-20",
          wireColor: "black",
          hint: "Quando premi, il pulsante collega D6 a GND → legge LOW."
        },
        {
          step: 6,
          text: "Collega un filo ARANCIONE dal pin D10 dell'Arduino (breakout wing W_D10) al foro F22",
          wireFrom: "nano1:W_D10",
          wireTo: "bb1:f22",
          wireColor: "orange",
          hint: "D10 controlla il LED (OUTPUT)."
        },
        {
          step: 7,
          text: "Collega un filo NERO dal foro F30 al binario GND (−)",
          wireFrom: "bb1:f30",
          wireTo: "bb1:bus-bot-minus-30",
          wireColor: "black",
          hint: "Catodo del LED verso massa."
        },
        {
          step: 8,
          text: "Collega un filo NERO dal pin GND dell'Arduino al binario GND (−)",
          wireFrom: "nano1:GND_R",
          wireTo: "bb1:bus-bot-minus-1",
          wireColor: "black",
          hint: "Massa dell'Arduino."
        },
        {
          step: 9,
          text: "Collega un filo ROSSO dal pin 5V al binario +. Premi il pulsante per accendere il LED!",
          wireFrom: "nano1:5V",
          wireTo: "bb1:bus-bot-plus-1",
          wireColor: "red",
          hint: "INPUT (pulsante su D6) + OUTPUT (LED su D10). Il codice usa if/else!"
        }
      ],
      scratchSteps: [
        {
          step: 1,
          text: "🧩 Configura i pin — nel Setup: PinMode pin 6 come INPUT_PULLUP (pulsante) e pin 10 come OUTPUT (LED)",
          explanation: "INPUT_PULLUP è una modalità speciale: Arduino attiva una resistenza interna che tiene il pin a HIGH quando il pulsante non è premuto. Così non serve una resistenza esterna!",
          xml: `<xml xmlns="https://developers.google.com/blockly/xml">
<block type="arduino_base" x="40" y="30" deletable="false">
<statement name="SETUP">
<block type="arduino_pin_mode"><field name="PIN">6</field><field name="MODE">INPUT_PULLUP</field>
<next><block type="arduino_pin_mode"><field name="PIN">10</field><field name="MODE">OUTPUT</field>
</block></next></block>
</statement>
</block></xml>`
        },
        {
          step: 2,
          text: "🧩 Aggiungi la condizione — nel Loop: trascina un blocco Se/Altrimenti. Nella condizione metti: DigitalRead pin 6 = 0 (pulsante premuto)",
          explanation: "Con INPUT_PULLUP, il pin legge HIGH (1) quando il pulsante è rilasciato e LOW (0) quando è premuto. Sembra al contrario, ma è così perché il pulsante collega il pin a GND.",
          xml: `<xml xmlns="https://developers.google.com/blockly/xml">
<block type="arduino_base" x="40" y="30" deletable="false">
<statement name="SETUP">
<block type="arduino_pin_mode"><field name="PIN">6</field><field name="MODE">INPUT_PULLUP</field>
<next><block type="arduino_pin_mode"><field name="PIN">10</field><field name="MODE">OUTPUT</field>
</block></next></block>
</statement>
<statement name="LOOP">
<block type="controls_if">
<mutation else="1"/>
<value name="IF0">
<block type="logic_compare"><field name="OP">EQ</field>
<value name="A"><block type="arduino_digital_read"><field name="PIN">6</field></block></value>
<value name="B"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
</block>
</value>
</block>
</statement>
</block></xml>`
        },
        {
          step: 3,
          text: "🧩 Completa il programma — nel SE: DigitalWrite pin 10 HIGH (accendi LED). Nell'ALTRIMENTI: DigitalWrite pin 10 LOW (spegni LED)",
          explanation: "Hai appena creato un programma interattivo! Arduino legge il pulsante e decide cosa fare. Questo schema SE/ALTRIMENTI è la base di tutta la programmazione.",
          xml: PULSANTE_SCRATCH
        }
      ],
      quiz: [
        {
          question: "Cosa fa la funzione digitalRead nel programma?",
          options: ["Legge lo stato del pin (HIGH o LOW) per sapere se il pulsante è premuto", "Scrive un valore sul pin", "Cancella il valore del pin"],
          correct: 0,
          explanation: "digitalRead legge lo stato di un pin di input: restituisce HIGH o LOW. Così Arduino sa se il pulsante è premuto oppure no."
        },
        {
          question: "Cosa decide il blocco if/else nel codice?",
          options: ["Se Arduino è acceso o spento", "Se il pulsante è premuto accende il LED, altrimenti lo spegne", "Quale colore deve avere il LED"],
          correct: 1,
          explanation: "if/else controlla il valore del pulsante: se è premuto (LOW con pull-up) accende il LED, altrimenti (else) lo spegne."
        }
      ]
    },
    {
      id: "v3-cap7-mini",
      title: "Cap. 7 Esp. 3 - 2 LED + Pulsante (toggle)",
      desc: "Pulsante su D6, LED verde D10, LED rosso D9. Premi per alternare quale si accende!",
      chapter: "Capitolo 7 - I pin di input",
      difficulty: 2,
      icon: "\u{1F6A6}",
      simulationMode: "avr",
      components: [
        { type: "breadboard-half", id: "bb1" },
        { type: "nano-r4", id: "nano1" },
        { type: "push-button", id: "btn1" },
        { type: "resistor", id: "r1", value: 470 },
        { type: "resistor", id: "r2", value: 470 },
        { type: "led", id: "led1", color: "green" },
        { type: "led", id: "led2", color: "red" }
      ],
      pinAssignments: {
        "btn1:pin1": "bb1:e20",
        "btn1:pin2": "bb1:f20",
        "r1:pin1": "bb1:c18",
        "r1:pin2": "bb1:c25",
        "led1:anode": "bb1:d27",
        "led1:cathode": "bb1:d28",
        "r2:pin1": "bb1:g18",
        "r2:pin2": "bb1:g25",
        "led2:anode": "bb1:h27",
        "led2:cathode": "bb1:h28"
      },
      connections: [
        { from: "nano1:W_D6", to: "bb1:a20", color: "yellow" },
        { from: "bb1:j20", to: "bb1:bus-bot-minus-20", color: "black" },
        { from: "nano1:W_D10", to: "bb1:a18", color: "green" },
        { from: "bb1:d25", to: "bb1:d27", color: "green" },
        { from: "bb1:a28", to: "bb1:bus-bot-minus-28", color: "black" },
        { from: "nano1:W_D9", to: "bb1:f18", color: "red" },
        { from: "bb1:h25", to: "bb1:h27", color: "green" },
        { from: "bb1:f28", to: "bb1:bus-bot-minus-28", color: "black" },
        { from: "nano1:GND_R", to: "bb1:bus-bot-minus-1", color: "black" },
        { from: "nano1:5V", to: "bb1:bus-bot-plus-1", color: "red" }
      ],
      // Button at col 20: pin1 e20, pin2 f20. D6 (W_D6) → a20, f20 col → GND bus (via j20)
      // R1 (green) row c col 18-25, LED1 shifted to d27-d28, bridge d25→d27. D10 (W_D10) → a18
      // R2 (red) row g col 18-25, LED2 shifted to h27-h28, bridge h25→h27. D9 (W_D9) → f18
      // cathodes col 28 → GND bus
      layout: {
        "nano1": { x: 230, y: 10 },
        "bb1": { x: 280, y: 10 },
        "btn1": { x: 455.25, y: 81.25 },
        "r1": { x: 451.5, y: 58.75 },
        "led1": { x: 496.5, y: 43.75 },
        "r2": { x: 451.5, y: 98.75 },
        "led2": { x: 496.5, y: 83.75 }
      },
      steps: [
        "Posiziona l'Arduino Nano sopra la breadboard.",
        "Inserisci il pulsante a cavallo della scanalatura (fila e/f, colonna 20).",
        "Collega D6 (breakout wing W_D6) alla fila a col 20 (filo giallo). Fila j col 20 al binario GND (filo nero).",
        "Circuito verde: resistore 470\u03A9 fila c col 18-25, LED verde anodo fila d col 27, catodo d col 28. Ponte verde d25-d27. D10 (W_D10) alla fila a col 18.",
        "Circuito rosso: resistore 470\u03A9 fila g col 18-25, LED rosso anodo fila h col 27, catodo h col 28. Ponte verde h25-h27. D9 alla fila f col 18.",
        "Collega le colonne dei catodi (28) al binario GND. Carica e premi il pulsante per alternare!"
      ],
      observe: "All'avvio il LED verde è acceso e il rosso spento. Ogni volta che premi il pulsante, si scambiano: il verde si spegne e il rosso si accende, o viceversa. Il codice usa il debounce per evitare rimbalzi meccanici del pulsante.",
      galileoPrompt: "Sei Galileo, il tutor AI di ELAB. Lo studente sta guardando l'esperimento '2 LED + Pulsante (toggle)' del Volume 3 — Arduino Programmato. Questo è l'esperimento più avanzato del capitolo 7! Il codice usa variabili booleane (statoVerde e ultimoPulsante) per ricordare lo stato tra un ciclo e l'altro. Rileva la transizione HIGH->LOW del pulsante (il momento esatto della pressione) e usa il debounce con delay(50) per evitare falsi contatti. Poi con if/else alterna quale LED è acceso. È come un interruttore che ogni volta che lo premi cambia stanza! Spiega il codice riga per riga in modo semplice, usando analogie adatte a bambini di 8-12 anni. Rispondi in italiano.",
      code: `// 2 LED + Pulsante Toggle
// © Andrea Marro — 12/03/2026 — ELAB Tutor — Tutti i diritti riservati
// D6 (W_D6) = pulsante, D10 (W_D10) = verde, D9 (W_D9) = rosso
// Premi per alternare: verde <-> rosso

bool statoVerde = true;
bool ultimoPulsante = HIGH;

void setup() {
  pinMode(6, INPUT_PULLUP);
  pinMode(10, OUTPUT);
  pinMode(9, OUTPUT);
}

void loop() {
  bool letturaBtn = digitalRead(6);

  // Rileva pressione (transizione HIGH -> LOW)
  if (ultimoPulsante == HIGH && letturaBtn == LOW) {
    statoVerde = !statoVerde;
    delay(50); // debounce
  }
  ultimoPulsante = letturaBtn;

  if (statoVerde) {
    digitalWrite(10, HIGH);  // verde acceso
    digitalWrite(9, LOW);    // rosso spento
  } else {
    digitalWrite(10, LOW);   // verde spento
    digitalWrite(9, HIGH);   // rosso acceso
  }
}`,
      hexFile: "/hex/v3-cap7-mini.hex",
      scratchXml: MINI_TOGGLE_SCRATCH,
      concept: "Toggle, debounce, variabili di stato, 2 output",
      layer: "schema",
      buildSteps: [
        {
          step: 1,
          text: "Prendi il pulsante e posizionalo a cavallo della scanalatura, nei fori E20 e F20",
          componentId: "btn1",
          componentType: "push-button",
          targetPins: { "btn1:pin1": "bb1:e20", "btn1:pin2": "bb1:f20" },
          hint: "Il pulsante è il toggle: ogni pressione alterna quale LED è acceso."
        },
        {
          step: 2,
          text: "Prendi il resistore R1 (470Ω) e posizionalo nei fori C18 e C25 — circuito verde",
          componentId: "r1",
          componentType: "resistor",
          targetPins: { "r1:pin1": "bb1:c18", "r1:pin2": "bb1:c25" },
          hint: "R1 protegge il LED verde. Fila C, parte alta."
        },
        {
          step: 3,
          text: "Prendi il LED verde e mettilo nei fori D27 e D28. L'anodo (+) in D27!",
          componentId: "led1",
          componentType: "led",
          targetPins: { "led1:anode": "bb1:d27", "led1:cathode": "bb1:d28" },
          hint: "LED verde = stato iniziale acceso. Spostato a destra del resistore."
        },
        {
          step: 4,
          text: "Collega un filo VERDE dal foro D25 al foro D27 (ponte R1→LED verde)",
          wireFrom: "bb1:d25",
          wireTo: "bb1:d27",
          wireColor: "green",
          hint: "Collega il resistore al LED verde."
        },
        {
          step: 5,
          text: "Prendi il resistore R2 (470Ω) e posizionalo nei fori G18 e G25 — circuito rosso",
          componentId: "r2",
          componentType: "resistor",
          targetPins: { "r2:pin1": "bb1:g18", "r2:pin2": "bb1:g25" },
          hint: "R2 protegge il LED rosso. Fila G, parte bassa."
        },
        {
          step: 6,
          text: "Prendi il LED rosso e mettilo nei fori H27 e H28. L'anodo (+) in H27!",
          componentId: "led2",
          componentType: "led",
          targetPins: { "led2:anode": "bb1:h27", "led2:cathode": "bb1:h28" },
          hint: "LED rosso = stato iniziale spento. Si accende al primo toggle."
        },
        {
          step: 7,
          text: "Collega un filo VERDE dal foro H25 al foro H27 (ponte R2→LED rosso)",
          wireFrom: "bb1:h25",
          wireTo: "bb1:h27",
          wireColor: "green",
          hint: "Collega il resistore al LED rosso."
        },
        {
          step: 8,
          text: "Collega un filo GIALLO dal pin D6 dell'Arduino (breakout wing W_D6) al foro A20",
          wireFrom: "nano1:W_D6",
          wireTo: "bb1:a20",
          wireColor: "yellow",
          hint: "D6 legge il pulsante con INPUT_PULLUP."
        },
        {
          step: 9,
          text: "Collega un filo NERO dal foro J20 al binario GND (−)",
          wireFrom: "bb1:j20",
          wireTo: "bb1:bus-bot-minus-20",
          wireColor: "black",
          hint: "Lato GND del pulsante."
        },
        {
          step: 10,
          text: "Collega un filo VERDE dal pin D10 dell'Arduino (breakout wing W_D10) al foro A18",
          wireFrom: "nano1:W_D10",
          wireTo: "bb1:a18",
          wireColor: "green",
          hint: "D10 controlla il LED verde (stessa colonna di R1)."
        },
        {
          step: 11,
          text: "Collega un filo NERO dal foro A28 al binario GND (−) — catodo verde",
          wireFrom: "bb1:a28",
          wireTo: "bb1:bus-bot-minus-28",
          wireColor: "black",
          hint: "Catodo del LED verde verso massa."
        },
        {
          step: 12,
          text: "Collega un filo ROSSO dal pin D9 dell'Arduino al foro F18",
          wireFrom: "nano1:W_D9",
          wireTo: "bb1:f18",
          wireColor: "red",
          hint: "D9 controlla il LED rosso (stessa colonna di R2)."
        },
        {
          step: 13,
          text: "Collega un filo NERO dal foro F28 al binario GND (−) — catodo rosso",
          wireFrom: "bb1:f28",
          wireTo: "bb1:bus-bot-minus-28",
          wireColor: "black",
          hint: "Catodo del LED rosso verso massa."
        },
        {
          step: 14,
          text: "Collega un filo NERO dal pin GND dell'Arduino al binario GND (−)",
          wireFrom: "nano1:GND_R",
          wireTo: "bb1:bus-bot-minus-1",
          wireColor: "black",
          hint: "Massa dell'Arduino."
        },
        {
          step: 15,
          text: "Collega un filo ROSSO dal pin 5V al binario +. Premi il pulsante per alternare i LED!",
          wireFrom: "nano1:5V",
          wireTo: "bb1:bus-bot-plus-1",
          wireColor: "red",
          hint: "Pulsante (D6) + LED verde (D10) + LED rosso (D9). Il codice usa il debounce!"
        }
      ],
      // S102: Scratch steps — 2 LED + pulsante (versione semplificata senza toggle/debounce)
      scratchSteps: [
        {
          label: "Apri l'editor blocchi",
          description: "Programmiamo il pulsante con 2 LED! Apri l'editor e vai sulla tab 🧩 Blocchi.",
          explanation: "La versione a blocchi è semplificata: il pulsante tenuto premuto accende il verde e spegne il rosso, rilasciato fa il contrario. La versione C++ è più avanzata con il toggle (ogni pressione alterna) e il debounce!",
          xml: `<xml xmlns="https://developers.google.com/blockly/xml"><block type="arduino_base" x="40" y="30" deletable="false"></block></xml>`,
        },
        {
          label: "Configura 3 pin",
          description: "Nel Setup: PinMode pin 6 come INPUT_PULLUP (pulsante), pin 10 come OUTPUT (LED verde), pin 9 come OUTPUT (LED rosso).",
          explanation: "Tre pin da configurare! INPUT_PULLUP per il pulsante (resistenza interna attivata), OUTPUT per i due LED. È come assegnare un ruolo a ogni porta: chi ascolta e chi comanda.",
          xml: `<xml xmlns="https://developers.google.com/blockly/xml"><block type="arduino_base" x="40" y="30" deletable="false"><statement name="SETUP"><block type="arduino_pin_mode"><field name="PIN">6</field><field name="MODE">INPUT_PULLUP</field><next><block type="arduino_pin_mode"><field name="PIN">10</field><field name="MODE">OUTPUT</field><next><block type="arduino_pin_mode"><field name="PIN">9</field><field name="MODE">OUTPUT</field></block></next></block></next></block></statement></block></xml>`,
        },
        {
          label: "Aggiungi Se/Altrimenti",
          description: "Nel Loop: trascina un blocco 'Se/Altrimenti'. Nella condizione metti: DigitalRead pin 6 = 0 (pulsante premuto).",
          explanation: "Con INPUT_PULLUP il pulsante legge 0 quando è premuto (collegato a GND) e 1 quando è rilasciato. Il Se/Altrimenti è come un bivio: pulsante premuto → una strada, rilasciato → l'altra!",
          xml: `<xml xmlns="https://developers.google.com/blockly/xml"><block type="arduino_base" x="40" y="30" deletable="false"><statement name="SETUP"><block type="arduino_pin_mode"><field name="PIN">6</field><field name="MODE">INPUT_PULLUP</field><next><block type="arduino_pin_mode"><field name="PIN">10</field><field name="MODE">OUTPUT</field><next><block type="arduino_pin_mode"><field name="PIN">9</field><field name="MODE">OUTPUT</field></block></next></block></next></block></statement><statement name="LOOP"><block type="controls_if"><mutation else="1"/><value name="IF0"><block type="logic_compare"><field name="OP">EQ</field><value name="A"><block type="arduino_digital_read"><field name="PIN">6</field></block></value><value name="B"><shadow type="math_number"><field name="NUM">0</field></shadow></value></block></value></block></statement></block></xml>`,
        },
        {
          label: "Controlla i 2 LED",
          description: "Nel SE: DigitalWrite pin 10 HIGH (verde acceso) e pin 9 LOW (rosso spento). Nell'ALTRIMENTI: pin 10 LOW (verde spento) e pin 9 HIGH (rosso acceso). Compila e prova!",
          explanation: "Quando premi il pulsante i LED si scambiano! Questa è la versione semplificata — guarda il codice C++ a destra per vedere come si fa il vero toggle con le variabili di stato e il debounce.",
          xml: MINI_TOGGLE_SCRATCH,
        },
      ],
      quiz: [
        {
          question: "Cos'è il debounce e perché serve?",
          options: ["Un modo per accendere il LED più velocemente", "Un tipo di resistore speciale", "Un sistema per ignorare i falsi contatti del pulsante quando viene premuto"],
          correct: 2,
          explanation: "Quando premi un pulsante, il contatto meccanico rimbalza creando segnali falsi. Il debounce aspetta un po' prima di leggere il valore vero."
        },
        {
          question: "Cosa significa 'toggle' nel contesto di questo esperimento?",
          options: ["Cambiare stato: se il LED è acceso si spegne, se è spento si accende", "Spegnere Arduino", "Collegare due fili insieme"],
          correct: 0,
          explanation: "Toggle significa alternare lo stato. Ogni volta che premi il pulsante, il LED cambia: da acceso a spento, o da spento ad acceso."
        }
      ]
    },

    // ═══════════════════════════════════════════════════
// © Andrea Marro — 12/03/2026 — ELAB Tutor — Tutti i diritti riservati
    // CAPITOLO 8 — I pin analogici (3 esperimenti)
    // ═══════════════════════════════════════════════════
    {
      id: "v3-cap8-id",
      title: "Cap. 8 Esp. 1 - Trova A0 sulla board",
      desc: "Osservazione fisica: individua il pin A0 sull'Arduino Nano R4. Nessun codice!",
      chapter: "Capitolo 8 - I pin analogici",
      difficulty: 1,
      icon: "\u{1F50D}",
      simulationMode: "circuit",
      components: [
        { type: "nano-r4", id: "nano1" },
        { type: "breadboard-half", id: "bb1" }
      ],
      pinAssignments: {
        "nano1:5V": "bb1:bus-top-plus-1",
        "nano1:GND": "bb1:bus-top-minus-1"
      },
      connections: [],
      layout: {
        "nano1": { x: 230, y: 10 },
        "bb1": { x: 280, y: 10 }
      },
      steps: [
        "Osserva attentamente l'Arduino Nano R4 nel simulatore.",
        "Cerca il pin A0 sul lato sinistro della scheda (la fila superiore dei pin).",
        "A0 si trova dopo i pin D13, 3V3 e AREF — è il quarto pin da sinistra.",
        "I pin analogici (A0-A7) sono tutti sul lato sinistro, dopo AREF.",
        "Sul lato destro ci sono i pin digitali D2-D12.",
        "Nota la differenza: i pin digitali leggono solo ON/OFF, i pin analogici leggono valori intermedi!"
      ],
      observe: "L'Arduino Nano R4 ha i pin analogici A0-A7 sul lato sinistro e i pin digitali D2-D12 sul lato destro. Il pin A0 è speciale: può leggere tensioni da 0V a 5V come valori numerici da 0 a 1023, come un termometro digitale!",
      galileoPrompt: "Sei Galileo, il tutor AI di ELAB. Lo studente sta guardando l'esperimento 'Trova A0 sulla board' del Volume 3 — Arduino Programmato. Questo esperimento non ha codice: è un'esplorazione visiva della board Arduino Nano R4! Lo studente deve trovare il pin A0 che si trova sul lato sinistro della scheda. I pin analogici (A0-A7) sono speciali perché possono leggere valori intermedi (non solo acceso/spento) come una manopola del volume. Aiuta lo studente a orientarsi sulla board e a capire la differenza tra pin digitali e analogici. Rispondi in italiano.",
      code: null,
      hexFile: null,
      concept: "Identificazione pin analogici, layout fisico Arduino",
      layer: "terra",
      note: "Osserva la board nel simulatore: trova il pin A0! Si trova sul lato sinistro dell'Arduino Nano.",
      buildSteps: [
        {
          step: 1,
          text: "Questo esperimento è solo osservazione! Non serve montare nulla. Guarda l'Arduino nel simulatore e trova il pin A0 sul lato sinistro della scheda.",
          componentId: null,
          componentType: null,
          targetPins: {},
          hint: "I pin analogici (A0-A7) sono sul lato sinistro, dopo AREF. I pin digitali (D2-D12) sono sul lato destro."
        }
      ],
      quiz: [
        {
          question: "Che valori può leggere un pin analogico di Arduino?",
          options: ["Solo 0 e 1", "Da 0 a 1023 (10 bit)", "Da 0 a 255 (8 bit)"],
          correct: 1,
          explanation: "I pin analogici di Arduino hanno un convertitore a 10 bit (ADC) che trasforma la tensione 0-5V in un numero da 0 a 1023."
        },
        {
          question: "Cos'è un ADC (convertitore analogico-digitale)?",
          options: ["Un componente che trasforma un segnale continuo (tensione) in un numero", "Un tipo di LED speciale", "Un cavo per collegare Arduino al computer"],
          correct: 0,
          explanation: "L'ADC converte una tensione analogica (ad esempio 2.5V) in un numero digitale che Arduino può usare nel programma (ad esempio 512)."
        }
      ]
    },
    {
      id: "v3-cap8-pot",
      title: "Cap. 8 Esp. 2 - Collegare potenziometro ad A0",
      desc: "Collegamento fisico del potenziometro al pin A0. 5V, GND e segnale. Nessun codice!",
      chapter: "Capitolo 8 - I pin analogici",
      difficulty: 1,
      icon: "\u{1F39B}\uFE0F",
      simulationMode: "circuit",
      components: [
        { type: "breadboard-half", id: "bb1" },
        { type: "nano-r4", id: "nano1" },
        { type: "potentiometer", id: "pot1", value: 10000 }
      ],
      pinAssignments: {
        "pot1:vcc": "bb1:h22",
        "pot1:signal": "bb1:h23",
        "pot1:gnd": "bb1:h24"
      },
      connections: [
        { from: "bb1:f22", to: "bb1:bus-bot-plus-22", color: "red" },
        { from: "nano1:W_A0", to: "bb1:f23", color: "yellow" },
        { from: "bb1:f24", to: "bb1:bus-bot-minus-24", color: "black" },
        { from: "nano1:GND_R", to: "bb1:bus-bot-minus-1", color: "black" },
        { from: "nano1:5V", to: "bb1:bus-bot-plus-1", color: "red" }
      ],
      // Pot: vcc at h22, signal at h23, gnd at h24
      // vcc col 22 → 5V bus (via f22), signal col 23 → A0 (via f23), gnd col 24 → GND bus (via f24)
      layout: {
        "nano1": { x: 230, y: 10 },
        "bb1": { x: 280, y: 10 },
        "pot1": { x: 462.75, y: 83.75 }
      },
      steps: [
        "Posiziona l'Arduino Nano sopra la breadboard.",
        "Inserisci il potenziometro sulla breadboard (fila h, colonne 22-24).",
        "Collega la fila f col 22 (stessa colonna VCC) al binario + (5V) con un filo rosso.",
        "Collega il pin A0 dell'Arduino alla fila f col 23 (stessa colonna Signal) con un filo giallo.",
        "Collega la fila f col 24 (stessa colonna GND) al binario - (GND) con un filo nero.",
        "Collega GND e 5V dell'Arduino ai binari. Gira la manopola nel simulatore!"
      ],
      observe: "Il potenziometro ha 3 fili: VCC (alimentazione 5V), GND (massa), e Signal (segnale centrale). Girando la manopola, il pin centrale fornisce una tensione variabile da 0V a 5V. È come un rubinetto: girandolo, controlli quanta tensione arriva al pin A0.",
      galileoPrompt: "Sei Galileo, il tutor AI di ELAB. Lo studente sta guardando l'esperimento 'Collegare potenziometro ad A0' del Volume 3 — Arduino Programmato. Anche questo esperimento non ha codice: si impara il collegamento fisico del potenziometro. Ha tre piedini: VCC va collegato a 5V (l'alimentazione), GND va a GND (la massa), e il piedino centrale (signal/wiper) va al pin A0. Il potenziometro è come un rubinetto: girando la manopola, cambia quanta tensione arriva al pin A0, da 0V a 5V. Aiuta lo studente a capire questo collegamento a tre fili. Rispondi in italiano.",
      code: null,
      hexFile: null,
      concept: "Collegamento potenziometro, 5V/GND/segnale, pin analogico",
      layer: "terra",
      note: "Osserva il collegamento: VCC a 5V, GND a GND, segnale (wiper) a A0.",
      buildSteps: [
        {
          step: 1,
          text: "Prendi il potenziometro da 10kΩ e posizionalo sulla breadboard nei fori H22, H23, H24",
          componentId: "pot1",
          componentType: "potentiometer",
          targetPins: { "pot1:vcc": "bb1:h22", "pot1:signal": "bb1:h23", "pot1:gnd": "bb1:h24" },
          hint: "Il potenziometro ha 3 piedini: VCC (H22), Signal (H23), GND (H24)."
        },
        {
          step: 2,
          text: "Collega un filo ROSSO dal foro F22 al binario + (5V)",
          wireFrom: "bb1:f22",
          wireTo: "bb1:bus-bot-plus-22",
          wireColor: "red",
          hint: "Il piedino VCC del potenziometro riceve i 5V."
        },
        {
          step: 3,
          text: "Collega un filo GIALLO dal pin A0 dell'Arduino al foro F23",
          wireFrom: "nano1:W_A0",
          wireTo: "bb1:f23",
          wireColor: "yellow",
          hint: "Il segnale del potenziometro va al pin analogico A0."
        },
        {
          step: 4,
          text: "Collega un filo NERO dal foro F24 al binario GND (−)",
          wireFrom: "bb1:f24",
          wireTo: "bb1:bus-bot-minus-24",
          wireColor: "black",
          hint: "Il piedino GND del potenziometro va a massa."
        },
        {
          step: 5,
          text: "Collega un filo NERO dal pin GND dell'Arduino al binario GND (−)",
          wireFrom: "nano1:GND_R",
          wireTo: "bb1:bus-bot-minus-1",
          wireColor: "black",
          hint: "Massa dell'Arduino."
        },
        {
          step: 6,
          text: "Collega un filo ROSSO dal pin 5V al binario +. Gira la manopola nel simulatore!",
          wireFrom: "nano1:5V",
          wireTo: "bb1:bus-bot-plus-1",
          wireColor: "red",
          hint: "3 fili: VCC→5V, Signal→A0, GND→GND. Come un rubinetto che controlla la tensione!"
        }
      ],
      quiz: [
        {
          question: "Quale funzione si usa per leggere un valore analogico in Arduino?",
          options: ["digitalRead(A0)", "analogWrite(A0)", "analogRead(A0)"],
          correct: 2,
          explanation: "analogRead(A0) legge la tensione sul pin A0 e la converte in un numero da 0 a 1023. digitalRead legge solo HIGH o LOW!"
        },
        {
          question: "Che valore dà il potenziometro quando è ruotato al massimo?",
          options: ["0", "512", "1023"],
          correct: 2,
          explanation: "Ruotato al massimo il potenziometro manda 5V al pin A0, che Arduino converte nel valore massimo: 1023."
        }
      ]
    },
    {
      id: "v3-cap8-serial",
      title: "Cap. 8 Esp. 3 - analogRead + Serial Monitor",
      desc: "Leggi il valore del potenziometro su A0 e stampalo sul Serial Monitor! Valori 0-1023.",
      chapter: "Capitolo 8 - I pin analogici",
      difficulty: 2,
      icon: "\u{1F4CA}",
      simulationMode: "avr",
      components: [
        { type: "breadboard-half", id: "bb1" },
        { type: "nano-r4", id: "nano1" },
        { type: "potentiometer", id: "pot1", value: 10000 }
      ],
      pinAssignments: {
        "pot1:vcc": "bb1:h22",
        "pot1:signal": "bb1:h23",
        "pot1:gnd": "bb1:h24"
      },
      connections: [
        { from: "bb1:f22", to: "bb1:bus-bot-plus-22", color: "red" },
        { from: "nano1:W_A0", to: "bb1:f23", color: "yellow" },
        { from: "bb1:f24", to: "bb1:bus-bot-minus-24", color: "black" },
        { from: "nano1:GND_R", to: "bb1:bus-bot-minus-1", color: "black" },
        { from: "nano1:5V", to: "bb1:bus-bot-plus-1", color: "red" }
      ],
// © Andrea Marro — 12/03/2026 — ELAB Tutor — Tutti i diritti riservati
      // Same pot layout as cap8-pot
      // vcc col 22 → 5V bus, signal col 23 → A0, gnd col 24 → GND bus
      layout: {
        "nano1": { x: 230, y: 10 },
        "bb1": { x: 280, y: 10 },
        "pot1": { x: 462.75, y: 83.75 }
      },
      steps: [
        "Costruisci lo stesso circuito dell'esperimento precedente (potenziometro su A0).",
        "Carica il programma: apre la comunicazione seriale a 9600 baud.",
        "Apri il Serial Monitor nel simulatore (pannello in basso).",
        "Gira lentamente la manopola del potenziometro.",
        "Osserva i numeri che appaiono sul Serial Monitor: vanno da 0 a 1023.",
        "Prova a trovare il valore 512 (metà corsa) girando la manopola con precisione!"
      ],
      observe: "Sul Serial Monitor appaiono numeri che cambiano in tempo reale quando giri la manopola. Il valore va da 0 (manopola tutta a sinistra, 0V) a 1023 (tutta a destra, 5V). Questo è il convertitore analogico-digitale (ADC) a 10 bit dell'Arduino: trasforma una tensione analogica in un numero digitale!",
      galileoPrompt: "Sei Galileo, il tutor AI di ELAB. Lo studente sta guardando l'esperimento 'analogRead + Serial Monitor' del Volume 3 — Arduino Programmato. Questo è il primo esperimento con i pin analogici E il Serial Monitor! Il codice usa Serial.begin(9600) nel setup per aprire la comunicazione seriale. Nel loop(), analogRead(A0) legge il valore del potenziometro come un numero da 0 a 1023 (ADC a 10 bit), poi Serial.println(valore) lo stampa sul monitor. Il delay(200) evita di stampare troppo velocemente. È come un termometro digitale che legge la temperatura e la mostra sullo schermo! Spiega il codice riga per riga in modo semplice, usando analogie adatte a bambini di 8-12 anni. Rispondi in italiano.",
      code: `// analogRead + Serial Monitor
// Potenziometro su A0, stampa valore 0-1023

void setup() {
  Serial.begin(9600);
}

void loop() {
  int valore = analogRead(A0);
  Serial.println(valore);
  delay(200);
}`,
      hexFile: "/hex/v3-cap8-serial.hex",
      scratchXml: SERIAL_SCRATCH,
      concept: "analogRead, Serial Monitor, ADC 10 bit (0-1023)",
      layer: "schema",
      buildSteps: [
        {
          step: 1,
          text: "Prendi il potenziometro da 10kΩ e posizionalo nei fori H22, H23, H24 (come l'esperimento precedente)",
          componentId: "pot1",
          componentType: "potentiometer",
          targetPins: { "pot1:vcc": "bb1:h22", "pot1:signal": "bb1:h23", "pot1:gnd": "bb1:h24" },
          hint: "Stesso collegamento dell'esperimento precedente. Stavolta aggiungiamo il codice!"
        },
        {
          step: 2,
          text: "Collega un filo ROSSO dal foro F22 al binario + (5V)",
          wireFrom: "bb1:f22",
          wireTo: "bb1:bus-bot-plus-22",
          wireColor: "red",
          hint: "VCC del potenziometro → 5V."
        },
        {
          step: 3,
          text: "Collega un filo GIALLO dal pin A0 dell'Arduino al foro F23",
          wireFrom: "nano1:W_A0",
          wireTo: "bb1:f23",
          wireColor: "yellow",
          hint: "Segnale del potenziometro → A0. analogRead(A0) leggerà valori 0-1023."
        },
        {
          step: 4,
          text: "Collega un filo NERO dal foro F24 al binario GND (−)",
          wireFrom: "bb1:f24",
          wireTo: "bb1:bus-bot-minus-24",
          wireColor: "black",
          hint: "GND del potenziometro → massa."
        },
        {
          step: 5,
          text: "Collega un filo NERO dal pin GND dell'Arduino al binario GND (−)",
          wireFrom: "nano1:GND_R",
          wireTo: "bb1:bus-bot-minus-1",
          wireColor: "black",
          hint: "Massa dell'Arduino."
        },
        {
          step: 6,
          text: "Collega un filo ROSSO dal pin 5V al binario +. Apri il Serial Monitor per vedere i valori!",
          wireFrom: "nano1:5V",
          wireTo: "bb1:bus-bot-plus-1",
          wireColor: "red",
          hint: "Gira la manopola e osserva i numeri 0-1023 sul Serial Monitor!"
        }
      ],
      // S102: Scratch steps — analogRead + Serial Monitor
      scratchSteps: [
        {
          label: "Apri l'editor blocchi",
          description: "Programmiamo la lettura analogica! Apri l'editor e vai sulla tab 🧩 Blocchi.",
          explanation: "Questo esperimento introduce due concetti nuovi: leggere un valore analogico (0-1023) e stamparlo sul Serial Monitor. È come avere un termometro digitale che mostra la temperatura sullo schermo!",
          xml: `<xml xmlns="https://developers.google.com/blockly/xml"><block type="arduino_base" x="40" y="30" deletable="false"></block></xml>`,
        },
        {
          label: "Inizializza la comunicazione seriale",
          description: "Nel Setup, trascina un blocco 'Serial.begin' dal menu Seriale. Imposta la velocità a 9600 baud.",
          explanation: "Serial.begin(9600) apre un canale di comunicazione tra Arduino e il computer a 9600 bit/secondo. È come sintonizzare la radio sulla stessa frequenza per poter parlare!",
          xml: `<xml xmlns="https://developers.google.com/blockly/xml"><block type="arduino_base" x="40" y="30" deletable="false"><statement name="SETUP"><block type="arduino_serial_begin"><field name="BAUD">9600</field></block></statement></block></xml>`,
        },
        {
          label: "Leggi il potenziometro",
          description: "Nel Loop, trascina un blocco 'Dichiara variabile' dal menu Variabili. Tipo: int, nome: valore, e come valore metti un blocco 'AnalogRead' con pin A0.",
          explanation: "analogRead(A0) converte la tensione del potenziometro (0-5V) in un numero da 0 a 1023. Questa conversione si chiama ADC (Analog to Digital Converter) — è come trasformare il volume di una radio in un numero!",
          xml: `<xml xmlns="https://developers.google.com/blockly/xml"><block type="arduino_base" x="40" y="30" deletable="false"><statement name="SETUP"><block type="arduino_serial_begin"><field name="BAUD">9600</field></block></statement><statement name="LOOP"><block type="arduino_variable_set"><field name="TYPE">int</field><field name="VAR">valore</field><value name="VALUE"><block type="arduino_analog_read"><field name="PIN">A0</field></block></value></block></statement></block></xml>`,
        },
        {
          label: "Stampa e rallenta",
          description: "Dopo la variabile, aggiungi 'Serial.print' con newline ✓ e come contenuto il blocco 'Leggi variabile: valore'. Poi aggiungi 'Attendi 200ms' per non stampare troppo veloce. Compila e apri il Serial Monitor!",
          explanation: "Serial.println() stampa il valore e va a capo. Il delay(200) evita di riempire lo schermo troppo velocemente — 5 letture al secondo sono sufficienti. Gira la manopola e vedrai i numeri cambiare in tempo reale!",
          xml: SERIAL_SCRATCH,
        },
      ],
      quiz: [
        {
          question: "Cosa fa Serial.begin(9600) nel setup?",
          options: ["Avvia la comunicazione seriale a 9600 baud (velocità di trasmissione)", "Accende il LED sul pin 9600", "Aspetta 9600 millisecondi"],
          correct: 0,
          explanation: "Serial.begin(9600) apre la comunicazione tra Arduino e il computer a 9600 baud. Serve per poter inviare e ricevere dati."
        },
        {
          question: "A cosa serve il Serial Monitor?",
          options: ["A programmare Arduino", "A vedere i dati che Arduino invia al computer in tempo reale", "A controllare la temperatura di Arduino"],
          correct: 1,
          explanation: "Il Serial Monitor è una finestra che mostra i messaggi inviati da Arduino al computer tramite Serial.println(). Utilissimo per il debug!"
        }
      ]
    },

    // ═══════════════════════════════════════════════════
    // EXTRA — Componenti avanzati (Servo, LCD)
    // ═══════════════════════════════════════════════════
    {
      id: "v3-extra-lcd-hello",
      title: "Extra - LCD Hello World",
      desc: "Visualizza un messaggio su un display LCD 16x2 usando il protocollo HD44780 in modalità 4-bit.",
      chapter: "Extra",
      difficulty: 2,
      icon: "\u{1F4FA}",
      simulationMode: "avr",
      components: [
        { type: "breadboard-half", id: "bb1" },
        { type: "nano-r4", id: "nano1" },
        { type: "lcd16x2", id: "lcd1" }
      ],
      pinAssignments: {
        "lcd1:rs": "bb1:a25",
        "lcd1:e": "bb1:a26",
        "lcd1:d4": "bb1:a27",
        "lcd1:d5": "bb1:a28",
        "lcd1:d6": "bb1:a29",
        "lcd1:d7": "bb1:a30",
        "lcd1:vcc": "bb1:bus-bot-plus-25",
        "lcd1:gnd": "bb1:bus-bot-minus-25"
      },
      connections: [
        { from: "nano1:5V", to: "bb1:bus-bot-plus-1", color: "red" },
        { from: "nano1:GND_R", to: "bb1:bus-bot-minus-1", color: "black" },
        { from: "nano1:W_D12", to: "bb1:e25", color: "orange" },
        { from: "nano1:W_D11", to: "bb1:e26", color: "orange" },
        { from: "nano1:W_D5", to: "bb1:e27", color: "yellow" },
        { from: "nano1:W_D10", to: "bb1:e28", color: "yellow" },
        { from: "nano1:W_D3", to: "bb1:e29", color: "yellow" },
        { from: "nano1:W_D6", to: "bb1:e30", color: "yellow" }
      ],
      layout: {
        "nano1": { x: 230, y: 10 },
        "bb1": { x: 280, y: 10 },
        "lcd1": { x: 348.1, y: 163.1 }
      },
      steps: [
        "Collega il display LCD alla breadboard e al Nano come mostrato nello schema.",
        "Premi Compila per compilare il codice.",
        "Premi Play per avviare la simulazione.",
        "Osserva il messaggio \"Hello World!\" sul display LCD."
      ],
      observe: "Il display LCD mostra \"Hello World!\" sulla prima riga e \"ELAB Simulator\" sulla seconda. Il protocollo HD44780 in modalità 4-bit usa 6 pin di Arduino per controllare il display: RS, E, D4-D7.",
      galileoPrompt: "Sei Galileo, il tutor AI di ELAB. Lo studente sta guardando l'esperimento 'LCD Hello World' — Extra. Questo esperimento mostra come usare un display LCD 16x2 con Arduino. Il display usa il protocollo HD44780 in modalità 4-bit: servono 6 pin (RS, E, D4-D7). La libreria LiquidCrystal semplifica tutto: lcd.begin(16,2) inizializza il display, lcd.setCursor(colonna, riga) posiziona il cursore, lcd.print() stampa il testo. Rispondi in italiano.",
      code: `#include <LiquidCrystal.h>

// RS=12 (W_D12), E=11 (W_D11), D4=5 (W_D5), D5=10 (W_D10), D6=3 (W_D3), D7=6 (W_D6)
LiquidCrystal lcd(12, 11, 5, 10, 3, 6);

void setup() {
  lcd.begin(16, 2);
  lcd.setCursor(0, 0);
  lcd.print("Hello World!");
  lcd.setCursor(0, 1);
  lcd.print("ELAB Simulator");
}

void loop() {
  // Nulla da fare nel loop
}`,
      hexFile: "/hex/v3-extra-lcd-hello.hex",
      // S111: LCD Blockly blocks — full Scratch support
      scratchSteps: [
        {
          label: "Inizializza LCD",
          description: "Trascina il blocco 'LCD Init' dalla categoria LCD Display nel Setup. I pin sono già impostati: RS=12, E=11, D4=5, D5=10, D6=3, D7=6.",
          explanation: "Il display LCD 16x2 usa il protocollo HD44780 in modalità 4-bit. Servono 6 pin: RS (Register Select) per distinguere dati/comandi, E (Enable) per validare i dati, e D4-D7 per i 4 bit di dati. lcd.begin(16,2) dice al display le sue dimensioni.",
          xml: `<xml xmlns="https://developers.google.com/blockly/xml"><block type="arduino_base" x="40" y="30" deletable="false"><statement name="SETUP"><block type="arduino_lcd_init"><field name="RS">12</field><field name="E">11</field><field name="D4">5</field><field name="D5">10</field><field name="D6">3</field><field name="D7">6</field><field name="COLS">16</field><field name="ROWS">2</field></block></statement></block></xml>`,
        },
// © Andrea Marro — 12/03/2026 — ELAB Tutor — Tutti i diritti riservati
        {
          label: "Scrivi Hello World!",
          description: "Aggiungi 'LCD Cursore col 0 riga 0' e poi 'LCD Print \"Hello World!\"' dopo l'init nel Setup.",
          explanation: "lcd.setCursor(0,0) posiziona il cursore alla prima colonna della prima riga (entrambe partono da 0). lcd.print() stampa il testo dalla posizione corrente del cursore.",
          xml: `<xml xmlns="https://developers.google.com/blockly/xml"><block type="arduino_base" x="40" y="30" deletable="false"><statement name="SETUP"><block type="arduino_lcd_init"><field name="RS">12</field><field name="E">11</field><field name="D4">5</field><field name="D5">10</field><field name="D6">3</field><field name="D7">6</field><field name="COLS">16</field><field name="ROWS">2</field><next><block type="arduino_lcd_set_cursor"><field name="COL">0</field><field name="ROW">0</field><next><block type="arduino_lcd_print"><value name="TEXT"><shadow type="text"><field name="TEXT">Hello World!</field></shadow></value></block></next></block></next></block></statement></block></xml>`,
        },
        {
          label: "Seconda riga: ELAB Simulator",
          description: "Aggiungi 'LCD Cursore col 0 riga 1' e 'LCD Print \"ELAB Simulator\"' per scrivere sulla seconda riga.",
          explanation: "Il display LCD 16x2 ha 2 righe (0 e 1) e 16 colonne (0-15). Spostando il cursore alla riga 1 scriviamo sulla seconda riga. Il codice generato è identico al C++ dell'esperimento!",
          xml: `<xml xmlns="https://developers.google.com/blockly/xml"><block type="arduino_base" x="40" y="30" deletable="false"><statement name="SETUP"><block type="arduino_lcd_init"><field name="RS">12</field><field name="E">11</field><field name="D4">5</field><field name="D5">10</field><field name="D6">3</field><field name="D7">6</field><field name="COLS">16</field><field name="ROWS">2</field><next><block type="arduino_lcd_set_cursor"><field name="COL">0</field><field name="ROW">0</field><next><block type="arduino_lcd_print"><value name="TEXT"><shadow type="text"><field name="TEXT">Hello World!</field></shadow></value><next><block type="arduino_lcd_set_cursor"><field name="COL">0</field><field name="ROW">1</field><next><block type="arduino_lcd_print"><value name="TEXT"><shadow type="text"><field name="TEXT">ELAB Simulator</field></shadow></value></block></next></block></next></block></next></block></next></block></statement></block></xml>`,
        },
      ],
      concept: "Display LCD 16x2, protocollo HD44780, modalità 4-bit, LiquidCrystal",
      layer: "schema",
      buildSteps: [
        {
          step: 1,
          text: "Prendi il display LCD 16x2 e posizionalo sotto la breadboard (collegamento tramite fili)",
          componentId: "lcd1",
          componentType: "lcd16x2",
          targetPins: {
            "lcd1:rs": "bb1:a25", "lcd1:e": "bb1:a26",
            "lcd1:d4": "bb1:a27", "lcd1:d5": "bb1:a28",
            "lcd1:d6": "bb1:a29", "lcd1:d7": "bb1:a30",
            "lcd1:vcc": "bb1:bus-bot-plus-25", "lcd1:gnd": "bb1:bus-bot-minus-25"
          },
          hint: "L'LCD usa 6 pin dati (RS, E, D4-D7) + VCC e GND. È il componente più complesso!"
        },
        {
          step: 2,
          text: "Collega un filo ROSSO dal pin 5V dell'Arduino al binario + della breadboard",
          wireFrom: "nano1:5V",
          wireTo: "bb1:bus-bot-plus-1",
          wireColor: "red",
          hint: "Alimentazione per LCD e circuito."
        },
        {
          step: 3,
          text: "Collega un filo NERO dal pin GND dell'Arduino al binario GND (−)",
          wireFrom: "nano1:GND_R",
          wireTo: "bb1:bus-bot-minus-1",
          wireColor: "black",
          hint: "Massa dell'Arduino."
        },
        {
          step: 4,
          text: "Collega un filo ARANCIONE dal pin D12 dell'Arduino al foro E25 (RS dell'LCD)",
          wireFrom: "nano1:W_D12",
          wireTo: "bb1:e25",
          wireColor: "orange",
          hint: "RS (Register Select) dice all'LCD se stai inviando dati o comandi."
        },
        {
          step: 5,
          text: "Collega un filo ARANCIONE dal pin D11 dell'Arduino al foro E26 (Enable dell'LCD)",
          wireFrom: "nano1:W_D11",
          wireTo: "bb1:e26",
          wireColor: "orange",
          hint: "E (Enable) è il segnale di clock: l'LCD legge i dati quando E va HIGH."
        },
        {
          step: 6,
          text: "Collega un filo GIALLO dal pin D5 dell'Arduino al foro E27 (D4 dell'LCD)",
          wireFrom: "nano1:W_D5",
          wireTo: "bb1:e27",
          wireColor: "yellow",
          hint: "D4 è il primo dei 4 pin dati (modalità 4-bit)."
        },
        {
          step: 7,
          text: "Collega un filo GIALLO dal pin D10 dell'Arduino (breakout wing W_D10) al foro E28 (D5 dell'LCD)",
          wireFrom: "nano1:W_D10",
          wireTo: "bb1:e28",
          wireColor: "yellow",
          hint: "D5 è il secondo pin dati."
        },
        {
          step: 8,
          text: "Collega un filo GIALLO dal pin D3 dell'Arduino al foro E29 (D6 dell'LCD)",
          wireFrom: "nano1:W_D3",
          wireTo: "bb1:e29",
          wireColor: "yellow",
          hint: "D6 è il terzo pin dati."
        },
        {
          step: 9,
          text: "Collega un filo GIALLO dal pin D6 dell'Arduino (breakout wing W_D6) al foro E30 (D7 dell'LCD). LCD collegato!",
          wireFrom: "nano1:W_D6",
          wireTo: "bb1:e30",
          wireColor: "yellow",
          hint: "D7 è l'ultimo pin dati. 6 fili dati + VCC/GND = LCD pronto per 'Hello World!'."
        }
      ],
      quiz: [
        {
          question: "Quale protocollo di comunicazione usa il display LCD con Arduino?",
          options: ["Wi-Fi", "Comunicazione parallela (più fili dati contemporaneamente)", "Bluetooth"],
          correct: 1,
          explanation: "L'LCD usa la comunicazione parallela: i dati vengono inviati su più fili contemporaneamente (D4-D7). Per questo servono tanti collegamenti!"
        },
        {
          question: "Cosa fa il comando lcd.setCursor(0, 0)?",
          options: ["Spegne il display", "Cancella tutto il testo", "Posiziona il cursore alla prima colonna della prima riga"],
          correct: 2,
          explanation: "setCursor(0, 0) sposta il cursore alla posizione colonna 0, riga 0, cioè l'angolo in alto a sinistra del display. Da lì inizia a scrivere!"
        }
      ]
    },
    {
      id: "v3-extra-servo-sweep",
      title: "Extra - Servo Sweep",
      desc: "Controlla un servomotore facendo oscillare il braccio da 0 a 180 gradi e ritorno.",
      chapter: "Extra",
      difficulty: 2,
      icon: "\u{2699}\uFE0F",
      simulationMode: "avr",
      components: [
        { type: "breadboard-half", id: "bb1" },
        { type: "nano-r4", id: "nano1" },
        { type: "servo", id: "servo1" }
      ],
      pinAssignments: {
        "servo1:signal": "bb1:a20",
        "servo1:vcc": "bb1:bus-bot-plus-20",
        "servo1:gnd": "bb1:bus-bot-minus-20"
      },
      connections: [
        { from: "nano1:5V", to: "bb1:bus-bot-plus-1", color: "red" },
        { from: "nano1:GND_R", to: "bb1:bus-bot-minus-1", color: "black" },
        { from: "nano1:W_D9", to: "bb1:e20", color: "orange" }
      ],
      layout: {
        "nano1": { x: 130, y: 20 },
        "bb1": { x: 280, y: 10 },
        "servo1": { x: 505, y: 140 }
      },
      steps: [
        "Collega il servomotore alla breadboard: segnale su D9, VCC e GND.",
        "Premi Compila per compilare il codice.",
        "Premi Play per avviare la simulazione.",
        "Osserva il braccio del servo che oscilla da 0 a 180 gradi e ritorno."
      ],
      observe: "Il braccio del servo si muove lentamente da 0 a 180 gradi, poi ritorna a 0. Il ciclo si ripete all'infinito. Il servo usa un segnale PWM sul pin D9 per controllare l'angolo.",
      galileoPrompt: "Sei Galileo, il tutor AI di ELAB. Lo studente sta guardando l'esperimento 'Servo Sweep' — Extra. Un servomotore è un motore che può ruotare a un angolo preciso (da 0 a 180 gradi). La libreria Servo di Arduino semplifica il controllo: myServo.attach(9) collega il servo al pin 9, myServo.write(angolo) imposta l'angolo. Il codice usa due cicli for: uno da 0 a 180 e uno da 180 a 0, con delay(15) tra ogni grado per un movimento fluido. Rispondi in italiano.",
      code: `#include <Servo.h>

Servo myServo;

void setup() {
  myServo.attach(9);
}

void loop() {
  for (int angle = 0; angle <= 180; angle++) {
    myServo.write(angle);
    delay(15);
  }
  for (int angle = 180; angle >= 0; angle--) {
    myServo.write(angle);
    delay(15);
  }
}`,
      hexFile: "/hex/v3-extra-servo-sweep.hex",
      scratchXml: SERVO_SCRATCH,
      // S102: Scratch steps — Servo Sweep (versione semplificata: 0° ↔ 180° con delay)
      scratchSteps: [
        {
          label: "Apri l'editor blocchi",
          description: "Programmiamo il servomotore! Apri l'editor e vai sulla tab 🧩 Blocchi.",
          explanation: "Un servomotore è diverso da un motore normale: può ruotare a un angolo preciso (da 0° a 180°). La versione a blocchi è semplificata — salta tra 0° e 180° invece di fare lo sweep graduale del codice C++.",
          xml: `<xml xmlns="https://developers.google.com/blockly/xml"><block type="arduino_base" x="40" y="30" deletable="false"></block></xml>`,
        },
        {
          label: "Collega il servo",
          description: "Nel Setup, trascina un blocco 'Servo.attach' dal menu Servo. Imposta il pin a 9.",
          explanation: "Servo.attach(9) dice ad Arduino: 'il servo è collegato al pin 9'. Da questo momento puoi controllare l'angolo del braccio con servo.write(). La libreria Servo viene inclusa automaticamente!",
          xml: `<xml xmlns="https://developers.google.com/blockly/xml"><block type="arduino_base" x="40" y="30" deletable="false"><statement name="SETUP"><block type="arduino_servo_attach"><field name="PIN">9</field></block></statement></block></xml>`,
        },
        {
          label: "Posizione 0 gradi",
          description: "Nel Loop, trascina 'Servo.write' e imposta l'angolo a 0. Poi aggiungi 'Attendi 1000ms' per dare tempo al servo di muoversi.",
          explanation: "servo.write(0) porta il braccio tutto a sinistra. Il delay di 1 secondo dà tempo al servo di raggiungere la posizione — i servo non sono istantanei, hanno bisogno di qualche decimo di secondo per ruotare.",
          xml: `<xml xmlns="https://developers.google.com/blockly/xml"><block type="arduino_base" x="40" y="30" deletable="false"><statement name="SETUP"><block type="arduino_servo_attach"><field name="PIN">9</field></block></statement><statement name="LOOP"><block type="arduino_servo_write"><value name="ANGLE"><shadow type="math_number"><field name="NUM">0</field></shadow></value><next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow></value></block></next></block></statement></block></xml>`,
        },
        {
          label: "Oscillazione completa",
          description: "Aggiungi un altro 'Servo.write' con angolo 180 e un altro 'Attendi 1000ms'. Il braccio oscillerà avanti e indietro! Compila e osserva.",
          explanation: "Il servo ora oscilla tra 0° e 180° — è come un tergicristallo! La versione C++ usa un ciclo for con delay(15) per ogni grado, creando un movimento fluido. Con i blocchi facciamo un salto netto che è comunque visibile e istruttivo.",
          xml: SERVO_SCRATCH,
        },
      ],
      concept: "Servomotore, PWM, libreria Servo, angoli 0-180",
      layer: "schema",
      buildSteps: [
        {
          step: 1,
          text: "Prendi il servomotore e posizionalo accanto alla breadboard",
          componentId: "servo1",
          componentType: "servo",
// © Andrea Marro — 12/03/2026 — ELAB Tutor — Tutti i diritti riservati
          targetPins: {
            "servo1:signal": "bb1:a20",
            "servo1:vcc": "bb1:bus-bot-plus-20",
            "servo1:gnd": "bb1:bus-bot-minus-20"
          },
          hint: "Il servo ha 3 fili: segnale (arancione), VCC (rosso), GND (marrone/nero)."
        },
        {
          step: 2,
          text: "Collega un filo ROSSO dal pin 5V dell'Arduino al binario + della breadboard",
          wireFrom: "nano1:5V",
          wireTo: "bb1:bus-bot-plus-1",
          wireColor: "red",
          hint: "Il servo si alimenta dai 5V."
        },
        {
          step: 3,
          text: "Collega un filo NERO dal pin GND dell'Arduino al binario GND (−)",
          wireFrom: "nano1:GND_R",
          wireTo: "bb1:bus-bot-minus-1",
          wireColor: "black",
          hint: "Massa comune per Arduino e servo."
        },
        {
          step: 4,
          text: "Collega un filo ARANCIONE dal pin D9 dell'Arduino al foro E20 (segnale del servo)",
          wireFrom: "nano1:W_D9",
          wireTo: "bb1:e20",
          wireColor: "orange",
          hint: "Il pin D9 genera il segnale PWM che controlla l'angolo del servo (0-180°)."
        }
      ],
      quiz: [
        {
          question: "Qual è l'intervallo di rotazione di un servomotore standard?",
          options: ["Da 0 a 90 gradi", "Da 0 a 180 gradi", "Da 0 a 360 gradi"],
          correct: 1,
          explanation: "Un servomotore standard può ruotare da 0 a 180 gradi. Il segnale PWM di Arduino controlla esattamente l'angolo del braccio."
        },
        {
          question: "Cosa fa il comando myServo.write(90)?",
          options: ["Posiziona il braccio del servo esattamente a metà (90 gradi)", "Fa girare il servo a 90 giri al minuto", "Aspetta 90 millisecondi"],
          correct: 0,
          explanation: "myServo.write(90) muove il braccio del servo alla posizione di 90 gradi, cioè esattamente a metà del suo intervallo (0-180°)."
        }
      ]
    },
    /* ═══════════════════════════════════════════════════════════════
       v3-extra-simon — Simon Says Game
       4 LED colorati + 4 pulsanti — gioco di memoria
       Pin LED: D9(rosso), D10(verde), D11(blu), D12(giallo)
       Pin BTN: D3(rosso), D5(verde), D6(blu), D13(giallo)
       Layout: stagger pattern (semaforo-style) su breadboard-half
       Andrea Marro — 06/03/2026
       ═══════════════════════════════════════════════════════════════ */
    {
      id: "v3-extra-simon",
      title: "Simon Says — Gioco di Memoria",
      desc: "Costruisci il classico gioco Simon con 4 LED colorati, 4 pulsanti e un cicalino che suona 4 note diverse! Arduino genera una sequenza luminosa e sonora sempre più lunga: ripetila premendo i pulsanti giusti!",
      chapter: "Extra",
      difficulty: 3,
      icon: "🧠",
      simulationMode: "avr",
      components: [
        { type: "breadboard-half", id: "bb1" },
        { type: "nano-r4", id: "nano1" },
        { type: "resistor", id: "r1", value: 470 },
        { type: "resistor", id: "r2", value: 470 },
        { type: "resistor", id: "r3", value: 470 },
        { type: "resistor", id: "r4", value: 470 },
        { type: "led", id: "led1", color: "red" },
        { type: "led", id: "led2", color: "green" },
        { type: "led", id: "led3", color: "blue" },
        { type: "led", id: "led4", color: "yellow" },
        { type: "push-button", id: "btn1" },
        { type: "push-button", id: "btn2" },
        { type: "push-button", id: "btn3" },
        { type: "push-button", id: "btn4" },
        { type: "buzzer-piezo", id: "buz1" }
      ],
      pinAssignments: {
        /* --- LED circuits: R→LED→GND (top section rows b-d, bottom g-h) --- */
        "r1:pin1": "bb1:b16", "r1:pin2": "bb1:b23",
        "led1:anode": "bb1:d23", "led1:cathode": "bb1:d24",
        "r2:pin1": "bb1:e22", "r2:pin2": "bb1:e29",
        "led2:anode": "bb1:d29", "led2:cathode": "bb1:d30",
        "r3:pin1": "bb1:g16", "r3:pin2": "bb1:g23",
        "led3:anode": "bb1:h23", "led3:cathode": "bb1:h24",
        "r4:pin1": "bb1:i22", "r4:pin2": "bb1:i29",
        "led4:anode": "bb1:h29", "led4:cathode": "bb1:h30",
        /* --- Buttons: straddling e-f gap --- */
        "btn1:pin1": "bb1:e17", "btn1:pin2": "bb1:f17",
        "btn2:pin1": "bb1:e20", "btn2:pin2": "bb1:f20",
        "btn3:pin1": "bb1:e25", "btn3:pin2": "bb1:f25",
        "btn4:pin1": "bb1:e28", "btn4:pin2": "bb1:f28",
        /* --- Buzzer: pin D8 → positive, negative → GND --- */
        "buz1:positive": "bb1:b10", "buz1:negative": "bb1:b11"
      },
      connections: [
        /* LED drive wires: Arduino → Resistor pin1 column */
        { from: "nano1:W_D9", to: "bb1:a16", color: "red" },
        { from: "nano1:W_D10", to: "bb1:a22", color: "green" },
        { from: "nano1:W_D11", to: "bb1:f16", color: "blue" },
        { from: "nano1:W_D12", to: "bb1:f22", color: "yellow" },
        /* LED GND wires: cathode column → GND bus */
        { from: "bb1:a24", to: "bb1:bus-bot-minus-24", color: "black" },
        { from: "bb1:a30", to: "bb1:bus-bot-minus-30", color: "black" },
        { from: "bb1:j24", to: "bb1:bus-bot-minus-24", color: "black" },
        { from: "bb1:j30", to: "bb1:bus-bot-minus-30", color: "black" },
        /* Button input wires: Arduino → pin1 column */
        { from: "nano1:W_D3", to: "bb1:a17", color: "red" },
        { from: "nano1:W_D5", to: "bb1:a20", color: "green" },
        { from: "nano1:W_D6", to: "bb1:a25", color: "blue" },
        { from: "nano1:W_D13", to: "bb1:a28", color: "yellow" },
        /* Button GND wires: pin2 side → GND bus */
        { from: "bb1:j17", to: "bb1:bus-bot-minus-17", color: "black" },
        { from: "bb1:j20", to: "bb1:bus-bot-minus-20", color: "black" },
        { from: "bb1:j25", to: "bb1:bus-bot-minus-25", color: "black" },
        { from: "bb1:j28", to: "bb1:bus-bot-minus-28", color: "black" },
        /* Buzzer wires: D8 → positive, negative → GND */
        { from: "nano1:W_D8", to: "bb1:a10", color: "orange" },
        { from: "bb1:a11", to: "bb1:bus-bot-minus-11", color: "black" },
        /* Power rails */
        { from: "nano1:GND_R", to: "bb1:bus-bot-minus-1", color: "black" },
        { from: "nano1:5V", to: "bb1:bus-bot-plus-1", color: "red" }
      ],
      layout: {
        "nano1": { x: 230, y: 10 },
        "bb1": { x: 280, y: 10 },
        /* Resistors: stagger b16/e22/g16/i22 */
        "r1": { x: 436.5, y: 51.25 },
        "r2": { x: 481.5, y: 73.75 },
        "r3": { x: 436.5, y: 98.75 },
        "r4": { x: 481.5, y: 113.75 },
        /* LEDs: at resistor output columns */
        "led1": { x: 466.5, y: 43.75 },
        "led2": { x: 511.5, y: 43.75 },
        "led3": { x: 466.5, y: 83.75 },
        "led4": { x: 511.5, y: 83.75 },
        /* Buttons: straddling gap at cols 17, 20, 25, 28 */
        "btn1": { x: 432.75, y: 81.25 },
        "btn2": { x: 455.25, y: 81.25 },
        "btn3": { x: 492.75, y: 81.25 },
        "btn4": { x: 515.25, y: 81.25 },
        /* Buzzer: left side of breadboard, columns 10-11 */
        "buz1": { x: 355, y: 43.75 }
      },
      steps: [
        "Carica il codice su Arduino.",
        "Osserva il lampeggio iniziale: tutti e 4 i LED si accendono insieme con un suono acuto.",
        "Dopo il lampeggio, un LED si accende con la sua nota musicale: è il primo elemento della sequenza.",
        "Premi il pulsante corrispondente allo stesso colore del LED — sentirai la stessa nota!",
        "Se indovini, un nuovo LED e una nuova nota vengono aggiunti alla sequenza.",
        "Memorizza la sequenza di colori E suoni, poi ripetila ad ogni turno.",
        "Se sbagli, tutti i LED lampeggiano con un suono grave (Game Over) e il gioco ricomincia!",
        "Sfida te stesso: quanti livelli riesci a completare?"
      ],
      observe: "Osserva come ogni LED si accende per 400ms insieme alla sua nota musicale (Do=262Hz per il rosso, Mi=330Hz per il verde, Sol=392Hz per il blu, Do alto=523Hz per il giallo). Il cicalino aiuta la memoria: puoi ricordare la sequenza sia con i colori che con le note! Il timeout per premere un pulsante è di 3 secondi.",
      galileoPrompt: "Questo esperimento implementa il gioco Simon Says con feedback sonoro. 4 LED colorati (rosso D9, verde D10, blu D11, giallo D12) + un cicalino piezo (D8) mostrano una sequenza di luci e suoni che si allunga ad ogni turno. Ogni colore ha la sua nota: rosso=Do(262Hz), verde=Mi(330Hz), blu=Sol(392Hz), giallo=Do alto(523Hz). 4 pulsanti (rosso D3, verde D5, blu D6, giallo D13) in INPUT_PULLUP permettono al giocatore di ripetere la sequenza. Un array seq[] memorizza fino a 100 elementi. La funzione accendi() usa tone() e noTone() per abbinare suono e luce. gameOver() suona un tono grave (150Hz) durante il lampeggio. Usa randomSeed(analogRead(A0)) per sequenze diverse ad ogni partita.",
      code: `// SIMON GAME — ELAB Volume 3
// Gioco di memoria con 4 LED, 4 pulsanti e cicalino

const int LED[] = {9, 10, 11, 12};
const int BTN[] = {3, 5, 6, 13};
const int BUZZER = 8;
// Do, Mi, Sol, Do alto — una nota per ogni colore
const int NOTE[] = {262, 330, 392, 523};
int seq[100];
int livello = 0;

void setup() {
  for (int i = 0; i < 4; i++) {
    pinMode(LED[i], OUTPUT);
    pinMode(BTN[i], INPUT_PULLUP);
  }
  pinMode(BUZZER, OUTPUT);
  randomSeed(analogRead(A0));
  // Lampeggio iniziale con suono
  for (int i = 0; i < 4; i++) {
    digitalWrite(LED[i], HIGH);
  }
  tone(BUZZER, 523);
  delay(500);
  noTone(BUZZER);
  for (int i = 0; i < 4; i++) {
    digitalWrite(LED[i], LOW);
  }
  delay(500);
}

void accendi(int idx, int ms) {
  digitalWrite(LED[idx], HIGH);
  tone(BUZZER, NOTE[idx]);
  delay(ms);
  digitalWrite(LED[idx], LOW);
  noTone(BUZZER);
  delay(100);
}

void mostraSequenza() {
// © Andrea Marro — 12/03/2026 — ELAB Tutor — Tutti i diritti riservati
  for (int i = 0; i <= livello; i++) {
    accendi(seq[i], 400);
  }
}

int leggiPulsante() {
  unsigned long inizio = millis();
  while (millis() - inizio < 3000) {
    for (int i = 0; i < 4; i++) {
      if (digitalRead(BTN[i]) == LOW) {
        accendi(i, 200);
        while (digitalRead(BTN[i]) == LOW) {}
        delay(50);
        return i;
      }
    }
  }
  return -1;
}

void gameOver() {
  for (int j = 0; j < 4; j++) {
    for (int i = 0; i < 4; i++) {
      digitalWrite(LED[i], HIGH);
    }
    tone(BUZZER, 150);
    delay(200);
    for (int i = 0; i < 4; i++) {
      digitalWrite(LED[i], LOW);
    }
    noTone(BUZZER);
    delay(200);
  }
}

void loop() {
  seq[livello] = random(0, 4);
  delay(500);
  mostraSequenza();

  for (int i = 0; i <= livello; i++) {
    int btn = leggiPulsante();
    if (btn != seq[i]) {
      gameOver();
      livello = 0;
      return;
    }
  }

  // Lampeggio di conferma livello superato
  for (int i = 0; i < 4; i++) {
    digitalWrite(LED[i], HIGH);
  }
  delay(300);
  for (int i = 0; i < 4; i++) {
    digitalWrite(LED[i], LOW);
  }

  livello++;
  delay(800);
}`,
      concept: "Il gioco Simon allena la memoria visiva, uditiva e sequenziale. Ogni colore ha una nota musicale diversa (Do, Mi, Sol, Do alto) generata con tone() — così puoi memorizzare la sequenza sia guardando i LED sia ascoltando le note. Usa array per memorizzare la sequenza (fino a 100 elementi), INPUT_PULLUP per i pulsanti (senza resistenze esterne), e random() per generare sequenze sempre diverse.",
      layer: "extra",
      scratchXml: SIMON_SCRATCH_FULL,
      buildSteps: [
        /* === LED ROSSO (r1 + led1) === */
        {
          step: 1,
          text: "Posiziona il resistore R1 (470Ω) nella breadboard — riga B, dal foro 16 al foro 23",
          componentId: "r1",
          componentType: "resistor",
          targetPins: { "r1:pin1": "bb1:b16", "r1:pin2": "bb1:b23" },
          hint: "Il resistore protegge il LED rosso dalla sovracorrente (470Ω limita a ~7mA)."
        },
        {
          step: 2,
          text: "Posiziona il LED ROSSO con l'anodo nel foro D23 e il catodo nel foro D24",
          componentId: "led1",
          componentType: "led",
          targetPins: { "led1:anode": "bb1:d23", "led1:cathode": "bb1:d24" },
          hint: "L'anodo (gamba lunga) va nel foro D23, collegato alla stessa colonna del pin2 del resistore."
        },
        {
          step: 3,
          text: "Collega un filo ROSSO dal pin D9 dell'Arduino al foro A16 (ingresso resistore R1)",
          wireFrom: "nano1:W_D9",
          wireTo: "bb1:a16",
          wireColor: "red",
          hint: "Il pin D9 controlla il LED rosso — è il primo colore del Simon."
        },
        {
          step: 4,
          text: "Collega un filo NERO dal foro A24 al binario GND (−) — massa del LED rosso",
          wireFrom: "bb1:a24",
          wireTo: "bb1:bus-bot-minus-24",
          wireColor: "black",
          hint: "Il catodo del LED deve arrivare a GND per completare il circuito.",
          scratchXml: SIMON_SCRATCH_STEP4
        },
        /* === LED VERDE (r2 + led2) === */
        {
          step: 5,
          text: "Posiziona il resistore R2 (470Ω) — riga E, dal foro 22 al foro 29",
          componentId: "r2",
          componentType: "resistor",
          targetPins: { "r2:pin1": "bb1:e22", "r2:pin2": "bb1:e29" },
          hint: "R2 è sfalsato rispetto a R1 per avere spazio sulla breadboard."
        },
        {
          step: 6,
          text: "Posiziona il LED VERDE con l'anodo nel foro D29 e il catodo nel foro D30",
          componentId: "led2",
          componentType: "led",
          targetPins: { "led2:anode": "bb1:d29", "led2:cathode": "bb1:d30" },
          hint: "L'anodo nel foro D29, stessa colonna del pin2 di R2."
        },
        {
          step: 7,
          text: "Collega un filo VERDE dal pin D10 al foro A22 (ingresso resistore R2)",
          wireFrom: "nano1:W_D10",
          wireTo: "bb1:a22",
          wireColor: "green",
          hint: "Il pin D10 controlla il LED verde — secondo colore del Simon."
        },
        {
          step: 8,
          text: "Collega un filo NERO dal foro A30 al binario GND (−) — massa del LED verde",
          wireFrom: "bb1:a30",
          wireTo: "bb1:bus-bot-minus-30",
          wireColor: "black",
          hint: "Ogni LED ha bisogno del suo collegamento a GND."
        },
        /* === LED BLU (r3 + led3) — sezione inferiore === */
        {
          step: 9,
          text: "Posiziona il resistore R3 (470Ω) nella sezione inferiore — riga G, dal foro 16 al foro 23",
          componentId: "r3",
          componentType: "resistor",
          targetPins: { "r3:pin1": "bb1:g16", "r3:pin2": "bb1:g23" },
          hint: "Ora usiamo la sezione inferiore della breadboard (sotto il gap)."
        },
        {
          step: 10,
          text: "Posiziona il LED BLU con l'anodo nel foro H23 e il catodo nel foro H24",
          componentId: "led3",
          componentType: "led",
          targetPins: { "led3:anode": "bb1:h23", "led3:cathode": "bb1:h24" },
          hint: "Stesso schema del LED rosso, ma nella sezione inferiore."
        },
        {
          step: 11,
          text: "Collega un filo BLU dal pin D11 al foro F16 (ingresso resistore R3)",
          wireFrom: "nano1:W_D11",
          wireTo: "bb1:f16",
          wireColor: "blue",
          hint: "Il pin D11 controlla il LED blu — terzo colore."
        },
        {
          step: 12,
          text: "Collega un filo NERO dal foro J24 al binario GND (−) — massa del LED blu",
          wireFrom: "bb1:j24",
          wireTo: "bb1:bus-bot-minus-24",
          wireColor: "black",
          hint: "Collegamento a GND dalla sezione inferiore."
        },
        /* === LED GIALLO (r4 + led4) === */
        {
          step: 13,
          text: "Posiziona il resistore R4 (470Ω) — riga I, dal foro 22 al foro 29",
          componentId: "r4",
          componentType: "resistor",
          targetPins: { "r4:pin1": "bb1:i22", "r4:pin2": "bb1:i29" },
          hint: "R4 è sfalsato come R2 — schema a zigzag per risparmiare spazio."
        },
        {
          step: 14,
          text: "Posiziona il LED GIALLO con l'anodo nel foro H29 e il catodo nel foro H30",
          componentId: "led4",
          componentType: "led",
          targetPins: { "led4:anode": "bb1:h29", "led4:cathode": "bb1:h30" },
          hint: "L'ultimo LED completa il quartetto di colori del Simon."
        },
        {
          step: 15,
          text: "Collega un filo GIALLO dal pin D12 al foro F22 (ingresso resistore R4)",
          wireFrom: "nano1:W_D12",
          wireTo: "bb1:f22",
          wireColor: "yellow",
          hint: "Il pin D12 controlla il LED giallo — quarto e ultimo colore."
        },
        {
          step: 16,
          text: "Collega un filo NERO dal foro J30 al binario GND (−) — massa del LED giallo",
          wireFrom: "bb1:j30",
          wireTo: "bb1:bus-bot-minus-30",
          wireColor: "black",
          hint: "Tutti e 4 i LED ora hanno i loro circuiti completi.",
          scratchXml: SIMON_SCRATCH_STEP16
        },
        /* === PULSANTE ROSSO (btn1) === */
// © Andrea Marro — 12/03/2026 — ELAB Tutor — Tutti i diritti riservati
        {
          step: 17,
          text: "Posiziona il pulsante ROSSO a cavallo del gap — pin nel foro E17 e F17",
          componentId: "btn1",
          componentType: "push-button",
          targetPins: { "btn1:pin1": "bb1:e17", "btn1:pin2": "bb1:f17" },
          hint: "Il pulsante collega la sezione superiore con quella inferiore della breadboard."
        },
        {
          step: 18,
          text: "Collega un filo ROSSO dal pin D3 al foro A17 (ingresso pulsante 1)",
          wireFrom: "nano1:W_D3",
          wireTo: "bb1:a17",
          wireColor: "red",
          hint: "D3 legge il pulsante rosso — usiamo INPUT_PULLUP, quindi niente resistenza esterna!"
        },
        {
          step: 19,
          text: "Collega un filo NERO dal foro J17 al binario GND (−) — massa pulsante rosso",
          wireFrom: "bb1:j17",
          wireTo: "bb1:bus-bot-minus-17",
          wireColor: "black",
          hint: "Quando premi, il pulsante collega D3 a GND → Arduino legge LOW."
        },
        /* === PULSANTE VERDE (btn2) === */
        {
          step: 20,
          text: "Posiziona il pulsante VERDE a cavallo del gap — pin nel foro E20 e F20",
          componentId: "btn2",
          componentType: "push-button",
          targetPins: { "btn2:pin1": "bb1:e20", "btn2:pin2": "bb1:f20" },
          hint: "Secondo pulsante, a 3 colonne di distanza dal primo."
        },
        {
          step: 21,
          text: "Collega un filo VERDE dal pin D5 al foro A20 (ingresso pulsante 2)",
          wireFrom: "nano1:W_D5",
          wireTo: "bb1:a20",
          wireColor: "green",
          hint: "D5 legge il pulsante verde."
        },
        {
          step: 22,
          text: "Collega un filo NERO dal foro J20 al binario GND (−) — massa pulsante verde",
          wireFrom: "bb1:j20",
          wireTo: "bb1:bus-bot-minus-20",
          wireColor: "black",
          hint: "Stessa logica: pulsante premuto = collegamento a GND."
        },
        /* === PULSANTE BLU (btn3) === */
        {
          step: 23,
          text: "Posiziona il pulsante BLU a cavallo del gap — pin nel foro E25 e F25",
          componentId: "btn3",
          componentType: "push-button",
          targetPins: { "btn3:pin1": "bb1:e25", "btn3:pin2": "bb1:f25" },
          hint: "Terzo pulsante, nella metà destra della breadboard."
        },
        {
          step: 24,
          text: "Collega un filo BLU dal pin D6 al foro A25 (ingresso pulsante 3)",
          wireFrom: "nano1:W_D6",
          wireTo: "bb1:a25",
          wireColor: "blue",
          hint: "D6 legge il pulsante blu."
        },
        {
          step: 25,
          text: "Collega un filo NERO dal foro J25 al binario GND (−) — massa pulsante blu",
          wireFrom: "bb1:j25",
          wireTo: "bb1:bus-bot-minus-25",
          wireColor: "black",
          hint: "Collegamento a massa per il pulsante blu."
        },
        /* === PULSANTE GIALLO (btn4) === */
        {
          step: 26,
          text: "Posiziona il pulsante GIALLO a cavallo del gap — pin nel foro E28 e F28",
          componentId: "btn4",
          componentType: "push-button",
          targetPins: { "btn4:pin1": "bb1:e28", "btn4:pin2": "bb1:f28" },
          hint: "Quarto e ultimo pulsante — il gioco è quasi pronto!"
        },
        {
          step: 27,
          text: "Collega un filo GIALLO dal pin D13 al foro A28 (ingresso pulsante 4)",
          wireFrom: "nano1:W_D13",
          wireTo: "bb1:a28",
          wireColor: "yellow",
          hint: "D13 legge il pulsante giallo."
        },
        {
          step: 28,
          text: "Collega un filo NERO dal foro J28 al binario GND (−) — massa pulsante giallo",
          wireFrom: "bb1:j28",
          wireTo: "bb1:bus-bot-minus-28",
          wireColor: "black",
          hint: "Ultimo collegamento pulsante a GND.",
          scratchXml: SIMON_SCRATCH_STEP28
        },
        /* === CICALINO (buz1) === */
        {
          step: 29,
          text: "Posiziona il cicalino piezo con il pin (+) nel foro B10 e il pin (−) nel foro B11",
          componentId: "buz1",
          componentType: "buzzer-piezo",
          targetPins: { "buz1:positive": "bb1:b10", "buz1:negative": "bb1:b11" },
          hint: "Il cicalino produce suoni con frequenze diverse — ogni colore del Simon avrà la sua nota!"
        },
        {
          step: 30,
          text: "Collega un filo ARANCIONE dal pin D8 dell'Arduino al foro A10 (pin + del cicalino)",
          wireFrom: "nano1:W_D8",
          wireTo: "bb1:a10",
          wireColor: "orange",
          hint: "Il pin D8 genera il segnale sonoro con tone() — frequenze diverse per ogni colore."
        },
        {
          step: 31,
          text: "Collega un filo NERO dal foro A11 al binario GND (−) — massa del cicalino",
          wireFrom: "bb1:a11",
          wireTo: "bb1:bus-bot-minus-11",
          wireColor: "black",
          hint: "Il cicalino ha bisogno del collegamento a GND come tutti gli altri componenti."
        },
        /* === ALIMENTAZIONE === */
        {
          step: 32,
          text: "Collega un filo NERO dal pin GND dell'Arduino al binario GND (−) della breadboard",
          wireFrom: "nano1:GND_R",
          wireTo: "bb1:bus-bot-minus-1",
          wireColor: "black",
          hint: "Questo filo distribuisce la massa a tutti i componenti via il binario GND."
        },
        {
          step: 33,
          text: "Collega un filo ROSSO dal pin 5V dell'Arduino al binario + della breadboard",
          wireFrom: "nano1:5V",
          wireTo: "bb1:bus-bot-plus-1",
          wireColor: "red",
          hint: "Il circuito è completo! Carica il codice e sfida la tua memoria con luci E suoni!",
          scratchXml: SIMON_SCRATCH_FULL
        }
      ],
      scratchSteps: [
        {
          step: 1,
          text: "🧩 Apri l'editor Scratch (tab Blocchi) e trascina il blocco 'Imposta pin 9 come USCITA' nel Setup — questo prepara il primo LED",
          hint: "Ogni LED ha bisogno del suo pinMode OUTPUT nel setup — ne servono 4 per i LED + 1 per il cicalino."
        },
        {
          step: 2,
          text: "🧩 Aggiungi 'Imposta pin 8 come USCITA' per il cicalino e 'Imposta pin 3 come INPUT_PULLUP' per il primo pulsante",
          hint: "Il cicalino (pin 8) è OUTPUT perché noi MANDIAMO il segnale. I pulsanti sono INPUT_PULLUP: Arduino legge se sono premuti."
        },
        {
          step: 3,
          text: "🧩 Nel Loop, crea una variabile 'ledNum' e assegnale un 'Numero casuale tra 0 e 3' — questo sceglie quale LED accendere",
          hint: "Ogni numero corrisponde a un colore: 0=rosso, 1=verde, 2=blu, 3=giallo. random() genera sempre sequenze diverse!"
        },
        {
          step: 4,
          text: "🧩 Aggiungi un blocco 'Se' che controlla: se ledNum = 0, allora 'Scrivi pin 9 HIGH' + 'Suona pin 8 freq 262'",
          hint: "262Hz è la nota Do — il suono del LED rosso. Ogni 'Se' accende un LED diverso con la sua nota."
        },
        {
          step: 5,
          text: "🧩 Aggiungi altri 3 blocchi 'Se' per i LED verde (pin 10, 330Hz), blu (pin 11, 392Hz) e giallo (pin 12, 523Hz)",
          hint: "Le 4 note formano un accordo Do-Mi-Sol-Do alto. Più vai su con la frequenza, più il suono è acuto!"
        },
        {
          step: 6,
          text: "🧩 Dopo i 4 'Se', aggiungi 'Attendi 500ms', poi spegni tutti i LED (pin 9-12 LOW) e 'Ferma suono pin 8'",
          hint: "Prima accendi LED+suono, aspetti che il giocatore lo veda/senta, poi spegni tutto. Questo è un turno della sequenza."
        },
        {
          step: 7,
          text: "🧩 Aggiungi 4 blocchi 'Se' per leggere i pulsanti: se 'Leggi pin 3' = 0 allora accendi LED rosso + suona Do + stampa 'Rosso premuto!'",
          hint: "Con INPUT_PULLUP, il pulsante premuto dà 0 (LOW). Il giocatore vede e sente quale pulsante ha premuto!"
        },
        {
          step: 8,
          text: "🎉 Compila e avvia! Il Simon mostra un LED casuale con suono — premi il pulsante giusto per confermare. Prova a espandere il gioco!",
          hint: "Questa è la versione semplificata: un turno alla volta. Il codice C++ completo nella tab Arduino aggiunge la sequenza crescente!"
        }
      ],
      quiz: [
        {
          question: "Perché usiamo INPUT_PULLUP per i pulsanti?",
          options: ["Per aumentare la luminosità dei LED", "Perché non servono resistenze esterne di pull-up", "Per proteggere i pulsanti dalla sovracorrente"],
          correct: 1,
          explanation: "INPUT_PULLUP attiva una resistenza interna da ~20kΩ dentro Arduino. Il pin resta HIGH quando il pulsante non è premuto, e va LOW quando lo premi (collegando a GND). Non serve nessuna resistenza esterna!"
        },
        {
          question: "Cosa fa random(0, 4) nel codice del Simon?",
          options: ["Accende tutti i LED in ordine casuale", "Genera un numero casuale tra 0 e 3 (indice di un LED)", "Aspetta un tempo casuale tra 0 e 4 secondi"],
          correct: 1,
          explanation: "random(0, 4) restituisce un numero intero tra 0 e 3 inclusi (il limite superiore è escluso). Ogni numero corrisponde a un LED: 0=rosso, 1=verde, 2=blu, 3=giallo."
        },
        {
// © Andrea Marro — 12/03/2026 — ELAB Tutor — Tutti i diritti riservati
          question: "Cosa succede se il giocatore preme il pulsante sbagliato?",
          options: ["Il LED giusto lampeggia come suggerimento", "Tutti e 4 i LED lampeggiano con un suono grave (Game Over)", "Il gioco si mette in pausa per 5 secondi"],
          correct: 1,
          explanation: "La funzione gameOver() fa lampeggiare tutti i LED 4 volte con un tono grave a 150Hz (200ms accesi, 200ms spenti). Poi il livello si resetta a 0 e il gioco ricomincia con una nuova sequenza."
        },
        {
          question: "A cosa serve tone(BUZZER, NOTE[idx]) nel codice?",
          options: ["Accende il LED del colore corrispondente", "Genera una nota musicale diversa per ogni colore del Simon", "Controlla il volume del cicalino"],
          correct: 1,
          explanation: "tone() genera un segnale a onda quadra alla frequenza specificata. L'array NOTE[] contiene 4 frequenze diverse: Do=262Hz (rosso), Mi=330Hz (verde), Sol=392Hz (blu), Do alto=523Hz (giallo). Ogni colore ha la sua nota!"
        }
      ]
    }
  ]
};

export default EXPERIMENTS_VOL3;
