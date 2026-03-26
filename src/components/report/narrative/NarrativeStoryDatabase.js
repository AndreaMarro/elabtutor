/**
 * NarrativeStoryDatabase — Database di storie e metafore per i report ELAB
 * Metafore: circuiti = mondi da esplorare, componenti = personaggi, corrente = energia vitale
 * Target: ragazzi 10-13 anni — linguaggio videogames, avventure, supereroi
 */

export const STORY_THEMES = {
  adventure: {
    name: "L'Esplorazione",
    intro: "Oggi sei diventato un Esploratore dei Circuiti!",
    metaphor: "Ogni componente è un luogo magico, ogni filo è un sentiero che collega mondi diversi.",
    energy: "L'elettricità è come l'energia vitale che scorre in un mondo fantasy — senza di lei, tutto è buio.",
    success: "Missione compiuta! Hai mappato un nuovo territorio elettronico!",
    encouragement: "Anche gli esploratori più famosi si sono persi qualche volta. La prossima volta troverai la strada!"
  },
  
  superhero: {
    name: "Gli Eroi dell'Elettronica",
    intro: "Benvenuto nella Lega degli Eroi Tech!",
    metaphor: "Ogni componente ha un superpotere: il LED illumina l'oscurità, il resistore controlla la forza, il pulsante attiva i poteri.",
    energy: "La corrente elettrica è il tuo superpotere! Più ne hai, più luminoso diventa il tuo LED.",
    success: "Hai salvato il giorno! Il tuo circuito funziona alla perfezione!",
    encouragement: "Anche Iron Man ha fallito i primi test! Ogni errore ti rende più forte."
  },
  
  chef: {
    name: "Lo Chef dei Circuiti",
    intro: "Oggi cucineremo una ricetta elettronica speciale!",
    metaphor: "Gli ingredienti sono i componenti, la ricetta è lo schema, e il risultato è un circuito delizioso!",
    energy: "L'elettricità è il fuoco del forno — senza la giusta temperatura (tensione), la tua ricetta non cuoce!",
    success: "Che bontà! Hai preparato un circuito da chef stellato!",
    encouragement: "Anche i grandi chef bruciano qualche piatto. Ricetta quasi riuscita, la prossima sarà perfetta!"
  },

  sports: {
    name: "L'Atleta dell'Elettronica",
    intro: "Pronti per la gara di oggi?",
    metaphor: "Il circuito è il tuo campo da gioco, ogni componente è un giocatore in campo, i fili sono i passaggi.",
    energy: "La corrente è la velocità della palla — troppa velocità e il giocatore (LED) si stanca e si rompe!",
    success: "Gooooool! Hai segnato il punto vincente!",
    encouragement: "Anche Messi sbaglia i rigori. Allenamento fatto, la prossima partita vincerai!"
  },

  space: {
    name: "L'Astronauta Tech",
    intro: "Missione Spaziale: esplorare il Sistema Solare dei Circuiti!",
    metaphor: "Ogni componente è un pianeta, i fili sono le orbite, e tu sei il comandante della navicella.",
    energy: "L'elettricità è il carburante della tua navetta — senza carburante, resti bloccato nello spazio!",
    success: "Houston, abbiamo un successo! Il circuito è operativo!",
    encouragement: "Anche SpaceX ha avuto esplosioni prima del successo. Prossimo lancio: successo garantito!"
  }
};

