import * as Blockly from 'blockly';
// S83: Removed 'blockly/javascript' import — it registers generators on Blockly.JavaScript,
// NOT on our custom arduinoGenerator. Was potentially causing conflicts.

export const arduinoGenerator = new Blockly.Generator('Arduino');

// C++ operator precedence (lower number = higher precedence)
arduinoGenerator.PRECEDENCE = 0;
arduinoGenerator.ORDER_ATOMIC = 0;            // literals, identifiers
arduinoGenerator.ORDER_UNARY_POSTFIX = 1;     // () [] -> . ++ --
arduinoGenerator.ORDER_UNARY_PREFIX = 2;      // - + ! ~ ++ -- (type)* & sizeof
arduinoGenerator.ORDER_MULTIPLICATION = 3;    // * / %
arduinoGenerator.ORDER_ADDITION = 4;          // + -
arduinoGenerator.ORDER_SUBTRACTION = 4;
arduinoGenerator.ORDER_DIVISION = 3;
arduinoGenerator.ORDER_SHIFT = 5;             // << >>
arduinoGenerator.ORDER_RELATIONAL = 6;        // < <= > >=
arduinoGenerator.ORDER_EQUALITY = 7;          // == !=
arduinoGenerator.ORDER_BITWISE_AND = 8;       // &
arduinoGenerator.ORDER_BITWISE_XOR = 9;       // ^
arduinoGenerator.ORDER_BITWISE_OR = 10;       // |
arduinoGenerator.ORDER_LOGICAL_AND = 11;      // &&
arduinoGenerator.ORDER_LOGICAL_OR = 12;       // ||
arduinoGenerator.ORDER_CONDITIONAL = 13;      // ?:
arduinoGenerator.ORDER_ASSIGNMENT = 14;       // = += -= etc.
arduinoGenerator.ORDER_NONE = 99;             // (…)

arduinoGenerator.scrub_ = function (block, code, opt_thisOnly) {
    const nextBlock = block.nextConnection && block.nextConnection.targetBlock();
    const nextCode = opt_thisOnly ? '' : arduinoGenerator.blockToCode(nextBlock);
    return code + nextCode;
};

// --- Custom Arduino Blocks Generators --- //

arduinoGenerator.forBlock['arduino_base'] = function (block) {
    // Reset include flags before each generation pass
    arduinoGenerator._servoIncludes = false;
    arduinoGenerator._servoNames = new Set();
    arduinoGenerator._lcdIncludes = false;
    arduinoGenerator._lcdPins = null;
    arduinoGenerator._lcdBegin = null;

    const setupCode = arduinoGenerator.statementToCode(block, 'SETUP') || '';
    const loopCode = arduinoGenerator.statementToCode(block, 'LOOP') || '';

    // Build header: #include + global declarations for Servo / LCD
    let header = '';
    if (arduinoGenerator._servoIncludes && arduinoGenerator._servoNames.size > 0) {
        header += '#include <Servo.h>\n';
        for (const name of arduinoGenerator._servoNames) {
            header += `Servo ${name};\n`;
        }
        header += '\n';
    }
    if (arduinoGenerator._lcdIncludes && arduinoGenerator._lcdPins) {
        const p = arduinoGenerator._lcdPins;
        header += '#include <LiquidCrystal.h>\n';
        header += `LiquidCrystal lcd(${p.rs}, ${p.e}, ${p.d4}, ${p.d5}, ${p.d6}, ${p.d7});\n\n`;
    }

    // Insert lcd.begin() at the start of setup if LCD is used
    let lcdSetupCode = '';
    if (arduinoGenerator._lcdIncludes && arduinoGenerator._lcdBegin) {
        const b = arduinoGenerator._lcdBegin;
        lcdSetupCode = `  lcd.begin(${b.cols}, ${b.rows});\n`;
    }

    return `${header}void setup() {
${lcdSetupCode}${setupCode}}

void loop() {
${loopCode}}`;
};

