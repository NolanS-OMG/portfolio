# Tools — Plan de Implementacion (Hard Coded First)

## Filosofia

El AI **acciona** tools, no las **ejecuta**. Cada tool es un flujo autonomo del frontend que:

1. Se puede disparar manualmente desde un dev menu (para probar sin backend)
2. Se puede disparar por el AI pasando parametros opcionales (pre-fill)
3. Funciona completamente sin tokens adicionales una vez activada

---

## Clasificacion Final

### Tools de Accion (ejecutan algo en la pagina)

| Tool | Que hace |
|------|----------|
| `navigate_to` | Scroll + highlight a seccion |
| `download_cv` | Inicia descarga del PDF |
| `show_projects` | Inyecta cards de proyectos en el chat |
| `send_message` | Inicia flujo de formulario en el chat |

### Tools de Presentacion (renderizan componentes ricos inline)

| Tool | Que hace |
|------|----------|
| `copy_contact` | Renderiza datos de contacto con boton copiar |
| `compatibility_score` | Mini-dashboard de compatibilidad |
| `project_card` | Card individual de proyecto |
| `action_button` | Boton inline que dispara una accion |

---

## Dev Menu (Panel de Testing)

Componente temporal visible solo en desarrollo (`import.meta.env.DEV`).

- Panel flotante con botones para disparar cada tool manualmente
- Permite pasar parametros (dropdown de secciones, filtro de proyectos, etc.)
- Se renderiza fuera del chat, posicion fija esquina superior izquierda
- Se elimina antes de produccion

```
[Dev Tools]
[Navigate: projects ▼] [Fire]
[Download CV] [Fire]
[Show Projects: filter ___] [Fire]
[Send Message: prefill email ___] [Fire]
[Copy Contact: email ▼] [Fire]
[Compatibility: query ___] [Fire]
```

---

## Tool 1: `navigate_to`

### Que hace
Scrollea a una seccion del portafolio y la resalta brevemente.

### Parametros
```
{ section: "projects" | "about" | "experience" | "contact" | "skills" | "hero" }
```

### Implementacion Hard Coded

1. **Mapa de secciones** — Objeto con section_id → selector CSS o ref
   ```js
   const SECTIONS = {
     projects: '#projects',
     about: '#about',
     experience: '#experience',
     contact: '#contact',
     skills: '#skills',
     hero: '#hero',
   }
   ```

2. **Funcion de navegacion**
   - `scrollIntoView({ behavior: 'smooth', block: 'start' })`
   - Agregar clase CSS temporal `highlight-pulse` al contenedor de la seccion
   - Remover clase despues de 2s

3. **Animacion highlight** — CSS keyframe
   ```css
   .highlight-pulse {
     animation: section-highlight 2s ease-out;
   }
   @keyframes section-highlight {
     0% { box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.6); }
     100% { box-shadow: 0 0 0 0px rgba(16, 185, 129, 0); }
   }
   ```

4. **Feedback en chat** — Inyectar mensaje: "Navegando a [seccion]..." con icono.

### Archivo(s) a crear/modificar
- `src/tools/navigateTo.js` — logica de scroll + highlight
- `src/styles/tools.css` — animacion highlight
- Verificar que las secciones del portafolio tengan IDs consistentes

---

## Tool 2: `download_cv`

### Que hace
Inyecta un boton de descarga estilizado en el chat.

### Parametros
Ninguno (o `{ lang?: "en" | "es" }` si hay CV en ambos idiomas).

### Implementacion Hard Coded

1. **Componente `DownloadCVButton`**
   - Boton con icono de descarga
   - Click → `<a href="/CV_Nolan_Ashcraft.pdf" download>` programatico
   - Feedback: icono cambia a checkmark por 2s despues de click

2. **Inyeccion en chat**
   - Se usa `params.injectMessage(<DownloadCVButton />)` igual que StreamingBubble
   - Texto acompanante: "Aqui tienes el CV de Nolan:"

### Archivo(s) a crear/modificar
- `src/tools/components/DownloadCVButton.jsx`

---

