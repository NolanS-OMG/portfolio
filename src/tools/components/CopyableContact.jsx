import { useState } from 'react';
import { toolTheme } from './theme';
import { contact } from '../../data/contact';

function CopyItem({ label, value, isLink, copyLabel, copiedLabel }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '8px 12px',
      backgroundColor: toolTheme.bgCard,
      borderRadius: '6px',
      marginBottom: '6px',
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '11px', color: toolTheme.textMuted, marginBottom: '2px' }}>
          {label}
        </div>
        {isLink ? (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: toolTheme.accent,
              fontSize: '12px',
              textDecoration: 'none',
              wordBreak: 'break-all',
            }}
          >
            {value}
          </a>
        ) : (
          <span style={{ color: toolTheme.text, fontSize: '12px', wordBreak: 'break-all' }}>
            {value}
          </span>
        )}
      </div>
      <button
        onClick={handleCopy}
        style={{
          marginLeft: '8px',
          padding: '4px 8px',
          backgroundColor: copied ? toolTheme.accent : 'transparent',
          border: `1px solid ${copied ? toolTheme.accent : toolTheme.border}`,
          borderRadius: '4px',
          color: copied ? '#fff' : toolTheme.textMuted,
          fontSize: '11px',
          cursor: 'pointer',
          transition: 'all 0.2s',
          whiteSpace: 'nowrap',
        }}
      >
        {copied ? '✓' : copyLabel}
      </button>
    </div>
  );
}

export default function CopyableContact({ type = 'all', lang = 'en' }) {
  const t = (en, es) => lang === 'es' ? es : en;
  const copyLabel = t('Copy', 'Copiar');
  const copiedLabel = '✓';
  const items = [];

  if (type === 'all' || type === 'email') {
    items.push({ label: 'Email', value: contact.email, isLink: false });
  }
  if (type === 'all' || type === 'linkedin') {
    items.push({ label: 'LinkedIn', value: contact.linkedin, isLink: true });
  }
  if (type === 'all' || type === 'github') {
    items.push({ label: 'GitHub', value: contact.github, isLink: true });
  }

  return (
    <div className="tool-appear" style={{ padding: '4px 0', width: '100%' }}>
      {items.map((item) => (
        <CopyItem key={item.label} {...item} copyLabel={copyLabel} copiedLabel={copiedLabel} />
      ))}
    </div>
  );
}