arduinoGenerator.forBlock['arduino_pin_mode'] = function (block) {
    const pin = block.getFieldValue('PIN');
    const mode = block.getFieldValue('MODE');
    return `  pinMode(${pin}, ${mode});\n`;
};

arduinoGenerator.forBlock['arduino_digital_write'] = function (block) {
    const pin = block.getFieldValue('PIN');
    const state = block.getFieldValue('STATE');
    return `  digitalWrite(${pin}, ${state});\n`;
};

arduinoGenerator.forBlock['arduino_digital_read'] = function (block) {
    const pin = block.getFieldValue('PIN');
    return [`digitalRead(${pin})`, arduinoGenerator.ORDER_ATOMIC];
};

arduinoGenerator.forBlock['arduino_analog_write'] = function (block) {
    const pin = block.getFieldValue('PIN');
    let value = arduinoGenerator.valueToCode(block, 'VALUE', arduinoGenerator.ORDER_ATOMIC) || '0';
    return `  analogWrite(${pin}, ${value});\n`;
};

arduinoGenerator.forBlock['arduino_analog_read'] = function (block) {
    const pin = block.getFieldValue('PIN');
    return [`analogRead(${pin})`, arduinoGenerator.ORDER_ATOMIC];
};

arduinoGenerator.forBlock['arduino_delay'] = function (block) {
    let delayTime = arduinoGenerator.valueToCode(block, 'DELAY_TIME', arduinoGenerator.ORDER_ATOMIC) || '1000';
    return `  delay(${delayTime});\n`;
};

arduinoGenerator.forBlock['arduino_millis'] = function (block) {
    return ['millis()', arduinoGenerator.ORDER_ATOMIC];
};

arduinoGenerator.forBlock['arduino_serial_begin'] = function (block) {
    const baud = block.getFieldValue('BAUD');
    return `  Serial.begin(${baud});\n`;
};

arduinoGenerator.forBlock['arduino_serial_print'] = function (block) {
    const content = arduinoGenerator.valueToCode(block, 'CONTENT', arduinoGenerator.ORDER_ATOMIC) || '""';
    const newline = block.getFieldValue('NEWLINE') === 'TRUE';
    const fn = newline ? 'println' : 'print';
    return `  Serial.${fn}(${content});\n`;
};

// --- Standard Blocks Generators Overrides for Arduino C++ --- //

arduinoGenerator.forBlock['math_number'] = function (block) {
    const code = String(block.getFieldValue('NUM'));
    return [code, arduinoGenerator.ORDER_ATOMIC];
};

arduinoGenerator.forBlock['math_arithmetic'] = function (block) {
    const OPERATORS = {
        'ADD': [' + ', arduinoGenerator.ORDER_ADDITION],
        'MINUS': [' - ', arduinoGenerator.ORDER_SUBTRACTION],
        'MULTIPLY': [' * ', arduinoGenerator.ORDER_MULTIPLICATION],
        'DIVIDE': [' / ', arduinoGenerator.ORDER_DIVISION],
        'POWER': [null, arduinoGenerator.ORDER_NONE] // Skip power for simple Arduino translation
    };
    const tuple = OPERATORS[block.getFieldValue('OP')];
    const operator = tuple[0];
    const order = tuple[1];
    const argument0 = arduinoGenerator.valueToCode(block, 'A', order) || '0';
    const argument1 = arduinoGenerator.valueToCode(block, 'B', order) || '0';

    if (!operator) {
        return [`pow(${argument0}, ${argument1})`, arduinoGenerator.ORDER_ATOMIC];
    }

    const code = argument0 + operator + argument1;
    return [code, order];
};

