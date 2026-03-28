// Landing Page PNRR — Per dirigenti scolastici e animatori digitali
// Fondi PNRR Scuola 4.0 + acquisto MePA
// © Andrea Marro — 27/03/2026 — Tutti i diritti riservati
import React from 'react';

const NAVY = '#1E4D8C';
const LIME = '#4A7A25';
const BG_LIGHT = '#F7F7F8';
const TEXT = '#1A1A2E';
const TEXT_SECONDARY = '#6B6B80';
const BORDER = '#E5E5EA';

const sectionStyle = {
  padding: '56px 24px',
  maxWidth: '960px',
  margin: '0 auto',
};

const cardStyle = {
  background: '#fff',
  borderRadius: '12px',
  border: `1px solid ${BORDER}`,
  padding: '24px',
};

const headingStyle = {
  fontFamily: "'Oswald', sans-serif",
  fontSize: 'clamp(24px, 4vw, 32px)',
  color: NAVY,
  marginBottom: '24px',
  lineHeight: 1.2,
};

const btnPrimary = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '16px 32px',
  fontSize: '18px',
  fontWeight: 700,
  background: LIME,
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  minHeight: '52px',
  textDecoration: 'none',
};

const btnOutline = {
  ...btnPrimary,
  background: 'transparent',
  color: '#fff',
  border: '2px solid rgba(255,255,255,0.6)',
};

