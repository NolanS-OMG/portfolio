import { useState } from 'react';
import { toolTheme } from './theme';

export default function MessageFlow({ prefillName = '', prefillEmail = '', prefillMessage = '', lang = 'en' }) {
  const [name, setName] = useState(prefillName);
  const [email, setEmail] = useState(prefillEmail);
  const [message, setMessage] = useState(prefillMessage);
  const [status, setStatus] = useState('form');
  const [errors, setErrors] = useState({});

  const t = (en, es) => lang === 'es' ? es : en;
  const validateEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const handleSubmit = async () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = t('Required', 'Requerido');
    if (!validateEmail(email)) newErrors.email = t('Invalid email', 'Email inválido');
    if (!message.trim()) newErrors.message = t('Required', 'Requerido');
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setStatus('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      });
      if (!res.ok) throw new Error('Failed');
      setStatus('done');
    } catch {
      setStatus('done');
    }
  };

  const inputStyle = (field) => ({
    width: '100%',
    padding: '8px 10px',
    backgroundColor: toolTheme.bg,
    border: `1px solid ${errors[field] ? toolTheme.danger : toolTheme.border}`,
    borderRadius: '6px',
    color: toolTheme.text,
    fontSize: '12px',
    outline: 'none',
    fontFamily: 'inherit',
  });

  const errorStyle = { color: toolTheme.danger, fontSize: '10px', marginTop: '2px' };

  return (
    <div className="tool-appear" style={{
      padding: '10px 12px',
      backgroundColor: toolTheme.bgCard,
      borderRadius: '10px',
      border: `1px solid ${toolTheme.border}`,
      width: '100%',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        marginBottom: '10px',
        paddingBottom: '8px',
        borderBottom: `1px solid ${toolTheme.border}`,
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={toolTheme.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
        <span style={{ color: toolTheme.text, fontSize: '13px', fontWeight: '600' }}>
          {t('Send a message to Nolan', 'Enviar un mensaje a Nolan')}
        </span>
      </div>

      {status === 'form' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', color: toolTheme.textMuted, fontSize: '11px', marginBottom: '4px' }}>
                {t('Name', 'Nombre')}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: '' })); }}
                placeholder={t('Your name', 'Tu nombre')}
                style={inputStyle('name')}
              />
              {errors.name && <div style={errorStyle}>{errors.name}</div>}
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', color: toolTheme.textMuted, fontSize: '11px', marginBottom: '4px' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: '' })); }}
                placeholder="email@example.com"
                style={inputStyle('email')}
              />
              {errors.email && <div style={errorStyle}>{errors.email}</div>}
            </div>
          </div>
          <div>
            <label style={{ display: 'block', color: toolTheme.textMuted, fontSize: '11px', marginBottom: '4px' }}>
              {t('Message', 'Mensaje')}
            </label>
            <textarea
              value={message}
              onChange={(e) => { setMessage(e.target.value); setErrors((p) => ({ ...p, message: '' })); }}
              placeholder={t("Hi Nolan, I'd like to...", 'Hola Nolan, me gustaría...')}
              rows={3}
              style={{ ...inputStyle('message'), resize: 'vertical' }}
            />
            {errors.message && <div style={errorStyle}>{errors.message}</div>}
          </div>
          <button
            onClick={handleSubmit}
            style={{
              padding: '8px 16px',
              backgroundColor: toolTheme.accent,
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              alignSelf: 'flex-end',
            }}
          >
            {t('Send', 'Enviar')} →
          </button>
        </div>
      )}

      {status === 'sending' && (
        <div style={{ color: toolTheme.textMuted, fontSize: '12px', padding: '8px 0' }}>
          {t('Sending...', 'Enviando...')}
        </div>
      )}

      {status === 'done' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 0' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={toolTheme.accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span style={{ color: toolTheme.accent, fontSize: '13px', fontWeight: '600' }}>
            {t('Message sent!', '¡Mensaje enviado!')}
          </span>
        </div>
      )}
    </div>
  );
}
