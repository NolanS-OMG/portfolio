# Plan de Implementación del Chat - Frontend

**Fecha:** 2026-08-01  
**Versión:** MVP  
**Stack:** React 18 + TypeScript + Tailwind + react-chatbotify

---

## 🎯 Objetivos del MVP

1. Burbuja de chat flotante en esquina inferior derecha
2. Health check activo con fallback a mailto
3. Welcome message automático al abrir
4. Historial de sesión persistente
5. Soporte bilingüe (EN/ES) integrado con i18n existente
6. Diseño matching el theme actual (dark + green gradient)
7. Mobile-friendly

---

## 📦 Dependencias a Instalar

```bash
npm install react-chatbotify
npm install -D @types/node  # Para process.env
```

---

## 🗂️ Estructura de Archivos

```
src/
├── components/
│   ├── ChatWidget.tsx        # Componente principal del chat
│   └── ChatBubble.tsx         # Burbuja flotante (opcional si react-chatbotify lo maneja)
├── hooks/
│   ├── useChat.ts             # Lógica de mensajería
│   ├── useHealthCheck.ts      # Monitor de health endpoint
│   └── useChatSession.ts      # Manejo de session_id en localStorage
├── services/
│   └── chatApi.ts             # Fetch wrappers para todos los endpoints
├── types/
│   └── chat.ts                # Interfaces TypeScript
└── styles/
    └── chat.css               # Estilos custom (si react-chatbotify no cubre todo)
```

---

## 📋 Implementación por Fases

### **Fase 1.1: Setup & Config (30 min)**

**Archivos:**
- `.env.local`
- `src/types/chat.ts`

**Tareas:**
1. Crear `.env.local` con:
   ```bash
   VITE_API_URL=http://localhost:8000
   VITE_API_KEY=sk_portfol_xxxxx
   ```

2. Agregar `.env.local` al `.gitignore`

3. Crear interfaces en `types/chat.ts`:
   ```typescript
   export interface Message {
     role: 'user' | 'assistant';
     content: string;
     timestamp?: string;
   }

   export interface ChatResponse {
     session_id: string;
     response: string;
     tool_used: null;
   }

   export interface WelcomeResponse {
     message: string;
     suggestions: string[];
   }

   export interface HealthResponse {
     status: 'healthy' | 'degraded' | 'unhealthy';
     timestamp: string;
     version: string;
   }
   ```

---

### **Fase 1.2: API Service Layer (45 min)**

**Archivo:** `src/services/chatApi.ts`

**Funciones:**
1. `sendMessage(message: string, sessionId?: string, language?: string): Promise<ChatResponse>`
2. `getWelcome(): Promise<WelcomeResponse>`
3. `getHealth(): Promise<HealthResponse>`
4. `getSessionHistory(sessionId: string): Promise<Message[]>`
5. `deleteSession(sessionId: string): Promise<void>`

**Features:**
- `credentials: 'include'` en todos los fetch
- Header `X-API-Key` automático
- Error handling consistente
- Retry logic para network errors (3 intentos)

---

### **Fase 1.3: Custom Hooks (1 hora)**

#### **Hook 1: `useHealthCheck.ts`**
```typescript
export function useHealthCheck(intervalMs: number = 30000) {
  const [status, setStatus] = useState<'healthy' | 'degraded' | 'unhealthy' | 'unknown'>('unknown');
  const [failCount, setFailCount] = useState(0);

  useEffect(() => {
    // Poll health cada 30s
    // Si falla 3 veces consecutivas → status = 'unhealthy'
  }, [intervalMs]);

  return { status, isHealthy: status === 'healthy' };
}
```

#### **Hook 2: `useChatSession.ts`**
```typescript
export function useChatSession() {
  const [sessionId, setSessionId] = useState<string | null>(() => {
    return localStorage.getItem('portfolio_chat_session');
  });

  const saveSession = (id: string) => {
    setSessionId(id);
    localStorage.setItem('portfolio_chat_session', id);
  };

  const clearSession = () => {
    setSessionId(null);
    localStorage.removeItem('portfolio_chat_session');
  };

  return { sessionId, saveSession, clearSession };
}
```