export default function LandingPNRR({ onNavigate }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#fff',
      color: TEXT,
      fontFamily: "'Open Sans', sans-serif",
      overflow: 'auto',
    }}>
      {/* Hero */}
      <header style={{
        background: `linear-gradient(135deg, ${NAVY} 0%, #2E6DB4 100%)`,
        color: '#fff',
        padding: '60px 24px 48px',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{
            display: 'inline-block',
            background: 'rgba(255,179,0,0.25)',
            borderRadius: '20px',
            padding: '6px 16px',
            fontSize: '14px',
            fontWeight: 600,
            marginBottom: '20px',
            letterSpacing: '0.5px',
            border: '1px solid rgba(255,179,0,0.4)',
          }}>
            PNRR SCUOLA 4.0 — RENDICONTAZIONE ENTRO 30/06/2026
          </div>
          <h1 style={{
            fontFamily: "'Oswald', sans-serif",
            fontSize: 'clamp(32px, 5vw, 52px)',
            fontWeight: 700,
            marginBottom: '16px',
            lineHeight: 1.1,
          }}>
            ELAB Tutor per la tua scuola
          </h1>
          <p style={{
            fontSize: 'clamp(17px, 2.5vw, 22px)',
            opacity: 0.9,
            maxWidth: '640px',
            margin: '0 auto 32px',
            lineHeight: 1.5,
          }}>
            Insegna elettronica e Arduino nella tua scuola media.
            Acquistabile su MePA con fondi PNRR residui o budget scolastico ordinario.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href="mailto:info@elabtutor.school?subject=Richiesta%20info%20ELAB%20Tutor%20PNRR"
              style={btnPrimary}
            >
              Richiedi Preventivo
            </a>
            <button
              onClick={() => onNavigate('showcase')}
              style={btnOutline}
            >
              Prova la Demo
            </button>
          </div>
        </div>
      </header>

      {/* Cos'è il PNRR Scuola 4.0 */}
      <section style={{ ...sectionStyle }}>
        <h2 style={headingStyle}>Il PNRR Scuola 4.0 in breve</h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '20px',
          marginBottom: '24px',
        }}>
          {[
            {
              num: '2,1 mld',
              label: 'Fondi totali',
              desc: 'Il Piano Scuola 4.0 stanzia 2,1 miliardi di euro per trasformare le aule in ambienti innovativi.',
            },
            {
              num: '100.000',
              label: 'Aule da trasformare',
              desc: "L'Azione 1 \"Next Generation Classrooms\" finanzia la trasformazione di 100.000 aule in tutta Italia.",
            },
            {
              num: '750 mln',
              label: 'Per le STEM',
              desc: "L'Investimento 3.1 \"Nuove competenze e nuovi linguaggi\" (D.M. 65/2023) dedica 750 milioni alle competenze STEM e digitali.",
            },
          ].map((item, i) => (
            <div key={i} style={cardStyle}>
              <div style={{
                fontSize: '28px',
                fontWeight: 800,
                color: NAVY,
                fontFamily: "'Oswald', sans-serif",
                marginBottom: '4px',
              }}>
                {item.num}
              </div>
              <div style={{
                fontSize: '14px',
                fontWeight: 700,
                color: LIME,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '8px',
              }}>
                {item.label}
              </div>
              <p style={{ fontSize: '15px', color: TEXT_SECONDARY, lineHeight: 1.6, margin: 0 }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
        <p style={{ fontSize: '15px', color: TEXT_SECONDARY, lineHeight: 1.7 }}>
          Il Piano Scuola 4.0 (D.M. 218 dell&apos;8 agosto 2022) prevede l&apos;acquisto di{' '}
          <strong style={{ color: TEXT }}>software e contenuti disciplinari STEM</strong>,
          dispositivi per la creatività digitale, il pensiero computazionale e la robotica.
          ELAB Tutor rientra pienamente in queste categorie.
        </p>
        <div style={{
          background: '#FFF8E1',
          border: '1px solid #FFE082',
          borderRadius: '8px',
          padding: '16px 20px',
          marginTop: '20px',
          fontSize: '15px',
          lineHeight: 1.6,
          color: TEXT,
        }}>
          <strong>Stato al 2026:</strong> La fase di acquisto del Piano Scuola 4.0 si sta chiudendo.
          La rendicontazione finale delle spese è prorogata al{' '}
          <strong>30 giugno 2026</strong> (Nota MIM 217613 del 15/12/2025).
          Se la tua scuola ha fondi PNRR residui, puoi ancora utilizzarli per ELAB Tutor.
          Per chi non ha fondi PNRR, ELAB è acquistabile con il{' '}
          <strong>budget ordinario scolastico</strong> tramite MePA.
        </div>
      </section>

      {/* Perché ELAB rientra nel PNRR */}
      <section style={{ background: BG_LIGHT }}>
        <div style={sectionStyle}>
          <h2 style={headingStyle}>Perché ELAB Tutor rientra nel PNRR</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px',
          }}>
            {[
              {
                icon: '1',
                title: 'Software didattico STEM',
                desc: 'Simulatore di circuiti e Arduino con 67 esperimenti. Rientra nella voce "software e contenuti disciplinari" del Piano.',
              },
              {
                icon: '2',
                title: 'Tutor AI integrato',
                desc: 'Galileo, il tutor in italiano, guida l\'insegnante passo dopo passo. Corrisponde alla voce "intelligenza artificiale" del Piano.',
              },
              {
                icon: '3',
                title: 'Formazione docenti inclusa',
                desc: 'L\'insegnante impara MENTRE insegna. Zero competenze pregresse richieste. Risponde alla linea "formazione digitale del personale".',
              },
              {
                icon: '4',
                title: 'Curriculum progressivo',
                desc: '3 volumi didattici (dal LED base ai progetti Arduino). Percorso completo allineato alle competenze DigComp 2.2.',
              },
              {
                icon: '5',
                title: 'Privacy e GDPR',
                desc: 'Nessun dato personale degli studenti viene raccolto. L\'insegnante usa la LIM, gli studenti lavorano con i kit fisici.',
              },
              {
                icon: '6',
                title: 'Aula fisica + virtuale',
                desc: 'Il Piano richiede "integrazione tra aula fisica e piattaforma virtuale". ELAB è esattamente questo: kit reale + simulatore digitale.',
              },
            ].map((item, i) => (
              <div key={i} style={{
                ...cardStyle,
                display: 'flex',
                gap: '16px',
                alignItems: 'flex-start',
              }}>
                <div style={{
                  minWidth: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: NAVY,
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '16px',
                  flexShrink: 0,
                }}>
                  {item.icon}
                </div>
                <div>
                  <h3 style={{ fontSize: '17px', fontWeight: 700, color: TEXT, margin: '0 0 6px' }}>
                    {item.title}
                  </h3>
                  <p style={{ fontSize: '15px', color: TEXT_SECONDARY, lineHeight: 1.6, margin: 0 }}>
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Come acquistare su MePA */}
      <section style={sectionStyle}>
        <h2 style={headingStyle}>Come acquistare su MePA</h2>
        <div style={{
          ...cardStyle,
          background: `linear-gradient(135deg, ${NAVY}08, ${NAVY}03)`,
          border: `2px solid ${NAVY}20`,
          marginBottom: '24px',
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '24px',
          }}>
            {[
              {
                step: 'Passo 1',
                title: 'Accedi al MePA',
                desc: 'Vai su acquistinretepa.it e accedi con le credenziali della tua scuola.',
              },
              {
                step: 'Passo 2',
                title: 'Cerca ELAB Tutor',
                desc: 'Usa la ricerca per "Codice Prodotto" o per "Software didattico STEM" nell\'area merceologica.',
              },
              {
                step: 'Passo 3',
                title: 'Ordine diretto o RDO',
                desc: 'Sotto soglia: ordine diretto. Sopra soglia: Richiesta di Offerta (RDO). Noi ti guidiamo.',
              },
            ].map((item, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '14px',
                  fontWeight: 700,
                  color: LIME,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  marginBottom: '8px',
                }}>
                  {item.step}
                </div>
                <h3 style={{ fontSize: '17px', fontWeight: 700, color: NAVY, margin: '0 0 8px' }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: '14px', color: TEXT_SECONDARY, lineHeight: 1.5, margin: 0 }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
        <p style={{ fontSize: '15px', color: TEXT_SECONDARY, lineHeight: 1.7, textAlign: 'center' }}>
          Non sai come procedere? <strong style={{ color: TEXT }}>Ti aiutiamo noi</strong>.
          Scrivici a{' '}
          <a href="mailto:info@elabtutor.school" style={{ color: NAVY, fontWeight: 600 }}>
            info@elabtutor.school
          </a>{' '}
          e ti guidiamo passo dopo passo nell&apos;acquisto.
        </p>
      </section>

      {/* Cosa include */}
      <section style={{ background: BG_LIGHT }}>
        <div style={sectionStyle}>
          <h2 style={headingStyle}>Cosa include ELAB Tutor</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px',
          }}>
            <div style={cardStyle}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: NAVY, margin: '0 0 12px' }}>
                Piattaforma digitale
              </h3>
              <ul style={{ margin: 0, paddingLeft: '20px', color: TEXT_SECONDARY, lineHeight: 2, fontSize: '15px' }}>
                <li>Simulatore di circuiti con 21 componenti</li>
                <li>67 esperimenti guidati passo dopo passo</li>
                <li>Tutor AI Galileo in italiano</li>
                <li>4 giochi educativi integrati</li>
                <li>Editor di codice Arduino</li>
                <li>Licenza scuola annuale</li>
              </ul>
            </div>
            <div style={cardStyle}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: NAVY, margin: '0 0 12px' }}>
                Kit fisico per studenti
              </h3>
              <ul style={{ margin: 0, paddingLeft: '20px', color: TEXT_SECONDARY, lineHeight: 2, fontSize: '15px' }}>
                <li>Scheda Arduino compatibile</li>
                <li>Breadboard e cavetti</li>
                <li>LED, resistenze, pulsanti</li>
                <li>Sensori (luce, temperatura)</li>
                <li>Servo motore e buzzer</li>
                <li>1 kit ogni 2-3 studenti</li>
              </ul>
            </div>
            <div style={cardStyle}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: NAVY, margin: '0 0 12px' }}>
                Volumi didattici
              </h3>
              <ul style={{ margin: 0, paddingLeft: '20px', color: TEXT_SECONDARY, lineHeight: 2, fontSize: '15px' }}>
                <li>Volume 1 — Basi di elettronica (38 esp.)</li>
                <li>Volume 2 — Circuiti avanzati (18 esp.)</li>
                <li>Volume 3 — Progetti Arduino (11 esp.)</li>
                <li>Percorso progressivo su 3 anni</li>
                <li>Allineato alle competenze DigComp 2.2</li>
                <li>Guide per l&apos;insegnante incluse</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ rapide */}
      <section style={sectionStyle}>
        <h2 style={headingStyle}>Domande frequenti</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[
            {
              q: 'Serve un insegnante esperto di elettronica?',
              a: 'No. ELAB Tutor è progettato per insegnanti SENZA competenze pregresse in elettronica. Il tutor AI Galileo guida l\'insegnante passo dopo passo, e l\'insegnante impara mentre insegna.',
            },
            {
              q: 'Posso ancora usare i fondi PNRR per ELAB?',
              a: 'La fase di acquisto del Piano Scuola 4.0 (D.M. 218/2022) si sta chiudendo. Se la tua scuola ha fondi PNRR già impegnati ma non completamente spesi, puoi ancora rendicontare ELAB Tutor entro il 30 giugno 2026. ELAB rientra nella voce "software e contenuti disciplinari STEM". Per chi non ha fondi PNRR disponibili, ELAB è acquistabile con il budget ordinario scolastico su MePA.',
            },
            {
              q: 'Come funziona l\'acquisto su MePA?',
              a: 'Accedi a acquistinretepa.it con le credenziali della scuola, cerca ELAB Tutor per codice prodotto o nella categoria "Software didattico STEM", e procedi con ordine diretto (sotto soglia) o RDO. Ti assistiamo in ogni fase.',
            },
            {
              q: 'I dati degli studenti sono al sicuro?',
              a: 'ELAB Tutor non raccoglie dati personali degli studenti. L\'insegnante usa la piattaforma dalla LIM, gli studenti lavorano con i kit fisici. Piena conformità GDPR.',
            },
            {
              q: 'Quanto costa?',
              a: 'Kit fisico da circa €75 per studente + licenza software annuale per la scuola. Scrivici per un preventivo personalizzato in base al numero di classi.',
            },
          ].map((item, i) => (
            <details
              key={i}
              style={{
                ...cardStyle,
                cursor: 'pointer',
              }}
            >
              <summary style={{
                fontSize: '16px',
                fontWeight: 700,
                color: TEXT,
                listStyle: 'none',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                {item.q}
                <span style={{ color: NAVY, fontSize: '20px', marginLeft: '12px', flexShrink: 0 }}>+</span>
              </summary>
              <p style={{
                fontSize: '15px',
                color: TEXT_SECONDARY,
                lineHeight: 1.7,
                margin: '12px 0 0',
                paddingTop: '12px',
                borderTop: `1px solid ${BORDER}`,
              }}>
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA finale */}
      <section style={{
        background: `linear-gradient(135deg, ${NAVY} 0%, #2E6DB4 100%)`,
        color: '#fff',
        padding: '56px 24px',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{
            fontFamily: "'Oswald', sans-serif",
            fontSize: 'clamp(24px, 4vw, 32px)',
            marginBottom: '16px',
          }}>
            Porta ELAB nella tua scuola
          </h2>
          <p style={{ fontSize: '17px', opacity: 0.9, marginBottom: '28px', lineHeight: 1.6 }}>
            Fondi PNRR residui o budget scolastico ordinario: ti guidiamo
            nella procedura MePA e nella documentazione necessaria.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href="mailto:info@elabtutor.school?subject=Preventivo%20ELAB%20Tutor%20PNRR"
              style={btnPrimary}
            >
              Richiedi Preventivo
            </a>
            <button
              onClick={() => onNavigate('showcase')}
              style={btnOutline}
            >
              Torna alla Home
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '24px',
        textAlign: 'center',
        fontSize: '14px',
        color: TEXT_SECONDARY,
        borderTop: `1px solid ${BORDER}`,
        background: '#fff',
      }}>
        <p style={{ margin: '0 0 8px' }}>
          © 2026 Andrea Marro — ELAB Tutor. Tutti i diritti riservati.
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="/privacy" style={{ color: NAVY, fontSize: '14px' }}>Privacy Policy</a>
          <a href="https://www.elabtutor.school" style={{ color: NAVY, fontSize: '14px' }}>www.elabtutor.school</a>
        </div>
      </footer>
    </div>
  );
}
