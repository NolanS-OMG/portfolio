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
    execute(args, injectMessage) {
      navigateToSection(args.section);
      if (injectMessage) {
        const labels = {
          header: 'Home',
          experience: 'Experience',
          projects: 'Projects',
        };
        injectMessage(`Navigating to ${labels[args.section] || args.section}...`);
      }
    },
  },

  download_cv: {
    name: 'Download CV',
    type: 'inject',
    execute(args, injectMessage) {
      injectMessage(<DownloadCVButton lang={args.lang || 'en'} />);
    },
  },

  copy_contact: {
    name: 'Copy Contact',
    type: 'inject',
    execute(args, injectMessage) {
      injectMessage(<CopyableContact type={args.type || 'all'} />);
    },
  },

  show_projects: {
    name: 'Show Projects',
    type: 'inject',
    execute(args, injectMessage) {
      injectMessage(<ProjectList filter={args.filter || ''} />);
    },
  },

  send_message: {
    name: 'Send Message',
    type: 'inject',
    execute(args, injectMessage) {
      injectMessage(
        <MessageFlow
          prefillName={args.name || ''}
          prefillEmail={args.email || ''}
          prefillMessage={args.message || ''}
        />
      );
    },
  },

  compatibility_score: {
    name: 'Compatibility Score',
    type: 'inject',
    execute(args, injectMessage) {
      injectMessage(<CompatibilityDashboard query={args.query || ''} />);
    },
  },
};

export function executeTool(toolName, args = {}, injectMessage = null) {
  const tool = toolRegistry[toolName];
  if (!tool) return;

  if (tool.type === 'action') {
    tool.execute(args, injectMessage);
  } else if (tool.type === 'inject' && injectMessage) {
    tool.execute(args, injectMessage);
  }
}