#### **Hook 3: `useChat.ts`**
```typescript
export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { sessionId, saveSession } = useChatSession();
  const { i18n } = useTranslation();

  // loadWelcome()
  // loadHistory()
  // sendMessage(text)
  // clearChat()

  return { messages, sendMessage, isLoading, error, clearChat };
}
```

---

### **Fase 1.4: Componente Principal (1.5 horas)**

**Archivo:** `src/components/ChatWidget.tsx`

**Features:**
1. Integración con `react-chatbotify`
2. Burbuja flotante customizada con tu theme
3. Welcome message al primer open
4. Suggestions clickeables
5. Loading state con typing indicator
6. Error banner si health check falla
7. Botón "Clear Chat" en settings
8. Toggle EN/ES (sincronizado con i18n global)

**Diseño:**
- Background: `bg-gray-900/95` (matching tu dark theme)
- Accent: `green-gradient` (mismo que usas en botones)
- Borde redondeado: `rounded-2xl`
- Shadow: `shadow-2xl`
- Animaciones suaves: `transition-all duration-300`

---

### **Fase 1.5: Integración en App.tsx (15 min)**

```tsx
// src/App.tsx
import ChatWidget from './components/ChatWidget';

function App() {
  // ... código existente

  return (
    <div className="relative">
      {/* ... tu contenido existente ... */}
      
      <ChatWidget />
    </div>
  );
}
```

---

### **Fase 1.6: Estilos Custom (30 min)**

**Archivo:** `src/styles/chat.css`

**Customizaciones:**
- Override de colores de react-chatbotify para matching tu theme
- Animaciones de entrada/salida de la burbuja
- Responsive adjustments (en mobile: full-screen modal)
- Estados de hover/focus con tu green gradient

---

### **Fase 1.7: Error Handling & Fallbacks (30 min)**

**Escenarios:**

1. **Backend down (health unhealthy):**
   ```tsx
   <div className="error-banner">
     ⚠️ Chat temporarily unavailable.
     <a href="mailto:nolan1scott3@gmail.com">Email me</a>
   </div>
   ```

2. **Rate limit (429):**
   ```tsx
   "You've reached the message limit. Please wait {retry_after} seconds."
   ```

3. **Network error:**
   ```tsx
   "Connection failed. Retrying... (attempt {count}/3)"
   ```

4. **Timeout (>15s):**
   ```tsx
   "The assistant is taking longer than expected. Try again?"
   ```

---

### **Fase 1.8: Mobile Optimizations (30 min)**

**Cambios:**
1. En `<768px`: Chat ocupa 100% de viewport height
2. Burbuja flotante más grande en mobile (60x60px vs 50x50px)
3. Touch-friendly tap areas (min 44x44px)
4. Keyboard push content up (no overlap con input)

**CSS:**
```css
@media (max-width: 768px) {
  .chat-container {
    position: fixed;
    inset: 0;
    width: 100vw;
    height: 100vh;
    border-radius: 0;
  }
}
```

---

### **Fase 1.9: Testing Local (30 min)**

**Checklist:**
1. [ ] Health check verde cuando backend up
2. [ ] Welcome message aparece al primer open
3. [ ] Suggestions son clickeables
4. [ ] Mensajes persisten después de F5 (historial carga)
5. [ ] Cambiar idioma EN/ES funciona
6. [ ] Error banner aparece cuando backend down
7. [ ] Rate limit muestra mensaje correcto
8. [ ] Clear chat borra localStorage + session en backend
9. [ ] Mobile: chat full-screen
10. [ ] Desktop: burbuja flotante bottom-right

---

## 🎨 Mockup Visual

