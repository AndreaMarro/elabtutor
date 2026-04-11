// ============================================
// ELAB — UNLIM Knowledge Base (Offline Fallback)
// Risposte curate per le domande più comuni
// quando il server backend non è raggiungibile.
// © Andrea Marro — 20/02/2026
// ============================================

/**
 * Ogni entry contiene:
 *   keywords: parole chiave per il matching
 *   question: domanda rappresentativa
 *   answer: risposta educativa (stile UNLIM, 8-14 anni)
 *   relatedExperiment: ID esperimento ELAB collegato (opzionale)
 */
const KNOWLEDGE_BASE = [
  // ── LED ────────────────────────────────────────
  {
    keywords: ['led', 'accende', 'luminoso', 'luce', 'diodo'],
    question: 'Come funziona un LED?',
    answer: 'Un LED (Light Emitting Diode) è un componente che emette luce quando la corrente lo attraversa nel verso giusto. Ha due piedini: l\'anodo (+, più lungo) e il catodo (-, più corto). La corrente deve entrare dall\'anodo e uscire dal catodo. Se lo colleghi al contrario, non si accende — ma non si rompe! Ricorda sempre di mettere una resistenza in serie per limitare la corrente, altrimenti il LED potrebbe bruciarsi.',
    relatedExperiment: 'cap1-led-semplice',
  },
  {
    keywords: ['led', 'non', 'accende', 'spento', 'funziona'],
    question: 'Perché il mio LED non si accende?',
    answer: 'Ci sono alcune cose da controllare:\n\n1. **Verso del LED**: Il piedino lungo (anodo) va collegato al polo positivo (+). Prova a girarlo.\n2. **Resistenza**: Hai messo una resistenza in serie? Senza, il LED potrebbe essersi bruciato.\n3. **Collegamento a massa**: Verifica che il circuito sia chiuso fino a GND.\n4. **Alimentazione**: Il pin di Arduino è configurato come OUTPUT nel codice?\n5. **Breadboard**: Controlla che i fili siano ben inseriti nei fori giusti.\n\nProva a controllare questi punti uno per uno!',
    relatedExperiment: 'cap1-led-semplice',
  },
  {
    keywords: ['led', 'rgb', 'colore', 'colori', 'rosso', 'verde', 'blu'],
    question: 'Come funziona un LED RGB?',
    answer: 'Un LED RGB ha 3 LED miniaturizzati dentro lo stesso involucro: uno Rosso, uno Verde e uno Blu. Mescolando questi tre colori con intensità diverse puoi creare qualsiasi colore! Ha 4 piedini: uno comune (catodo o anodo, dipende dal modello) e uno per ogni colore. Usando `analogWrite()` su Arduino puoi regolare l\'intensità di ogni colore da 0 a 255. Per esempio, rosso pieno + verde pieno = giallo!',
    relatedExperiment: 'cap7-led-rgb',
  },

  // ── RESISTENZA ─────────────────────────────────
  {
    keywords: ['resistenza', 'resistore', 'ohm', 'bande', 'colori'],
    question: 'Come funziona una resistenza?',
    answer: 'Una resistenza è come un tubo stretto per l\'acqua: limita il flusso di corrente nel circuito. Si misura in Ohm (Ω). Le bande colorate indicano il valore:\n\n- **Nero=0, Marrone=1, Rosso=2, Arancione=3, Giallo=4, Verde=5, Blu=6, Viola=7, Grigio=8, Bianco=9**\n- Le prime due bande sono le cifre, la terza è il moltiplicatore.\n\nEsempio: Marrone-Nero-Rosso = 10 × 100 = 1000Ω = 1kΩ\n\nPer un LED standard, una resistenza da 220Ω o 330Ω va benissimo!',
  },
  {
    keywords: ['legge', 'ohm', 'tensione', 'corrente', 'formula'],
    question: 'Cos\'è la Legge di Ohm?',
    answer: 'La Legge di Ohm dice che: **V = R × I**\n\n- **V** = Tensione (Volt) — è la "spinta" che fa muovere la corrente\n- **R** = Resistenza (Ohm) — è il "freno" che limita la corrente\n- **I** = Corrente (Ampere) — è il "flusso" di elettricità\n\nPensa all\'acqua: la tensione è la pressione, la resistenza è quanto è stretto il tubo, e la corrente è quanta acqua passa.\n\nSe aumenti la tensione (più pressione), passa più corrente. Se aumenti la resistenza (tubo più stretto), passa meno corrente.',
  },
  {
    keywords: ['serie', 'parallelo', 'collegamento', 'circuito'],
    question: 'Qual è la differenza tra serie e parallelo?',
    answer: 'In **serie**, i componenti sono uno dopo l\'altro, come le perle di una collana. La corrente è la stessa per tutti, ma la tensione si divide. Se un LED si spegne, si spengono tutti!\n\nIn **parallelo**, i componenti sono fianco a fianco, ognuno con il suo percorso. La tensione è la stessa per tutti, ma la corrente si divide. Se un LED si spegne, gli altri restano accesi.\n\nNelle case, le prese di corrente sono in parallelo — ecco perché se si fulmina una lampadina, le altre funzionano ancora!',
  },

  // ── ARDUINO BASE ───────────────────────────────
  {
    keywords: ['arduino', 'nano', 'cos\'è', 'cosa', 'scheda', 'microcontrollore'],
    question: 'Cos\'è Arduino?',
    answer: 'Arduino è una piccola scheda con un microcontrollore (un mini-computer) che puoi programmare per controllare circuiti elettronici. Il modello che usiamo in ELAB è l\'**Arduino Nano**, che ha:\n\n- **14 pin digitali** (D0-D13) — acceso/spento\n- **8 pin analogici** (A0-A7) — valori da 0 a 1023\n- **Pin 5V e 3.3V** per alimentare i componenti\n- **Pin GND** (massa) per chiudere il circuito\n\nScrivi il codice nel linguaggio Arduino (simile al C++), lo carichi sulla scheda, e il circuito prende vita!',
  },
  {
    keywords: ['setup', 'loop', 'struttura', 'programma', 'sketch'],
    question: 'Come è strutturato un programma Arduino?',
    answer: 'Ogni programma Arduino (chiamato "sketch") ha due funzioni principali:\n\n```cpp\nvoid setup() {\n  // Eseguito UNA sola volta all\'avvio\n  // Qui configuri i pin e le impostazioni\n  pinMode(13, OUTPUT);\n}\n\nvoid loop() {\n  // Eseguito all\'INFINITO, in loop\n  // Qui metti il comportamento del circuito\n  digitalWrite(13, HIGH);\n  delay(1000);\n  digitalWrite(13, LOW);\n  delay(1000);\n}\n```\n\n`setup()` è come preparare gli ingredienti, `loop()` è come cucinare — ripeti la ricetta all\'infinito!',
  },

  // ── DIGITALWRITE / DIGITALREAD ─────────────────
  {
    keywords: ['digitalwrite', 'accendere', 'output', 'high', 'low'],
    question: 'Come si usa digitalWrite?',
    answer: '`digitalWrite()` serve per accendere o spegnere un pin digitale:\n\n```cpp\npinMode(13, OUTPUT);     // Configura il pin 13 come uscita\ndigitalWrite(13, HIGH);  // Accende (5V)\ndigitalWrite(13, LOW);   // Spegne (0V)\n```\n\n**HIGH** = il pin dà 5 Volt (acceso)\n**LOW** = il pin dà 0 Volt (spento)\n\nRicorda: prima devi dire ad Arduino che il pin è un\'uscita con `pinMode(pin, OUTPUT)` nel `setup()`!',
  },
  {
    keywords: ['digitalread', 'pulsante', 'bottone', 'input', 'leggere'],
    question: 'Come si legge un pulsante con digitalRead?',
    answer: '`digitalRead()` legge lo stato di un pin: premuto o non premuto.\n\n```cpp\npinMode(2, INPUT_PULLUP); // Pin 2 come ingresso con resistenza interna\n\nvoid loop() {\n  int stato = digitalRead(2);\n  if (stato == LOW) {\n    // Pulsante PREMUTO (LOW perché usa pull-up)\n    digitalWrite(13, HIGH);\n  } else {\n    // Pulsante RILASCIATO\n    digitalWrite(13, LOW);\n  }\n}\n```\n\nCon `INPUT_PULLUP`, il pin è HIGH quando il pulsante è rilasciato e LOW quando è premuto. Sembra al contrario, ma è il modo più sicuro!',
    relatedExperiment: 'cap6-pulsante',
  },

  // ── ANALOGWRITE (PWM) ──────────────────────────
  {
    keywords: ['analogwrite', 'pwm', 'dimmer', 'luminosità', 'intensità'],
    question: 'Come funziona analogWrite e il PWM?',
    answer: 'Il **PWM** (Pulse Width Modulation) è un trucco per simulare tensioni intermedie. Arduino accende e spegne il pin molto velocemente — così veloce che il LED sembra meno luminoso!\n\n```cpp\nanalogWrite(9, 0);    // Spento (0%)\nanalogWrite(9, 127);  // Metà luminosità (50%)\nanalogWrite(9, 255);  // Piena luminosità (100%)\n```\n\nFunziona solo sui pin con il simbolo **~** (3, 5, 6, 9, 10, 11 su Arduino Nano).\n\nÈ come sbattere le palpebre velocissimo: se le chiudi per metà del tempo, vedi "meno luce"!',
  },

  // ── ANALOGREAD ─────────────────────────────────
  {
    keywords: ['analogread', 'analogico', 'sensore', 'potenziometro', 'valore'],
    question: 'Come funziona analogRead?',
    answer: '`analogRead()` legge una tensione analogica (non solo acceso/spento, ma valori intermedi) su un pin A0-A7:\n\n```cpp\nint valore = analogRead(A0);  // Legge: 0-1023\n```\n\n- **0** = 0 Volt\n- **1023** = 5 Volt\n- **512** = circa 2.5 Volt\n\nÈ perfetto per leggere sensori come:\n- **Potenziometro** (manopola)\n- **Fotoresistenza** (sensore di luce)\n- **Sensore di temperatura**\n\nPensa al potenziometro come al volume della radio: giri e il valore cambia!',
    relatedExperiment: 'cap3-potenziometro',
  },

  // ── SERIAL ─────────────────────────────────────
  {
    keywords: ['serial', 'monitor', 'seriale', 'stampa', 'debug', 'println'],
    question: 'Come funziona Serial Monitor?',
    answer: 'Il Serial Monitor è come una chat tra te e Arduino. Puoi inviare dati e leggerli sullo schermo:\n\n```cpp\nvoid setup() {\n  Serial.begin(9600);  // Avvia comunicazione a 9600 baud\n}\n\nvoid loop() {\n  int val = analogRead(A0);\n  Serial.print("Valore: ");\n  Serial.println(val);  // Stampa con a capo\n  delay(500);\n}\n```\n\n`Serial.print()` scrive sulla stessa riga, `Serial.println()` va a capo dopo.\n\nÈ utilissimo per il **debug**: quando qualcosa non funziona, stampa i valori per capire cosa sta succedendo!',
  },

  // ── BREADBOARD ─────────────────────────────────
  {
    keywords: ['breadboard', 'basetta', 'fori', 'collegamento', 'prova'],
    question: 'Come funziona una breadboard?',
    answer: 'La breadboard è una basetta per costruire circuiti senza saldare. I fori sono collegati così:\n\n- **Righe centrali** (a-e, f-j): i 5 fori di ogni riga sono collegati tra loro\n- **Colonne laterali** (+/-): tutti i fori della stessa colonna sono collegati (alimentazione)\n- **Scanalatura centrale**: separa le due metà — i fori NON sono collegati attraverso la scanalatura\n\n**Regole d\'oro:**\n1. I componenti si inseriscono a cavallo della scanalatura\n2. Mai due piedini dello stesso componente nella stessa riga!\n3. Usa la colonna rossa (+) per il 5V e la blu (-) per GND',
  },

  // ── BUZZER ─────────────────────────────────────
  {
    keywords: ['buzzer', 'suono', 'tono', 'tone', 'musica', 'nota'],
    question: 'Come si usa un buzzer con Arduino?',
    answer: 'Il buzzer emette suoni quando gli invii un segnale. Con `tone()` puoi scegliere la frequenza (nota musicale):\n\n```cpp\ntone(8, 440);     // Pin 8, nota LA (440 Hz)\ndelay(500);        // Suona per mezzo secondo\nnoTone(8);         // Silenzio\n```\n\n**Frequenze delle note:**\n- DO=262, RE=294, MI=330, FA=349, SOL=392, LA=440, SI=494, DO alto=523\n\nPuoi creare melodie mettendo una sequenza di `tone()` e `delay()`!\n\nAttenzione: il buzzer ha un verso. Il piedino + (più lungo) va al pin di Arduino.',
    relatedExperiment: 'cap4-buzzer',
  },

  // ── FOTORESISTENZA ─────────────────────────────
  {
    keywords: ['fotoresistenza', 'ldr', 'luce', 'sensore', 'buio', 'luminosità'],
    question: 'Come funziona una fotoresistenza?',
    answer: 'La fotoresistenza (LDR) cambia la sua resistenza in base alla luce:\n- **Tanta luce** → resistenza bassa → il valore di `analogRead()` è alto\n- **Buio** → resistenza alta → il valore è basso\n\n```cpp\nint luce = analogRead(A0);\nif (luce < 300) {\n  // È buio! Accendi il LED\n  digitalWrite(13, HIGH);\n} else {\n  digitalWrite(13, LOW);\n}\n```\n\nServe un partitore di tensione: collega la fotoresistenza tra 5V e il pin A0, e una resistenza da 10kΩ tra A0 e GND.\n\nÈ come funzionano le luci automatiche nei lampioni!',
    relatedExperiment: 'cap5-fotoresistenza',
  },

  // ── SERVO ──────────────────────────────────────
  {
    keywords: ['servo', 'motore', 'angolo', 'gradi', 'rotazione'],
    question: 'Come si controlla un servo motore?',
    answer: 'Il servo motore ruota a un angolo preciso (0° - 180°). Usa la libreria Servo:\n\n```cpp\n#include <Servo.h>\nServo mioServo;\n\nvoid setup() {\n  mioServo.attach(9);  // Pin 9\n}\n\nvoid loop() {\n  mioServo.write(0);    // Vai a 0°\n  delay(1000);\n  mioServo.write(90);   // Vai a 90°\n  delay(1000);\n  mioServo.write(180);  // Vai a 180°\n  delay(1000);\n}\n```\n\nHa 3 fili: **rosso** (5V), **marrone/nero** (GND), **arancione/giallo** (segnale al pin PWM).\n\nPuoi collegarlo a un potenziometro per controllarlo con la manopola!',
    relatedExperiment: 'cap8-servo',
  },

  // ── CONDENSATORE ───────────────────────────────
  {
    keywords: ['condensatore', 'capacità', 'carica', 'scarica', 'farad'],
    question: 'Cos\'è un condensatore?',
    answer: 'Il condensatore è come una piccola batteria ricaricabile: accumula energia e la rilascia.\n\n- **Carica**: quando gli dai tensione, accumula energia (come riempire un secchio d\'acqua)\n- **Scarica**: quando togli la tensione, rilascia l\'energia accumulata\n\nSi misura in **Farad** (F), ma i condensatori comuni sono micro-Farad (µF) o nano-Farad (nF).\n\n**Attenzione alla polarità!** I condensatori elettrolitici hanno un verso: la striscia bianca indica il piedino negativo (-).\n\nUsi comuni: filtrare disturbi, stabilizzare tensioni, creare ritardi (circuiti RC).',
  },

  // ── DELAY / MILLIS ─────────────────────────────
  {
    keywords: ['delay', 'millis', 'tempo', 'attesa', 'ritardo', 'bloccante'],
    question: 'Qual è la differenza tra delay() e millis()?',
    answer: '`delay()` è semplice ma **blocca tutto**: Arduino non fa nient\'altro durante l\'attesa.\n\n`millis()` è più intelligente: controlla quanto tempo è passato senza fermarsi.\n\n```cpp\n// CON DELAY (bloccante)\ndigitalWrite(13, HIGH);\ndelay(1000);  // Arduino si ferma qui per 1 secondo!\ndigitalWrite(13, LOW);\n\n// CON MILLIS (non bloccante)\nunsigned long precedente = 0;\nvoid loop() {\n  if (millis() - precedente >= 1000) {\n    precedente = millis();\n    // Cambia stato LED\n  }\n  // Arduino può fare ALTRO qui!\n}\n```\n\nUsa `millis()` quando vuoi fare più cose contemporaneamente (es: leggere un sensore E far lampeggiare un LED).',
  },

  // ── IF / ELSE ──────────────────────────────────
  {
    keywords: ['if', 'else', 'condizione', 'confronto', 'uguale'],
    question: 'Come funziona if/else in Arduino?',
    answer: '`if` controlla una condizione e decide cosa fare:\n\n```cpp\nint temperatura = analogRead(A0);\n\nif (temperatura > 500) {\n  // Fa caldo! Accendi ventilatore\n  digitalWrite(9, HIGH);\n} else if (temperatura > 300) {\n  // Temperatura media\n  Serial.println("Tutto ok");\n} else {\n  // Fa freddo\n  digitalWrite(9, LOW);\n}\n```\n\n**Operatori di confronto:**\n- `==` uguale (ATTENZIONE: due =, non uno!)\n- `!=` diverso\n- `>` maggiore, `<` minore\n- `>=` maggiore o uguale, `<=` minore o uguale\n\nErrore comune: scrivere `=` invece di `==`. Un solo `=` assegna un valore, non confronta!',
  },

  // ── FOR ────────────────────────────────────────
  {
    keywords: ['for', 'ciclo', 'ripetere', 'loop', 'contatore'],
    question: 'Come funziona il ciclo for?',
    answer: 'Il ciclo `for` ripete un blocco di codice un numero preciso di volte:\n\n```cpp\n// Accendi 5 LED uno dopo l\'altro\nfor (int i = 2; i <= 6; i++) {\n  digitalWrite(i, HIGH);\n  delay(200);\n}\n```\n\nLe 3 parti:\n1. `int i = 2` → parte dal valore 2\n2. `i <= 6` → continua finché i è ≤ 6\n3. `i++` → dopo ogni giro, aumenta i di 1\n\nQuindi: i=2, i=3, i=4, i=5, i=6 → 5 ripetizioni!\n\nÈ perfetto per controllare più LED, creare effetti luminosi, o fare misurazioni ripetute.',
  },

  // ── MOTORE DC ──────────────────────────────────
  {
    keywords: ['motore', 'dc', 'velocità', 'transistor', 'driver'],
    question: 'Come si controlla un motore DC?',
    answer: 'Un motore DC gira quando gli dai corrente. Ma **non collegarlo direttamente ad Arduino!** Il pin può dare solo 40mA, il motore ne vuole 200-500mA.\n\nServe un **transistor** (come un interruttore elettronico) o un **driver motore** (L293D/L298N):\n\n```cpp\n// Con transistor NPN sul pin 9\nanalogWrite(9, 0);    // Fermo\nanalogWrite(9, 127);  // Metà velocità\nanalogWrite(9, 255);  // Massima velocità\n```\n\nIl transistor amplifica il segnale debole di Arduino per controllare il motore potente. È come un interruttore che si accende con un soffio!',
    relatedExperiment: 'cap9-motor-dc',
  },

  // © Andrea Marro — 20/02/2026

  // ── ERRORI COMUNI ──────────────────────────────
  {
    keywords: ['errore', 'compilazione', 'non', 'compila', 'rosso', 'sbagliato'],
    question: 'Il mio codice non compila, cosa faccio?',
    answer: 'Gli errori di compilazione più comuni:\n\n1. **Punto e virgola mancante** (`;`) — Arduino lo vuole alla fine di ogni istruzione\n2. **Parentesi non chiusa** — Conta le `{` e `}`, devono essere uguali!\n3. **Nome sbagliato** — `digitalwrite` ≠ `digitalWrite` (le maiuscole contano!)\n4. **Variabile non dichiarata** — Devi scrivere `int x = 5;` prima di usare `x`\n5. **Pin inesistente** — Arduino Nano ha pin D0-D13 e A0-A7\n\n**Consiglio**: leggi il messaggio di errore dal basso verso l\'alto. La prima riga di errore spesso è la più utile. Guarda il numero di riga per trovare dove sta il problema!',
  },
  {
    keywords: ['cortocircuito', 'corto', 'circuito', 'caldo', 'brucia', 'fumo'],
    question: 'Cos\'è un cortocircuito e come evitarlo?',
    answer: 'Un cortocircuito succede quando la corrente trova un percorso senza resistenza tra + e -. È come togliere il tappo a una diga: l\'acqua scorre tutta insieme!\n\n**Come evitarlo:**\n1. **Mai collegare 5V direttamente a GND** senza un componente in mezzo\n2. **Usa sempre una resistenza con i LED** (220Ω - 1kΩ)\n3. **Controlla i fili prima di alimentare** il circuito\n4. **Non sovrapporre fili scoperti** sulla breadboard\n\n**Se senti caldo o vedi fumo**: scollega subito il cavo USB! Poi controlla i collegamenti con calma.\n\nNel simulatore ELAB puoi sperimentare senza rischi!',
  },

  // ── VARIABILI ──────────────────────────────────
  {
    keywords: ['variabile', 'int', 'float', 'bool', 'tipo', 'dichiarare'],
    question: 'Cosa sono le variabili in Arduino?',
    answer: 'Le variabili sono "scatole" dove conservi dei valori. Ogni scatola ha un tipo:\n\n```cpp\nint contatore = 0;      // Numero intero (-32768 a 32767)\nfloat temperatura = 23.5; // Numero decimale\nbool acceso = true;      // Vero o Falso\nchar lettera = \'A\';      // Un singolo carattere\nString nome = "ELAB";    // Testo\n```\n\n**Regole:**\n- Il nome non può iniziare con un numero\n- Maiuscole e minuscole contano (`LED` ≠ `led`)\n- Usa nomi descrittivi: `luminosita` è meglio di `x`\n\n`int` basta per la maggior parte dei casi. Usa `float` solo quando serve la precisione decimale (sensori di temperatura).',
  },

  // ── MAP ────────────────────────────────────────
  {
    keywords: ['map', 'convertire', 'scala', 'range', 'mappare'],
    question: 'Come funziona la funzione map()?',
    answer: '`map()` converte un valore da una scala a un\'altra. È come tradurre tra lingue diverse!\n\n```cpp\n// Potenziometro (0-1023) → Servo (0-180)\nint pot = analogRead(A0);          // 0-1023\nint angolo = map(pot, 0, 1023, 0, 180); // 0-180\nmioServo.write(angolo);\n\n// Sensore luce (0-1023) → Luminosità LED (0-255)\nint luce = analogRead(A1);\nint pwm = map(luce, 0, 1023, 0, 255);\nanalogWrite(9, pwm);\n```\n\nSintassi: `map(valore, min_input, max_input, min_output, max_output)`\n\nÈ utilissimo per collegare sensori a motori, LED, o qualsiasi uscita con scala diversa!',
  },

  // ── DOMANDE GENERALI ──────────────────────────
  {
    keywords: ['cosa', 'posso', 'fare', 'progetto', 'idea', 'costruire'],
    question: 'Cosa posso costruire con Arduino?',
    answer: 'Con Arduino e i componenti di ELAB puoi costruire tantissime cose:\n\n **Semaforo** — LED rosso, giallo, verde con temporizzazione\n **Stazione meteo** — Sensore di temperatura + display\n **Piano elettronico** — Pulsanti + buzzer per suonare note\n **Robot evita-ostacoli** — Sensore ultrasuoni + motori\n **Lampada smart** — Fotoresistenza per accensione automatica\n **Gioco di reazione** — LED casuale + pulsante + timer\n **Irrigazione automatica** — Sensore umidità + pompa\n\nInzia dai progetti del libro ELAB e poi modifica e combina le idee. La creatività è il tuo superpotere!',
  },
// © Andrea Marro — 11/04/2026 — ELAB Tutor — Tutti i diritti riservati
  {
    keywords: ['aiuto', 'help', 'come', 'iniziare', 'principiante', 'base'],
    question: 'Come inizio con ELAB?',
    answer: 'Benvenuto in ELAB! Ecco come iniziare:\n\n1. **Apri il Manuale** — Vai alla sezione "Manuale" nella barra laterale. Inizia dal Volume 1, Capitolo 1.\n\n2. **Primo esperimento** — "LED Semplice": colleghi un LED e una resistenza ad Arduino e lo fai accendere.\n\n3. **Usa il Simulatore** — Non serve hardware! Puoi simulare i circuiti direttamente nel browser.\n\n4. **Scrivi il codice** — Usa l\'editor nella tab Simulatore. Il codice si compila automaticamente.\n\n5. **Chiedi a me!** — Sono UNLIM, il tuo tutor. Chiedimi qualsiasi cosa sull\'elettronica!\n\nConsiglio: segui gli esperimenti in ordine, ognuno si basa su quello prima. E non aver paura di sbagliare — nel simulatore non si rompe niente!',
  },

  // ── SENSORE TEMPERATURA ────────────────────────
  {
    keywords: ['temperatura', 'termometro', 'ntc', 'tmp36', 'caldo', 'freddo'],
    question: 'Come si misura la temperatura con Arduino?',
    answer: 'Puoi usare un sensore TMP36 (o NTC):\n\n```cpp\nint lettura = analogRead(A0);\nfloat tensione = lettura * 5.0 / 1023.0;\nfloat temperatura = (tensione - 0.5) * 100; // Per TMP36\nSerial.print("Temperatura: ");\nSerial.print(temperatura);\nSerial.println(" °C");\n```\n\nIl TMP36 ha 3 pin: VCC (5V), segnale (pin analogico), GND. Attenzione a non confondere l\'ordine!\n\n**Idea progetto**: collega un LED rosso che si accende sopra 30°C e un LED blu sotto 20°C!',
  },

  // ── LCD ────────────────────────────────────────
  {
    keywords: ['lcd', 'display', 'schermo', 'scrivere', 'testo', 'i2c'],
    question: 'Come si usa un display LCD?',
    answer: 'Il display LCD mostra testo su 2 righe (16 caratteri ciascuna). Con il modulo I2C servono solo 2 fili dati:\n\n```cpp\n#include <LiquidCrystal_I2C.h>\nLiquidCrystal_I2C lcd(0x27, 16, 2);\n\nvoid setup() {\n  lcd.init();\n  lcd.backlight();\n  lcd.print("Ciao ELAB!");\n}\n\nvoid loop() {\n  lcd.setCursor(0, 1);  // Seconda riga\n  lcd.print(millis()/1000);\n  lcd.print(" secondi");\n}\n```\n\n**Collegamento I2C**: SDA → A4, SCL → A5, VCC → 5V, GND → GND.\n\nPuoi mostrare valori dei sensori, messaggi, o creare un menu interattivo!',
    relatedExperiment: 'cap10-lcd',
  },

  // ── ULTRASUONI ─────────────────────────────────
  {
    keywords: ['ultrasuoni', 'distanza', 'hcsr04', 'eco', 'ping', 'misurare'],
    question: 'Come si misura la distanza con un sensore a ultrasuoni?',
    answer: 'Il sensore HC-SR04 funziona come un pipistrello: emette un suono e ascolta l\'eco!\n\n```cpp\nint trig = 3;\nint echo = 4;\n\nvoid setup() {\n  pinMode(trig, OUTPUT);\n  pinMode(echo, INPUT);\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  digitalWrite(trig, LOW);\n  delayMicroseconds(2);\n  digitalWrite(trig, HIGH);\n  delayMicroseconds(10);\n  digitalWrite(trig, LOW);\n  \n  long durata = pulseIn(echo, HIGH);\n  float distanza = durata * 0.034 / 2; // cm\n  Serial.print(distanza);\n  Serial.println(" cm");\n  delay(200);\n}\n```\n\nMisura da 2cm a 400cm. Perfetto per robot evita-ostacoli!',
  },

  // ── CONCETTI AVANZATI ──────────────────────────
  {
    keywords: ['pullup', 'pull-up', 'flottante', 'floating', 'resistenza', 'interna'],
    question: 'Cos\'è una resistenza di pull-up?',
    answer: 'Quando un pin di input non è collegato a niente, è "flottante" — legge valori casuali. La resistenza di **pull-up** lo tiene a HIGH quando il pulsante non è premuto.\n\nArduino ha resistenze pull-up interne! Basta scrivere:\n\n```cpp\npinMode(2, INPUT_PULLUP); // Attiva pull-up interno\n```\n\nCosì:\n- Pulsante **rilasciato** → pin legge HIGH (5V tramite pull-up)\n- Pulsante **premuto** → pin legge LOW (collegato a GND)\n\nSenza pull-up, il pin fluttua come una barca senza ancora. Il pull-up è l\'ancora!',
  },

  // © Andrea Marro — 20/02/2026

  // ── ELAB SPECIFICO ─────────────────────────────
  {
    keywords: ['simulatore', 'wokwi', 'provare', 'testare', 'virtuale'],
    question: 'Come funziona il simulatore ELAB?',
    answer: 'Il simulatore ELAB ti permette di costruire e testare circuiti senza hardware reale!\n\n**Come usarlo:**\n1. Vai alla tab **Simulatore** nella barra laterale\n2. Scegli un esperimento dal manuale oppure scrivi codice libero\n3. I componenti appaiono sulla breadboard virtuale\n4. Clicca **Compila** per tradurre il codice\n5. Se non ci sono errori, il circuito si anima!\n\n**Cosa puoi fare:**\n- Vedere i LED accendersi e spegnersi\n- Leggere i valori dei sensori\n- Usare il Serial Monitor virtuale\n- Collegare fili trascinando tra i pin\n\nÈ identico a un circuito vero, ma senza rischio di bruciare niente!',
  },
  {
    keywords: ['manuale', 'libro', 'volume', 'capitolo', 'pagina', 'lezione'],
    question: 'Come è organizzato il manuale ELAB?',
    answer: 'Il manuale ELAB è diviso in 3 volumi:\n\n **Volume 1** — Le basi: LED, resistenze, pulsanti, breadboard, primi sketch Arduino\n **Volume 2** — Intermedio: sensori, PWM, motori, comunicazione seriale\n **Volume 3** — Avanzato: progetti complessi, logica combinata, robot\n\nOgni capitolo ha:\n- **Teoria** — Spiegazione del concetto\n- **Esperimento guidato** — Passo dopo passo nel simulatore\n- **Quiz** — 2 domande per verificare la comprensione\n- **Sfida** — Un\'attività libera per sperimentare\n\nPuoi accedere al manuale dalla barra laterale. I capitoli si sbloccano progressivamente!',
  },
  {
    keywords: ['lavagna', 'disegnare', 'whiteboard', 'schizzo', 'disegno'],
    question: 'Come si usa la lavagna?',
    answer: 'La lavagna ti permette di disegnare schemi e annotazioni sopra il simulatore:\n\n**Strumenti:**\n-  **Matita** — Disegno libero\n-  **Gomma** — Cancella parti del disegno\n- **T** **Testo** — Aggiungi etichette e note\n-  **Rettangolo, cerchio, freccia, linea** — Forme geometriche\n\n**Funzioni:**\n- **Annulla/Ripeti** (Ctrl+Z / Ctrl+Y)\n- **6 colori** + spessore regolabile\n- **Salva PNG** — Esporta il disegno come immagine\n- **Salvataggio automatico** — Il disegno si salva per ogni esperimento\n\nUsa la lavagna per annotare i tuoi circuiti, segnare le tensioni, o fare schizzi prima di costruire!',
  },
  {
    keywords: ['galileo', 'chat', 'tutor', 'chiedere', 'domanda'],
    question: 'Come posso usare Galileo?',
    answer: 'Io sono Galileo, il tuo tutor di elettronica! Ecco cosa posso fare:\n\n **Rispondi alle tue domande** — Chiedimi qualsiasi cosa su elettronica e Arduino\n **Ti guido nel manuale** — Ti indico le pagine giuste per approfondire\n **Ti suggerisco esperimenti** — Posso proporti sfide e progetti\n **Ti aiuto col debug** — Descrivi il problema e ti aiuto a risolverlo\n **Analizzo i tuoi disegni** — Puoi mandarmi una foto della lavagna!\n\n**Suggerimenti:**\n- Fai domande specifiche: "Perché il LED non si accende?" è meglio di "Non funziona"\n- Descrivi il tuo circuito: componenti, collegamento, codice\n- Non aver paura di chiedere! Non esistono domande stupide.',
  },

  // ── SICUREZZA ──────────────────────────────────
  {
    keywords: ['sicurezza', 'pericoloso', 'scossa', 'elettricità', 'attenzione'],
    question: 'L\'elettronica è pericolosa?',
    answer: 'Con Arduino e i componenti di ELAB sei al sicuro! La tensione massima è **5 Volt** — una pila produce 9V. Non puoi prendere la scossa.\n\n**Regole di sicurezza:**\n1.  **Non aprire alimentatori o prese di corrente** — quelle SÌ sono pericolose (220V!)\n2.  **Scollega il cavo USB** prima di cambiare i collegamenti\n3.  **Se qualcosa diventa caldo**, scollega subito e controlla i fili\n4.  **Tieni lontano dall\'acqua** — l\'elettronica e l\'acqua non vanno d\'accordo\n5.  **Controlla i collegamenti** prima di alimentare il circuito\n\nNel simulatore ELAB puoi sperimentare senza nessun rischio — è il posto perfetto per imparare!',
  },
];

