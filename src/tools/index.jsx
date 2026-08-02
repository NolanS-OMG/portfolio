import { navigateToSection } from './navigateTo';
import DownloadCVButton from './components/DownloadCVButton';
import CopyableContact from './components/CopyableContact';
import ProjectList from './components/ProjectList';
import MessageFlow from './components/MessageFlow';
import CompatibilityDashboard from './components/CompatibilityDashboard';

export const toolRegistry = {
  navigate_to: {
    name: 'Navigate To',
    type: 'action',
    execute(args, injectMessage, lang) {
      navigateToSection(args.section);
      if (injectMessage) {
        const labels = lang === 'es'
          ? { header: 'Inicio', experience: 'Experiencia', projects: 'Proyectos' }
          : { header: 'Home', experience: 'Experience', projects: 'Projects' };
        const prefix = lang === 'es' ? 'Navegando a' : 'Navigating to';
        injectMessage(`${prefix} ${labels[args.section] || args.section}...`);
      }
    },
  },

  download_cv: {
    name: 'Download CV',
    type: 'inject',
    execute(args, injectMessage, lang) {
      injectMessage(<DownloadCVButton lang={lang} />);
    },
  },

  copy_contact: {
    name: 'Copy Contact',
    type: 'inject',
    execute(args, injectMessage, lang) {
      injectMessage(<CopyableContact type={args.type || 'all'} lang={lang} />);
    },
  },

  show_projects: {
    name: 'Show Projects',
    type: 'inject',
    execute(args, injectMessage, lang) {
      injectMessage(<ProjectList ids={args.ids || []} lang={lang} />);
    },
  },

  send_message: {
    name: 'Send Message',
    type: 'inject',
    execute(args, injectMessage, lang) {
      injectMessage(
        <MessageFlow
          prefillName={args.name || ''}
          prefillEmail={args.email || ''}
          prefillMessage={args.message || ''}
          lang={lang}
        />
      );
    },
  },

  compatibility_score: {
    name: 'Compatibility Score',
    type: 'inject',
    execute(args, injectMessage, lang) {
      injectMessage(<CompatibilityDashboard query={args.query || ''} lang={lang} />);
    },
  },
};

export function executeTool(toolName, args = {}, injectMessage = null, lang = 'en') {
  const tool = toolRegistry[toolName];
  if (!tool) return;

  if (tool.type === 'action') {
    tool.execute(args, injectMessage, lang);
  } else if (tool.type === 'inject' && injectMessage) {
    tool.execute(args, injectMessage, lang);
  }
}