arduinoGenerator.forBlock['controls_if'] = function (block) {
    let n = 0;
    let code = '';
    do {
        const conditionCode = arduinoGenerator.valueToCode(block, 'IF' + n, arduinoGenerator.ORDER_NONE) || 'false';
        const branchCode = arduinoGenerator.statementToCode(block, 'DO' + n) || '';
        code += (n > 0 ? ' else ' : '') + `if (${conditionCode}) {
${branchCode}}`;
        n++;
    } while (block.getInput('IF' + n));

    if (block.getInput('ELSE')) {
        const branchCode = arduinoGenerator.statementToCode(block, 'ELSE') || '';
        code += ` else {
${branchCode}}`;
    }
    return code + '\n';
};

arduinoGenerator.forBlock['logic_compare'] = function (block) {
    const OPERATORS = {
        'EQ': '==',
        'NEQ': '!=',
        'LT': '<',
        'LTE': '<=',
        'GT': '>',
        'GTE': '>='
    };
    const operator = OPERATORS[block.getFieldValue('OP')];
    const argument0 = arduinoGenerator.valueToCode(block, 'A', arduinoGenerator.ORDER_RELATIONAL) || '0';
    const argument1 = arduinoGenerator.valueToCode(block, 'B', arduinoGenerator.ORDER_RELATIONAL) || '0';
    const code = argument0 + ' ' + operator + ' ' + argument1;
    return [code, arduinoGenerator.ORDER_RELATIONAL];
};

arduinoGenerator.forBlock['logic_operation'] = function (block) {
    const operator = block.getFieldValue('OP') === 'AND' ? '&&' : '||';
    const order = operator === '&&' ? arduinoGenerator.ORDER_LOGICAL_AND : arduinoGenerator.ORDER_LOGICAL_OR;
    const argument0 = arduinoGenerator.valueToCode(block, 'A', order);
    const argument1 = arduinoGenerator.valueToCode(block, 'B', order);
    if (!argument0 && !argument1) {
        return ['false', arduinoGenerator.ORDER_ATOMIC];
    }
    const defaultArgument = operator === '&&' ? 'true' : 'false';
    const code = (argument0 || defaultArgument) + ' ' + operator + ' ' + (argument1 || defaultArgument);
    return [code, order];
};
// © Andrea Marro — 11/03/2026 — ELAB Tutor — Tutti i diritti riservati

arduinoGenerator.forBlock['logic_boolean'] = function (block) {
    const code = block.getFieldValue('BOOL') === 'TRUE' ? 'true' : 'false';
    return [code, arduinoGenerator.ORDER_ATOMIC];
};

arduinoGenerator.forBlock['text'] = function (block) {
    // Manual quoting — Blockly.utils.string.quote was removed in newer Blockly versions
    const text = block.getFieldValue('TEXT') || '';
    const escaped = text.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
    const code = `"${escaped}"`;
    return [code, arduinoGenerator.ORDER_ATOMIC];
};

arduinoGenerator.forBlock['controls_repeat_ext'] = function (block) {
    const repeats = arduinoGenerator.valueToCode(block, 'TIMES', arduinoGenerator.ORDER_ASSIGNMENT) || '0';
    const branch = arduinoGenerator.statementToCode(block, 'DO') || '';
    const loopVar = Blockly.Variables.generateUniqueName(block.workspace);
    return `  for (int ${loopVar} = 0; ${loopVar} < ${repeats}; ${loopVar}++) {
${branch}  }\n`;
};

arduinoGenerator.forBlock['controls_whileUntil'] = function (block) {
    const until = block.getFieldValue('MODE') === 'UNTIL';
    let cond = arduinoGenerator.valueToCode(block, 'BOOL', arduinoGenerator.ORDER_NONE) || 'false';
    const branch = arduinoGenerator.statementToCode(block, 'DO') || '';
    if (until) cond = `!(${cond})`;
    return `  while (${cond}) {\n${branch}  }\n`;
};

