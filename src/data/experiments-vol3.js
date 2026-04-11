/**
 * ELAB Experiments — Volume 3: Arduino Programmato
 * 26 esperimenti — Arduino Nano R4, pin digitali, analogici, seriale
 * Cap 5 (2) + Cap 6 (8) + Cap 7 (8) + Cap 8 (5) + Extra (3 = LCD, Servo, Simon)
 * Verificato CoVe dai PDF reali del Volume 3 (Cap 5-8)
 * Layout ricalcolato: componenti posizionati SUI fori della breadboard
 * © Andrea Marro — 10/02/2026 — UPDATED 03/04/2026 (all manual experiments added)
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
// © Andrea Marro — 09/04/2026 — ELAB Tutor — Tutti i diritti riservati
// © Andrea Marro — 10/04/2026 — ELAB Tutor — Tutti i diritti riservati
<block type="arduino_digital_write"><field name="PIN">12</field><field name="STATE">HIGH</field>
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
</block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block>
</next></block>
</statement>
</block></xml>`;

// ═══ Scratch XML Workspaces — Esperimenti Vol3 ═══════════════════════════

// Cap.6 Esp.1 — LED Blink esterno (pin 13)


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
// © Andrea Marro — 09/04/2026 — ELAB Tutor — Tutti i diritti riservati
// © Andrea Marro — 10/04/2026 — ELAB Tutor — Tutti i diritti riservati
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

// ═══ Cap.5 Esp.1 — Blink LED_BUILTIN (pin 13, 1s ON / 1s OFF) ═══
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

// ═══ Cap.5 Esp.2 — Blink veloce (pin 13, 200ms ON / 200ms OFF) ═══
const BLINK_FAST_SCRATCH = `<xml xmlns="https://developers.google.com/blockly/xml">
<block type="arduino_base" x="40" y="30" deletable="false">
<statement name="SETUP">
<block type="arduino_pin_mode"><field name="PIN">13</field><field name="MODE">OUTPUT</field></block>
</statement>
<statement name="LOOP">
<block type="arduino_digital_write"><field name="PIN">13</field><field name="STATE">HIGH</field>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">200</field></shadow></value>
<next><block type="arduino_digital_write"><field name="PIN">13</field><field name="STATE">LOW</field>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">200</field></shadow></value>
</block></next></block></next></block></next></block>
</statement>
</block></xml>`;

// ═══ Cap.6 Esp.2 — LED esterno pin 13 (stesso Blink, LED su breadboard) ═══
const BLINK_EXTERNAL_SCRATCH = `<xml xmlns="https://developers.google.com/blockly/xml">
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

// ═══ Cap.6 Morse — SOS semplificato (pin 13, punti 200ms, linee 600ms) ═══
const SOS_MORSE_SCRATCH = `<xml xmlns="https://developers.google.com/blockly/xml">
<block type="arduino_base" x="40" y="30" deletable="false">
<statement name="SETUP">
<block type="arduino_pin_mode"><field name="PIN">13</field><field name="MODE">OUTPUT</field></block>
</statement>
<statement name="LOOP">
<block type="arduino_digital_write"><field name="PIN">13</field><field name="STATE">HIGH</field>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">200</field></shadow></value>
<next><block type="arduino_digital_write"><field name="PIN">13</field><field name="STATE">LOW</field>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">200</field></shadow></value>
<next><block type="arduino_digital_write"><field name="PIN">13</field><field name="STATE">HIGH</field>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">200</field></shadow></value>
<next><block type="arduino_digital_write"><field name="PIN">13</field><field name="STATE">LOW</field>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">200</field></shadow></value>
<next><block type="arduino_digital_write"><field name="PIN">13</field><field name="STATE">HIGH</field>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">200</field></shadow></value>
<next><block type="arduino_digital_write"><field name="PIN">13</field><field name="STATE">LOW</field>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">400</field></shadow></value>
<next><block type="arduino_digital_write"><field name="PIN">13</field><field name="STATE">HIGH</field>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">600</field></shadow></value>
<next><block type="arduino_digital_write"><field name="PIN">13</field><field name="STATE">LOW</field>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">200</field></shadow></value>
<next><block type="arduino_digital_write"><field name="PIN">13</field><field name="STATE">HIGH</field>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">600</field></shadow></value>
<next><block type="arduino_digital_write"><field name="PIN">13</field><field name="STATE">LOW</field>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">200</field></shadow></value>
<next><block type="arduino_digital_write"><field name="PIN">13</field><field name="STATE">HIGH</field>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">600</field></shadow></value>
<next><block type="arduino_digital_write"><field name="PIN">13</field><field name="STATE">LOW</field>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">400</field></shadow></value>
<next><block type="arduino_digital_write"><field name="PIN">13</field><field name="STATE">HIGH</field>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">200</field></shadow></value>
<next><block type="arduino_digital_write"><field name="PIN">13</field><field name="STATE">LOW</field>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">200</field></shadow></value>
<next><block type="arduino_digital_write"><field name="PIN">13</field><field name="STATE">HIGH</field>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">200</field></shadow></value>
<next><block type="arduino_digital_write"><field name="PIN">13</field><field name="STATE">LOW</field>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">200</field></shadow></value>
<next><block type="arduino_digital_write"><field name="PIN">13</field><field name="STATE">HIGH</field>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">200</field></shadow></value>
<next><block type="arduino_digital_write"><field name="PIN">13</field><field name="STATE">LOW</field>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow></value>
</block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block>
</statement>
</block></xml>`;

// ═══ Cap.6 Esp.3 — LED su pin 5 (blink su pin diverso) ═══
const BLINK_PIN5_SCRATCH = `<xml xmlns="https://developers.google.com/blockly/xml">
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

// ═══ Cap.6 Esp.4 — Semaforo 3 LED (pin 5/6/9) ═══
const SEMAFORO_3LED_SCRATCH = `<xml xmlns="https://developers.google.com/blockly/xml">
<block type="arduino_base" x="40" y="30" deletable="false">
<statement name="SETUP">
<block type="arduino_pin_mode"><field name="PIN">5</field><field name="MODE">OUTPUT</field>
<next><block type="arduino_pin_mode"><field name="PIN">6</field><field name="MODE">OUTPUT</field>
<next><block type="arduino_pin_mode"><field name="PIN">9</field><field name="MODE">OUTPUT</field>
</block></next></block></next></block>
</statement>
<statement name="LOOP">
<block type="arduino_digital_write"><field name="PIN">5</field><field name="STATE">HIGH</field>
<next><block type="arduino_digital_write"><field name="PIN">6</field><field name="STATE">LOW</field>
<next><block type="arduino_digital_write"><field name="PIN">9</field><field name="STATE">LOW</field>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">3000</field></shadow></value>
<next><block type="arduino_digital_write"><field name="PIN">5</field><field name="STATE">LOW</field>
<next><block type="arduino_digital_write"><field name="PIN">6</field><field name="STATE">HIGH</field>
<next><block type="arduino_digital_write"><field name="PIN">9</field><field name="STATE">LOW</field>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow></value>
<next><block type="arduino_digital_write"><field name="PIN">5</field><field name="STATE">LOW</field>
<next><block type="arduino_digital_write"><field name="PIN">6</field><field name="STATE">LOW</field>
<next><block type="arduino_digital_write"><field name="PIN">9</field><field name="STATE">HIGH</field>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">3000</field></shadow></value>
</block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block>
</statement>
</block></xml>`;

// ═══ Cap.6 Esp.5 — digitalRead con pulsante + LED (pin 10 INPUT_PULLUP, pin 5 LED) ═══
const PULLUP_LED_SCRATCH = `<xml xmlns="https://developers.google.com/blockly/xml">
<block type="arduino_base" x="40" y="30" deletable="false">
<statement name="SETUP">
<block type="arduino_pin_mode"><field name="PIN">10</field><field name="MODE">INPUT_PULLUP</field>
<next><block type="arduino_pin_mode"><field name="PIN">5</field><field name="MODE">OUTPUT</field>
</block></next></block>
</statement>
<statement name="LOOP">
<block type="controls_if">
<mutation else="1"/>
// © Andrea Marro — 10/04/2026 — ELAB Tutor — Tutti i diritti riservati
<value name="IF0">
<block type="logic_compare"><field name="OP">EQ</field>
<value name="A"><block type="arduino_digital_read"><field name="PIN">10</field></block></value>
<value name="B"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
</block>
</value>
<statement name="DO0">
<block type="arduino_digital_write"><field name="PIN">5</field><field name="STATE">HIGH</field></block>
</statement>
<statement name="ELSE">
<block type="arduino_digital_write"><field name="PIN">5</field><field name="STATE">LOW</field></block>
</statement>
</block>
</statement>
</block></xml>`;

// ═══ Cap.6 Esp.7 — Debounce pulsante (pin 10 btn, pin 5 LED) — semplificato come toggle ═══
const DEBOUNCE_SCRATCH = `<xml xmlns="https://developers.google.com/blockly/xml">
<block type="arduino_base" x="40" y="30" deletable="false">
<statement name="SETUP">
<block type="arduino_pin_mode"><field name="PIN">10</field><field name="MODE">INPUT_PULLUP</field>
<next><block type="arduino_pin_mode"><field name="PIN">5</field><field name="MODE">OUTPUT</field>
</block></next></block>
</statement>
<statement name="LOOP">
<block type="controls_if">
<value name="IF0">
<block type="logic_compare"><field name="OP">EQ</field>
<value name="A"><block type="arduino_digital_read"><field name="PIN">10</field></block></value>
<value name="B"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
</block>
</value>
<statement name="DO0">
<block type="arduino_digital_write"><field name="PIN">5</field><field name="STATE">HIGH</field>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">300</field></shadow></value>
<next><block type="arduino_digital_write"><field name="PIN">5</field><field name="STATE">LOW</field>
</block></next></block></next></block>
</statement>
</block>
</statement>
</block></xml>`;

// ═══ Cap.7 Esp.1 — analogRead base (A0 trimmer, pin 13 LED, soglia 511) ═══
const ANALOG_READ_BASE_SCRATCH = `<xml xmlns="https://developers.google.com/blockly/xml">
<block type="arduino_base" x="40" y="30" deletable="false">
<statement name="SETUP">
<block type="arduino_pin_mode"><field name="PIN">13</field><field name="MODE">OUTPUT</field></block>
</statement>
<statement name="LOOP">
<block type="arduino_variable_set"><field name="TYPE">int</field><field name="VAR">valoreLetto</field>
<value name="VALUE"><block type="arduino_analog_read"><field name="PIN">A0</field></block></value>
<next><block type="controls_if">
<mutation else="1"/>
<value name="IF0">
<block type="logic_compare"><field name="OP">GT</field>
<value name="A"><block type="arduino_variable_get"><field name="VAR">valoreLetto</field></block></value>
<value name="B"><shadow type="math_number"><field name="NUM">511</field></shadow></value>
</block>
</value>
<statement name="DO0">
<block type="arduino_digital_write"><field name="PIN">13</field><field name="STATE">HIGH</field></block>
</statement>
<statement name="ELSE">
<block type="arduino_digital_write"><field name="PIN">13</field><field name="STATE">LOW</field></block>
</statement>
</block></next></block>
</statement>
</block></xml>`;

// ═══ Cap.7 Esp.2 — analogRead con tensione (A0, pin 13, soglia 2.5V = 511) ═══
// Semplificato: Scratch non supporta float, usiamo soglia 511 come equivalente di 2.5V
const ANALOG_VOLTAGE_SCRATCH = `<xml xmlns="https://developers.google.com/blockly/xml">
<block type="arduino_base" x="40" y="30" deletable="false">
<statement name="SETUP">
<block type="arduino_pin_mode"><field name="PIN">13</field><field name="MODE">OUTPUT</field></block>
</statement>
<statement name="LOOP">
<block type="arduino_variable_set"><field name="TYPE">int</field><field name="VAR">valoreLetto</field>
<value name="VALUE"><block type="arduino_analog_read"><field name="PIN">A0</field></block></value>
<next><block type="controls_if">
<mutation else="1"/>
<value name="IF0">
<block type="logic_compare"><field name="OP">GT</field>
<value name="A"><block type="arduino_variable_get"><field name="VAR">valoreLetto</field></block></value>
<value name="B"><shadow type="math_number"><field name="NUM">511</field></shadow></value>
</block>
</value>
<statement name="DO0">
<block type="arduino_digital_write"><field name="PIN">13</field><field name="STATE">HIGH</field></block>
</statement>
<statement name="ELSE">
<block type="arduino_digital_write"><field name="PIN">13</field><field name="STATE">LOW</field></block>
</statement>
</block></next></block>
</statement>
</block></xml>`;

// ═══ Cap.7 Esp.3 — Trimmer controlla 3 LED (A0, pin 3/5/6, soglie 341/682) ═══
const ANALOG_3LED_SCRATCH = `<xml xmlns="https://developers.google.com/blockly/xml">
<block type="arduino_base" x="40" y="30" deletable="false">
<statement name="SETUP">
<block type="arduino_pin_mode"><field name="PIN">3</field><field name="MODE">OUTPUT</field>
<next><block type="arduino_pin_mode"><field name="PIN">5</field><field name="MODE">OUTPUT</field>
<next><block type="arduino_pin_mode"><field name="PIN">6</field><field name="MODE">OUTPUT</field>
</block></next></block></next></block>
</statement>
<statement name="LOOP">
<block type="arduino_variable_set"><field name="TYPE">int</field><field name="VAR">valoreLetto</field>
<value name="VALUE"><block type="arduino_analog_read"><field name="PIN">A0</field></block></value>
<next><block type="controls_if">
<mutation elseif="1" else="1"/>
<value name="IF0">
<block type="logic_compare"><field name="OP">LT</field>
<value name="A"><block type="arduino_variable_get"><field name="VAR">valoreLetto</field></block></value>
<value name="B"><shadow type="math_number"><field name="NUM">341</field></shadow></value>
</block>
</value>
<statement name="DO0">
<block type="arduino_digital_write"><field name="PIN">3</field><field name="STATE">HIGH</field>
<next><block type="arduino_digital_write"><field name="PIN">5</field><field name="STATE">LOW</field>
<next><block type="arduino_digital_write"><field name="PIN">6</field><field name="STATE">LOW</field>
</block></next></block></next></block>
</statement>
<value name="IF1">
<block type="logic_compare"><field name="OP">LT</field>
<value name="A"><block type="arduino_variable_get"><field name="VAR">valoreLetto</field></block></value>
<value name="B"><shadow type="math_number"><field name="NUM">682</field></shadow></value>
</block>
</value>
<statement name="DO1">
<block type="arduino_digital_write"><field name="PIN">3</field><field name="STATE">LOW</field>
<next><block type="arduino_digital_write"><field name="PIN">5</field><field name="STATE">HIGH</field>
<next><block type="arduino_digital_write"><field name="PIN">6</field><field name="STATE">LOW</field>
</block></next></block></next></block>
</statement>
<statement name="ELSE">
<block type="arduino_digital_write"><field name="PIN">3</field><field name="STATE">LOW</field>
<next><block type="arduino_digital_write"><field name="PIN">5</field><field name="STATE">LOW</field>
<next><block type="arduino_digital_write"><field name="PIN">6</field><field name="STATE">HIGH</field>
</block></next></block></next></block>
</statement>
</block></next></block>
</statement>
</block></xml>`;

// ═══ Cap.7 Esp.4 — PWM fade up (pin 5, for 0→255 step 5) ═══
const PWM_FADE_UP_SCRATCH = `<xml xmlns="https://developers.google.com/blockly/xml">
<block type="arduino_base" x="40" y="30" deletable="false">
<statement name="SETUP">
<block type="arduino_pin_mode"><field name="PIN">5</field><field name="MODE">OUTPUT</field></block>
</statement>
<statement name="LOOP">
<block type="controls_for">
<field name="VAR">i</field>
<value name="FROM"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
<value name="TO"><shadow type="math_number"><field name="NUM">255</field></shadow></value>
<value name="BY"><shadow type="math_number"><field name="NUM">5</field></shadow></value>
<statement name="DO">
<block type="arduino_analog_write"><field name="PIN">5</field>
<value name="VALUE"><block type="arduino_variable_get"><field name="VAR">i</field></block></value>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">10</field></shadow></value>
</block></next></block>
</statement>
</block>
</statement>
</block></xml>`;

// ═══ Cap.7 Esp.5 — PWM valori manuali (pin 5, 0/64/128/255) ═══
const PWM_MANUAL_SCRATCH = `<xml xmlns="https://developers.google.com/blockly/xml">
<block type="arduino_base" x="40" y="30" deletable="false">
<statement name="SETUP">
<block type="arduino_pin_mode"><field name="PIN">5</field><field name="MODE">OUTPUT</field></block>
</statement>
<statement name="LOOP">
<block type="arduino_analog_write"><field name="PIN">5</field>
<value name="VALUE"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow></value>
<next><block type="arduino_analog_write"><field name="PIN">5</field>
<value name="VALUE"><shadow type="math_number"><field name="NUM">64</field></shadow></value>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow></value>
<next><block type="arduino_analog_write"><field name="PIN">5</field>
<value name="VALUE"><shadow type="math_number"><field name="NUM">128</field></shadow></value>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow></value>
<next><block type="arduino_analog_write"><field name="PIN">5</field>
<value name="VALUE"><shadow type="math_number"><field name="NUM">255</field></shadow></value>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow></value>
</block></next></block></next></block></next></block></next></block></next></block></next></block></next></block>
</statement>
</block></xml>`;

// ═══ Cap.7 Esp.6 — Fade up/down (pin 5, for 0→255 e 255→0) ═══
const PWM_FADE_UPDOWN_SCRATCH = `<xml xmlns="https://developers.google.com/blockly/xml">
<block type="arduino_base" x="40" y="30" deletable="false">
<statement name="SETUP">
<block type="arduino_pin_mode"><field name="PIN">5</field><field name="MODE">OUTPUT</field></block>
</statement>
<statement name="LOOP">
<block type="controls_for">
<field name="VAR">i</field>
<value name="FROM"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
// © Andrea Marro — 10/04/2026 — ELAB Tutor — Tutti i diritti riservati
<value name="TO"><shadow type="math_number"><field name="NUM">255</field></shadow></value>
<value name="BY"><shadow type="math_number"><field name="NUM">5</field></shadow></value>
<statement name="DO">
<block type="arduino_analog_write"><field name="PIN">5</field>
<value name="VALUE"><block type="arduino_variable_get"><field name="VAR">i</field></block></value>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">10</field></shadow></value>
</block></next></block>
</statement>
<next><block type="controls_for">
<field name="VAR">i</field>
<value name="FROM"><shadow type="math_number"><field name="NUM">255</field></shadow></value>
<value name="TO"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
<value name="BY"><shadow type="math_number"><field name="NUM">-5</field></shadow></value>
<statement name="DO">
<block type="arduino_analog_write"><field name="PIN">5</field>
<value name="VALUE"><block type="arduino_variable_get"><field name="VAR">i</field></block></value>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">10</field></shadow></value>
</block></next></block>
</statement>
</block></next></block>
</statement>
</block></xml>`;

// ═══ Cap.7 Esp.7 — Trimmer controlla luminosita con map (A0→pin 5 PWM) ═══
const TRIMMER_PWM_MAP_SCRATCH = `<xml xmlns="https://developers.google.com/blockly/xml">
<block type="arduino_base" x="40" y="30" deletable="false">
<statement name="SETUP">
<block type="arduino_pin_mode"><field name="PIN">5</field><field name="MODE">OUTPUT</field></block>
</statement>
<statement name="LOOP">
<block type="arduino_variable_set"><field name="TYPE">int</field><field name="VAR">valoreLetto</field>
<value name="VALUE"><block type="arduino_analog_read"><field name="PIN">A0</field></block></value>
<next><block type="arduino_variable_set"><field name="TYPE">int</field><field name="VAR">valorePWM</field>
<value name="VALUE"><block type="arduino_map">
<value name="VALUE"><block type="arduino_variable_get"><field name="VAR">valoreLetto</field></block></value>
<value name="FROM_LOW"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
<value name="FROM_HIGH"><shadow type="math_number"><field name="NUM">1023</field></shadow></value>
<value name="TO_LOW"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
<value name="TO_HIGH"><shadow type="math_number"><field name="NUM">255</field></shadow></value>
</block></value>
<next><block type="arduino_analog_write"><field name="PIN">5</field>
<value name="VALUE"><block type="arduino_variable_get"><field name="VAR">valorePWM</field></block></value>
</block></next></block></next></block>
</statement>
</block></xml>`;

// ═══ Cap.7 Esp.8 — DAC reale (A1 input, A0 output) — semplificato come analog read+write ═══
const DAC_SCRATCH = `<xml xmlns="https://developers.google.com/blockly/xml">
<block type="arduino_base" x="40" y="30" deletable="false">
<statement name="SETUP">
<block type="arduino_pin_mode"><field name="PIN">A0</field><field name="MODE">OUTPUT</field></block>
</statement>
<statement name="LOOP">
<block type="arduino_variable_set"><field name="TYPE">int</field><field name="VAR">valoreLetto</field>
<value name="VALUE"><block type="arduino_analog_read"><field name="PIN">A1</field></block></value>
<next><block type="arduino_analog_write"><field name="PIN">A0</field>
<value name="VALUE"><block type="arduino_variable_get"><field name="VAR">valoreLetto</field></block></value>
</block></next></block>
</statement>
</block></xml>`;

// ═══ Cap.8 Esp.1 — Serial.println in setup (messaggio singolo) ═══
const SERIAL_SETUP_SCRATCH = `<xml xmlns="https://developers.google.com/blockly/xml">
<block type="arduino_base" x="40" y="30" deletable="false">
<statement name="SETUP">
<block type="arduino_serial_begin"><field name="BAUD">9600</field>
<next><block type="arduino_serial_print"><field name="NEWLINE">TRUE</field>
<value name="CONTENT"><shadow type="text"><field name="TEXT">Ciao dal Team di ELAB!</field></shadow></value>
</block></next></block>
</statement>
</block></xml>`;

// ═══ Cap.8 Esp.2 — Serial.println in loop (messaggio ripetuto) ═══
const SERIAL_LOOP_SCRATCH = `<xml xmlns="https://developers.google.com/blockly/xml">
<block type="arduino_base" x="40" y="30" deletable="false">
<statement name="SETUP">
<block type="arduino_serial_begin"><field name="BAUD">9600</field></block>
</statement>
<statement name="LOOP">
<block type="arduino_serial_print"><field name="NEWLINE">TRUE</field>
<value name="CONTENT"><shadow type="text"><field name="TEXT">Ciao dal Team di ELAB!</field></shadow></value>
</block>
</statement>
</block></xml>`;

// ═══ Cap.8 Esp.4 — Serial Plotter 2 pot (A3, A4) ═══
const SERIAL_PLOTTER_SCRATCH = `<xml xmlns="https://developers.google.com/blockly/xml">
<block type="arduino_base" x="40" y="30" deletable="false">
<statement name="SETUP">
<block type="arduino_serial_begin"><field name="BAUD">9600</field></block>
</statement>
<statement name="LOOP">
<block type="arduino_variable_set"><field name="TYPE">int</field><field name="VAR">valoreA3</field>
<value name="VALUE"><block type="arduino_analog_read"><field name="PIN">A3</field></block></value>
<next><block type="arduino_variable_set"><field name="TYPE">int</field><field name="VAR">valoreA4</field>
<value name="VALUE"><block type="arduino_analog_read"><field name="PIN">A4</field></block></value>
<next><block type="arduino_serial_print"><field name="NEWLINE">FALSE</field>
<value name="CONTENT"><shadow type="text"><field name="TEXT">A3:</field></shadow></value>
<next><block type="arduino_serial_print"><field name="NEWLINE">FALSE</field>
<value name="CONTENT"><block type="arduino_variable_get"><field name="VAR">valoreA3</field></block></value>
<next><block type="arduino_serial_print"><field name="NEWLINE">FALSE</field>
<value name="CONTENT"><shadow type="text"><field name="TEXT"> A4:</field></shadow></value>
<next><block type="arduino_serial_print"><field name="NEWLINE">TRUE</field>
<value name="CONTENT"><block type="arduino_variable_get"><field name="VAR">valoreA4</field></block></value>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">100</field></shadow></value>
</block></next></block></next></block></next></block></next></block></next></block></next></block>
</statement>
</block></xml>`;

// ═══ Cap.8 Esp.5 — Pot + 3 LED + Serial (A3, pin 12/11/10) ═══
const FINAL_PROJECT_SCRATCH = `<xml xmlns="https://developers.google.com/blockly/xml">
<block type="arduino_base" x="40" y="30" deletable="false">
<statement name="SETUP">
<block type="arduino_pin_mode"><field name="PIN">12</field><field name="MODE">OUTPUT</field>
<next><block type="arduino_pin_mode"><field name="PIN">11</field><field name="MODE">OUTPUT</field>
<next><block type="arduino_pin_mode"><field name="PIN">10</field><field name="MODE">OUTPUT</field>
<next><block type="arduino_serial_begin"><field name="BAUD">9600</field>
</block></next></block></next></block></next></block>
</statement>
<statement name="LOOP">
<block type="arduino_variable_set"><field name="TYPE">int</field><field name="VAR">valore</field>
<value name="VALUE"><block type="arduino_analog_read"><field name="PIN">A3</field></block></value>
<next><block type="arduino_serial_print"><field name="NEWLINE">TRUE</field>
<value name="CONTENT"><block type="arduino_variable_get"><field name="VAR">valore</field></block></value>
<next><block type="controls_if">
<mutation elseif="1" else="1"/>
<value name="IF0">
<block type="logic_compare"><field name="OP">LT</field>
<value name="A"><block type="arduino_variable_get"><field name="VAR">valore</field></block></value>
<value name="B"><shadow type="math_number"><field name="NUM">300</field></shadow></value>
</block>
</value>
<statement name="DO0">
<block type="arduino_digital_write"><field name="PIN">12</field><field name="STATE">HIGH</field>
<next><block type="arduino_digital_write"><field name="PIN">11</field><field name="STATE">LOW</field>
<next><block type="arduino_digital_write"><field name="PIN">10</field><field name="STATE">LOW</field>
</block></next></block></next></block>
</statement>
<value name="IF1">
<block type="logic_compare"><field name="OP">LT</field>
<value name="A"><block type="arduino_variable_get"><field name="VAR">valore</field></block></value>
<value name="B"><shadow type="math_number"><field name="NUM">700</field></shadow></value>
</block>
</value>
<statement name="DO1">
<block type="arduino_digital_write"><field name="PIN">12</field><field name="STATE">LOW</field>
<next><block type="arduino_digital_write"><field name="PIN">11</field><field name="STATE">HIGH</field>
<next><block type="arduino_digital_write"><field name="PIN">10</field><field name="STATE">LOW</field>
</block></next></block></next></block>
</statement>
<statement name="ELSE">
<block type="arduino_digital_write"><field name="PIN">12</field><field name="STATE">LOW</field>
<next><block type="arduino_digital_write"><field name="PIN">11</field><field name="STATE">LOW</field>
<next><block type="arduino_digital_write"><field name="PIN">10</field><field name="STATE">HIGH</field>
</block></next></block></next></block>
</statement>
</block></next></block></next></block>
</statement>
</block></xml>`;

const EXPERIMENTS_VOL3 = {
  title: "Volume 3 - Arduino Programmato",
  subtitle: "Programmazione Arduino: LED, pulsanti, sensori analogici",
  icon: "\u{1F4D5}",
  color: "#E54B3D",
  experiments: [
    // ═══════════════════════════════════════════════════
    // CAPITOLO 5 — Il nostro primo programma (2 esperimenti)
    // ═══════════════════════════════════════════════════
    {
      id: "v3-cap5-esp1",
      title: "Cap. 5 Esp. 1 - Blink con LED_BUILTIN",
      desc: "Il primo programma in assoluto! Facciamo lampeggiare il LED integrato sulla scheda Arduino, quello collegato al pin 13. Si accende per 1 secondo, si spegne per 1 secondo, e ripete all'infinito.",
      chapter: "Capitolo 5 - Il nostro primo programma",
      difficulty: 1,
      icon: "\u{1F4A1}",
      simulationMode: "avr",
      components: [
        { type: "breadboard-half", id: "bb1" },
        { type: "nano-r4", id: "nano1" }
      ],
      connections: [],
      code: `// Blink — Il primo programma!
// Fa lampeggiare il LED integrato (pin 13)

void setup() {
  pinMode(13, OUTPUT);
}

void loop() {
  digitalWrite(13, HIGH);
  delay(1000);
  digitalWrite(13, LOW);
  delay(1000);
}`,
      layout: {
        "nano1": { x: 230, y: 10, parentId: "bb1" },
        "bb1": { x: 280, y: 10 }
      },
      concept: "pinMode, digitalWrite, delay, LED_BUILTIN, ciclo loop infinito",
// © Andrea Marro — 10/04/2026 — ELAB Tutor — Tutti i diritti riservati
      layer: "schema",

      buildSteps: [
        {
          step: 1,
          text: "Posiziona l'Arduino Nano sulla breadboard. Non servono altri componenti!",
          componentId: "nano1",
          componentType: "nano-r4",
          targetPins: {},
          hint: "Il LED integrato e gia sulla scheda Arduino, collegato al pin 13. Basta il codice!"
        }
      ],
      scratchXml: BLINK_SCRATCH,
      steps: [
        "Collega l'Arduino Nano al computer con il cavo USB.",
        "Apri l'editor e scrivi il codice: pinMode(13, OUTPUT) nel setup(), poi digitalWrite e delay nel loop().",
        "Carica il programma e osserva il LED sulla scheda che lampeggia!"
      ],
      observe: "Il LED integrato sulla scheda Arduino (vicino al pin 13) si accende per 1 secondo e si spegne per 1 secondo, all'infinito. Non serve nessun componente esterno!",
      unlimPrompt: "Sei Galileo, il tutor AI di ELAB. Lo studente sta facendo il primo programma in assoluto: il Blink! Fa lampeggiare il LED integrato sulla scheda Arduino (pin 13). Il codice e semplicissimo: setup() configura il pin 13 come OUTPUT, poi loop() lo accende (HIGH), aspetta 1 secondo (delay 1000), lo spegne (LOW), aspetta ancora 1 secondo. Spiega con entusiasmo, e il primo traguardo! Rispondi in italiano.",
      quiz: [
        {
          question: "Cosa fa delay(1000)?",
          options: ["Accende il LED per 1000 volte", "Aspetta 1000 millisecondi, cioe 1 secondo", "Spegne il LED dopo 1000 lampeggi"],
          correct: 1,
          explanation: "delay(1000) mette in pausa il programma per 1000 millisecondi = 1 secondo. Il LED resta nello stato in cui era prima del delay!"
        },
        {
          question: "A cosa serve pinMode(13, OUTPUT) nel setup?",
          options: ["Legge il valore del pin 13", "Dice ad Arduino che il pin 13 sara usato per mandare corrente (uscita)", "Accende subito il LED"],
          correct: 1,
          explanation: "pinMode configura un pin come OUTPUT (uscita) o INPUT (ingresso). Senza questa istruzione nel setup, Arduino non sa come usare il pin!"
        }
      ]
    },
    {
      id: "v3-cap5-esp2",
      title: "Cap. 5 Esp. 2 - Modifica tempi del Blink",
      desc: "Cambiamo i tempi del Blink! Prova a modificare i valori dentro delay() per far lampeggiare il LED piu veloce o piu lento. Cosa succede con delay(100)? E con delay(2000)?",
      chapter: "Capitolo 5 - Il nostro primo programma",
      difficulty: 1,
      icon: "\u{23F1}",
      simulationMode: "avr",
      components: [
        { type: "breadboard-half", id: "bb1" },
        { type: "nano-r4", id: "nano1" }
      ],
      connections: [],
      code: `// Blink veloce — Modifica i tempi!
// Prova a cambiare i numeri dentro delay()

void setup() {
  pinMode(13, OUTPUT);
}

void loop() {
  digitalWrite(13, HIGH);
  delay(200);
  digitalWrite(13, LOW);
  delay(200);
}`,
      layout: {
        "nano1": { x: 230, y: 10, parentId: "bb1" },
        "bb1": { x: 280, y: 10 }
      },
      concept: "Parametri delay, sperimentazione, millisecondi vs secondi",
      layer: "schema",

      buildSteps: [
        {
          step: 1,
          text: "Posiziona l'Arduino Nano sulla breadboard. Stesso circuito del Blink!",
          componentId: "nano1",
          componentType: "nano-r4",
          targetPins: {},
          hint: "Nessun componente esterno. Modifichiamo solo i valori di delay() nel codice."
        }
      ],
      scratchXml: BLINK_FAST_SCRATCH,
      steps: [
        "Parti dal programma Blink del Cap. 5 Esp. 1.",
        "Cambia delay(1000) in delay(200) in entrambi i posti.",
        "Carica e osserva: il LED lampeggia molto piu veloce! Prova altri valori."
      ],
      observe: "Con delay(200) il LED lampeggia 5 volte al secondo invece di 1. Provate valori diversi per il tempo di accensione e spegnimento: con numeri diversi ottenete effetti asimmetrici!",
      unlimPrompt: "Sei Galileo, il tutor AI di ELAB. Lo studente sta modificando i tempi del Blink. Incoraggialo a sperimentare con diversi valori di delay: cosa succede con delay(50)? E con delay(5000)? Spiega che i millisecondi sono millesimi di secondo. Rispondi in italiano.",
      quiz: [
        {
          question: "Se metti delay(500) acceso e delay(100) spento, cosa succede?",
          options: ["Il LED resta sempre acceso", "Il LED sta acceso piu a lungo di quanto sta spento", "Il LED non funziona piu"],
          correct: 1,
          explanation: "Con delay(500) il LED sta acceso mezzo secondo, con delay(100) sta spento solo un decimo di secondo. Sembra quasi sempre acceso con un breve spegnimento!"
        },
        {
          question: "Quante volte al secondo lampeggia il LED con delay(100) acceso e delay(100) spento?",
          options: ["1 volta al secondo", "5 volte al secondo", "100 volte al secondo"],
          correct: 1,
          explanation: "Un ciclo completo dura 100ms + 100ms = 200ms. In un secondo (1000ms) ci stanno 1000/200 = 5 cicli, quindi il LED lampeggia 5 volte al secondo!"
        }
      ]
    },

    // ═══════════════════════════════════════════════════
    // CAPITOLO 6 — I pin digitali (7 esperimenti)
    // ═══════════════════════════════════════════════════
    {
// © Andrea Marro — 09/04/2026 — ELAB Tutor — Tutti i diritti riservati
      id: "v3-cap6-esp1",
      title: "Cap. 6 Esp. 1 - Circuito AND/OR con pulsanti",
      desc: "Costruiamo un circuito logico con due pulsanti e un LED, SENZA programmare Arduino! Se colleghiamo i pulsanti in serie serve premerli entrambi (AND), se li colleghiamo in parallelo basta uno qualsiasi (OR).",
      chapter: "Capitolo 6 - I pin digitali",
      difficulty: 1,
      icon: "\u{1F50C}",
      simulationMode: "avr",
      components: [
        { type: "breadboard-half", id: "bb1" },
        { type: "nano-r4", id: "nano1" },
        { type: "push-button", id: "btn1" },
        { type: "push-button", id: "btn2" },
        { type: "resistor", id: "r1", value: 470 },
        { type: "led", id: "led1", color: "red" }
      ],
      connections: [
        { from: "nano1:5V", to: "bb1:bus-bot-plus-1", color: "red" },
        { from: "nano1:GND_R", to: "bb1:bus-bot-minus-1", color: "black" },
        { from: "bb1:bus-bot-plus-18", to: "bb1:a18", color: "red" },
        { from: "bb1:j22", to: "bb1:a22", color: "orange" },
        { from: "bb1:a26", to: "bb1:a25", color: "orange" },
        { from: "bb1:d30", to: "bb1:bus-bot-minus-30", color: "black" }
      ],
      pinAssignments: {
        "btn1:pin1": "bb1:e18", "btn1:pin2": "bb1:e22",
        "btn1:pin3": "bb1:f18", "btn1:pin4": "bb1:f22",
        "btn2:pin1": "bb1:e22", "btn2:pin2": "bb1:e26",
        "btn2:pin3": "bb1:f22", "btn2:pin4": "bb1:f26",
        "r1:pin1": "bb1:c25", "r1:pin2": "bb1:c30",
        "led1:anode": "bb1:d29", "led1:cathode": "bb1:d30"
      },
      code: null,
      layout: {
        "nano1": { x: 230, y: 10, parentId: "bb1" },
        "bb1": { x: 280, y: 10 },
        "btn1": { x: 440.25, y: 81.25 },
        "btn2": { x: 470.25, y: 81.25 },
        "r1": { x: 500.25, y: 58.75 },
        "led1": { x: 511.5, y: 43.75 }
      },
      concept: "Logica AND/OR, circuiti serie/parallelo, elettronica senza codice",
      layer: "schema",

      buildSteps: [
        {
          step: 1,
          text: "Prendi il primo pulsante (BTN1) e posizionalo a cavallo della scanalatura, nei fori E18-F18 e E22-F22",
          componentId: "btn1",
          componentType: "push-button",
          targetPins: { "btn1:pin1": "bb1:e18", "btn1:pin2": "bb1:e22", "btn1:pin3": "bb1:f18", "btn1:pin4": "bb1:f22" },
          hint: "Il primo pulsante del circuito AND/OR. A cavallo della scanalatura centrale."
        },
        {
          step: 2,
          text: "Prendi il secondo pulsante (BTN2) e posizionalo a cavallo, nei fori E22-F22 e E26-F26",
          componentId: "btn2",
          componentType: "push-button",
          targetPins: { "btn2:pin1": "bb1:e22", "btn2:pin2": "bb1:e26", "btn2:pin3": "bb1:f22", "btn2:pin4": "bb1:f26" },
          hint: "Il secondo pulsante, in serie col primo per creare la logica AND."
        },
        {
          step: 3,
          text: "Prendi il resistore R1 (470\u03A9) e posizionalo nei fori C25 e C30",
          componentId: "r1",
          componentType: "resistor",
          targetPins: { "r1:pin1": "bb1:c25", "r1:pin2": "bb1:c30" },
          hint: "Il resistore protegge il LED dalla troppa corrente."
        },
        {
          step: 4,
          text: "Prendi il LED rosso e mettilo nei fori D29 e D30. L'anodo (+) in D29!",
          componentId: "led1",
          componentType: "led",
          targetPins: { "led1:anode": "bb1:d29", "led1:cathode": "bb1:d30" },
          hint: "Il LED si accendera solo quando la condizione AND o OR e soddisfatta."
        },
        {
          step: 5,
          text: "Collega un filo ROSSO dal binario + (5V) al foro A18",
          wireFrom: "bb1:bus-bot-plus-18",
          wireTo: "bb1:a18",
          wireColor: "red",
          hint: "Alimentazione dal 5V al primo pulsante."
        },
        {
          step: 6,
          text: "Collega un filo ARANCIONE dal foro J22 al foro A22 (ponte tra i due pulsanti)",
          wireFrom: "bb1:j22",
          wireTo: "bb1:a22",
          wireColor: "orange",
          hint: "Collega l'uscita del primo pulsante all'ingresso del secondo."
        },
        {
          step: 7,
          text: "Collega un filo ARANCIONE dal foro A26 al foro A25 (pulsante al resistore)",
          wireFrom: "bb1:a26",
          wireTo: "bb1:a25",
          wireColor: "orange",
          hint: "Collega l'uscita dei pulsanti al resistore."
        },
        {
          step: 8,
          text: "Collega un filo NERO dal foro D30 al binario GND (-) - catodo LED",
          wireFrom: "bb1:d30",
          wireTo: "bb1:bus-bot-minus-30",
          wireColor: "black",
          hint: "Il catodo del LED va a massa."
        },
        {
          step: 9,
          text: "Collega un filo ROSSO dal pin 5V dell'Arduino al binario +",
          wireFrom: "nano1:5V",
          wireTo: "bb1:bus-bot-plus-1",
          wireColor: "red",
          hint: "Alimentazione dal 5V di Arduino."
        },
        {
          step: 10,
          text: "Collega un filo NERO dal pin GND dell'Arduino al binario GND (-). Premi entrambi i pulsanti!",
          wireFrom: "nano1:GND_R",
          wireTo: "bb1:bus-bot-minus-1",
          wireColor: "black",
          hint: "Circuito AND: servono ENTRAMBI i pulsanti premuti per accendere il LED!"
        }
      ],
      steps: [
        "Collega il LED con resistore da 470 ohm al pin 5V di Arduino.",
        "Collega due pulsanti IN SERIE tra il LED e GND: servono ENTRAMBI premuti per accendere (AND).",
        "Ora prova a collegare i pulsanti IN PARALLELO: basta premerne UNO per accendere il LED (OR)."
      ],
      observe: "Con i pulsanti in serie (AND) il LED si accende SOLO quando li premi entrambi. Con i pulsanti in parallelo (OR) basta premerne uno qualsiasi. Questa e la logica booleana!",
      unlimPrompt: "Sei Galileo, il tutor AI di ELAB. Lo studente sta esplorando i circuiti AND e OR con pulsanti fisici, SENZA codice Arduino. Spiega la differenza tra serie (AND - servono tutti) e parallelo (OR - basta uno). Usa analogie semplici: AND e come due porte in corridoio, OR e come due porte di una stanza. Rispondi in italiano.",
      quiz: [
        {
          question: "In un circuito AND con 2 pulsanti, quando si accende il LED?",
          options: ["Quando premi un pulsante qualsiasi", "Solo quando premi entrambi i pulsanti contemporaneamente", "Il LED e sempre acceso"],
          correct: 1,
          explanation: "In un circuito AND (serie) la corrente deve passare attraverso ENTRAMBI i pulsanti. Se uno e aperto, il circuito e interrotto!"
        },
        {
          question: "Come si ottiene un circuito OR con due pulsanti?",
          options: ["Si collegano i pulsanti uno dopo l'altro (in serie)", "Si collegano i pulsanti affiancati (in parallelo)", "Si usa un solo pulsante piu grande"],
          correct: 1,
          explanation: "In un circuito OR i pulsanti sono in parallelo: la corrente puo passare da uno O dall'altro. Basta premerne uno qualsiasi per accendere il LED!"
        }
      ]
    },
    {
      id: "v3-cap6-esp2",
      title: "Cap. 6 Esp. 1 - Colleghiamo la resistenza",
      bookRef: "Vol3 Cap6 ESPERIMENTO 1",
      desc: "Colleghiamo un LED esterno al pin 13 con un resistore da 470 ohm. Usiamo lo stesso programma Blink, ma ora vediamo lampeggiare un LED sulla breadboard!",
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
      connections: [
        { from: "nano1:W_D13", to: "bb1:a18", color: "orange" },
        { from: "bb1:d25", to: "bb1:d27", color: "green" },
        { from: "bb1:a28", to: "bb1:bus-bot-minus-28", color: "black" },
        { from: "nano1:GND_R", to: "bb1:bus-bot-minus-1", color: "black" },
        { from: "nano1:5V", to: "bb1:bus-bot-plus-1", color: "red" }
      ],
      pinAssignments: {
        "r1:pin1": "bb1:c18",
        "r1:pin2": "bb1:c25",
        "led1:anode": "bb1:d27",
        "led1:cathode": "bb1:d28"
      },
      code: `// LED esterno su pin 13 — stesso Blink, LED sulla breadboard!

void setup() {
  pinMode(13, OUTPUT);
}

void loop() {
  digitalWrite(13, HIGH);
  delay(1000);
  digitalWrite(13, LOW);
  delay(1000);
}`,
      layout: {
        "nano1": { x: 230, y: 10, parentId: "bb1" },
        "bb1": { x: 280, y: 10 },
        "r1": { x: 451.5, y: 58.75 },
        "led1": { x: 496.5, y: 43.75 }
      },
      concept: "LED esterno, resistore di protezione, circuito su breadboard",
      layer: "schema",

      buildSteps: [
        {
          step: 1,
          text: "Prendi il resistore R1 (470\u03A9) e posizionalo nei fori C18 e C25",
// © Andrea Marro — 09/04/2026 — ELAB Tutor — Tutti i diritti riservati
          componentId: "r1",
          componentType: "resistor",
          targetPins: { "r1:pin1": "bb1:c18", "r1:pin2": "bb1:c25" },
          hint: "Il resistore protegge il LED dalla troppa corrente."
        },
        {
          step: 2,
          text: "Prendi il LED rosso e mettilo nei fori D27 e D28. L'anodo (+) in D27!",
          componentId: "led1",
          componentType: "led",
          targetPins: { "led1:anode": "bb1:d27", "led1:cathode": "bb1:d28" },
          hint: "La gamba lunga (anodo) va nel foro D27, la corta (catodo) in D28."
        },
        {
          step: 3,
          text: "Collega un filo VERDE dal foro D25 al foro D27 (ponte R1 al LED)",
          wireFrom: "bb1:d25",
          wireTo: "bb1:d27",
          wireColor: "green",
          hint: "Questo filo collega il resistore all'anodo del LED."
        },
        {
          step: 4,
          text: "Collega un filo ARANCIONE dal pin D13 dell'Arduino al foro A18",
          wireFrom: "nano1:W_D13",
          wireTo: "bb1:a18",
          wireColor: "orange",
          hint: "D13 controlla il LED esterno, come quello integrato."
        },
        {
          step: 5,
          text: "Collega un filo NERO dal foro A28 al binario GND (-) - catodo LED",
          wireFrom: "bb1:a28",
          wireTo: "bb1:bus-bot-minus-28",
          wireColor: "black",
          hint: "Il catodo del LED va a massa."
        },
        {
          step: 6,
          text: "Collega un filo NERO dal pin GND dell'Arduino al binario GND (-)",
          wireFrom: "nano1:GND_R",
          wireTo: "bb1:bus-bot-minus-1",
          wireColor: "black",
          hint: "Massa dell'Arduino."
        },
        {
          step: 7,
          text: "Collega un filo ROSSO dal pin 5V al binario +. Il LED lampeggia come quello integrato!",
          wireFrom: "nano1:5V",
          wireTo: "bb1:bus-bot-plus-1",
          wireColor: "red",
          hint: "Stesso programma Blink, ma ora il LED e sulla breadboard!"
        }
      ],
      scratchXml: BLINK_EXTERNAL_SCRATCH,
      steps: [
        "Collega il resistore da 470 ohm dal pin 13 dell'Arduino a una colonna della breadboard.",
        "Collega l'anodo (+) del LED alla stessa colonna, e il catodo (-) al binario GND.",
// © Andrea Marro — 10/04/2026 — ELAB Tutor — Tutti i diritti riservati
        "Carica il programma Blink: ora lampeggia il LED sulla breadboard!"
      ],
      observe: "Il LED esterno sulla breadboard lampeggia insieme al LED integrato sulla scheda, perche entrambi sono collegati al pin 13. Il resistore da 470 ohm protegge il LED dalla troppa corrente.",
      unlimPrompt: "Sei Galileo, il tutor AI di ELAB. Lo studente ha collegato un LED esterno al pin 13 con un resistore. E lo stesso programma Blink ma ora il LED e sulla breadboard! Spiega perche serve il resistore (limita la corrente, senza il LED si brucia). Rispondi in italiano.",
      quiz: [
        {
          question: "Perche serve un resistore in serie con il LED?",
          options: ["Per far lampeggiare il LED piu velocemente", "Per limitare la corrente e non bruciare il LED", "Per cambiare il colore del LED"],
          correct: 1,
          explanation: "Il LED senza resistore riceve troppa corrente e si brucia! Il resistore da 470 ohm limita la corrente a un valore sicuro (circa 7mA con 3.3V ai capi)."
        },
        {
          question: "Perche il LED esterno e quello integrato lampeggiano insieme?",
          options: ["Perche tutti i LED sono sempre sincronizzati", "Perche entrambi sono collegati al pin 13", "Perche la breadboard li collega automaticamente"],
          correct: 1,
          explanation: "Sia il LED integrato sulla scheda che quello esterno sono collegati al pin 13. Quando il codice scrive HIGH o LOW sul pin 13, entrambi ricevono lo stesso segnale!"
        }
      ]
    },
    {
      id: "v3-cap6-morse",
      title: "Cap. 6 Esp. 3 - SOS in codice Morse",
      bookRef: "Vol3 Cap6 ESPERIMENTO 3",
      desc: "Modifichiamo il programma Blink per far lampeggiare il LED in codice Morse! S = tre lampi brevi, O = tre lampi lunghi. Il nostro Arduino manda un messaggio SOS!",
      chapter: "Capitolo 6 - I pin digitali",
      difficulty: 2,
      icon: "\u{1F4E1}",
      simulationMode: "avr",
      components: [
        { type: "breadboard-half", id: "bb1" },
        { type: "nano-r4", id: "nano1" },
        { type: "resistor", id: "r1", value: 470 },
        { type: "led", id: "led1", color: "red" }
      ],
      connections: [
        { from: "nano1:W_D13", to: "bb1:a18", color: "orange" },
        { from: "bb1:d25", to: "bb1:d27", color: "green" },
        { from: "bb1:a28", to: "bb1:bus-bot-minus-28", color: "black" },
        { from: "nano1:GND_R", to: "bb1:bus-bot-minus-1", color: "black" },
        { from: "nano1:5V", to: "bb1:bus-bot-plus-1", color: "red" }
      ],
      pinAssignments: {
        "r1:pin1": "bb1:c18",
        "r1:pin2": "bb1:c25",
        "led1:anode": "bb1:d27",
        "led1:cathode": "bb1:d28"
      },
      code: `// SOS in codice Morse — tre brevi, tre lunghi, tre brevi!

void setup() {
  pinMode(13, OUTPUT);
}

// Punto: lampo breve (200ms)
void punto() {
  digitalWrite(13, HIGH);
  delay(200);
  digitalWrite(13, LOW);
  delay(200);
}

// Linea: lampo lungo (600ms)
void linea() {
  digitalWrite(13, HIGH);
  delay(600);
  digitalWrite(13, LOW);
  delay(200);
}

void loop() {
  // S: tre punti
  punto(); punto(); punto();
  delay(400);
  // O: tre linee
  linea(); linea(); linea();
  delay(400);
  // S: tre punti
  punto(); punto(); punto();
  delay(1000); // pausa tra messaggi
}`,
      layout: {
        "nano1": { x: 230, y: 10, parentId: "bb1" },
        "bb1": { x: 280, y: 10 },
        "r1": { x: 451.5, y: 58.75 },
        "led1": { x: 496.5, y: 43.75 }
      },
      concept: "Funzioni personalizzate, temporizzazione, codice Morse",
      layer: "schema",

      buildSteps: [
        {
          step: 1,
          text: "Prendi il resistore R1 (470\u03A9) e posizionalo nei fori C18 e C25",
          componentId: "r1",
          componentType: "resistor",
          targetPins: { "r1:pin1": "bb1:c18", "r1:pin2": "bb1:c25" },
          hint: "Stesso circuito dell'esperimento precedente: resistore + LED su pin 13."
        },
        {
          step: 2,
          text: "Prendi il LED rosso e mettilo nei fori D27 e D28. L'anodo (+) in D27!",
          componentId: "led1",
          componentType: "led",
          targetPins: { "led1:anode": "bb1:d27", "led1:cathode": "bb1:d28" },
          hint: "Il LED lampeggera in codice Morse: tre brevi (S), tre lunghi (O), tre brevi (S)."
        },
        {
          step: 3,
          text: "Collega un filo VERDE dal foro D25 al foro D27 (ponte R1 al LED)",
          wireFrom: "bb1:d25",
          wireTo: "bb1:d27",
          wireColor: "green",
          hint: "Collega il resistore all'anodo del LED."
        },
        {
          step: 4,
          text: "Collega un filo ARANCIONE dal pin D13 dell'Arduino al foro A18",
          wireFrom: "nano1:W_D13",
          wireTo: "bb1:a18",
          wireColor: "orange",
          hint: "D13 manda il segnale Morse al LED."
        },
        {
          step: 5,
          text: "Collega un filo NERO dal foro A28 al binario GND (-)",
          wireFrom: "bb1:a28",
          wireTo: "bb1:bus-bot-minus-28",
          wireColor: "black",
          hint: "Catodo del LED verso massa."
        },
        {
          step: 6,
          text: "Collega un filo NERO dal pin GND dell'Arduino al binario GND (-)",
          wireFrom: "nano1:GND_R",
          wireTo: "bb1:bus-bot-minus-1",
          wireColor: "black",
          hint: "Massa dell'Arduino."
        },
        {
          step: 7,
          text: "Collega un filo ROSSO dal pin 5V al binario +. Carica il codice SOS!",
          wireFrom: "nano1:5V",
          wireTo: "bb1:bus-bot-plus-1",
// © Andrea Marro — 09/04/2026 — ELAB Tutor — Tutti i diritti riservati
          wireColor: "red",
          hint: "Il LED lampeggera SOS: punto-punto-punto linea-linea-linea punto-punto-punto!"
        }
      ],
      scratchXml: SOS_MORSE_SCRATCH,
      steps: [
        "Usa lo stesso circuito dell'esperimento precedente (LED su pin 13 con resistore).",
        "Modifica il programma: crea due funzioni, punto() per lampi brevi e linea() per lampi lunghi.",
        "Nel loop, chiama punto() tre volte per la S, linea() tre volte per la O, e di nuovo punto() tre volte.",
        "Carica il programma e osserva il LED lampeggiare SOS!",
        "Prova a cambiare i tempi: delay piu corto = Morse piu veloce."
      ],
      observe: "Il LED lampeggia in un ritmo riconoscibile: tre lampi brevi (S), tre lampi lunghi (O), tre lampi brevi (S), poi una pausa lunga. Questo e il segnale di soccorso universale SOS in codice Morse!",
      unlimPrompt: "Lo studente sta facendo l'esperimento del codice Morse SOS con un LED. Spiega cos'e il codice Morse (inventato nel 1838, lettere come combinazioni di punti e linee). Perche SOS? Non e un'abbreviazione ma un segnale facile da ricordare e trasmettere. Rispondi in italiano.",
      quiz: [
        {
          question: "Nel codice Morse, la lettera S e formata da:",
          options: ["Tre lampi lunghi", "Tre lampi brevi (punti)", "Un lampo lungo e due brevi"],
          correct: 1,
          explanation: "La S nel codice Morse e composta da tre punti (lampi brevi): ... Le lettere brevi hanno simboli brevi, le lettere lunghe hanno simboli lunghi!"
        },
        {
          question: "A cosa serve creare funzioni come punto() e linea()?",
          options: ["A rendere il programma piu lento", "A organizzare il codice e evitare ripetizioni", "A cambiare il colore del LED"],
          correct: 1,
          explanation: "Le funzioni raggruppano istruzioni che si ripetono. Invece di scrivere lo stesso codice 6 volte, creiamo punto() e linea() e le richiamiamo quando servono!"
        }
      ]
    },
    {
      id: "v3-cap6-esp3",
      title: "Cap. 6 Esp. 2 - Cambia il numero di pin",
      bookRef: "Vol3 Cap6 ESPERIMENTO 2",
      desc: "Spostiamo il LED su un pin diverso! Cambiamo il numero del pin nel codice e ricolleghiamo il filo. Cosi impariamo che possiamo usare QUALSIASI pin digitale.",
      chapter: "Capitolo 6 - I pin digitali",
      difficulty: 1,
      icon: "\u{1F500}",
      simulationMode: "avr",
      components: [
        { type: "breadboard-half", id: "bb1" },
        { type: "nano-r4", id: "nano1" },
        { type: "resistor", id: "r1", value: 470 },
        { type: "led", id: "led1", color: "green" }
      ],
      connections: [
        { from: "nano1:W_D5", to: "bb1:a18", color: "green" },
        { from: "bb1:d25", to: "bb1:d27", color: "green" },
        { from: "bb1:a28", to: "bb1:bus-bot-minus-28", color: "black" },
        { from: "nano1:GND_R", to: "bb1:bus-bot-minus-1", color: "black" },
        { from: "nano1:5V", to: "bb1:bus-bot-plus-1", color: "red" }
      ],
      pinAssignments: {
        "r1:pin1": "bb1:c18",
        "r1:pin2": "bb1:c25",
        "led1:anode": "bb1:d27",
        "led1:cathode": "bb1:d28"
      },
      code: `// LED su un pin diverso — prova a cambiare il numero!
// Qui usiamo il pin 5, ma puoi provare 3, 6, 9...

void setup() {
  pinMode(5, OUTPUT);
}

void loop() {
  digitalWrite(5, HIGH);
  delay(1000);
  digitalWrite(5, LOW);
  delay(1000);
}`,
      layout: {
        "nano1": { x: 230, y: 10, parentId: "bb1" },
        "bb1": { x: 280, y: 10 },
        "r1": { x: 451.5, y: 58.75 },
        "led1": { x: 496.5, y: 43.75 }
      },
      concept: "Pin digitali intercambiabili, configurazione flessibile",
      layer: "schema",

      buildSteps: [
        {
          step: 1,
          text: "Prendi il resistore R1 (470\u03A9) e posizionalo nei fori C18 e C25",
          componentId: "r1",
          componentType: "resistor",
          targetPins: { "r1:pin1": "bb1:c18", "r1:pin2": "bb1:c25" },
          hint: "Il resistore protegge il LED."
        },
        {
          step: 2,
          text: "Prendi il LED verde e mettilo nei fori D27 e D28. L'anodo (+) in D27!",
          componentId: "led1",
          componentType: "led",
          targetPins: { "led1:anode": "bb1:d27", "led1:cathode": "bb1:d28" },
          hint: "Stavolta usiamo un pin diverso dal 13: il pin 5!"
        },
        {
          step: 3,
          text: "Collega un filo VERDE dal foro D25 al foro D27 (ponte R1 al LED)",
          wireFrom: "bb1:d25",
          wireTo: "bb1:d27",
          wireColor: "green",
          hint: "Collega il resistore al LED."
        },
        {
          step: 4,
          text: "Collega un filo VERDE dal pin D5 dell'Arduino al foro A18",
          wireFrom: "nano1:W_D5",
          wireTo: "bb1:a18",
          wireColor: "green",
          hint: "D5 invece di D13: qualsiasi pin digitale funziona!"
        },
        {
          step: 5,
          text: "Collega un filo NERO dal foro A28 al binario GND (-)",
          wireFrom: "bb1:a28",
          wireTo: "bb1:bus-bot-minus-28",
          wireColor: "black",
          hint: "Catodo del LED verso massa."
        },
        {
          step: 6,
          text: "Collega un filo NERO dal pin GND dell'Arduino al binario GND (-)",
          wireFrom: "nano1:GND_R",
          wireTo: "bb1:bus-bot-minus-1",
          wireColor: "black",
          hint: "Massa dell'Arduino."
        },
        {
          step: 7,
          text: "Collega un filo ROSSO dal pin 5V al binario +. Cambia il pin nel codice e carica!",
          wireFrom: "nano1:5V",
          wireTo: "bb1:bus-bot-plus-1",
          wireColor: "red",
          hint: "Nel codice cambia 13 con 5: il LED lampeggia dal pin 5!"
        }
      ],
      scratchXml: BLINK_PIN5_SCRATCH,
      steps: [
        "Prendi il circuito dell'Es. 2 e scollega il filo dal pin 13.",
        "Ricollegalo a un altro pin, ad esempio il pin 5.",
        "Nel codice, cambia il 13 in 5 (sia nel setup che nel loop). Carica e verifica!"
      ],
      observe: "Il LED lampeggia esattamente come prima, ma ora e controllato dal pin 5 invece che dal 13. Tutti i pin digitali di Arduino funzionano allo stesso modo!",
      unlimPrompt: "Sei Galileo, il tutor AI di ELAB. Lo studente sta imparando che i pin digitali sono intercambiabili. Il LED ora e sul pin 5 invece del 13. Spiega che Arduino ha tanti pin e possiamo scegliere quale usare, basta cambiare il numero nel codice. Rispondi in italiano.",
      quiz: [
        {
          question: "Se sposti il LED dal pin 13 al pin 5, cosa devi cambiare nel codice?",
          options: ["Solo il numero nel pinMode", "Il numero del pin sia nel pinMode che nel digitalWrite", "Non serve cambiare niente nel codice"],
          correct: 1,
          explanation: "Devi cambiare il numero del pin in TUTTI i punti del codice: nel pinMode(5, OUTPUT) e in entrambi i digitalWrite(5, HIGH) e digitalWrite(5, LOW). Se ne dimentichi uno, non funziona!"
        },
        {
          question: "Quanti pin digitali ha Arduino Nano che puoi usare per un LED?",
          options: ["Solo il pin 13", "Solo i pin pari", "Molti pin diversi, da D0 a D13"],
          correct: 2,
          explanation: "Arduino Nano ha 14 pin digitali (D0-D13) che puoi usare come OUTPUT. Il pin 13 non e speciale: qualsiasi pin digitale puo accendere un LED!"
        }
      ]
    },
    {
      id: "v3-cap6-esp4",
      title: "Cap. 6 Esp. 4 - Due LED: effetto polizia",
      bookRef: "Vol3 Cap6 ESPERIMENTO 4",
      desc: "Due LED che si alternano come le luci della polizia! Quando uno e acceso l'altro e spento. Usiamo due pin digitali per controllare due LED separatamente.",
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
// © Andrea Marro — 10/04/2026 — ELAB Tutor — Tutti i diritti riservati
        { type: "led", id: "led1", color: "green" },
        { type: "led", id: "led2", color: "yellow" },
        { type: "led", id: "led3", color: "red" }
      ],
      connections: [
        { from: "nano1:W_D5", to: "bb1:a16", color: "green" },
        { from: "bb1:d23", to: "bb1:d25", color: "green" },
        { from: "bb1:a26", to: "bb1:bus-bot-minus-26", color: "black" },
        { from: "nano1:W_D6", to: "bb1:a22", color: "yellow" },
        { from: "bb1:a30", to: "bb1:bus-bot-minus-30", color: "black" },
        { from: "nano1:W_D9", to: "bb1:f16", color: "red" },
        { from: "bb1:h23", to: "bb1:h30", color: "green" },
        { from: "bb1:f29", to: "bb1:bus-bot-minus-29", color: "black" },
        { from: "nano1:GND_R", to: "bb1:bus-bot-minus-1", color: "black" },
        { from: "nano1:5V", to: "bb1:bus-bot-plus-1", color: "red" }
      ],
      pinAssignments: {
        "r1:pin1": "bb1:b16", "r1:pin2": "bb1:b23",
        "led1:anode": "bb1:d25", "led1:cathode": "bb1:d26",
        "r2:pin1": "bb1:e22", "r2:pin2": "bb1:e29",
        "led2:anode": "bb1:d29", "led2:cathode": "bb1:d30",
        "r3:pin1": "bb1:i16", "r3:pin2": "bb1:i23",
        "led3:anode": "bb1:h30", "led3:cathode": "bb1:h29"
      },
      code: `// Semaforo 3 LED — Pin 5 (verde), 6 (giallo), 9 (rosso)

void setup() {
// © Andrea Marro — 09/04/2026 — ELAB Tutor — Tutti i diritti riservati
  pinMode(5, OUTPUT);
  pinMode(6, OUTPUT);
  pinMode(9, OUTPUT);
}

void loop() {
  digitalWrite(5, HIGH); digitalWrite(6, LOW); digitalWrite(9, LOW); delay(3000);
  digitalWrite(5, LOW); digitalWrite(6, HIGH); digitalWrite(9, LOW); delay(1000);
  digitalWrite(5, LOW); digitalWrite(6, LOW); digitalWrite(9, HIGH); delay(3000);
}`,
      layout: {
        "nano1": { x: 230, y: 10, parentId: "bb1" },
        "bb1": { x: 280, y: 10 },
        "r1": { x: 436.5, y: 51.25 },
        "led1": { x: 481.5, y: 43.75 },
        "r2": { x: 481.5, y: 73.75 },
        "led2": { x: 511.5, y: 43.75 },
        "r3": { x: 436.5, y: 113.75 },
        "led3": { x: 519, y: 83.75 }
      },
      concept: "Piu pin OUTPUT, sequenza di stati, semaforo",
      layer: "schema",

      buildSteps: [
        {
          step: 1,
          text: "Prendi il resistore R1 (470\u03A9) e posizionalo nei fori B16 e B23 - circuito verde",
          componentId: "r1",
          componentType: "resistor",
          targetPins: { "r1:pin1": "bb1:b16", "r1:pin2": "bb1:b23" },
          hint: "R1 e il resistore del LED verde, nella fila B a sinistra."
        },
        {
          step: 2,
          text: "Prendi il LED verde e mettilo nei fori D25 e D26. L'anodo (+) in D25!",
          componentId: "led1",
          componentType: "led",
          targetPins: { "led1:anode": "bb1:d25", "led1:cathode": "bb1:d26" },
          hint: "Il LED verde e il primo colore del semaforo."
        },
        {
          step: 3,
          text: "Collega un filo VERDE dal foro D23 al foro D25 (ponte R1 al LED verde)",
          wireFrom: "bb1:d23",
          wireTo: "bb1:d25",
          wireColor: "green",
          hint: "Collega il resistore al LED verde."
        },
        {
          step: 4,
          text: "Prendi il resistore R2 (470\u03A9) e posizionalo nei fori E22 e E29 - circuito giallo",
          componentId: "r2",
          componentType: "resistor",
          targetPins: { "r2:pin1": "bb1:e22", "r2:pin2": "bb1:e29" },
          hint: "R2 e il resistore del LED giallo."
        },
        {
          step: 5,
          text: "Prendi il LED giallo e mettilo nei fori D29 e D30. L'anodo (+) in D29!",
          componentId: "led2",
          componentType: "led",
          targetPins: { "led2:anode": "bb1:d29", "led2:cathode": "bb1:d30" },
          hint: "Il LED giallo e il secondo colore."
        },
        {
          step: 6,
          text: "Prendi il resistore R3 (470\u03A9) e posizionalo nei fori I16 e I23 - circuito rosso",
          componentId: "r3",
          componentType: "resistor",
          targetPins: { "r3:pin1": "bb1:i16", "r3:pin2": "bb1:i23" },
          hint: "R3 e il resistore del LED rosso, nella fila I (parte bassa)."
        },
        {
          step: 7,
          text: "Prendi il LED rosso e mettilo nei fori H30 e H29. L'anodo (+) in H30!",
          componentId: "led3",
          componentType: "led",
          targetPins: { "led3:anode": "bb1:h30", "led3:cathode": "bb1:h29" },
          hint: "Il LED rosso e il terzo colore."
        },
        {
          step: 8,
          text: "Collega un filo VERDE dal foro H23 al foro H30 (ponte R3 al LED rosso)",
          wireFrom: "bb1:h23",
          wireTo: "bb1:h30",
          wireColor: "green",
          hint: "Collega il resistore al LED rosso."
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
          text: "Collega un filo NERO dal foro A26 al binario GND (-) - catodo verde",
          wireFrom: "bb1:a26",
          wireTo: "bb1:bus-bot-minus-26",
          wireColor: "black",
          hint: "Catodo del LED verde verso massa."
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
          text: "Collega un filo NERO dal foro A30 al binario GND (-) - catodo giallo",
          wireFrom: "bb1:a30",
          wireTo: "bb1:bus-bot-minus-30",
          wireColor: "black",
          hint: "Catodo del LED giallo verso massa."
        },
        {
          step: 13,
          text: "Collega un filo ROSSO dal pin D9 dell'Arduino al foro F16",
          wireFrom: "nano1:W_D9",
          wireTo: "bb1:f16",
          wireColor: "red",
          hint: "D9 controlla il LED rosso."
        },
        {
          step: 14,
          text: "Collega un filo NERO dal foro F29 al binario GND (-) - catodo rosso",
          wireFrom: "bb1:f29",
          wireTo: "bb1:bus-bot-minus-29",
          wireColor: "black",
          hint: "Catodo del LED rosso verso massa."
        },
        {
          step: 15,
          text: "Collega un filo NERO dal pin GND dell'Arduino al binario GND (-)",
          wireFrom: "nano1:GND_R",
          wireTo: "bb1:bus-bot-minus-1",
          wireColor: "black",
          hint: "Massa dell'Arduino."
        },
        {
          step: 16,
          text: "Collega un filo ROSSO dal pin 5V al binario +. I 3 LED si alternano come la polizia!",
          wireFrom: "nano1:5V",
          wireTo: "bb1:bus-bot-plus-1",
          wireColor: "red",
          hint: "3 LED su 3 pin diversi. Il programma li accende in sequenza!"
        }
      ],
      scratchXml: SEMAFORO_3LED_SCRATCH,
      steps: [
        "Collega 3 LED (verde, giallo, rosso) con i loro resistori ai pin 5, 6 e 9.",
        "Nel setup() configura tutti e 3 i pin come OUTPUT.",
        "Nel loop() accendi un LED alla volta spegnendo gli altri, con delay tra ogni fase."
      ],
      observe: "I 3 LED si accendono in sequenza come un semaforo: verde 3 secondi, giallo 1 secondo, rosso 3 secondi. Solo un LED alla volta e acceso!",
      unlimPrompt: "Sei Galileo, il tutor AI di ELAB. Lo studente sta facendo il semaforo con 3 LED sui pin 5, 6 e 9. Spiega come il codice accende un solo LED alla volta: prima mette tutti LOW tranne quello che vuole accendere. Rispondi in italiano.",
      quiz: [
        {
          question: "Perche nel codice del semaforo si scrive digitalWrite(5, LOW) prima di accendere il pin 6?",
          options: ["Perche il pin 5 si rompe se resta acceso", "Per spegnere il LED precedente prima di accendere quello nuovo", "Perche Arduino puo accendere solo un pin alla volta"],
          correct: 1,
          explanation: "Se non spegni i LED precedenti, resterebbero tutti accesi insieme! Nel semaforo deve brillare solo un colore alla volta, quindi spegni gli altri prima di accendere quello nuovo."
        },
        {
          question: "Cosa succede se dimentichi il delay() tra una fase e l'altra del semaforo?",
          options: ["I LED si accendono e spengono cosi velocemente che sembra siano tutti accesi", "Arduino si blocca", "Il semaforo funziona normalmente"],
          correct: 0,
          explanation: "Senza delay, Arduino esegue il loop migliaia di volte al secondo. I LED si accendono e spengono cosi rapidamente che l'occhio umano li vede tutti accesi contemporaneamente!"
        }
      ]
    },
    {
      id: "v3-cap6-semaforo",
      title: "Cap. 6 Esp. 5 - Il semaforo",
      bookRef: "Vol3 Cap6 ESPERIMENTO 5",
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
// © Andrea Marro — 09/04/2026 — ELAB Tutor — Tutti i diritti riservati
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
        "nano1": { x: 230, y: 10, parentId: "bb1" },
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
      unlimPrompt: "Sei Galileo, il tutor AI di ELAB. Lo studente sta guardando l'esperimento 'Semaforo 3 LED' del Volume 3 — Arduino Programmato. Questo esperimento usa TRE pin di output sul breakout wing (W_D5, W_D6, W_D3) per creare un semaforo vero! Il codice nel loop() ha tre blocchi: prima accende solo il verde (pin 5 HIGH, gli altri LOW) e aspetta 3 secondi, poi solo il giallo (pin 6) per 1 secondo, poi solo il rosso (pin 3) per 3 secondi. È una sequenza di stati, come le fasi di un semaforo reale! Spiega il codice riga per riga in modo semplice, usando analogie adatte a bambini di 8-12 anni. Rispondi in italiano.",
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
// © Andrea Marro — 10/04/2026 — ELAB Tutor — Tutti i diritti riservati
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
// © Andrea Marro — 09/04/2026 — ELAB Tutor — Tutti i diritti riservati
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
          text: "Configura i 3 pin — trascina 3 blocchi PinMode nel Setup: pin 5 OUTPUT (verde), pin 6 OUTPUT (giallo), pin 3 OUTPUT (rosso)",
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
          text: "Fase VERDE — nel Loop: DigitalWrite pin 5 HIGH, pin 6 LOW, pin 3 LOW, poi Attendi 3000 ms",
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
          text: "Completa il semaforo — aggiungi fase GIALLA (pin 6 HIGH, 1000 ms) e fase ROSSA (pin 3 HIGH, 3000 ms). Il ciclo si ripete!",
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

    // --- Cap 6 Es 6.5-6.7: digitalRead, toggle, debounce ---
    {
      id: "v3-cap6-esp5",
      title: "Cap. 7 Ese. 7.3 - Pulsante con INPUT_PULLUP",
      bookRef: "Vol3 Cap7 ESERCIZIO 7.3",
      desc: "Collegamento semplicissimo del pulsante con INPUT_PULLUP! Solo 1 filo + GND. Arduino attiva una resistenza interna. Quando premi, il LED si accende.",
      chapter: "Capitolo 6 - I pin digitali",
      difficulty: 2,
      icon: "\u{1F518}",
      simulationMode: "avr",
      components: [
        { type: "breadboard-half", id: "bb1" },
        { type: "nano-r4", id: "nano1" },
        { type: "push-button", id: "btn1" },
        { type: "resistor", id: "r1", value: 470 },
        { type: "led", id: "led1", color: "green" }
      ],
      connections: [
        { from: "nano1:W_D10", to: "bb1:a20", color: "yellow" },
        { from: "bb1:j20", to: "bb1:bus-bot-minus-20", color: "black" },
        { from: "nano1:W_D5", to: "bb1:a18", color: "green" },
        { from: "bb1:d25", to: "bb1:d27", color: "green" },
        { from: "bb1:a28", to: "bb1:bus-bot-minus-28", color: "black" },
        { from: "nano1:GND_R", to: "bb1:bus-bot-minus-1", color: "black" },
        { from: "nano1:5V", to: "bb1:bus-bot-plus-1", color: "red" }
      ],
      pinAssignments: {
        "btn1:pin1": "bb1:e20", "btn1:pin2": "bb1:e24",
        "btn1:pin3": "bb1:f20", "btn1:pin4": "bb1:f24",
        "r1:pin1": "bb1:c18", "r1:pin2": "bb1:c25",
        "led1:anode": "bb1:d27", "led1:cathode": "bb1:d28"
      },
      code: `// digitalRead con pulsante — INPUT_PULLUP
// Pin 10 = pulsante, Pin 5 = LED

bool statoLED = false;
// © Andrea Marro — 10/04/2026 — ELAB Tutor — Tutti i diritti riservati

void setup() {
  pinMode(10, INPUT_PULLUP);
  pinMode(5, OUTPUT);
}

void loop() {
  if (digitalRead(10) == LOW) {
    if (statoLED == false) { statoLED = true; } else { statoLED = false; }
    delay(300);
  }
  digitalWrite(5, statoLED);
}`,
      layout: {
        "nano1": { x: 230, y: 10, parentId: "bb1" },
        "bb1": { x: 280, y: 10 },
        "btn1": { x: 455.25, y: 81.25 },
        "r1": { x: 451.5, y: 58.75 },
        "led1": { x: 496.5, y: 43.75 }
      },
      concept: "digitalRead, INPUT_PULLUP, variabile booleana, toggle semplice",
      layer: "schema",

      buildSteps: [
        {
          step: 1,
          text: "Prendi il pulsante e posizionalo a cavallo della scanalatura, nei fori E20-F20 e E24-F24",
          componentId: "btn1",
          componentType: "push-button",
          targetPins: { "btn1:pin1": "bb1:e20", "btn1:pin2": "bb1:e24", "btn1:pin3": "bb1:f20", "btn1:pin4": "bb1:f24" },
          hint: "Il pulsante legge lo stato con INPUT_PULLUP: premuto = LOW."
        },
        {
          step: 2,
          text: "Prendi il resistore R1 (470\u03A9) e posizionalo nei fori C18 e C25",
          componentId: "r1",
          componentType: "resistor",
          targetPins: { "r1:pin1": "bb1:c18", "r1:pin2": "bb1:c25" },
          hint: "R1 protegge il LED."
        },
        {
          step: 3,
          text: "Prendi il LED verde e mettilo nei fori D27 e D28. L'anodo (+) in D27!",
          componentId: "led1",
          componentType: "led",
          targetPins: { "led1:anode": "bb1:d27", "led1:cathode": "bb1:d28" },
          hint: "Il LED si accende quando premi il pulsante."
        },
        {
          step: 4,
          text: "Collega un filo VERDE dal foro D25 al foro D27 (ponte R1 al LED)",
          wireFrom: "bb1:d25",
          wireTo: "bb1:d27",
          wireColor: "green",
          hint: "Collega il resistore al LED."
        },
        {
          step: 5,
          text: "Collega un filo GIALLO dal pin D10 dell'Arduino al foro A20",
          wireFrom: "nano1:W_D10",
          wireTo: "bb1:a20",
          wireColor: "yellow",
          hint: "D10 legge il pulsante con INPUT_PULLUP."
        },
        {
          step: 6,
          text: "Collega un filo NERO dal foro J20 al binario GND (-) - lato GND del pulsante",
          wireFrom: "bb1:j20",
          wireTo: "bb1:bus-bot-minus-20",
          wireColor: "black",
          hint: "Quando premi, il pin D10 si collega a GND e legge LOW."
        },
        {
          step: 7,
          text: "Collega un filo VERDE dal pin D5 dell'Arduino al foro A18",
          wireFrom: "nano1:W_D5",
          wireTo: "bb1:a18",
          wireColor: "green",
          hint: "D5 controlla il LED."
        },
        {
          step: 8,
          text: "Collega un filo NERO dal foro A28 al binario GND (-) - catodo LED",
          wireFrom: "bb1:a28",
          wireTo: "bb1:bus-bot-minus-28",
          wireColor: "black",
          hint: "Catodo del LED verso massa."
        },
        {
          step: 9,
          text: "Collega un filo NERO dal pin GND dell'Arduino al binario GND (-)",
          wireFrom: "nano1:GND_R",
          wireTo: "bb1:bus-bot-minus-1",
          wireColor: "black",
          hint: "Massa dell'Arduino."
        },
        {
// © Andrea Marro — 09/04/2026 — ELAB Tutor — Tutti i diritti riservati
          step: 10,
          text: "Collega un filo ROSSO dal pin 5V al binario +. Premi il pulsante per toggleare il LED!",
          wireFrom: "nano1:5V",
          wireTo: "bb1:bus-bot-plus-1",
          wireColor: "red",
          hint: "Pulsante su D10 con INPUT_PULLUP, LED su D5. Ogni pressione cambia stato!"
        }
      ],
      scratchXml: PULLUP_LED_SCRATCH,
      steps: [
        "Collega il pulsante a cavallo della scanalatura della breadboard.",
        "Un lato del pulsante va al pin 10 di Arduino, l'altro a GND.",
        "Collega il LED con resistore al pin 5. Carica il codice e premi il pulsante!"
      ],
      observe: "Ogni volta che premi il pulsante, il LED cambia stato: se era spento si accende, se era acceso si spegne. La variabile statoLED ricorda lo stato tra un ciclo e l'altro!",
      unlimPrompt: "Sei Galileo, il tutor AI di ELAB. Lo studente sta usando digitalRead per leggere un pulsante. Spiega INPUT_PULLUP: Arduino ha una resistenza interna che tiene il pin HIGH quando il pulsante non e premuto. Quando lo premi, il pin va LOW perche si collega a GND. Il codice usa una variabile booleana per ricordare lo stato. Rispondi in italiano.",
      quiz: [
        {
          question: "Con INPUT_PULLUP, cosa legge Arduino quando il pulsante NON e premuto?",
          options: ["LOW (0)", "HIGH (1)", "Nessun valore"],
          correct: 1,
          explanation: "INPUT_PULLUP attiva una resistenza interna che tiene il pin HIGH. Quando premi il pulsante, colleghi il pin a GND e Arduino legge LOW."
        },
        {
          question: "A cosa serve la variabile booleana statoLED nel codice?",
          options: ["A misurare la luminosita del LED", "A ricordare se il LED e acceso o spento tra un ciclo e l'altro", "A contare quante volte premi il pulsante"],
          correct: 1,
          explanation: "La variabile bool statoLED salva lo stato corrente del LED. Senza questa variabile, il programma non saprebbe se il LED era acceso o spento al ciclo precedente!"
        }
      ]
    },
    {
      id: "v3-cap6-esp6",
      title: "Cap. 7 Mini-progetto - Due LED, un pulsante",
      bookRef: "Vol3 Cap7 Mini-progetto",
      desc: "Se premi il pulsante il LED verde si accende, se non premi si accende il rosso. Arduino sceglie quale LED attivare in base allo stato del pulsante!",
      chapter: "Capitolo 6 - I pin digitali",
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
        "nano1": { x: 230, y: 10, parentId: "bb1" },
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
      unlimPrompt: "Sei Galileo, il tutor AI di ELAB. Lo studente sta guardando l'esperimento '2 LED + Pulsante (toggle)' del Volume 3 — Arduino Programmato. Questo è l'esperimento più avanzato del capitolo 7! Il codice usa variabili booleane (statoVerde e ultimoPulsante) per ricordare lo stato tra un ciclo e l'altro. Rileva la transizione HIGH->LOW del pulsante (il momento esatto della pressione) e usa il debounce con delay(50) per evitare falsi contatti. Poi con if/else alterna quale LED è acceso. È come un interruttore che ogni volta che lo premi cambia stanza! Spiega il codice riga per riga in modo semplice, usando analogie adatte a bambini di 8-12 anni. Rispondi in italiano.",
      code: `// 2 LED + Pulsante Toggle
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
      hexFile: "/hex/v3-cap6-esp6.hex",
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
// © Andrea Marro — 10/04/2026 — ELAB Tutor — Tutti i diritti riservati
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
// © Andrea Marro — 09/04/2026 — ELAB Tutor — Tutti i diritti riservati
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
          description: "Programmiamo il pulsante con 2 LED! Apri l'editor e vai sulla tab Blocchi.",
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
    {
      id: "v3-cap6-esp7",
      title: "Cap. 6 Esp. 7 - Debounce del pulsante",
      desc: "Miglioriamo il toggle! Il debounce con while aspetta che il pulsante venga rilasciato prima di continuare. Cosi evitiamo che un solo tocco venga letto come tante pressioni.",
      chapter: "Capitolo 6 - I pin digitali",
      difficulty: 2,
      icon: "\u{1F3AF}",
      simulationMode: "avr",
      components: [
        { type: "breadboard-half", id: "bb1" },
        { type: "nano-r4", id: "nano1" },
        { type: "push-button", id: "btn1" },
        { type: "resistor", id: "r1", value: 470 },
        { type: "led", id: "led1", color: "green" }
      ],
      connections: [
        { from: "nano1:W_D10", to: "bb1:a20", color: "yellow" },
        { from: "bb1:j20", to: "bb1:bus-bot-minus-20", color: "black" },
        { from: "nano1:W_D5", to: "bb1:a18", color: "green" },
        { from: "bb1:d25", to: "bb1:d27", color: "green" },
        { from: "bb1:a28", to: "bb1:bus-bot-minus-28", color: "black" },
        { from: "nano1:GND_R", to: "bb1:bus-bot-minus-1", color: "black" },
        { from: "nano1:5V", to: "bb1:bus-bot-plus-1", color: "red" }
      ],
      pinAssignments: {
        "btn1:pin1": "bb1:e20", "btn1:pin2": "bb1:e24",
        "btn1:pin3": "bb1:f20", "btn1:pin4": "bb1:f24",
        "r1:pin1": "bb1:c18", "r1:pin2": "bb1:c25",
        "led1:anode": "bb1:d27", "led1:cathode": "bb1:d28"
      },
      layout: {
        "nano1": { x: 230, y: 10, parentId: "bb1" },
        "bb1": { x: 280, y: 10 },
        "btn1": { x: 455.25, y: 81.25 },
        "r1": { x: 451.5, y: 58.75 },
        "led1": { x: 496.5, y: 43.75 }
      },
      code: `// Debounce con while — aspetta il rilascio del pulsante
// Pin 10 = pulsante (INPUT_PULLUP), Pin 5 = LED

bool statoLED = false;

void setup() {
  pinMode(10, INPUT_PULLUP);
  pinMode(5, OUTPUT);
}

void loop() {
  if (digitalRead(10) == LOW) {
    if (statoLED == false) { statoLED = true; } else { statoLED = false; }
    digitalWrite(5, statoLED);
    while (digitalRead(10) == LOW) { }
    delay(300);
  }
}`,
      concept: "Debounce con while, rimbalzo meccanico, attesa rilascio",
      layer: "schema",

      buildSteps: [
        {
          step: 1,
          text: "Prendi il pulsante e posizionalo a cavallo della scanalatura, nei fori E20-F20 e E24-F24",
          componentId: "btn1",
          componentType: "push-button",
          targetPins: { "btn1:pin1": "bb1:e20", "btn1:pin2": "bb1:e24", "btn1:pin3": "bb1:f20", "btn1:pin4": "bb1:f24" },
          hint: "Stesso circuito dell'Es. 6.5, il debounce e nel codice."
        },
        {
          step: 2,
          text: "Prendi il resistore R1 (470\u03A9) e posizionalo nei fori C18 e C25",
          componentId: "r1",
          componentType: "resistor",
          targetPins: { "r1:pin1": "bb1:c18", "r1:pin2": "bb1:c25" },
          hint: "R1 protegge il LED."
        },
        {
          step: 3,
          text: "Prendi il LED verde e mettilo nei fori D27 e D28. L'anodo (+) in D27!",
          componentId: "led1",
          componentType: "led",
          targetPins: { "led1:anode": "bb1:d27", "led1:cathode": "bb1:d28" },
          hint: "Il debounce con while rende il toggle piu pulito."
        },
        {
          step: 4,
          text: "Collega un filo VERDE dal foro D25 al foro D27 (ponte R1 al LED)",
          wireFrom: "bb1:d25",
          wireTo: "bb1:d27",
          wireColor: "green",
          hint: "Collega il resistore al LED."
        },
        {
          step: 5,
          text: "Collega un filo GIALLO dal pin D10 dell'Arduino al foro A20",
          wireFrom: "nano1:W_D10",
          wireTo: "bb1:a20",
          wireColor: "yellow",
          hint: "D10 legge il pulsante con INPUT_PULLUP."
        },
        {
          step: 6,
          text: "Collega un filo NERO dal foro J20 al binario GND (-)",
          wireFrom: "bb1:j20",
          wireTo: "bb1:bus-bot-minus-20",
          wireColor: "black",
          hint: "Lato GND del pulsante."
// © Andrea Marro — 09/04/2026 — ELAB Tutor — Tutti i diritti riservati
        },
        {
          step: 7,
          text: "Collega un filo VERDE dal pin D5 dell'Arduino al foro A18",
          wireFrom: "nano1:W_D5",
          wireTo: "bb1:a18",
          wireColor: "green",
          hint: "D5 controlla il LED."
        },
        {
          step: 8,
          text: "Collega un filo NERO dal foro A28 al binario GND (-)",
          wireFrom: "bb1:a28",
          wireTo: "bb1:bus-bot-minus-28",
          wireColor: "black",
          hint: "Catodo del LED verso massa."
        },
        {
          step: 9,
          text: "Collega un filo NERO dal pin GND dell'Arduino al binario GND (-)",
          wireFrom: "nano1:GND_R",
          wireTo: "bb1:bus-bot-minus-1",
          wireColor: "black",
          hint: "Massa dell'Arduino."
        },
        {
          step: 10,
          text: "Collega un filo ROSSO dal pin 5V al binario +. Il debounce con while migliora il toggle!",
          wireFrom: "nano1:5V",
          wireTo: "bb1:bus-bot-plus-1",
          wireColor: "red",
          hint: "Il while aspetta che rilasci il pulsante prima di continuare."
        }
      ],
      scratchXml: DEBOUNCE_SCRATCH,
      steps: [
        "Usa lo stesso circuito dell'Es. 6.5 (pulsante + LED).",
        "La differenza e nel codice: dopo aver cambiato stato, il programma ASPETTA che il pulsante venga rilasciato.",
        "Carica e confronta: ora ogni pressione conta come UNA sola, anche se tieni premuto!"
      ],
      observe: "Rispetto all'Es. 6.5, il LED cambia stato in modo piu pulito. Il while aspetta che rilasci il pulsante, e il delay(300) dopo aggiunge un po di tempo per evitare i rimbalzi meccanici.",
      unlimPrompt: "Sei Galileo, il tutor AI di ELAB. Lo studente sta imparando il debounce con while. Il while(digitalRead(10)==LOW){} e un ciclo vuoto che BLOCCA il programma finche il pulsante resta premuto. Solo quando lo rilasci il programma continua. Poi delay(300) aspetta ancora 300ms per sicurezza. Spiega perche i pulsanti rimbalzano meccanicamente. Rispondi in italiano.",
      quiz: [
        {
          question: "Cosa fa while(digitalRead(10) == LOW) {} ?",
          options: ["Accende il LED finche il pulsante e premuto", "Aspetta in un ciclo vuoto finche il pulsante resta premuto", "Spegne il LED dopo un po"],
          correct: 1,
          explanation: "E un ciclo while con corpo vuoto {}. Il programma resta bloccato li finche digitalRead legge LOW (pulsante premuto). Appena rilasci, esce dal while e continua."
        },
        {
          question: "Perche i pulsanti meccanici hanno bisogno del debounce?",
          options: ["Perche consumano troppa corrente", "Perche il contatto metallico rimbalza e genera falsi segnali rapidissimi", "Perche Arduino non riesce a leggere i pulsanti senza debounce"],
          correct: 1,
          explanation: "Quando premi un pulsante, il contatto metallico rimbalza (bounce) creando tanti segnali HIGH/LOW rapidissimi. Il debounce aspetta che il rimbalzo finisca prima di leggere il valore vero."
        }
      ]
    },

    // ═══════════════════════════════════════════════════
    // CAPITOLO 7 — I pin analogici (8 esperimenti)
    // ═══════════════════════════════════════════════════
    {
      id: "v3-cap7-esp1",
      title: "Cap. 7 Esp. 1 - analogRead base",
      desc: "Leggiamo un trimmer (potenziometro) con analogRead! Se il valore supera 511, il LED si accende. Il trimmer restituisce valori da 0 a 1023.",
      chapter: "Capitolo 7 - I pin analogici",
      difficulty: 2,
      icon: "\u{1F39B}",
// © Andrea Marro — 10/04/2026 — ELAB Tutor — Tutti i diritti riservati
      simulationMode: "avr",
      components: [
        { type: "breadboard-half", id: "bb1" },
        { type: "nano-r4", id: "nano1" },
        { type: "potentiometer", id: "pot1", value: 10000 },
        { type: "resistor", id: "r1", value: 470 },
        { type: "led", id: "led1", color: "red" }
      ],
      connections: [
        { from: "bb1:f22", to: "bb1:bus-bot-plus-22", color: "red" },
        { from: "nano1:W_A0", to: "bb1:f23", color: "yellow" },
        { from: "bb1:f24", to: "bb1:bus-bot-minus-24", color: "black" },
        { from: "nano1:W_D13", to: "bb1:a18", color: "orange" },
        { from: "bb1:d25", to: "bb1:d27", color: "green" },
        { from: "bb1:a28", to: "bb1:bus-bot-minus-28", color: "black" },
        { from: "nano1:GND_R", to: "bb1:bus-bot-minus-1", color: "black" },
        { from: "nano1:5V", to: "bb1:bus-bot-plus-1", color: "red" }
      ],
      pinAssignments: {
        "pot1:vcc": "bb1:h22", "pot1:signal": "bb1:h23", "pot1:gnd": "bb1:h24",
        "r1:pin1": "bb1:c18", "r1:pin2": "bb1:c25",
        "led1:anode": "bb1:d27", "led1:cathode": "bb1:d28"
      },
      code: `// analogRead base — trimmer controlla LED on/off
// A0 = trimmer, pin 13 = LED

void setup() {
  pinMode(A0, INPUT);
  pinMode(13, OUTPUT);
}

void loop() {
  int valoreLetto = analogRead(A0);
  if (valoreLetto > 511) { digitalWrite(13, HIGH); } else { digitalWrite(13, LOW); }
}`,
      layout: {
        "nano1": { x: 230, y: 10, parentId: "bb1" },
        "bb1": { x: 280, y: 10 },
        "pot1": { x: 462.75, y: 83.75 },
        "r1": { x: 451.5, y: 58.75 },
        "led1": { x: 496.5, y: 43.75 }
      },
      concept: "analogRead, valori 0-1023, soglia, confronto",
      layer: "schema",

      buildSteps: [
        {
          step: 1,
          text: "Prendi il potenziometro da 10k\u03A9 e posizionalo nei fori H22, H23, H24",
          componentId: "pot1",
          componentType: "potentiometer",
          targetPins: { "pot1:vcc": "bb1:h22", "pot1:signal": "bb1:h23", "pot1:gnd": "bb1:h24" },
          hint: "Il potenziometro ha 3 pin: VCC, segnale e GND. La manopola regola la tensione."
        },
        {
          step: 2,
          text: "Collega un filo ROSSO dal foro F22 al binario + (5V)",
          wireFrom: "bb1:f22",
          wireTo: "bb1:bus-bot-plus-22",
          wireColor: "red",
          hint: "VCC del potenziometro al 5V."
        },
        {
          step: 3,
          text: "Collega un filo GIALLO dal pin A0 dell'Arduino al foro F23",
          wireFrom: "nano1:W_A0",
          wireTo: "bb1:f23",
          wireColor: "yellow",
          hint: "Segnale del potenziometro ad A0. analogRead(A0) leggera valori 0-1023."
        },
        {
          step: 4,
          text: "Collega un filo NERO dal foro F24 al binario GND (-)",
          wireFrom: "bb1:f24",
          wireTo: "bb1:bus-bot-minus-24",
          wireColor: "black",
          hint: "GND del potenziometro a massa."
        },
        {
          step: 5,
          text: "Prendi il resistore R1 (470\u03A9) e posizionalo nei fori C18 e C25",
          componentId: "r1",
          componentType: "resistor",
          targetPins: { "r1:pin1": "bb1:c18", "r1:pin2": "bb1:c25" },
          hint: "R1 protegge il LED."
        },
        {
          step: 6,
          text: "Prendi il LED rosso e mettilo nei fori D27 e D28. L'anodo (+) in D27!",
          componentId: "led1",
          componentType: "led",
          targetPins: { "led1:anode": "bb1:d27", "led1:cathode": "bb1:d28" },
          hint: "Il LED si accende quando il trimmer supera meta corsa (valore > 511)."
        },
        {
          step: 7,
          text: "Collega un filo VERDE dal foro D25 al foro D27 (ponte R1 al LED)",
          wireFrom: "bb1:d25",
          wireTo: "bb1:d27",
          wireColor: "green",
          hint: "Collega il resistore al LED."
        },
        {
          step: 8,
          text: "Collega un filo ARANCIONE dal pin D13 dell'Arduino al foro A18",
          wireFrom: "nano1:W_D13",
          wireTo: "bb1:a18",
          wireColor: "orange",
          hint: "D13 controlla il LED."
        },
        {
          step: 9,
          text: "Collega un filo NERO dal foro A28 al binario GND (-) - catodo LED",
          wireFrom: "bb1:a28",
          wireTo: "bb1:bus-bot-minus-28",
          wireColor: "black",
          hint: "Catodo del LED verso massa."
        },
        {
          step: 10,
          text: "Collega un filo NERO dal pin GND dell'Arduino al binario GND (-)",
          wireFrom: "nano1:GND_R",
          wireTo: "bb1:bus-bot-minus-1",
          wireColor: "black",
          hint: "Massa dell'Arduino."
        },
        {
          step: 11,
          text: "Collega un filo ROSSO dal pin 5V al binario +. Gira il trimmer e osserva!",
          wireFrom: "nano1:5V",
          wireTo: "bb1:bus-bot-plus-1",
          wireColor: "red",
          hint: "Superata meta corsa (511) il LED si accende. E il tuo primo sensore analogico!"
// © Andrea Marro — 09/04/2026 — ELAB Tutor — Tutti i diritti riservati
        }
      ],
      scratchXml: ANALOG_READ_BASE_SCRATCH,
      steps: [
        "Collega il potenziometro: VCC al 5V, GND a massa, segnale al pin A0.",
        "Collega un LED con resistore al pin 13.",
        "Carica il codice e gira il potenziometro: superata la meta (511), il LED si accende!"
      ],
      observe: "Girando il potenziometro, il LED si accende quando superi la meta della rotazione (valore > 511 su 1023). E come un interruttore controllato dalla posizione della manopola!",
      unlimPrompt: "Sei Galileo, il tutor AI di ELAB. Lo studente sta usando analogRead per la prima volta. Spiega che i pin analogici leggono valori da 0 a 1023 (10 bit), non solo HIGH/LOW come i digitali. Il trimmer e come una manopola del volume: girandolo cambia la tensione che Arduino legge. 511 e la meta. Rispondi in italiano.",
      quiz: [
        {
          question: "Qual e il range di valori che analogRead puo restituire?",
          options: ["Da 0 a 255", "Da 0 a 1023", "Da 0 a 5"],
          correct: 1,
          explanation: "analogRead usa un convertitore a 10 bit, quindi restituisce valori da 0 (0 Volt) a 1023 (5 Volt). Sono 1024 livelli possibili!"
        },
        {
          question: "Cosa succede quando il valore del trimmer e esattamente 511?",
          options: ["Il LED si accende", "Il LED resta spento", "Arduino si resetta"],
          correct: 1,
          explanation: "Il codice dice if(valoreLetto > 511): il 511 NON e maggiore di 511, quindi la condizione e falsa e il LED resta spento. Serve almeno 512 per accenderlo!"
        }
      ]
    },
    {
      id: "v3-cap7-esp2",
      title: "Cap. 7 Esp. 2 - analogRead con tensione",
      desc: "Convertiamo il valore del trimmer in Volt veri! Con una formula semplice, Arduino ci dice quanti Volt sta leggendo sul pin A0.",
      chapter: "Capitolo 7 - I pin analogici",
      difficulty: 2,
      icon: "\u{26A1}",
      simulationMode: "avr",
      components: [
        { type: "breadboard-half", id: "bb1" },
        { type: "nano-r4", id: "nano1" },
        { type: "potentiometer", id: "pot1", value: 10000 },
        { type: "resistor", id: "r1", value: 470 },
        { type: "led", id: "led1", color: "red" }
      ],
      connections: [
        { from: "bb1:f22", to: "bb1:bus-bot-plus-22", color: "red" },
        { from: "nano1:W_A0", to: "bb1:f23", color: "yellow" },
        { from: "bb1:f24", to: "bb1:bus-bot-minus-24", color: "black" },
        { from: "nano1:W_D13", to: "bb1:a18", color: "orange" },
        { from: "bb1:d25", to: "bb1:d27", color: "green" },
        { from: "bb1:a28", to: "bb1:bus-bot-minus-28", color: "black" },
        { from: "nano1:GND_R", to: "bb1:bus-bot-minus-1", color: "black" },
        { from: "nano1:5V", to: "bb1:bus-bot-plus-1", color: "red" }
      ],
      pinAssignments: {
        "pot1:vcc": "bb1:h22", "pot1:signal": "bb1:h23", "pot1:gnd": "bb1:h24",
        "r1:pin1": "bb1:c18", "r1:pin2": "bb1:c25",
        "led1:anode": "bb1:d27", "led1:cathode": "bb1:d28"
      },
      code: `// analogRead con tensione — converte in Volt
// A0 = trimmer, pin 13 = LED, soglia 2.5V

void setup() {
  pinMode(A0, INPUT);
  pinMode(13, OUTPUT);
}

void loop() {
  int valoreLetto = analogRead(A0);
  float tensione = (valoreLetto * 5.0) / 1023;
  if (tensione > 2.5) { digitalWrite(13, HIGH); } else { digitalWrite(13, LOW); }
}`,
      layout: {
        "nano1": { x: 230, y: 10, parentId: "bb1" },
        "bb1": { x: 280, y: 10 },
        "pot1": { x: 462.75, y: 83.75 },
        "r1": { x: 451.5, y: 58.75 },
        "led1": { x: 496.5, y: 43.75 }
      },
      concept: "Conversione ADC-Volt, float, formula proporzionale",
      layer: "schema",

      buildSteps: [
        {
          step: 1,
          text: "Prendi il potenziometro da 10k\u03A9 e posizionalo nei fori H22, H23, H24",
          componentId: "pot1",
          componentType: "potentiometer",
          targetPins: { "pot1:vcc": "bb1:h22", "pot1:signal": "bb1:h23", "pot1:gnd": "bb1:h24" },
          hint: "Stesso circuito dell'Es. 7.1. Stavolta convertiamo in Volt!"
        },
        {
          step: 2,
          text: "Collega un filo ROSSO dal foro F22 al binario + (5V)",
          wireFrom: "bb1:f22",
          wireTo: "bb1:bus-bot-plus-22",
          wireColor: "red",
          hint: "VCC del potenziometro al 5V."
        },
        {
          step: 3,
          text: "Collega un filo GIALLO dal pin A0 dell'Arduino al foro F23",
          wireFrom: "nano1:W_A0",
          wireTo: "bb1:f23",
          wireColor: "yellow",
          hint: "Segnale del potenziometro ad A0."
        },
        {
          step: 4,
          text: "Collega un filo NERO dal foro F24 al binario GND (-)",
          wireFrom: "bb1:f24",
          wireTo: "bb1:bus-bot-minus-24",
          wireColor: "black",
          hint: "GND del potenziometro a massa."
        },
        {
          step: 5,
          text: "Prendi il resistore R1 (470\u03A9) e posizionalo nei fori C18 e C25",
          componentId: "r1",
          componentType: "resistor",
          targetPins: { "r1:pin1": "bb1:c18", "r1:pin2": "bb1:c25" },
          hint: "R1 protegge il LED."
        },
        {
          step: 6,
          text: "Prendi il LED rosso e mettilo nei fori D27 e D28. L'anodo (+) in D27!",
          componentId: "led1",
          componentType: "led",
          targetPins: { "led1:anode": "bb1:d27", "led1:cathode": "bb1:d28" },
          hint: "Il LED si accende sopra 2.5V (meta di 5V). La formula converte in Volt!"
        },
        {
          step: 7,
          text: "Collega un filo VERDE dal foro D25 al foro D27 (ponte R1 al LED)",
          wireFrom: "bb1:d25",
          wireTo: "bb1:d27",
          wireColor: "green",
          hint: "Collega il resistore al LED."
        },
        {
          step: 8,
          text: "Collega un filo ARANCIONE dal pin D13 dell'Arduino al foro A18",
          wireFrom: "nano1:W_D13",
          wireTo: "bb1:a18",
          wireColor: "orange",
          hint: "D13 controlla il LED."
        },
        {
          step: 9,
          text: "Collega un filo NERO dal foro A28 al binario GND (-)",
          wireFrom: "bb1:a28",
          wireTo: "bb1:bus-bot-minus-28",
          wireColor: "black",
          hint: "Catodo del LED verso massa."
        },
        {
          step: 10,
          text: "Collega un filo NERO dal pin GND dell'Arduino al binario GND (-)",
          wireFrom: "nano1:GND_R",
          wireTo: "bb1:bus-bot-minus-1",
          wireColor: "black",
          hint: "Massa dell'Arduino."
        },
        {
          step: 11,
          text: "Collega un filo ROSSO dal pin 5V al binario +. Ora ragioniamo in Volt!",
          wireFrom: "nano1:5V",
          wireTo: "bb1:bus-bot-plus-1",
          wireColor: "red",
          hint: "La formula (valore * 5.0) / 1023 converte il numero in Volt reali."
        }
      ],
      scratchXml: ANALOG_VOLTAGE_SCRATCH,
      steps: [
        "Usa lo stesso circuito dell'Es. 7.1 (potenziometro + LED).",
        "Nel codice, la variabile float tensione converte il valore 0-1023 in Volt 0-5V.",
        "Apri il Serial Monitor per vedere la tensione in tempo reale (aggiungi Serial.println)."
      ],
      observe: "Il LED si accende sopra 2.5V (meta di 5V). La formula (valore * 5.0) / 1023 converte il numero grezzo in Volt reali. E la stessa cosa dell'Es. 7.1 ma ora ragioniamo in Volt!",
      unlimPrompt: "Sei Galileo, il tutor AI di ELAB. Lo studente sta convertendo valori analogici in Volt. La formula e semplice: (valore * 5.0) / 1023. Il 5.0 e la tensione massima, 1023 e il valore massimo dell'ADC. float serve perche i Volt hanno i decimali! Rispondi in italiano.",
      quiz: [
        {
          question: "Se analogRead restituisce 512, quanti Volt corrispondono circa?",
          options: ["Circa 1 Volt", "Circa 2.5 Volt", "Circa 5 Volt"],
          correct: 1,
          explanation: "La formula e (512 * 5.0) / 1023 = circa 2.5V. Il valore 512 e circa la meta di 1023, quindi la tensione e circa la meta di 5V!"
        },
        {
          question: "Perche usiamo il tipo float invece di int per la variabile tensione?",
          options: ["Perche float e piu veloce di int", "Perche la tensione ha i decimali (es. 2.5V) e int puo contenere solo numeri interi", "Perche Arduino non accetta int per i calcoli"],
          correct: 1,
          explanation: "int contiene solo numeri interi (1, 2, 3...), ma la tensione puo essere 2.5V o 3.7V. float permette di memorizzare numeri con la virgola!"
        }
      ]
    },
    {
      id: "v3-cap7-esp3",
      title: "Cap. 7 Esp. 3 - Trimmer controlla 3 LED",
      desc: "Il trimmer controlla 3 LED diversi! Poco girato = LED 1, a meta = LED 2, tutto girato = LED 3. Dividiamo il range 0-1023 in 3 zone.",
      chapter: "Capitolo 7 - I pin analogici",
      difficulty: 2,
      icon: "\u{1F6A6}",
      simulationMode: "avr",
      components: [
        { type: "breadboard-half", id: "bb1" },
        { type: "nano-r4", id: "nano1" },
// © Andrea Marro — 09/04/2026 — ELAB Tutor — Tutti i diritti riservati
        { type: "potentiometer", id: "pot1", value: 10000 },
        { type: "resistor", id: "r1", value: 470 },
        { type: "resistor", id: "r2", value: 470 },
        { type: "resistor", id: "r3", value: 470 },
        { type: "led", id: "led1", color: "red" },
        { type: "led", id: "led2", color: "yellow" },
        { type: "led", id: "led3", color: "green" }
      ],
      connections: [
        { from: "bb1:f22", to: "bb1:bus-bot-plus-22", color: "red" },
        { from: "nano1:W_A0", to: "bb1:f23", color: "yellow" },
        { from: "bb1:f24", to: "bb1:bus-bot-minus-24", color: "black" },
        { from: "nano1:W_D3", to: "bb1:a16", color: "red" },
        { from: "bb1:d23", to: "bb1:d25", color: "green" },
        { from: "bb1:a26", to: "bb1:bus-bot-minus-26", color: "black" },
        { from: "nano1:W_D5", to: "bb1:a22", color: "green" },
        { from: "bb1:a30", to: "bb1:bus-bot-minus-30", color: "black" },
        { from: "nano1:W_D6", to: "bb1:f16", color: "yellow" },
        { from: "bb1:h23", to: "bb1:h30", color: "green" },
        { from: "bb1:f29", to: "bb1:bus-bot-minus-29", color: "black" },
        { from: "nano1:GND_R", to: "bb1:bus-bot-minus-1", color: "black" },
        { from: "nano1:5V", to: "bb1:bus-bot-plus-1", color: "red" }
      ],
      pinAssignments: {
        "pot1:vcc": "bb1:h22", "pot1:signal": "bb1:h23", "pot1:gnd": "bb1:h24",
        "r1:pin1": "bb1:b16", "r1:pin2": "bb1:b23",
        "led1:anode": "bb1:d25", "led1:cathode": "bb1:d26",
        "r2:pin1": "bb1:e22", "r2:pin2": "bb1:e29",
        "led2:anode": "bb1:d29", "led2:cathode": "bb1:d30",
        "r3:pin1": "bb1:i16", "r3:pin2": "bb1:i23",
        "led3:anode": "bb1:h30", "led3:cathode": "bb1:h29"
      },
      code: `// Trimmer controlla 3 LED — intervalli
// A0 = trimmer, pin 3/5/6 = LED

void setup() {
  pinMode(A0, INPUT);
  pinMode(3, OUTPUT);
  pinMode(5, OUTPUT);
  pinMode(6, OUTPUT);
}

void loop() {
  int valoreLetto = analogRead(A0);
  if ((valoreLetto >= 0) && (valoreLetto < 341)) {
    digitalWrite(3, HIGH); digitalWrite(5, LOW); digitalWrite(6, LOW);
  } else if ((valoreLetto >= 341) && (valoreLetto < 682)) {
// © Andrea Marro — 10/04/2026 — ELAB Tutor — Tutti i diritti riservati
    digitalWrite(3, LOW); digitalWrite(5, HIGH); digitalWrite(6, LOW);
  } else {
    digitalWrite(3, LOW); digitalWrite(5, LOW); digitalWrite(6, HIGH);
  }
}`,
      layout: {
        "nano1": { x: 230, y: 10, parentId: "bb1" },
        "bb1": { x: 280, y: 10 },
        "pot1": { x: 462.75, y: 83.75 },
        "r1": { x: 436.5, y: 51.25 },
        "r2": { x: 481.5, y: 73.75 },
        "r3": { x: 436.5, y: 113.75 },
        "led1": { x: 481.5, y: 43.75 },
        "led2": { x: 511.5, y: 43.75 },
        "led3": { x: 519, y: 83.75 }
      },
      concept: "Intervalli, if-else if-else, range analogico diviso in zone",
      layer: "schema",

      buildSteps: [
        {
          step: 1,
          text: "Prendi il potenziometro da 10k\u03A9 e posizionalo nei fori H22, H23, H24",
          componentId: "pot1",
          componentType: "potentiometer",
          targetPins: { "pot1:vcc": "bb1:h22", "pot1:signal": "bb1:h23", "pot1:gnd": "bb1:h24" },
          hint: "Il trimmer controlla quale dei 3 LED si accende."
        },
        {
          step: 2,
          text: "Collega un filo ROSSO dal foro F22 al binario + (5V)",
          wireFrom: "bb1:f22",
          wireTo: "bb1:bus-bot-plus-22",
          wireColor: "red",
          hint: "VCC del potenziometro al 5V."
        },
        {
          step: 3,
          text: "Collega un filo GIALLO dal pin A0 dell'Arduino al foro F23",
          wireFrom: "nano1:W_A0",
          wireTo: "bb1:f23",
          wireColor: "yellow",
          hint: "Segnale del potenziometro ad A0."
        },
        {
          step: 4,
          text: "Collega un filo NERO dal foro F24 al binario GND (-)",
          wireFrom: "bb1:f24",
          wireTo: "bb1:bus-bot-minus-24",
          wireColor: "black",
          hint: "GND del potenziometro a massa."
        },
        {
          step: 5,
          text: "Prendi il resistore R1 (470\u03A9) e posizionalo nei fori B16 e B23 - circuito rosso",
          componentId: "r1",
          componentType: "resistor",
          targetPins: { "r1:pin1": "bb1:b16", "r1:pin2": "bb1:b23" },
          hint: "R1 protegge il LED rosso."
        },
        {
          step: 6,
          text: "Prendi il LED rosso e mettilo nei fori D25 e D26. L'anodo (+) in D25!",
          componentId: "led1",
          componentType: "led",
          targetPins: { "led1:anode": "bb1:d25", "led1:cathode": "bb1:d26" },
          hint: "Primo LED: si accende quando il trimmer e nella zona bassa (0-340)."
        },
        {
          step: 7,
          text: "Collega un filo VERDE dal foro D23 al foro D25 (ponte R1 al LED rosso)",
          wireFrom: "bb1:d23",
          wireTo: "bb1:d25",
          wireColor: "green",
          hint: "Collega il resistore al LED rosso."
        },
        {
          step: 8,
          text: "Prendi il resistore R2 (470\u03A9) e posizionalo nei fori E22 e E29 - circuito giallo",
          componentId: "r2",
          componentType: "resistor",
          targetPins: { "r2:pin1": "bb1:e22", "r2:pin2": "bb1:e29" },
          hint: "R2 protegge il LED giallo."
        },
        {
          step: 9,
          text: "Prendi il LED giallo e mettilo nei fori D29 e D30. L'anodo (+) in D29!",
          componentId: "led2",
          componentType: "led",
          targetPins: { "led2:anode": "bb1:d29", "led2:cathode": "bb1:d30" },
          hint: "Secondo LED: si accende nella zona media (341-681)."
        },
        {
          step: 10,
          text: "Prendi il resistore R3 (470\u03A9) e posizionalo nei fori I16 e I23 - circuito verde",
          componentId: "r3",
          componentType: "resistor",
          targetPins: { "r3:pin1": "bb1:i16", "r3:pin2": "bb1:i23" },
          hint: "R3 protegge il LED verde."
        },
        {
          step: 11,
          text: "Prendi il LED verde e mettilo nei fori H30 e H29. L'anodo (+) in H30!",
          componentId: "led3",
          componentType: "led",
          targetPins: { "led3:anode": "bb1:h30", "led3:cathode": "bb1:h29" },
          hint: "Terzo LED: si accende nella zona alta (682-1023)."
        },
        {
          step: 12,
          text: "Collega un filo VERDE dal foro H23 al foro H30 (ponte R3 al LED verde)",
          wireFrom: "bb1:h23",
          wireTo: "bb1:h30",
          wireColor: "green",
          hint: "Collega il resistore al LED verde."
        },
        {
          step: 13,
          text: "Collega un filo ROSSO dal pin D3 dell'Arduino al foro A16",
          wireFrom: "nano1:W_D3",
          wireTo: "bb1:a16",
          wireColor: "red",
          hint: "D3 controlla il LED rosso."
        },
        {
          step: 14,
          text: "Collega un filo NERO dal foro A26 al binario GND (-) - catodo rosso",
          wireFrom: "bb1:a26",
          wireTo: "bb1:bus-bot-minus-26",
          wireColor: "black",
          hint: "Catodo del LED rosso verso massa."
        },
        {
          step: 15,
          text: "Collega un filo VERDE dal pin D5 dell'Arduino al foro A22",
          wireFrom: "nano1:W_D5",
          wireTo: "bb1:a22",
          wireColor: "green",
          hint: "D5 controlla il LED giallo."
        },
        {
          step: 16,
          text: "Collega un filo NERO dal foro A30 al binario GND (-) - catodo giallo",
          wireFrom: "bb1:a30",
          wireTo: "bb1:bus-bot-minus-30",
          wireColor: "black",
          hint: "Catodo del LED giallo verso massa."
        },
        {
          step: 17,
          text: "Collega un filo GIALLO dal pin D6 dell'Arduino al foro F16",
          wireFrom: "nano1:W_D6",
          wireTo: "bb1:f16",
// © Andrea Marro — 09/04/2026 — ELAB Tutor — Tutti i diritti riservati
          wireColor: "yellow",
          hint: "D6 controlla il LED verde."
        },
        {
          step: 18,
          text: "Collega un filo NERO dal foro F29 al binario GND (-) - catodo verde",
          wireFrom: "bb1:f29",
          wireTo: "bb1:bus-bot-minus-29",
          wireColor: "black",
          hint: "Catodo del LED verde verso massa."
        },
        {
          step: 19,
          text: "Collega un filo NERO dal pin GND dell'Arduino al binario GND (-)",
          wireFrom: "nano1:GND_R",
          wireTo: "bb1:bus-bot-minus-1",
          wireColor: "black",
          hint: "Massa dell'Arduino."
        },
        {
          step: 20,
          text: "Collega un filo ROSSO dal pin 5V al binario +. Gira il trimmer per cambiare LED!",
          wireFrom: "nano1:5V",
          wireTo: "bb1:bus-bot-plus-1",
          wireColor: "red",
          hint: "Il range 0-1023 e diviso in 3 zone. Ogni zona accende un LED diverso!"
        }
      ],
      scratchXml: ANALOG_3LED_SCRATCH,
      steps: [
        "Collega il potenziometro ad A0 come prima.",
        "Collega 3 LED con resistori ai pin 3, 5 e 6.",
        "Carica il codice e gira il trimmer: vedrai accendersi un LED alla volta in base alla posizione!"
      ],
      observe: "Il range 0-1023 e diviso in 3 zone uguali: 0-340 accende il primo LED, 341-681 il secondo, 682-1023 il terzo. Girando il trimmer passi da un LED all'altro!",
      unlimPrompt: "Sei Galileo, il tutor AI di ELAB. Lo studente sta dividendo il range analogico in 3 intervalli. 1023/3 = 341, quindi: zona 1 (0-340), zona 2 (341-681), zona 3 (682-1023). if-else if-else e come un semaforo con 3 condizioni. Rispondi in italiano.",
      quiz: [
        {
          question: "Perche dividiamo il range 0-1023 in 3 zone uguali?",
          options: ["Perche Arduino ha solo 3 pin", "Perche abbiamo 3 LED e vogliamo che ognuno si accenda in una porzione del trimmer", "Perche il trimmer ha solo 3 posizioni"],
          correct: 1,
          explanation: "Dividiamo 1024 valori in 3 zone (circa 341 valori ciascuna) cosi ogni LED corrisponde a un terzo della rotazione del trimmer. E come dividere una torta in 3 fette uguali!"
        },
        {
          question: "Se il valore letto dal trimmer e 500, quale LED si accende?",
          options: ["Il primo LED (pin 3)", "Il secondo LED (pin 5)", "Il terzo LED (pin 6)"],
          correct: 1,
          explanation: "500 e compreso tra 341 e 681, quindi cade nella seconda zona. Il codice entra nell'else if e accende il pin 5 (secondo LED)!"
        }
      ]
    },
    {
      id: "v3-cap7-esp4",
      title: "Cap. 7 Esp. 4 - analogWrite (PWM fade)",
      desc: "Facciamo crescere la luminosita del LED gradualmente! analogWrite non e analogico vero, ma usa il PWM (Pulse Width Modulation) per simulare valori intermedi.",
      chapter: "Capitolo 7 - I pin analogici",
      difficulty: 2,
      icon: "\u{1F31F}",
      simulationMode: "avr",
      components: [
        { type: "breadboard-half", id: "bb1" },
        { type: "nano-r4", id: "nano1" },
        { type: "resistor", id: "r1", value: 470 },
        { type: "led", id: "led1", color: "red" }
      ],
      connections: [
        { from: "nano1:W_D5", to: "bb1:a18", color: "green" },
        { from: "bb1:d25", to: "bb1:d27", color: "green" },
        { from: "bb1:a28", to: "bb1:bus-bot-minus-28", color: "black" },
        { from: "nano1:GND_R", to: "bb1:bus-bot-minus-1", color: "black" },
        { from: "nano1:5V", to: "bb1:bus-bot-plus-1", color: "red" }
      ],
      pinAssignments: {
        "r1:pin1": "bb1:c18", "r1:pin2": "bb1:c25",
        "led1:anode": "bb1:d27", "led1:cathode": "bb1:d28"
      },
      code: `// PWM fade up — luminosita crescente
// Pin 5 = LED (deve essere un pin PWM: 3, 5, 6, 9, 10, 11)

void setup() { pinMode(5, OUTPUT); }

void loop() {
  for (int i = 0; i <= 255; i = i + 5) {
    analogWrite(5, i);
    delay(10);
  }
}`,
      layout: {
        "nano1": { x: 230, y: 10, parentId: "bb1" },
        "bb1": { x: 280, y: 10 },
        "r1": { x: 451.5, y: 58.75 },
        "led1": { x: 496.5, y: 43.75 }
      },
      concept: "analogWrite, PWM, for loop, luminosita graduale",
      layer: "schema",

      buildSteps: [
        {
          step: 1,
          text: "Prendi il resistore R1 (470\u03A9) e posizionalo nei fori C18 e C25",
          componentId: "r1",
          componentType: "resistor",
          targetPins: { "r1:pin1": "bb1:c18", "r1:pin2": "bb1:c25" },
          hint: "R1 protegge il LED. Il pin 5 supporta il PWM!"
        },
        {
          step: 2,
          text: "Prendi il LED rosso e mettilo nei fori D27 e D28. L'anodo (+) in D27!",
          componentId: "led1",
          componentType: "led",
          targetPins: { "led1:anode": "bb1:d27", "led1:cathode": "bb1:d28" },
          hint: "Con PWM il LED si accendera gradualmente, come un'alba!"
        },
        {
          step: 3,
          text: "Collega un filo VERDE dal foro D25 al foro D27 (ponte R1 al LED)",
          wireFrom: "bb1:d25",
          wireTo: "bb1:d27",
          wireColor: "green",
          hint: "Collega il resistore al LED."
        },
        {
          step: 4,
          text: "Collega un filo VERDE dal pin D5 dell'Arduino al foro A18",
          wireFrom: "nano1:W_D5",
          wireTo: "bb1:a18",
          wireColor: "green",
          hint: "D5 e un pin PWM (~). analogWrite funziona solo su pin PWM!"
        },
        {
          step: 5,
          text: "Collega un filo NERO dal foro A28 al binario GND (-)",
          wireFrom: "bb1:a28",
          wireTo: "bb1:bus-bot-minus-28",
          wireColor: "black",
          hint: "Catodo del LED verso massa."
        },
        {
          step: 6,
          text: "Collega un filo NERO dal pin GND dell'Arduino al binario GND (-)",
          wireFrom: "nano1:GND_R",
          wireTo: "bb1:bus-bot-minus-1",
          wireColor: "black",
          hint: "Massa dell'Arduino."
        },
        {
          step: 7,
          text: "Collega un filo ROSSO dal pin 5V al binario +. Il LED si accende gradualmente!",
          wireFrom: "nano1:5V",
          wireTo: "bb1:bus-bot-plus-1",
          wireColor: "red",
          hint: "analogWrite(5, i) manda valori da 0 (spento) a 255 (pieno). E il PWM!"
        }
      ],
      scratchXml: PWM_FADE_UP_SCRATCH,
      steps: [
        "Collega un LED con resistore al pin 5 (deve essere un pin PWM!).",
        "Il for loop parte da 0 e arriva a 255, aumentando di 5 ogni volta.",
        "Carica e osserva: il LED si accende gradualmente come un'alba!"
      ],
      observe: "Il LED si accende piano piano, da spento a piena luminosita. analogWrite(5, i) manda un valore PWM da 0 (spento) a 255 (pieno). Il delay(10) rallenta l'effetto perche possiamo vederlo!",
      unlimPrompt: "Sei Galileo, il tutor AI di ELAB. Lo studente sta usando analogWrite e PWM per la prima volta. Spiega che PWM accende e spegne il LED velocissimamente: 0=sempre spento, 128=acceso meta del tempo, 255=sempre acceso. L'occhio vede una luminosita media! Solo i pin con ~ funzionano (3,5,6,9,10,11). Rispondi in italiano.",
      quiz: [
        {
          question: "Cosa significa analogWrite(5, 128)?",
          options: ["Accende il LED sul pin 5 alla massima luminosita", "Imposta il LED sul pin 5 a circa meta luminosita", "Legge il valore analogico del pin 5"],
          correct: 1,
          explanation: "analogWrite con valore 128 (meta di 255) fa lampeggiare il LED cosi velocemente che l'occhio vede circa il 50% di luminosita. E il PWM: Pulse Width Modulation!"
        },
        {
          question: "Quali pin di Arduino supportano il PWM (analogWrite)?",
          options: ["Tutti i pin da 0 a 13", "Solo i pin contrassegnati con ~ cioe 3, 5, 6, 9, 10, 11", "Solo i pin analogici A0-A5"],
          correct: 1,
          explanation: "Solo i pin con il simbolo ~ (tilde) supportano PWM: sono i pin 3, 5, 6, 9, 10 e 11. Se provi analogWrite su un altro pin non funziona correttamente!"
        }
      ]
    },
    {
      id: "v3-cap7-esp5",
      title: "Cap. 7 Esp. 5 - PWM con valori manuali",
      desc: "Proviamo valori PWM specifici per capire la relazione tra numero e luminosita. 0 = spento, 64 = debole, 128 = meta, 255 = massimo.",
      chapter: "Capitolo 7 - I pin analogici",
      difficulty: 1,
      icon: "\u{1F4A1}",
      simulationMode: "avr",
      components: [
        { type: "breadboard-half", id: "bb1" },
        { type: "nano-r4", id: "nano1" },
        { type: "resistor", id: "r1", value: 470 },
        { type: "led", id: "led1", color: "red" }
      ],
      connections: [
        { from: "nano1:W_D5", to: "bb1:a18", color: "green" },
        { from: "bb1:d25", to: "bb1:d27", color: "green" },
        { from: "bb1:a28", to: "bb1:bus-bot-minus-28", color: "black" },
        { from: "nano1:GND_R", to: "bb1:bus-bot-minus-1", color: "black" },
        { from: "nano1:5V", to: "bb1:bus-bot-plus-1", color: "red" }
      ],
      pinAssignments: {
        "r1:pin1": "bb1:c18", "r1:pin2": "bb1:c25",
        "led1:anode": "bb1:d27", "led1:cathode": "bb1:d28"
      },
// © Andrea Marro — 09/04/2026 — ELAB Tutor — Tutti i diritti riservati
      code: `// PWM con valori manuali — prova a cambiare i numeri!
// Pin 5 = LED PWM

void setup() { pinMode(5, OUTPUT); }

void loop() {
  analogWrite(5, 0);    // spento
  delay(1000);
  analogWrite(5, 64);   // luminosita bassa
  delay(1000);
  analogWrite(5, 128);  // luminosita media
  delay(1000);
  analogWrite(5, 255);  // luminosita massima
  delay(1000);
}`,
      layout: {
        "nano1": { x: 230, y: 10, parentId: "bb1" },
        "bb1": { x: 280, y: 10 },
        "r1": { x: 451.5, y: 58.75 },
        "led1": { x: 496.5, y: 43.75 }
      },
      concept: "Valori PWM discreti, relazione numero-luminosita",
      layer: "schema",

      buildSteps: [
        {
          step: 1,
          text: "Prendi il resistore R1 (470\u03A9) e posizionalo nei fori C18 e C25",
          componentId: "r1",
          componentType: "resistor",
          targetPins: { "r1:pin1": "bb1:c18", "r1:pin2": "bb1:c25" },
          hint: "Stesso circuito dell'Es. 7.4. Stavolta testiamo valori PWM specifici."
        },
        {
          step: 2,
          text: "Prendi il LED rosso e mettilo nei fori D27 e D28. L'anodo (+) in D27!",
          componentId: "led1",
          componentType: "led",
          targetPins: { "led1:anode": "bb1:d27", "led1:cathode": "bb1:d28" },
          hint: "Vedrai 4 livelli di luminosita: 0, 64, 128, 255."
        },
        {
          step: 3,
          text: "Collega un filo VERDE dal foro D25 al foro D27 (ponte R1 al LED)",
          wireFrom: "bb1:d25",
          wireTo: "bb1:d27",
          wireColor: "green",
          hint: "Collega il resistore al LED."
        },
        {
          step: 4,
          text: "Collega un filo VERDE dal pin D5 dell'Arduino al foro A18",
          wireFrom: "nano1:W_D5",
          wireTo: "bb1:a18",
          wireColor: "green",
          hint: "D5 e un pin PWM. Prova a cambiare i valori nel codice!"
        },
        {
          step: 5,
          text: "Collega un filo NERO dal foro A28 al binario GND (-)",
          wireFrom: "bb1:a28",
          wireTo: "bb1:bus-bot-minus-28",
          wireColor: "black",
          hint: "Catodo del LED verso massa."
        },
        {
          step: 6,
          text: "Collega un filo NERO dal pin GND dell'Arduino al binario GND (-)",
          wireFrom: "nano1:GND_R",
          wireTo: "bb1:bus-bot-minus-1",
          wireColor: "black",
          hint: "Massa dell'Arduino."
        },
        {
          step: 7,
          text: "Collega un filo ROSSO dal pin 5V al binario +. Osserva i 4 livelli di luminosita!",
          wireFrom: "nano1:5V",
          wireTo: "bb1:bus-bot-plus-1",
          wireColor: "red",
          hint: "0 = spento, 64 = debole, 128 = meta, 255 = massimo. E un dimmer digitale!"
        }
      ],
      scratchXml: PWM_MANUAL_SCRATCH,
      steps: [
        "Usa lo stesso circuito dell'Es. 7.4 (LED su pin PWM).",
        "Il codice mostra 4 livelli di luminosita in sequenza.",
        "Modifica i numeri dentro analogWrite per sperimentare! Cosa succede con 10? E con 200?"
      ],
      observe: "Il LED mostra 4 livelli di luminosita chiaramente diversi, da spento a piena potenza. 0-255 sono 256 possibili livelli: e come avere un dimmer digitale!",
      unlimPrompt: "Sei Galileo, il tutor AI di ELAB. Lo studente sta esplorando i valori PWM manualmente. Incoraggialo a sperimentare: cosa succede con analogWrite(5, 1)? Si vede appena! E con 250 vs 255? Quasi nessuna differenza. La percezione umana non e lineare! Rispondi in italiano.",
      quiz: [
        {
          question: "Qual e il valore massimo che puoi usare con analogWrite?",
          options: ["1023", "255", "100"],
          correct: 1,
          explanation: "analogWrite usa 8 bit, quindi i valori vanno da 0 (spento) a 255 (massima potenza). Sono 256 livelli possibili di luminosita!"
        },
        {
          question: "Se scrivi analogWrite(5, 0), cosa succede al LED?",
          options: ["Si accende al massimo", "Resta completamente spento", "Si accende a meta luminosita"],
          correct: 1,
          explanation: "Il valore 0 significa duty cycle 0%: il pin non manda mai corrente, quindi il LED resta completamente spento. E l'opposto di 255 che lo tiene sempre acceso!"
        }
      ]
    },
    {
      id: "v3-cap7-esp6",
      title: "Cap. 7 Esp. 6 - Fade up/down con for",
      desc: "Il LED si accende gradualmente e poi si spegne gradualmente, all'infinito! Due cicli for: uno che sale da 0 a 255 e uno che scende da 255 a 0.",
      chapter: "Capitolo 7 - I pin analogici",
      difficulty: 2,
      icon: "\u{1F4AB}",
      simulationMode: "avr",
      components: [
        { type: "breadboard-half", id: "bb1" },
        { type: "nano-r4", id: "nano1" },
        { type: "resistor", id: "r1", value: 470 },
        { type: "led", id: "led1", color: "red" }
      ],
      connections: [
        { from: "nano1:W_D5", to: "bb1:a18", color: "green" },
        { from: "bb1:d25", to: "bb1:d27", color: "green" },
        { from: "bb1:a28", to: "bb1:bus-bot-minus-28", color: "black" },
        { from: "nano1:GND_R", to: "bb1:bus-bot-minus-1", color: "black" },
        { from: "nano1:5V", to: "bb1:bus-bot-plus-1", color: "red" }
      ],
// © Andrea Marro — 10/04/2026 — ELAB Tutor — Tutti i diritti riservati
      pinAssignments: {
        "r1:pin1": "bb1:c18", "r1:pin2": "bb1:c25",
        "led1:anode": "bb1:d27", "led1:cathode": "bb1:d28"
      },
      code: `// Fade up e down — respiro di luce
// Pin 5 = LED PWM

void setup() { pinMode(5, OUTPUT); }

void loop() {
  for (int i = 0; i <= 255; i = i + 5) { analogWrite(5, i); delay(10); }
  for (int i = 255; i >= 0; i = i - 5) { analogWrite(5, i); delay(10); }
}`,
      layout: {
        "nano1": { x: 230, y: 10, parentId: "bb1" },
        "bb1": { x: 280, y: 10 },
        "r1": { x: 451.5, y: 58.75 },
        "led1": { x: 496.5, y: 43.75 }
      },
      concept: "Due cicli for, fade up e down, effetto respiro",
      layer: "schema",

      buildSteps: [
        {
          step: 1,
          text: "Prendi il resistore R1 (470\u03A9) e posizionalo nei fori C18 e C25",
          componentId: "r1",
          componentType: "resistor",
          targetPins: { "r1:pin1": "bb1:c18", "r1:pin2": "bb1:c25" },
          hint: "Stesso circuito. Il fade up/down crea un effetto respiro!"
        },
        {
          step: 2,
          text: "Prendi il LED rosso e mettilo nei fori D27 e D28. L'anodo (+) in D27!",
          componentId: "led1",
          componentType: "led",
          targetPins: { "led1:anode": "bb1:d27", "led1:cathode": "bb1:d28" },
          hint: "Il LED crescera e calera di luminosita come un respiro."
        },
        {
          step: 3,
          text: "Collega un filo VERDE dal foro D25 al foro D27 (ponte R1 al LED)",
          wireFrom: "bb1:d25",
          wireTo: "bb1:d27",
          wireColor: "green",
          hint: "Collega il resistore al LED."
        },
        {
          step: 4,
          text: "Collega un filo VERDE dal pin D5 dell'Arduino al foro A18",
          wireFrom: "nano1:W_D5",
          wireTo: "bb1:a18",
          wireColor: "green",
          hint: "D5 e un pin PWM per l'effetto fade."
        },
        {
          step: 5,
          text: "Collega un filo NERO dal foro A28 al binario GND (-)",
          wireFrom: "bb1:a28",
          wireTo: "bb1:bus-bot-minus-28",
          wireColor: "black",
          hint: "Catodo del LED verso massa."
        },
        {
          step: 6,
          text: "Collega un filo NERO dal pin GND dell'Arduino al binario GND (-)",
          wireFrom: "nano1:GND_R",
          wireTo: "bb1:bus-bot-minus-1",
          wireColor: "black",
          hint: "Massa dell'Arduino."
        },
        {
          step: 7,
          text: "Collega un filo ROSSO dal pin 5V al binario +. Guarda il respiro di luce!",
          wireFrom: "nano1:5V",
// © Andrea Marro — 09/04/2026 — ELAB Tutor — Tutti i diritti riservati
          wireTo: "bb1:bus-bot-plus-1",
          wireColor: "red",
          hint: "Due for: uno sale (0 a 255) e uno scende (255 a 0). Effetto ipnotico!"
        }
      ],
      scratchXml: PWM_FADE_UPDOWN_SCRATCH,
      steps: [
        "Usa lo stesso circuito dell'Es. 7.4 (LED su pin 5).",
        "Il primo for sale (i va da 0 a 255), il secondo scende (i va da 255 a 0).",
        "L'effetto e un respiro continuo: luce che cresce e decresce!"
      ],
      observe: "Il LED fa un bellissimo effetto respiro: si accende piano, raggiunge il massimo, e poi si spegne piano. I due for lavorano in sequenza, uno dopo l'altro, all'infinito nel loop!",
      unlimPrompt: "Sei Galileo, il tutor AI di ELAB. Lo studente sta facendo il fade up/down. Spiega che i due for sono speculari: il primo sale (i = i + 5) e il secondo scende (i = i - 5). Insieme creano un ciclo continuo. Si puo cambiare la velocita modificando delay o il passo (5). Rispondi in italiano.",
      quiz: [
        {
          question: "Perche servono DUE cicli for per l'effetto respiro?",
          options: ["Perche un solo for non funziona su Arduino", "Uno fa salire la luminosita da 0 a 255, l'altro la fa scendere da 255 a 0", "Perche il LED ha bisogno di due cicli per accendersi"],
          correct: 1,
          explanation: "Il primo for aumenta i da 0 a 255 (fade up), il secondo diminuisce i da 255 a 0 (fade down). Insieme creano il ciclo sale-scende che sembra un respiro!"
        },
        {
          question: "Come puoi rendere l'effetto respiro piu lento?",
          options: ["Aumentando il valore del delay nel for", "Usando un LED piu grande", "Togliendo il secondo for"],
          correct: 0,
          explanation: "Aumentando delay(10) a delay(30) o delay(50), ogni passo della luminosita dura piu a lungo e l'effetto diventa piu lento e rilassante. Puoi anche diminuire il passo da 5 a 1!"
        }
      ]
    },
    {
      id: "v3-cap7-esp7",
      title: "Cap. 7 Esp. 7 - Trimmer controlla luminosita",
      desc: "Il trimmer controlla la luminosita del LED in tempo reale! Usiamo map() per convertire il range 0-1023 del trimmer nel range 0-255 del PWM.",
      chapter: "Capitolo 7 - I pin analogici",
      difficulty: 2,
      icon: "\u{1F39B}",
      simulationMode: "avr",
      components: [
        { type: "breadboard-half", id: "bb1" },
        { type: "nano-r4", id: "nano1" },
        { type: "potentiometer", id: "pot1", value: 10000 },
        { type: "resistor", id: "r1", value: 470 },
        { type: "led", id: "led1", color: "red" }
      ],
      connections: [
        { from: "bb1:f22", to: "bb1:bus-bot-plus-22", color: "red" },
        { from: "nano1:W_A0", to: "bb1:f23", color: "yellow" },
        { from: "bb1:f24", to: "bb1:bus-bot-minus-24", color: "black" },
        { from: "nano1:W_D5", to: "bb1:a18", color: "green" },
        { from: "bb1:d25", to: "bb1:d27", color: "green" },
        { from: "bb1:a28", to: "bb1:bus-bot-minus-28", color: "black" },
        { from: "nano1:GND_R", to: "bb1:bus-bot-minus-1", color: "black" },
        { from: "nano1:5V", to: "bb1:bus-bot-plus-1", color: "red" }
      ],
      pinAssignments: {
        "pot1:vcc": "bb1:h22", "pot1:signal": "bb1:h23", "pot1:gnd": "bb1:h24",
        "r1:pin1": "bb1:c18", "r1:pin2": "bb1:c25",
        "led1:anode": "bb1:d27", "led1:cathode": "bb1:d28"
      },
      code: `// Trimmer controlla luminosita LED con map()
// A0 = trimmer, Pin 5 = LED PWM

void setup() {
  pinMode(5, OUTPUT);
  pinMode(A0, INPUT);
}

void loop() {
  int valoreLetto = analogRead(A0);
  int valorePWM = map(valoreLetto, 0, 1023, 0, 255);
  analogWrite(5, valorePWM);
}`,
      layout: {
        "nano1": { x: 230, y: 10, parentId: "bb1" },
        "bb1": { x: 280, y: 10 },
        "pot1": { x: 462.75, y: 83.75 },
        "r1": { x: 451.5, y: 58.75 },
        "led1": { x: 496.5, y: 43.75 }
      },
      concept: "map(), conversione range, trimmer come controller, analogRead+analogWrite",
      layer: "schema",

      buildSteps: [
        {
          step: 1,
          text: "Prendi il potenziometro da 10k\u03A9 e posizionalo nei fori H22, H23, H24",
          componentId: "pot1",
          componentType: "potentiometer",
          targetPins: { "pot1:vcc": "bb1:h22", "pot1:signal": "bb1:h23", "pot1:gnd": "bb1:h24" },
          hint: "Il trimmer controlla la luminosita del LED in tempo reale!"
        },
        {
          step: 2,
          text: "Collega un filo ROSSO dal foro F22 al binario + (5V)",
          wireFrom: "bb1:f22",
          wireTo: "bb1:bus-bot-plus-22",
          wireColor: "red",
          hint: "VCC del potenziometro al 5V."
        },
        {
          step: 3,
          text: "Collega un filo GIALLO dal pin A0 dell'Arduino al foro F23",
          wireFrom: "nano1:W_A0",
          wireTo: "bb1:f23",
          wireColor: "yellow",
          hint: "Segnale del potenziometro ad A0."
        },
        {
          step: 4,
          text: "Collega un filo NERO dal foro F24 al binario GND (-)",
          wireFrom: "bb1:f24",
          wireTo: "bb1:bus-bot-minus-24",
          wireColor: "black",
          hint: "GND del potenziometro a massa."
        },
        {
          step: 5,
          text: "Prendi il resistore R1 (470\u03A9) e posizionalo nei fori C18 e C25",
          componentId: "r1",
          componentType: "resistor",
          targetPins: { "r1:pin1": "bb1:c18", "r1:pin2": "bb1:c25" },
          hint: "R1 protegge il LED."
        },
        {
          step: 6,
          text: "Prendi il LED rosso e mettilo nei fori D27 e D28. L'anodo (+) in D27!",
          componentId: "led1",
          componentType: "led",
          targetPins: { "led1:anode": "bb1:d27", "led1:cathode": "bb1:d28" },
          hint: "La luminosita cambiera con la posizione del trimmer. E un dimmer!"
        },
        {
          step: 7,
          text: "Collega un filo VERDE dal foro D25 al foro D27 (ponte R1 al LED)",
          wireFrom: "bb1:d25",
          wireTo: "bb1:d27",
          wireColor: "green",
          hint: "Collega il resistore al LED."
        },
        {
          step: 8,
          text: "Collega un filo VERDE dal pin D5 dell'Arduino al foro A18",
          wireFrom: "nano1:W_D5",
          wireTo: "bb1:a18",
          wireColor: "green",
          hint: "D5 e un pin PWM. map() converte 0-1023 in 0-255."
        },
        {
          step: 9,
          text: "Collega un filo NERO dal foro A28 al binario GND (-)",
          wireFrom: "bb1:a28",
          wireTo: "bb1:bus-bot-minus-28",
          wireColor: "black",
          hint: "Catodo del LED verso massa."
        },
        {
          step: 10,
          text: "Collega un filo NERO dal pin GND dell'Arduino al binario GND (-)",
          wireFrom: "nano1:GND_R",
          wireTo: "bb1:bus-bot-minus-1",
          wireColor: "black",
          hint: "Massa dell'Arduino."
        },
        {
          step: 11,
          text: "Collega un filo ROSSO dal pin 5V al binario +. Gira e controlla la luminosita!",
          wireFrom: "nano1:5V",
          wireTo: "bb1:bus-bot-plus-1",
          wireColor: "red",
          hint: "map(valore, 0, 1023, 0, 255) converte la lettura del trimmer in PWM!"
        }
      ],
      scratchXml: TRIMMER_PWM_MAP_SCRATCH,
      steps: [
        "Collega il potenziometro ad A0 e un LED con resistore al pin 5.",
        "La funzione map() converte il range del trimmer (0-1023) in quello del PWM (0-255).",
        "Gira il trimmer e controlla la luminosita del LED come un dimmer!"
      ],
      observe: "Girando il potenziometro da un estremo all'altro, il LED passa da spento a piena luminosita in modo fluido. La funzione map() fa la conversione automatica: non serve fare calcoli a mano!",
      unlimPrompt: "Sei Galileo, il tutor AI di ELAB. Lo studente sta usando map() per collegare trimmer e LED. map(valore, 0, 1023, 0, 255) converte proporzionalmente: se il trimmer e a meta (511), il PWM sara circa 127. E come tradurre da una scala all'altra! Rispondi in italiano.",
      quiz: [
        {
          question: "Cosa fa map(valoreLetto, 0, 1023, 0, 255)?",
          options: ["Limita il valore tra 0 e 255", "Converte proporzionalmente un valore dal range 0-1023 al range 0-255", "Moltiplica il valore per 255"],
          correct: 1,
          explanation: "map() prende un valore da un range (0-1023) e lo trasforma nello stesso punto di un altro range (0-255). Se il valore e a meta del primo range, sara a meta anche del secondo!"
        },
        {
          question: "Perche non possiamo passare direttamente il valore di analogRead a analogWrite?",
          options: ["Perche analogRead restituisce valori 0-1023 ma analogWrite accetta solo 0-255", "Perche i pin analogici e PWM sono diversi fisicamente", "Si puo fare, non serve map()"],
          correct: 0,
          explanation: "analogRead legge 10 bit (0-1023) ma analogWrite usa 8 bit (0-255). Se passi 1023 a analogWrite, non funziona correttamente perche supera il massimo! map() risolve questo problema."
        }
      ]
    },
    {
      id: "v3-cap7-esp8",
      title: "Cap. 7 Esp. 8 - DAC reale (10 bit)",
      desc: "Il Nano R4 ha un vero DAC (Digital-to-Analog Converter) sul pin A0! Con analogWriteResolution(10) possiamo scrivere valori da 0 a 1023 con uscita analogica vera, non PWM.",
      chapter: "Capitolo 7 - I pin analogici",
      difficulty: 3,
      icon: "\u{1F52C}",
      simulationMode: "avr",
// © Andrea Marro — 09/04/2026 — ELAB Tutor — Tutti i diritti riservati
      components: [
        { type: "breadboard-half", id: "bb1" },
        { type: "nano-r4", id: "nano1" },
        { type: "potentiometer", id: "pot1", value: 10000 }
      ],
      connections: [
        { from: "bb1:f22", to: "bb1:bus-bot-plus-22", color: "red" },
        { from: "nano1:W_A1", to: "bb1:f23", color: "yellow" },
        { from: "bb1:f24", to: "bb1:bus-bot-minus-24", color: "black" },
        { from: "nano1:GND_R", to: "bb1:bus-bot-minus-1", color: "black" },
        { from: "nano1:5V", to: "bb1:bus-bot-plus-1", color: "red" }
      ],
      pinAssignments: {
        "pot1:vcc": "bb1:h22", "pot1:signal": "bb1:h23", "pot1:gnd": "bb1:h24"
      },
      code: `// DAC reale — uscita analogica vera a 10 bit
// A0 = uscita DAC, A1 = ingresso trimmer

void setup() {
  pinMode(A0, OUTPUT);
  analogWriteResolution(10);
  pinMode(A1, INPUT);
}

void loop() {
  int valoreLetto = analogRead(A1);
  analogWrite(A0, valoreLetto);
}`,
      layout: {
        "nano1": { x: 230, y: 10, parentId: "bb1" },
        "bb1": { x: 280, y: 10 },
        "pot1": { x: 462.75, y: 83.75 }
      },
      concept: "DAC, analogWriteResolution, 10 bit vs 8 bit, uscita analogica vera",
      layer: "schema",

      buildSteps: [
        {
          step: 1,
          text: "Prendi il potenziometro da 10k\u03A9 e posizionalo nei fori H22, H23, H24",
          componentId: "pot1",
          componentType: "potentiometer",
          targetPins: { "pot1:vcc": "bb1:h22", "pot1:signal": "bb1:h23", "pot1:gnd": "bb1:h24" },
          hint: "Il trimmer e collegato ad A1 (ingresso). A0 sara l'uscita DAC!"
        },
        {
          step: 2,
          text: "Collega un filo ROSSO dal foro F22 al binario + (5V)",
          wireFrom: "bb1:f22",
          wireTo: "bb1:bus-bot-plus-22",
          wireColor: "red",
          hint: "VCC del potenziometro al 5V."
        },
        {
          step: 3,
          text: "Collega un filo GIALLO dal pin A1 dell'Arduino al foro F23",
          wireFrom: "nano1:W_A1",
          wireTo: "bb1:f23",
          wireColor: "yellow",
          hint: "A1 legge il trimmer. A0 e riservato per l'uscita DAC!"
        },
        {
          step: 4,
          text: "Collega un filo NERO dal foro F24 al binario GND (-)",
          wireFrom: "bb1:f24",
          wireTo: "bb1:bus-bot-minus-24",
          wireColor: "black",
          hint: "GND del potenziometro a massa."
        },
        {
          step: 5,
          text: "Collega un filo NERO dal pin GND dell'Arduino al binario GND (-)",
          wireFrom: "nano1:GND_R",
          wireTo: "bb1:bus-bot-minus-1",
          wireColor: "black",
          hint: "Massa dell'Arduino."
        },
        {
          step: 6,
          text: "Collega un filo ROSSO dal pin 5V al binario +. Il DAC produce tensione vera!",
          wireFrom: "nano1:5V",
          wireTo: "bb1:bus-bot-plus-1",
          wireColor: "red",
          hint: "analogWriteResolution(10) usa 1024 livelli. DAC e diverso dal PWM: tensione continua!"
        }
      ],
      scratchXml: DAC_SCRATCH,
      steps: [
        "Collega il trimmer al pin A1 (ingresso).",
        "Il pin A0 e configurato come uscita DAC a 10 bit.",
        "analogWriteResolution(10) cambia la risoluzione da 8 bit (0-255) a 10 bit (0-1023)."
      ],
      observe: "Il valore letto dal trimmer su A1 viene copiato direttamente sull'uscita A0. A differenza del PWM, il DAC produce una tensione vera e continua! Con un multimetro si puo misurare.",
      unlimPrompt: "Sei Galileo, il tutor AI di ELAB. Lo studente sta usando il DAC del Nano R4. Spiega la differenza: PWM accende/spegne velocemente (onda quadra), DAC produce una tensione VERA e continua. analogWriteResolution(10) usa 10 bit = 1024 livelli (0-1023), molto piu fine degli 8 bit standard (0-255). Rispondi in italiano.",
      quiz: [
        {
          question: "Qual e la differenza principale tra PWM e DAC?",
          options: ["Il PWM e piu preciso del DAC", "Il DAC produce una tensione continua vera, il PWM accende e spegne rapidamente", "Non c'e nessuna differenza"],
          correct: 1,
          explanation: "Il PWM alterna rapidamente ON e OFF (onda quadra) e l'occhio vede una media. Il DAC invece produce una tensione analogica vera e continua, come una batteria regolabile!"
        },
        {
          question: "Cosa fa analogWriteResolution(10)?",
          options: ["Imposta la velocita del DAC a 10 MHz", "Cambia la risoluzione da 8 bit (0-255) a 10 bit (0-1023)", "Attiva 10 pin analogici"],
          correct: 1,
          explanation: "Di default analogWrite usa 8 bit (256 livelli). Con analogWriteResolution(10) passiamo a 10 bit = 1024 livelli, 4 volte piu preciso! Il Nano R4 lo supporta grazie al DAC integrato."
        }
      ]
    },

    // ═══════════════════════════════════════════════════
    // CAPITOLO 8 — Comunicazione Seriale (5 esperimenti)
    // ═══════════════════════════════════════════════════
    {
      id: "v3-cap8-esp1",
      title: "Cap. 8 Esp. 1 - Serial.println in setup",
      desc: "Il primo messaggio da Arduino al computer! Scriviamo 'Ciao dal Team di ELAB!' una sola volta nel setup, e lo vediamo apparire nel Serial Monitor.",
      chapter: "Capitolo 8 - Comunicazione Seriale",
      difficulty: 1,
      icon: "\u{1F4AC}",
      simulationMode: "avr",
      components: [
        { type: "breadboard-half", id: "bb1" },
        { type: "nano-r4", id: "nano1" }
// © Andrea Marro — 10/04/2026 — ELAB Tutor — Tutti i diritti riservati
      ],
      connections: [],
      code: `// Serial println in setup — messaggio singolo
// Apri il Serial Monitor per vedere il messaggio!

void setup() {
  Serial.begin(9600);
  while (!Serial);
  Serial.println("Ciao dal Team di ELAB!");
}

void loop() { }`,
      layout: {
        "nano1": { x: 230, y: 10, parentId: "bb1" },
        "bb1": { x: 280, y: 10 }
      },
      concept: "Serial.begin, Serial.println, Serial Monitor, comunicazione USB",
      layer: "schema",

      buildSteps: [
        {
          step: 1,
          text: "Posiziona l'Arduino Nano sulla breadboard. Non servono componenti esterni!",
          componentId: "nano1",
          componentType: "nano-r4",
          targetPins: {},
          hint: "Basta il cavo USB. Il Serial Monitor riceve i messaggi da Arduino."
        }
      ],
      scratchXml: SERIAL_SETUP_SCRATCH,
      steps: [
        "Non serve nessun componente esterno: basta il cavo USB!",
        "Serial.begin(9600) avvia la comunicazione a 9600 baud.",
        "Apri il Serial Monitor e vedrai il messaggio apparire una sola volta."
      ],
      observe: "Nel Serial Monitor appare una sola volta 'Ciao dal Team di ELAB!'. Perche? Perche Serial.println e nel setup(), che si esegue UNA SOLA VOLTA all'accensione. Il loop() e vuoto!",
      unlimPrompt: "Sei Galileo, il tutor AI di ELAB. Lo studente sta usando Serial per la prima volta! Serial e come un tubo che collega Arduino al computer via USB. Serial.begin(9600) apre il tubo a velocita 9600. while(!Serial) aspetta che il tubo sia pronto. println stampa una riga. Rispondi in italiano.",
      quiz: [
        {
          question: "Perche il messaggio appare una sola volta nel Serial Monitor?",
          options: ["Perche Serial.println puo stampare solo un messaggio", "Perche il codice e nel setup() che si esegue una sola volta all'accensione", "Perche il Serial Monitor si chiude dopo un messaggio"],
          correct: 1,
          explanation: "setup() viene eseguito UNA SOLA VOLTA quando Arduino si accende. Il loop() e vuoto, quindi dopo il messaggio il programma non fa piu niente!"
        },
        {
          question: "Cosa succede se dimentichi Serial.begin(9600)?",
          options: ["Il messaggio appare lo stesso", "Non appare niente nel Serial Monitor perche la comunicazione non e stata avviata", "Arduino si resetta"],
          correct: 1,
          explanation: "Serial.begin() apre il canale di comunicazione. Senza questa istruzione, Arduino non sa che deve parlare con il computer e println non manda nulla!"
        }
      ]
    },
    {
      id: "v3-cap8-esp2",
      title: "Cap. 8 Esp. 2 - Serial.println in loop",
      desc: "Ora il messaggio si ripete all'infinito! Spostando Serial.println nel loop(), Arduino scrive il messaggio continuamente. Attenzione: senza delay va velocissimo!",
      chapter: "Capitolo 8 - Comunicazione Seriale",
      difficulty: 1,
      icon: "\u{1F501}",
      simulationMode: "avr",
      components: [
        { type: "breadboard-half", id: "bb1" },
        { type: "nano-r4", id: "nano1" }
      ],
      connections: [],
      code: `// Serial println in loop — messaggio ripetuto
// Apri il Serial Monitor e osserva il flusso!

void setup() { Serial.begin(9600); while (!Serial); }

void loop() { Serial.println("Ciao dal Team di ELAB!"); }`,
      layout: {
        "nano1": { x: 230, y: 10, parentId: "bb1" },
        "bb1": { x: 280, y: 10 }
      },
      concept: "Differenza setup vs loop, flusso continuo, velocita seriale",
      layer: "schema",

// © Andrea Marro — 09/04/2026 — ELAB Tutor — Tutti i diritti riservati
      buildSteps: [
        {
          step: 1,
          text: "Posiziona l'Arduino Nano sulla breadboard. Non servono componenti esterni!",
          componentId: "nano1",
          componentType: "nano-r4",
          targetPins: {},
          hint: "Stesso circuito dell'Es. 8.1. La differenza e nel codice: println e nel loop!"
        }
      ],
      scratchXml: SERIAL_LOOP_SCRATCH,
      steps: [
        "Il codice e quasi identico all'Es. 8.1, ma println e nel loop() invece che nel setup().",
        "Carica e apri il Serial Monitor: il messaggio appare continuamente!",
        "Prova ad aggiungere delay(1000) nel loop per rallentare."
      ],
      observe: "Il Serial Monitor si riempie di messaggi velocissimamente! Senza delay, Arduino stampa migliaia di righe al secondo. Aggiungendo delay(1000) il messaggio appare una volta al secondo.",
      unlimPrompt: "Sei Galileo, il tutor AI di ELAB. Lo studente sta confrontando setup vs loop per Serial. Spiega che il loop si ripete all'infinito: senza delay, Arduino e molto veloce e stampa tantissimo. Questo e utile per leggere sensori in tempo reale! Rispondi in italiano.",
      quiz: [
        {
          question: "Qual e la differenza tra mettere Serial.println nel setup() o nel loop()?",
          options: ["Nessuna differenza", "Nel setup si esegue una volta sola, nel loop si ripete all'infinito", "Nel setup stampa piu veloce"],
          correct: 1,
          explanation: "Il setup() si esegue UNA SOLA VOLTA all'accensione. Il loop() si ripete all'infinito. Mettendo println nel loop, il messaggio viene stampato continuamente!"
        },
        {
          question: "Cosa succede se aggiungi delay(1000) nel loop dopo Serial.println?",
          options: ["Il messaggio appare una volta al secondo invece che migliaia di volte", "Arduino si blocca", "Non cambia niente"],
          correct: 0,
          explanation: "delay(1000) fa aspettare 1 secondo tra un println e il successivo. Senza delay, Arduino stampa migliaia di messaggi al secondo perche il loop e velocissimo!"
        }
      ]
    },
    {
      id: "v3-cap8-esp3",
      title: "Cap. 8 Esp. 3 - analogRead + Serial Monitor",
      desc: "Leggi il valore del potenziometro su A0 e stampalo sul Serial Monitor! Valori 0-1023.",
      chapter: "Capitolo 8 - Comunicazione Seriale",
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
      // Same pot layout as cap8-pot
      // vcc col 22 → 5V bus, signal col 23 → A0, gnd col 24 → GND bus
      layout: {
        "nano1": { x: 230, y: 10, parentId: "bb1" },
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
      unlimPrompt: "Sei Galileo, il tutor AI di ELAB. Lo studente sta guardando l'esperimento 'analogRead + Serial Monitor' del Volume 3 — Arduino Programmato. Questo è il primo esperimento con i pin analogici E il Serial Monitor! Il codice usa Serial.begin(9600) nel setup per aprire la comunicazione seriale. Nel loop(), analogRead(A0) legge il valore del potenziometro come un numero da 0 a 1023 (ADC a 10 bit), poi Serial.println(valore) lo stampa sul monitor. Il delay(200) evita di stampare troppo velocemente. È come un termometro digitale che legge la temperatura e la mostra sullo schermo! Spiega il codice riga per riga in modo semplice, usando analogie adatte a bambini di 8-12 anni. Rispondi in italiano.",
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
      hexFile: "/hex/v3-cap8-esp3.hex",
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
// © Andrea Marro — 10/04/2026 — ELAB Tutor — Tutti i diritti riservati
          label: "Apri l'editor blocchi",
          description: "Programmiamo la lettura analogica! Apri l'editor e vai sulla tab Blocchi.",
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
    {
      id: "v3-cap8-esp4",
      title: "Cap. 8 Esp. 4 - Serial Plotter con 2 pot",
      desc: "Due potenziometri collegati ai pin A3 e A4, con i valori stampati nel formato giusto per il Serial Plotter di Arduino IDE. Si vedono due grafici in tempo reale!",
      chapter: "Capitolo 8 - Comunicazione Seriale",
      difficulty: 2,
      icon: "\u{1F4C8}",
      simulationMode: "avr",
      components: [
        { type: "breadboard-half", id: "bb1" },
        { type: "nano-r4", id: "nano1" },
        { type: "potentiometer", id: "pot1", value: 10000 },
        { type: "potentiometer", id: "pot2", value: 10000 }
      ],
      connections: [
        { from: "bb1:f22", to: "bb1:bus-bot-plus-22", color: "red" },
        { from: "nano1:W_A3", to: "bb1:f23", color: "yellow" },
        { from: "bb1:f24", to: "bb1:bus-bot-minus-24", color: "black" },
// © Andrea Marro — 09/04/2026 — ELAB Tutor — Tutti i diritti riservati
        { from: "bb1:f27", to: "bb1:bus-bot-plus-27", color: "red" },
        { from: "nano1:W_A4", to: "bb1:f28", color: "orange" },
        { from: "bb1:f29", to: "bb1:bus-bot-minus-29", color: "black" },
        { from: "nano1:GND_R", to: "bb1:bus-bot-minus-1", color: "black" },
        { from: "nano1:5V", to: "bb1:bus-bot-plus-1", color: "red" }
      ],
      pinAssignments: {
        "pot1:vcc": "bb1:h22", "pot1:signal": "bb1:h23", "pot1:gnd": "bb1:h24",
        "pot2:vcc": "bb1:h27", "pot2:signal": "bb1:h28", "pot2:gnd": "bb1:h29"
      },
      code: `// Serial Plotter con 2 potenziometri
// A3 e A4 = trimmer, formato per Serial Plotter

void setup() {
  pinMode(A3, INPUT);
  pinMode(A4, INPUT);
  Serial.begin(9600);
  while (!Serial);
}

void loop() {
  int valoreA3 = analogRead(A3);
  int valoreA4 = analogRead(A4);
  Serial.print("A3:"); Serial.print(valoreA3);
  Serial.print(" ");
  Serial.print("A4:"); Serial.println(valoreA4);
  delay(100);
}`,
      layout: {
        "nano1": { x: 230, y: 10, parentId: "bb1" },
        "bb1": { x: 280, y: 10 },
        "pot1": { x: 462.75, y: 83.75 },
        "pot2": { x: 500.25, y: 83.75 }
      },
      concept: "Serial Plotter, formato label:valore, grafici in tempo reale, 2 canali",
      layer: "schema",

      buildSteps: [
        {
          step: 1,
          text: "Prendi il primo potenziometro (POT1) e posizionalo nei fori H22, H23, H24",
          componentId: "pot1",
          componentType: "potentiometer",
          targetPins: { "pot1:vcc": "bb1:h22", "pot1:signal": "bb1:h23", "pot1:gnd": "bb1:h24" },
          hint: "Il primo potenziometro va sul pin A3."
        },
        {
          step: 2,
          text: "Prendi il secondo potenziometro (POT2) e posizionalo nei fori H27, H28, H29",
          componentId: "pot2",
          componentType: "potentiometer",
          targetPins: { "pot2:vcc": "bb1:h27", "pot2:signal": "bb1:h28", "pot2:gnd": "bb1:h29" },
          hint: "Il secondo potenziometro va sul pin A4."
        },
        {
          step: 3,
          text: "Collega un filo ROSSO dal foro F22 al binario + (5V) - VCC POT1",
          wireFrom: "bb1:f22",
          wireTo: "bb1:bus-bot-plus-22",
          wireColor: "red",
          hint: "VCC del primo potenziometro al 5V."
        },
        {
          step: 4,
          text: "Collega un filo GIALLO dal pin A3 dell'Arduino al foro F23",
          wireFrom: "nano1:W_A3",
          wireTo: "bb1:f23",
          wireColor: "yellow",
          hint: "Segnale del primo potenziometro ad A3."
        },
        {
          step: 5,
          text: "Collega un filo NERO dal foro F24 al binario GND (-) - GND POT1",
          wireFrom: "bb1:f24",
          wireTo: "bb1:bus-bot-minus-24",
          wireColor: "black",
          hint: "GND del primo potenziometro a massa."
        },
        {
          step: 6,
          text: "Collega un filo ROSSO dal foro F27 al binario + (5V) - VCC POT2",
          wireFrom: "bb1:f27",
          wireTo: "bb1:bus-bot-plus-27",
          wireColor: "red",
          hint: "VCC del secondo potenziometro al 5V."
        },
        {
          step: 7,
          text: "Collega un filo ARANCIONE dal pin A4 dell'Arduino al foro F28",
          wireFrom: "nano1:W_A4",
          wireTo: "bb1:f28",
          wireColor: "orange",
          hint: "Segnale del secondo potenziometro ad A4."
        },
        {
          step: 8,
          text: "Collega un filo NERO dal foro F29 al binario GND (-) - GND POT2",
          wireFrom: "bb1:f29",
          wireTo: "bb1:bus-bot-minus-29",
          wireColor: "black",
          hint: "GND del secondo potenziometro a massa."
        },
        {
          step: 9,
          text: "Collega un filo NERO dal pin GND dell'Arduino al binario GND (-)",
          wireFrom: "nano1:GND_R",
          wireTo: "bb1:bus-bot-minus-1",
          wireColor: "black",
          hint: "Massa dell'Arduino."
        },
        {
          step: 10,
          text: "Collega un filo ROSSO dal pin 5V al binario +. Apri il Serial Plotter!",
          wireFrom: "nano1:5V",
          wireTo: "bb1:bus-bot-plus-1",
          wireColor: "red",
          hint: "Due grafici colorati in tempo reale! Gira le manopole per muovere le linee."
        }
      ],
      scratchXml: SERIAL_PLOTTER_SCRATCH,
      steps: [
        "Collega due potenziometri: uno ad A3 e uno ad A4.",
        "Il formato 'etichetta:valore spazio etichetta:valore' e quello richiesto dal Serial Plotter.",
        "In Arduino IDE, apri il Serial Plotter (non il Monitor!) e vedrai due linee colorate."
      ],
      observe: "Nel Serial Plotter si vedono due grafici colorati che si muovono in tempo reale quando giri i potenziometri. Il formato A3:valore A4:valore crea automaticamente la legenda!",
      unlimPrompt: "Sei Galileo, il tutor AI di ELAB. Lo studente sta usando il Serial Plotter con 2 potenziometri. Il formato e importante: 'etichetta:valore spazio etichetta:valore' con println alla fine. Il Plotter crea automaticamente un grafico con 2 linee colorate. delay(100) campiona 10 volte al secondo. Rispondi in italiano.",
      quiz: [
        {
          question: "Qual e il formato corretto per stampare 2 valori sul Serial Plotter?",
          options: ["Serial.println(valoreA3 + valoreA4)", "Etichetta:valore spazio etichetta:valore con println alla fine", "Bisogna stampare un valore per riga"],
          correct: 1,
          explanation: "Il Serial Plotter riconosce il formato 'A3:123 A4:456' con println a fine riga. Lo spazio separa i diversi canali e crea una linea colorata per ciascuno nel grafico!"
        },
        {
          question: "Qual e la differenza tra Serial Monitor e Serial Plotter?",
          options: ["Il Monitor mostra numeri come testo, il Plotter li mostra come grafico in tempo reale", "Il Plotter e piu veloce del Monitor", "Non c'e differenza, sono la stessa cosa"],
          correct: 0,
          explanation: "Il Serial Monitor mostra i dati come testo scorrevole. Il Serial Plotter trasforma i numeri in un grafico che scorre in tempo reale: molto piu intuitivo per capire come cambiano i valori!"
        }
      ]
    },
    {
      id: "v3-cap8-esp5",
      title: "Cap. 8 Esp. 5 - Pot + 3 LED + Serial",
      desc: "Combiniamo tutto! Un potenziometro controlla 3 LED E stampa i valori sul Serial Monitor. E il progetto finale del Volume 3!",
      chapter: "Capitolo 8 - Comunicazione Seriale",
      difficulty: 3,
      icon: "\u{1F3C6}",
      simulationMode: "avr",
      components: [
        { type: "breadboard-half", id: "bb1" },
        { type: "nano-r4", id: "nano1" },
        { type: "potentiometer", id: "pot1", value: 10000 },
        { type: "resistor", id: "r1", value: 470 },
        { type: "resistor", id: "r2", value: 470 },
        { type: "resistor", id: "r3", value: 470 },
        { type: "led", id: "led1", color: "red" },
        { type: "led", id: "led2", color: "yellow" },
        { type: "led", id: "led3", color: "green" }
      ],
      connections: [
        { from: "bb1:f22", to: "bb1:bus-bot-plus-22", color: "red" },
        { from: "nano1:W_A3", to: "bb1:f23", color: "yellow" },
        { from: "bb1:f24", to: "bb1:bus-bot-minus-24", color: "black" },
        { from: "nano1:W_D12", to: "bb1:a16", color: "red" },
        { from: "bb1:d23", to: "bb1:d25", color: "green" },
        { from: "bb1:a26", to: "bb1:bus-bot-minus-26", color: "black" },
        { from: "nano1:W_D11", to: "bb1:a22", color: "yellow" },
        { from: "bb1:a30", to: "bb1:bus-bot-minus-30", color: "black" },
        { from: "nano1:W_D10", to: "bb1:f16", color: "green" },
        { from: "bb1:h23", to: "bb1:h30", color: "green" },
        { from: "bb1:f29", to: "bb1:bus-bot-minus-29", color: "black" },
        { from: "nano1:GND_R", to: "bb1:bus-bot-minus-1", color: "black" },
        { from: "nano1:5V", to: "bb1:bus-bot-plus-1", color: "red" }
      ],
      pinAssignments: {
        "pot1:vcc": "bb1:h22", "pot1:signal": "bb1:h23", "pot1:gnd": "bb1:h24",
        "r1:pin1": "bb1:b16", "r1:pin2": "bb1:b23",
        "led1:anode": "bb1:d25", "led1:cathode": "bb1:d26",
        "r2:pin1": "bb1:e22", "r2:pin2": "bb1:e29",
        "led2:anode": "bb1:d29", "led2:cathode": "bb1:d30",
        "r3:pin1": "bb1:i16", "r3:pin2": "bb1:i23",
        "led3:anode": "bb1:h30", "led3:cathode": "bb1:h29"
      },
      code: `// Pot + 3 LED + Serial — progetto finale!
// A3 = trimmer, pin 12/11/10 = LED

void setup() {
  pinMode(A3, INPUT);
  pinMode(12, OUTPUT);
  pinMode(11, OUTPUT);
  pinMode(10, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  int valore = analogRead(A3);
  Serial.print("Valore: "); Serial.println(valore);
  Serial.print("pot:"); Serial.println(valore);
  if (valore < 300) {
// © Andrea Marro — 09/04/2026 — ELAB Tutor — Tutti i diritti riservati
    digitalWrite(12, HIGH); digitalWrite(11, LOW); digitalWrite(10, LOW);
  } else if (valore < 700) {
    digitalWrite(12, LOW); digitalWrite(11, HIGH); digitalWrite(10, LOW);
  } else {
    digitalWrite(12, LOW); digitalWrite(11, LOW); digitalWrite(10, HIGH);
  }
  delay(100);
}`,
      layout: {
        "nano1": { x: 230, y: 10, parentId: "bb1" },
        "bb1": { x: 280, y: 10 },
        "pot1": { x: 462.75, y: 83.75 },
        "r1": { x: 436.5, y: 51.25 },
        "r2": { x: 481.5, y: 73.75 },
        "r3": { x: 436.5, y: 113.75 },
        "led1": { x: 481.5, y: 43.75 },
        "led2": { x: 511.5, y: 43.75 },
        "led3": { x: 519, y: 83.75 }
      },
      concept: "Progetto combinato, analogRead + digitalOutput + Serial, intervalli",
      layer: "schema",

      buildSteps: [
        {
          step: 1,
          text: "Prendi il potenziometro da 10k\u03A9 e posizionalo nei fori H22, H23, H24",
          componentId: "pot1",
          componentType: "potentiometer",
          targetPins: { "pot1:vcc": "bb1:h22", "pot1:signal": "bb1:h23", "pot1:gnd": "bb1:h24" },
          hint: "Il trimmer controlla 3 LED E stampa i valori sul Serial Monitor!"
        },
        {
          step: 2,
          text: "Collega un filo ROSSO dal foro F22 al binario + (5V)",
          wireFrom: "bb1:f22",
          wireTo: "bb1:bus-bot-plus-22",
          wireColor: "red",
          hint: "VCC del potenziometro al 5V."
        },
        {
          step: 3,
          text: "Collega un filo GIALLO dal pin A3 dell'Arduino al foro F23",
          wireFrom: "nano1:W_A3",
          wireTo: "bb1:f23",
          wireColor: "yellow",
          hint: "Segnale del potenziometro ad A3."
        },
        {
          step: 4,
          text: "Collega un filo NERO dal foro F24 al binario GND (-)",
          wireFrom: "bb1:f24",
          wireTo: "bb1:bus-bot-minus-24",
          wireColor: "black",
          hint: "GND del potenziometro a massa."
        },
        {
          step: 5,
          text: "Prendi il resistore R1 (470\u03A9) e posizionalo nei fori B16 e B23 - LED rosso",
          componentId: "r1",
          componentType: "resistor",
          targetPins: { "r1:pin1": "bb1:b16", "r1:pin2": "bb1:b23" },
          hint: "R1 protegge il LED rosso (pin D12)."
        },
        {
          step: 6,
          text: "Prendi il LED rosso e mettilo nei fori D25 e D26. L'anodo (+) in D25!",
          componentId: "led1",
          componentType: "led",
          targetPins: { "led1:anode": "bb1:d25", "led1:cathode": "bb1:d26" },
          hint: "Primo LED: si accende sotto il valore 300."
        },
        {
          step: 7,
          text: "Collega un filo VERDE dal foro D23 al foro D25 (ponte R1 al LED rosso)",
          wireFrom: "bb1:d23",
          wireTo: "bb1:d25",
          wireColor: "green",
          hint: "Collega il resistore al LED rosso."
        },
        {
          step: 8,
          text: "Prendi il resistore R2 (470\u03A9) e posizionalo nei fori E22 e E29 - LED giallo",
          componentId: "r2",
          componentType: "resistor",
          targetPins: { "r2:pin1": "bb1:e22", "r2:pin2": "bb1:e29" },
          hint: "R2 protegge il LED giallo (pin D11)."
        },
        {
          step: 9,
          text: "Prendi il LED giallo e mettilo nei fori D29 e D30. L'anodo (+) in D29!",
          componentId: "led2",
          componentType: "led",
          targetPins: { "led2:anode": "bb1:d29", "led2:cathode": "bb1:d30" },
          hint: "Secondo LED: si accende tra 300 e 700."
        },
        {
          step: 10,
          text: "Prendi il resistore R3 (470\u03A9) e posizionalo nei fori I16 e I23 - LED verde",
          componentId: "r3",
          componentType: "resistor",
          targetPins: { "r3:pin1": "bb1:i16", "r3:pin2": "bb1:i23" },
          hint: "R3 protegge il LED verde (pin D10)."
        },
        {
          step: 11,
          text: "Prendi il LED verde e mettilo nei fori H30 e H29. L'anodo (+) in H30!",
          componentId: "led3",
          componentType: "led",
          targetPins: { "led3:anode": "bb1:h30", "led3:cathode": "bb1:h29" },
          hint: "Terzo LED: si accende sopra 700."
        },
        {
          step: 12,
          text: "Collega un filo VERDE dal foro H23 al foro H30 (ponte R3 al LED verde)",
          wireFrom: "bb1:h23",
          wireTo: "bb1:h30",
          wireColor: "green",
          hint: "Collega il resistore al LED verde."
        },
        {
          step: 13,
          text: "Collega un filo ROSSO dal pin D12 dell'Arduino al foro A16",
          wireFrom: "nano1:W_D12",
          wireTo: "bb1:a16",
          wireColor: "red",
          hint: "D12 controlla il LED rosso."
        },
        {
          step: 14,
          text: "Collega un filo NERO dal foro A26 al binario GND (-) - catodo rosso",
          wireFrom: "bb1:a26",
          wireTo: "bb1:bus-bot-minus-26",
          wireColor: "black",
          hint: "Catodo del LED rosso verso massa."
        },
        {
          step: 15,
          text: "Collega un filo GIALLO dal pin D11 dell'Arduino al foro A22",
          wireFrom: "nano1:W_D11",
          wireTo: "bb1:a22",
          wireColor: "yellow",
          hint: "D11 controlla il LED giallo."
        },
        {
          step: 16,
          text: "Collega un filo NERO dal foro A30 al binario GND (-) - catodo giallo",
          wireFrom: "bb1:a30",
          wireTo: "bb1:bus-bot-minus-30",
          wireColor: "black",
          hint: "Catodo del LED giallo verso massa."
        },
        {
          step: 17,
          text: "Collega un filo VERDE dal pin D10 dell'Arduino al foro F16",
          wireFrom: "nano1:W_D10",
          wireTo: "bb1:f16",
          wireColor: "green",
          hint: "D10 controlla il LED verde."
        },
        {
          step: 18,
          text: "Collega un filo NERO dal foro F29 al binario GND (-) - catodo verde",
          wireFrom: "bb1:f29",
          wireTo: "bb1:bus-bot-minus-29",
          wireColor: "black",
          hint: "Catodo del LED verde verso massa."
        },
        {
          step: 19,
          text: "Collega un filo NERO dal pin GND dell'Arduino al binario GND (-)",
          wireFrom: "nano1:GND_R",
          wireTo: "bb1:bus-bot-minus-1",
          wireColor: "black",
          hint: "Massa dell'Arduino."
        },
        {
          step: 20,
          text: "Collega un filo ROSSO dal pin 5V al binario +. Apri il Serial Monitor e gira il trimmer!",
          wireFrom: "nano1:5V",
          wireTo: "bb1:bus-bot-plus-1",
          wireColor: "red",
          hint: "Progetto finale! Vedi i valori nel Serial Monitor E i LED cambiano in tempo reale!"
        }
      ],
      scratchXml: FINAL_PROJECT_SCRATCH,
      steps: [
        "Collega il potenziometro ad A3.",
        "Collega 3 LED con resistori ai pin 12, 11 e 10.",
// © Andrea Marro — 10/04/2026 — ELAB Tutor — Tutti i diritti riservati
        "Apri il Serial Monitor: vedrai i valori del trimmer mentre i LED cambiano!"
      ],
      observe: "Girando il trimmer si vedono i valori cambiare nel Serial Monitor E i LED si accendono in base alla zona: sotto 300 il primo, tra 300 e 700 il secondo, sopra 700 il terzo. Combina input analogico, output digitale e comunicazione seriale!",
      unlimPrompt: "Sei Galileo, il tutor AI di ELAB. Lo studente sta facendo il progetto finale del Volume 3! Combina analogRead (trimmer su A3), 3 LED digitali (pin 12, 11, 10) e Serial Monitor. E come un dashboard: vedi i numeri E il risultato sui LED. Congratulati per essere arrivato alla fine del volume! Rispondi in italiano.",
      quiz: [
        {
          question: "Perche stampiamo il valore del trimmer sul Serial Monitor?",
          options: ["Perche senza Serial il trimmer non funziona", "Per fare debug e vedere in tempo reale cosa legge Arduino", "Perche i LED hanno bisogno del Serial per accendersi"],
          correct: 1,
          explanation: "Il Serial Monitor e uno strumento di debug: ci permette di VEDERE i numeri che Arduino sta leggendo. I LED funzionerebbero anche senza Serial, ma non sapremmo i valori esatti!"
        },
        {
          question: "In questo progetto, cosa succede quando il valore del trimmer e tra 300 e 700?",
// © Andrea Marro — 09/04/2026 — ELAB Tutor — Tutti i diritti riservati
          options: ["Si accende il LED rosso (pin 12)", "Si accende il LED giallo (pin 11)", "Si accendono tutti e 3 i LED"],
          correct: 1,
          explanation: "Il codice usa if-else if-else con 3 zone: sotto 300 accende il pin 12, tra 300 e 700 accende il pin 11, sopra 700 accende il pin 10. Il LED giallo corrisponde alla zona centrale!"
        }
      ]
    },

    // ═══════════════════════════════════════════════════
    // EXTRA — Componenti avanzati (Servo, LCD, Simon)
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
        "nano1": { x: 230, y: 10, parentId: "bb1" },
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
      unlimPrompt: "Sei Galileo, il tutor AI di ELAB. Lo studente sta guardando l'esperimento 'LCD Hello World' — Extra. Questo esperimento mostra come usare un display LCD 16x2 con Arduino. Il display usa il protocollo HD44780 in modalità 4-bit: servono 6 pin (RS, E, D4-D7). La libreria LiquidCrystal semplifica tutto: lcd.begin(16,2) inizializza il display, lcd.setCursor(colonna, riga) posiziona il cursore, lcd.print() stampa il testo. Rispondi in italiano.",
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
      // S112: scratchXml = complete LCD Hello World program
      scratchXml: `<xml xmlns="https://developers.google.com/blockly/xml"><block type="arduino_base" x="40" y="30" deletable="false"><statement name="SETUP"><block type="arduino_lcd_init"><field name="RS">12</field><field name="E">11</field><field name="D4">5</field><field name="D5">10</field><field name="D6">3</field><field name="D7">6</field><field name="COLS">16</field><field name="ROWS">2</field><next><block type="arduino_lcd_set_cursor"><field name="COL">0</field><field name="ROW">0</field><next><block type="arduino_lcd_print"><value name="TEXT"><shadow type="text"><field name="TEXT">Hello World!</field></shadow></value><next><block type="arduino_lcd_set_cursor"><field name="COL">0</field><field name="ROW">1</field><next><block type="arduino_lcd_print"><value name="TEXT"><shadow type="text"><field name="TEXT">ELAB Simulator</field></shadow></value></block></next></block></next></block></next></block></next></block></statement></block></xml>`,
      // S111: LCD Blockly blocks — full Scratch support
      scratchSteps: [
        {
          label: "Inizializza LCD",
          description: "Trascina il blocco 'LCD Init' dalla categoria LCD Display nel Setup. I pin sono già impostati: RS=12, E=11, D4=5, D5=10, D6=3, D7=6.",
          explanation: "Il display LCD 16x2 usa il protocollo HD44780 in modalità 4-bit. Servono 6 pin: RS (Register Select) per distinguere dati/comandi, E (Enable) per validare i dati, e D4-D7 per i 4 bit di dati. lcd.begin(16,2) dice al display le sue dimensioni.",
          xml: `<xml xmlns="https://developers.google.com/blockly/xml"><block type="arduino_base" x="40" y="30" deletable="false"><statement name="SETUP"><block type="arduino_lcd_init"><field name="RS">12</field><field name="E">11</field><field name="D4">5</field><field name="D5">10</field><field name="D6">3</field><field name="D7">6</field><field name="COLS">16</field><field name="ROWS">2</field></block></statement></block></xml>`,
        },
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
// © Andrea Marro — 10/04/2026 — ELAB Tutor — Tutti i diritti riservati
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
// © Andrea Marro — 09/04/2026 — ELAB Tutor — Tutti i diritti riservati
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
        "nano1": { x: 130, y: 20, parentId: "bb1" },
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
      unlimPrompt: "Sei Galileo, il tutor AI di ELAB. Lo studente sta guardando l'esperimento 'Servo Sweep' — Extra. Un servomotore è un motore che può ruotare a un angolo preciso (da 0 a 180 gradi). La libreria Servo di Arduino semplifica il controllo: myServo.attach(9) collega il servo al pin 9, myServo.write(angolo) imposta l'angolo. Il codice usa due cicli for: uno da 0 a 180 e uno da 180 a 0, con delay(15) tra ogni grado per un movimento fluido. Rispondi in italiano.",
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
          description: "Programmiamo il servomotore! Apri l'editor e vai sulla tab Blocchi.",
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
      icon: null,
      simulationMode: "avr",
      hexFile: "/hex/v3-extra-simon.hex",
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
// © Andrea Marro — 10/04/2026 — ELAB Tutor — Tutti i diritti riservati
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
// © Andrea Marro — 09/04/2026 — ELAB Tutor — Tutti i diritti riservati
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
        "nano1": { x: 230, y: 10, parentId: "bb1" },
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
      unlimPrompt: "Questo esperimento implementa il gioco Simon Says con feedback sonoro. 4 LED colorati (rosso D9, verde D10, blu D11, giallo D12) + un cicalino piezo (D8) mostrano una sequenza di luci e suoni che si allunga ad ogni turno. Ogni colore ha la sua nota: rosso=Do(262Hz), verde=Mi(330Hz), blu=Sol(392Hz), giallo=Do alto(523Hz). 4 pulsanti (rosso D3, verde D5, blu D6, giallo D13) in INPUT_PULLUP permettono al giocatore di ripetere la sequenza. Un array seq[] memorizza fino a 100 elementi. La funzione accendi() usa tone() e noTone() per abbinare suono e luce. gameOver() suona un tono grave (150Hz) durante il lampeggio. Usa randomSeed(analogRead(A0)) per sequenze diverse ad ogni partita.",
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
// © Andrea Marro — 10/04/2026 — ELAB Tutor — Tutti i diritti riservati
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
// © Andrea Marro — 09/04/2026 — ELAB Tutor — Tutti i diritti riservati
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
// © Andrea Marro — 10/04/2026 — ELAB Tutor — Tutti i diritti riservati
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
// © Andrea Marro — 09/04/2026 — ELAB Tutor — Tutti i diritti riservati
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
          text: "Apri l'editor Scratch (tab Blocchi) e trascina il blocco 'Imposta pin 9 come USCITA' nel Setup — questo prepara il primo LED",
          hint: "Ogni LED ha bisogno del suo pinMode OUTPUT nel setup — ne servono 4 per i LED + 1 per il cicalino.",
          explanation: "Il Setup si esegue una sola volta all'accensione. Qui prepariamo i pin dicendo ad Arduino quali sono uscite (OUTPUT) e quali ingressi (INPUT_PULLUP)."
        },
        {
          step: 2,
          text: "Aggiungi 'Imposta pin 8 come USCITA' per il cicalino e 'Imposta pin 3 come INPUT_PULLUP' per il primo pulsante",
          hint: "Il cicalino (pin 8) è OUTPUT perché noi MANDIAMO il segnale. I pulsanti sono INPUT_PULLUP: Arduino legge se sono premuti.",
          explanation: "OUTPUT = Arduino manda corrente al componente. INPUT_PULLUP = Arduino legge lo stato del pulsante, con una resistenza interna che tiene il pin HIGH quando non premuto."
        },
        {
          step: 3,
          text: "Nel Loop, crea una variabile 'ledNum' e assegnale un 'Numero casuale tra 0 e 3' — questo sceglie quale LED accendere",
          hint: "Ogni numero corrisponde a un colore: 0=rosso, 1=verde, 2=blu, 3=giallo. random() genera sempre sequenze diverse!",
          explanation: "Le variabili sono come scatole con un nome: 'ledNum' contiene il numero del LED scelto. random(0,4) genera 0, 1, 2 o 3 (il 4 è escluso)."
        },
        {
          step: 4,
          text: "Aggiungi un blocco 'Se' che controlla: se ledNum = 0, allora 'Scrivi pin 9 HIGH' + 'Suona pin 8 freq 262'",
          hint: "262Hz è la nota Do — il suono del LED rosso. Ogni 'Se' accende un LED diverso con la sua nota.",
          explanation: "Il blocco 'Se' (if) controlla una condizione: se ledNum vale 0, esegue i blocchi dentro. Altrimenti li salta. Ogni LED ha la sua condizione e la sua nota musicale.",
          xml: SIMON_SCRATCH_STEP4
        },
        {
          step: 5,
          text: "Aggiungi altri 3 blocchi 'Se' per i LED verde (pin 10, 330Hz), blu (pin 11, 392Hz) e giallo (pin 12, 523Hz)",
          hint: "Le 4 note formano un accordo Do-Mi-Sol-Do alto. Più vai su con la frequenza, più il suono è acuto!",
          explanation: "4 blocchi 'Se' in sequenza: il programma controlla ciascuno e accende SOLO il LED corrispondente al numero casuale. Dopo i 4 Se, aggiunge delay e spegnimento.",
          xml: SIMON_SCRATCH_STEP16
        },
        {
          step: 6,
          text: "Dopo i 4 'Se', aggiungi 'Attendi 500ms', poi spegni tutti i LED (pin 9-12 LOW) e 'Ferma suono pin 8'",
          hint: "Prima accendi LED+suono, aspetti che il giocatore lo veda/senta, poi spegni tutto. Questo è un turno della sequenza.",
          explanation: "Il delay(500) dà tempo al giocatore di VEDERE e SENTIRE il LED acceso. Poi si spegne tutto per prepararsi al prossimo turno. Senza il delay, il LED si accenderebbe e spegnerebbe troppo velocemente!"
        },
        {
          step: 7,
          text: "Aggiungi 4 blocchi 'Se' per leggere i pulsanti: se 'Leggi pin 3' = 0 allora accendi LED rosso + suona Do + stampa 'Rosso premuto!'",
          hint: "Con INPUT_PULLUP, il pulsante premuto dà 0 (LOW). Il giocatore vede e sente quale pulsante ha premuto!",
          explanation: "digitalRead() legge lo stato del pin: con INPUT_PULLUP, il pulsante premuto dà 0 (LOW) e rilasciato dà 1 (HIGH). Serial.println() stampa sul Monitor Seriale per il debug.",
          xml: SIMON_SCRATCH_STEP28
        },
        {
          step: 8,
          text: "Compila e avvia! Il Simon mostra un LED casuale con suono — premi il pulsante giusto per confermare. Prova a espandere il gioco!",
          hint: "Questa è la versione semplificata: un turno alla volta. Il codice C++ completo nella tab Arduino aggiunge la sequenza crescente!",
          explanation: "La versione Scratch è semplificata (1 turno). Il codice C++ completo aggiunge un array per memorizzare la sequenza, livelli crescenti, e Game Over con lampeggio e suono grave!",
          xml: SIMON_SCRATCH_FULL
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