export const COMPONENT_STORIES = {
  battery9v: {
    name: "La Fonte di Potere",
    story: "Questa è la tua centrale energetica! Senza di lei, tutto il regno è al buio.",
    analogy: "Come il cuore che pompa sangue in tutto il corpo.",
    funFact: "Una batteria da 9V ha sei piccole batterie da 1.5V dentro di sé!",
    emoji: "🔋"
  },
  
  led: {
    name: "Il Faro Luminoso",
    story: "Il LED è come un faro che illumina la notte. Quando gli arriva energia, si accende e festeggia con la luce!",
    analogy: "Come un pompiere che si attiva quando c'è un incendio (energia elettrica).",
    funFact: "LED sta per 'Light Emitting Diode' — Diodo Emettitore di Luce!",
    emoji: "💡"
  },

  'rgb-led': {
    name: "Il Camaleonte Digitale",
    story: "Questo LED magico può diventare di qualsiasi colore! Rosso, verde, blu... o tutti insieme per fare bianco!",
    analogy: "Come quando mescoli i colori ad acquerello — mescolando RGB ottieni milioni di colori!",
    funFact: "Il tuo schermo del cellulare ha milioni di mini LED RGB!",
    emoji: "🎨"
  },

  resistor: {
    name: "Il Guardiano della Corrente",
    story: "Il resistore è come un buttafuori in discoteca: lascia passare solo la giusta quantità di energia, non troppa!",
    analogy: "Come il rubinetto del bagno che regola quanta acqua esce.",
    funFact: "Le bande colorate sono un codice segreto che dice quanto è forte il resistore!",
    emoji: "🛡️"
  },

  'push-button': {
    name: "L'Interruttore Magico",
    story: "Premi il pulsante e... ZAC! Qualcosa si accende! È come una bacchetta magica che attiva i poteri.",
    analogy: "Come il campanello di casa: premi e qualcuno risponde (la luce si accende!).",
    funFact: "Esistono pulsanti che fanno 'click' e altri silenziosi — i tuoi preferiti?",
    emoji: "🔘"
  },

  potentiometer: {
    name: "Il Regolatore Universale",
    story: "Gira la manopola e controlli tutto! Più giri = più luce, più suono, più velocità!",
    analogy: "Come il volume della musica — da silenzioso a boom!",
    funFact: "I vecchi televisori usavano potenziometri per cambiare canale!",
    emoji: "🎛️"
  },

  capacitor: {
    name: "La Batteria Istantanea",
    story: "Il condensatore è come una spugna: assorbe energia in un attimo e la rilascia quando serve!",
    analogy: "Come un elastico: lo tiri (carichi) e poi lo lasci andare (scarichi!).",
    funFact: "I condensatori delle macchine fotografiche creano il flash!",
    emoji: "⚡"
  },

  buzzerPiezo: {
    name: "Il Cantante del Circuito",
    story: "Quando il buzzer canta, tutto il mondo lo sente! Può fare bip, musichette, allarmi...",
    analogy: "Come le corde vocali: più energia = suono più forte!",
    funFact: "Il buzzer prende il nome dal greco 'piezein' che significa 'schiacciare'!",
    emoji: "🔊"
  },

  servo: {
    name: "Il Braccio Robotico",
    story: "Il servo è muscoloso e preciso: gli dici "gira a 45 gradi" e lui obbedisce esattamente!",
    analogy: "Come il tuo gomito: si piega con precisione esattamente dove vuoi.",
    funFact: "I servi sono usati nei robot, nei droni e nei modellini di aerei!",
    emoji: "🦾"
  },

  'lcd-16x2': {
    name: "Il Messaggero Digitale",
    story: "L'LCD è come un cartellone luminoso: puoi scriverci qualsiasi messaggio e tutti lo leggono!",
    analogy: "Come il tabellone degli aeroporti che mostra i voli.",
    funFact: "16x2 significa 16 caratteri per 2 righe — spazio per scrivere 'Ciao Mondo!'",
    emoji: "📟"
  },

  motorDC: {
    name: "Il Turbo del Circuito",
    story: "Quando il motore parte... vroom vroom! Trasforma l'elettricità in movimento puro!",
    analogy: "Come il motore di una macchina, ma in miniatura.",
    funFact: "Tutte le macchinine telecomandate usano motori DC come questo!",
    emoji: "🏎️"
  },

  breadboard: {
    name: "La Città dei Circuiti",
    story: "La breadboard è come una città con strade e vicoli: ogni buco è una casa dove i componenti possono vivere!",
    analogy: "Come una base LEGO dove attacchi tutti i mattoncini.",
    funFact: "Si chiama 'breadboard' perché una volta si usavano le taglieri del pane!",
    emoji: "🏙️"
  },

  'nano-r4': {
    name: "Il Cervello del Tutto",
    story: "Arduino è il capo: dà gli ordini a tutti gli altri componenti e decide COSA fare e QUANDO farlo!",
    analogy: "Come l'allenatore di una squadra: decide la strategia e coordina i giocatori.",
    funFact: "Arduino è nato in Italia, a Ivrea, e porta il nome di un bar!",
    emoji: "🧠"
  }
};

