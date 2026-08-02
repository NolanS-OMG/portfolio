import { useEffect, useState, useRef } from 'react';
import ChatBot from 'react-chatbotify';
import { useTranslation } from 'react-i18next';
import { useHealthCheck } from '../hooks/useHealthCheck';
import { useChatSession } from '../hooks/useChatSession';
import {
  sendMessage as apiSendMessage,
  getWelcome,
  deleteSession
} from '../services/chatApi';

function ChatWidget() {
  const { i18n } = useTranslation();
  const { status, isHealthy } = useHealthCheck(30000);
  const { sessionId, saveSession, clearSession } = useChatSession();
  const [hasInteracted, setHasInteracted] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [welcomeMsg, setWelcomeMsg] = useState('');
  const isInitialized = useRef(false);

  // Load welcome message on mount
  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    console.log('[ChatWidget] Loading welcome message...');
    getWelcome()
      .then(data => {
        console.log('[ChatWidget] Welcome data:', data);
        setWelcomeMsg(data.message);
        setSuggestions(data.suggestions);
      })
      .catch(err => {
        console.error('[ChatWidget] Failed to load welcome:', err);
        setWelcomeMsg("Hi! I'm Nolan's AI assistant. How can I help you?");
      });
  }, []);

  // Flow configuration
  const flow = {
    start: {
      message: welcomeMsg || "Hi! I'm Nolan's AI assistant. How can I help you?",
      path: "loop"
    },
    loop: {
      message: async (params) => {
        console.log('[Flow] Processing user input:', params.userInput);

        // Mark as interacted
        if (!hasInteracted) {
          setHasInteracted(true);
        }

        try {
          // Determine language
          const language = i18n.language.startsWith('es') ? 'es' : 'en';

          console.log('[Flow] Calling API...', { sessionId, language });

          // Call API
          const response = await apiSendMessage(
            params.userInput,
            sessionId || undefined,
            language
          );

          console.log('[Flow] API response:', response);

          // Save session ID if new
          if (!sessionId && response.session_id) {
            console.log('[Flow] Saving new session:', response.session_id);
            saveSession(response.session_id);
          }

          // Return bot response
          return response.response;

        } catch (error) {
          console.error('[Flow] API error:', error);

          if (error.code === 'rate_limit_exceeded') {
            const retryAfter = error.retryAfter || 30;
            return `Too many requests. Please wait ${retryAfter} seconds.`;
          } else if (error.statusCode === 503) {
            return 'Chat service is temporarily unavailable. Please try again later.';
          } else {
            return error.message || 'Sorry, something went wrong. Please try again.';
          }
        }
      },
      path: "loop"
    }
  };

  const settings = {
    general: {
      primaryColor: '#10b981',
      secondaryColor: '#1f2937',
      fontFamily: 'inherit',
      embedded: false,
      showHeader: true,
      showFooter: true,
    },
    header: {
      title: (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>💬</span>
          <span>Nolan's AI Assistant</span>
        </div>
      ),
      showAvatar: true,
      avatar: '/profile.jpeg',
    },
    chatHistory: {
      storageKey: 'portfolio_chat_history',
      disabled: true,
    },
    chatButton: {
      icon: '💬',
    },
    chatWindow: {
      showScrollbar: true,
      autoJumpToBottom: true,
    },
    botBubble: {
      showAvatar: true,
      avatar: '/profile.jpeg',
      simStream: true, // Simulate typing
    },
    userBubble: {
      showAvatar: false,
    },
    chatInput: {
      disabled: !isHealthy,
      enabledPlaceholderText: 'Type your message...',
      disabledPlaceholderText: 'Chat unavailable',
    },
    footer: {
      text: (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          width: '100%',
          alignItems: 'center'
        }}>
          <span style={{ fontSize: '11px', opacity: 0.7 }}>
            {!isHealthy && (
              <span style={{ color: '#ef4444', marginRight: '8px' }}>
                ⚠️ {status}
              </span>
            )}
            Powered by AI
          </span>
          <button
            onClick={async (e) => {
              e.preventDefault();
              console.log('[Footer] Clearing chat...');

              if (sessionId) {
                try {
                  await deleteSession(sessionId);
                } catch (err) {
                  console.error('[Footer] Error deleting session:', err);
                }
              }

              clearSession();
              setHasInteracted(false);

              // Reload page to reset chat
              window.location.reload();
            }}
            style={{
              fontSize: '11px',
              opacity: 0.7,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'inherit',
              padding: '4px 8px'
            }}
          >
            Clear Chat
          </button>
        </div>
      ),
    },
  };

  // Handle suggestion click (inject into chat)
  const handleSuggestionClick = async (suggestion) => {
    console.log('[Suggestion] Clicked:', suggestion);
    setHasInteracted(true);

    // Simulate user clicking suggestion by triggering input
    // This is a workaround - we'll manually trigger the chatbot
    const inputElement = document.querySelector('.rcb-chat-input');
    if (inputElement) {
      // Set the value
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype,
        'value'
      ).set;
      nativeInputValueSetter.call(inputElement, suggestion);

      // Trigger input event
      inputElement.dispatchEvent(new Event('input', { bubbles: true }));

      // Trigger submit
      const form = inputElement.closest('form');
      if (form) {
        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      }
    }
  };

  // Render welcome bubble
  const renderWelcomeBubble = () => {
    if (hasInteracted || !welcomeMsg) return null;

    return (
      <div style={{
        position: 'fixed',
        bottom: '80px',
        right: '20px',
        background: '#1f2937',
        border: '1px solid #374151',
        borderRadius: '12px',
        padding: '16px',
        maxWidth: '320px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
        zIndex: 9998,
        color: 'white',
        animation: 'slideUp 0.3s ease-out'
      }}>
        <button
          onClick={() => {
            console.log('[Welcome] Dismissed');
            setHasInteracted(true);
          }}
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            background: 'none',
            border: 'none',
            color: '#9ca3af',
            cursor: 'pointer',
            fontSize: '18px',
            padding: '4px',
            lineHeight: 1
          }}
        >
          ×
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <img
            src="/profile.jpeg"
            alt="Nolan"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: '2px solid #10b981'
            }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
              Nolan's AI Assistant
            </div>
            <div style={{ fontSize: '11px', opacity: 0.7 }}>
              Just now
            </div>
          </div>
          <div style={{
            background: '#ef4444',
            color: 'white',
            fontSize: '10px',
            fontWeight: 'bold',
            borderRadius: '10px',
            padding: '2px 6px'
          }}>
            1
          </div>
        </div>

        <div style={{
          fontSize: '13px',
          marginBottom: suggestions.length > 0 ? '12px' : '0',
          lineHeight: '1.5'
        }}>
          {welcomeMsg}
        </div>

        {suggestions.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                style={{
                  background: '#111827',
                  color: 'white',
                  border: '1px solid #10b981',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#10b981'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#111827'}
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <ChatBot flow={flow} settings={settings} />
      {renderWelcomeBubble()}

      {/* Service unavailable */}
      {!isHealthy && (
        <div style={{
          position: 'fixed',
          bottom: hasInteracted ? '80px' : '420px',
          right: '20px',
          background: '#111827',
          color: 'white',
          padding: '12px 16px',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
          zIndex: 9997,
          maxWidth: '300px',
          border: '1px solid #ef4444',
          animation: 'slideUp 0.3s ease-out'
        }}>
          <p style={{ margin: 0, marginBottom: '8px', fontSize: '14px' }}>
            ⚠️ Chat temporarily unavailable
          </p>
          <a
            href="mailto:nolan1scott3@gmail.com"
            style={{
              color: '#10b981',
              textDecoration: 'none',
              fontSize: '13px'
            }}
          >
            Email me instead →
          </a>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}

export default ChatWidget;
