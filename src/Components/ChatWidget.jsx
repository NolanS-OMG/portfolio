import { useEffect, useRef, useCallback, useMemo, useState } from 'react';
import ChatBot, { ChatBotProvider } from 'react-chatbotify';
import ReactMarkdown from 'react-markdown';
import { useTranslation } from 'react-i18next';
import { useChatWebSocket } from '../hooks/useChatWebSocket';
import { executeTool } from '../tools/index';

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
  const processed = content.replace(/\n/g, '  \n');
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
        {processed}
      </ReactMarkdown>
    </div>
  );
}

function StreamingBubble({ streamRef }) {
  const [content, setContent] = useState('');

  useEffect(() => {
    const handler = (text) => setContent(text);
    if (streamRef.current) {
      streamRef.current.subscribe(handler);
    }
    return () => {
      if (streamRef.current) {
        streamRef.current.unsubscribe(handler);
      }
    };
  }, [streamRef]);

  if (!content) return null;
  return <BotMarkdown content={content} />;
}

function createStreamEmitter() {
  let listener = null;
  return {
    subscribe(fn) { listener = fn; },
    unsubscribe() { listener = null; },
    emit(content) { listener?.(content); },
  };
}

function ChatInner() {
  const { i18n } = useTranslation();
  const { status, sendMessage } = useChatWebSocket();
  const processingRef = useRef(false);
  const phraseIndexRef = useRef(Math.floor(Math.random() * WELCOME_PHRASES.en.length));
  const lang = i18n.language.startsWith('es') ? 'es' : 'en';
  const tooltipText = WELCOME_PHRASES[lang][phraseIndexRef.current];
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = useCallback(() => {
    setExpanded((prev) => {
      const next = !prev;
      requestAnimationFrame(() => {
        const win = document.querySelector('.rcb-chat-window');
        if (win) {
          win.style.width = next ? '480px' : '360px';
          win.style.height = next ? '620px' : '480px';
          win.style.transition = 'width 0.3s ease, height 0.3s ease';
        }
      });
      return next;
    });
  }, []);

  const statusRef = useRef(status);
  statusRef.current = status;
  const sendMessageRef = useRef(sendMessage);
  sendMessageRef.current = sendMessage;
  const langRef = useRef(lang);
  langRef.current = lang;

  const streamEmitterRef = useRef(createStreamEmitter());
  const injectMessageRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      const { tool, args } = e.detail;
      executeTool(tool, args, injectMessageRef.current, langRef.current);
    };
    window.addEventListener('dev-tool-execute', handler);
    return () => window.removeEventListener('dev-tool-execute', handler);
  }, []);

  const handleUserMessage = useCallback(async (params) => {
    injectMessageRef.current = params.injectMessage;
    const text = params.userInput;

    if (processingRef.current) {
      await params.injectMessage(
        langRef.current === 'es'
          ? 'Por favor espera, estoy procesando tu mensaje anterior...'
          : 'Please wait, I\'m still processing your previous message...'
      );
      return;
    }

    if (statusRef.current !== 'connected') {
      await params.injectMessage(
        langRef.current === 'es'
          ? 'Conectando al servidor... intenta de nuevo en un momento.'
          : 'Connecting to server... try again in a moment.'
      );
      return;
    }

    processingRef.current = true;
    const language = langRef.current;

    const emitter = createStreamEmitter();
    streamEmitterRef.current = emitter;
    await params.injectMessage(<StreamingBubble streamRef={{ current: emitter }} />);

    await new Promise((resolve) => {
      sendMessageRef.current(text, language, {
        onChunk: (fullContent) => {
          emitter.emit(fullContent);
        },
        onDone: (fullContent) => {
          emitter.emit(fullContent);
          processingRef.current = false;
          resolve();
        },
        onError: (message, retryAfter) => {
          const msg = retryAfter
            ? (langRef.current === 'es'
              ? `Demasiadas solicitudes. Espera ${retryAfter} segundos.`
              : `Too many requests. Please wait ${retryAfter} seconds.`)
            : message;
          emitter.emit(msg);
          processingRef.current = false;
          resolve();
        },
      });
    });
  }, []);

  const handleUserMessageRef = useRef(handleUserMessage);
  handleUserMessageRef.current = handleUserMessage;

  const flow = useMemo(() => ({
    start: {
      message: async (params) => {
        injectMessageRef.current = params.injectMessage;
        return WELCOME_MESSAGES[langRef.current];
      },
      options: () => WELCOME_SUGGESTIONS[langRef.current],
      path: 'loop',
    },
    loop: {
      message: async (params) => {
        await handleUserMessageRef.current(params);
      },
      path: 'loop',
    },
  }), []);

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
      buttons: [
        <button
          key="expand-btn"
          onClick={toggleExpand}
          aria-label={expanded ? 'Shrink chat' : 'Expand chat'}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '24px',
            height: '24px',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            borderRadius: '4px',
            padding: 0,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {expanded ? (
              <>
                <polyline points="4 14 10 14 10 20" />
                <polyline points="20 10 14 10 14 4" />
                <line x1="14" y1="10" x2="21" y2="3" />
                <line x1="3" y1="21" x2="10" y2="14" />
              </>
            ) : (
              <>
                <polyline points="15 3 21 3 21 9" />
                <polyline points="9 21 3 21 3 15" />
                <line x1="21" y1="3" x2="14" y2="10" />
                <line x1="3" y1="21" x2="10" y2="14" />
              </>
            )}
          </svg>
        </button>,
        'close-chat-button',
      ],
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
      disabled: false,
      enabledPlaceholderText: lang === 'es' ? 'Escribe tu mensaje...' : 'Type your message...',
      disabledPlaceholderText: lang === 'es' ? 'Conectando...' : 'Connecting...',
      blockSpam: true,
      sendOptionOutput: true,
    },
  }), [tooltipText, lang, expanded, toggleExpand]);

  const styles = useMemo(() => ({
    chatWindowStyle: {
      backgroundColor: '#111827',
      width: '360px',
      height: '480px',
      borderRadius: '16px',
      overflow: 'hidden',
      transition: 'width 0.3s ease, height 0.3s ease',
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
