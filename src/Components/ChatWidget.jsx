import { useEffect, useRef, useCallback, useMemo } from 'react';
import ChatBot, { ChatBotProvider } from 'react-chatbotify';
import ReactMarkdown from 'react-markdown';
import { useTranslation } from 'react-i18next';
import { useHealthCheck } from '../hooks/useHealthCheck';
import { useChatSession } from '../hooks/useChatSession';
import {
  sendMessage as apiSendMessage,
} from '../services/chatApi';

const WELCOME_PHRASES = {
  en: ['Welcome!', 'Hi there!', 'Need help?', 'Ask me anything!', 'Hello!'],
  es: ['¡Bienvenido!', '¡Hola!', '¿Necesitas ayuda?', '¡Pregúntame!', '¡Hey!'],
};

const WELCOME_MESSAGES = {
  en: "Hi! I'm Nolan's AI assistant. How can I help you?",
  es: '¡Hola! Soy el asistente AI de Nolan. ¿En qué puedo ayudarte?',
};

const WELCOME_SUGGESTIONS = {
  en: [
    'Tell me about his AI experience',
    'What projects has he built?',
    'Show me his tech stack',
    'How can I contact him?',
  ],
  es: [
    'Cuéntame sobre su experiencia en IA',
    '¿Qué proyectos ha construido?',
    'Muéstrame su stack tecnológico',
    '¿Cómo puedo contactarlo?',
  ],
};

