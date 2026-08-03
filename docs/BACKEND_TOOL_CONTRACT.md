# Backend Tool Contract

Este documento define exactamente cómo el frontend espera recibir las tool calls desde el backend para que se rendericen correctamente en el chat.

## Protocolo de Comunicación

El frontend se conecta via WebSocket a `/ws/chat`. Los mensajes que envía el frontend tienen esta forma:

```json
{
  "message": "texto del usuario",
  "language": "en" | "es",
  "session_id": "uuid-opcional"
}
```

El backend responde con eventos SSE-like a través del WebSocket:

| type | payload | descripción |
|------|---------|-------------|
| `connected` | `{ session_id }` | Confirmación de conexión |
| `content` | `{ content }` | Chunk de texto (streaming) |
| `tool_call` | ver abajo | El AI quiere ejecutar una herramienta |
| `done` | `{}` | Fin del mensaje |
| `error` | `{ message, retry_after_seconds? }` | Error |

## Tool Calls

Cuando el AI decide usar una herramienta, el backend debe enviar un mensaje `tool_call` con esta estructura:

```json
{
  "type": "tool_call",
  "tool": "nombre_de_la_tool",
  "args": { ... }
}
```

El frontend intercepta este mensaje y ejecuta la herramienta localmente (renderiza un componente en el chat, navega la página, etc). **No se espera un `tool_result` de vuelta** — la ejecución es puramente frontend.

> **Importante**: Actualmente el hook (`useChatWebSocket.ts`) tiene un `case 'tool_call'` que hace `break` sin acción. Esto es donde se conectará la lógica. El backend solo necesita enviar el evento; el frontend hará el resto.

---

## Herramientas Disponibles

### `navigate_to`

Hace scroll a una sección de la página y la destaca visualmente.

```json
{
  "type": "tool_call",
  "tool": "navigate_to",
  "args": {
    "section": "header" | "experience" | "projects"
  }
}
```

- `section` (required): ID de la sección. Solo estos tres valores son válidos.

---

### `download_cv`

Inyecta un botón de descarga del CV en el chat.

```json
{
  "type": "tool_call",
  "tool": "download_cv",
  "args": {}
}
```

- No requiere argumentos. El idioma se toma del contexto de la conversación.

---

### `copy_contact`

Muestra información de contacto con botones para copiar al clipboard.

```json
{
  "type": "tool_call",
  "tool": "copy_contact",
  "args": {
    "type": "all" | "email" | "linkedin" | "github"
  }
}
```

- `type` (optional, default `"all"`): Qué contacto mostrar. `"all"` muestra los tres.

---

### `show_projects`

Muestra tarjetas de proyecto en el chat. El AI decide qué proyectos mostrar.

```json
{
  "type": "tool_call",
  "tool": "show_projects",
  "args": {
    "ids": ["snake-rl", "schools"]
  }
}
```

- `ids` (optional, default `[]`): Array de IDs de proyectos a mostrar. Si está vacío, muestra todos.

**IDs válidos:**
| ID | Proyecto |
|----|----------|
| `snake-rl` | Snake RL - AI vs Human |
| `schools` | Schools Landing/Admin |
| `inventory-crud` | Inventory CRUD App |
| `portfolios-lobby` | Portfolios Project |

---

### `send_message`

Inyecta un formulario de contacto en el chat para que el visitante envíe un mensaje a Nolan.

```json
{
  "type": "tool_call",
  "tool": "send_message",
  "args": {
    "name": "John",
    "email": "john@example.com",
    "message": ""
  }
}
```

- `name` (optional): Pre-llena el campo nombre.
- `email` (optional): Pre-llena el campo email.
- `message` (optional): Pre-llena el campo mensaje.

Todos los campos son opcionales. El formulario se muestra completo siempre (name, email, message) y el usuario completa lo que falta.

El formulario hace POST a `/api/contact` con `{ name, email, message }`.

---

### `compatibility_score`

Muestra un dashboard animado de compatibilidad entre las skills requeridas y las de Nolan.

```json
{
  "type": "tool_call",
  "tool": "compatibility_score",
  "args": {
    "query": "React Python FastAPI Docker"
  }
}
```

- `query` (required): String con las tecnologías/skills que busca el visitante, separadas por espacios, comas o similares.

El frontend hace el matching contra su base de skills local. No necesita cálculos del backend.

**Skills que el frontend puede matchear:**

Backend: Python, FastAPI, Ruby on Rails, Node.js, Java, Spring Boot, PostgreSQL, MongoDB
Frontend: React, React Native, TypeScript, JavaScript, Tailwind, Next.js, HTML, CSS
AI/ML: LLMs, RAG, Prompt Engineering, Reinforcement Learning, ONNX, AI Agents
DevOps: AWS, Docker, CI/CD, Jenkins, Firebase, Git

---

## Flujo Completo (Ejemplo)

```
Usuario: "What projects use React?"
```

El backend debe:
1. Enviar chunks de `content` con la respuesta textual del AI (si quiere decir algo antes)
2. Enviar el `tool_call`:
```json
{"type": "tool_call", "tool": "show_projects", "args": {"ids": ["schools"]}}
```
3. Opcionalmente enviar más `content` chunks después del tool call
4. Enviar `done`

El frontend renderizará: el texto del AI + la tarjeta del proyecto de Schools (que usa React) como un componente interactivo dentro del chat.

---

## Notas Importantes

1. **El idioma NO va en args**: El frontend maneja el idioma internamente basándose en el `language` del mensaje original. No es necesario pasarlo en cada tool call.

2. **Múltiples tool calls**: Se pueden enviar varios `tool_call` en una misma respuesta. Cada uno se ejecutará en orden.

3. **Tool calls + texto**: Es válido mezclar `content` chunks con `tool_call` events. El texto aparece como burbuja del bot y las tools como componentes enriquecidos.

4. **No esperar confirmación**: Las tools se ejecutan inmediatamente al recibirlas. No hay handshake de vuelta.

5. **Validación**: Si un `tool` name no existe en el registry del frontend, se ignora silenciosamente. Si `args` faltan campos opcionales, se usan defaults.