// ============================================
// KEYWORD MATCHING ENGINE
// Trova la risposta più pertinente alla domanda
// usando un punteggio basato sulle parole chiave
// ============================================

const STOP_WORDS = new Set([
  'il', 'lo', 'la', 'le', 'li', 'gli', 'un', 'uno', 'una',
  'di', 'del', 'dello', 'della', 'dei', 'degli', 'delle',
  'a', 'al', 'allo', 'alla', 'ai', 'agli', 'alle',
  'da', 'dal', 'dallo', 'dalla', 'dai', 'dagli', 'dalle',
  'in', 'nel', 'nello', 'nella', 'nei', 'negli', 'nelle',
  'con', 'su', 'sul', 'sullo', 'sulla', 'sui', 'sugli', 'sulle',
  'per', 'tra', 'fra', 'e', 'o', 'ma', 'che', 'chi', 'come',
  'è', 'sono', 'ha', 'ho', 'hai', 'hanno', 'questo', 'questa',
  'quello', 'quella', 'mio', 'mia', 'tuo', 'tua', 'suo', 'sua',
  'cosa', 'mi', 'ti', 'si', 'ci', 'vi', 'me', 'te', 'se',
  'non', 'più', 'anche', 'solo', 'già', 'ancora', 'poi',
  'molto', 'poco', 'tanto', 'quanto', 'quale', 'dove', 'quando',
]);

