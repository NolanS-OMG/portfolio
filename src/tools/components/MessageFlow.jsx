import { useState } from 'react';
import { toolTheme } from './theme';

const STEPS = ['email', 'name', 'message', 'confirm', 'sending', 'done', 'error'];

function StepInput({ label, placeholder, value, onChange, onContinue, type = 'text' }) {
  return (
    <div>
      <label style={{ display: 'block', color: toolTheme.text, fontSize: '13px', marginBottom: '6px' }}>
        {label}
      </label>
      {type === 'textarea' ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          style={{
            width: '100%',
            padding: '8px 10px',
            backgroundColor: toolTheme.bg,
            border: `1px solid ${toolTheme.border}`,
            borderRadius: '6px',
            color: toolTheme.text,
            fontSize: '12px',
            resize: 'vertical',
            outline: 'none',
            fontFamily: 'inherit',
          }}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            width: '100%',
            padding: '8px 10px',
            backgroundColor: toolTheme.bg,
            border: `1px solid ${toolTheme.border}`,
            borderRadius: '6px',
            color: toolTheme.text,
            fontSize: '12px',
            outline: 'none',
          }}
          onKeyDown={(e) => { if (e.key === 'Enter') onContinue(); }}
        />
      )}
      <button
        onClick={onContinue}
        style={{
          marginTop: '8px',
          padding: '6px 14px',
          backgroundColor: toolTheme.accent,
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          fontSize: '12px',
          fontWeight: '600',
          cursor: 'pointer',
        }}
      >
        Continue →
      </button>
    </div>
  );
}

export default function MessageFlow({ prefillName = '', prefillEmail = '', prefillMessage = '' }) {
  const [email, setEmail] = useState(prefillEmail);
  const [name, setName] = useState(prefillName);
  const [message, setMessage] = useState(prefillMessage);
  const [error, setError] = useState('');

  const getInitialStep = () => {
    if (!prefillEmail) return 'email';
    if (!prefillName) return 'name';
    if (!prefillMessage) return 'message';
    return 'confirm';
  };

  const [step, setStep] = useState(getInitialStep);

  const validateEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const handleSubmit = async () => {
    setStep('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      });
      if (!res.ok) throw new Error('Failed');
      setStep('done');
    } catch {
      setStep('done');
    }
  };

  return (
    <div style={{
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
          Send a message to Nolan
        </span>
      </div>

      {step === 'email' && (
        <StepInput
          label="Your email:"
          placeholder="email@example.com"
          value={email}
          onChange={(v) => { setEmail(v); setError(''); }}
          type="email"
          onContinue={() => {
            if (!validateEmail(email)) { setError('Please enter a valid email'); return; }
            setStep(prefillName ? (prefillMessage ? 'confirm' : 'message') : 'name');
          }}
        />
      )}

      {step === 'name' && (
        <StepInput
          label="Your name:"
          placeholder="John Doe"
          value={name}
          onChange={setName}
          onContinue={() => {
            if (!name.trim()) { setError('Please enter your name'); return; }
            setStep(prefillMessage ? 'confirm' : 'message');
          }}
        />
      )}

      {step === 'message' && (
        <StepInput
          label="Your message:"
          placeholder="Hi Nolan, I'd like to..."
          value={message}
          onChange={setMessage}
          type="textarea"
          onContinue={() => {
            if (!message.trim()) { setError('Please enter a message'); return; }
            setStep('confirm');
          }}
        />
      )}

      {step === 'confirm' && (
        <div>
          <div style={{ fontSize: '12px', color: toolTheme.textMuted, marginBottom: '8px' }}>
            <div><strong style={{ color: toolTheme.text }}>From:</strong> {name} ({email})</div>
            <div style={{ marginTop: '4px' }}><strong style={{ color: toolTheme.text }}>Message:</strong> {message}</div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleSubmit}
              style={{
                padding: '6px 14px',
                backgroundColor: toolTheme.accent,
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Send ✓
            </button>
            <button
              onClick={() => setStep('email')}
              style={{
                padding: '6px 14px',
                backgroundColor: 'transparent',
                color: toolTheme.textMuted,
                border: `1px solid ${toolTheme.border}`,
                borderRadius: '6px',
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              Edit
            </button>
          </div>
        </div>
      )}

      {step === 'sending' && (
        <div style={{ color: toolTheme.textMuted, fontSize: '12px', padding: '8px 0' }}>
          Sending...
        </div>
      )}

      {step === 'done' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 0' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={toolTheme.accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span style={{ color: toolTheme.accent, fontSize: '13px', fontWeight: '600' }}>
            Message sent!
          </span>
        </div>
      )}

      {step === 'error' && (
        <div style={{ color: toolTheme.danger, fontSize: '12px', padding: '8px 0' }}>
          Failed to send. Please try again.
          <button
            onClick={() => setStep('confirm')}
            style={{
              display: 'block',
              marginTop: '6px',
              padding: '4px 10px',
              backgroundColor: toolTheme.danger,
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              fontSize: '11px',
              cursor: 'pointer',
            }}
          >
            Retry
          </button>
        </div>
      )}

      {error && (
        <p style={{ color: toolTheme.danger, fontSize: '11px', margin: '6px 0 0 0' }}>
          {error}
        </p>
      )}
    </div>
  );
}
