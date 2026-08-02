# Chat Widget - Testing Guide

## 🚀 Quick Start

### 1. Iniciar Backend
```bash
cd ../prototipo-agente  # o donde esté tu microservicio
uv run python -m app.main
```

El backend debería estar corriendo en `http://localhost:8000`

### 2. Iniciar Frontend
```bash
npm run dev
```

El frontend estará en `http://localhost:5173`

---

## ✅ Checklist de Testing

### Health Check
- [ ] Al abrir la página, el health check debería ejecutarse automáticamente
- [ ] Si el backend está up, no deberías ver warnings
- [ ] Si apagas el backend, después de ~30s debería aparecer banner rojo con "Chat temporarily unavailable"
- [ ] El banner debe mostrar link a "Email me instead"

### Welcome Message
- [ ] Al abrir el chat por primera vez, debe aparecer un mensaje de bienvenida
- [ ] Deben aparecer 4 sugerencias clickeables:
  - "Tell me about his AI experience"
  - "What projects has he built?"
  - "Show me his tech stack"
  - "How can I contact him?"

### Chat Básico
- [ ] Escribir "Hello" y enviar → debe responder
- [ ] El mensaje del usuario aparece del lado derecho con gradient verde
- [ ] El mensaje del bot aparece del lado izquierdo con avatar de perfil
- [ ] Debe aparecer indicator "✨ Typing..." mientras procesa

### Idioma
- [ ] Cambiar idioma de la página a Español (botón EN/ES en el nav)
- [ ] Escribir "Cuéntame sobre tus proyectos" → debe responder en español
- [ ] Volver a Inglés → debe responder en inglés

### Session Persistence
- [ ] Enviar algunos mensajes
- [ ] Recargar la página (F5)
- [ ] El historial debería cargarse automáticamente
- [ ] Puedes continuar la conversación donde la dejaste

### Clear Chat
- [ ] Click en "Clear Chat" en el footer del chat
- [ ] Todos los mensajes deben desaparecer
- [ ] Debe aparecer nuevamente el welcome message
- [ ] Session ID en localStorage debe borrarse
- [ ] Session en backend debe borrarse (verificar con backend logs)

### Mobile
- [ ] Abrir en modo responsive (F12 → Toggle device toolbar)
- [ ] Seleccionar iPhone o cualquier móvil
- [ ] La burbuja flotante debe ser más grande (60x60px)
- [ ] Al abrir el chat, debe ocupar toda la pantalla (full-screen modal)
- [ ] Debe poder escribir sin que el teclado tape el input

### Error Handling
- [ ] **Rate Limit:** Enviar muchos mensajes rápido (si hay rate limit bajo)
  - Debe mostrar "Too many requests. Please wait X seconds"
- [ ] **Backend Down:** Apagar backend mientras chat está abierto
  - Después de 3 health checks fallidos, debe aparecer banner de error
  - Debe mostrar opción de "Email me instead"
- [ ] **Timeout:** (Si respondes con mensajes muy largos)
  - Si tarda >15s, debería manejarlo gracefully

---

## 🐛 Debugging

### Ver Logs en Consola
```javascript
// Abrir DevTools (F12) → Console
// Deberías ver:
- "Health check:" cada 30s
- "Session ID:" cuando se crea una sesión
- "Sending message:" cuando envías un mensaje
```

### Verificar Variables de Entorno
```javascript
// En Console:
console.log('API URL:', import.meta.env.VITE_API_URL);
console.log('API Key exists:', !!import.meta.env.VITE_API_KEY);
```

### Ver Session ID
```javascript
// En Console:
localStorage.getItem('portfolio_chat_session')
```

### Ver Cookies
```javascript
// En Console:
document.cookie
```

### Network Tab
- F12 → Network tab
- Filtrar por "chat"
- Deberías ver:
  - `GET /api/v1/health` cada 30s
  - `GET /api/v1/chat/welcome` al abrir
  - `POST /api/v1/chat` cuando envías mensajes
  - `GET /api/v1/chat/session/{id}/history` al recargar

---

## 🎨 Visual Check

### Desktop
- Burbuja flotante en esquina inferior derecha
- Gradient verde (#10b981) en burbuja y mensajes de usuario
- Chat window: 380x550px aprox
- Dark theme (background #1f2937, borders #374151)
- Avatar de Nolan en mensajes del bot

### Mobile (<768px)
- Chat ocupa 100% de pantalla cuando está abierto
- Burbuja más grande (60x60px)
- Fácil de cerrar (botón X visible)
- Input no queda tapado por teclado

---

## 🚨 Common Issues

### "Chat no abre"
1. Verificar que react-chatbotify esté instalado: `npm list react-chatbotify`
2. Ver errores en Console (F12)
3. Verificar que backend esté corriendo

### "No aparece welcome message"
1. Verificar API key en `.env.local`
2. Ver Network tab → debe haber request a `/api/v1/chat/welcome`
3. Ver response de ese request

### "Session no persiste"
1. Verificar localStorage: `localStorage.getItem('portfolio_chat_session')`
2. Verificar que `credentials: 'include'` esté en fetch (src/services/chatApi.ts)
3. Ver cookies: `document.cookie`

### "CORS error"
1. Backend debe tener `http://localhost:5173` en allow_origins
2. Verificar que backend esté usando `allow_credentials=True`

### "Estilos no se aplican"
1. Verificar que `chat.css` esté importado en main.jsx
2. Inspeccionar elemento (F12) y ver computed styles
3. Puede ser que react-chatbotify use clases diferentes → ajustar CSS

---

## 📊 Expected Behavior

| Acción | Esperado |
|--------|----------|
| Primera apertura | Welcome message + 4 suggestions |
| Enviar mensaje | User message (right, green) → Bot response (left, dark) |
| Recargar página | Historial se carga automáticamente |
| Clear chat | Todo se borra, vuelve welcome |
| Backend down | Banner rojo + email fallback |
| Mobile | Full-screen modal |

---

## 📝 Notes

- El backend usa **OpenAI/Anthropic** (según tu config), puede haber latencia de 2-5s
- Rate limits en DEV son altos (1000/hora), en PROD ajustar a ~20/hora
- Session TTL: 1 hora en Redis, permanente en PostgreSQL
- Health check polling: cada 30s (ajustable en useHealthCheck)

---

**Última actualización:** 2026-08-01
