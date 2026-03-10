import * as Blockly from 'blockly';

// ─── ELAB Block Styles ─────────────────────────────────────
// Mapped to ELAB_THEME.blockStyles in ScratchEditor.jsx
// Using setStyle() so the theme controls all colours centrally.
const STYLES = {
    BASE: 'arduino_io',        // Setup/Loop wrapper — same teal as I/O
    IO: 'arduino_io',          // Digital/Analog Read/Write
    TIME: 'arduino_time',      // Delay, Millis
    SERIAL: 'arduino_serial',  // Serial print
    SOUND: 'arduino_sound',    // Tone / Buzzer
    SERVO: 'arduino_servo',    // Servo motor
    LCD: 'arduino_lcd',        // Display LCD
    VARS: 'variable_blocks',   // Variables
    MATH_EXT: 'math_blocks',   // Map, constrain
};

// 1. Blocco base Arduino (Setup e Loop combinati)
Blockly.Blocks['arduino_base'] = {
    init: function () {
        this.appendDummyInput().appendField("Setup");
        this.appendStatementInput("SETUP").setCheck(null);
        this.appendDummyInput().appendField("Loop");
        this.appendStatementInput("LOOP").setCheck(null);
        this.setStyle(STYLES.BASE);
        this.setTooltip("Contenitore principale per Arduino. Esegue setup una volta, e loop all'infinito.");
        this.setHelpUrl("https://www.arduino.cc/reference/en/");
        this.setDeletable(false);
    }
};

// 2. pinMode
Blockly.Blocks['arduino_pin_mode'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("PinMode PIN#")
            .appendField(new Blockly.FieldNumber(13, 0, 19), "PIN")
            .appendField(" as ")
            .appendField(new Blockly.FieldDropdown([
                ["OUTPUT", "OUTPUT"],
                ["INPUT", "INPUT"],
                ["INPUT_PULLUP", "INPUT_PULLUP"]
            ]), "MODE");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setStyle(STYLES.IO);
        this.setTooltip("Imposta un pin digitale come input o output");
    }
};

// 3. digitalWrite
Blockly.Blocks['arduino_digital_write'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("DigitalWrite PIN#")
            .appendField(new Blockly.FieldNumber(13, 0, 19), "PIN")
            .appendField(" value ")
            .appendField(new Blockly.FieldDropdown([
                ["HIGH", "HIGH"],
                ["LOW", "LOW"]
            ]), "STATE");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setStyle(STYLES.IO);
        this.setTooltip("Scrive un valore HIGH o LOW su un pin digitale");
    }
};

// 4. digitalRead
Blockly.Blocks['arduino_digital_read'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("DigitalRead PIN#")
            .appendField(new Blockly.FieldNumber(2, 0, 19), "PIN");
        this.setOutput(true, ["Number", "Boolean"]);
        this.setStyle(STYLES.IO);
        this.setTooltip("Legge il valore da un pin digitale (HIGH o LOW)");
    }
};

// 5. analogWrite
Blockly.Blocks['arduino_analog_write'] = {
    init: function () {
        this.appendValueInput("VALUE")
            .setCheck("Number")
            .appendField("AnalogWrite PIN#")
            .appendField(new Blockly.FieldDropdown([
                ["3", "3"], ["5", "5"], ["6", "6"],
                ["9", "9"], ["10", "10"], ["11", "11"]
            ]), "PIN")
            .appendField(" value ");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setStyle(STYLES.IO);
        this.setTooltip("Scrive un valore analogico (PWM) tra 0 e 255 su un pin");
    }
};

// 6. analogRead
Blockly.Blocks['arduino_analog_read'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("AnalogRead PIN#")
            .appendField(new Blockly.FieldDropdown([
                ["A0", "A0"], ["A1", "A1"], ["A2", "A2"],
                ["A3", "A3"], ["A4", "A4"], ["A5", "A5"]
            ]), "PIN");
        this.setOutput(true, "Number");
        this.setStyle(STYLES.IO);
        this.setTooltip("Legge il valore dal pin analogico specificato (0 - 1023)");
    }
};