arduinoGenerator.forBlock['controls_for'] = function (block) {
    const varName = Blockly.Variables.generateUniqueName(block.workspace);
    const from = arduinoGenerator.valueToCode(block, 'FROM', arduinoGenerator.ORDER_ASSIGNMENT) || '0';
    const to = arduinoGenerator.valueToCode(block, 'TO', arduinoGenerator.ORDER_ASSIGNMENT) || '0';
    const by = arduinoGenerator.valueToCode(block, 'BY', arduinoGenerator.ORDER_ASSIGNMENT) || '1';
    const branch = arduinoGenerator.statementToCode(block, 'DO') || '';
    return `  for (int ${varName} = ${from}; ${varName} <= ${to}; ${varName} += ${by}) {\n${branch}  }\n`;
};

arduinoGenerator.forBlock['logic_negate'] = function (block) {
    const argument = arduinoGenerator.valueToCode(block, 'BOOL', arduinoGenerator.ORDER_UNARY_PREFIX) || 'true';
    return [`!${argument}`, arduinoGenerator.ORDER_UNARY_PREFIX];
};

arduinoGenerator.forBlock['text_join'] = function (block) {
    // S103: Dynamic N-item String concatenation for Arduino
    const itemCount = block.itemCount_ || 2;
    if (itemCount === 0) return ['""', arduinoGenerator.ORDER_ATOMIC];
    if (itemCount === 1) {
        const val = arduinoGenerator.valueToCode(block, 'ADD0', arduinoGenerator.ORDER_ATOMIC) || '""';
        return [`String(${val})`, arduinoGenerator.ORDER_ATOMIC];
    }
    const parts = [];
    for (let i = 0; i < itemCount; i++) {
        parts.push(`String(${arduinoGenerator.valueToCode(block, 'ADD' + i, arduinoGenerator.ORDER_ADDITION) || '""'})`);
    }
    return [parts.join(' + '), arduinoGenerator.ORDER_ADDITION];
};

// --- Tone / Buzzer --- //

arduinoGenerator.forBlock['arduino_tone'] = function (block) {
    const pin = block.getFieldValue('PIN');
    const freq = arduinoGenerator.valueToCode(block, 'FREQ', arduinoGenerator.ORDER_ATOMIC) || '440';
    return `  tone(${pin}, ${freq});\n`;
};

arduinoGenerator.forBlock['arduino_no_tone'] = function (block) {
    const pin = block.getFieldValue('PIN');
    return `  noTone(${pin});\n`;
};

// --- Servo --- //

arduinoGenerator.forBlock['arduino_servo_attach'] = function (block) {
    const name = block.getFieldValue('NAME') || 'myServo';
    const pin = block.getFieldValue('PIN');
    arduinoGenerator._servoIncludes = true;
    arduinoGenerator._servoNames?.add(name);
    return `  ${name}.attach(${pin});\n`;
};

arduinoGenerator.forBlock['arduino_servo_write'] = function (block) {
    const name = block.getFieldValue('NAME') || 'myServo';
    const angle = arduinoGenerator.valueToCode(block, 'ANGLE', arduinoGenerator.ORDER_ATOMIC) || '90';
    arduinoGenerator._servoIncludes = true;
    arduinoGenerator._servoNames?.add(name);
    return `  ${name}.write(${angle});\n`;
};

arduinoGenerator.forBlock['arduino_servo_read'] = function (block) {
    const name = block.getFieldValue('NAME') || 'myServo';
    arduinoGenerator._servoIncludes = true;
    arduinoGenerator._servoNames?.add(name);
    return [`${name}.read()`, arduinoGenerator.ORDER_ATOMIC];
};

// --- LCD Display --- //