## Tool 3: `show_projects`

### Que hace
Inyecta una o varias cards de proyectos en el chat.

### Parametros
```
{ filter?: string, projectIds?: string[] }
```
- Sin filtro: muestra todos (o top 3-4)
- Con filtro: matchea contra tech tags o titulo
- Con IDs: muestra proyectos especificos

### Implementacion Hard Coded

1. **Data source** — JSON con proyectos de Nolan
   ```js
   // src/data/projects.json
   [
     {
       "id": "portfolio-chat",
       "title": "Portfolio AI Chat",
       "description": "Chatbot inteligente con streaming y function calling",
       "tech": ["React", "FastAPI", "Claude API", "WebSocket"],
       "demoUrl": "https://...",
       "repoUrl": "https://github.com/...",
       "thumbnail": "/projects/chat-ai.png"
     },
     ...
   ]
   ```

2. **Componente `ProjectCard`**
   - Thumbnail (si existe)
   - Titulo en bold
   - Descripcion 1-2 lineas
   - Tech tags como badges (pills verdes)
   - Botones: "Demo" y "Repo" (links externos)
   - Ancho maximo del chat bubble

3. **Componente `ProjectList`**
   - Wrapper que renderiza N cards
   - Si hay filtro, muestra "Mostrando proyectos con [filtro]:" arriba
   - Scroll horizontal si son muchos? O stack vertical.

4. **Filtrado** — Match case-insensitive contra `tech[]` y `title`

### Archivo(s) a crear/modificar
- `src/data/projects.json`
- `src/tools/components/ProjectCard.jsx`
- `src/tools/components/ProjectList.jsx`

---

## Tool 4: `send_message`

### Que hace
Inicia un flujo de formulario DENTRO del chat, sin gastar tokens. El AI solo lo dispara.

### Parametros (pre-fill opcionales del AI)
```
{ name?: string, email?: string, message?: string }
```
Si el AI ya sabe el nombre/email de la conversacion, los pasa y se saltan esos pasos.

### Implementacion Hard Coded

El flujo se inyecta en el chat como una serie de pasos interactivos:

1. **Paso 1: Email** (si no pre-filled)
   - Muestra: "Para enviar el mensaje, necesito tu email:"
   - Input inline validado (regex email)
   - Boton "Continuar"

2. **Paso 2: Nombre** (si no pre-filled)
   - "¿Tu nombre?"
   - Input de texto
   - Boton "Continuar"

3. **Paso 3: Mensaje** (si no pre-filled)
   - "¿Que te gustaria decirle a Nolan?"
   - Textarea
   - Boton "Continuar"

4. **Paso 4: Confirmacion**
   - Resumen: "Enviar a Nolan como [nombre] ([email]): [mensaje]"
   - Botones: "Enviar" / "Cancelar"

5. **Envio**
   - POST a `/api/contact` con `{ name, email, message }`
   - Feedback: "Mensaje enviado!" con checkmark
   - Error: "No se pudo enviar, intenta de nuevo"

### Componente principal
- `MessageFlowWidget` — stateful, maneja el paso actual
- Cada paso es un sub-componente renderizado condicionalmente
- Se inyecta como un solo componente React en el chat (no multiples mensajes)
- Animacion de transicion entre pasos (slide o fade)

### Archivo(s) a crear/modificar
- `src/tools/components/MessageFlow.jsx`
- Backend: endpoint `/api/contact` (despues)

---

## Tool 5: `copy_contact`

### Que hace
Renderiza info de contacto con botones de copiar individuales.

### Parametros
```
{ type: "email" | "linkedin" | "github" | "all" }
```

### Implementacion Hard Coded

1. **Data source**
   ```js
   const CONTACT_INFO = {
     email: { value: 'nolan@example.com', icon: 'mail', label: 'Email' },
     linkedin: { value: 'https://linkedin.com/in/nolan', icon: 'linkedin', label: 'LinkedIn' },
     github: { value: 'https://github.com/nolan', icon: 'github', label: 'GitHub' },
   }
   ```