// 7. delay
Blockly.Blocks['arduino_delay'] = {
    init: function () {
        this.appendValueInput("DELAY_TIME")
            .setCheck("Number")
            .appendField("Attendi (ms)");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setStyle(STYLES.TIME);
        this.setTooltip("Pausa l'esecuzione per i millisecondi specificati");
    }
};

// 8. millis
Blockly.Blocks['arduino_millis'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("Tempo corrente (millis)");
        this.setOutput(true, "Number");
        this.setStyle(STYLES.TIME);
        this.setTooltip("Restituisce i millisecondi dall'accensione");
    }
};

// 9. serialBegin
Blockly.Blocks['arduino_serial_begin'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("Serial.begin(")
            .appendField(new Blockly.FieldDropdown([
                ["9600", "9600"], ["19200", "19200"], ["38400", "38400"],
                ["57600", "57600"], ["115200", "115200"]
            ]), "BAUD")
            .appendField(")");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setStyle(STYLES.SERIAL);
        this.setTooltip("Inizializza la comunicazione seriale");
    }
};

// 10. serialPrint
Blockly.Blocks['arduino_serial_print'] = {
    init: function () {
        this.appendValueInput("CONTENT")
            .appendField("Serial.print")
            .appendField(new Blockly.FieldCheckbox("TRUE"), "NEWLINE")
            .appendField(" (a capo)");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setStyle(STYLES.SERIAL);
        this.setTooltip("Stampa dati sulla porta seriale");
    }
};

// ─── TONE / BUZZER ─── //

// 11. tone(pin, freq)
Blockly.Blocks['arduino_tone'] = {
    init: function () {
        this.appendValueInput("FREQ")
            .setCheck("Number")
            .appendField("Suona PIN#")
            .appendField(new Blockly.FieldNumber(8, 0, 19), "PIN")
            .appendField(" frequenza");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setStyle(STYLES.SOUND);
        this.setTooltip("Genera un tono alla frequenza specificata (Hz)");
    }
};

// 12. noTone(pin)
Blockly.Blocks['arduino_no_tone'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("Ferma suono PIN#")
            .appendField(new Blockly.FieldNumber(8, 0, 19), "PIN");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setStyle(STYLES.SOUND);
        this.setTooltip("Ferma il tono generato sul pin specificato");
    }
};

// ─── SERVO ─── //

// © Andrea Marro — 10/03/2026 — ELAB Tutor — Tutti i diritti riservati
// 13. Servo attach
Blockly.Blocks['arduino_servo_attach'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("Servo")
            .appendField(new Blockly.FieldTextInput("myServo"), "NAME")
            .appendField(".attach( PIN#")
            .appendField(new Blockly.FieldNumber(9, 0, 19), "PIN")
            .appendField(")");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setStyle(STYLES.SERVO);
        this.setTooltip("Collega il servo al pin specificato");
    }
};

// 14. Servo write
Blockly.Blocks['arduino_servo_write'] = {
    init: function () {
        this.appendValueInput("ANGLE")
            .setCheck("Number")
            .appendField("Servo")
            .appendField(new Blockly.FieldTextInput("myServo"), "NAME")
            .appendField(".write( angolo");
        this.appendDummyInput().appendField(")");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setStyle(STYLES.SERVO);
        this.setTooltip("Ruota il servo all'angolo specificato (0-180)");
    }
};

// 15. Servo read
Blockly.Blocks['arduino_servo_read'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("Servo")
            .appendField(new Blockly.FieldTextInput("myServo"), "NAME")
            .appendField(".read()");
        this.setOutput(true, "Number");
        this.setStyle(STYLES.SERVO);
        this.setTooltip("Legge l'angolo corrente del servo");
    }
};

// ─── LCD DISPLAY ─── //