export const EXERCISE_TEMPLATES = {
  quiz: [
    {
      question: "Se aggiungi un resistore più GRANDE (più ohm), cosa succede al LED?",
      options: [
        "Il LED diventa più luminoso",
        "Il LED diventa meno luminoso (CORRETTO!)",
        "Il LED cambia colore",
        "Il LED esplode 💥"
      ],
      explanation: "Un resistore più grande ferma più corrente, quindi il LED riceve meno energia e brilla meno!",
      difficulty: "medium"
    },
    {
      question: "Cosa succede se colleghi il LED al contrario (invertendo + e -)?",
      options: [
        "Si accende uguale",
        "Non si accende per niente (CORRETTO!)",
        "Esplode",
        "Diventa un buzzer"
      ],
      explanation: "Il LED è come una valvola a senso unico: lascia passare la corrente solo in una direzione!",
      difficulty: "easy"
    },
    {
      question: "Se metti DUE LED in serie (uno dopo l'altro), cosa succede?",
      options: [
        "Si accendono entrambi normalmente",
        "Si dividono la corrente e sono meno luminosi (CORRETTO!)",
        "Si accende solo il primo",
        "Si accendono più luminosi"
      ],
      explanation: "In serie, i componenti dividono la tensione come se dividessi una pizza in più fette!",
      difficulty: "hard"
    },
    {
      question: "Perché usiamo la breadboard?",
      options: [
        "Per saldare i componenti",
        "Per collegare componenti senza saldatura (CORRETTO!)",
        "Per caricare il codice",
// © Andrea Marro — 26/03/2026 — ELAB Tutor — Tutti i diritti riservati
        "Per misurare la corrente"
      ],
      explanation: "La breadboard è magica: permette di fare connessioni temporanee senza saldare nulla!",
      difficulty: "easy"
    },
    {
      question: "Cosa controlla il potenziometro?",
      options: [
        "La temperatura",
        "La resistenza variabile (CORRETTO!)",
        "Il colore del LED",
        "L'ora"
      ],
      explanation: "Girando il potenziometro cambi quanta resistenza c'è nel circuito, come un rubinetto!",
      difficulty: "easy"
    }
  ],

  challenge: [
    {
      title: "Sfida del Detective 🔍",
      description: "Il tuo LED non si accende. Fai una lista di 3 cose da controllare:",
      hints: [
        "La batteria è collegata correttamente?",
        "Il LED è nel verso giusto?",
        "Ci sono fili scollegati?"
      ],
      difficulty: "medium"
    },
    {
      title: "Sfida dell'Inventore 💡",
      description: "Prova a disegnare un nuovo circuito che usi un LED ROSSO e uno VERDE che si accendono alternativamente.",
      hints: [
        "Ti servirà un pulsante per cambiare",
        "Arduino può scegliere quale LED accendere",
        "Prova a pensare a un semaforo!"
      ],
      difficulty: "hard"
    },
    {
      title: "Sfida del Calcolo 🧮",
      description: "Se hai una batteria da 9V e un LED che vuole 2V, quanti volt 'mangia' il resistore?",
      answer: "7V",
      explanation: "9V - 2V = 7V! Il resistore deve 'bruciare' i volt in eccesso per proteggere il LED.",
      difficulty: "medium"
    }
  ],

  creative: [
    {
      title: "Inventa una Storia 📝",
      prompt: "Immagina che i componenti del tuo circuito sono personaggi di un videogioco. Scrivi 3 righe di storia:",
      example: "Il LED Rosso è il guerriero che difende il castello. Quando il Pulsante (il re) lo chiama, il guerriero si illumina di coraggio!"
    },
    {
      title: "Disegna il Circuito 🎨",
      prompt: "Prendi un foglio e disegna il tuo circuito come se fosse una mappa di un videogioco. Dov'è il tesoro (il LED)?",
      example: "Disegna la breadboard come un'isola, i fili come ponti, e il LED come un faro sulla cima della montagna!"
    }
  ]
};

export const ACHIEVEMENTS = [
  { id: "first_circuit", name: "Primo Circuito", emoji: "🌟", desc: "Hai completato il tuo primo circuito!" },
  { id: "led_master", name: "Maestro dei LED", emoji: "💡", desc: "Hai usato tutti i colori di LED!" },
  { id: "code_warrior", name: "Guerriero del Codice", emoji: "⌨️", desc: "Hai scritto più di 20 righe di codice!" },
  { id: "debug_hero", name: "Eroe del Debug", emoji: "🐛", desc: "Hai trovato e corretto un errore!" },
  { id: "chat_explorer", name: "Esploratore Curioso", emoji: "🗣️", desc: "Hai fatto 5 domande a UNLIM!" },
  { id: "quiz_champion", name: "Campione del Quiz", emoji: "🏆", desc: "Hai risposto corretto a tutte le domande!" },
  { id: "time_lord", name: "Signore del Tempo", emoji: "⏱️", desc: "Hai lavorato per più di 30 minuti!" },
  { id: "component_collector", name: "Collezionista", emoji: "🧩", desc: "Hai usato più di 5 componenti diversi!" }
];

