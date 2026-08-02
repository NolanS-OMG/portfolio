import { useMemo } from 'react';
import { toolTheme } from './theme';
import { skills } from '../../data/skills';

function computeScore(query) {
  const keywords = query.toLowerCase().split(/[\s,;/|&+]+/).filter(Boolean);
  if (keywords.length === 0) return { overall: 0, categories: [] };

  const categories = [];

  for (const [category, categorySkills] of Object.entries(skills)) {
    const skillNames = Object.keys(categorySkills);
    const matches = [];
    const missing = [];

    for (const keyword of keywords) {
      const matched = skillNames.find(
        (s) => s.toLowerCase().includes(keyword) || keyword.includes(s.toLowerCase())
      );
      if (matched && !matches.find((m) => m.name === matched)) {
        matches.push({ name: matched, level: categorySkills[matched] });
      }
    }

    if (matches.length > 0) {
      const relevantKeywords = keywords.filter((kw) =>
        skillNames.some((s) => s.toLowerCase().includes(kw) || kw.includes(s.toLowerCase()))
      );
      for (const kw of relevantKeywords) {
        const found = skillNames.find(
          (s) => s.toLowerCase().includes(kw) || kw.includes(s.toLowerCase())
        );
        if (!found) missing.push(kw);
      }
    }

    if (matches.length > 0) {
      const avgLevel = matches.reduce((sum, m) => sum + m.level, 0) / matches.length;
      categories.push({
        name: category,
        score: Math.round(avgLevel),
        matches: matches.map((m) => m.name),
        missing,
      });
    }
  }

  const overall = categories.length > 0
    ? Math.round(categories.reduce((sum, c) => sum + c.score, 0) / categories.length)
    : 0;

  return { overall, categories };
}

function ScoreBadge({ score }) {
  const color = score >= 8 ? toolTheme.accent : score >= 5 ? toolTheme.warning : toolTheme.danger;
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '56px',
      height: '56px',
      borderRadius: '50%',
      border: `3px solid ${color}`,
      margin: '0 auto 10px',
    }}>
      <span style={{ color, fontSize: '20px', fontWeight: '800' }}>{score}</span>
      <span style={{ color: toolTheme.textMuted, fontSize: '11px', marginTop: '4px' }}>/10</span>
    </div>
  );
}

function CategoryBar({ name, score }) {
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
        <span style={{ color: toolTheme.textMuted }}>{score}/10</span>
      </div>
      <div style={{
        height: '6px',
        backgroundColor: `${toolTheme.border}`,
        borderRadius: '3px',
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${score * 10}%`,
          backgroundColor: color,
          borderRadius: '3px',
          transition: 'width 0.5s ease',
        }} />
      </div>
    </div>
  );
}

export default function CompatibilityDashboard({ query = '' }) {
  const result = useMemo(() => computeScore(query), [query]);

  if (!query.trim()) {
    return (
      <div style={{ padding: '8px 0', color: toolTheme.textMuted, fontSize: '13px' }}>
        No query provided for compatibility scoring.
      </div>
    );
  }

  if (result.categories.length === 0) {
    return (
      <div style={{ padding: '8px 0', color: toolTheme.textMuted, fontSize: '13px' }}>
        No matching skills found for "{query}".
      </div>
    );
  }

  return (
    <div style={{
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
          Compatibility Score
        </div>
        <ScoreBadge score={result.overall} />
        <div style={{ color: toolTheme.text, fontSize: '12px' }}>
          {result.overall >= 8 && 'Highly compatible ✓'}
          {result.overall >= 5 && result.overall < 8 && 'Good match'}
          {result.overall < 5 && 'Partial match'}
        </div>
      </div>

      <div style={{ marginBottom: '10px' }}>
        {result.categories.map((cat) => (
          <CategoryBar key={cat.name} name={cat.name} score={cat.score} />
        ))}
      </div>

      <div>
        <div style={{ fontSize: '11px', color: toolTheme.textMuted, marginBottom: '4px' }}>
          Matching skills:
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
          Contact Nolan →
        </button>
      )}
    </div>
  );
}