function BotMarkdown({ content }) {
  return (
    <div className="bot-markdown" style={{ fontSize: '14px' }}>
      <ReactMarkdown
        components={{
          p: ({ children }) => <p style={{ margin: '0 0 6px 0' }}>{children}</p>,
          h1: ({ children }) => <p style={{ margin: '6px 0 4px', color: '#10b981', fontSize: '14px', fontWeight: 'bold' }}>{children}</p>,
          h2: ({ children }) => <p style={{ margin: '6px 0 4px', color: '#10b981', fontSize: '14px', fontWeight: 'bold' }}>{children}</p>,
          h3: ({ children }) => <p style={{ margin: '4px 0 3px', color: '#10b981', fontSize: '13px', fontWeight: 'bold' }}>{children}</p>,
          ul: ({ children }) => <ul style={{ margin: '4px 0', paddingLeft: '16px', listStyleType: 'disc' }}>{children}</ul>,
          ol: ({ children }) => <ol style={{ margin: '4px 0', paddingLeft: '16px', listStyleType: 'decimal' }}>{children}</ol>,
          li: ({ children }) => <li style={{ margin: '2px 0' }}>{children}</li>,
          strong: ({ children }) => <strong style={{ color: '#10b981' }}>{children}</strong>,
          em: ({ children }) => <em style={{ color: '#d1d5db' }}>{children}</em>,
          code: ({ node, children }) => {
            const isBlock = node?.position?.start?.line !== node?.position?.end?.line
              || String(children).includes('\n');
            return isBlock
              ? <pre style={{ background: '#1f2937', padding: '8px', borderRadius: '6px', fontSize: '12px', overflowX: 'auto', margin: '4px 0', whiteSpace: 'pre-wrap' }}><code>{children}</code></pre>
              : <code style={{ background: '#1f2937', padding: '1px 4px', borderRadius: '3px', fontSize: '12px', color: '#10b981' }}>{children}</code>;
          },
          pre: ({ children }) => <>{children}</>,
          a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: '#10b981', textDecoration: 'underline' }}>{children}</a>,
          table: ({ children }) => <div style={{ overflowX: 'auto', margin: '8px 0' }}><table style={{ borderCollapse: 'collapse', width: '100%', fontSize: '12px' }}>{children}</table></div>,
          th: ({ children }) => <th style={{ border: '1px solid #374151', padding: '4px 8px', background: '#1f2937', color: '#10b981', textAlign: 'left' }}>{children}</th>,
          td: ({ children }) => <td style={{ border: '1px solid #374151', padding: '4px 8px' }}>{children}</td>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

function ChatInner() {
  const { i18n } = useTranslation();
  const { isHealthy } = useHealthCheck(30000);
  const { sessionId, saveSession } = useChatSession();
  const sessionRef = useRef(sessionId);
  const processingRef = useRef(false);
  const phraseIndexRef = useRef(Math.floor(Math.random() * WELCOME_PHRASES.en.length));
  const lang = i18n.language.startsWith('es') ? 'es' : 'en';
  const tooltipText = WELCOME_PHRASES[lang][phraseIndexRef.current];

  console.log('[ChatInner] isHealthy:', isHealthy, '| lang:', lang);

  useEffect(() => { sessionRef.current = sessionId; }, [sessionId]);

  const handleUserMessage = useCallback(async (params) => {
    const text = params.userInput;
    if (processingRef.current) {
      await params.injectMessage(
        lang === 'es'
          ? 'Por favor espera, estoy procesando tu mensaje anterior...'
          : 'Please wait, I\'m still processing your previous message...'
      );
      return;
    }
    processingRef.current = true;
    try {
      const language = i18n.language.startsWith('es') ? 'es' : 'en';
      const response = await apiSendMessage(text, sessionRef.current || null, language);
      if (!sessionRef.current && response.session_id) {
        saveSession(response.session_id);
        sessionRef.current = response.session_id;
      }
      await params.injectMessage(<BotMarkdown content={response.response} />);
    } catch (error) {
      const msg = error.code === 'rate_limit_exceeded'
        ? `Too many requests. Please wait ${error.retryAfter || 30} seconds.`
        : (error.message || 'Sorry, something went wrong. Please try again.');
      await params.injectMessage(msg);
    } finally {
      processingRef.current = false;
    }
  }, [i18n.language, saveSession, lang]);

  const flow = useMemo(() => ({
    start: {
      message: WELCOME_MESSAGES[lang],
      options: WELCOME_SUGGESTIONS[lang],
      path: 'loop',
    },
    loop: {
      message: async (params) => {
        await handleUserMessage(params);
      },
      path: 'loop',
    },
  }), [lang, handleUserMessage]);

  const settings = useMemo(() => ({
    general: {
      primaryColor: '#10b981',
      secondaryColor: '#1f2937',
      fontFamily: 'inherit',
      embedded: false,
      showHeader: true,
      showFooter: false,
      showInputRow: true,
    },
    tooltip: {
      mode: 'ALWAYS',
      text: tooltipText,
    },
    header: {
      title: "Nolan's AI Assistant",
      showAvatar: false,
      buttons: ['close-chat-button'],
    },
    notification: {
      disabled: false,
      defaultToggledOn: true,
      showCount: true,
    },
    audio: { disabled: true },
    voice: { disabled: true },
    emoji: { disabled: true },
    fileAttachment: { disabled: true },
    chatHistory: { disabled: true },
    chatButton: { icon: '' },
    chatWindow: {
      showScrollbar: true,
      autoJumpToBottom: true,
      defaultOpen: false,
    },
    botBubble: {
      showAvatar: false,
      simulateStream: false,
    },
    userBubble: { showAvatar: false },
    chatInput: {
      disabled: !isHealthy,
      enabledPlaceholderText: lang === 'es' ? 'Escribe tu mensaje...' : 'Type your message...',
      disabledPlaceholderText: lang === 'es' ? 'Chat no disponible - intenta más tarde' : 'Chat unavailable - try again later',
      blockSpam: true,
      sendOptionOutput: true,
    },
  }), [isHealthy, tooltipText, lang]);

  const styles = useMemo(() => ({
    chatWindowStyle: {
      backgroundColor: '#111827',
      width: '360px',
      height: '480px',
      borderRadius: '16px',
      overflow: 'hidden',
    },
    headerStyle: {
      background: 'linear-gradient(135deg, #111827 0%, #1f2937 100%)',
      color: '#f9fafb',
      padding: '14px 16px',
      borderBottom: '1px solid #374151',
      borderRadius: '16px 16px 0 0',
    },
    bodyStyle: {
      backgroundColor: '#111827',
      padding: '12px',
    },
    botBubbleStyle: {
      backgroundColor: 'transparent',
      color: '#f9fafb',
      borderRadius: '0',
      maxWidth: '85%',
      fontSize: '14px',
      padding: '4px 0',
    },
    userBubbleStyle: {
      backgroundColor: '#10b981',
      color: '#ffffff',
      borderRadius: '12px',
      maxWidth: '85%',
      fontSize: '14px',
    },
    botOptionStyle: {
      backgroundColor: 'transparent',
      color: '#10b981',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: '#10b981',
      borderRadius: '18px',
      fontSize: '13px',
      padding: '8px 14px',
      cursor: 'pointer',
    },
    botOptionHoveredStyle: {
      backgroundColor: '#10b981',
      color: '#ffffff',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: '#10b981',
    },
    chatInputContainerStyle: {
      backgroundColor: '#1f2937',
      borderTop: '1px solid #374151',
      borderRadius: '0 0 16px 16px',
    },
    chatInputAreaStyle: {
      backgroundColor: '#111827',
      color: '#f9fafb',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: '#374151',
      borderRadius: '8px',
      fontSize: '14px',
    },
    chatInputAreaFocusedStyle: {
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: '#10b981',
    },
    sendButtonStyle: {
      backgroundColor: '#10b981',
      borderRadius: '8px',
    },
    sendButtonHoveredStyle: {
      backgroundColor: '#059669',
    },
    chatButtonStyle: {
      width: '60px',
      height: '60px',
      borderRadius: '50%',
      backgroundColor: 'transparent',
      borderWidth: '0',
      borderStyle: 'none',
      boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)',
      backgroundImage: 'url(/logo_chat_ai.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    },
    chatButtonHoveredStyle: {
      transform: 'scale(1.08)',
      boxShadow: '0 6px 20px rgba(16, 185, 129, 0.5)',
    },
    tooltipStyle: {
      backgroundColor: '#1f2937',
      color: '#f9fafb',
      borderRadius: '8px',
      padding: '8px 12px',
      fontSize: '13px',
      border: '1px solid #374151',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
    },
    notificationBadgeStyle: {
      backgroundColor: '#ef4444',
      color: '#ffffff',
      fontSize: '10px',
      fontWeight: 'bold',
      width: '18px',
      height: '18px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      top: '-2px',
      right: '-2px',
    },
    closeChatButtonStyle: {
      backgroundColor: 'transparent',
      borderWidth: '0',
      borderStyle: 'none',
      cursor: 'pointer',
    },
    closeChatIconStyle: {
      fill: '#9ca3af',
    },
  }), []);

  return <ChatBot flow={flow} settings={settings} styles={styles} />;
}

function ChatWidget() {
  return (
    <ChatBotProvider>
      <ChatInner />
    </ChatBotProvider>
  );
}

export default ChatWidget;
