import { useState } from 'react';
import { toolTheme } from './theme';
import { contact } from '../../data/contact';

export default function DownloadCVButton({ lang = 'en' }) {
  const [downloaded, setDownloaded] = useState(false);

  const handleClick = () => {
    const link = document.createElement('a');
    link.href = contact.cvPath;
    link.download = 'CV_Nolan_Ashcraft.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2500);
  };

  return (
    <div style={{ padding: '8px 0' }}>
      <p style={{ color: toolTheme.text, fontSize: '14px', margin: '0 0 8px 0' }}>
        {lang === 'es' ? 'Aquí tienes el CV de Nolan:' : "Here's Nolan's CV:"}
      </p>
      <button
        onClick={handleClick}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 16px',
          backgroundColor: downloaded ? toolTheme.accentHover : toolTheme.accent,
          color: '#ffffff',
          border: 'none',
          borderRadius: '8px',
          fontSize: '13px',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'background-color 0.2s',
        }}
      >
        {downloaded ? (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            {lang === 'es' ? '¡Descargado!' : 'Downloaded!'}
          </>
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            {lang === 'es' ? 'Descargar CV (PDF)' : 'Download CV (PDF)'}
          </>
        )}
      </button>
    </div>
  );
}
