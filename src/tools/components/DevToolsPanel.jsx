import { useState } from 'react';

function fireTool(tool, args = {}) {
  window.dispatchEvent(new CustomEvent('dev-tool-execute', {
    detail: { tool, args },
  }));
}

export default function DevToolsPanel() {
  const [open, setOpen] = useState(false);
  const [section, setSection] = useState('header');
  const [projectIds, setProjectIds] = useState('');
  const [contactType, setContactType] = useState('all');
  const [compatQuery, setCompatQuery] = useState('React Python FastAPI');
  const [prefillEmail, setPrefillEmail] = useState('');
  const [prefillName, setPrefillName] = useState('');

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          zIndex: 9999,
          padding: '8px 12px',
          backgroundColor: '#7c3aed',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          fontSize: '12px',
          fontWeight: '600',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(124, 58, 237, 0.4)',
        }}
      >
        🛠 Dev Tools
      </button>
    );
  }

  const btnStyle = {
    padding: '4px 10px',
    backgroundColor: '#7c3aed',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '600',
    cursor: 'pointer',
  };

  const inputStyle = {
    padding: '4px 8px',
    backgroundColor: '#1f2937',
    border: '1px solid #374151',
    borderRadius: '4px',
    color: '#f9fafb',
    fontSize: '11px',
    width: '100%',
  };

  const sectionStyle = {
    marginBottom: '10px',
    paddingBottom: '10px',
    borderBottom: '1px solid #374151',
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      left: '20px',
      zIndex: 9999,
      width: '280px',
      maxHeight: '80vh',
      overflowY: 'auto',
      backgroundColor: '#111827',
      border: '1px solid #374151',
      borderRadius: '12px',
      padding: '12px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      fontFamily: 'system-ui, sans-serif',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <span style={{ color: '#f9fafb', fontSize: '13px', fontWeight: '700' }}>🛠 Dev Tools</span>
        <button
          onClick={() => setOpen(false)}
          style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '16px' }}
        >
          ✕
        </button>
      </div>

      <div style={sectionStyle}>
        <div style={{ color: '#9ca3af', fontSize: '10px', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Navigate To
        </div>
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          <select
            value={section}
            onChange={(e) => setSection(e.target.value)}
            style={{ ...inputStyle, flex: 1 }}
          >
            <option value="header">Home/Header</option>
            <option value="experience">Experience</option>
            <option value="projects">Projects</option>
          </select>
          <button style={btnStyle} onClick={() => fireTool('navigate_to', { section })}>
            Fire
          </button>
        </div>
      </div>

      <div style={sectionStyle}>
        <div style={{ color: '#9ca3af', fontSize: '10px', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Download CV
        </div>
        <button style={btnStyle} onClick={() => fireTool('download_cv', { lang: 'en' })}>
          Fire
        </button>
      </div>

      <div style={sectionStyle}>
        <div style={{ color: '#9ca3af', fontSize: '10px', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Copy Contact
        </div>
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          <select
            value={contactType}
            onChange={(e) => setContactType(e.target.value)}
            style={{ ...inputStyle, flex: 1 }}
          >
            <option value="all">All</option>
            <option value="email">Email</option>
            <option value="linkedin">LinkedIn</option>
            <option value="github">GitHub</option>
          </select>
          <button style={btnStyle} onClick={() => fireTool('copy_contact', { type: contactType })}>
            Fire
          </button>
        </div>
      </div>

      <div style={sectionStyle}>
        <div style={{ color: '#9ca3af', fontSize: '10px', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Show Projects
        </div>
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          <input
            type="text"
            value={projectIds}
            onChange={(e) => setProjectIds(e.target.value)}
            placeholder="IDs (e.g. snake-rl,schools)"
            style={{ ...inputStyle, flex: 1 }}
          />
          <button style={btnStyle} onClick={() => fireTool('show_projects', { ids: projectIds ? projectIds.split(',').map(s => s.trim()) : [] })}>
            Fire
          </button>
        </div>
      </div>

      <div style={sectionStyle}>
        <div style={{ color: '#9ca3af', fontSize: '10px', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Send Message
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <input
            type="text"
            value={prefillName}
            onChange={(e) => setPrefillName(e.target.value)}
            placeholder="Prefill name (optional)"
            style={inputStyle}
          />
          <input
            type="text"
            value={prefillEmail}
            onChange={(e) => setPrefillEmail(e.target.value)}
            placeholder="Prefill email (optional)"
            style={inputStyle}
          />
          <button style={btnStyle} onClick={() => fireTool('send_message', { name: prefillName, email: prefillEmail })}>
            Fire
          </button>
        </div>
      </div>

      <div>
        <div style={{ color: '#9ca3af', fontSize: '10px', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Compatibility Score
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <input
            type="text"
            value={compatQuery}
            onChange={(e) => setCompatQuery(e.target.value)}
            placeholder="Skills query (e.g. React Python)"
            style={inputStyle}
          />
          <button style={btnStyle} onClick={() => fireTool('compatibility_score', { query: compatQuery })}>
            Fire
          </button>
        </div>
      </div>
    </div>
  );
}