2. **Componente `CopyableContact`**
   - Cada item: icono + valor visible + boton copiar
   - Click en copiar → `navigator.clipboard.writeText(value)`
   - Feedback: "Copiado!" tooltip por 1.5s, icono cambia a checkmark
   - Links (linkedin/github) tambien son clickeables (abren en nueva tab)

3. **type: "all"** renderiza los 3 apilados

### Archivo(s) a crear/modificar
- `src/tools/components/CopyableContact.jsx`

---

## Tool 6: `compatibility_score`

### Que hace
Evalua match entre lo que busca el usuario y los skills de Nolan. Renderiza dashboard inline.

### Parametros
```
{ query: string, categories?: { name: string, skills: string[] }[] }
```
- `query`: descripcion libre de lo que buscan
- `categories`: ya parseado por el AI en categorias (opcional, si no se parsea localmente)

### Implementacion Hard Coded

1. **Data source** — Skills de Nolan con categorias y niveles
   ```js
   // src/data/skills.json
   {
     "Backend": { "Python": 10, "FastAPI": 9, "Node.js": 7, "PostgreSQL": 8 },
     "Frontend": { "React": 8, "TypeScript": 7, "Tailwind": 8 },
     "AI/ML": { "LLMs": 9, "RAG": 9, "Prompt Engineering": 10, "Fine-tuning": 7 },
     "DevOps": { "Docker": 8, "AWS": 7, "CI/CD": 7 }
   }
   ```

2. **Logica de scoring** (local, sin AI)
   - Match keywords del query contra skills
   - Score por categoria = (skills que matchean / skills pedidos) * 10
   - Score global = promedio ponderado

3. **Componente `CompatibilityDashboard`**
   - Badge circular grande: "8/10" con color (verde >7, amarillo 5-7, rojo <5)
   - Barras horizontales por categoria con porcentaje
   - Lista de skills que matchean (check verde) y los que faltan (x gris)
   - CTA al final: "¿Quieres contactarlo?" → dispara `send_message`

4. **Version hard coded para dev**: El dev menu permite escribir un query y ver el resultado inmediatamente.

### Archivo(s) a crear/modificar
- `src/data/skills.json`
- `src/tools/components/CompatibilityDashboard.jsx`
- `src/tools/scoring.js` — logica de matching

---

## Estructura de Archivos

```
src/
  tools/
    index.js              — registry de tools, dispatch
    navigateTo.js         — logica de scroll + highlight
    scoring.js            — logica de compatibility scoring
    components/
      DownloadCVButton.jsx
      ProjectCard.jsx
      ProjectList.jsx
      MessageFlow.jsx
      CopyableContact.jsx
      CompatibilityDashboard.jsx
      DevToolsPanel.jsx   — menu de testing (solo dev)
  data/
    projects.json
    skills.json
    contact.json
  styles/
    tools.css             — animaciones y estilos de tools
```

---

## Integracion con el Chat (Patron General)

Todas las tools se inyectan en el chat via `params.injectMessage(<Component />)`.

El flujo cuando el AI dispara una tool:

```
AI response: "Te muestro los proyectos de backend:"
  → Frontend detecta tool call en response metadata
  → Llama a toolRegistry.execute('show_projects', { filter: 'backend' })
  → toolRegistry inyecta <ProjectList filter="backend" /> en el chat
```

Para la version hard coded, el Dev Panel hace lo mismo pero manualmente:
```
Dev click "Show Projects" con filter "backend"
  → Llama a toolRegistry.execute('show_projects', { filter: 'backend' })
  → Se inyecta igual
```

---

## Orden de Implementacion

1. **Estructura base** — crear carpetas, registry, dev panel
2. **navigate_to** — mas simple, solo scroll + CSS
3. **download_cv** — componente simple, un boton
4. **copy_contact** — clipboard API + feedback
5. **show_projects** — data + cards (mas visual)
6. **send_message** — flujo multi-step (mas complejo)
7. **compatibility_score** — scoring + dashboard (mas complejo)

Cada uno se prueba desde el dev panel antes de conectar con el AI.
