// © Andrea Marro — 13 Febbraio 2026 — Tutti i diritti riservati.
/**
 * ELAB Experiments — Volume 2: Approfondiamo
 * 27 esperimenti — SOLO batteria 9V, ZERO Arduino (Cap 3-12)
 * Verificato CoVe dai PDF reali del Volume 2
 * Layout ricalcolato: componenti posizionati sui fori della breadboard
 *
 * COORDINATE REFERENCE (bb1 at {x:100, y:10}):
 *   col cx = 117.75 + (col-1)*7.5   (col 1..30)
 *   row a=43.75  b=51.25  c=58.75  d=66.25  e=73.75
 *   row f=91.25  g=98.75  h=106.25 i=113.75 j=121.25
 *
 * PIN OFFSETS (verified from JSX source 21/02/2026 — CORRECTED):
 *   Resistor      pin1=(-26.25,0)  pin2=(26.25,0)       horiz span=52.5 (7 cols)
 *   LED           anode=(-3.75,22.5) cathode=(3.75,22.5) below center, span=7.5 (1 col)
 *   Capacitor     positive=(-7.5,-15) negative=(7.5,15)  diagonal
 *   PushButton    pin1=(-15,-7.5) pin2=(15,-7.5) pin3=(-15,7.5) pin4=(15,7.5)
 *   MosfetN       gate=(-20,0)  drain=(0,-22) source=(0,22)
 *   Phototransistor collector=(0,-18) emitter=(0,18)
 *   MotorDC       positive=(-7.5,-16)  negative=(7.5,-16)
 *   Diode         anode=(-20,0) cathode=(20,0)           horiz span=40 (~5.3 cols)
 *   Multimeter    probe-neg=(-7.5,45) probe-pos=(7.5,45)
 *   Potentiometer vcc=(-7.5,22.5) signal=(0,22.5) gnd=(7.5,22.5)
 *   Battery9V     positive=(-15,42) negative=(15,42)
 *
 * LAYOUT FORMULAS (component position = hole_abs - pin_offset):
 *   Resistor on e-row cols A..B:  x = holeCx(A)+26.25,  y = 73.75
 *   Resistor on f-row cols A..B:  x = holeCx(A)+26.25,  y = 91.25
 *   LED anode on d-row col A:     x = holeCx(A)+3.75,   y = 43.75  (d=66.25 - 22.5)
 *   Button pin1 at e-col A:       x = holeCx(A)+15,     y = 81.25  (e=73.75 - (-7.5))
 *   Capacitor pos at e-col A:     x = holeCx(A)+7.5,    y = 88.75  (e=73.75 - (-15))
 *   Potentiometer vcc at f-col A: x = holeCx(A)+7.5,    y = 68.75  (f=91.25 - 22.5)
 *   holeCx(col) = 117.75 + (col-1)*7.5
 *
 * © Andrea Marro — 10/02/2026
 */