arduinoGenerator.forBlock['arduino_lcd_init'] = function (block) {
    const rs = block.getFieldValue('RS');
    const e = block.getFieldValue('E');
    const d4 = block.getFieldValue('D4');
    const d5 = block.getFieldValue('D5');
    const d6 = block.getFieldValue('D6');
    const d7 = block.getFieldValue('D7');
    const cols = block.getFieldValue('COLS');
    const rows = block.getFieldValue('ROWS');
    arduinoGenerator._lcdIncludes = true;
    arduinoGenerator._lcdPins = { rs, e, d4, d5, d6, d7 };
    arduinoGenerator._lcdBegin = { cols, rows };
    // lcd.begin() is emitted automatically in header by arduino_base
    return '';
};

arduinoGenerator.forBlock['arduino_lcd_print'] = function (block) {
    const text = arduinoGenerator.valueToCode(block, 'TEXT', arduinoGenerator.ORDER_ATOMIC) || '""';
    return `  lcd.print(${text});\n`;
};

arduinoGenerator.forBlock['arduino_lcd_set_cursor'] = function (block) {
    const col = block.getFieldValue('COL');
    const row = block.getFieldValue('ROW');
    return `  lcd.setCursor(${col}, ${row});\n`;
};

arduinoGenerator.forBlock['arduino_lcd_clear'] = function (block) {
    return '  lcd.clear();\n';
};

// --- Variables --- //

arduinoGenerator.forBlock['arduino_variable_set'] = function (block) {
    const varName = block.getFieldValue('VAR') || 'x';
    const type = block.getFieldValue('TYPE') || 'int';
    const value = arduinoGenerator.valueToCode(block, 'VALUE', arduinoGenerator.ORDER_ASSIGNMENT) || '0';
    return `  ${type} ${varName} = ${value};\n`;
};

arduinoGenerator.forBlock['arduino_variable_get'] = function (block) {
    const varName = block.getFieldValue('VAR') || 'x';
    return [varName, arduinoGenerator.ORDER_ATOMIC];
};

// --- Random --- //

arduinoGenerator.forBlock['arduino_random'] = function (block) {
    const min = arduinoGenerator.valueToCode(block, 'MIN', arduinoGenerator.ORDER_ATOMIC) || '0';
    const max = arduinoGenerator.valueToCode(block, 'MAX', arduinoGenerator.ORDER_ATOMIC) || '3';
    return [`random(${min}, ${max} + 1)`, arduinoGenerator.ORDER_ATOMIC];
};

// --- Map --- //

arduinoGenerator.forBlock['arduino_map'] = function (block) {
    const value = arduinoGenerator.valueToCode(block, 'VALUE', arduinoGenerator.ORDER_ATOMIC) || '0';
    const fromLow = arduinoGenerator.valueToCode(block, 'FROM_LOW', arduinoGenerator.ORDER_ATOMIC) || '0';
    const fromHigh = arduinoGenerator.valueToCode(block, 'FROM_HIGH', arduinoGenerator.ORDER_ATOMIC) || '1023';
    const toLow = arduinoGenerator.valueToCode(block, 'TO_LOW', arduinoGenerator.ORDER_ATOMIC) || '0';
    const toHigh = arduinoGenerator.valueToCode(block, 'TO_HIGH', arduinoGenerator.ORDER_ATOMIC) || '255';
    return [`map(${value}, ${fromLow}, ${fromHigh}, ${toLow}, ${toHigh})`, arduinoGenerator.ORDER_ATOMIC];
};

// S92: Generate code ONLY from the arduino_base block to prevent orphaned statements.
// workspaceToCode() iterates ALL top-level blocks, which can produce code outside
// functions if any blocks are disconnected from arduino_base.
export function generateArduinoCode(workspace) {
    const baseBlocks = workspace.getBlocksByType('arduino_base');
    if (!baseBlocks || baseBlocks.length === 0) {
        return 'void setup() {\n}\n\nvoid loop() {\n}\n';
    }
    arduinoGenerator.init(workspace);
    const code = arduinoGenerator.blockToCode(baseBlocks[0]);
    return typeof code === 'string' ? code : (Array.isArray(code) ? code[0] : '');
}
