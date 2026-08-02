import { projects } from '../../data/projects';
import ProjectCard from './ProjectCard';

export default function ProjectList({ ids = [], lang = 'en' }) {
  const shown = ids.length > 0
    ? projects.filter((p) => ids.includes(p.id))
    : projects;

  return (
    <div className="tool-appear" style={{ padding: '4px 0', width: '100%' }}>
      {shown.map((project) => (
        <ProjectCard key={project.id} project={project} lang={lang} />
      ))}
    </div>
  );
}
