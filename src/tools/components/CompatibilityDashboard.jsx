import { useMemo, useState, useEffect } from 'react';
import CountUp from 'react-countup';
import { toolTheme } from './theme';
import { skills } from '../../data/skills';

function computeScore(query) {
  const keywords = query.toLowerCase().split(/[\s,;/|&+]+/).filter(Boolean);
  if (keywords.length === 0) return { overall: 0, categories: [] };

  const categories = [];

  for (const [category, categorySkills] of Object.entries(skills)) {
    const skillNames = Object.keys(categorySkills);
    const matches = [];

    for (const keyword of keywords) {
      const matched = skillNames.find(
        (s) => s.toLowerCase().includes(keyword) || keyword.includes(s.toLowerCase())
      );
      if (matched && !matches.find((m) => m.name === matched)) {
        matches.push({ name: matched, level: categorySkills[matched] });
      }
    }

    if (matches.length > 0) {
      const avgLevel = matches.reduce((sum, m) => sum + m.level, 0) / matches.length;
      categories.push({
        name: category,
        score: Math.round(avgLevel),
        matches: matches.map((m) => m.name),
      });
    }
  }

  const overall = categories.length > 0
    ? Math.round(categories.reduce((sum, c) => sum + c.score, 0) / categories.length)
    : 0;

  return { overall, categories };
}

function ScoreBadge({ score, animated }) {
  const color = score >= 8 ? toolTheme.accent : score >= 5 ? toolTheme.warning : toolTheme.danger;
  const circumference = 2 * Math.PI * 24;
  const offset = circumference - (animated ? score / 10 : 0) * circumference;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '56px',
      height: '56px',
      margin: '0 auto 10px',
      position: 'relative',
    }}>
      <svg width="56" height="56" viewBox="0 0 56 56" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="28" cy="28" r="24" fill="none" stroke={toolTheme.border} strokeWidth="3" />
        <circle
          cx="28" cy="28" r="24" fill="none" stroke={color} strokeWidth="3"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease-out' }}
        />
      </svg>
      <div style={{ position: 'absolute', display: 'flex', alignItems: 'baseline' }}>
        <span style={{ color, fontSize: '20px', fontWeight: '800' }}>
          {animated ? <CountUp end={score} duration={1} /> : 0}
        </span>
        <span style={{ color: toolTheme.textMuted, fontSize: '11px', marginLeft: '1px' }}>/10</span>
      </div>
    </div>
  );
}

function CategoryBar({ name, score, animated }) {
  const color = score >= 8 ? toolTheme.accent : score >= 5 ? toolTheme.warning : toolTheme.danger;
  return (
    <div style={{ marginBottom: '6px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '11px',
        marginBottom: '3px',
      }}>
        <span style={{ color: toolTheme.text }}>{name}</span>
        <span style={{ color: toolTheme.textMuted }}>
          {animated ? <CountUp end={score} duration={0.8} /> : 0}/10
        </span>
      </div>
      <div style={{
        height: '6px',
        backgroundColor: toolTheme.border,
        borderRadius: '3px',
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: animated ? `${score * 10}%` : '0%',
          backgroundColor: color,
          borderRadius: '3px',
          transition: 'width 1s ease-out',
        }} />
      </div>
    </div>
  );
}

export default function CompatibilityDashboard({ query = '', lang = 'en' }) {
  const t = (en, es) => lang === 'es' ? es : en;
  const result = useMemo(() => computeScore(query), [query]);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (!query.trim()) {
    return (
      <div className="tool-appear" style={{ padding: '8px 0', color: toolTheme.textMuted, fontSize: '13px' }}>
        {t('No query provided for compatibility scoring.', 'No se proporcionó consulta para el score.')}
      </div>
    );
  }

  if (result.categories.length === 0) {
    return (
      <div className="tool-appear" style={{ padding: '8px 0', color: toolTheme.textMuted, fontSize: '13px' }}>
        {t(`No matching skills found for "${query}".`, `No se encontraron skills para "${query}".`)}
      </div>
    );
  }

  return (
    <div className="tool-appear" style={{
      padding: '12px',
      backgroundColor: toolTheme.bgCard,
      borderRadius: '10px',
      border: `1px solid ${toolTheme.border}`,
      width: '100%',
    }}>
      <div style={{
        textAlign: 'center',
        marginBottom: '8px',
        paddingBottom: '10px',
        borderBottom: `1px solid ${toolTheme.border}`,
      }}>
        <div style={{ color: toolTheme.textMuted, fontSize: '11px', marginBottom: '6px' }}>
          {t('Compatibility Score', 'Score de Compatibilidad')}
        </div>
        <ScoreBadge score={result.overall} animated={animated} />
        <div style={{ color: toolTheme.text, fontSize: '12px' }}>
          {result.overall >= 8 && t('Highly compatible ✓', 'Altamente compatible ✓')}
          {result.overall >= 5 && result.overall < 8 && t('Good match', 'Buen match')}
          {result.overall < 5 && t('Partial match', 'Match parcial')}
        </div>
      </div>

      <div style={{ marginBottom: '10px' }}>
        {result.categories.map((cat) => (
          <CategoryBar key={cat.name} name={cat.name} score={cat.score} animated={animated} />
        ))}
      </div>

      <div>
        <div style={{ fontSize: '11px', color: toolTheme.textMuted, marginBottom: '4px' }}>
          {t('Matching skills:', 'Skills coincidentes:')}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
          {result.categories.flatMap((cat) =>
            cat.matches.map((skill) => (
              <span
                key={skill}
                style={{
                  padding: '2px 6px',
                  backgroundColor: `${toolTheme.accent}20`,
                  color: toolTheme.accent,
                  borderRadius: '4px',
                  fontSize: '10px',
                  fontWeight: '500',
                }}
              >
                {skill}
              </span>
            ))
          )}
        </div>
      </div>

      {result.overall >= 7 && (
        <button
          onClick={() => {
            window.dispatchEvent(new CustomEvent('dev-tool-execute', {
              detail: { tool: 'send_message', args: {} },
            }));
          }}
          style={{
            marginTop: '10px',
            width: '100%',
            padding: '8px',
            backgroundColor: toolTheme.accent,
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          {t('Contact Nolan →', 'Contactar a Nolan →')}
        </button>
      )}
    </div>
  );
}
