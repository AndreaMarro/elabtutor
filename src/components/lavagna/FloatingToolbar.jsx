import React from 'react';
import css from './FloatingToolbar.module.css';

const tools = [
  {
    id: 'select',
    label: 'Seleziona',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M4 2l12 7-5 2-3 5L4 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'wire',
    label: 'Filo',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M3 17C3 12 7 8 12 8h5M14 5l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  { id: 'divider1', divider: true },
  {
    id: 'delete',
    label: 'Elimina',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M3 5h14M7 5V3h6v2M8 8v7M12 8v7M5 5l1 12h8l1-12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'undo',
    label: 'Annulla',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M4 8h9a4 4 0 010 8H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M7 5L4 8l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'redo',
    label: 'Ripeti',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M16 8H7a4 4 0 000 8h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M13 5l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  { id: 'divider2', divider: true },
  {
    id: 'pen',
    label: 'Penna',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M12 3l5 5-10 10H2v-5L12 3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M10 5l5 5" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
];

export default function FloatingToolbar({
  activeTool = 'select',
  onToolChange,
  abovePanel = false,
}) {
  return (
    <div
      className={`${css.toolbar} ${abovePanel ? css.abovePanel : ''}`}
      role="toolbar"
      aria-label="Strumenti lavagna"
    >
      {tools.map((tool) => {
        if (tool.divider) {
          return <div key={tool.id} className={css.divider} aria-hidden="true" />;
        }
        return (
          <button
            key={tool.id}
            className={`${css.btn} ${activeTool === tool.id ? css.btnActive : ''}`}
            onClick={() => onToolChange?.(tool.id)}
            aria-label={tool.label}
            aria-pressed={activeTool === tool.id}
          >
            {tool.icon}
          </button>
        );
      })}
    </div>
  );
}