// 16. LCD Init — Inizializza display LCD 16x2 con pin specificati
Blockly.Blocks['arduino_lcd_init'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("LCD Init  RS#")
            .appendField(new Blockly.FieldNumber(12, 0, 19), "RS")
            .appendField(" E#")
            .appendField(new Blockly.FieldNumber(11, 0, 19), "E");
        this.appendDummyInput()
            .appendField("  D4#")
            .appendField(new Blockly.FieldNumber(5, 0, 19), "D4")
            .appendField(" D5#")
            .appendField(new Blockly.FieldNumber(10, 0, 19), "D5")
            .appendField(" D6#")
            .appendField(new Blockly.FieldNumber(3, 0, 19), "D6")
            .appendField(" D7#")
            .appendField(new Blockly.FieldNumber(6, 0, 19), "D7");
        this.appendDummyInput()
            .appendField("  Colonne")
            .appendField(new Blockly.FieldNumber(16, 1, 40), "COLS")
            .appendField(" Righe")
            .appendField(new Blockly.FieldNumber(2, 1, 4), "ROWS");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setStyle(STYLES.LCD);
        this.setTooltip("Inizializza il display LCD con i pin specificati");
    }
};

// 17. LCD Print — Stampa testo su LCD
Blockly.Blocks['arduino_lcd_print'] = {
    init: function () {
        this.appendValueInput("TEXT")
            .appendField("LCD Print");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setStyle(STYLES.LCD);
        this.setTooltip("Stampa testo sul display LCD");
    }
};

// 18. LCD Set Cursor — Posiziona cursore
Blockly.Blocks['arduino_lcd_set_cursor'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("LCD Cursore  col")
            .appendField(new Blockly.FieldNumber(0, 0, 39), "COL")
            .appendField(" riga")
            .appendField(new Blockly.FieldNumber(0, 0, 3), "ROW");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setStyle(STYLES.LCD);
        this.setTooltip("Posiziona il cursore LCD alla colonna e riga specificate");
    }
};

// 19. LCD Clear — Pulisci display
Blockly.Blocks['arduino_lcd_clear'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("LCD Pulisci");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setStyle(STYLES.LCD);
        this.setTooltip("Pulisci il display LCD");
    }
};

// ─── VARIABILI ─── //

// 16. Dichiarazione variabile
Blockly.Blocks['arduino_variable_set'] = {
    init: function () {
        this.appendValueInput("VALUE")
            .appendField("Dichiara")
            .appendField(new Blockly.FieldDropdown([
                ["int", "int"], ["float", "float"],
                ["long", "long"], ["bool", "bool"],
                ["String", "String"]
            ]), "TYPE")
            .appendField(new Blockly.FieldTextInput("x"), "VAR")
            .appendField("=");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setStyle(STYLES.VARS);
        this.setTooltip("Dichiara una variabile con tipo e valore iniziale");
    }
};

// 17. Leggi variabile
Blockly.Blocks['arduino_variable_get'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("Variabile")
            .appendField(new Blockly.FieldTextInput("x"), "VAR");
        this.setOutput(true, null);
        this.setStyle(STYLES.VARS);
        this.setTooltip("Legge il valore di una variabile");
    }
};

// ─── RANDOM ─── //

// 18b. random(min, max) — inclusive
Blockly.Blocks['arduino_random'] = {
    init: function () {
        this.appendValueInput("MIN").setCheck("Number").appendField("random( da");
        this.appendValueInput("MAX").setCheck("Number").appendField("a");
        this.appendDummyInput().appendField(")");
        this.setInputsInline(true);
        this.setOutput(true, "Number");
        this.setStyle(STYLES.MATH_EXT);
        this.setTooltip("Genera un numero casuale tra min e max (incluso)");
    }
};

// ─── MAP ─── //

// 18. map(value, fromLow, fromHigh, toLow, toHigh)
Blockly.Blocks['arduino_map'] = {
    init: function () {
        this.appendValueInput("VALUE").setCheck("Number").appendField("map(");
        this.appendValueInput("FROM_LOW").setCheck("Number").appendField(", da");
        this.appendValueInput("FROM_HIGH").setCheck("Number").appendField("~");
        this.appendValueInput("TO_LOW").setCheck("Number").appendField(", a");
        this.appendValueInput("TO_HIGH").setCheck("Number").appendField("~");
        this.appendDummyInput().appendField(")");
        this.setInputsInline(true);
        this.setOutput(true, "Number");
        this.setStyle(STYLES.MATH_EXT);
        this.setTooltip("Rimappa un valore da un intervallo ad un altro");
    }
};