const EXPERIMENTS_VOL2 = {
  title: "Volume 2 - Approfondiamo",
  subtitle: "Multimetro, resistenze, batterie, condensatori, transistor, motori",
  icon: "\u{1F4D9}",
  color: "#E8941C",
  experiments: [
    // ═══════════════════════════════════════════════════
    // CAPITOLO 3 — Il Multimetro (4 esperimenti)
    // ═══════════════════════════════════════════════════
    {
      id: "v2-cap3-esp1",
      title: "Cap. 3 Esp. 1 - Controlliamo la carica della batteria",
      desc: "Usiamo il multimetro per misurare quanti Volt ha la nostra batteria da 9V. Scopriamo se e carica!",
      chapter: "Capitolo 3 - Il Multimetro",
      difficulty: 1,
      simulable: false,
      simulableReason: "Richiede multimetro fisico",
      icon: "\u{1F50B}",
      simulationMode: "circuit",
      components: [
        { type: "battery9v", id: "bat1" },
        { type: "multimeter", id: "mm1" },
      ],
      connections: [],
      layout: {
        "bat1": { x: 15, y: 60 },
        "mm1": { x: 120, y: 40 }
      },
      code: null,
      hexFile: null,
      concept: "Multimetro in modalita voltmetro, tensione batteria, carica/scarica",
      layer: "schema",
      steps: [
        "Posiziona la batteria 9V a sinistra del piano di lavoro.",
        "Posiziona il multimetro e impostalo su V (Volt).",
        "Collega il puntale rosso al polo + e il nero al polo -.",
        "Leggi il valore: una batteria nuova segna circa 9.4-9.6V!"
      ],
      observe: "Il multimetro mostra la tensione della batteria. Se e sopra 9V e carica, sotto 7V e quasi scarica. Il voltmetro si collega sempre IN PARALLELO.",
      unlimPrompt: "Sei Galileo, il tutor AI di ELAB. Lo studente sta misurando la tensione di una batteria 9V con il multimetro. Il multimetro va in modalita V (Volt) e si collega IN PARALLELO: rosso al + e nero al -. Una batteria nuova misura circa 9.4-9.6V. Sotto 7V e scarica. Spiega in modo semplice per bambini 10-14 anni. Rispondi in italiano.",
      buildSteps: [
        {
          step: 1,
          text: "Posiziona la batteria 9V a sinistra del piano di lavoro. Questa sara la nostra sorgente di energia da misurare!",
          componentId: "bat1",
          componentType: "battery9v",
          hint: "La batteria 9V ha un polo positivo (+) e uno negativo (-). Posizionala a sinistra."
        },
        {
          step: 2,
          text: "Posiziona il multimetro accanto alla batteria. Impostalo sulla modalita V (Volt) per misurare la tensione.",
          componentId: "mm1",
          componentType: "multimeter",
          hint: "Il multimetro misura tensione (V), corrente (A) e resistenza (Ohm)."
        },
        {
          step: 3,
          text: "Collega il puntale rosso del multimetro al polo positivo (+) della batteria.",
          wireFrom: "mm1:positive",
          wireTo: "bat1:positive",
          wireColor: "red",
          hint: "Il puntale rosso va sempre al polo positivo!"
        },
        {
          step: 4,
          text: "Collega il puntale nero del multimetro al polo negativo (-) della batteria. Leggi il valore: una batteria nuova segna circa 9.4-9.6V!",
          wireFrom: "mm1:negative",
          wireTo: "bat1:negative",
          wireColor: "black",
          hint: "Il puntale nero va al polo negativo. Dovresti leggere circa 9V!"
        }
      ],
      quiz: [
        { question: "A cosa serve il multimetro?", options: ["A caricare la batteria", "A misurare tensione, corrente e resistenza", "A far suonare il buzzer"], correct: 1, explanation: "Il multimetro e uno strumento che puo misurare tante cose: Volt (tensione), Ampere (corrente) e Ohm (resistenza)!" },
        { question: "Che valore ti aspetti misurando una batteria 9V nuova?", options: ["Circa 1.5V", "Circa 9V o poco piu", "Circa 220V"], correct: 1, explanation: "Una batteria 9V nuova misura circa 9.4-9.6V. Se e sotto 7V, e quasi scarica!" },
      ],
    },
    {
      id: "v2-cap3-esp2",
      title: "Cap. 3 Esp. 2 - Diario di misurazione della pila",
      desc: "Misuriamo la batteria ogni giorno e segniamo il valore. Quanto dura davvero una batteria 9V?",
      chapter: "Capitolo 3 - Il Multimetro",
      difficulty: 1,
      simulable: false,
      simulableReason: "Richiede multimetro fisico",
      icon: "\u{1F4D3}",
      simulationMode: "circuit",
      components: [
        { type: "battery9v", id: "bat1" },
        { type: "multimeter", id: "mm1" },
      ],
      connections: [],
      layout: {
        "bat1": { x: 15, y: 60 },
        "mm1": { x: 120, y: 40 }
      },
      code: null,
      hexFile: null,
      concept: "Scarica batteria nel tempo, misurazione ripetuta, diario scientifico",
      layer: "schema",
      steps: [
        "Misura la tensione della batteria ogni giorno alla stessa ora.",
        "Segna il valore su un foglio o un quaderno.",
        "Dopo una settimana, confronta i valori: la tensione scende?"
      ],
      observe: "La tensione scende lentamente nel tempo man mano che l'energia chimica si esaurisce. Una batteria nuova parte da ~9.5V e arriva a ~7V quando e quasi scarica.",
      unlimPrompt: "Sei Galileo, il tutor AI di ELAB. Lo studente sta facendo un diario di misurazione della batteria. Ogni giorno misura la tensione e la segna. E un esperimento di metodo scientifico: raccolta dati nel tempo! La batteria si scarica perche l'energia chimica si esaurisce. Sotto 7V e da cambiare. Spiega il metodo scientifico in modo semplice. Rispondi in italiano.",
      buildSteps: [
        {
          step: 1,
          text: "Posiziona la batteria 9V a sinistra del piano di lavoro. Oggi iniziamo il nostro diario scientifico!",
          componentId: "bat1",
          componentType: "battery9v",
          hint: "Ogni giorno misureremo questa batteria e segneremo il valore. Posizionala a sinistra."
        },
        {
          step: 2,
          text: "Posiziona il multimetro e impostalo su V (Volt). Sara il nostro strumento di misura quotidiano.",
          componentId: "mm1",
          componentType: "multimeter",
          hint: "Il multimetro ci dice quanta energia ha ancora la batteria."
        },
        {
          step: 3,
          text: "Collega il puntale rosso del multimetro al polo positivo (+) della batteria.",
          wireFrom: "mm1:positive",
          wireTo: "bat1:positive",
          wireColor: "red",
          hint: "Rosso al positivo, come sempre!"
        },
        {
          step: 4,
          text: "Collega il puntale nero al polo negativo (-). Segna il valore sul quaderno: questa e la misura del Giorno 1!",
          wireFrom: "mm1:negative",
          wireTo: "bat1:negative",
          wireColor: "black",
          hint: "Ripeti ogni giorno alla stessa ora e confronta i valori. La tensione scendera piano piano!"
        }
      ],
      quiz: [
        { question: "Perche la tensione della batteria diminuisce col tempo?", options: ["Perche fa freddo", "Perche l'energia chimica dentro si esaurisce", "Perche il multimetro la consuma"], correct: 1, explanation: "La batteria converte energia chimica in elettrica. Quando i reagenti chimici si esauriscono, la tensione scende!" },
        { question: "Sotto quale valore una batteria 9V e quasi scarica?", options: ["Sotto 8V", "Sotto 7V", "Sotto 5V"], correct: 1, explanation: "Sotto 7V la batteria non riesce piu a far funzionare bene i circuiti. E ora di cambiarla!" },
      ],
    },
    {
      id: "v2-cap3-esp3",
      title: "Cap. 3 Esp. 3 - Misuriamo una resistenza",
      desc: "Impariamo a misurare il valore di una resistenza con il multimetro. Le bande colorate dicono la verita?",
      chapter: "Capitolo 3 - Il Multimetro",
      difficulty: 1,
      simulable: false,
      simulableReason: "Richiede multimetro fisico",
      icon: "\u{1F3A8}",
      simulationMode: "circuit",
      components: [
        { type: "resistor", id: "r1", value: 330 },
        { type: "multimeter", id: "mm1" },
      ],
      connections: [],
      layout: {
        "r1": { x: 15, y: 60 },
        "mm1": { x: 120, y: 40 }
      },
// © Andrea Marro — 13/04/2026 — ELAB Tutor — Tutti i diritti riservati
      code: null,
      hexFile: null,
      concept: "Ohmmetro, bande colorate, tolleranza resistenza, verifica pratica",
      layer: "schema",
      steps: [
        "Prendi un resistore da 330 Ohm e leggi le bande colorate.",
        "Imposta il multimetro su Ohm (simbolo omega).",
        "Tocca i terminali del resistore con i puntali.",
        "Confronta il valore misurato con quello delle bande: sono uguali?"
      ],
      observe: "Il multimetro misura ~328-332 Ohm per un resistore da 330 Ohm. La differenza e normale: ogni resistore ha una tolleranza del 5% (tra 313 e 347 Ohm).",
      unlimPrompt: "Sei Galileo, il tutor AI di ELAB. Lo studente sta misurando una resistenza con il multimetro in modalita Ohm. Le bande colorate indicano il valore nominale (330 Ohm), ma il valore reale puo variare del 5%. Il multimetro manda una piccola corrente e calcola R = V/I. Spiega la tolleranza con un'analogia semplice. Rispondi in italiano.",
      buildSteps: [
        {
          step: 1,
          text: "Prendi il resistore da 330\u03A9 e posizionalo a sinistra del piano di lavoro. Guarda le bande colorate: arancione-arancione-marrone!",
          componentId: "r1",
          componentType: "resistor",
          hint: "Le bande colorate indicano il valore: arancione=3, arancione=3, marrone=x10 = 330\u03A9. Posizionalo a sinistra."
        },
        {
          step: 2,
          text: "Posiziona il multimetro accanto al resistore e impostalo sulla modalita Ohm (il simbolo omega).",
          componentId: "mm1",
          componentType: "multimeter",
          hint: "La modalita Ohm serve per misurare le resistenze."
        },
        {
          step: 3,
          text: "Collega un puntale del multimetro a un terminale del resistore.",
          wireFrom: "mm1:positive",
          wireTo: "r1:pin1",
          wireColor: "red",
          hint: "Non importa la polarita per misurare la resistenza!"
        },
        {
          step: 4,
          text: "Collega l'altro puntale all'altro terminale del resistore. Leggi il valore: e vicino a 330 Ohm?",
          wireFrom: "mm1:negative",
          wireTo: "r1:pin2",
          wireColor: "black",
          hint: "Il valore misurato puo variare del 5% rispetto alle bande colorate. E normale!"
        }
      ],
      quiz: [
        { question: "In che modalita devi mettere il multimetro per misurare una resistenza?", options: ["V (Volt)", "A (Ampere)", "Ohm (simbolo omega)"], correct: 2, explanation: "Per misurare le resistenze serve la modalita Ohm, indicata dal simbolo greco omega. Il multimetro manda una piccola corrente e calcola la resistenza!" },
        { question: "Se le bande dicono 330 Ohm e il multimetro misura 328 Ohm, e un problema?", options: ["Si, la resistenza e rotta", "No, e normale — le resistenze hanno una tolleranza del 5%", "Si, bisogna cambiarla"], correct: 1, explanation: "Le resistenze hanno una tolleranza (di solito +-5%). Quindi 330 Ohm puo misurare da 313 a 347 Ohm. 328 e perfettamente nella norma!" },
      ],
    },
    {
      id: "v2-cap3-esp4",
      title: "Cap. 3 Esp. 4 - Misuriamo la corrente in un circuito",
      desc: "Colleghiamo il multimetro IN SERIE per misurare quanta corrente passa. La Legge di Ohm funziona davvero?",
      chapter: "Capitolo 3 - Il Multimetro",
      difficulty: 2,
      simulable: false,
      simulableReason: "Richiede multimetro fisico",
      icon: "\u{26A1}",
      simulationMode: "circuit",
      components: [
        { type: "battery9v", id: "bat1" },
        { type: "breadboard-half", id: "bb1" },
        { type: "resistor", id: "r1", value: 1000 },
        { type: "multimeter", id: "mm1" },
      ],
      pinAssignments: {
        "r1:pin1": "bb1:a6",
        "r1:pin2": "bb1:a13"
      },
      connections: [],
      layout: {
        "bat1": { x: 15, y: 60 },
        "bb1": { x: 100, y: 10 },
        "r1": { x: 185, y: 43.75 },
        "mm1": { x: 260, y: 40 }
      },
      code: null,
      hexFile: null,
      concept: "Amperometro in serie, Legge di Ohm, corrente in mA",
      layer: "schema",
      steps: [
        "Costruisci un circuito: batteria 9V + resistore 1kOhm sulla breadboard.",
        "Imposta il multimetro su A (Ampere) o mA.",
        "Collega il multimetro IN SERIE: interrompi il circuito e inseriscilo nel mezzo.",
        "Leggi il valore: dovrebbe essere circa 9mA (I = V/R = 9/1000)."
      ],
      observe: "Il multimetro misura circa 9mA. La Legge di Ohm funziona: I = V/R = 9V / 1000 Ohm = 0.009A = 9mA. Il multimetro per la corrente va IN SERIE, non in parallelo!",
      unlimPrompt: "Sei Galileo, il tutor AI di ELAB. Lo studente sta misurando la corrente con il multimetro IN SERIE. La Legge di Ohm dice I = V/R = 9V/1000 Ohm = 9mA. Attenzione: per misurare la corrente il multimetro va IN SERIE (interrompendo il circuito), per la tensione va IN PARALLELO. Spiega la differenza con un'analogia dell'acqua. Rispondi in italiano.",
      buildSteps: [
        {
          step: 1,
          text: "Posiziona la breadboard (mezza) al centro del piano di lavoro. Sara la base per il nostro circuito!",
          componentId: "bb1",
          componentType: "breadboard-half",
          hint: "La breadboard permette di collegare i componenti senza saldature."
        },
        {
          step: 2,
          text: "Posiziona la batteria 9V a sinistra della breadboard. E la fonte di energia.",
          componentId: "bat1",
          componentType: "battery9v",
          hint: "La batteria fornisce 9 Volt al circuito."
        },
        {
          step: 3,
          text: "Inserisci il resistore da 1k\u03A9 nei fori A6 e A13 della breadboard (fila A, sezione superiore).",
          componentId: "r1",
          componentType: "resistor",
          targetPins: { "r1:pin1": "bb1:a6", "r1:pin2": "bb1:a13" },
          hint: "1k\u03A9 = 1000\u03A9. Bande: marrone-nero-rosso. Un terminale in A6, l'altro in A13."
        },
        {
          step: 4,
          text: "Posiziona il multimetro e impostalo su A (Ampere) o mA. Attenzione: per la corrente va IN SERIE!",
          componentId: "mm1",
          componentType: "multimeter",
          hint: "Per misurare la corrente il multimetro va inserito NEL circuito, non in parallelo!"
        },
        {
          step: 5,
          text: "Collega un filo rosso dal polo + della batteria a un terminale del multimetro. Il multimetro entra IN SERIE nel circuito!",
          wireFrom: "bat1:positive",
          wireTo: "mm1:positive",
          wireColor: "red",
          hint: "La corrente deve PASSARE ATTRAVERSO il multimetro."
        },
        {
          step: 6,
          text: "Collega un filo dall'altro terminale del multimetro al resistore sulla breadboard.",
          wireFrom: "mm1:negative",
          wireTo: "r1:pin1",
          wireColor: "orange",
          hint: "La corrente va dal multimetro al resistore."
        },
        {
          step: 7,
          text: "Collega un filo nero dall'altro terminale del resistore al polo negativo della batteria. Il circuito e chiuso! Leggi: circa 9mA.",
          wireFrom: "r1:pin2",
          wireTo: "bat1:negative",
          wireColor: "black",
          hint: "I = V/R = 9V / 1000 Ohm = 0.009A = 9mA. La Legge di Ohm funziona!"
        }
      ],
      quiz: [
        { question: "Come si collega il multimetro per misurare la corrente?", options: ["In parallelo al componente", "In serie (interrompendo il circuito)", "Non importa come"], correct: 1, explanation: "Per misurare la corrente il multimetro deve stare IN SERIE: la corrente deve passare ATTRAVERSO il multimetro. Devi interrompere il circuito e inserirlo nel mezzo!" },
        { question: "Con 9V e 1kOhm, quanta corrente passa? (V=RxI)", options: ["9 Ampere", "9 milliAmpere (0.009A)", "1000 milliAmpere"], correct: 1, explanation: "I = V/R = 9V / 1000 Ohm = 0.009A = 9mA. La Legge di Ohm funziona!" },
      ],
    },

    // ═══════════════════════════════════════════════════
    // CAPITOLO 4 — Approfondiamo le Resistenze (3 esperimenti)
    // ═══════════════════════════════════════════════════
    {
      id: "v2-cap4-esp1",
      title: "Cap. 4 Esp. 1 - Due resistori in parallelo",
      desc: "Mettiamo due resistori da 1kOhm in parallelo e misuriamo. Il risultato e la meta!",
      chapter: "Capitolo 4 - Approfondiamo le Resistenze",
      difficulty: 2,
      icon: "\u{1F500}",
      simulationMode: "circuit",
      components: [
        { type: "breadboard-half", id: "bb1" },
        { type: "resistor", id: "r1", value: 1000 },
        { type: "resistor", id: "r2", value: 1000 },
        { type: "multimeter", id: "mm1" },
      ],
      pinAssignments: {
        "r1:pin1": "bb1:a6",
        "r1:pin2": "bb1:a13",
        "r2:pin1": "bb1:c6",
        "r2:pin2": "bb1:c13"
      },
      connections: [],
      layout: {
        "bb1": { x: 100, y: 10 },
        "r1": { x: 185, y: 43.75 },
        "r2": { x: 215, y: 43.75 },
        "mm1": { x: 260, y: 40 }
      },
      code: null,
      hexFile: null,
      concept: "Resistenze in parallelo, formula 1/Rtot, la corrente sceglie la strada piu facile",
      layer: "schema",
      steps: [
        "Inserisci due resistori da 1kOhm in parallelo sulla breadboard.",
        "Imposta il multimetro su Ohm.",
        "Misura la resistenza totale: dovrebbe essere circa 500 Ohm!",
        "Prova con valori diversi: cosa succede con 1kOhm + 2kOhm?"
      ],
      observe: "Due resistori da 1kOhm in parallelo danno 500 Ohm — la meta! In parallelo la resistenza totale e MINORE di ogni singola. Come un'autostrada con piu corsie: piu strade, meno ingorgo.",
      unlimPrompt: "Sei Galileo, il tutor AI di ELAB. Lo studente sta misurando resistori in parallelo. Due da 1kOhm in parallelo danno 500 Ohm. Formula: 1/Rtot = 1/R1 + 1/R2. In parallelo la resistenza DIMINUISCE perche la corrente ha piu strade. Analogia dell'autostrada: piu corsie = meno traffico. Rispondi in italiano.",
      buildSteps: [
        {
          step: 1,
          text: "Posiziona la breadboard (mezza) al centro del piano di lavoro. Ci servira per collegare i resistori in parallelo.",
          componentId: "bb1",
          componentType: "breadboard-half",
          hint: "Sulla breadboard i fori della stessa colonna (a-e) sono collegati tra loro."
        },
        {
// © Andrea Marro — 13/04/2026 — ELAB Tutor — Tutti i diritti riservati
          step: 2,
          text: "Inserisci il primo resistore da 1k\u03A9 nei fori A6 e A13 della breadboard (fila A).",
          componentId: "r1",
          componentType: "resistor",
          targetPins: { "r1:pin1": "bb1:a6", "r1:pin2": "bb1:a13" },
          hint: "1k\u03A9 = 1000\u03A9. Bande colorate: marrone-nero-rosso. Terminali in A6 e A13."
        },
        {
          step: 3,
          text: "Inserisci il secondo resistore da 1k\u03A9 nei fori C6 e C13 — IN PARALLELO al primo (stesse colonne 6 e 13)!",
          componentId: "r2",
          componentType: "resistor",
          targetPins: { "r2:pin1": "bb1:c6", "r2:pin2": "bb1:c13" },
          hint: "In parallelo i resistori condividono le stesse colonne. Colonna 6 e 13 collegano i terminali."
        },
        {
          step: 4,
          text: "Posiziona il multimetro e impostalo su Ohm. Misureremo la resistenza totale.",
          componentId: "mm1",
          componentType: "multimeter",
          hint: "Il multimetro in modalita Ohm misura la resistenza."
        },
        {
          step: 5,
          text: "Collega un puntale del multimetro a un capo dei resistori in parallelo.",
          wireFrom: "mm1:positive",
          wireTo: "r1:pin1",
          wireColor: "red",
          hint: "Entrambi i resistori hanno lo stesso punto di partenza."
        },
        {
          step: 6,
          text: "Collega l'altro puntale all'altro capo. Leggi: circa 500 Ohm! La meta di 1000!",
          wireFrom: "mm1:negative",
          wireTo: "r1:pin2",
          wireColor: "black",
          hint: "1/Rtot = 1/R1 + 1/R2 = 1/1000 + 1/1000 = 2/1000, quindi Rtot = 500 Ohm!"
        }
      ],
      quiz: [
        { question: "Due resistori da 1kOhm in parallelo danno:", options: ["2000 Ohm", "500 Ohm", "1000 Ohm"], correct: 1, explanation: "In parallelo la resistenza totale e MINORE di ogni singola resistenza! La formula: 1/Rtot = 1/R1 + 1/R2 = 1/1000 + 1/1000 = 2/1000. Rtot = 500 Ohm!" },
        { question: "Perche in parallelo la resistenza diminuisce?", options: ["Perche i resistori si rompono", "Perche la corrente ha piu strade dove passare", "Perche il multimetro sbaglia"], correct: 1, explanation: "Come un'autostrada: piu corsie ci sono, piu macchine (corrente) possono passare contemporaneamente. Piu strade = meno resistenza totale!" },
      ],
    },
    {
      id: "v2-cap4-esp2",
      title: "Cap. 4 Esp. 2 - Tre resistori in serie",
      desc: "Mettiamo tre resistori da 1kOhm in serie. La resistenza totale si somma!",
      chapter: "Capitolo 4 - Approfondiamo le Resistenze",
      difficulty: 2,
      icon: "\u{1F4CF}",
      simulationMode: "circuit",
      components: [
        { type: "breadboard-half", id: "bb1" },
        { type: "resistor", id: "r1", value: 1000 },
        { type: "resistor", id: "r2", value: 1000 },
        { type: "resistor", id: "r3", value: 1000 },
        { type: "multimeter", id: "mm1" },
      ],
      pinAssignments: {
        "r1:pin1": "bb1:a4",
        "r1:pin2": "bb1:a11",
        "r2:pin1": "bb1:a12",
        "r2:pin2": "bb1:a19",
        "r3:pin1": "bb1:a20",
        "r3:pin2": "bb1:a27"
      },
      connections: [],
      layout: {
        "bb1": { x: 100, y: 10 },
        "r1": { x: 170, y: 43.75 },
        "r2": { x: 200, y: 43.75 },
        "r3": { x: 230, y: 43.75 },
        "mm1": { x: 280, y: 40 }
      },
      code: null,
      hexFile: null,
      concept: "Resistenze in serie, somma dei valori, ostacoli in fila",
      layer: "schema",
      steps: [
        "Inserisci tre resistori da 1kOhm in serie sulla breadboard.",
        "Imposta il multimetro su Ohm.",
        "Misura la resistenza totale: dovrebbe essere circa 3000 Ohm!",
        "Togli un resistore e rimisura: 2000 Ohm. In serie si sommano!"
      ],
      observe: "Tre resistori da 1kOhm in serie danno 3kOhm. In serie le resistenze si SOMMANO, come mettere in fila tre porte strette: devi passare tutte e tre!",
      unlimPrompt: "Sei Galileo, il tutor AI di ELAB. Lo studente sta misurando resistori in serie. Tre da 1kOhm in serie danno 3kOhm. In serie si sommano: Rtot = R1 + R2 + R3. Analogia: tre porte strette in fila — devi passare tutte. Confronta con il parallelo: in serie AUMENTA, in parallelo DIMINUISCE. Rispondi in italiano.",
      buildSteps: [
        {
          step: 1,
          text: "Posiziona la breadboard (mezza) al centro del piano di lavoro. Ci servira per mettere i resistori in fila.",
          componentId: "bb1",
          componentType: "breadboard-half",
          hint: "La breadboard collega automaticamente i fori nella stessa colonna."
        },
        {
          step: 2,
          text: "Inserisci il primo resistore da 1k\u03A9 nei fori A4 e A11 della breadboard.",
          componentId: "r1",
          componentType: "resistor",
          targetPins: { "r1:pin1": "bb1:a4", "r1:pin2": "bb1:a11" },
          hint: "1k\u03A9 = 1000\u03A9. Bande: marrone-nero-rosso. Terminali in A4 e A11."
        },
        {
          step: 3,
          text: "Inserisci il secondo resistore da 1k\u03A9 nei fori A12 e A19 — IN SERIE al primo (colonna 11 e 12 sono vicine).",
          componentId: "r2",
          componentType: "resistor",
          targetPins: { "r2:pin1": "bb1:a12", "r2:pin2": "bb1:a19" },
          hint: "In serie i resistori stanno uno dopo l'altro. Il pin2 di R1 (col 11) e il pin1 di R2 (col 12) sono collegati dalla stessa colonna."
        },
        {
          step: 4,
          text: "Inserisci il terzo resistore da 1k\u03A9 nei fori A20 e A27 — IN SERIE dopo il secondo.",
          componentId: "r3",
          componentType: "resistor",
          targetPins: { "r3:pin1": "bb1:a20", "r3:pin2": "bb1:a27" },
          hint: "Tre resistori in fila: la corrente deve attraversare tutti e tre! Da A4 fino a A27."
        },
        {
          step: 5,
          text: "Posiziona il multimetro e impostalo su Ohm per misurare la resistenza totale.",
          componentId: "mm1",
          componentType: "multimeter",
          hint: "Misuriamo dal primo all'ultimo: la resistenza si somma!"
        },
        {
          step: 6,
          text: "Collega un puntale del multimetro all'inizio del primo resistore.",
          wireFrom: "mm1:positive",
          wireTo: "r1:pin1",
          wireColor: "red",
          hint: "Misuriamo tutta la catena di resistori."
        },
        {
          step: 7,
          text: "Collega l'altro puntale alla fine dell'ultimo resistore. Leggi: circa 3000 Ohm! Si sommano!",
          wireFrom: "mm1:negative",
          wireTo: "r3:pin2",
          wireColor: "black",
          hint: "Rtot = R1 + R2 + R3 = 1000 + 1000 + 1000 = 3000 Ohm = 3kOhm!"
        }
      ],
      quiz: [
        { question: "Tre resistori da 1kOhm in serie danno:", options: ["333 Ohm", "1000 Ohm", "3000 Ohm"], correct: 2, explanation: "In serie le resistenze si sommano: 1000 + 1000 + 1000 = 3000 Ohm = 3kOhm. Semplice come mettere in fila tre tubi stretti!" },
        { question: "Se aggiungi un quarto resistore da 1kOhm in serie, quanto diventa?", options: ["4000 Ohm", "250 Ohm", "1000 Ohm"], correct: 0, explanation: "Basta sommare: 1000 x 4 = 4000 Ohm = 4kOhm. In serie si sommano sempre!" },
      ],
    },
    {
      id: "v2-cap4-esp3",
      title: "Cap. 4 Esp. 3 - Partitore di tensione",
      desc: "Tre resistori in serie creano punti a tensione diversa. Misuriamo con il multimetro!",
      chapter: "Capitolo 4 - Approfondiamo le Resistenze",
      difficulty: 2,
      icon: "\u{1F4CA}",
      simulationMode: "circuit",
      components: [
        { type: "battery9v", id: "bat1" },
        { type: "breadboard-half", id: "bb1" },
        { type: "resistor", id: "r1", value: 1000 },
        { type: "resistor", id: "r2", value: 1000 },
        { type: "resistor", id: "r3", value: 1000 },
        { type: "multimeter", id: "mm1" },
      ],
      pinAssignments: {
        "r1:pin1": "bb1:a4",
        "r1:pin2": "bb1:a11",
        "r2:pin1": "bb1:a12",
        "r2:pin2": "bb1:a19",
        "r3:pin1": "bb1:a20",
        "r3:pin2": "bb1:a27"
      },
      connections: [],
      layout: {
        "bat1": { x: 15, y: 60 },
        "bb1": { x: 100, y: 10 },
        "r1": { x: 170, y: 43.75 },
        "r2": { x: 200, y: 43.75 },
        "r3": { x: 230, y: 43.75 },
        "mm1": { x: 280, y: 40 }
      },
      code: null,
      hexFile: null,
      concept: "Partitore di tensione, tensione proporzionale alla resistenza, punti di misura",
      layer: "schema",
      steps: [
        "Costruisci un circuito con 3 resistori da 1kOhm in serie e una batteria 9V.",
        "Misura la tensione ai capi di ogni resistore: dovrebbe essere circa 3V ciascuno.",
        "Misura tra il primo e l'ultimo resistore: 6V!",
        "Il partitore di tensione divide la tensione in proporzione ai valori."
      ],
      observe: "Con 3 resistori uguali e 9V, ogni resistore ha 3V ai capi. Tra il primo e il secondo punto: 3V. Tra il primo e il terzo: 6V. La tensione si divide proporzionalmente!",
      unlimPrompt: "Sei Galileo, il tutor AI di ELAB. Lo studente sta costruendo un partitore di tensione con 3 resistori uguali e 9V. Ogni resistore ha 3V ai capi (9V / 3). Il partitore serve per ottenere tensioni intermedie da una sorgente fissa. E usato ovunque in elettronica! Rispondi in italiano.",
      buildSteps: [
        {
          step: 1,
          text: "Posiziona la breadboard (mezza) al centro del piano di lavoro. Sara la base del partitore di tensione!",
          componentId: "bb1",
          componentType: "breadboard-half",
          hint: "Il partitore di tensione divide la tensione in parti proporzionali."
// © Andrea Marro — 13/04/2026 — ELAB Tutor — Tutti i diritti riservati
        },
        {
          step: 2,
          text: "Posiziona la batteria 9V a sinistra della breadboard. Fornira i 9 Volt da dividere.",
          componentId: "bat1",
          componentType: "battery9v",
          hint: "I 9V verranno divisi equamente tra i 3 resistori: 3V ciascuno!"
        },
        {
          step: 3,
          text: "Inserisci il primo resistore da 1k\u03A9 nei fori A4 e A11 della breadboard.",
          componentId: "r1",
          componentType: "resistor",
          targetPins: { "r1:pin1": "bb1:a4", "r1:pin2": "bb1:a11" },
          hint: "Primo resistore della catena (A4-A11): avra 3V ai suoi capi."
        },
        {
          step: 4,
          text: "Inserisci il secondo resistore da 1k\u03A9 nei fori A12 e A19 — in serie dopo il primo.",
          componentId: "r2",
          componentType: "resistor",
          targetPins: { "r2:pin1": "bb1:a12", "r2:pin2": "bb1:a19" },
          hint: "Secondo resistore (A12-A19): altri 3V ai suoi capi."
        },
        {
          step: 5,
          text: "Inserisci il terzo resistore da 1k\u03A9 nei fori A20 e A27 — in serie dopo il secondo.",
          componentId: "r3",
          componentType: "resistor",
          targetPins: { "r3:pin1": "bb1:a20", "r3:pin2": "bb1:a27" },
          hint: "Terzo resistore (A20-A27): gli ultimi 3V. Totale: 3+3+3 = 9V!"
        },
        {
          step: 6,
          text: "Posiziona il multimetro e impostalo su V (Volt). Misureremo la tensione nei vari punti.",
          componentId: "mm1",
          componentType: "multimeter",
          hint: "Il voltmetro si collega IN PARALLELO al componente da misurare."
        },
        {
          step: 7,
          text: "Collega un filo rosso dal polo + della batteria all'inizio del primo resistore.",
          wireFrom: "bat1:positive",
          wireTo: "r1:pin1",
          wireColor: "red",
          hint: "La corrente parte dal + della batteria e attraversa i 3 resistori."
        },
        {
          step: 8,
          text: "Collega un filo nero dalla fine dell'ultimo resistore al polo - della batteria. Il circuito e chiuso!",
          wireFrom: "r3:pin2",
          wireTo: "bat1:negative",
          wireColor: "black",
          hint: "Ora puoi misurare la tensione ai capi di ogni resistore: circa 3V ciascuno!"
        }
      ],
      quiz: [
        { question: "Con 3 resistori uguali e 9V, quanta tensione c'e ai capi di ogni resistore?", options: ["9V su ognuno", "3V su ognuno", "0V su ognuno"], correct: 1, explanation: "La tensione si divide equamente tra resistori uguali: 9V / 3 = 3V su ognuno. E il principio del partitore di tensione!" },
        { question: "A cosa serve un partitore di tensione?", options: ["A moltiplicare la corrente", "A ottenere una tensione piu bassa da una piu alta", "A caricare la batteria"], correct: 1, explanation: "Il partitore permette di ottenere tensioni intermedie. Per esempio, da 9V puoi ottenere 3V o 6V cambiando dove misuri!" },
      ],
    },

    // ═══════════════════════════════════════════════════
    // CAPITOLO 5 — Approfondiamo le Batterie (2 esperimenti)
    // ═══════════════════════════════════════════════════
    {
      id: "v2-cap5-esp1",
      title: "Cap. 5 Esp. 1 - Batterie in serie (piu spinta!)",
      desc: "Colleghiamo piu batterie in serie: le tensioni si sommano! Come le pile di una torcia.",
      chapter: "Capitolo 5 - Approfondiamo le Batterie",
      difficulty: 1,
      simulable: false,
      simulableReason: "Richiede multimetro fisico",
      icon: "\u{1F50B}",
      simulationMode: "circuit",
      components: [
        { type: "battery9v", id: "bat1" },
        { type: "battery9v", id: "bat2" },
        { type: "multimeter", id: "mm1" },
      ],
      connections: [],
      layout: {
        "bat1": { x: 15, y: 60 },
        "bat2": { x: 15, y: 130 },
        "mm1": { x: 120, y: 40 }
      },
      code: null,
      hexFile: null,
      concept: "Batterie in serie, somma delle tensioni, pile nella torcia",
      layer: "schema",
      steps: [
        "Posiziona due batterie da 9V.",
        "Collega il + della prima al - della seconda (in serie).",
        "Misura la tensione totale con il multimetro: ~18V!",
        "E lo stesso principio delle pile nella torcia."
      ],
      observe: "Due batterie 9V in serie danno 18V. Le tensioni si sommano! E come mettere due scale una sopra l'altra. Le pile della torcia funzionano cosi: 1.5V + 1.5V = 3V.",
      unlimPrompt: "Sei Galileo, il tutor AI di ELAB. Lo studente sta collegando batterie in serie. In serie le tensioni si sommano: 9V + 9V = 18V. E come impilare i mattoncini: la torre diventa piu alta. Le pile della torcia sono in serie: 1.5V x 2 = 3V. Rispondi in italiano.",
      buildSteps: [
        {
          step: 1,
          text: "Posiziona la prima batteria 9V a sinistra del piano di lavoro.",
          componentId: "bat1",
          componentType: "battery9v",
          hint: "La prima batteria fornisce 9V. Posizionala in alto a sinistra."
        },
        {
          step: 2,
          text: "Posiziona la seconda batteria 9V sotto la prima. Le collegheremo in serie!",
          componentId: "bat2",
          componentType: "battery9v",
          hint: "In serie le tensioni si sommano: 9V + 9V = 18V!"
        },
        {
          step: 3,
          text: "Posiziona il multimetro e impostalo su V (Volt). Misureremo la tensione totale.",
          componentId: "mm1",
          componentType: "multimeter",
          hint: "Il multimetro ci mostrera che le tensioni si sommano."
        },
        {
          step: 4,
          text: "Collega un filo dal polo + della prima batteria al polo - della seconda. Questo e il collegamento IN SERIE!",
          wireFrom: "bat1:positive",
          wireTo: "bat2:negative",
          wireColor: "orange",
          hint: "In serie: il + di una tocca il - dell'altra, come le pile nella torcia."
        },
        {
          step: 5,
          text: "Collega il puntale rosso del multimetro al polo - della prima batteria (il polo libero).",
          wireFrom: "mm1:positive",
          wireTo: "bat1:negative",
          wireColor: "red",
          hint: "Misuriamo tra i poli liberi delle due batterie."
        },
        {
          step: 6,
          text: "Collega il puntale nero al polo + della seconda batteria. Leggi: circa 18V! Le tensioni si sommano!",
          wireFrom: "mm1:negative",
          wireTo: "bat2:positive",
          wireColor: "black",
          hint: "9V + 9V = 18V! Come impilare due mattoncini: la torre e doppia!"
        }
      ],
      quiz: [
        { question: "Due batterie da 9V in serie danno:", options: ["9V", "18V", "4.5V"], correct: 1, explanation: "In serie le tensioni si sommano: 9V + 9V = 18V! E come mettere due scale una sopra l'altra: sali il doppio!" },
        { question: "Le pile nella torcia sono collegate:", options: ["In serie (una dopo l'altra)", "In parallelo (fianco a fianco)", "A caso"], correct: 0, explanation: "Le pile nella torcia stanno una dopo l'altra, col + di una che tocca il - della successiva. Le tensioni si sommano!" },
      ],
    },
    {
      id: "v2-cap5-esp2",
      title: "Cap. 5 Esp. 2 - Batterie in antiserie",
      desc: "Cosa succede se colleghiamo due batterie al contrario? Le tensioni si sottraggono!",
      chapter: "Capitolo 5 - Approfondiamo le Batterie",
      difficulty: 2,
      simulable: false,
      simulableReason: "Richiede multimetro fisico",
      icon: "\u{1F504}",
      simulationMode: "circuit",
      components: [
        { type: "battery9v", id: "bat1" },
        { type: "battery9v", id: "bat2" },
        { type: "multimeter", id: "mm1" },
      ],
      connections: [],
      layout: {
        "bat1": { x: 15, y: 60 },
        "bat2": { x: 15, y: 130 },
        "mm1": { x: 120, y: 40 }
      },
      code: null,
      hexFile: null,
      concept: "Antiserie, sottrazione tensioni, forze opposte si annullano",
      layer: "schema",
      steps: [
        "Posiziona due batterie da 9V.",
        "Collega il + della prima al + della seconda (antiserie!).",
        "Misura la tensione: dovrebbe essere circa 0V.",
        "Le forze opposte si annullano, come un tiro alla fune alla pari."
      ],
      observe: "Due batterie in antiserie danno 0V! Le tensioni si sottraggono: 9V - 9V = 0V. Come due persone che tirano una corda in direzioni opposte: nessuno si muove.",
      unlimPrompt: "Sei Galileo, il tutor AI di ELAB. Lo studente sta collegando batterie in antiserie (+ con +). Le tensioni si sottraggono: 9V - 9V = 0V. Non e pericoloso con batterie uguali, semplicemente si annullano. Analogia del tiro alla fune: due persone ugualmente forti, nessuno si muove. Rispondi in italiano.",
      buildSteps: [
        {
          step: 1,
          text: "Posiziona la prima batteria 9V a sinistra del piano di lavoro.",
          componentId: "bat1",
          componentType: "battery9v",
          hint: "Questa batteria spinge la corrente in un verso. Posizionala in alto a sinistra."
        },
        {
          step: 2,
          text: "Posiziona la seconda batteria 9V sotto la prima. Questa volta la collegheremo AL CONTRARIO!",
          componentId: "bat2",
          componentType: "battery9v",
          hint: "In antiserie le batterie spingono in versi opposti."
        },
        {
          step: 3,
// © Andrea Marro — 13/04/2026 — ELAB Tutor — Tutti i diritti riservati
          text: "Posiziona il multimetro e impostalo su V (Volt).",
          componentId: "mm1",
          componentType: "multimeter",
          hint: "Vedrai un risultato sorprendente: 0V!"
        },
        {
          step: 4,
          text: "Collega un filo dal polo + della prima batteria al polo + della seconda. Questo e il collegamento in ANTISERIE!",
          wireFrom: "bat1:positive",
          wireTo: "bat2:positive",
          wireColor: "orange",
          hint: "Antiserie: + con +. Le due batterie si oppongono!"
        },
        {
          step: 5,
          text: "Collega il puntale rosso del multimetro al polo - della prima batteria.",
          wireFrom: "mm1:positive",
          wireTo: "bat1:negative",
          wireColor: "red",
          hint: "Misuriamo tra i poli liberi delle due batterie."
        },
        {
          step: 6,
          text: "Collega il puntale nero al polo - della seconda batteria. Leggi: circa 0V! Le forze si annullano!",
          wireFrom: "mm1:negative",
          wireTo: "bat2:negative",
          wireColor: "black",
          hint: "9V - 9V = 0V! Come un tiro alla fune alla pari: nessuno vince!"
        }
      ],
      quiz: [
        { question: "Due batterie da 9V in antiserie (una al contrario) danno:", options: ["18V", "0V", "9V"], correct: 1, explanation: "Se una spinge in un verso e l'altra spinge in verso opposto, si annullano: 9V - 9V = 0V! Come due persone che tirano una corda in direzioni opposte." },
        { question: "L'antiserie e pericolosa per le batterie?", options: ["Si, possono esplodere", "No, semplicemente si annullano", "Solo se sono cariche"], correct: 1, explanation: "Con batterie uguali l'antiserie non e pericolosa — semplicemente le forze si annullano e non passa corrente. Ma non farlo con batterie diverse!" },
      ],
    },

    // ═══════════════════════════════════════════════════
    // CAPITOLO 6 — Approfondiamo i LED (4 esperimenti)
    // ═══════════════════════════════════════════════════

    {
      id: "v2-cap6-esp1",
      title: "Cap. 6 Esp. 1 - LED in serie con 1 resistore",
      desc: "Collega due LED in serie con un solo resistore da 330\u03A9. Entrambi si accendono!",
      chapter: "Capitolo 6 - Approfondiamo i LED",
      difficulty: 1,
      icon: "\u{1F4A1}",
      simulationMode: "circuit",
      components: [
        { type: "battery9v", id: "bat1" },
        { type: "breadboard-half", id: "bb1" },
        { type: "resistor", id: "r1", value: 330 },
        { type: "led", id: "led1", color: "red" },
        { type: "led", id: "led2", color: "red" }
      ],
      pinAssignments: {
        "r1:pin1": "bb1:e5",
        "r1:pin2": "bb1:e12",
        "led1:anode": "bb1:d14",
        "led1:cathode": "bb1:d15",
        "led2:anode": "bb1:d18",
        "led2:cathode": "bb1:d19"
      },
      connections: [
        { from: "bat1:positive", to: "bb1:bus-top-plus-1", color: "red" },
        { from: "bb1:bus-top-plus-5", to: "bb1:a5", color: "red" },
        { from: "bb1:a12", to: "bb1:a14", color: "orange" },
        { from: "bb1:a15", to: "bb1:a18", color: "yellow" },
        { from: "bb1:a19", to: "bb1:bus-top-minus-19", color: "black" },
        { from: "bb1:bus-top-minus-1", to: "bat1:negative", color: "black" }
      ],
      layout: {
        "bat1": { x: 30, y: 55 },
        "bb1": { x: 100, y: 10 },
        "r1": { x: 174, y: 73.75 },
        "led1": { x: 219, y: 43.75 },
        "led2": { x: 249, y: 43.75 }
      },
      steps: [
        "Posiziona il resistore da 330\u03A9 sulla breadboard tra i fori e5 e e12.",
        "Inserisci il primo LED rosso con l'anodo nel foro d14 e il catodo in d15.",
        "Inserisci il secondo LED rosso con l'anodo nel foro d18 e il catodo in d19.",
        "Collega con un filo il resistore (a12) all'anodo del primo LED (a14), poi il catodo (a15) all'anodo del secondo (a18).",
        "Collega il filo rosso dal polo positivo della batteria alla riga + e poi al foro a5.",
        "Collega il catodo del secondo LED (a19) alla riga - e poi al polo negativo della batteria."
      ],
      observe: "Entrambi i LED si accendono con la stessa luminosit\u00E0! La corrente che passa attraverso entrambi \u00E8 identica perch\u00E9 sono in serie.",
      unlimPrompt: "Sei Galileo, il tutor AI di ELAB. Lo studente sta guardando l'esperimento 'LED in serie con 1 resistore'. In questo circuito due LED sono collegati uno dopo l'altro (in serie) con un solo resistore. La corrente che passa \u00E8 la stessa per entrambi, come l'acqua in un tubo: non si divide! Le tensioni invece si sommano. Spiega in modo semplice e coinvolgente, usando analogie adatte a bambini di 8-12 anni. Rispondi in italiano.",
      code: null,
      hexFile: null,
      concept: "LED in serie, la corrente \u00E8 la stessa, le tensioni si sommano",
      layer: "terra",
      buildSteps: [
        {
          step: 1,
          text: "Posiziona la breadboard (mezza) al centro del piano di lavoro. Sarà la base del tuo circuito!",
          componentId: "bb1",
          componentType: "breadboard-half",
          hint: "La breadboard collega i componenti senza saldature."
        },
        {
          step: 2,
          text: "Posiziona la batteria 9V accanto alla breadboard. È la fonte di energia del circuito!",
          componentId: "bat1",
          componentType: "battery9v",
          hint: "La batteria 9V alimenta il circuito."
        },
        {
          step: 3,
          text: "Prendi il resistore da 330Ω dalla palette e posizionalo nei fori E5 e E12.",
          componentId: "r1",
          componentType: "resistor",
          targetPins: { "r1:pin1": "bb1:e5", "r1:pin2": "bb1:e12" },
          hint: "Il resistore limita la corrente nel circuito."
        },
        {
          step: 4,
          text: "Prendi il LED rosso dalla palette e posizionalo nei fori D14 e D15.",
          componentId: "led1",
          componentType: "led",
          targetPins: { "led1:anode": "bb1:d14", "led1:cathode": "bb1:d15" },
          hint: "L'anodo (+, gamba lunga) va in D14 e il catodo (−, gamba corta) in D15."
        },
        {
          step: 5,
          text: "Prendi il LED rosso dalla palette e posizionalo nei fori D18 e D19.",
          componentId: "led2",
          componentType: "led",
          targetPins: { "led2:anode": "bb1:d18", "led2:cathode": "bb1:d19" },
          hint: "L'anodo (+, gamba lunga) va in D18 e il catodo (−, gamba corta) in D19."
        },
        {
          step: 6,
          text: "Collega un filo ROSSO dal polo + della batteria al foro bus + superiore (col. 1).",
          wireFrom: "bat1:positive",
          wireTo: "bb1:bus-top-plus-1",
          wireColor: "red",
          hint: "Questo filo porta la corrente dalla batteria al bus positivo della breadboard."
        },
        {
          step: 7,
          text: "Collega un filo ROSSO dal foro bus + superiore (col. 5) al foro A5.",
          wireFrom: "bb1:bus-top-plus-5",
          wireTo: "bb1:a5",
          wireColor: "red",
          hint: "Questo filo porta la corrente dal bus positivo al componente."
        },
        {
          step: 8,
          text: "Collega un filo ARANCIONE dal foro A12 al foro A14.",
          wireFrom: "bb1:a12",
          wireTo: "bb1:a14",
          wireColor: "orange",
          hint: "Questo filo collega il resistore al LED."
        },
        {
          step: 9,
          text: "Collega un filo GIALLO dal foro A15 al foro A18.",
          wireFrom: "bb1:a15",
          wireTo: "bb1:a18",
          wireColor: "yellow",
          hint: "Questo filo collega i due LED in serie."
        },
        {
          step: 10,
          text: "Collega un filo NERO dal foro A19 al foro bus − superiore (col. 19).",
          wireFrom: "bb1:a19",
          wireTo: "bb1:bus-top-minus-19",
          wireColor: "black",
          hint: "Questo filo riporta la corrente al bus negativo."
        },
        {
          step: 11,
          text: "Collega un filo NERO dal foro bus − superiore (col. 1) al polo − della batteria.",
          wireFrom: "bb1:bus-top-minus-1",
          wireTo: "bat1:negative",
          wireColor: "black",
          hint: "Questo filo chiude il circuito riportando la corrente alla batteria."
        }
      ],
      quiz: [
        {
          question: "Perché entrambi i LED in serie hanno la stessa luminosità?",
          options: ["Perché in serie la corrente è identica in tutti i componenti", "Perché sono dello stesso colore", "Perché sono vicini sulla breadboard"],
          correct: 0,
          explanation: "In un circuito serie c'è un solo percorso: la stessa corrente passa in entrambi i LED, come l'acqua in un tubo unico. Stessa corrente = stessa luminosità!"
        },
        {
          question: "Cosa succede alle tensioni dei LED in un circuito serie?",
          options: ["Si dividono a metà", "Si sommano: V_totale = Vf_LED1 + Vf_LED2", "Restano uguali alla batteria"],
          correct: 1,
          explanation: "In serie le tensioni si sommano! Con due LED rossi: 1.8V + 1.8V = 3.6V. I restanti 5.4V cadono sul resistore (9V - 3.6V = 5.4V)."
        }
      ]
    },

    // -----------------------------------------------
    // v2-cap6-esp2: LED in serie colori diversi
    // Same layout pattern as esp1 — R on e5-e12, LED1 on f14, LED2 on f20
    // -----------------------------------------------
// © Andrea Marro — 13/04/2026 — ELAB Tutor — Tutti i diritti riservati
    {
      id: "v2-cap6-esp2",
      title: "Cap. 6 Esp. 2 - LED in serie colori diversi",
      desc: "Due LED di colori diversi in serie: la tensione Vf diversa cambia la luminosit\u00E0!",
      chapter: "Capitolo 6 - Approfondiamo i LED",
      difficulty: 1,
      icon: "\u{1F308}",
      simulationMode: "circuit",
      components: [
        { type: "battery9v", id: "bat1" },
        { type: "breadboard-half", id: "bb1" },
        { type: "resistor", id: "r1", value: 330 },
        { type: "led", id: "led1", color: "red" },
        { type: "led", id: "led2", color: "green" }
      ],
      pinAssignments: {
        "r1:pin1": "bb1:e5",
        "r1:pin2": "bb1:e12",
        "led1:anode": "bb1:d14",
        "led1:cathode": "bb1:d15",
        "led2:anode": "bb1:d18",
        "led2:cathode": "bb1:d19"
      },
      connections: [
        { from: "bat1:positive", to: "bb1:bus-top-plus-1", color: "red" },
        { from: "bb1:bus-top-plus-5", to: "bb1:a5", color: "red" },
        { from: "bb1:a12", to: "bb1:a14", color: "orange" },
        { from: "bb1:a15", to: "bb1:a18", color: "yellow" },
        { from: "bb1:a19", to: "bb1:bus-top-minus-19", color: "black" },
        { from: "bb1:bus-top-minus-1", to: "bat1:negative", color: "black" }
      ],
      layout: {
        "bat1": { x: 30, y: 55 },
        "bb1": { x: 100, y: 10 },
        "r1": { x: 174, y: 73.75 },
        "led1": { x: 219, y: 43.75 },
        "led2": { x: 249, y: 43.75 }
      },
      steps: [
        "Posiziona il resistore da 330\u03A9 sulla breadboard tra i fori e5 e e12.",
        "Inserisci il LED rosso con l'anodo nel foro d14 e il catodo in d15.",
        "Inserisci il LED verde con l'anodo nel foro d18 e il catodo in d19.",
        "Collega il resistore (a12) all'anodo del LED rosso (a14), poi il catodo (a15) all'anodo del LED verde (a18).",
        "Collega il filo rosso dal polo positivo della batteria alla riga + e poi al foro a5.",
        "Collega il catodo del LED verde (a19) alla riga - e poi al polo negativo della batteria."
      ],
      observe: "Entrambi i LED si accendono, ma con luminosit\u00E0 diversa! Il LED rosso (Vf \u2248 1.8V) brilla di pi\u00F9 del verde (Vf \u2248 2.2V) perch\u00E9 la tensione rimanente si distribuisce diversamente.",
      unlimPrompt: "Sei Galileo, il tutor AI di ELAB. Lo studente sta guardando l'esperimento 'LED in serie colori diversi'. Qui ci sono due LED di colori diversi in serie. Ogni colore di LED ha bisogno di una tensione diversa per accendersi (la tensione forward Vf): il rosso circa 1.8V, il verde circa 2.2V. \u00C8 come se ogni LED fosse una porticina di altezza diversa: la corrente deve superarle tutte! Spiega in modo semplice e coinvolgente, usando analogie adatte a bambini di 8-12 anni. Rispondi in italiano.",
      code: null,
      hexFile: null,
      concept: "Tensione forward diversa per colore, somma Vf in serie",
      layer: "terra",
      buildSteps: [
        {
          step: 1,
          text: "Posiziona la breadboard (mezza) al centro del piano di lavoro. Sarà la base del tuo circuito!",
          componentId: "bb1",
          componentType: "breadboard-half",
          hint: "La breadboard collega i componenti senza saldature."
        },
        {
          step: 2,
          text: "Posiziona la batteria 9V accanto alla breadboard. È la fonte di energia del circuito!",
          componentId: "bat1",
          componentType: "battery9v",
          hint: "La batteria 9V alimenta il circuito."
        },
        {
          step: 3,
          text: "Prendi il resistore da 330Ω dalla palette e posizionalo nei fori E5 e E12.",
          componentId: "r1",
          componentType: "resistor",
          targetPins: { "r1:pin1": "bb1:e5", "r1:pin2": "bb1:e12" },
          hint: "Il resistore limita la corrente nel circuito."
        },
        {
          step: 4,
          text: "Prendi il LED rosso dalla palette e posizionalo nei fori D14 e D15.",
          componentId: "led1",
          componentType: "led",
          targetPins: { "led1:anode": "bb1:d14", "led1:cathode": "bb1:d15" },
          hint: "L'anodo (+, gamba lunga) va in D14 e il catodo (−, gamba corta) in D15."
        },
        {
          step: 5,
          text: "Prendi il LED verde dalla palette e posizionalo nei fori D18 e D19.",
          componentId: "led2",
          componentType: "led",
          targetPins: { "led2:anode": "bb1:d18", "led2:cathode": "bb1:d19" },
          hint: "L'anodo (+, gamba lunga) va in D18 e il catodo (−, gamba corta) in D19."
        },
        {
          step: 6,
          text: "Collega un filo ROSSO dal polo + della batteria al foro bus + superiore (col. 1).",
          wireFrom: "bat1:positive",
          wireTo: "bb1:bus-top-plus-1",
          wireColor: "red",
          hint: "Questo filo porta la corrente dalla batteria al bus positivo della breadboard."
        },
        {
          step: 7,
          text: "Collega un filo ROSSO dal foro bus + superiore (col. 5) al foro A5.",
          wireFrom: "bb1:bus-top-plus-5",
          wireTo: "bb1:a5",
          wireColor: "red",
          hint: "Questo filo porta la corrente dal bus positivo al componente."
        },
        {
          step: 8,
          text: "Collega un filo ARANCIONE dal foro A12 al foro A14.",
          wireFrom: "bb1:a12",
          wireTo: "bb1:a14",
          wireColor: "orange",
          hint: "Questo filo collega il resistore al LED."
        },
        {
          step: 9,
          text: "Collega un filo GIALLO dal foro A15 al foro A18.",
          wireFrom: "bb1:a15",
          wireTo: "bb1:a18",
          wireColor: "yellow",
          hint: "Questo filo collega i due LED in serie."
        },
        {
          step: 10,
          text: "Collega un filo NERO dal foro A19 al foro bus − superiore (col. 19).",
          wireFrom: "bb1:a19",
          wireTo: "bb1:bus-top-minus-19",
          wireColor: "black",
          hint: "Questo filo riporta la corrente al bus negativo."
        },
        {
          step: 11,
          text: "Collega un filo NERO dal foro bus − superiore (col. 1) al polo − della batteria.",
          wireFrom: "bb1:bus-top-minus-1",
          wireTo: "bat1:negative",
          wireColor: "black",
          hint: "Questo filo chiude il circuito riportando la corrente alla batteria."
        }
      ],
      quiz: [
        {
          question: "Perché due LED di colori diversi in serie hanno luminosità diversa?",
          options: ["Perché la corrente si divide tra i due", "Perché uno è più nuovo", "Perché hanno tensioni forward (Vf) diverse"],
          correct: 2,
          explanation: "Il LED rosso (Vf ≈ 1.8V) lascia più tensione disponibile per il resistore rispetto al verde (Vf ≈ 2.2V). In serie la corrente è la stessa, ma la distribuzione di tensione cambia!"
        },
        {
          question: "In un circuito serie, la corrente è uguale in tutti i componenti. Vero o falso?",
          options: ["Vero: la stessa corrente passa attraverso ogni componente", "Falso: la corrente si divide", "Dipende dal colore dei LED"],
          correct: 0,
          explanation: "In serie c'è un solo percorso per la corrente, come l'acqua in un tubo: la stessa quantità passa attraverso ogni componente. Le tensioni invece si dividono!"
        }
      ]
    },

    {
      id: "v2-cap6-esp3",
      title: "Cap. 6 Esp. 3 - Tre LED in serie",
      desc: "Tre LED in serie con R330\u03A9. Poi prova con R220\u03A9: la luminosit\u00E0 cambia!",
      chapter: "Capitolo 6 - Approfondiamo i LED",
      difficulty: 2,
      icon: "\u{1F4A1}",
      simulationMode: "circuit",
      components: [
        { type: "battery9v", id: "bat1" },
        { type: "breadboard-half", id: "bb1" },
        { type: "resistor", id: "r1", value: 330 },
        { type: "led", id: "led1", color: "red" },
        { type: "led", id: "led2", color: "red" },
        { type: "led", id: "led3", color: "red" }
      ],
      pinAssignments: {
        "r1:pin1": "bb1:e3",
        "r1:pin2": "bb1:e10",
        "led1:anode": "bb1:d10",
        "led1:cathode": "bb1:d11",
        "led2:anode": "bb1:d17",
        "led2:cathode": "bb1:d18",
        "led3:anode": "bb1:d22",
        "led3:cathode": "bb1:d23"
      },
      connections: [
        { from: "bat1:positive", to: "bb1:bus-top-plus-1", color: "red" },
        { from: "bb1:bus-top-plus-3", to: "bb1:a3", color: "red" },
        { from: "bb1:a11", to: "bb1:a17", color: "yellow" },
        { from: "bb1:a18", to: "bb1:a22", color: "green" },
        { from: "bb1:a23", to: "bb1:bus-top-minus-23", color: "black" },
        { from: "bb1:bus-top-minus-1", to: "bat1:negative", color: "black" }
      ],
      layout: {
        "bat1": { x: 30, y: 55 },
        "bb1": { x: 100, y: 10 },
        "r1": { x: 159, y: 73.75 },
        "led1": { x: 189, y: 43.75 },
        "led2": { x: 241.5, y: 43.75 },
        "led3": { x: 279, y: 43.75 }
      },
      steps: [
        "Posiziona il resistore da 330\u03A9 tra i fori e3 e e10.",
// © Andrea Marro — 13/04/2026 — ELAB Tutor — Tutti i diritti riservati
        "Inserisci il primo LED rosso con l'anodo in d10 e il catodo in d11.",
        "Inserisci il secondo LED rosso con l'anodo in d17 e il catodo in d18.",
        "Inserisci il terzo LED rosso con l'anodo in d22 e il catodo in d23.",
        "Collega con fili: catodo LED1 (a11) a anodo LED2 (a17), catodo LED2 (a18) a anodo LED3 (a22).",
        "Collega il polo positivo della batteria alla riga + e poi al foro a3.",
        "Collega il catodo dell'ultimo LED (a23) alla riga - e poi al polo negativo della batteria.",
        "Prova a sostituire il resistore con uno da 220\u03A9 e osserva la differenza!"
      ],
      observe: "Tutti e tre i LED si accendono! Con R330\u03A9 la luminosit\u00E0 \u00E8 moderata. Sostituendo con R220\u03A9 i LED brillano di pi\u00F9 perch\u00E9 passa pi\u00F9 corrente. La somma delle Vf (3\u00D71.8V = 5.4V) pi\u00F9 la caduta sul resistore deve uguagliare i 9V della batteria.",
      unlimPrompt: "Sei Galileo, il tutor AI di ELAB. Lo studente sta guardando l'esperimento 'Tre LED in serie'. Con tre LED in serie, la somma delle tensioni forward \u00E8 circa 5.4V (3 x 1.8V). La batteria da 9V deve fornire tensione per tutti e tre pi\u00F9 il resistore. Cambiando il resistore da 330\u03A9 a 220\u03A9 passa pi\u00F9 corrente e i LED brillano di pi\u00F9! \u00C8 come aprire di pi\u00F9 il rubinetto dell'acqua. Spiega in modo semplice e coinvolgente, usando analogie adatte a bambini di 8-12 anni. Rispondi in italiano.",
      code: null,
      hexFile: null,
      concept: "3 LED in serie, limite tensione 9V, swap resistore 330\u03A9\u2192220\u03A9",
      layer: "terra",
      note: "Prova a cambiare il resistore da 330\u03A9 a 220\u03A9: pi\u00F9 corrente = pi\u00F9 luce!",
      buildSteps: [
        {
          step: 1,
          text: "Posiziona la breadboard (mezza) al centro del piano di lavoro. Sarà la base del tuo circuito!",
          componentId: "bb1",
          componentType: "breadboard-half",
          hint: "La breadboard collega i componenti senza saldature."
        },
        {
          step: 2,
          text: "Posiziona la batteria 9V accanto alla breadboard. È la fonte di energia del circuito!",
          componentId: "bat1",
          componentType: "battery9v",
          hint: "La batteria 9V alimenta il circuito."
        },
        {
          step: 3,
          text: "Prendi il resistore da 330Ω dalla palette e posizionalo nei fori E3 e E10.",
          componentId: "r1",
          componentType: "resistor",
          targetPins: { "r1:pin1": "bb1:e3", "r1:pin2": "bb1:e10" },
          hint: "Il resistore limita la corrente nel circuito."
        },
        {
          step: 4,
          text: "Prendi il LED rosso dalla palette e posizionalo nei fori D10 e D11.",
          componentId: "led1",
          componentType: "led",
          targetPins: { "led1:anode": "bb1:d10", "led1:cathode": "bb1:d11" },
          hint: "L'anodo (+, gamba lunga) va in D10 e il catodo (−, gamba corta) in D11."
        },
        {
          step: 5,
          text: "Prendi il LED rosso dalla palette e posizionalo nei fori D17 e D18.",
          componentId: "led2",
          componentType: "led",
          targetPins: { "led2:anode": "bb1:d17", "led2:cathode": "bb1:d18" },
          hint: "L'anodo (+, gamba lunga) va in D17 e il catodo (−, gamba corta) in D18."
        },
        {
          step: 6,
          text: "Prendi il LED rosso dalla palette e posizionalo nei fori D22 e D23.",
          componentId: "led3",
          componentType: "led",
          targetPins: { "led3:anode": "bb1:d22", "led3:cathode": "bb1:d23" },
          hint: "L'anodo (+, gamba lunga) va in D22 e il catodo (−, gamba corta) in D23."
        },
        {
          step: 7,
          text: "Collega un filo ROSSO dal polo + della batteria al foro bus + superiore (col. 1).",
          wireFrom: "bat1:positive",
          wireTo: "bb1:bus-top-plus-1",
          wireColor: "red",
          hint: "Questo filo porta la corrente dalla batteria al bus positivo della breadboard."
        },
        {
          step: 8,
          text: "Collega un filo ROSSO dal foro bus + superiore (col. 3) al foro A3.",
          wireFrom: "bb1:bus-top-plus-3",
          wireTo: "bb1:a3",
          wireColor: "red",
          hint: "Questo filo porta la corrente dal bus positivo al componente."
        },
        {
          step: 9,
          text: "Collega un filo GIALLO dal foro A11 al foro A17.",
          wireFrom: "bb1:a11",
          wireTo: "bb1:a17",
          wireColor: "yellow",
          hint: "Questo filo collega due parti del circuito."
        },
        {
          step: 10,
          text: "Collega un filo VERDE dal foro A18 al foro A22.",
          wireFrom: "bb1:a18",
          wireTo: "bb1:a22",
          wireColor: "green",
          hint: "Questo filo collega due parti del circuito."
        },
        {
          step: 11,
          text: "Collega un filo NERO dal foro A23 al foro bus − superiore (col. 23).",
          wireFrom: "bb1:a23",
          wireTo: "bb1:bus-top-minus-23",
          wireColor: "black",
          hint: "Questo filo riporta la corrente al bus negativo."
        },
        {
          step: 12,
          text: "Collega un filo NERO dal foro bus − superiore (col. 1) al polo − della batteria.",
          wireFrom: "bb1:bus-top-minus-1",
          wireTo: "bat1:negative",
          wireColor: "black",
          hint: "Questo filo chiude il circuito riportando la corrente alla batteria."
        }
      ],
      quiz: [
        {
          question: "Perché i LED brillano di più quando sostituisci il resistore da 330Ω con uno da 220Ω?",
          options: ["Con meno resistenza passa più corrente e i LED brillano di più", "Il resistore da 220Ω produce luce extra", "Non c'è differenza"],
          correct: 0,
          explanation: "Legge di Ohm: I = V/R. Con R più piccolo, la corrente aumenta e i LED ricevono più corrente = più luce. Ma attenzione: troppa corrente può bruciare i LED!"
        },
        {
          question: "Con 3 LED rossi in serie da Vf=1.8V ciascuno e batteria 9V, quanta tensione cade sui LED?",
          options: ["9V (tutta la batteria)", "5.4V (3 × 1.8V)", "1.8V (solo un LED)"],
          correct: 1,
          explanation: "In serie le tensioni si sommano: 3 × 1.8V = 5.4V per i LED. I restanti 3.6V cadono sul resistore (9V - 5.4V = 3.6V)."
        }
      ]
    },

    {
      id: "v2-cap6-esp4",
      title: "Cap. 6 Esp. 4 - Misurare Vf con multimetro",
      desc: "Misura la tensione forward del LED con il multimetro. NO breadboard, solo coccodrilli!",
      chapter: "Capitolo 6 - Approfondiamo i LED",
      difficulty: 2,
      icon: "\u{1F4CF}",
      simulationMode: "circuit",
      components: [
        { type: "battery9v", id: "bat1" },
        { type: "breadboard-half", id: "bb1" },
        { type: "resistor", id: "r1", value: 330 },
        { type: "led", id: "led1", color: "red" },
        { type: "multimeter", id: "mm1" }
      ],
      pinAssignments: {
        "r1:pin1": "bb1:a2",
        "r1:pin2": "bb1:a9",
        "led1:anode": "bb1:f9",
        "led1:cathode": "bb1:f10"
      },
      connections: [
        { from: "bat1:positive", to: "bb1:bus-top-plus-1", color: "red" },
        { from: "bb1:bus-top-plus-2", to: "bb1:a2", color: "red" },
        { from: "bb1:e9", to: "bb1:f9", color: "orange" },
        { from: "bb1:f10", to: "bb1:e10", color: "yellow" },
        { from: "bb1:e10", to: "bb1:bus-top-minus-10", color: "yellow" },
        { from: "bb1:bus-top-minus-1", to: "bat1:negative", color: "black" },
        { from: "mm1:probe-positive", to: "bb1:f9", color: "red" },
        { from: "mm1:probe-negative", to: "bb1:f10", color: "black" }
      ],
      layout: {
        "bat1": { x: 15, y: 60 },
        "bb1": { x: 100, y: 10 },
        "r1": { x: 151.5, y: 43.75 },
        "led1": { x: 181.5, y: 68.75 },
        "mm1": { x: 260, y: 30 }
      },
      steps: [
        "Collega il polo positivo della batteria a un capo del resistore da 330\u03A9 con un coccodrillo rosso.",
        "Collega l'altro capo del resistore all'anodo del LED rosso (gamba lunga) con un coccodrillo arancione.",
        "Collega il catodo del LED (gamba corta) al polo negativo della batteria con un coccodrillo nero.",
        "Imposta il multimetro in modalit\u00E0 voltmetro (V DC).",
        "Collega la sonda rossa del multimetro all'anodo del LED.",
        "Collega la sonda nera del multimetro al catodo del LED.",
        "Leggi il valore sul display: questa \u00E8 la tensione forward Vf!"
      ],
      observe: "Il multimetro mostra circa 1.8V per il LED rosso. Questa \u00E8 la tensione forward (Vf): la 'quota di pedaggio' che il LED richiede per accendersi. Prova con LED di colori diversi: vedrai valori diversi!",
      unlimPrompt: "Sei Galileo, il tutor AI di ELAB. Lo studente sta guardando l'esperimento 'Misurare Vf con multimetro'. Il multimetro \u00E8 come un detective: misura la tensione ai capi del LED (la tensione forward Vf). Collegandolo in parallelo al LED, puoi leggere quanta 'spinta' serve per far passare la corrente attraverso il LED. Ogni colore ha un valore diverso! Spiega in modo semplice e coinvolgente, usando analogie adatte a bambini di 8-12 anni. Rispondi in italiano.",
      code: null,
      hexFile: null,
      concept: "Misura tensione forward Vf, uso del multimetro in modalit\u00E0 voltmetro",
      layer: "terra",
      note: "Collegamento su breadboard. Multimetro in parallelo al LED.",
      buildSteps: [
        {
          step: 1,
          text: "Posiziona la batteria 9V accanto alla breadboard. È la fonte di energia del circuito!",
          componentId: "bat1",
          componentType: "battery9v",
          hint: "La batteria 9V alimenta il circuito."
        },
        {
          step: 2,
          text: "Prendi il resistore da 330Ω e posizionalo sui fori A2 e A9.",
          componentId: "r1",
          componentType: "resistor",
          targetPins: { "r1:pin1": "bb1:a2", "r1:pin2": "bb1:a9" },
          hint: "Il resistore limita la corrente nel circuito."
        },
        {
          step: 3,
          text: "Prendi il LED rosso e posizionalo sui fori F9 (anodo) e F10 (catodo).",
// © Andrea Marro — 13/04/2026 — ELAB Tutor — Tutti i diritti riservati
          componentId: "led1",
          componentType: "led",
          targetPins: { "led1:anode": "bb1:f9", "led1:cathode": "bb1:f10" },
          hint: "L'anodo (+, piedino lungo) va in F9, il catodo (−, piedino corto) va in F10."
        },
        {
          step: 4,
          text: "Posiziona il multimetro accanto al circuito. Ti servirà per misurare!",
          componentId: "mm1",
          componentType: "multimeter",
          hint: "Il multimetro misura tensione, corrente e resistenza."
        },
        {
          step: 5,
          text: "Collega un filo ROSSO dal polo + della batteria al bus + (colonna 1).",
          wireFrom: "bat1:positive",
          wireTo: "bb1:bus-top-plus-1",
          wireColor: "red",
          hint: "Il filo rosso porta la corrente positiva dalla batteria."
        },
        {
          step: 6,
          text: "Collega un filo ROSSO dal bus + (colonna 2) al foro A2.",
          wireFrom: "bb1:bus-top-plus-2",
          wireTo: "bb1:a2",
          wireColor: "red",
          hint: "Questo filo porta il positivo al resistore."
        },
        {
          step: 7,
          text: "Collega un filo ARANCIONE da E9 (collegato a A9 del resistore) a F9 (anodo del LED).",
          wireFrom: "bb1:e9",
          wireTo: "bb1:f9",
          wireColor: "orange",
          hint: "Questo filo attraversa il gap della breadboard per collegare il resistore all'anodo del LED."
        },
        {
          step: 8,
          text: "Collega un filo GIALLO da F10 (catodo del LED) a E10.",
          wireFrom: "bb1:f10",
          wireTo: "bb1:e10",
          wireColor: "yellow",
          hint: "Questo filo porta il catodo nella zona superiore della breadboard."
        },
        {
          step: 9,
          text: "Collega un filo NERO da E10 al bus − (colonna 10).",
          wireFrom: "bb1:e10",
          wireTo: "bb1:bus-top-minus-10",
          wireColor: "black",
          hint: "Questo filo collega al bus negativo."
        },
        {
          step: 10,
          text: "Collega un filo NERO dal bus − (colonna 1) al polo − della batteria.",
          wireFrom: "bb1:bus-top-minus-1",
          wireTo: "bat1:negative",
          wireColor: "black",
          hint: "Il filo nero chiude il circuito."
        },
        {
          step: 11,
          text: "Collega la sonda rossa (+) del multimetro al foro F9 (anodo del LED).",
          wireFrom: "mm1:probe-positive",
          wireTo: "bb1:f9",
          wireColor: "red",
          hint: "Posiziona la sonda per misurare la tensione ai capi del LED."
        },
        {
          step: 12,
          text: "Collega la sonda nera (−) del multimetro al foro F10 (catodo del LED).",
          wireFrom: "mm1:probe-negative",
          wireTo: "bb1:f10",
          wireColor: "black",
          hint: "Posiziona la sonda per completare la misurazione in parallelo al LED."
        }
      ],
      quiz: [
        {
          question: "Cos'è la tensione forward (Vf) di un LED?",
          options: ["La tensione minima che il LED richiede per accendersi", "La tensione massima prima che il LED esploda", "La tensione della batteria"],
          correct: 0,
          explanation: "Vf è come una 'quota di pedaggio': il LED richiede questa tensione minima per far passare la corrente e produrre luce. Ogni colore ha un Vf diverso!"
        },
        {
          question: "Perché un LED rosso e un LED verde hanno Vf diversi?",
          options: ["Perché uno è più nuovo dell'altro", "Perché uno è più grande", "Perché colori diversi richiedono energie diverse per produrre la luce"],
          correct: 2,
          explanation: "LED rosso Vf ≈ 1.8V, LED verde Vf ≈ 2.2V, LED blu Vf ≈ 3.0V. Colori con lunghezza d'onda più corta (più energia) richiedono più tensione!"
        }
      ]
    },

    // ═══════════════════════════════════════════════════
    // CAPITOLO 7 — Cosa sono i condensatori? (4 esperimenti)
    // ═══════════════════════════════════════════════════

    {
      id: "v2-cap7-esp1",
      title: "Cap. 7 Esp. 1 - Scarica condensatore + multimetro",
      desc: "Tieni premuto il pulsante per caricare il condensatore da 1000µF. Rilascialo per scaricarlo attraverso R1kΩ. Osserva la tensione che cala!",
      chapter: "Capitolo 7 - Cosa sono i condensatori?",
      difficulty: 2,
      icon: "🔋",
      simulationMode: "circuit",
      components: [
        { type: "battery9v", id: "bat1" },
        { type: "breadboard-half", id: "bb1" },
        { type: "capacitor", id: "c1", value: 1000 },
        { type: "push-button", id: "btn1" },
        { type: "resistor", id: "r1", value: 1000 },
        { type: "multimeter", id: "mm1" }
      ],
      pinAssignments: {
        "c1:positive": "bb1:e5",
        "c1:negative": "bb1:e6",
        "btn1:pin1": "bb1:e10",
        "btn1:pin2": "bb1:f12",
        "r1:pin1": "bb1:e16",
        "r1:pin2": "bb1:e23"
      },
      connections: [
        { from: "bat1:positive", to: "bb1:bus-top-plus-1", color: "red" },
        { from: "bb1:bus-top-plus-10", to: "bb1:a10", color: "red" },
        { from: "bb1:g12", to: "bb1:c5", color: "yellow" },
        { from: "bb1:a5", to: "bb1:a16", color: "green" },
        { from: "bb1:a23", to: "bb1:bus-top-minus-23", color: "black" },
        { from: "bb1:a6", to: "bb1:bus-top-minus-6", color: "black" },
        { from: "bb1:bus-top-minus-1", to: "bat1:negative", color: "black" },
        { from: "mm1:probe-positive", to: "bb1:b5", color: "red" },
        { from: "mm1:probe-negative", to: "bb1:b6", color: "black" }
      ],
      layout: {
        "bat1": { x: 30, y: 55 },
        "bb1": { x: 100, y: 10 },
        "c1": { x: 155.25, y: 88.75 },
        "btn1": { x: 200.25, y: 81.25 },
        "r1": { x: 256.5, y: 73.75 },
        "mm1": { x: 340, y: 20 }
      },
      steps: [
        "Inserisci il condensatore da 1000µF con il polo positivo in e5 e il negativo in e6.",
        "Posiziona il pulsante a cavallo dei fori e10 e f12.",
        "Inserisci il resistore da 1kΩ tra i fori e16 e e23.",
        "Collega il bus + della breadboard al pulsante (a10).",
        "Collega l'uscita del pulsante (g12) al polo + del condensatore (c5).",
        "Collega il polo + del condensatore (a5) al resistore (a16).",
        "Collega a massa (bus -) il polo - del condensatore (a6) e l'uscita del resistore (a23).",
        "Collega batteria e multimetro, poi premi il pulsante per caricare!"
      ],
      observe: "Premendo il pulsante, il condensatore si carica istantaneamente a 9V. Rilasciandolo, la batteria viene scollegata e il condensatore si scarica lentamente attraverso il resistore da 1kΩ. Il tempo di scarica dipende da Tau = R × C = 1kΩ × 1000µF = 1 secondo.",
      unlimPrompt: "Sei Galileo, il tutor AI di ELAB. Lo studente sta guardando l'esperimento 'Scarica condensatore + multimetro'. Il condensatore è come una piccola batteria ricaricabile. Premendo il pulsante lo colleghiamo alla batteria 9V e si ricarica subito. Rilasciando il pulsante, l'energia immagazzinata si scarica lentamente attraverso il resistore, seguendo una curva esponenziale visibile sul multimetro. Il tempo di scarica dipende da R e C: Tau = R x C. Spiega in modo semplice e coinvolgente, usando analogie adatte a bambini di 8-12 anni.",
      code: null,
      hexFile: null,
      concept: "Carica/scarica condensatore, costante di tempo RC, curva esponenziale",
      layer: "terra",
      buildSteps: [
        {
          step: 1,
          text: "Posiziona la breadboard (mezza) al centro del piano di lavoro. Sarà la base del tuo circuito!",
          componentId: "bb1",
          componentType: "breadboard-half",
          hint: "La breadboard collega i componenti senza saldature."
        },
        {
          step: 2,
          text: "Posiziona la batteria 9V accanto alla breadboard. È la fonte di energia del circuito!",
          componentId: "bat1",
          componentType: "battery9v",
          hint: "La batteria 9V alimenta il circuito."
        },
        {
          step: 3,
          text: "Prendi il condensatore da 1000µF dalla palette e posizionalo nei fori E5 e E6.",
          componentId: "c1",
          componentType: "capacitor",
          targetPins: { "c1:positive": "bb1:e5", "c1:negative": "bb1:e6" },
          hint: "Il polo + in E5, il polo − in E6. Attenzione alla polarità!"
        },
        {
          step: 4,
          text: "Prendi il pulsante dalla palette e posizionalo nei fori E10 e F12.",
          componentId: "btn1",
          componentType: "push-button",
          targetPins: { "btn1:pin1": "bb1:e10", "btn1:pin2": "bb1:f12" },
          hint: "Il pulsante va a cavallo della scanalatura centrale della breadboard."
        },
        {
          step: 5,
          text: "Prendi il resistore da 1kΩ dalla palette e posizionalo nei fori E16 e E23.",
          componentId: "r1",
          componentType: "resistor",
          targetPins: { "r1:pin1": "bb1:e16", "r1:pin2": "bb1:e23" },
          hint: "Il resistore limita la corrente nel circuito."
        },
        {
          step: 6,
          text: "Posiziona il multimetro accanto al circuito. Ti servirà per misurare!",
          componentId: "mm1",
          componentType: "multimeter",
// © Andrea Marro — 13/04/2026 — ELAB Tutor — Tutti i diritti riservati
          hint: "Il multimetro misura tensione, corrente e resistenza."
        },
        {
          step: 7,
          text: "Collega un filo ROSSO dal polo + della batteria al foro bus + superiore (col. 1).",
          wireFrom: "bat1:positive",
          wireTo: "bb1:bus-top-plus-1",
          wireColor: "red",
          hint: "Questo filo porta la corrente dalla batteria al bus positivo della breadboard."
        },
        {
          step: 8,
          text: "Collega un filo ROSSO dal foro bus + superiore (col. 10) al foro A10 (ingresso pulsante).",
          wireFrom: "bb1:bus-top-plus-10",
          wireTo: "bb1:a10",
          wireColor: "red",
          hint: "Questo filo porta la corrente dalla batteria al pulsante."
        },
        {
          step: 9,
          text: "Collega un filo GIALLO dall'uscita del pulsante (G12) al polo + del condensatore (C5).",
          wireFrom: "bb1:g12",
          wireTo: "bb1:c5",
          wireColor: "yellow",
          hint: "Così premendo il pulsante la corrente arriverà al condensatore per caricarlo!"
        },
        {
          step: 10,
          text: "Collega il polo + del condensatore (A5) all'ingresso del resistore (A16) con un filo VERDE.",
          wireFrom: "bb1:a5",
          wireTo: "bb1:a16",
          wireColor: "green",
          hint: "Questo è il percorso per scaricare il condensatore."
        },
        {
          step: 11,
          text: "Collega un filo NERO dall'uscita del resistore (A23) al foro bus − superiore (col. 23).",
          wireFrom: "bb1:a23",
          wireTo: "bb1:bus-top-minus-23",
          wireColor: "black",
          hint: "Chiudi il circuito di scarica verso massa."
        },
        {
          step: 12,
          text: "Collega un filo NERO dal polo − del condensatore (A6) al foro bus − (col. 6).",
          wireFrom: "bb1:a6",
          wireTo: "bb1:bus-top-minus-6",
          wireColor: "black",
          hint: "Metti a massa anche il condensatore."
        },
        {
          step: 13,
          text: "Collega un filo NERO dal foro bus − superiore (col. 1) al polo − della batteria.",
          wireFrom: "bb1:bus-top-minus-1",
          wireTo: "bat1:negative",
          wireColor: "black",
          hint: "Questo filo riporta tutta la corrente alla batteria."
        },
        {
          step: 14,
          text: "Collega la sonda rossa (+) del multimetro al foro B5.",
          wireFrom: "mm1:probe-positive",
          wireTo: "bb1:b5",
          wireColor: "red",
          hint: "Posiziona la sonda per misurare la tensione nel punto desiderato."
        },
        {
          step: 15,
          text: "Collega la sonda nera (−) del multimetro al foro B6.",
          wireFrom: "mm1:probe-negative",
          wireTo: "bb1:b6",
          wireColor: "black",
          hint: "Posiziona la sonda per misurare la tensione nel punto desiderato."
        }
      ],
      quiz: [
        {
          question: "Cos'è la costante di tempo Tau (τ) in un circuito RC?",
          options: ["Il tempo in cui la tensione scende al 37% del valore iniziale", "Il tempo per caricare completamente il condensatore", "Il tempo per bruciare il resistore"],
          correct: 0,
          explanation: "Tau = R × C. In un tempo pari a Tau, la tensione scende al 37% del valore iniziale. Con R=1kΩ e C=1000µF: Tau = 1 secondo!"
        },
        {
          question: "Che forma ha la curva di scarica del condensatore mostrata dal multimetro?",
          options: ["Lineare: scende alla stessa velocità", "Esponenziale: scende veloce all'inizio, poi sempre più lentamente", "A scalini: scende a gradini uguali"],
          correct: 1,
          explanation: "La scarica segue una curva esponenziale decrescente. All'inizio c'è molta energia e la tensione cala rapidamente, poi rallenta perché rimane sempre meno energia!"
        }
      ]
    },

    {
      id: "v2-cap7-esp2",
      title: "Cap. 7 Esp. 2 - Scarica con LED rosso",
      desc: "Il condensatore si scarica attraverso il LED: lo vedi sfumare lentamente!",
      chapter: "Capitolo 7 - Cosa sono i condensatori?",
      difficulty: 2,
      icon: "\u{1F4A1}",
      simulationMode: "circuit",
      components: [
        { type: "battery9v", id: "bat1" },
        { type: "breadboard-half", id: "bb1" },
        { type: "capacitor", id: "c1", value: 1000 },
        { type: "push-button", id: "btn1" },
        { type: "led", id: "led1", color: "red" },
        { type: "resistor", id: "r1", value: 1000 },
        { type: "multimeter", id: "mm1" }
      ],
      pinAssignments: {
        "c1:positive": "bb1:e5",
        "c1:negative": "bb1:e6",
        "btn1:pin1": "bb1:e10",
        "btn1:pin2": "bb1:f12",
        "r1:pin1": "bb1:e15",
        "r1:pin2": "bb1:e22",
        "led1:anode": "bb1:d23",
        "led1:cathode": "bb1:d24"
      },
      connections: [
        { from: "bat1:positive", to: "bb1:bus-top-plus-1", color: "red" },
        { from: "bb1:bus-top-plus-10", to: "bb1:a10", color: "red" },
        { from: "bb1:a6", to: "bb1:bus-top-minus-6", color: "black" },
        { from: "bb1:bus-top-minus-1", to: "bat1:negative", color: "black" },
        { from: "bb1:g12", to: "bb1:c5", color: "yellow" },
        { from: "bb1:a5", to: "bb1:a15", color: "green" },
        { from: "bb1:a22", to: "bb1:a23", color: "orange" },
        { from: "bb1:a24", to: "bb1:bus-top-minus-24", color: "black" },
        { from: "mm1:probe-positive", to: "bb1:b5", color: "red" },
        { from: "mm1:probe-negative", to: "bb1:b6", color: "black" }
      ],
      layout: {
        "bat1": { x: 30, y: 55 },
        "bb1": { x: 100, y: 10 },
        "c1": { x: 155.25, y: 88.75 },
        "btn1": { x: 200.25, y: 81.25 },
        "r1": { x: 249, y: 73.75 },
        "led1": { x: 286.5, y: 43.75 },
        "mm1": { x: 340, y: 20 }
      },
      steps: [
        "Inserisci il condensatore da 1000\u00B5F con il positivo nel foro e5 e il negativo in e6.",
        "Posiziona il pulsante a cavallo dei fori e10 e f12.",
        "Inserisci il resistore da 1k\u03A9 tra i fori e15 e e22.",
        "Inserisci il LED rosso con l'anodo nel foro d23 e il catodo in d24.",
        "Collega il bus + della breadboard al pulsante (a10).",
        "Collega il negativo del condensatore (a6) alla riga - e poi al polo negativo.",
        "Collega l'uscita del pulsante (g12) al polo + del condensatore (c5), poi dal condensatore (a5) al resistore (a15).",
        "Collega il catodo del LED (a24) alla riga -.",
        "Collega il multimetro: sonda rossa al foro b5, sonda nera al foro b6."
      ],
      observe: "Premendo il pulsante, il LED si accende e poi sfuma lentamente! Puoi VEDERE l'energia del condensatore che si esaurisce. Il multimetro mostra la tensione che cala contemporaneamente.",
      unlimPrompt: "Sei Galileo, il tutor AI di ELAB. Lo studente sta guardando l'esperimento 'Scarica con LED rosso'. Qui il condensatore si scarica attraverso un LED e un resistore: puoi VEDERE l'energia che se ne va! Il LED parte luminoso e sfuma piano piano, come una torcia che si scarica. Questo \u00E8 il concetto di scarica RC reso visibile. Spiega in modo semplice e coinvolgente, usando analogie adatte a bambini di 8-12 anni. Rispondi in italiano.",
      code: null,
      hexFile: null,
      concept: "Scarica RC visibile: il LED sfuma man mano che il condensatore si scarica",
      layer: "terra",
      note: "Carica il condensatore, poi premi il pulsante: il LED si accende e sfuma lentamente!",
      buildSteps: [
        {
          step: 1,
          text: "Posiziona la breadboard (mezza) al centro del piano di lavoro. Sarà la base del tuo circuito!",
          componentId: "bb1",
          componentType: "breadboard-half",
          hint: "La breadboard collega i componenti senza saldature."
        },
        {
          step: 2,
          text: "Posiziona la batteria 9V accanto alla breadboard. È la fonte di energia del circuito!",
          componentId: "bat1",
          componentType: "battery9v",
          hint: "La batteria 9V alimenta il circuito."
        },
        {
          step: 3,
          text: "Prendi il condensatore da 1000µF dalla palette e posizionalo nei fori E5 e E6.",
          componentId: "c1",
          componentType: "capacitor",
          targetPins: { "c1:positive": "bb1:e5", "c1:negative": "bb1:e6" },
          hint: "Il polo + in E5, il polo − in E6. Attenzione alla polarità!"
        },
        {
          step: 4,
          text: "Prendi il pulsante dalla palette e posizionalo nei fori E10 e F12.",
          componentId: "btn1",
          componentType: "push-button",
          targetPins: { "btn1:pin1": "bb1:e10", "btn1:pin2": "bb1:f12" },
          hint: "Il pulsante va a cavallo della scanalatura centrale della breadboard."
        },
        {
          step: 5,
          text: "Prendi il LED rosso dalla palette e posizionalo nei fori D23 e D24.",
          componentId: "led1",
          componentType: "led",
          targetPins: { "led1:anode": "bb1:d23", "led1:cathode": "bb1:d24" },
          hint: "L'anodo (+, gamba lunga) va in D23 e il catodo (−, gamba corta) in D24."
        },
        {
          step: 6,
          text: "Prendi il resistore da 1kΩ dalla palette e posizionalo nei fori E15 e E22.",
          componentId: "r1",
// © Andrea Marro — 13/04/2026 — ELAB Tutor — Tutti i diritti riservati
          componentType: "resistor",
          targetPins: { "r1:pin1": "bb1:e15", "r1:pin2": "bb1:e22" },
          hint: "Il resistore limita la corrente nel circuito."
        },
        {
          step: 7,
          text: "Posiziona il multimetro accanto al circuito. Ti servirà per misurare!",
          componentId: "mm1",
          componentType: "multimeter",
          hint: "Il multimetro misura tensione, corrente e resistenza."
        },
        {
          step: 8,
          text: "Collega un filo ROSSO dal polo + della batteria al foro bus + superiore (col. 1).",
          wireFrom: "bat1:positive",
          wireTo: "bb1:bus-top-plus-1",
          wireColor: "red",
          hint: "Questo filo porta la corrente dalla batteria al bus positivo della breadboard."
        },
        {
          step: 9,
          text: "Collega un filo ROSSO dal foro bus + superiore (col. 5) al foro A5.",
          wireFrom: "bb1:bus-top-plus-5",
          wireTo: "bb1:a5",
          wireColor: "red",
          hint: "Questo filo porta la corrente dal bus positivo al componente."
        },
        {
          step: 10,
          text: "Collega un filo NERO dal foro A6 al foro bus − superiore (col. 6).",
          wireFrom: "bb1:a6",
          wireTo: "bb1:bus-top-minus-6",
          wireColor: "black",
          hint: "Questo filo riporta la corrente al bus negativo."
        },
        {
          step: 11,
          text: "Collega un filo NERO dal foro bus − superiore (col. 1) al polo − della batteria.",
          wireFrom: "bb1:bus-top-minus-1",
          wireTo: "bat1:negative",
          wireColor: "black",
          hint: "Questo filo chiude il circuito riportando la corrente alla batteria."
        },
        {
          step: 12,
          text: "Collega un filo ROSSO dal foro A5 al foro A10.",
          wireFrom: "bb1:a5",
          wireTo: "bb1:a10",
          wireColor: "red",
          hint: "Il filo rosso porta la corrente positiva."
        },
        {
          step: 13,
          text: "Collega un filo GIALLO dal foro G12 al foro A15.",
          wireFrom: "bb1:g12",
          wireTo: "bb1:a15",
          wireColor: "yellow",
          hint: "Questo filo attraversa la scanalatura e collega due parti del circuito."
        },
        {
          step: 14,
          text: "Collega un filo ARANCIONE dal foro A22 al foro A23.",
          wireFrom: "bb1:a22",
          wireTo: "bb1:a23",
          wireColor: "orange",
          hint: "Questo filo collega il resistore al LED."
        },
        {
          step: 15,
          text: "Collega un filo NERO dal foro A24 al foro bus − superiore (col. 24).",
          wireFrom: "bb1:a24",
          wireTo: "bb1:bus-top-minus-24",
          wireColor: "black",
          hint: "Questo filo riporta la corrente al bus negativo."
        },
        {
          step: 16,
          text: "Collega la sonda rossa (+) del multimetro al foro B5.",
          wireFrom: "mm1:probe-positive",
          wireTo: "bb1:b5",
          wireColor: "red",
          hint: "Posiziona la sonda per misurare la tensione nel punto desiderato."
        },
        {
          step: 17,
          text: "Collega la sonda nera (−) del multimetro al foro B6.",
          wireFrom: "mm1:probe-negative",
          wireTo: "bb1:b6",
          wireColor: "black",
          hint: "Posiziona la sonda per misurare la tensione nel punto desiderato."
        }
      ],
      quiz: [
        {
          question: "Perché il LED sfuma lentamente dopo aver premuto il pulsante?",
          options: ["Il condensatore si scarica gradualmente attraverso il LED", "Il LED si sta rompendo", "La batteria si sta scaricando"],
          correct: 0,
          explanation: "Quando premi il pulsante, il condensatore carico rilascia l'energia accumulata attraverso il LED. La corrente diminuisce man mano che il condensatore si scarica!"
        },
        {
          question: "Puoi VEDERE l'energia immagazzinata nel condensatore. Come?",
          options: ["Guardando dentro il condensatore", "Pesando il condensatore prima e dopo", "Il LED che si spegne lentamente mostra l'energia che si esaurisce"],
          correct: 2,
          explanation: "Il LED è un indicatore visivo perfetto: brilla forte quando il condensatore è carico e sfuma mentre si scarica. Stai letteralmente vedendo l'energia elettrica trasformarsi in luce!"
        }
      ]
    },

    {
      id: "v2-cap7-esp3",
      title: "Cap. 7 Esp. 3 - Condensatori in parallelo",
      desc: "Pi\u00F9 condensatori in parallelo = capacit\u00E0 maggiore = scarica pi\u00F9 lenta!",
      chapter: "Capitolo 7 - Cosa sono i condensatori?",
      difficulty: 2,
      icon: "⚡",
      simulationMode: "circuit",
      components: [
        { type: "battery9v", id: "bat1" },
        { type: "breadboard-half", id: "bb1" },
        { type: "capacitor", id: "c1", value: 1000 },
        { type: "capacitor", id: "c2", value: 1000 },
        { type: "capacitor", id: "c3", value: 1000 },
        { type: "push-button", id: "btn1" },
        { type: "resistor", id: "r1", value: 1000 },
        { type: "led", id: "led1", color: "red" }
      ],
      pinAssignments: {
        "c1:positive": "bb1:e3",
        "c1:negative": "bb1:e4",
        "c2:positive": "bb1:e7",
        "c2:negative": "bb1:e8",
        "c3:positive": "bb1:e10",
        "c3:negative": "bb1:e11",
        "btn1:pin1": "bb1:e14",
        "btn1:pin2": "bb1:f16",
        "r1:pin1": "bb1:e19",
        "r1:pin2": "bb1:e26",
        "led1:anode": "bb1:d26",
        "led1:cathode": "bb1:d27"
      },
      connections: [
        { from: "bat1:positive", to: "bb1:bus-top-plus-1", color: "red" },
        { from: "bb1:bus-top-plus-14", to: "bb1:a14", color: "red" },
        { from: "bb1:g16", to: "bb1:a3", color: "yellow" },
        { from: "bb1:a3", to: "bb1:a7", color: "green" },
        { from: "bb1:a7", to: "bb1:a10", color: "green" },
        { from: "bb1:a4", to: "bb1:bus-top-minus-4", color: "black" },
        { from: "bb1:a8", to: "bb1:bus-top-minus-8", color: "black" },
        { from: "bb1:a11", to: "bb1:bus-top-minus-11", color: "black" },
        { from: "bb1:bus-top-minus-1", to: "bat1:negative", color: "black" },
        { from: "bb1:a10", to: "bb1:a19", color: "orange" },
        { from: "bb1:a27", to: "bb1:bus-top-minus-27", color: "black" }
      ],
      layout: {
        "bat1": { x: 30, y: 55 },
        "bb1": { x: 100, y: 10 },
        "c1": { x: 140.25, y: 88.75 },
        "c2": { x: 170.25, y: 88.75 },
        "c3": { x: 192.75, y: 88.75 },
        "btn1": { x: 230.25, y: 81.25 },
        "r1": { x: 279, y: 73.75 },
        "led1": { x: 309, y: 43.75 }
      },
      steps: [
        "Inserisci tre condensatori da 1000\u00B5F: positivi nei fori e3, e7, e10 e negativi in e4, e8, e11.",
        "Collega i negativi dei condensatori alla riga - (fori a4, a8, a11).",
        "Posiziona il pulsante a cavallo dei fori e14 e f16.",
        "Inserisci il resistore da 1k\u03A9 tra i fori e19 e e26.",
        "Inserisci il LED rosso con l'anodo nel foro d26 e il catodo in d27.",
        "Collega il bus + della breadboard al pulsante (a14).",
        "Collega l'uscita del pulsante (g16) al primo condensatore (a3), poi a3\u2192a7\u2192a10 per collegare i positivi in parallelo.",
        "Collega l'ultimo condensatore (a10) al resistore (a19).",
        "Collega il catodo del LED (a27) alla riga - e poi al polo negativo della batteria."
      ],
      observe: "Il LED sfuma MOLTO pi\u00F9 lentamente rispetto a un solo condensatore! Con 3 condensatori da 1000\u00B5F in parallelo hai 3000\u00B5F: la capacit\u00E0 totale \u00E8 la somma. Tau = 1k\u03A9 \u00D7 3000\u00B5F = 3 secondi.",
      unlimPrompt: "Sei Galileo, il tutor AI di ELAB. Lo studente sta guardando l'esperimento 'Condensatori in parallelo'. Mettere condensatori in parallelo \u00E8 come mettere secchi d'acqua uno accanto all'altro: la capacit\u00E0 totale \u00E8 la somma di tutte! Con 3 condensatori da 1000\u00B5F, hai 3000\u00B5F totali. La scarica dura 3 volte di pi\u00F9 e il LED sfuma molto pi\u00F9 lentamente. Spiega in modo semplice e coinvolgente, usando analogie adatte a bambini di 8-12 anni. Rispondi in italiano.",
      code: null,
      hexFile: null,
      concept: "Condensatori in parallelo: Ctot = C1+C2+C3, scarica pi\u00F9 lenta",
      layer: "schema",
      note: "Confronta con 1 solo condensatore: il LED sfuma molto pi\u00F9 lentamente!",
      buildSteps: [
        {
          step: 1,
          text: "Posiziona la breadboard (mezza) al centro del piano di lavoro. Sarà la base del tuo circuito!",
          componentId: "bb1",
          componentType: "breadboard-half",
          hint: "La breadboard collega i componenti senza saldature."
        },
        {
          step: 2,
          text: "Posiziona la batteria 9V accanto alla breadboard. È la fonte di energia del circuito!",
          componentId: "bat1",
          componentType: "battery9v",
          hint: "La batteria 9V alimenta il circuito."
        },
        {
          step: 3,
          text: "Prendi il condensatore da 1000µF dalla palette e posizionalo nei fori E3 e E4.",
          componentId: "c1",
// © Andrea Marro — 13/04/2026 — ELAB Tutor — Tutti i diritti riservati
          componentType: "capacitor",
          targetPins: { "c1:positive": "bb1:e3", "c1:negative": "bb1:e4" },
          hint: "Il polo + in E3, il polo − in E4. Attenzione alla polarità!"
        },
        {
          step: 4,
          text: "Prendi il condensatore da 1000µF dalla palette e posizionalo nei fori E7 e E8.",
          componentId: "c2",
          componentType: "capacitor",
          targetPins: { "c2:positive": "bb1:e7", "c2:negative": "bb1:e8" },
          hint: "Il polo + in E7, il polo − in E8. Attenzione alla polarità!"
        },
        {
          step: 5,
          text: "Prendi il condensatore da 1000µF dalla palette e posizionalo nei fori E10 e E11.",
          componentId: "c3",
          componentType: "capacitor",
          targetPins: { "c3:positive": "bb1:e10", "c3:negative": "bb1:e11" },
          hint: "Il polo + in E10, il polo − in E11. Attenzione alla polarità!"
        },
        {
          step: 6,
          text: "Prendi il pulsante dalla palette e posizionalo nei fori E14 e F16.",
          componentId: "btn1",
          componentType: "push-button",
          targetPins: { "btn1:pin1": "bb1:e14", "btn1:pin2": "bb1:f16" },
          hint: "Il pulsante va a cavallo della scanalatura centrale della breadboard."
        },
        {
          step: 7,
          text: "Prendi il resistore da 1kΩ dalla palette e posizionalo nei fori E19 e E26.",
          componentId: "r1",
          componentType: "resistor",
          targetPins: { "r1:pin1": "bb1:e19", "r1:pin2": "bb1:e26" },
          hint: "Il resistore limita la corrente nel circuito."
        },
        {
          step: 8,
          text: "Prendi il LED rosso dalla palette e posizionalo nei fori D26 e D27.",
          componentId: "led1",
          componentType: "led",
          targetPins: { "led1:anode": "bb1:d26", "led1:cathode": "bb1:d27" },
          hint: "L'anodo (+, gamba lunga) va in D26 e il catodo (−, gamba corta) in D27."
        },
        {
          step: 9,
          text: "Collega un filo ROSSO dal polo + della batteria al foro bus + superiore (col. 1).",
          wireFrom: "bat1:positive",
          wireTo: "bb1:bus-top-plus-1",
          wireColor: "red",
          hint: "Questo filo porta la corrente dalla batteria al bus positivo della breadboard."
        },
        {
          step: 10,
          text: "Collega un filo ROSSO dal foro bus + superiore (col. 3) al foro A3.",
          wireFrom: "bb1:bus-top-plus-3",
          wireTo: "bb1:a3",
          wireColor: "red",
          hint: "Questo filo porta la corrente dal bus positivo al componente."
        },
        {
          step: 11,
          text: "Collega un filo ROSSO dal foro bus + superiore (col. 7) al foro A7.",
          wireFrom: "bb1:bus-top-plus-7",
          wireTo: "bb1:a7",
          wireColor: "red",
          hint: "Questo filo porta la corrente dal bus positivo al componente."
        },
        {
          step: 12,
          text: "Collega un filo ROSSO dal foro bus + superiore (col. 10) al foro A10.",
          wireFrom: "bb1:bus-top-plus-10",
          wireTo: "bb1:a10",
          wireColor: "red",
          hint: "Questo filo porta la corrente dal bus positivo al componente."
        },
        {
          step: 13,
          text: "Collega un filo NERO dal foro A4 al foro bus − superiore (col. 4).",
          wireFrom: "bb1:a4",
          wireTo: "bb1:bus-top-minus-4",
          wireColor: "black",
          hint: "Questo filo riporta la corrente al bus negativo."
        },
        {
          step: 14,
          text: "Collega un filo NERO dal foro A8 al foro bus − superiore (col. 8).",
          wireFrom: "bb1:a8",
          wireTo: "bb1:bus-top-minus-8",
          wireColor: "black",
          hint: "Questo filo riporta la corrente al bus negativo."
        },
        {
          step: 15,
          text: "Collega un filo NERO dal foro A11 al foro bus − superiore (col. 11).",
          wireFrom: "bb1:a11",
          wireTo: "bb1:bus-top-minus-11",
          wireColor: "black",
          hint: "Questo filo riporta la corrente al bus negativo."
        },
        {
          step: 16,
          text: "Collega un filo NERO dal foro bus − superiore (col. 1) al polo − della batteria.",
          wireFrom: "bb1:bus-top-minus-1",
          wireTo: "bat1:negative",
          wireColor: "black",
          hint: "Questo filo chiude il circuito riportando la corrente alla batteria."
        },
        {
          step: 17,
          text: "Collega un filo ROSSO dal foro A3 al foro A14.",
          wireFrom: "bb1:a3",
          wireTo: "bb1:a14",
          wireColor: "red",
          hint: "Il filo rosso porta la corrente positiva."
        },
        {
          step: 18,
          text: "Collega un filo GIALLO dal foro G16 al foro A19.",
          wireFrom: "bb1:g16",
          wireTo: "bb1:a19",
          wireColor: "yellow",
          hint: "Questo filo attraversa la scanalatura e collega due parti del circuito."
        },
        {
          step: 19,
          text: "Collega un filo NERO dal foro A27 al foro bus − superiore (col. 27).",
          wireFrom: "bb1:a27",
          wireTo: "bb1:bus-top-minus-27",
          wireColor: "black",
          hint: "Questo filo riporta la corrente al bus negativo."
        }
      ],
      quiz: [
        {
          question: "Cosa succede alla capacità totale quando metti 3 condensatori in parallelo?",
          options: ["Si sommano: Ctot = C1 + C2 + C3", "Si dividono: Ctot = C1 / 3", "Resta uguale a un solo condensatore"],
          correct: 0,
          explanation: "In parallelo le capacità si sommano! 3 condensatori da 1000µF = 3000µF totali. È come avere una batteria d'acqua 3 volte più grande!"
        },
        {
          question: "Perché il LED sfuma più lentamente con 3 condensatori in parallelo?",
          options: ["Perché i condensatori producono più luce", "Perché la capacità è 3 volte maggiore, quindi Tau è 3 volte più grande", "Perché la resistenza aumenta"],
          correct: 1,
          explanation: "Con Ctot = 3000µF e R = 1kΩ: Tau = 1kΩ × 3000µF = 3 secondi. Tre volte più lento rispetto a un solo condensatore (Tau = 1s)!"
        }
      ]
    },

    // -----------------------------------------------
    // v2-cap7-esp4: Variare R nella scarica RC
    // Same layout as cap7-esp2 (Cap + button + R + LED + multimeter)
    // -----------------------------------------------
    {
      id: "v2-cap7-esp4",
      title: "Cap. 7 Esp. 4 - Variare R nella scarica RC",
      desc: "Cambia il resistore nella scarica: Tau = R \u00D7 C. Pi\u00F9 R = scarica pi\u00F9 lenta!",
      chapter: "Capitolo 7 - Cosa sono i condensatori?",
      difficulty: 2,
      icon: "\u231B",
      simulationMode: "circuit",
      components: [
        { type: "battery9v", id: "bat1" },
        { type: "breadboard-half", id: "bb1" },
        { type: "capacitor", id: "c1", value: 1000 },
        { type: "push-button", id: "btn1" },
        { type: "resistor", id: "r1", value: 1000 },
        { type: "led", id: "led1", color: "red" },
        { type: "multimeter", id: "mm1" }
      ],
      pinAssignments: {
        "c1:positive": "bb1:e5",
        "c1:negative": "bb1:e6",
        "btn1:pin1": "bb1:e10",
        "btn1:pin2": "bb1:f12",
        "r1:pin1": "bb1:e15",
        "r1:pin2": "bb1:e22",
        "led1:anode": "bb1:d23",
        "led1:cathode": "bb1:d24"
      },
      connections: [
        { from: "bat1:positive", to: "bb1:bus-top-plus-1", color: "red" },
        { from: "bb1:bus-top-plus-10", to: "bb1:a10", color: "red" },
        { from: "bb1:a6", to: "bb1:bus-top-minus-6", color: "black" },
        { from: "bb1:bus-top-minus-1", to: "bat1:negative", color: "black" },
        { from: "bb1:g12", to: "bb1:c5", color: "yellow" },
        { from: "bb1:a5", to: "bb1:a15", color: "green" },
        { from: "bb1:a22", to: "bb1:a23", color: "orange" },
        { from: "bb1:a24", to: "bb1:bus-top-minus-24", color: "black" },
        { from: "mm1:probe-positive", to: "bb1:b5", color: "red" },
        { from: "mm1:probe-negative", to: "bb1:b6", color: "black" }
      ],
      layout: {
        "bat1": { x: 30, y: 55 },
        "bb1": { x: 100, y: 10 },
        "c1": { x: 155.25, y: 88.75 },
        "btn1": { x: 200.25, y: 81.25 },
        "r1": { x: 249, y: 73.75 },
        "led1": { x: 286.5, y: 43.75 },
        "mm1": { x: 340, y: 20 }
// © Andrea Marro — 13/04/2026 — ELAB Tutor — Tutti i diritti riservati
      },
      steps: [
        "Costruisci il circuito come nell'esperimento precedente (Cap.7 Esp.2).",
        "Inserisci il resistore da 1k\u03A9 tra e15 e e22.",
        "Carica il condensatore collegando la batteria, poi premi il pulsante.",
        "Osserva quanto tempo impiega il LED a spegnersi e la tensione sul multimetro.",
        "Sostituisci il resistore con uno da 470\u03A9: il LED si spegne pi\u00F9 velocemente!",
        "Ora prova con 4.7k\u03A9: il LED sfuma molto pi\u00F9 lentamente!",
        "Infine prova con 10k\u03A9: la scarica \u00E8 lentissima."
      ],
      observe: "Con R=470\u03A9 la scarica \u00E8 rapida (Tau\u22480.5s). Con R=1k\u03A9 Tau=1s. Con R=4.7k\u03A9 Tau=4.7s. Con R=10k\u03A9 Tau=10s! Pi\u00F9 grande il resistore, pi\u00F9 lentamente il condensatore si scarica. Tau = R \u00D7 C.",
      unlimPrompt: "Sei Galileo, il tutor AI di ELAB. Lo studente sta guardando l'esperimento 'Variare R nella scarica RC'. La costante di tempo Tau = R x C determina quanto velocemente si scarica il condensatore. Aumentando la resistenza \u00E8 come stringere un tubo: l'acqua (corrente) esce pi\u00F9 lentamente e il condensatore si scarica pi\u00F9 piano. Prova diversi resistori e osserva la differenza! Spiega in modo semplice e coinvolgente, usando analogie adatte a bambini di 8-12 anni. Rispondi in italiano.",
      code: null,
      hexFile: null,
      concept: "Costante di tempo Tau = R\u00D7C, variare R cambia velocit\u00E0 di scarica",
      layer: "terra",
      note: "Cambia il valore del resistore: 470\u03A9, 1k\u03A9, 4.7k\u03A9, 10k\u03A9. Osserva come cambia la velocit\u00E0 di scarica!",
      buildSteps: [
        {
          step: 1,
          text: "Posiziona la breadboard (mezza) al centro del piano di lavoro. Sarà la base del tuo circuito!",
          componentId: "bb1",
          componentType: "breadboard-half",
          hint: "La breadboard collega i componenti senza saldature."
        },
        {
          step: 2,
          text: "Posiziona la batteria 9V accanto alla breadboard. È la fonte di energia del circuito!",
          componentId: "bat1",
          componentType: "battery9v",
          hint: "La batteria 9V alimenta il circuito."
        },
        {
          step: 3,
          text: "Prendi il condensatore da 1000µF dalla palette e posizionalo nei fori E5 e E6.",
          componentId: "c1",
          componentType: "capacitor",
          targetPins: { "c1:positive": "bb1:e5", "c1:negative": "bb1:e6" },
          hint: "Il polo + in E5, il polo − in E6. Attenzione alla polarità!"
        },
        {
          step: 4,
          text: "Prendi il pulsante dalla palette e posizionalo nei fori E10 e F12.",
          componentId: "btn1",
          componentType: "push-button",
          targetPins: { "btn1:pin1": "bb1:e10", "btn1:pin2": "bb1:f12" },
          hint: "Il pulsante va a cavallo della scanalatura centrale della breadboard."
        },
        {
          step: 5,
          text: "Prendi il resistore da 1kΩ dalla palette e posizionalo nei fori E15 e E22.",
          componentId: "r1",
          componentType: "resistor",
          targetPins: { "r1:pin1": "bb1:e15", "r1:pin2": "bb1:e22" },
          hint: "Il resistore limita la corrente nel circuito."
        },
        {
          step: 6,
          text: "Prendi il LED rosso dalla palette e posizionalo nei fori D23 e D24.",
          componentId: "led1",
          componentType: "led",
          targetPins: { "led1:anode": "bb1:d23", "led1:cathode": "bb1:d24" },
          hint: "L'anodo (+, gamba lunga) va in D23 e il catodo (−, gamba corta) in D24."
        },
        {
          step: 7,
          text: "Posiziona il multimetro accanto al circuito. Ti servirà per misurare!",
          componentId: "mm1",
          componentType: "multimeter",
          hint: "Il multimetro misura tensione, corrente e resistenza."
        },
        {
          step: 8,
          text: "Collega un filo ROSSO dal polo + della batteria al foro bus + superiore (col. 1).",
          wireFrom: "bat1:positive",
          wireTo: "bb1:bus-top-plus-1",
          wireColor: "red",
          hint: "Questo filo porta la corrente dalla batteria al bus positivo della breadboard."
        },
        {
          step: 9,
          text: "Collega un filo ROSSO dal foro bus + superiore (col. 5) al foro A5.",
          wireFrom: "bb1:bus-top-plus-5",
          wireTo: "bb1:a5",
          wireColor: "red",
          hint: "Questo filo porta la corrente dal bus positivo al componente."
        },
        {
          step: 10,
          text: "Collega un filo NERO dal foro A6 al foro bus − superiore (col. 6).",
          wireFrom: "bb1:a6",
          wireTo: "bb1:bus-top-minus-6",
          wireColor: "black",
          hint: "Questo filo riporta la corrente al bus negativo."
        },
        {
          step: 11,
          text: "Collega un filo NERO dal foro bus − superiore (col. 1) al polo − della batteria.",
          wireFrom: "bb1:bus-top-minus-1",
          wireTo: "bat1:negative",
          wireColor: "black",
          hint: "Questo filo chiude il circuito riportando la corrente alla batteria."
        },
        {
          step: 12,
          text: "Collega un filo ROSSO dal foro A5 al foro A10.",
          wireFrom: "bb1:a5",
          wireTo: "bb1:a10",
          wireColor: "red",
          hint: "Il filo rosso porta la corrente positiva."
        },
        {
          step: 13,
          text: "Collega un filo GIALLO dal foro G12 al foro A15.",
          wireFrom: "bb1:g12",
          wireTo: "bb1:a15",
          wireColor: "yellow",
          hint: "Questo filo attraversa la scanalatura e collega due parti del circuito."
        },
        {
          step: 14,
          text: "Collega un filo ARANCIONE dal foro A22 al foro A23.",
          wireFrom: "bb1:a22",
          wireTo: "bb1:a23",
          wireColor: "orange",
          hint: "Questo filo collega il resistore al LED."
        },
        {
          step: 15,
          text: "Collega un filo NERO dal foro A24 al foro bus − superiore (col. 24).",
          wireFrom: "bb1:a24",
          wireTo: "bb1:bus-top-minus-24",
          wireColor: "black",
          hint: "Questo filo riporta la corrente al bus negativo."
        },
        {
          step: 16,
          text: "Collega la sonda rossa (+) del multimetro al foro B5.",
          wireFrom: "mm1:probe-positive",
          wireTo: "bb1:b5",
          wireColor: "red",
          hint: "Posiziona la sonda per misurare la tensione nel punto desiderato."
        },
        {
          step: 17,
          text: "Collega la sonda nera (−) del multimetro al foro B6.",
          wireFrom: "mm1:probe-negative",
          wireTo: "bb1:b6",
          wireColor: "black",
          hint: "Posiziona la sonda per misurare la tensione nel punto desiderato."
        }
      ],
      quiz: [
        {
          question: "Se aumenti il valore del resistore da 1kΩ a 10kΩ, cosa succede alla velocità di scarica?",
          options: ["La scarica diventa molto più lenta", "La scarica diventa più veloce", "Non cambia nulla"],
          correct: 0,
          explanation: "Tau = R × C. Con R più grande, Tau aumenta e la scarica è più lenta. Con R=10kΩ e C=1000µF: Tau = 10 secondi!"
        },
        {
          question: "Qual è la formula della costante di tempo Tau?",
          options: ["Tau = R + C", "Tau = R / C", "Tau = R × C"],
          correct: 2,
          explanation: "Tau = R × C. Con R in ohm e C in farad, il risultato è in secondi. Più grande R o C, più lenta la scarica!"
        }
      ]
    },

    // ═══════════════════════════════════════════════════
    // CAPITOLO 8 — Cosa sono i transistor? (3 esperimenti) — USA MOSFET!
    // ═══════════════════════════════════════════════════

    {
      id: "v2-cap8-esp1",
      title: "Cap. 8 Esp. 1 - MOSFET come interruttore",
      desc: "Collega il Gate a 9V e il MOSFET si apre: il LED si accende! Gate a 0V = LED spento.",
      chapter: "Capitolo 8 - Cosa sono i transistor?",
      difficulty: 2,
      icon: "\u{1F50C}",
      simulationMode: "circuit",
      components: [
        { type: "battery9v", id: "bat1" },
        { type: "breadboard-half", id: "bb1" },
        { type: "mosfet-n", id: "mos1" },
        { type: "resistor", id: "r1", value: 470 },
        { type: "led", id: "led1", color: "red" }
      ],
      pinAssignments: {
        "r1:pin1": "bb1:e5",
        "r1:pin2": "bb1:e12",
        "led1:anode": "bb1:d14",
        "led1:cathode": "bb1:d15",
        "mos1:gate": "bb1:f17",
        "mos1:drain": "bb1:f18",
        "mos1:source": "bb1:f19"
      },
      connections: [
        { from: "bat1:positive", to: "bb1:bus-top-plus-1", color: "red" },
        { from: "bb1:bus-top-plus-5", to: "bb1:a5", color: "red" },
        { from: "bb1:a12", to: "bb1:a14", color: "orange" },
// © Andrea Marro — 13/04/2026 — ELAB Tutor — Tutti i diritti riservati
        { from: "bb1:a15", to: "bb1:g18", color: "yellow" },
        { from: "bb1:g19", to: "bb1:bus-top-minus-19", color: "black" },
        { from: "bb1:bus-top-minus-1", to: "bat1:negative", color: "black" },
        { from: "bb1:bus-top-plus-17", to: "bb1:g17", color: "green" }
      ],
      layout: {
        "bat1": { x: 30, y: 55 },
        "bb1": { x: 100, y: 10 },
        "r1": { x: 174, y: 73.75 },
        "led1": { x: 219, y: 43.75 },
        "mos1": { x: 245.25, y: 91.25 }
      },
      steps: [
        "Posiziona il resistore da 470\u03A9 tra i fori e5 e e12.",
        "Inserisci il LED rosso con l'anodo in d14 e il catodo in d15.",
        "Inserisci il MOSFET con gate in f17, drain in f18, source in f19.",
        "Collega il resistore (a12) all'anodo del LED (a14), poi il catodo del LED (a15) al drain del MOSFET (g18) con un filo.",
        "Collega il source del MOSFET (g19) alla riga - della breadboard.",
        "Collega il polo positivo della batteria alla riga + e poi al foro a5.",
        "Collega un filo verde dalla riga + al gate del MOSFET (g17)."
      ],
      observe: "Con il Gate collegato a 9V, il MOSFET si apre e il LED si accende! Scollega il filo verde dal Gate: il LED si spegne. Il MOSFET funziona come un interruttore controllato dalla tensione.",
      unlimPrompt: "Sei Galileo, il tutor AI di ELAB. Lo studente sta guardando l'esperimento 'MOSFET come interruttore'. Il MOSFET \u00E8 come un cancello elettronico: quando metti tensione sul Gate (il 'grilletto'), il cancello si apre e la corrente pu\u00F2 passare dal Drain al Source, accendendo il LED. Senza tensione al Gate, il cancello \u00E8 chiuso e non passa nulla! Spiega in modo semplice e coinvolgente, usando analogie adatte a bambini di 8-12 anni. Rispondi in italiano.",
      code: null,
      hexFile: null,
      concept: "MOSFET N-channel come interruttore, Gate controlla Drain-Source",
      layer: "terra",
      note: "Gate collegato a 9V = MOSFET ON = LED acceso. Scollega Gate = LED spento.",
      buildSteps: [
        {
          step: 1,
          text: "Posiziona la breadboard (mezza) al centro del piano di lavoro. Sarà la base del tuo circuito!",
          componentId: "bb1",
          componentType: "breadboard-half",
          hint: "La breadboard collega i componenti senza saldature."
        },
        {
          step: 2,
          text: "Posiziona la batteria 9V accanto alla breadboard. È la fonte di energia del circuito!",
          componentId: "bat1",
          componentType: "battery9v",
          hint: "La batteria 9V alimenta il circuito."
        },
        {
          step: 3,
          text: "Prendi il MOSFET dalla palette e posizionalo nei fori F17, F18 e F19.",
          componentId: "mos1",
          componentType: "mosfet-n",
          targetPins: { "mos1:gate": "bb1:f17", "mos1:drain": "bb1:f18", "mos1:source": "bb1:f19" },
          hint: "I 3 pin: Gate in F17, Drain in F18, Source in F19."
        },
        {
          step: 4,
          text: "Prendi il resistore da 470Ω dalla palette e posizionalo nei fori E5 e E12.",
          componentId: "r1",
          componentType: "resistor",
          targetPins: { "r1:pin1": "bb1:e5", "r1:pin2": "bb1:e12" },
          hint: "Il resistore limita la corrente nel circuito."
        },
        {
          step: 5,
          text: "Prendi il LED rosso dalla palette e posizionalo nei fori D14 e D15.",
          componentId: "led1",
          componentType: "led",
          targetPins: { "led1:anode": "bb1:d14", "led1:cathode": "bb1:d15" },
          hint: "L'anodo (+, gamba lunga) va in D14 e il catodo (−, gamba corta) in D15."
        },
        {
          step: 6,
          text: "Collega un filo ROSSO dal polo + della batteria al foro bus + superiore (col. 1).",
          wireFrom: "bat1:positive",
          wireTo: "bb1:bus-top-plus-1",
          wireColor: "red",
          hint: "Questo filo porta la corrente dalla batteria al bus positivo della breadboard."
        },
        {
          step: 7,
          text: "Collega un filo ROSSO dal foro bus + superiore (col. 5) al foro A5.",
          wireFrom: "bb1:bus-top-plus-5",
          wireTo: "bb1:a5",
          wireColor: "red",
          hint: "Questo filo porta la corrente dal bus positivo al componente."
        },
        {
          step: 8,
          text: "Collega un filo ARANCIONE dal foro A12 al foro A14.",
          wireFrom: "bb1:a12",
          wireTo: "bb1:a14",
          wireColor: "orange",
          hint: "Questo filo collega il resistore al LED."
        },
        {
          step: 9,
          text: "Collega un filo GIALLO dal foro A15 al foro G18.",
          wireFrom: "bb1:a15",
          wireTo: "bb1:g18",
          wireColor: "yellow",
          hint: "Questo filo collega due parti del circuito."
        },
        {
          step: 10,
          text: "Collega un filo NERO dal foro G19 al foro bus − superiore (col. 19).",
          wireFrom: "bb1:g19",
          wireTo: "bb1:bus-top-minus-19",
          wireColor: "black",
          hint: "Questo filo riporta la corrente al bus negativo."
        },
        {
          step: 11,
          text: "Collega un filo NERO dal foro bus − superiore (col. 1) al polo − della batteria.",
          wireFrom: "bb1:bus-top-minus-1",
          wireTo: "bat1:negative",
          wireColor: "black",
          hint: "Questo filo chiude il circuito riportando la corrente alla batteria."
        },
        {
          step: 12,
          text: "Collega un filo VERDE dal foro bus + superiore (col. 17) al foro G17.",
          wireFrom: "bb1:bus-top-plus-17",
          wireTo: "bb1:g17",
          wireColor: "green",
          hint: "Questo filo porta la corrente dal bus positivo al componente."
        }
      ],
      quiz: [
        {
          question: "Come funziona il MOSFET come interruttore?",
          options: ["Tensione al Gate alta = acceso, tensione bassa = spento", "Corrente al Gate alta = acceso", "Il MOSFET è sempre acceso"],
          correct: 0,
          explanation: "Il MOSFET N-channel è controllato dalla TENSIONE: quando il Gate è sopra la soglia (~2V), il canale Drain-Source si apre e la corrente passa. Sotto la soglia, è spento!"
        },
        {
          question: "Qual è la differenza principale tra MOSFET e pulsante?",
          options: ["Non c'è differenza", "Il MOSFET è controllato dalla tensione, il pulsante dal dito", "Il pulsante è più veloce"],
          correct: 1,
          explanation: "Il pulsante è meccanico (lo premi col dito), il MOSFET è elettronico (lo controlli con una tensione). Il MOSFET può essere controllato da altri circuiti automaticamente!"
        }
      ]
    },

    // -----------------------------------------------
    // v2-cap8-esp2: MOSFET e carica del corpo
    // Same positions as esp1 but no gate wire
    // -----------------------------------------------
    {
      id: "v2-cap8-esp2",
      title: "Cap. 8 Esp. 2 - MOSFET e carica del corpo",
      desc: "Gate flottante! Tocca il Gate col dito: la carica statica del corpo accende il LED!",
      chapter: "Capitolo 8 - Cosa sono i transistor?",
      difficulty: 2,
      icon: "\u{1F91A}",
      simulationMode: "circuit",
      components: [
        { type: "battery9v", id: "bat1" },
        { type: "breadboard-half", id: "bb1" },
        { type: "mosfet-n", id: "mos1" },
        { type: "resistor", id: "r1", value: 470 },
        { type: "led", id: "led1", color: "red" }
      ],
      pinAssignments: {
        "r1:pin1": "bb1:e5",
        "r1:pin2": "bb1:e12",
        "led1:anode": "bb1:d12",
        "led1:cathode": "bb1:d13",
        "mos1:gate": "bb1:f18",
        "mos1:drain": "bb1:f19",
        "mos1:source": "bb1:f20"
      },
      connections: [
        { from: "bat1:positive", to: "bb1:bus-top-plus-1", color: "red" },
        { from: "bb1:bus-top-plus-5", to: "bb1:a5", color: "red" },
        { from: "bb1:a13", to: "bb1:g19", color: "yellow" },
        { from: "bb1:g20", to: "bb1:bus-top-minus-20", color: "black" },
        { from: "bb1:bus-top-minus-1", to: "bat1:negative", color: "black" }
      ],
      layout: {
        "bat1": { x: 30, y: 55 },
        "bb1": { x: 100, y: 10 },
        "r1": { x: 174, y: 73.75 },
        "led1": { x: 204, y: 43.75 },
        "mos1": { x: 252.75, y: 91.25 }
      },
      steps: [
        "Costruisci lo stesso circuito dell'Esp. 1, ma SENZA collegare il filo al Gate.",
        "Il Gate del MOSFET (f18) deve restare scollegato (flottante).",
        "Collega il polo positivo della batteria alla riga + e poi al foro a5.",
        "Collega il source del MOSFET (g20) alla riga - della breadboard.",
        "Strofina i piedi sul tappeto per caricarti di elettricit\u00E0 statica.",
        "Tocca delicatamente il pin del Gate con il dito!"
      ],
      observe: "Toccando il Gate, la carica statica del tuo corpo \u00E8 sufficiente per attivare il MOSFET e accendere il LED! Questo dimostra l'impedenza altissima del Gate: bastano pochissime cariche per controllarlo.",
      unlimPrompt: "Sei Galileo, il tutor AI di ELAB. Lo studente sta guardando l'esperimento 'MOSFET e carica del corpo'. In questo esperimento il Gate del MOSFET \u00E8 scollegato (flottante). Il Gate ha un'impedenza altissima, come una porta leggerissima: basta la minima carica statica del tuo corpo per 'spingerla' e accendere il LED! Quando cammini sul tappeto ti carichi di elettricit\u00E0 statica, e toccando il Gate la trasferisci. Spiega in modo semplice e coinvolgente, usando analogie adatte a bambini di 8-12 anni. Rispondi in italiano.",
      code: null,
      hexFile: null,
      concept: "Gate flottante, carica elettrostatica del corpo, impedenza altissima del Gate",
      layer: "terra",
      note: "Il Gate \u00E8 scollegato! Nel simulatore: clicca sul Gate per simulare il tocco del dito.",
      buildSteps: [
        {
          step: 1,
// © Andrea Marro — 13/04/2026 — ELAB Tutor — Tutti i diritti riservati
          text: "Posiziona la breadboard (mezza) al centro del piano di lavoro. Sarà la base del tuo circuito!",
          componentId: "bb1",
          componentType: "breadboard-half",
          hint: "La breadboard collega i componenti senza saldature."
        },
        {
          step: 2,
          text: "Posiziona la batteria 9V accanto alla breadboard. È la fonte di energia del circuito!",
          componentId: "bat1",
          componentType: "battery9v",
          hint: "La batteria 9V alimenta il circuito."
        },
        {
          step: 3,
          text: "Prendi il MOSFET dalla palette e posizionalo nei fori F18, F19 e F20.",
          componentId: "mos1",
          componentType: "mosfet-n",
          targetPins: { "mos1:gate": "bb1:f18", "mos1:drain": "bb1:f19", "mos1:source": "bb1:f20" },
          hint: "I 3 pin: Gate in F18, Drain in F19, Source in F20."
        },
        {
          step: 4,
          text: "Prendi il resistore da 470Ω dalla palette e posizionalo nei fori E5 e E12.",
          componentId: "r1",
          componentType: "resistor",
          targetPins: { "r1:pin1": "bb1:e5", "r1:pin2": "bb1:e12" },
          hint: "Il resistore limita la corrente nel circuito."
        },
        {
          step: 5,
          text: "Prendi il LED rosso dalla palette e posizionalo nei fori D12 e D13.",
          componentId: "led1",
          componentType: "led",
          targetPins: { "led1:anode": "bb1:d12", "led1:cathode": "bb1:d13" },
          hint: "L'anodo (+, gamba lunga) va in D12 e il catodo (−, gamba corta) in D13."
        },
        {
          step: 6,
          text: "Collega un filo ROSSO dal polo + della batteria al foro bus + superiore (col. 1).",
          wireFrom: "bat1:positive",
          wireTo: "bb1:bus-top-plus-1",
          wireColor: "red",
          hint: "Questo filo porta la corrente dalla batteria al bus positivo della breadboard."
        },
        {
          step: 7,
          text: "Collega un filo ROSSO dal foro bus + superiore (col. 5) al foro A5.",
          wireFrom: "bb1:bus-top-plus-5",
          wireTo: "bb1:a5",
          wireColor: "red",
          hint: "Questo filo porta la corrente dal bus positivo al componente."
        },
        {
          step: 8,
          text: "Collega un filo GIALLO dal foro A13 al foro G19.",
          wireFrom: "bb1:a13",
          wireTo: "bb1:g19",
          wireColor: "yellow",
          hint: "Questo filo collega due parti del circuito."
        },
        {
          step: 9,
          text: "Collega un filo NERO dal foro G20 al foro bus − superiore (col. 20).",
          wireFrom: "bb1:g20",
          wireTo: "bb1:bus-top-minus-20",
          wireColor: "black",
          hint: "Questo filo riporta la corrente al bus negativo."
        },
        {
          step: 10,
          text: "Collega un filo NERO dal foro bus − superiore (col. 1) al polo − della batteria.",
          wireFrom: "bb1:bus-top-minus-1",
          wireTo: "bat1:negative",
          wireColor: "black",
          hint: "Questo filo chiude il circuito riportando la corrente alla batteria."
        }
      ],
      quiz: [
        {
          question: "Perché la carica statica del tuo corpo può accendere il LED toccando il Gate?",
          options: ["Il corpo genera molta elettricità", "Il Gate ha un'impedenza altissima: bastano pochissime cariche", "Il MOSFET amplifica la corrente del corpo 1000 volte"],
          correct: 1,
          explanation: "Il Gate del MOSFET è isolato da uno strato di ossido sottilissimo. La sua impedenza è così alta che bastano le poche cariche statiche del tuo corpo per portarlo sopra la soglia!"
        },
        {
          question: "Cosa significa 'Gate flottante'?",
          options: ["Il Gate galleggia nell'aria", "Il Gate si muove fisicamente", "Il Gate non è collegato a nessun circuito"],
          correct: 2,
          explanation: "Gate flottante significa che il pin Gate non è collegato a nulla. La tensione al Gate dipende solo dalle cariche che arrivano dall'esterno, come il tocco del dito!"
        }
      ]
    },

    {
      id: "v2-cap8-esp3",
      title: "Cap. 8 Esp. 3 - MOSFET + pot + tensione soglia",
      desc: "Usa il potenziometro per variare la tensione al Gate. Trova la soglia Vth \u2248 2V!",
      chapter: "Capitolo 8 - Cosa sono i transistor?",
      difficulty: 3,
      icon: "\u{1F39B}\uFE0F",
      simulationMode: "circuit",
      components: [
        { type: "battery9v", id: "bat1" },
        { type: "breadboard-half", id: "bb1" },
        { type: "mosfet-n", id: "mos1" },
        { type: "potentiometer", id: "pot1", value: 10000 },
        { type: "resistor", id: "r1", value: 470 },
        { type: "led", id: "led1", color: "red" },
        { type: "multimeter", id: "mm1" }
      ],
      pinAssignments: {
        "r1:pin1": "bb1:e5",
        "r1:pin2": "bb1:e12",
        "led1:anode": "bb1:d12",
        "led1:cathode": "bb1:d13",
        "mos1:gate": "bb1:f17",
        "mos1:drain": "bb1:f18",
        "mos1:source": "bb1:f19",
        "pot1:vcc": "bb1:f24",
        "pot1:signal": "bb1:f25",
        "pot1:gnd": "bb1:f26"
      },
      connections: [
        { from: "bat1:positive", to: "bb1:bus-top-plus-1", color: "red" },
        { from: "bb1:bus-top-plus-5", to: "bb1:a5", color: "red" },
        { from: "bb1:a13", to: "bb1:g18", color: "yellow" },
        { from: "bb1:g19", to: "bb1:bus-top-minus-19", color: "black" },
        { from: "bb1:bus-top-minus-1", to: "bat1:negative", color: "black" },
        { from: "bb1:bus-top-plus-24", to: "bb1:g24", color: "red" },
        { from: "bb1:g25", to: "bb1:g17", color: "green" },
        { from: "bb1:g26", to: "bb1:bus-top-minus-26", color: "black" },
        { from: "mm1:probe-positive", to: "bb1:h17", color: "red" },
        { from: "mm1:probe-negative", to: "bb1:bus-top-minus-27", color: "black" }
      ],
      layout: {
        "bat1": { x: 30, y: 55 },
        "bb1": { x: 100, y: 10 },
        "r1": { x: 174, y: 73.75 },
        "led1": { x: 204, y: 43.75 },
        "mos1": { x: 245.25, y: 91.25 },
        "pot1": { x: 297.75, y: 68.75 },
        "mm1": { x: 360, y: 20 }
      },
      steps: [
        "Posiziona il resistore da 470\u03A9 tra i fori e5 e e12.",
        "Inserisci il LED rosso con l'anodo in d12 e il catodo in d13.",
        "Inserisci il MOSFET con gate in f17, drain in f18, source in f19.",
        "Posiziona il potenziometro da 10k\u03A9 con vcc in f24, signal in f25, gnd in f26.",
        "Collega la riga + al foro a5 e al foro g24 (vcc del pot).",
        "Collega il source del MOSFET (g19) e il gnd del pot (g26) alla riga -.",
        "Collega il signal del pot (g25) al gate del MOSFET (g17) con un filo verde.",
        "Collega il multimetro: sonda rossa al foro h17 (gate), sonda nera alla riga -."
      ],
      observe: "Girando il potenziometro lentamente, il multimetro mostra la tensione al Gate che sale da 0V a 9V. A circa 2V (la tensione di soglia Vth), il LED inizia ad accendersi! Sopra i 4V il MOSFET \u00E8 completamente aperto.",
      unlimPrompt: "Sei Galileo, il tutor AI di ELAB. Lo studente sta guardando l'esperimento 'MOSFET + pot + tensione soglia'. Il potenziometro \u00E8 come una manopola del volume: girando, cambi la tensione che arriva al Gate del MOSFET. Sotto una certa soglia (Vth, circa 2V) il MOSFET resta chiuso. Appena superi la soglia, si apre e il LED si accende! Il multimetro ti mostra esattamente a quale tensione avviene il 'click'. Spiega in modo semplice e coinvolgente, usando analogie adatte a bambini di 8-12 anni. Rispondi in italiano.",
      code: null,
      hexFile: null,
      concept: "Tensione di soglia Vth del MOSFET, transizione graduale ON/OFF",
      layer: "schema",
      note: "Gira il pot lentamente e osserva il multimetro: il LED si accende quando Vgate \u2265 Vth (~2V)!",
      buildSteps: [
        {
          step: 1,
          text: "Posiziona la breadboard (mezza) al centro del piano di lavoro. Sarà la base del tuo circuito!",
          componentId: "bb1",
          componentType: "breadboard-half",
          hint: "La breadboard collega i componenti senza saldature."
        },
        {
          step: 2,
          text: "Posiziona la batteria 9V accanto alla breadboard. È la fonte di energia del circuito!",
          componentId: "bat1",
          componentType: "battery9v",
          hint: "La batteria 9V alimenta il circuito."
        },
        {
          step: 3,
          text: "Prendi il MOSFET dalla palette e posizionalo nei fori F17, F18 e F19.",
          componentId: "mos1",
          componentType: "mosfet-n",
          targetPins: { "mos1:gate": "bb1:f17", "mos1:drain": "bb1:f18", "mos1:source": "bb1:f19" },
          hint: "I 3 pin: Gate in F17, Drain in F18, Source in F19."
        },
        {
          step: 4,
          text: "Prendi il potenziometro da 10kΩ dalla palette e posizionalo nei fori F24, F25 e F26.",
          componentId: "pot1",
          componentType: "potentiometer",
          targetPins: { "pot1:vcc": "bb1:f24", "pot1:signal": "bb1:f25", "pot1:gnd": "bb1:f26" },
          hint: "I 3 pin: VCC in F24, Signal in F25, GND in F26."
        },
        {
          step: 5,
          text: "Prendi il resistore da 470Ω dalla palette e posizionalo nei fori E5 e E12.",
          componentId: "r1",
          componentType: "resistor",
          targetPins: { "r1:pin1": "bb1:e5", "r1:pin2": "bb1:e12" },
          hint: "Il resistore limita la corrente nel circuito."
        },
        {
// © Andrea Marro — 13/04/2026 — ELAB Tutor — Tutti i diritti riservati
          step: 6,
          text: "Prendi il LED rosso dalla palette e posizionalo nei fori D12 e D13.",
          componentId: "led1",
          componentType: "led",
          targetPins: { "led1:anode": "bb1:d12", "led1:cathode": "bb1:d13" },
          hint: "L'anodo (+, gamba lunga) va in D12 e il catodo (−, gamba corta) in D13."
        },
        {
          step: 7,
          text: "Posiziona il multimetro accanto al circuito. Ti servirà per misurare!",
          componentId: "mm1",
          componentType: "multimeter",
          hint: "Il multimetro misura tensione, corrente e resistenza."
        },
        {
          step: 8,
          text: "Collega un filo ROSSO dal polo + della batteria al foro bus + superiore (col. 1).",
          wireFrom: "bat1:positive",
          wireTo: "bb1:bus-top-plus-1",
          wireColor: "red",
          hint: "Questo filo porta la corrente dalla batteria al bus positivo della breadboard."
        },
        {
          step: 9,
          text: "Collega un filo ROSSO dal foro bus + superiore (col. 5) al foro A5.",
          wireFrom: "bb1:bus-top-plus-5",
          wireTo: "bb1:a5",
          wireColor: "red",
          hint: "Questo filo porta la corrente dal bus positivo al componente."
        },
        {
          step: 10,
          text: "Collega un filo GIALLO dal foro A13 al foro G18.",
          wireFrom: "bb1:a13",
          wireTo: "bb1:g18",
          wireColor: "yellow",
          hint: "Questo filo collega due parti del circuito."
        },
        {
          step: 11,
          text: "Collega un filo NERO dal foro G19 al foro bus − superiore (col. 19).",
          wireFrom: "bb1:g19",
          wireTo: "bb1:bus-top-minus-19",
          wireColor: "black",
          hint: "Questo filo riporta la corrente al bus negativo."
        },
        {
          step: 12,
          text: "Collega un filo NERO dal foro bus − superiore (col. 1) al polo − della batteria.",
          wireFrom: "bb1:bus-top-minus-1",
          wireTo: "bat1:negative",
          wireColor: "black",
          hint: "Questo filo chiude il circuito riportando la corrente alla batteria."
        },
        {
          step: 13,
          text: "Collega un filo ROSSO dal foro bus + superiore (col. 24) al foro G24.",
          wireFrom: "bb1:bus-top-plus-24",
          wireTo: "bb1:g24",
          wireColor: "red",
          hint: "Questo filo porta la corrente dal bus positivo al componente."
        },
        {
          step: 14,
          text: "Collega un filo VERDE dal foro G25 al foro G17.",
          wireFrom: "bb1:g25",
          wireTo: "bb1:g17",
          wireColor: "green",
          hint: "Questo filo collega due parti del circuito."
        },
        {
          step: 15,
          text: "Collega un filo NERO dal foro G26 al foro bus − superiore (col. 26).",
          wireFrom: "bb1:g26",
          wireTo: "bb1:bus-top-minus-26",
          wireColor: "black",
          hint: "Questo filo riporta la corrente al bus negativo."
        },
        {
          step: 16,
          text: "Collega la sonda rossa (+) del multimetro al foro H17.",
          wireFrom: "mm1:probe-positive",
          wireTo: "bb1:h17",
          wireColor: "red",
          hint: "Posiziona la sonda per misurare la tensione nel punto desiderato."
        },
        {
          step: 17,
          text: "Collega la sonda nera (−) del multimetro al foro bus − superiore (col. 27).",
          wireFrom: "mm1:probe-negative",
          wireTo: "bb1:bus-top-minus-27",
          wireColor: "black",
          hint: "Questo filo riporta la corrente al bus negativo."
        }
      ],
      quiz: [
        {
          question: "Cos'è la tensione di soglia (Vth) del MOSFET?",
          options: ["La tensione minima al Gate per accendere il MOSFET", "La tensione massima che il MOSFET può sopportare", "La tensione della batteria"],
          correct: 0,
          explanation: "Vth (circa 2V per questo MOSFET) è la tensione minima che devi applicare al Gate perché il canale Drain-Source si apra e la corrente possa passare!"
        },
        {
          question: "Cosa succede girando il potenziometro lentamente da 0V a 9V al Gate?",
          options: ["Il LED si accende di colpo a 9V", "Il LED si accende gradualmente quando si supera Vth (~2V)", "Il LED lampeggia"],
          correct: 1,
          explanation: "Sotto Vth il MOSFET è spento. Intorno a Vth il LED inizia ad accendersi debolmente. Sopra 4V il MOSFET è completamente aperto e il LED brilla al massimo!"
        }
      ]
    },

    // ═══════════════════════════════════════════════════
    // CAPITOLO 9 — Cosa sono i fototransistor? (2 esperimenti)
    // ═══════════════════════════════════════════════════

    {
      id: "v2-cap9-esp1",
      title: "Cap. 9 Esp. 1 - Fototransistor come sensore",
      desc: "Il fototransistor cambia conduzione con la luce. Misura la tensione con il multimetro!",
      chapter: "Capitolo 9 - Cosa sono i fototransistor?",
      difficulty: 2,
      icon: "\u2600\uFE0F",
      simulationMode: "circuit",
      components: [
        { type: "battery9v", id: "bat1" },
        { type: "breadboard-half", id: "bb1" },
        { type: "phototransistor", id: "pt1" },
        { type: "resistor", id: "r1", value: 10000 },
        { type: "multimeter", id: "mm1" }
      ],
      pinAssignments: {
        "pt1:collector": "bb1:e8",
        "pt1:emitter": "bb1:e9",
        "r1:pin1": "bb1:e14",
        "r1:pin2": "bb1:e21"
      },
      connections: [
        { from: "bat1:positive", to: "bb1:bus-top-plus-1", color: "red" },
        { from: "bb1:bus-top-plus-8", to: "bb1:a8", color: "red" },
        { from: "bb1:a9", to: "bb1:a14", color: "yellow" },
        { from: "bb1:a21", to: "bb1:bus-top-minus-21", color: "black" },
        { from: "bb1:bus-top-minus-1", to: "bat1:negative", color: "black" },
        { from: "mm1:probe-positive", to: "bb1:b9", color: "red" },
        { from: "mm1:probe-negative", to: "bb1:bus-top-minus-25", color: "black" }
      ],
      layout: {
        "bat1": { x: 30, y: 55 },
        "bb1": { x: 100, y: 10 },
        "pt1": { x: 170.25, y: 73.75 },
        "r1": { x: 241.5, y: 73.75 },
        "mm1": { x: 340, y: 20 }
      },
      steps: [
        "Inserisci il fototransistor con il collettore nel foro e8 e l'emettitore in e9.",
        "Posiziona il resistore da 10k\u03A9 tra i fori e14 e e21.",
        "Collega la riga + al foro a8 (collettore del fototransistor).",
        "Collega l'emettitore (a9) al resistore (a14) con un filo.",
        "Collega il resistore (a21) alla riga - e poi al polo negativo della batteria.",
        "Collega il multimetro: sonda rossa al foro b9 (emettitore), sonda nera alla riga -."
      ],
      observe: "Con luce intensa, il multimetro mostra una tensione alta (il fototransistor conduce molta corrente). Al buio, la tensione scende quasi a zero. Il fototransistor e il resistore formano un partitore di tensione controllato dalla luce!",
      unlimPrompt: "Sei Galileo, il tutor AI di ELAB. Lo studente sta guardando l'esperimento 'Fototransistor come sensore'. Il fototransistor \u00E8 un componente magico: la luce lo controlla! Pi\u00F9 luce riceve, pi\u00F9 corrente lascia passare, come una porta che si apre con il sole. Il resistore e il fototransistor formano un partitore di tensione: con il multimetro puoi misurare quanta tensione c'\u00E8, e cambia a seconda della luce! Spiega in modo semplice e coinvolgente, usando analogie adatte a bambini di 8-12 anni. Rispondi in italiano.",
      code: null,
      hexFile: null,
      concept: "Fototransistor NPN, luce controlla corrente collector-emitter, partitore di tensione",
      layer: "terra",
      note: "Pi\u00F9 luce = pi\u00F9 corrente = pi\u00F9 tensione ai capi di R. Il multimetro misura la tensione sull'emitter.",
      buildSteps: [
        {
          step: 1,
          text: "Posiziona la breadboard (mezza) al centro del piano di lavoro. Sarà la base del tuo circuito!",
          componentId: "bb1",
          componentType: "breadboard-half",
          hint: "La breadboard collega i componenti senza saldature."
        },
        {
          step: 2,
          text: "Posiziona la batteria 9V accanto alla breadboard. È la fonte di energia del circuito!",
          componentId: "bat1",
          componentType: "battery9v",
          hint: "La batteria 9V alimenta il circuito."
        },
        {
          step: 3,
          text: "Prendi il fototransistor dalla palette e posizionalo nei fori E8 e E9.",
          componentId: "pt1",
          componentType: "phototransistor",
          targetPins: { "pt1:collector": "bb1:e8", "pt1:emitter": "bb1:e9" },
          hint: "Collettore in E8, emettitore in E9."
        },
        {
          step: 4,
          text: "Prendi il resistore da 10kΩ dalla palette e posizionalo nei fori E14 e E21.",
          componentId: "r1",
          componentType: "resistor",
          targetPins: { "r1:pin1": "bb1:e14", "r1:pin2": "bb1:e21" },
          hint: "Il resistore limita la corrente nel circuito."
        },
        {
          step: 5,
// © Andrea Marro — 13/04/2026 — ELAB Tutor — Tutti i diritti riservati
          text: "Posiziona il multimetro accanto al circuito. Ti servirà per misurare!",
          componentId: "mm1",
          componentType: "multimeter",
          hint: "Il multimetro misura tensione, corrente e resistenza."
        },
        {
          step: 6,
          text: "Collega un filo ROSSO dal polo + della batteria al foro bus + superiore (col. 1).",
          wireFrom: "bat1:positive",
          wireTo: "bb1:bus-top-plus-1",
          wireColor: "red",
          hint: "Questo filo porta la corrente dalla batteria al bus positivo della breadboard."
        },
        {
          step: 7,
          text: "Collega un filo ROSSO dal foro bus + superiore (col. 8) al foro A8.",
          wireFrom: "bb1:bus-top-plus-8",
          wireTo: "bb1:a8",
          wireColor: "red",
          hint: "Questo filo porta la corrente dal bus positivo al componente."
        },
        {
          step: 8,
          text: "Collega un filo GIALLO dal foro A9 al foro A14.",
          wireFrom: "bb1:a9",
          wireTo: "bb1:a14",
          wireColor: "yellow",
          hint: "Questo filo collega due parti del circuito."
        },
        {
          step: 9,
          text: "Collega un filo NERO dal foro A21 al foro bus − superiore (col. 21).",
          wireFrom: "bb1:a21",
          wireTo: "bb1:bus-top-minus-21",
          wireColor: "black",
          hint: "Questo filo riporta la corrente al bus negativo."
        },
        {
          step: 10,
          text: "Collega un filo NERO dal foro bus − superiore (col. 1) al polo − della batteria.",
          wireFrom: "bb1:bus-top-minus-1",
          wireTo: "bat1:negative",
          wireColor: "black",
          hint: "Questo filo chiude il circuito riportando la corrente alla batteria."
        },
        {
          step: 11,
          text: "Collega la sonda rossa (+) del multimetro al foro B9.",
          wireFrom: "mm1:probe-positive",
          wireTo: "bb1:b9",
          wireColor: "red",
          hint: "Posiziona la sonda per misurare la tensione nel punto desiderato."
        },
        {
          step: 12,
          text: "Collega la sonda nera (−) del multimetro al foro bus − superiore (col. 25).",
          wireFrom: "mm1:probe-negative",
          wireTo: "bb1:bus-top-minus-25",
          wireColor: "black",
          hint: "Questo filo riporta la corrente al bus negativo."
        }
      ],
      quiz: [
        {
          question: "Come funziona il fototransistor come sensore di luce?",
          options: ["Più luce riceve, più corrente lascia passare", "Meno luce riceve, più corrente passa", "La luce non influenza la corrente"],
          correct: 0,
          explanation: "Il fototransistor è come un rubinetto controllato dalla luce: più luce colpisce la base, più corrente scorre dal collettore all'emettitore!"
        },
        {
          question: "Cosa formano il fototransistor e il resistore insieme?",
          options: ["Un amplificatore di corrente", "Un generatore di energia solare", "Un partitore di tensione controllato dalla luce"],
          correct: 2,
          explanation: "Il fototransistor e il resistore formano un partitore di tensione: la tensione misurata dal multimetro cambia in base a quanta luce riceve il sensore!"
        }
      ]
    },

    {
      id: "v2-cap9-esp2",
      title: "Cap. 9 Esp. 2 - Luce notturna automatica",
      desc: "Buio = LED ON! Il fototransistor pilota un MOSFET: quando non c'\u00E8 luce, il LED si accende.",
      chapter: "Capitolo 9 - Cosa sono i fototransistor?",
      difficulty: 3,
      icon: "\u{1F319}",
      simulationMode: "circuit",
      components: [
        { type: "battery9v", id: "bat1" },
        { type: "breadboard-half", id: "bb1" },
        { type: "phototransistor", id: "pt1" },
        { type: "mosfet-n", id: "mos1" },
        { type: "resistor", id: "r1", value: 10000 },
        { type: "resistor", id: "r2", value: 10000 },
        { type: "resistor", id: "r3", value: 10000 },
        { type: "resistor", id: "r4", value: 10000 },
        { type: "resistor", id: "r5", value: 470 },
        { type: "led", id: "led1", color: "white" }
      ],
      pinAssignments: {
        "r1:pin1": "bb1:e3",
        "r1:pin2": "bb1:e10",
        "pt1:collector": "bb1:d10",
        "pt1:emitter": "bb1:d11",
        "r2:pin1": "bb1:f11",
        "r2:pin2": "bb1:f18",
        "r3:pin1": "bb1:f3",
        "r3:pin2": "bb1:f10",
        "r4:pin1": "bb1:f20",
        "r4:pin2": "bb1:f27",
        "mos1:gate": "bb1:f28",
        "mos1:drain": "bb1:f29",
        "mos1:source": "bb1:f30",
        "r5:pin1": "bb1:e20",
        "r5:pin2": "bb1:e27",
        "led1:anode": "bb1:d27",
        "led1:cathode": "bb1:d28"
      },
      connections: [
        { from: "bat1:positive", to: "bb1:bus-top-plus-1", color: "red" },
        { from: "bb1:bus-top-plus-3", to: "bb1:a3", color: "red" },
        { from: "bb1:bus-top-plus-20", to: "bb1:a20", color: "red" },
        { from: "bb1:bus-top-minus-1", to: "bat1:negative", color: "black" },
        { from: "bb1:a10", to: "bb1:g3", color: "orange" },
        { from: "bb1:a11", to: "bb1:g11", color: "yellow" },
        { from: "bb1:g18", to: "bb1:bus-top-minus-18", color: "black" },
        { from: "bb1:g10", to: "bb1:g20", color: "green" },
        { from: "bb1:g20", to: "bb1:g28", color: "green" },
        { from: "bb1:g27", to: "bb1:bus-top-minus-27", color: "black" },
        { from: "bb1:a28", to: "bb1:g29", color: "yellow" },
        { from: "bb1:g30", to: "bb1:bus-top-minus-30", color: "black" }
      ],
      layout: {
        "bat1": { x: 30, y: 55 },
        "bb1": { x: 100, y: 10 },
        "r1": { x: 159, y: 73.75 },
        "pt1": { x: 195.75, y: 66.25 },
        "r2": { x: 219, y: 91.25 },
        "r3": { x: 159, y: 91.25 },
        "r4": { x: 286.5, y: 91.25 },
        "mos1": { x: 342.75, y: 91.25 },
        "r5": { x: 286.5, y: 73.75 },
        "led1": { x: 316.5, y: 43.75 }
      },
      steps: [
        "Posiziona R1 (10k\u03A9) tra e3 e e10 (sezione sensore, riga superiore).",
        "Inserisci il fototransistor con il collettore in d10 e l'emettitore in d11.",
        "Nella riga inferiore, posiziona R2 (10k\u03A9) tra f11 e f18, R3 (10k\u03A9) tra f3 e f10.",
        "Posiziona R4 (10k\u03A9) tra f20 e f27 come pull-down dal Gate a GND.",
        "Inserisci il MOSFET con gate in f28, drain in f29, source in f30.",
        "Posiziona R5 (470\u03A9) tra e20 e e27. Inserisci il LED bianco con anodo in d27 e catodo in d28.",
        "Collega i fili: a10 a g3 (nodo sensore), a11 a g11 (emettitore), g10 a g20 a g28 (gate).",
        "Collega a28 a g29 (catodo LED a drain MOSFET). Collega source (g30) alla riga -."
      ],
      observe: "Con luce: il fototransistor conduce, la tensione al nodo R1/collettore scende, il Gate del MOSFET resta basso tramite R4 (pull-down) e il LED resta spento. Al buio: il fototransistor si chiude, la tensione sale, R3 porta la tensione al Gate, il MOSFET si apre e il LED si accende! Una vera luce notturna automatica!",
      unlimPrompt: "Sei Galileo, il tutor AI di ELAB. Lo studente sta guardando l'esperimento 'Luce notturna automatica'. Questo circuito \u00E8 intelligente: funziona al contrario! Quando c'\u00E8 luce, il fototransistor conduce e tiene il Gate del MOSFET basso, quindi il LED \u00E8 spento. Quando viene buio, il fototransistor si chiude, il Gate sale e il MOSFET accende il LED. \u00C8 lo stesso principio delle luci stradali che si accendono da sole di notte! Spiega in modo semplice e coinvolgente, usando analogie adatte a bambini di 8-12 anni. Rispondi in italiano.",
      code: null,
      hexFile: null,
      concept: "Luce notturna: fototransistor + MOSFET logica invertita, buio accende LED",
      layer: "cielo",
      note: "Con luce: fototransistor ON, tensione Gate bassa, MOSFET OFF, LED spento. Al buio: inverso!",
      buildSteps: [
        {
          step: 1,
          text: "Posiziona la breadboard (mezza) al centro del piano di lavoro. Sarà la base del tuo circuito!",
          componentId: "bb1",
          componentType: "breadboard-half",
          hint: "La breadboard collega i componenti senza saldature."
        },
        {
          step: 2,
          text: "Posiziona la batteria 9V accanto alla breadboard. È la fonte di energia del circuito!",
          componentId: "bat1",
          componentType: "battery9v",
          hint: "La batteria 9V alimenta il circuito."
        },
        {
          step: 3,
          text: "Prendi il fototransistor dalla palette e posizionalo nei fori D10 e D11.",
          componentId: "pt1",
          componentType: "phototransistor",
          targetPins: { "pt1:collector": "bb1:d10", "pt1:emitter": "bb1:d11" },
          hint: "Collettore in D10, emettitore in D11."
        },
        {
          step: 4,
          text: "Prendi il MOSFET dalla palette e posizionalo nei fori F28, F29 e F30.",
          componentId: "mos1",
          componentType: "mosfet-n",
          targetPins: { "mos1:gate": "bb1:f28", "mos1:drain": "bb1:f29", "mos1:source": "bb1:f30" },
          hint: "I 3 pin: Gate in F28, Drain in F29, Source in F30."
        },
        {
          step: 5,
          text: "Prendi il resistore da 10kΩ dalla palette e posizionalo nei fori E3 e E10.",
          componentId: "r1",
          componentType: "resistor",
          targetPins: { "r1:pin1": "bb1:e3", "r1:pin2": "bb1:e10" },
          hint: "Il resistore limita la corrente nel circuito."
        },
        {
// © Andrea Marro — 13/04/2026 — ELAB Tutor — Tutti i diritti riservati
          step: 6,
          text: "Prendi il resistore da 10kΩ dalla palette e posizionalo nei fori F11 e F18.",
          componentId: "r2",
          componentType: "resistor",
          targetPins: { "r2:pin1": "bb1:f11", "r2:pin2": "bb1:f18" },
          hint: "Il resistore limita la corrente nel circuito."
        },
        {
          step: 7,
          text: "Prendi il resistore da 10kΩ dalla palette e posizionalo nei fori F3 e F10.",
          componentId: "r3",
          componentType: "resistor",
          targetPins: { "r3:pin1": "bb1:f3", "r3:pin2": "bb1:f10" },
          hint: "Il resistore limita la corrente nel circuito."
        },
        {
          step: 8,
          text: "Prendi il resistore da 10kΩ dalla palette e posizionalo nei fori F20 e F27.",
          componentId: "r4",
          componentType: "resistor",
          targetPins: { "r4:pin1": "bb1:f20", "r4:pin2": "bb1:f27" },
          hint: "Il resistore limita la corrente nel circuito."
        },
        {
          step: 9,
          text: "Prendi il resistore da 470Ω dalla palette e posizionalo nei fori E20 e E27.",
          componentId: "r5",
          componentType: "resistor",
          targetPins: { "r5:pin1": "bb1:e20", "r5:pin2": "bb1:e27" },
          hint: "Il resistore limita la corrente nel circuito."
        },
        {
          step: 10,
          text: "Prendi il LED bianco dalla palette e posizionalo nei fori D27 e D28.",
          componentId: "led1",
          componentType: "led",
          targetPins: { "led1:anode": "bb1:d27", "led1:cathode": "bb1:d28" },
          hint: "L'anodo (+, gamba lunga) va in D27 e il catodo (−, gamba corta) in D28."
        },
        {
          step: 11,
          text: "Collega un filo ROSSO dal polo + della batteria al foro bus + superiore (col. 1).",
          wireFrom: "bat1:positive",
          wireTo: "bb1:bus-top-plus-1",
          wireColor: "red",
          hint: "Questo filo porta la corrente dalla batteria al bus positivo della breadboard."
        },
        {
          step: 12,
          text: "Collega un filo ROSSO dal foro bus + superiore (col. 3) al foro A3.",
          wireFrom: "bb1:bus-top-plus-3",
          wireTo: "bb1:a3",
          wireColor: "red",
          hint: "Questo filo porta la corrente dal bus positivo al componente."
        },
        {
          step: 13,
          text: "Collega un filo ROSSO dal foro bus + superiore (col. 20) al foro A20.",
          wireFrom: "bb1:bus-top-plus-20",
          wireTo: "bb1:a20",
          wireColor: "red",
          hint: "Questo filo porta la corrente dal bus positivo al componente."
        },
        {
          step: 14,
          text: "Collega un filo NERO dal foro bus − superiore (col. 1) al polo − della batteria.",
          wireFrom: "bb1:bus-top-minus-1",
          wireTo: "bat1:negative",
          wireColor: "black",
          hint: "Questo filo chiude il circuito riportando la corrente alla batteria."
        },
        {
          step: 15,
          text: "Collega un filo ARANCIONE dal foro A10 al foro G3.",
          wireFrom: "bb1:a10",
          wireTo: "bb1:g3",
          wireColor: "orange",
          hint: "Questo filo collega due parti del circuito."
        },
        {
          step: 16,
          text: "Collega un filo GIALLO dal foro A11 al foro G11.",
          wireFrom: "bb1:a11",
          wireTo: "bb1:g11",
          wireColor: "yellow",
          hint: "Questo filo collega due parti del circuito."
        },
        {
          step: 17,
          text: "Collega un filo NERO dal foro G18 al foro bus − superiore (col. 18).",
          wireFrom: "bb1:g18",
          wireTo: "bb1:bus-top-minus-18",
          wireColor: "black",
          hint: "Questo filo riporta la corrente al bus negativo."
        },
        {
          step: 18,
          text: "Collega un filo VERDE dal foro G10 al foro G20.",
          wireFrom: "bb1:g10",
          wireTo: "bb1:g20",
          wireColor: "green",
          hint: "Questo filo collega due parti del circuito."
        },
        {
          step: 19,
          text: "Collega un filo VERDE dal foro G20 al foro G28.",
          wireFrom: "bb1:g20",
          wireTo: "bb1:g28",
          wireColor: "green",
          hint: "Questo filo collega due parti del circuito."
        },
        {
          step: 20,
          text: "Collega un filo NERO dal foro G27 al foro bus − superiore (col. 27).",
          wireFrom: "bb1:g27",
          wireTo: "bb1:bus-top-minus-27",
          wireColor: "black",
          hint: "Questo filo riporta la corrente al bus negativo."
        },
        {
          step: 21,
          text: "Collega un filo GIALLO dal foro A28 al foro G29.",
          wireFrom: "bb1:a28",
          wireTo: "bb1:g29",
          wireColor: "yellow",
          hint: "Questo filo collega due parti del circuito."
        },
        {
          step: 22,
          text: "Collega un filo NERO dal foro G30 al foro bus − superiore (col. 30).",
          wireFrom: "bb1:g30",
          wireTo: "bb1:bus-top-minus-30",
          wireColor: "black",
          hint: "Questo filo riporta la corrente al bus negativo."
        }
      ],
      quiz: [
        {
          question: "Perché il LED si accende al buio e si spegne con la luce?",
          options: ["Il LED è difettoso", "La batteria funziona solo al buio", "Il fototransistor e il MOSFET creano una logica invertita"],
          correct: 2,
          explanation: "Con luce: il fototransistor conduce, la tensione al Gate resta bassa, il MOSFET è spento. Al buio: il fototransistor si chiude, la tensione sale al Gate, il MOSFET si apre e il LED si accende!"
        },
        {
          question: "A cosa serve il resistore di pull-down collegato al Gate del MOSFET?",
          options: ["Tiene il Gate a 0V quando il fototransistor conduce, evitando che il MOSFET resti acceso", "Protegge il LED dalla troppa corrente", "Fa brillare il LED più forte"],
          correct: 0,
          explanation: "Il pull-down scarica la tensione al Gate quando il fototransistor conduce. Senza di esso, il Gate potrebbe restare carico e il MOSFET resterebbe sempre acceso!"
        }
      ]
    },

    // ═══════════════════════════════════════════════════
    // CAPITOLO 10 — Il motore a corrente continua (4 esperimenti)
    // ═══════════════════════════════════════════════════

    // -----------------------------------------------
    // v2-cap10-esp1: Far girare il motore
    // -----------------------------------------------
    {
      id: "v2-cap10-esp1",
      title: "Cap. 10 Esp. 1 - Far girare il motore",
      desc: "Collegamento diretto: batteria 9V al motore DC. Gira!",
      chapter: "Capitolo 10 - Il motore a corrente continua",
      difficulty: 1,
      simulable: false,
      simulableReason: "Richiede motore DC fisico",
      icon: "\u2699\uFE0F",
      simulationMode: "circuit",
      components: [
        { type: "battery9v", id: "bat1" },
        { type: "breadboard-half", id: "bb1" },
        { type: "motor-dc", id: "mot1" }
      ],
      pinAssignments: {
        "mot1:positive": "bb1:a5",
        "mot1:negative": "bb1:a10"
      },
      connections: [
        { from: "bat1:positive", to: "bb1:bus-top-plus-1", color: "red" },
        { from: "bb1:bus-top-plus-5", to: "bb1:a5", color: "red" },
        { from: "bb1:a10", to: "bb1:bus-top-minus-10", color: "black" },
        { from: "bb1:bus-top-minus-1", to: "bat1:negative", color: "black" }
      ],
      layout: {
        "bat1": { x: 15, y: 60 },
        "bb1": { x: 100, y: 10 },
        "mot1": { x: 165, y: 35 }
      },
      steps: [
        "Collega il filo rosso dal polo positivo della batteria al terminale positivo del motore.",
        "Collega il filo nero dal terminale negativo del motore al polo negativo della batteria.",
        "Il motore inizia a girare!"
      ],
      observe: "Il motore gira! L'energia elettrica della batteria viene convertita in energia meccanica (movimento). Il verso di rotazione dipende dalla polarit\u00E0 dei collegamenti.",
      unlimPrompt: "Sei Galileo, il tutor AI di ELAB. Lo studente sta guardando l'esperimento 'Far girare il motore'. Il motore DC (a corrente continua) converte l'energia elettrica della batteria in movimento! Dentro ha magneti e bobine di filo: quando la corrente passa, crea un campo magnetico che fa girare l'asse. \u00C8 lo stesso principio delle ventole, dei frullatori e dei droni! Spiega in modo semplice e coinvolgente, usando analogie adatte a bambini di 8-12 anni. Rispondi in italiano.",
      code: null,
      hexFile: null,
      concept: "Motore DC, collegamento diretto, conversione energia elettrica in meccanica",
      layer: "terra",
// © Andrea Marro — 13/04/2026 — ELAB Tutor — Tutti i diritti riservati
      buildSteps: [
        {
          step: 1,
          text: "Posiziona la batteria 9V accanto alla breadboard. È la fonte di energia del circuito!",
          componentId: "bat1",
          componentType: "battery9v",
          hint: "La batteria 9V alimenta il circuito."
        },
        {
          step: 2,
          text: "Posiziona il motore DC sui fori A5 (positivo) e A10 (negativo).",
          componentId: "mot1",
          componentType: "motor-dc",
          targetPins: { "mot1:positive": "bb1:a5", "mot1:negative": "bb1:a10" },
          hint: "Il motore DC trasforma l'energia elettrica in movimento!"
        },
        {
          step: 3,
          text: "Collega un filo ROSSO dal polo + della batteria al bus + (colonna 1).",
          wireFrom: "bat1:positive",
          wireTo: "bb1:bus-top-plus-1",
          wireColor: "red",
          hint: "Il filo rosso porta la corrente positiva dalla batteria."
        },
        {
          step: 4,
          text: "Collega un filo ROSSO dal bus + (colonna 5) al foro A5 (positivo del motore).",
          wireFrom: "bb1:bus-top-plus-5",
          wireTo: "bb1:a5",
          wireColor: "red",
          hint: "Questo filo collega il positivo al motore."
        },
        {
          step: 5,
          text: "Collega un filo NERO dal foro A10 (negativo del motore) al bus − (colonna 10).",
          wireFrom: "bb1:a10",
          wireTo: "bb1:bus-top-minus-10",
          wireColor: "black",
          hint: "Questo filo collega il negativo del motore al bus."
        },
        {
          step: 6,
          text: "Collega un filo NERO dal bus − (colonna 1) al polo − della batteria.",
          wireFrom: "bb1:bus-top-minus-1",
          wireTo: "bat1:negative",
          wireColor: "black",
          hint: "Il filo nero chiude il circuito collegando il bus negativo alla batteria."
        }
      ],
      quiz: [
        {
          question: "Cosa converte il motore DC in questo circuito?",
          options: ["Energia luminosa in energia elettrica", "Energia elettrica in energia meccanica (movimento)", "Energia meccanica in energia elettrica"],
          correct: 1,
          explanation: "Il motore DC converte l'energia elettrica della batteria in movimento rotatorio. La corrente crea un campo magnetico che fa girare l'asse!"
        },
        {
          question: "Da cosa dipende il verso di rotazione del motore?",
          options: ["Dalla grandezza della batteria", "Dalla polarità dei collegamenti (quale filo va al + e quale al −)", "Dal colore dei fili"],
          correct: 1,
          explanation: "Il verso di rotazione dipende dalla direzione della corrente nelle bobine, che è determinata dalla polarità dei collegamenti!"
        }
      ]
    },

    // -----------------------------------------------
    // v2-cap10-esp2: Invertire la rotazione
    // -----------------------------------------------
    {
      id: "v2-cap10-esp2",
      title: "Cap. 10 Esp. 2 - Invertire la rotazione",
      desc: "Inverti i fili della batteria: il motore gira al contrario! La polarit\u00E0 conta.",
      chapter: "Capitolo 10 - Il motore a corrente continua",
      difficulty: 1,
      simulable: false,
      simulableReason: "Richiede motore DC fisico",
      icon: "\u{1F504}",
      simulationMode: "circuit",
      components: [
        { type: "battery9v", id: "bat1" },
        { type: "breadboard-half", id: "bb1" },
        { type: "motor-dc", id: "mot1" }
      ],
      pinAssignments: {
        "mot1:positive": "bb1:a10",
        "mot1:negative": "bb1:a5"
      },
      connections: [
        { from: "bat1:positive", to: "bb1:bus-top-plus-1", color: "red" },
        { from: "bb1:bus-top-plus-5", to: "bb1:a5", color: "red" },
        { from: "bb1:a10", to: "bb1:bus-top-minus-10", color: "black" },
        { from: "bb1:bus-top-minus-1", to: "bat1:negative", color: "black" }
      ],
      layout: {
        "bat1": { x: 15, y: 60 },
        "bb1": { x: 100, y: 10 },
        "mot1": { x: 165, y: 35 }
      },
      steps: [
        "Collega il filo rosso dal polo positivo della batteria al terminale NEGATIVO del motore.",
        "Collega il filo nero dal terminale POSITIVO del motore al polo negativo della batteria.",
        "Osserva: il motore gira nella direzione opposta!"
      ],
      observe: "Il motore gira al contrario rispetto all'esperimento precedente! Invertendo la polarit\u00E0, la corrente scorre in direzione opposta nelle bobine e il campo magnetico si inverte, facendo girare l'asse nell'altra direzione.",
      unlimPrompt: "Sei Galileo, il tutor AI di ELAB. Lo studente sta guardando l'esperimento 'Invertire la rotazione'. Invertendo i fili della batteria, la corrente scorre nella direzione opposta e il motore gira al contrario! \u00C8 come invertire il flusso d'acqua in un mulinello: gira dall'altra parte. Questo \u00E8 il bello dei motori DC: la polarit\u00E0 determina la direzione di rotazione. Spiega in modo semplice e coinvolgente, usando analogie adatte a bambini di 8-12 anni. Rispondi in italiano.",
      code: null,
      hexFile: null,
      concept: "Inversione polarit\u00E0, inversione rotazione motore DC",
      layer: "terra",
      note: "I fili sono invertiti rispetto all'esperimento 1: il motore gira nella direzione opposta!",
      buildSteps: [
        {
          step: 1,
          text: "Posiziona la batteria 9V accanto alla breadboard. È la fonte di energia del circuito!",
          componentId: "bat1",
          componentType: "battery9v",
          hint: "La batteria 9V alimenta il circuito."
        },
        {
          step: 2,
          text: "Posiziona il motore DC invertito: foro A5 al polo negativo, foro A10 al polo positivo.",
          componentId: "mot1",
          componentType: "motor-dc",
          targetPins: { "mot1:negative": "bb1:a5", "mot1:positive": "bb1:a10" },
          hint: "Invertendo i collegamenti, il motore girerà nella direzione opposta!"
        },
        {
          step: 3,
          text: "Collega un filo ROSSO dal polo + della batteria al bus + (colonna 1).",
          wireFrom: "bat1:positive",
          wireTo: "bb1:bus-top-plus-1",
          wireColor: "red",
          hint: "Il filo rosso porta la corrente positiva dalla batteria."
        },
        {
          step: 4,
          text: "Collega un filo ROSSO dal bus + (colonna 5) al foro A5 (negativo del motore, invertito!).",
          wireFrom: "bb1:bus-top-plus-5",
          wireTo: "bb1:a5",
          wireColor: "red",
          hint: "Attenzione: stiamo collegando il positivo della batteria al negativo del motore!"
        },
        {
          step: 5,
          text: "Collega un filo NERO dal foro A10 (positivo del motore, invertito!) al bus − (colonna 10).",
          wireFrom: "bb1:a10",
          wireTo: "bb1:bus-top-minus-10",
          wireColor: "black",
          hint: "Attenzione: stiamo collegando il positivo del motore al negativo!"
        },
        {
          step: 6,
          text: "Collega un filo NERO dal bus − (colonna 1) al polo − della batteria.",
          wireFrom: "bb1:bus-top-minus-1",
          wireTo: "bat1:negative",
          wireColor: "black",
          hint: "Il filo nero chiude il circuito."
        }
      ],
      quiz: [
        {
          question: "Come si inverte il senso di rotazione di un motore DC?",
          options: ["Invertendo la polarità dei collegamenti", "Aumentando la tensione", "Aggiungendo un resistore"],
          correct: 0,
          explanation: "Invertendo + e − il verso della corrente si inverte, il campo magnetico si inverte, e il motore gira nell'altra direzione!"
        },
        {
          question: "Perché il motore gira al contrario quando inverti i fili?",
          options: ["Il motore è rotto", "La batteria ha perso carica", "La corrente scorre in direzione opposta nelle bobine"],
          correct: 2,
          explanation: "Invertendo la polarità, la corrente nelle bobine cambia direzione. Il campo magnetico si inverte e l'asse gira nell'altra direzione!"
        }
      ]
    },

    {
      id: "v2-cap10-esp3",
      title: "Cap. 10 Esp. 3 - Motore con pulsante",
      desc: "Aggiungi un pulsante: il motore gira solo quando premi!",
      chapter: "Capitolo 10 - Il motore a corrente continua",
      difficulty: 1,
      simulable: false,
      simulableReason: "Richiede motore DC fisico",
      icon: "\u{1F518}",
      simulationMode: "circuit",
      components: [
        { type: "battery9v", id: "bat1" },
        { type: "breadboard-half", id: "bb1" },
        { type: "push-button", id: "btn1" },
        { type: "motor-dc", id: "mot1" }
      ],
      pinAssignments: {
        "btn1:pin1": "bb1:e10",
        "btn1:pin2": "bb1:f12"
      },
      connections: [
        { from: "bat1:positive", to: "bb1:bus-top-plus-1", color: "red" },
        { from: "bb1:bus-top-plus-10", to: "bb1:a10", color: "red" },
        { from: "bb1:g12", to: "mot1:positive", color: "yellow" },
        { from: "mot1:negative", to: "bb1:bus-top-minus-12", color: "black" },
// © Andrea Marro — 13/04/2026 — ELAB Tutor — Tutti i diritti riservati
        { from: "bb1:bus-top-minus-1", to: "bat1:negative", color: "black" }
      ],
      layout: {
        "bat1": { x: 30, y: 55 },
        "bb1": { x: 100, y: 10 },
        "btn1": { x: 200.25, y: 81.25 },
        "mot1": { x: 280, y: 30 }
      },
      steps: [
        "Posiziona il pulsante sulla breadboard a cavallo dei fori e10 e f12.",
        "Collega la riga + al foro a10 (pin sinistro del pulsante).",
        "Collega il pin destro del pulsante (g12) al terminale positivo del motore.",
        "Collega il terminale negativo del motore alla riga - della breadboard.",
        "Premi il pulsante: il motore gira! Rilascia: si ferma."
      ],
      observe: "Il motore gira SOLO quando tieni premuto il pulsante! Il pulsante apre e chiude il circuito: premuto = circuito chiuso = corrente passa = motore gira. Rilasciato = circuito aperto = niente corrente.",
      unlimPrompt: "Sei Galileo, il tutor AI di ELAB. Lo studente sta guardando l'esperimento 'Motore con pulsante'. Aggiungendo un pulsante, il circuito si apre e si chiude come un interruttore: premi e il motore gira, rilasci e si ferma! \u00C8 il concetto di circuito aperto (corrente non passa) e circuito chiuso (corrente passa). Ogni interruttore di casa tua funziona cos\u00EC! Spiega in modo semplice e coinvolgente, usando analogie adatte a bambini di 8-12 anni. Rispondi in italiano.",
      code: null,
      hexFile: null,
      concept: "Controllo manuale motore con pulsante, circuito aperto/chiuso",
      layer: "terra",
      buildSteps: [
        {
          step: 1,
          text: "Posiziona la breadboard (mezza) al centro del piano di lavoro. Sarà la base del tuo circuito!",
          componentId: "bb1",
          componentType: "breadboard-half",
          hint: "La breadboard collega i componenti senza saldature."
        },
        {
          step: 2,
          text: "Posiziona la batteria 9V accanto alla breadboard. È la fonte di energia del circuito!",
          componentId: "bat1",
          componentType: "battery9v",
          hint: "La batteria 9V alimenta il circuito."
        },
        {
          step: 3,
          text: "Prendi il pulsante dalla palette e posizionalo nei fori E10 e F12.",
          componentId: "btn1",
          componentType: "push-button",
          targetPins: { "btn1:pin1": "bb1:e10", "btn1:pin2": "bb1:f12" },
          hint: "Il pulsante va a cavallo della scanalatura centrale della breadboard."
        },
        {
          step: 4,
          text: "Posiziona il motore DC accanto al circuito. Trasforma l'elettricità in movimento!",
          componentId: "mot1",
          componentType: "motor-dc",
          hint: "Il motore DC trasforma l'energia elettrica in movimento!"
        },
        {
          step: 5,
          text: "Collega un filo ROSSO dal polo + della batteria al foro bus + superiore (col. 1).",
          wireFrom: "bat1:positive",
          wireTo: "bb1:bus-top-plus-1",
          wireColor: "red",
          hint: "Questo filo porta la corrente dalla batteria al bus positivo della breadboard."
        },
        {
          step: 6,
          text: "Collega un filo ROSSO dal foro bus + superiore (col. 10) al foro A10.",
          wireFrom: "bb1:bus-top-plus-10",
          wireTo: "bb1:a10",
          wireColor: "red",
          hint: "Questo filo porta la corrente dal bus positivo al componente."
        },
        {
          step: 7,
          text: "Collega un filo GIALLO dal foro G12 al polo positivo (+) del motore.",
          wireFrom: "bb1:g12",
          wireTo: "mot1:positive",
          wireColor: "yellow",
          hint: "Questo filo collega il motore al circuito."
        },
        {
          step: 8,
          text: "Collega un filo NERO dal polo negativo (-) del motore al foro bus − superiore (col. 12).",
          wireFrom: "mot1:negative",
          wireTo: "bb1:bus-top-minus-12",
          wireColor: "black",
          hint: "Questo filo riporta la corrente al bus negativo."
        },
        {
          step: 9,
          text: "Collega un filo NERO dal foro bus − superiore (col. 1) al polo − della batteria.",
          wireFrom: "bb1:bus-top-minus-1",
          wireTo: "bat1:negative",
          wireColor: "black",
          hint: "Questo filo chiude il circuito riportando la corrente alla batteria."
        }
      ],
      quiz: [
        {
          question: "Perché il motore gira solo quando tieni premuto il pulsante?",
          options: ["Il pulsante chiude il circuito e la corrente può passare", "Il pulsante genera energia extra", "Il pulsante inverte la polarità"],
          correct: 0,
          explanation: "Il pulsante funziona come un interruttore: premuto = circuito chiuso = corrente scorre = motore gira. Rilasciato = circuito aperto = niente corrente!"
        },
        {
          question: "Cosa succede quando rilasci il pulsante?",
          options: ["Il motore si ferma perché il circuito si apre", "Il motore continua a girare per inerzia", "Il motore gira al contrario"],
          correct: 0,
          explanation: "Rilasciando il pulsante il circuito si apre: niente corrente, niente forza elettromagnetica. Il motore si ferma (anche se gira ancora un po' per inerzia meccanica)."
        }
      ]
    },

    {
      id: "v2-cap10-esp4",
      title: "Cap. 10 Esp. 4 - Motore + pulsante + LED indicatore",
      desc: "Un LED si accende quando il motore gira: indicatore visivo di funzionamento!",
      chapter: "Capitolo 10 - Il motore a corrente continua",
      difficulty: 2,
      simulable: false,
      simulableReason: "Richiede motore DC fisico",
      icon: "\u{1F4A1}",
      simulationMode: "circuit",
      components: [
        { type: "battery9v", id: "bat1" },
        { type: "breadboard-half", id: "bb1" },
        { type: "push-button", id: "btn1" },
        { type: "motor-dc", id: "mot1" },
        { type: "resistor", id: "r1", value: 470 },
        { type: "led", id: "led1", color: "green" }
      ],
      pinAssignments: {
        "btn1:pin1": "bb1:e10",
        "btn1:pin2": "bb1:f12",
        "r1:pin1": "bb1:e16",
        "r1:pin2": "bb1:e23",
        "led1:anode": "bb1:d23",
        "led1:cathode": "bb1:d24"
      },
      connections: [
        { from: "bat1:positive", to: "bb1:bus-top-plus-1", color: "red" },
        { from: "bb1:bus-top-plus-10", to: "bb1:a10", color: "red" },
        { from: "bb1:g12", to: "mot1:positive", color: "yellow" },
        { from: "mot1:negative", to: "bb1:bus-top-minus-12", color: "black" },
        { from: "bb1:bus-top-minus-1", to: "bat1:negative", color: "black" },
        { from: "bb1:g12", to: "bb1:a16", color: "yellow" },
        { from: "bb1:a24", to: "bb1:bus-top-minus-24", color: "black" }
      ],
      layout: {
        "bat1": { x: 30, y: 55 },
        "bb1": { x: 100, y: 10 },
        "btn1": { x: 200.25, y: 81.25 },
        "mot1": { x: 340, y: 30 },
        "r1": { x: 256.5, y: 73.75 },
        "led1": { x: 286.5, y: 43.75 }
      },
      steps: [
        "Posiziona il pulsante sulla breadboard a cavallo dei fori e10 e f12.",
        "Posiziona il resistore da 470\u03A9 tra i fori e16 e e23.",
        "Inserisci il LED verde con l'anodo in d23 e il catodo in d24.",
        "Collega la riga + al foro a10 (pulsante).",
        "Dal pulsante (g12), collega sia al motore che al resistore (a16).",
        "Collega il catodo del LED (a24) e il negativo del motore alla riga -."
      ],
      observe: "Premendo il pulsante, il motore gira E il LED verde si accende contemporaneamente! Il LED e il motore sono in parallelo: ricevono la stessa tensione ma la corrente si divide. Il LED verde funziona come una spia che indica che il motore \u00E8 in funzione.",
      unlimPrompt: "Sei Galileo, il tutor AI di ELAB. Lo studente sta guardando l'esperimento 'Motore + pulsante + LED indicatore'. Qui il LED e il motore sono collegati in parallelo dopo il pulsante: quando premi, entrambi funzionano! Il LED verde fa da indicatore, come la spia sul cruscotto dell'auto che ti dice che il motore \u00E8 acceso. In parallelo, entrambi ricevono la stessa tensione ma la corrente si divide. Spiega in modo semplice e coinvolgente, usando analogie adatte a bambini di 8-12 anni. Rispondi in italiano.",
      code: null,
      hexFile: null,
      concept: "LED indicatore in parallelo al motore, feedback visivo",
      layer: "schema",
      note: "Il LED e il motore sono in parallelo dopo il pulsante: premendo, entrambi funzionano!",
      buildSteps: [
        {
          step: 1,
          text: "Posiziona la breadboard (mezza) al centro del piano di lavoro. Sarà la base del tuo circuito!",
          componentId: "bb1",
          componentType: "breadboard-half",
          hint: "La breadboard collega i componenti senza saldature."
        },
        {
          step: 2,
          text: "Posiziona la batteria 9V accanto alla breadboard. È la fonte di energia del circuito!",
          componentId: "bat1",
          componentType: "battery9v",
          hint: "La batteria 9V alimenta il circuito."
        },
        {
          step: 3,
          text: "Prendi il pulsante dalla palette e posizionalo nei fori E10 e F12.",
          componentId: "btn1",
          componentType: "push-button",
          targetPins: { "btn1:pin1": "bb1:e10", "btn1:pin2": "bb1:f12" },
          hint: "Il pulsante va a cavallo della scanalatura centrale della breadboard."
        },
        {
          step: 4,
          text: "Posiziona il motore DC accanto al circuito. Trasforma l'elettricità in movimento!",
          componentId: "mot1",
          componentType: "motor-dc",
          hint: "Il motore DC trasforma l'energia elettrica in movimento!"
        },
        {
          step: 5,
          text: "Prendi il resistore da 470Ω dalla palette e posizionalo nei fori E16 e E23.",
          componentId: "r1",
// © Andrea Marro — 13/04/2026 — ELAB Tutor — Tutti i diritti riservati
          componentType: "resistor",
          targetPins: { "r1:pin1": "bb1:e16", "r1:pin2": "bb1:e23" },
          hint: "Il resistore limita la corrente nel circuito."
        },
        {
          step: 6,
          text: "Prendi il LED verde dalla palette e posizionalo nei fori D23 e D24.",
          componentId: "led1",
          componentType: "led",
          targetPins: { "led1:anode": "bb1:d23", "led1:cathode": "bb1:d24" },
          hint: "L'anodo (+, gamba lunga) va in D23 e il catodo (−, gamba corta) in D24."
        },
        {
          step: 7,
          text: "Collega un filo ROSSO dal polo + della batteria al foro bus + superiore (col. 1).",
          wireFrom: "bat1:positive",
          wireTo: "bb1:bus-top-plus-1",
          wireColor: "red",
          hint: "Questo filo porta la corrente dalla batteria al bus positivo della breadboard."
        },
        {
          step: 8,
          text: "Collega un filo ROSSO dal foro bus + superiore (col. 10) al foro A10.",
          wireFrom: "bb1:bus-top-plus-10",
          wireTo: "bb1:a10",
          wireColor: "red",
          hint: "Questo filo porta la corrente dal bus positivo al componente."
        },
        {
          step: 9,
          text: "Collega un filo GIALLO dal foro G12 al polo positivo (+) del motore.",
          wireFrom: "bb1:g12",
          wireTo: "mot1:positive",
          wireColor: "yellow",
          hint: "Questo filo collega il motore al circuito."
        },
        {
          step: 10,
          text: "Collega un filo NERO dal polo negativo (-) del motore al foro bus − superiore (col. 12).",
          wireFrom: "mot1:negative",
          wireTo: "bb1:bus-top-minus-12",
          wireColor: "black",
          hint: "Questo filo riporta la corrente al bus negativo."
        },
        {
          step: 11,
          text: "Collega un filo NERO dal foro bus − superiore (col. 1) al polo − della batteria.",
          wireFrom: "bb1:bus-top-minus-1",
          wireTo: "bat1:negative",
          wireColor: "black",
          hint: "Questo filo chiude il circuito riportando la corrente alla batteria."
        },
        {
          step: 12,
          text: "Collega un filo GIALLO dal foro G12 al foro A16.",
          wireFrom: "bb1:g12",
          wireTo: "bb1:a16",
          wireColor: "yellow",
          hint: "Questo filo collega due parti del circuito."
        },
        {
          step: 13,
          text: "Collega un filo NERO dal foro A24 al foro bus − superiore (col. 24).",
          wireFrom: "bb1:a24",
          wireTo: "bb1:bus-top-minus-24",
          wireColor: "black",
          hint: "Questo filo riporta la corrente al bus negativo."
        }
      ],
      quiz: [
        {
          question: "Perché il LED verde e il motore si accendono insieme quando premi il pulsante?",
          options: ["Sono collegati in parallelo: ricevono la stessa tensione", "Sono collegati in serie: la corrente passa prima nel LED poi nel motore", "Il LED è dentro il motore"],
          correct: 0,
          explanation: "In parallelo, entrambi ricevono la stessa tensione dalla batteria. La corrente si divide: parte va al motore, parte al LED!"
        },
        {
          question: "A cosa serve il LED verde in questo circuito?",
          options: ["Fa girare il motore più velocemente", "È una spia che indica il funzionamento del motore", "Protegge il motore dalla troppa corrente"],
          correct: 1,
          explanation: "Il LED verde funziona come indicatore visivo: quando è acceso, sai che il motore sta girando. È un feedback per l'utente!"
        }
      ]
    },

    // ═══════════════════════════════════════════════════
    // CAPITOLO 11 — I diodi (0 esperimenti) — Solo teoria
    // ═══════════════════════════════════════════════════
    // Nessun esperimento pratico in questo capitolo

    // ═══════════════════════════════════════════════════
    // CAPITOLO 12 — Robot Segui Luce (1 progetto)
    // ═══════════════════════════════════════════════════

    {
      id: "v2-cap12-esp1",
      title: "Cap. 12 - Robot Segui Luce",
      desc: "Il progetto finale! Due fototransistor controllano due motori incrociati: il robot segue la luce!",
      chapter: "Capitolo 12 - Robot Segui Luce",
      difficulty: 3,
      simulable: false,
      simulableReason: "Richiede kit robot fisico",
      icon: "\u{1F916}",
      simulationMode: "circuit",
      components: [
        { type: "battery9v", id: "bat1" },
        { type: "breadboard-full", id: "bb1" },
        { type: "phototransistor", id: "pt1" },
        { type: "phototransistor", id: "pt2" },
        { type: "mosfet-n", id: "mos1" },
        { type: "mosfet-n", id: "mos2" },
        { type: "resistor", id: "r1", value: 10000 },
        { type: "resistor", id: "r2", value: 10000 },
        { type: "diode", id: "d1" },
        { type: "diode", id: "d2" },
        { type: "motor-dc", id: "mot1" },
        { type: "motor-dc", id: "mot2" }
      ],
      pinAssignments: {
        "pt1:collector": "bb1:e5",
        "pt1:emitter": "bb1:e6",
        "r1:pin1": "bb1:e9",
        "r1:pin2": "bb1:e16",
        "mos1:gate": "bb1:f7",
        "mos1:drain": "bb1:f8",
        "mos1:source": "bb1:f9",
        "d1:anode": "bb1:f12",
        "d1:cathode": "bb1:f13",
        "pt2:collector": "bb1:e19",
        "pt2:emitter": "bb1:e20",
        "r2:pin1": "bb1:e23",
        "r2:pin2": "bb1:e30",
        "mos2:gate": "bb1:f21",
        "mos2:drain": "bb1:f22",
        "mos2:source": "bb1:f23",
        "d2:anode": "bb1:f26",
        "d2:cathode": "bb1:f27"
      },
      connections: [
        { from: "bat1:positive", to: "bb1:bus-plus-1", color: "red" },
        { from: "bb1:bus-minus-1", to: "bat1:negative", color: "black" },
        // Sensore sinistro (pt1) — alimentazione e pull-down
        { from: "bb1:bus-plus-5", to: "bb1:a5", color: "red" },
        { from: "bb1:a6", to: "bb1:a9", color: "yellow" },
        { from: "bb1:a16", to: "bb1:bus-minus-16", color: "black" },
        // Sensore destro (pt2) — alimentazione e pull-down
        { from: "bb1:bus-plus-19", to: "bb1:a19", color: "red" },
        { from: "bb1:a20", to: "bb1:a23", color: "yellow" },
        { from: "bb1:a30", to: "bb1:bus-minus-30", color: "black" },
        // Cross-connection: pt1:emitter -> mos2:gate
        { from: "bb1:a6", to: "bb1:g21", color: "green" },
        // Cross-connection: pt2:emitter -> mos1:gate
        { from: "bb1:a20", to: "bb1:g7", color: "green" },
        // Motore sinistro (mot1): bat+ -> mot1 -> mos1:drain
        { from: "bb1:bus-plus-8", to: "mot1:positive", color: "red" },
        { from: "mot1:negative", to: "bb1:g8", color: "orange" },
        { from: "bb1:g9", to: "bb1:bus-minus-9", color: "black" },
        // Diodo D1: anode to mos1:drain net, cathode to bat+
        { from: "bb1:g12", to: "bb1:g8", color: "purple" },
        { from: "bb1:g13", to: "bb1:bus-plus-13", color: "purple" },
        // Motore destro (mot2): bat+ -> mot2 -> mos2:drain
        { from: "bb1:bus-plus-22", to: "mot2:positive", color: "red" },
        { from: "mot2:negative", to: "bb1:g22", color: "orange" },
        { from: "bb1:g23", to: "bb1:bus-minus-23", color: "black" },
        // Diodo D2: anode to mos2:drain net, cathode to bat+
        { from: "bb1:g26", to: "bb1:g22", color: "purple" },
        { from: "bb1:g27", to: "bb1:bus-plus-27", color: "purple" }
      ],
      layout: {
        "bat1": { x: 30, y: 55 },
        "bb1": { x: 100, y: 10 },
        "pt1": { x: 132.75, y: 73.75 },
        "r1": { x: 189, y: 73.75 },
        "mos1": { x: 162.75, y: 91.25 },
        "d1": { x: 200.25, y: 91.25 },
        "mot1": { x: 215, y: 30 },
        "pt2": { x: 237.75, y: 73.75 },
        "r2": { x: 294, y: 73.75 },
        "mos2": { x: 267.75, y: 91.25 },
        "d2": { x: 305.25, y: 91.25 },
        "mot2": { x: 325, y: 30 }
      },
      steps: [
        "Posiziona la breadboard grande (full) al centro del piano di lavoro.",
        "LATO SINISTRO: inserisci pt1 con collettore in e5 e emettitore in e6.",
        "Posiziona R1 (10k\u03A9) tra e9 e e16. Collega a6 a a9 (emettitore a R1).",
        "Inserisci mos1 con gate f7, drain f8, source f9. Posiziona D1 con anodo f12 e catodo f13.",
        "LATO DESTRO: inserisci pt2 con collettore in e19 e emettitore in e20.",
        "Posiziona R2 (10k\u03A9) tra e23 e e30. Collega a20 a a23 (emettitore a R2).",
        "Inserisci mos2 con gate f21, drain f22, source f23. Posiziona D2 con anodo f26 e catodo f27.",
        "Cross-connection: collega a6 a g21 (pt1 -> mos2 gate) e a20 a g7 (pt2 -> mos1 gate).",
        "Collega i motori: mot1 dalla riga + a g8 (drain mos1), mot2 dalla riga + a g22 (drain mos2)."
      ],
      observe: "Il robot segue la luce! Quando illumini il fototransistor destro (pt1), il suo emettitore sale, attivando mos2 che fa girare il motore destro: il robot gira a SINISTRA verso la luce. La cross-connection fa s\u00EC che ogni sensore controlli il motore opposto, creando un inseguimento automatico. I diodi proteggono i MOSFET dalla forza controelettromotrice dei motori.",
      unlimPrompt: "Sei Galileo, il tutor AI di ELAB. Lo studente sta guardando l'esperimento 'Robot Segui Luce'. Questo \u00E8 il progetto finale del Volume 2! Due fototransistor funzionano come gli 'occhi' del robot. Il trucco geniale \u00E8 la cross-connection: l'occhio destro controlla il motore sinistro e viceversa. Se la luce viene da destra, l'occhio destro attiva il motore sinistro e il robot gira verso la luce! I diodi proteggono i MOSFET dalla forza controelettromotrice dei motori. Spiega in modo semplice e coinvolgente, usando analogie adatte a bambini di 8-12 anni. Rispondi in italiano.",
      code: null,
      hexFile: null,
      concept: "Robot analogico: cross-connection fototransistor\u2192MOSFET\u2192motore, diodi flyback di protezione",
      layer: "cielo",
      note: "Cross-connection: fototransistor DX pilota motore SX e viceversa. I diodi proteggono i MOSFET dalla forza controelettromotrice dei motori.",
// © Andrea Marro — 13/04/2026 — ELAB Tutor — Tutti i diritti riservati
      buildSteps: [
        {
          step: 1,
          text: "Posiziona la breadboard (full-size) al centro del piano di lavoro. Sarà la base del tuo circuito!",
          componentId: "bb1",
          componentType: "breadboard-full",
          hint: "La breadboard full-size ha più spazio per i componenti."
        },
        {
          step: 2,
          text: "Posiziona la batteria 9V accanto alla breadboard. È la fonte di energia del circuito!",
          componentId: "bat1",
          componentType: "battery9v",
          hint: "La batteria 9V alimenta il circuito."
        },
        {
          step: 3,
          text: "Prendi il fototransistor dalla palette e posizionalo nei fori E5 e E6.",
          componentId: "pt1",
          componentType: "phototransistor",
          targetPins: { "pt1:collector": "bb1:e5", "pt1:emitter": "bb1:e6" },
          hint: "Collettore in E5, emettitore in E6."
        },
        {
          step: 4,
          text: "Prendi il fototransistor dalla palette e posizionalo nei fori E19 e E20.",
          componentId: "pt2",
          componentType: "phototransistor",
          targetPins: { "pt2:collector": "bb1:e19", "pt2:emitter": "bb1:e20" },
          hint: "Collettore in E19, emettitore in E20."
        },
        {
          step: 5,
          text: "Prendi il MOSFET dalla palette e posizionalo nei fori F7, F8 e F9.",
          componentId: "mos1",
          componentType: "mosfet-n",
          targetPins: { "mos1:gate": "bb1:f7", "mos1:drain": "bb1:f8", "mos1:source": "bb1:f9" },
          hint: "I 3 pin: Gate in F7, Drain in F8, Source in F9."
        },
        {
          step: 6,
          text: "Prendi il MOSFET dalla palette e posizionalo nei fori F21, F22 e F23.",
          componentId: "mos2",
          componentType: "mosfet-n",
          targetPins: { "mos2:gate": "bb1:f21", "mos2:drain": "bb1:f22", "mos2:source": "bb1:f23" },
          hint: "I 3 pin: Gate in F21, Drain in F22, Source in F23."
        },
        {
          step: 7,
          text: "Prendi il resistore da 10kΩ dalla palette e posizionalo nei fori E9 e E16.",
          componentId: "r1",
          componentType: "resistor",
          targetPins: { "r1:pin1": "bb1:e9", "r1:pin2": "bb1:e16" },
          hint: "Il resistore limita la corrente nel circuito."
        },
        {
          step: 8,
          text: "Prendi il resistore da 10kΩ dalla palette e posizionalo nei fori E23 e E30.",
          componentId: "r2",
          componentType: "resistor",
          targetPins: { "r2:pin1": "bb1:e23", "r2:pin2": "bb1:e30" },
          hint: "Il resistore limita la corrente nel circuito."
        },
        {
          step: 9,
          text: "Prendi il diodo dalla palette e posizionalo nei fori F12 e F13.",
          componentId: "d1",
          componentType: "diode",
          targetPins: { "d1:anode": "bb1:f12", "d1:cathode": "bb1:f13" },
          hint: "L'anodo in F12, il catodo (banda) in F13."
        },
        {
          step: 10,
          text: "Prendi il diodo dalla palette e posizionalo nei fori F26 e F27.",
          componentId: "d2",
          componentType: "diode",
          targetPins: { "d2:anode": "bb1:f26", "d2:cathode": "bb1:f27" },
          hint: "L'anodo in F26, il catodo (banda) in F27."
        },
        {
          step: 11,
          text: "Posiziona il motore DC accanto al circuito. Trasforma l'elettricità in movimento!",
          componentId: "mot1",
          componentType: "motor-dc",
          hint: "Il motore DC trasforma l'energia elettrica in movimento!"
        },
        {
          step: 12,
          text: "Posiziona il motore DC accanto al circuito. Trasforma l'elettricità in movimento!",
          componentId: "mot2",
          componentType: "motor-dc",
          hint: "Il motore DC trasforma l'energia elettrica in movimento!"
        },
        {
          step: 13,
          text: "Collega un filo ROSSO dal polo + della batteria al foro bus + superiore (col. 1).",
          wireFrom: "bat1:positive",
          wireTo: "bb1:bus-plus-1",
          wireColor: "red",
          hint: "Questo filo porta la corrente dalla batteria al bus positivo della breadboard."
        },
        {
          step: 14,
          text: "Collega un filo NERO dal foro bus − superiore (col. 1) al polo − della batteria.",
          wireFrom: "bb1:bus-minus-1",
          wireTo: "bat1:negative",
          wireColor: "black",
          hint: "Questo filo chiude il circuito riportando la corrente alla batteria."
        },
        {
          step: 15,
          text: "Collega un filo ROSSO dal foro bus + superiore (col. 5) al foro A5.",
          wireFrom: "bb1:bus-plus-5",
          wireTo: "bb1:a5",
          wireColor: "red",
          hint: "Questo filo porta la corrente dal bus positivo al componente."
        },
        {
          step: 16,
          text: "Collega un filo GIALLO dal foro A6 al foro A9.",
          wireFrom: "bb1:a6",
          wireTo: "bb1:a9",
          wireColor: "yellow",
          hint: "Questo filo collega due parti del circuito."
        },
        {
          step: 17,
          text: "Collega un filo NERO dal foro A16 al foro bus − superiore (col. 16).",
          wireFrom: "bb1:a16",
          wireTo: "bb1:bus-minus-16",
          wireColor: "black",
          hint: "Questo filo riporta la corrente al bus negativo."
        },
        {
          step: 18,
          text: "Collega un filo ROSSO dal foro bus + superiore (col. 19) al foro A19.",
          wireFrom: "bb1:bus-plus-19",
          wireTo: "bb1:a19",
          wireColor: "red",
          hint: "Questo filo porta la corrente dal bus positivo al componente."
        },
        {
          step: 19,
          text: "Collega un filo GIALLO dal foro A20 al foro A23.",
          wireFrom: "bb1:a20",
          wireTo: "bb1:a23",
          wireColor: "yellow",
          hint: "Questo filo collega due parti del circuito."
        },
        {
          step: 20,
          text: "Collega un filo NERO dal foro A30 al foro bus − superiore (col. 30).",
          wireFrom: "bb1:a30",
          wireTo: "bb1:bus-minus-30",
          wireColor: "black",
          hint: "Questo filo riporta la corrente al bus negativo."
        },
        {
          step: 21,
          text: "Collega un filo VERDE dal foro A6 al foro G21.",
          wireFrom: "bb1:a6",
          wireTo: "bb1:g21",
          wireColor: "green",
          hint: "Questo filo collega due parti del circuito."
        },
        {
          step: 22,
          text: "Collega un filo VERDE dal foro A20 al foro G7.",
          wireFrom: "bb1:a20",
          wireTo: "bb1:g7",
          wireColor: "green",
          hint: "Questo filo collega due parti del circuito."
        },
        {
          step: 23,
          text: "Collega un filo ROSSO dal foro bus + superiore (col. 8) al polo positivo (+) del motore.",
          wireFrom: "bb1:bus-plus-8",
          wireTo: "mot1:positive",
          wireColor: "red",
          hint: "Questo filo porta la corrente dal bus positivo al componente."
        },
        {
          step: 24,
          text: "Collega un filo ARANCIONE dal polo negativo (-) del motore al foro G8.",
          wireFrom: "mot1:negative",
          wireTo: "bb1:g8",
          wireColor: "orange",
          hint: "Questo filo collega il motore al circuito."
        },
        {
          step: 25,
          text: "Collega un filo NERO dal foro G9 al foro bus − superiore (col. 9).",
          wireFrom: "bb1:g9",
          wireTo: "bb1:bus-minus-9",
          wireColor: "black",
          hint: "Questo filo riporta la corrente al bus negativo."
        },
        {
          step: 26,
          text: "Collega un filo VIOLA dal foro G12 al foro G8.",
// © Andrea Marro — 13/04/2026 — ELAB Tutor — Tutti i diritti riservati
          wireFrom: "bb1:g12",
          wireTo: "bb1:g8",
          wireColor: "purple",
          hint: "Questo filo collega due parti del circuito."
        },
        {
          step: 27,
          text: "Collega un filo VIOLA dal foro G13 al foro bus + superiore (col. 13).",
          wireFrom: "bb1:g13",
          wireTo: "bb1:bus-plus-13",
          wireColor: "purple",
          hint: "Questo filo collega due parti del circuito."
        },
        {
          step: 28,
          text: "Collega un filo ROSSO dal foro bus + superiore (col. 22) al polo positivo (+) del motore.",
          wireFrom: "bb1:bus-plus-22",
          wireTo: "mot2:positive",
          wireColor: "red",
          hint: "Questo filo porta la corrente dal bus positivo al componente."
        },
        {
          step: 29,
          text: "Collega un filo ARANCIONE dal polo negativo (-) del motore al foro G22.",
          wireFrom: "mot2:negative",
          wireTo: "bb1:g22",
          wireColor: "orange",
          hint: "Questo filo collega il motore al circuito."
        },
        {
          step: 30,
          text: "Collega un filo NERO dal foro G23 al foro bus − superiore (col. 23).",
          wireFrom: "bb1:g23",
          wireTo: "bb1:bus-minus-23",
          wireColor: "black",
          hint: "Questo filo riporta la corrente al bus negativo."
        },
        {
          step: 31,
          text: "Collega un filo VIOLA dal foro G26 al foro G22.",
          wireFrom: "bb1:g26",
          wireTo: "bb1:g22",
          wireColor: "purple",
          hint: "Questo filo collega due parti del circuito."
        },
        {
          step: 32,
          text: "Collega un filo VIOLA dal foro G27 al foro bus + superiore (col. 27).",
          wireFrom: "bb1:g27",
          wireTo: "bb1:bus-plus-27",
          wireColor: "purple",
          hint: "Ultimo collegamento! Il circuito è quasi pronto."
        }
      ],
      quiz: [
        {
          question: "Perché ogni sensore del robot controlla il motore dal lato OPPOSTO?",
          options: ["Per far girare il robot VERSO la luce", "Per far girare il robot LONTANO dalla luce", "Non c'è un motivo, è casuale"],
          correct: 0,
          explanation: "La cross-connection fa sì che illuminando il sensore destro si attivi il motore destro, facendo girare il robot a sinistra — cioè verso la sorgente di luce!"
        },
        {
          question: "A cosa servono i diodi collegati ai motori?",
          options: ["Fanno girare i motori più velocemente", "Servono per invertire la rotazione", "Proteggono il MOSFET dalla forza controelettromotrice"],
          correct: 2,
          explanation: "Quando un motore si spegne, genera una tensione inversa (forza controelettromotrice) che potrebbe danneggiare il MOSFET. Il diodo assorbe questa tensione!"
        }
      ]
    }
  ]
};

export default EXPERIMENTS_VOL2;
