import { projects } from '../../data/projects';
import ProjectCard from './ProjectCard';
import { toolTheme } from './theme';

export default function ProjectList({ filter = '' }) {
  const filtered = filter
    ? projects.filter((p) => {
        const q = filter.toLowerCase();
        return (
          p.title.toLowerCase().includes(q) ||
          p.skills.some((s) => s.toLowerCase().includes(q)) ||
          p.description.toLowerCase().includes(q)
        );
      })
    : projects;

  if (filtered.length === 0) {
    return (
      <div style={{ padding: '8px 0', color: toolTheme.textMuted, fontSize: '13px' }}>
        No projects found matching "{filter}".
      </div>
    );
  }

  return (
    <div style={{ padding: '4px 0', width: '100%' }}>
      {filter && (
        <p style={{ color: toolTheme.textMuted, fontSize: '11px', margin: '0 0 8px 0' }}>
          Showing projects with "{filter}":
        </p>
      )}
      {filtered.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
