import { toolTheme } from './theme';

export default function ProjectCard({ project }) {
  return (
    <div style={{
      backgroundColor: toolTheme.bgCard,
      borderRadius: '10px',
      border: `1px solid ${toolTheme.border}`,
      overflow: 'hidden',
      marginBottom: '8px',
    }}>
      {project.img && (
        <img
          src={project.img}
          alt={project.title}
          style={{
            width: '100%',
            height: '100px',
            objectFit: 'cover',
            borderBottom: `1px solid ${toolTheme.border}`,
          }}
        />
      )}
      <div style={{ padding: '10px 12px' }}>
        <h4 style={{
          color: toolTheme.text,
          fontSize: '13px',
          fontWeight: '700',
          margin: '0 0 4px 0',
        }}>
          {project.title}
        </h4>
        <p style={{
          color: toolTheme.textMuted,
          fontSize: '11px',
          margin: '0 0 8px 0',
          lineHeight: '1.4',
        }}>
          {project.description}
        </p>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '4px',
          marginBottom: '8px',
        }}>
          {project.skills.map((skill) => (
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
          ))}
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          {project.page && (
            <a
              href={project.page}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '4px 10px',
                backgroundColor: toolTheme.accent,
                color: '#ffffff',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: '600',
                textDecoration: 'none',
              }}
            >
              Demo
            </a>
          )}
          {project.github && (
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '4px 10px',
                backgroundColor: 'transparent',
                color: toolTheme.textMuted,
                border: `1px solid ${toolTheme.border}`,
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: '500',
                textDecoration: 'none',
              }}
            >
              GitHub
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
