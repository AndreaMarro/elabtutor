// Landing Page Scuole — Per dirigenti scolastici e animatori digitali
// © Andrea Marro — 25/03/2026 — Tutti i diritti riservati
import React from 'react';

export default function LandingScuole({ onNavigate }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1E4D8C 0%, #2E6DB4 100%)',
      color: '#fff',
      fontFamily: "'Open Sans', sans-serif",
      overflow: 'auto',
    }}>
      {/* Hero */}
      <header style={{
        padding: '60px 24px 40px',
        maxWidth: '960px',
        margin: '0 auto',
        textAlign: 'center',
      }}>
        <h1 style={{
          fontFamily: "'Oswald', sans-serif",
          fontSize: 'clamp(32px, 5vw, 56px)',
          fontWeight: 700,
          marginBottom: '16px',
          lineHeight: 1.1,
        }}>
          ELAB Tutor per la Tua Scuola
        </h1>
        <p style={{
          fontSize: 'clamp(18px, 2.5vw, 24px)',
          opacity: 0.9,
          maxWidth: '640px',
          margin: '0 auto 32px',
          lineHeight: 1.5,
        }}>
          Il simulatore di circuiti con tutor AI che permette a qualsiasi insegnante
          di insegnare elettronica — senza conoscenze pregresse.
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => onNavigate('showcase')}
            style={{
              padding: '16px 32px',
              fontSize: '18px',
              fontWeight: 700,
              background: '#7CB342',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              minHeight: '52px',
            }}
          >
            Prova la Demo Gratuita
          </button>
          <a
            href="mailto:info@elabtutor.school?subject=Richiesta%20informazioni%20ELAB%20Tutor"
            style={{
              padding: '16px 32px',
              fontSize: '18px',
              fontWeight: 700,
              background: 'transparent',
              color: '#fff',
              border: '2px solid rgba(255,255,255,0.6)',
              borderRadius: '8px',
              cursor: 'pointer',
              textDecoration: 'none',
              minHeight: '52px',
              display: 'inline-flex',
              alignItems: 'center',
            }}
          >
            Contattaci
          </a>
        </div>
      </header>

      {/* Value Props */}
      <section style={{
        background: '#fff',
        color: '#1A1A2E',
        padding: '60px 24px',
      }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <h2 style={{
            fontFamily: "'Oswald', sans-serif",
            fontSize: '32px',
            textAlign: 'center',
            marginBottom: '40px',
            color: '#1E4D8C',
          }}>
            Perché le scuole scelgono ELAB
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '32px',
          }}>
            {[
              {
                emoji: '🎓',
                title: 'Zero competenze richieste',
                desc: 'L\'insegnante arriva alla LIM e inizia subito. Galileo, il tutor AI, guida passo dopo passo.',
              },
              {
                emoji: '📦',
                title: 'Kit + Software + Volumi',
                desc: 'Un unico ecosistema: 3 volumi didattici, kit Arduino completo, e la piattaforma digitale.',
              },
              {
                emoji: '🔒',
                title: 'GDPR e privacy garantiti',
                desc: 'Nessun dato personale degli studenti. L\'insegnante usa la LIM, gli studenti lavorano con i kit fisici.',
              },
              {
                emoji: '🏫',
                title: 'Acquistabile via MePa',
                desc: 'Compatibile con i fondi PNRR Scuola 4.0. Kit da €75/studente, licenza software annuale.',
              },
              {
                emoji: '🧪',
                title: '67 esperimenti pronti',
                desc: 'Dal LED base ai circuiti avanzati con Arduino. Curriculum progressivo su 3 volumi.',
              },
              {
                emoji: '🤖',
                title: 'Tutor AI in italiano',
                desc: 'Galileo parla italiano, usa esempi quotidiani, e si adatta all\'età (10-14 anni). Non è ChatGPT.',
              },
            ].map((item, i) => (
              <div key={i} style={{
                padding: '24px',
                background: '#F7F7F8',
                borderRadius: '12px',
                border: '1px solid #E5E5EA',
              }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>{item.emoji}</div>
                <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px', color: '#1E4D8C' }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: '16px', color: '#6B6B80', lineHeight: 1.6, margin: 0 }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Numbers */}
      <section style={{
        background: '#F0F4F8',
        color: '#1A1A2E',
        padding: '48px 24px',
        textAlign: 'center',
      }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-around',
          flexWrap: 'wrap',
          gap: '24px',
        }}>
          {[
            { num: '67', label: 'Esperimenti' },
            { num: '21', label: 'Componenti SVG' },
            { num: '3', label: 'Volumi didattici' },
            { num: '4', label: 'Giochi educativi' },
          ].map((s, i) => (
            <div key={i}>
              <div style={{ fontSize: '40px', fontWeight: 800, color: '#1E4D8C', fontFamily: "'Oswald', sans-serif" }}>
                {s.num}
              </div>
              <div style={{ fontSize: '16px', color: '#6B6B80' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{
        padding: '60px 24px',
        textAlign: 'center',
      }}>
        <h2 style={{
          fontFamily: "'Oswald', sans-serif",
          fontSize: '28px',
          marginBottom: '16px',
        }}>
          Porta ELAB nella tua scuola
        </h2>
        <p style={{ fontSize: '18px', opacity: 0.85, marginBottom: '24px', maxWidth: '500px', margin: '0 auto 24px' }}>
          Scrivi a info@elabtutor.school o prova la demo gratuita.
          <br />Disponibile su MePa con fondi PNRR Scuola 4.0.
        </p>
        <button
          onClick={() => onNavigate('showcase')}
          style={{
            padding: '16px 40px',
            fontSize: '20px',
            fontWeight: 700,
            background: '#7CB342',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            minHeight: '52px',
          }}
        >
          Prova la Demo
        </button>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '24px',
        textAlign: 'center',
        opacity: 0.6,
        fontSize: '14px',
        borderTop: '1px solid rgba(255,255,255,0.1)',
      }}>
        © 2026 Andrea Marro — ELAB Tutor. Tutti i diritti riservati.
        <br />
        <a href="https://www.elabtutor.school" style={{ color: '#fff' }}>www.elabtutor.school</a>
      </footer>
    </div>
  );
}