```
Desktop:
┌─────────────────────────────────┐
│                                 │
│    Tu Portfolio Content         │
│                                 │
│                                 │
│                          ┌────┐ │
│                          │ 💬 │ │  ← Burbuja (50x50px)
│                          └────┘ │
└─────────────────────────────────┘

Al hacer click:
┌─────────────────────────────────┐
│                                 │
│    Tu Portfolio Content         │
│                    ┌──────────┐ │
│                    │ Chat     │ │
│                    │ Widget   │ │
│                    │ 380x550  │ │
│                    └──────────┘ │
└─────────────────────────────────┘

Mobile:
┌───────────┐
│  Chat     │  ← Full screen
│  Widget   │
│  100%     │
│  height   │
└───────────┘
```

---

## 🔧 Variables de Entorno

**Crear `.env.local`:**
```bash
# API Configuration
VITE_API_URL=http://localhost:8000
VITE_API_KEY=sk_portfoli_a7nRq-5SYtNin6Y3YpZVVmW43imdpNPm

# Feature Flags (Fase 2)
VITE_ENABLE_TOOLS=false
VITE_ENABLE_ANALYTICS=false
```

**Agregar a `.gitignore`:**
```
.env.local
.env.production.local
```

**Crear `.env.example` (para docs):**
```bash
VITE_API_URL=http://localhost:8000
VITE_API_KEY=sk_portfoli_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**⚠️ IMPORTANTE:** La API key real está en la documentación del backend, NO la comitear al repo.

---

## 📊 Métricas de Éxito

**Fase MVP:**
- [ ] Chat funcional en <5s de carga inicial
- [ ] Response time del bot <3s (promedio)
- [ ] 0 crashes en happy path
- [ ] Health check detecta downtime en <30s
- [ ] Mobile usable sin zoom ni scroll horizontal

---

## 🚀 Deployment Checklist

### **Backend (ya debe estar listo):**
- [ ] Deployado en servidor con HTTPS
- [ ] CORS configurado con Netlify domain
- [ ] API key generada para producción
- [ ] Rate limits configurados
- [ ] Health endpoint respondiendo

### **Frontend:**
1. [ ] Actualizar `.env.production` en Netlify:
   ```
   VITE_API_URL=https://tu-backend.com
   VITE_API_KEY=sk_portfol_prod_xxxxx
   ```

2. [ ] Build test local:
   ```bash
   npm run build
   npm run preview
   ```

3. [ ] Deploy a Netlify:
   ```bash
   git push origin master
   ```

4. [ ] Test en producción:
   - [ ] Chat abre correctamente
   - [ ] Mensajes se envían/reciben
   - [ ] Session persiste entre reloads
   - [ ] Mobile funciona

---

## 🐛 Debugging Tips

**Chat no abre:**
```javascript
console.log('API URL:', import.meta.env.VITE_API_URL);
console.log('API Key exists:', !!import.meta.env.VITE_API_KEY);
```

**Health check falla:**
```bash
curl https://tu-backend.com/api/v1/health
```

**CORS error:**
- Verificar que Netlify domain esté en `allow_origins` del backend
- Verificar que `credentials: 'include'` esté en fetch

**Session no persiste:**
```javascript
console.log('Session ID:', localStorage.getItem('portfolio_chat_session'));
console.log('Cookies:', document.cookie);
```

---

## 📚 Recursos

- [react-chatbotify docs](https://react-chatbotify.com/)
- [Vite env variables](https://vitejs.dev/guide/env-and-mode.html)
- [Tailwind dark mode](https://tailwindcss.com/docs/dark-mode)

---

## 🔮 Fase 2 (Post-MVP)

**Tools a implementar:**
1. `scrollToSection` - Navegación automática
2. `downloadCV` - Descarga desde chat
3. `changeLanguage` - Cambio de idioma desde bot
4. `openLink` - Abrir GitHub/LinkedIn
5. `getGitHubStats` - Stats de repos en tiempo real
6. `startTour` - Tour guiado del portfolio

**Analytics:**
- Tracking de preguntas frecuentes
- Heatmap de sections más visitadas desde el chat
- Conversion rate (chat → contacto)

---

**Tiempo estimado total MVP:** 5-6 horas
