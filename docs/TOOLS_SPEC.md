# Chat AI Tools — Especificacion Final

## Arquitectura General

El AI tiene dos tipos de capacidades:

- **Tools de accion**: Ejecutan algo en la pagina (navegar, descargar, enviar).
- **Tools de presentacion**: Renderizan componentes ricos inline en el chat (cards, badges, links copiables).

El backend expone tools via function calling. El frontend detecta metadata estructurada en la respuesta y renderiza componentes ricos.

---

## Tools de Accion

### 1. Navegar pagina (`navigate_to`)

El AI detecta intencion y hace scroll/navegacion a la seccion relevante del portafolio.

- **Trigger**: "muestrame tus proyectos", "donde esta el contacto", "quiero ver tu experiencia"
- **Parametros**: `{ section: "projects" | "about" | "experience" | "contact" | "skills" }`
- **Comportamiento**: Scroll suave a la seccion. Si hay un proyecto especifico mencionado, resaltar/filtrar ese.
- **Feedback visual**: Breve highlight de la seccion destino.

### 2. Descargar CV (`download_cv`)

Coloca un boton/link incrustado en el chat para descargar el PDF.

- **Trigger**: "dame su CV", "quiero su curriculum", "download resume"
- **Parametros**: ninguno
- **Respuesta**: Texto + componente inline con boton de descarga estilizado.
- **Asset**: `/CV_Nolan_Ashcraft.pdf`

### 3. Mostrar proyectos (`show_projects`)

Despliega cards de proyectos incrustadas en el chat con links funcionales.

- **Trigger**: "que proyectos tiene", "show me his work", "tiene algo con RAG?"
- **Parametros**: `{ filter?: string }` — filtro opcional por tecnologia o tema.
- **Respuesta**: Array de project cards con:
  - Titulo
  - Descripcion corta (1-2 lineas)
  - Tech tags (badges)
  - Link al proyecto (demo/repo)
  - Thumbnail opcional

### 4. Enviar mensaje a Nolan (`send_message`)

Formulario conversacional dentro del chat para contacto directo.

- **Flujo**:
  1. AI pregunta nombre
  2. AI pregunta email
  3. AI pregunta mensaje/motivo
  4. Confirmacion y envio
- **Backend**: Dispara email/notificacion a Nolan.
- **Feedback**: "Mensaje enviado correctamente" con checkmark.
- **Validacion**: Email valido, mensaje no vacio, rate limit.

### 5. Copiar contacto (`copy_contact`)

Renderiza info de contacto con boton de copiar al clipboard.

- **Trigger**: "cual es su email", "como lo contacto", "dame su LinkedIn"
- **Parametros**: `{ type: "email" | "linkedin" | "github" | "all" }`
- **Respuesta**: Info formateada con icono de copiar al lado de cada dato.
- **Feedback**: "Copiado!" toast breve al hacer click.

---

## Tools de Presentacion (Componentes Ricos)

### 6. Tech Stack Matcher (`compatibility_score`)

Analisis interactivo de compatibilidad con lo que busca el usuario.

- **Flujo**:
  1. El recruiter describe lo que busca (o el AI pregunta paso a paso: backend, frontend, AI/ML, infra)
  2. AI procesa contra skills conocidos de Nolan
  3. Renderiza mini-dashboard inline:
     - Badge principal: "9/10 compatible"
     - Barras por categoria (Backend, Frontend, AI/ML, DevOps, etc.)
     - Skills que matchean resaltados
     - Skills que faltan (transparencia)
  4. Si score es alto: CTA "Agendar llamada" o "Enviar mensaje"
- **Metadata de respuesta**:
  ```json
  {
    "type": "compatibility_score",
    "data": {
      "overall": 9,
      "max": 10,
      "categories": [
        { "name": "Backend", "score": 10, "matches": ["FastAPI", "Python"], "missing": [] },
        { "name": "AI/ML", "score": 8, "matches": ["RAG", "LLMs"], "missing": ["MLOps"] }
      ],
      "cta": "send_message"
    }
  }
  ```

### 7. Project Card (componente)

Renderizado rico de un proyecto individual.

```json
{
  "type": "project_card",
  "data": {
    "title": "Portfolio AI Chat",
    "description": "Chatbot con streaming WebSocket y function calling",
    "tech": ["React", "FastAPI", "Claude API", "WebSocket"],
    "demo_url": "https://...",
    "repo_url": "https://github.com/...",
    "thumbnail": "/projects/chat-ai.png"
  }
}
```

### 8. Link copiable (componente)

Cualquier link/email/dato accionable con boton copy.

```json
{
  "type": "copyable",
  "data": {
    "label": "Email",
    "value": "nolan@example.com",
    "icon": "mail"
  }
}
```

### 9. Action button (componente)

Boton inline que ejecuta una accion.

```json
{
  "type": "action_button",
  "data": {
    "label": "Descargar CV",
    "action": "download_cv",
    "icon": "download",
    "style": "primary"
  }
}
```

---

## Formato de Respuesta del AI

El AI responde con texto normal + bloques de metadata para componentes ricos:

```
Nolan tiene experiencia solida en backend con Python y FastAPI.

[component:project_card]{"title":"API Gateway","description":"...","tech":["FastAPI","Redis"]}[/component]

Puedes descargar su CV aqui:

[component:action_button]{"label":"Descargar CV","action":"download_cv","icon":"download"}[/component]
```

El frontend parsea estos bloques y renderiza los componentes correspondientes inline en el chat.

---

## Principios de Diseno

1. **Todo lo accionable es accionable** — links reales, botones funcionales, copy buttons.
2. **Feedback visual siempre** — toda accion muestra confirmacion (toast, checkmark, highlight).
3. **Tools se conectan entre si** — matcher alto → CTA de contacto. Ver proyecto → link al demo.
4. **Transparencia** — el matcher muestra lo que NO matchea tambien. No vender humo.
5. **Progressive disclosure** — texto primero, componente rico abajo. Funciona incluso sin JS extra.

---

## Prioridad de Implementacion

| Fase | Tools |
|------|-------|
| **MVP** | navigate_to, download_cv, show_projects, copy_contact |
| **V2** | send_message, compatibility_score |
| **Futuro** | Agendar llamada (requiere Google Calendar OAuth) |

---

## Dependencias Tecnicas

- **Backend**: Agregar tools al system prompt del AI, manejar function calling, devolver metadata estructurada.
- **Frontend**: Parser de `[component:...]` en respuestas, componentes React para cada tipo, clipboard API, scroll API.
- **Data**: Definir JSON de proyectos y skills de Nolan como fuente de verdad para tools.