export const ENCOURAGEMENT_MESSAGES = {
  perfect: [
    "WOW! Sei un genio! 🚀",
    "Circuito perfetto al primo tentativo! 🎯",
    "Hai talento naturale! ⭐",
    "Da oggi ti chiameremo 'Il Mago dei Circuiti'! 🧙‍♂️"
  ],
  good: [
    "Ottimo lavoro! Ci sei quasi! 💪",
    "Grande progresso! La prossima volta sarà perfetto! 📈",
    "Stai imparando in fretta! 🎓",
    "Hai fatto un lavoro fantastico! 👏"
  ],
  retry: [
    "Nessun problema! Ogni esperto è stato un principiante! 🌱",
    "Gli errori sono le scale per il successo! 🪜",
    "Thomas Edison ha fallito 1000 volte prima della lampadina! 💡",
    "Prova, riprova, impara, vinci! 🎮"
  ]
};

export function getRandomTheme() {
  const keys = Object.keys(STORY_THEMES);
  return keys[Math.floor(Math.random() * keys.length)];
}

export function getComponentStory(componentType) {
  return COMPONENT_STORIES[componentType] || {
    name: "Componente Misterioso",
    story: "Questo componente ha un potere speciale da scoprire!",
    analogy: "Ogni componente è come un pezzo di un puzzle.",
    funFact: "Ci sono migliaia di tipi diversi di componenti elettronici!",
    emoji: "❓"
  };
}

export function getExercises(count = 3, difficulty = 'mixed') {
  const allExercises = [
    ...EXERCISE_TEMPLATES.quiz.map(e => ({ ...e, type: 'quiz' })),
    ...EXERCISE_TEMPLATES.challenge.map(e => ({ ...e, type: 'challenge' })),
    ...EXERCISE_TEMPLATES.creative.map(e => ({ ...e, type: 'creative' }))
  ];
  
  // Filter by difficulty if specified
  let filtered = allExercises;
  if (difficulty !== 'mixed') {
    filtered = allExercises.filter(e => !e.difficulty || e.difficulty === difficulty);
  }
  
  // Shuffle and take requested count
  const shuffled = filtered.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

export function getAchievements(sessionData) {
  const achievements = [];
  
  if (sessionData.isCircuitComplete) {
    achievements.push(ACHIEVEMENTS.find(a => a.id === "first_circuit"));
  }
  
  if (sessionData.codeContent && sessionData.codeContent.split('\n').length > 20) {
    achievements.push(ACHIEVEMENTS.find(a => a.id === "code_warrior"));
  }
  
  if (sessionData.messageCount >= 5) {
    achievements.push(ACHIEVEMENTS.find(a => a.id === "chat_explorer"));
  }
  
  if (sessionData.duration > 30) {
    achievements.push(ACHIEVEMENTS.find(a => a.id === "time_lord"));
  }
  
  const uniqueComponents = new Set((sessionData.components || []).map(c => c.type)).size;
  if (uniqueComponents >= 5) {
    achievements.push(ACHIEVEMENTS.find(a => a.id === "component_collector"));
  }
  
  if (sessionData.quizResults?.score === sessionData.quizResults?.total && sessionData.quizResults?.total > 0) {
    achievements.push(ACHIEVEMENTS.find(a => a.id === "quiz_champion"));
  }
  
  return achievements.filter(Boolean);
}

export function getEncouragement(score, total) {
  const messages = ENCOURAGEMENT_MESSAGES;
  if (total === 0) return messages.retry[0];
  
  const percentage = score / total;
  if (percentage === 1) return messages.perfect[Math.floor(Math.random() * messages.perfect.length)];
  if (percentage >= 0.6) return messages.good[Math.floor(Math.random() * messages.good.length)];
  return messages.retry[Math.floor(Math.random() * messages.retry.length)];
}