/**
 * Cerca nella knowledge base la risposta più pertinente.
 * @param {string} message — la domanda dell'utente
 * @returns {{ answer: string, question: string, score: number, relatedExperiment?: string } | null}
 *          null se nessuna risposta supera la soglia minima
 */
export function searchKnowledgeBase(message) {
  if (!message || typeof message !== 'string') return null;

  const words = message
    .toLowerCase()
    .replace(/[^a-zà-ú0-9\s']/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 1 && !STOP_WORDS.has(w));

  if (words.length === 0) return null;

  let bestMatch = null;
  let bestScore = 0;

  for (const entry of KNOWLEDGE_BASE) {
    let score = 0;
    for (const word of words) {
      for (const kw of entry.keywords) {
        if (word === kw) {
          score += 3; // exact match
        } else if (word.includes(kw) || kw.includes(word)) {
          score += 1.5; // partial match
        }
      }
      // Bonus: match in question text
      if (entry.question.toLowerCase().includes(word)) {
        score += 0.5;
      }
    }

    // Normalize by number of keywords (avoid bias toward entries with more keywords)
    const normalizedScore = score / Math.max(entry.keywords.length, 1);

    if (normalizedScore > bestScore) {
      bestScore = normalizedScore;
      bestMatch = entry;
    }
  }

  // Soglia minima: almeno 1.5 punti normalizzati
  if (bestScore < 1.5 || !bestMatch) return null;

  return {
    answer: bestMatch.answer,
    question: bestMatch.question,
    score: bestScore,
    relatedExperiment: bestMatch.relatedExperiment || null,
  };
}

// © Andrea Marro — 20/02/2026
