import { useEffect, useRef, useState } from 'react';
import ChatBot from 'react-chatbotify';
import { useTranslation } from 'react-i18next';
import { useChat } from '../hooks/useChat';
import { useHealthCheck } from '../hooks/useHealthCheck';

function ChatWidget() {
  const { t } = useTranslation();
  const { messages, isLoading, error, sendMessage, suggestions, clearChat } = useChat();
  const { status, isHealthy } = useHealthCheck(30000); // Check every 30s
  const [isChatOpen, setIsChatOpen] = useState(false);
  const hasShownWelcome = useRef(false);

  const flow = {
    start: {
      message: async (params) => {
        // Show welcome message only once
        if (!hasShownWelcome.current && messages.length > 0) {
          hasShownWelcome.current = true;
          return messages[0].content;
        }
        return null;
      },
      path: 'chat_loop',
    },
    chat_loop: {
      message: async (params) => {
        // This will be handled by the message history rendering
        return null;
      },
      path: 'chat_loop',
    },
  };

  const settings = {
    general: {
      primaryColor: '#10b981', // Green matching your gradient
      secondaryColor: '#111827', // Dark background
      fontFamily: 'inherit',
      embedded: false,
      showHeader: true,
      showFooter: true,
      showInputRow: true,
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
      closeChatIcon: null, // Use default close icon
    },
    chatHistory: {
      storageKey: 'portfolio_chat_history',
      disabled: true, // We manage history ourselves
    },
    chatButton: {
      icon: '💬',
    },
    chatWindow: {
      showScrollbar: true,
      autoJumpToBottom: true,
      showMessagePrompt: true,
      messagePromptText: t('Type a message...') || 'Type a message...',
    },
    botBubble: {
      showAvatar: true,
      avatar: '/profile.jpeg',
      simStream: true, // Simulate typing effect
    },
    userBubble: {
      showAvatar: false,
    },
    footer: {
      text: (
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <span style={{ fontSize: '11px', opacity: 0.7 }}>
            {!isHealthy && (
              <span style={{ color: '#ef4444', marginRight: '8px' }}>
                ⚠️ Service {status}
              </span>
            )}
            Powered by AI
          </span>
          <button
            onClick={clearChat}
            style={{
              fontSize: '11px',
              opacity: 0.7,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'inherit',
            }}
          >
            Clear Chat
          </button>
        </div>
      ),
    },
  };

  // Custom message handler
  const handleUserMessage = async (userInput) => {
    if (!userInput.trim()) return;

    await sendMessage(userInput);
  };

  // Build message list for react-chatbotify
  const chatMessages = messages.map((msg, index) => ({
    id: `msg-${index}`,
    content: msg.content,
    sender: msg.role === 'user' ? 'user' : 'bot',
    timestamp: msg.timestamp,
  }));

  // Add suggestions as quick replies after welcome message
  const quickReplies =
    messages.length === 1 && suggestions.length > 0
      ? suggestions.map((suggestion, index) => ({
          id: `suggestion-${index}`,
          text: suggestion,
          onClick: () => handleUserMessage(suggestion),
        }))
      : [];

  return (
    <>
      <ChatBot
        flow={flow}
        settings={settings}
        messages={chatMessages}
        onUserSubmitText={handleUserMessage}
      />

      {/* Error banner */}
      {error && (
        <div
          style={{
            position: 'fixed',
            bottom: '80px',
            right: '20px',
            background: '#ef4444',
            color: 'white',
            padding: '12px 16px',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            zIndex: 9999,
            maxWidth: '300px',
          }}
        >
          {error}
        </div>
      )}

      {/* Service unavailable fallback */}
      {!isHealthy && (
        <div
          style={{
            position: 'fixed',
            bottom: '140px',
            right: '20px',
            background: '#111827',
            color: 'white',
            padding: '12px 16px',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            zIndex: 9999,
            maxWidth: '300px',
            border: '1px solid #ef4444',
          }}
        >
          <p style={{ margin: 0, marginBottom: '8px', fontSize: '14px' }}>
            ⚠️ Chat temporarily unavailable
          </p>
          <a
            href="mailto:nolan1scott3@gmail.com"
            style={{
              color: '#10b981',
              textDecoration: 'none',
              fontSize: '13px',
            }}
          >
            Email me instead →
          </a>
        </div>
      )}

      {/* Loading indicator */}
      {isLoading && (
        <div
          style={{
            position: 'fixed',
            bottom: '80px',
            right: '380px',
            background: '#111827',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '8px',
            fontSize: '12px',
            zIndex: 9999,
          }}
        >
          ✨ Typing...
        </div>
      )}

      {/* Suggestion chips */}
      {quickReplies.length > 0 && (
        <div
          style={{
            position: 'fixed',
            bottom: '80px',
            right: '380px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            maxWidth: '250px',
            zIndex: 9999,
          }}
        >
          {quickReplies.map((reply) => (
            <button
              key={reply.id}
              onClick={reply.onClick}
              style={{
                background: '#1f2937',
                color: 'white',
                border: '1px solid #10b981',
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#10b981';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#1f2937';
              }}
            >
              {reply.text}
            </button>
          ))}
        </div>
      )}
    </>
  );
}

export default ChatWidget;
