# NFL App - Monorepo

Aplicación web para mostrar información de juegos de NFL con pronósticos generados por IA. Los datos de juegos se obtienen de la API pública de ESPN y los pronósticos son generados por Claude (Anthropic).

## Estructura del Proyecto

```
.
├── packages/
│   ├── frontend/     # SvelteKit + Tailwind CSS + API Routes
│   └── backend/      # Node.js + Express (opcional, para referencia)
├── pnpm-workspace.yaml
├── package.json
├── vercel.json       # Configuración para Vercel
├── CLAUDE.md         # Guardrails y reglas de seguridad
└── DEPLOYMENT.md     # Guía de despliegue detallada
```

## Características

- ✅ Datos en tiempo real de juegos de NFL desde ESPN API
- ✅ Pronósticos de IA generados por Claude (Anthropic)
- ✅ Análisis detallado de factores clave del juego
- ✅ Probabilidades de victoria para cada equipo
- ✅ Predicción de marcador final
- ✅ Interfaz moderna con Tailwind CSS
- ✅ Diseño responsivo

## Requisitos Previos

- Node.js (v18 o superior)
- pnpm

## Instalación

1. Instalar pnpm globalmente:
```bash
npm install -g pnpm
```

2. Instalar dependencias:
```bash
pnpm install
```

## Configuración de Variables de Entorno

### Frontend
Crea el archivo `packages/frontend/.env` (a partir de `.env.example`):
```bash
cp packages/frontend/.env.example packages/frontend/.env
```

Luego edita `packages/frontend/.env` y añade tus API keys:
```
VITE_RAPIDAPI_KEY=your_rapidapi_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

**IMPORTANTE**: No commits el archivo `.env` al repositorio. Para producción, configura las variables de entorno en Vercel.

## Desarrollo

### Ejecutar el frontend:
```bash
pnpm dev:frontend
```

El frontend estará disponible en `http://localhost:5173`

## API Endpoints (SvelteKit Server Functions)

- `GET /api/espn/games` - Obtener juegos de NFL desde ESPN API
- `POST /api/predictions` - Generar pronósticos de IA usando Claude
- `GET /api/nfl/games` - Obtener juegos de NFL (fallback a RapidAPI)

## Uso de la Aplicación

1. La aplicación carga automáticamente los juegos de NFL desde ESPN
2. Haz clic en el botón "Generate AI Predictions" para obtener análisis de Claude
3. Cada juego mostrará:
   - Marcador actual
   - Récord de los equipos
   - Pronóstico del ganador
   - Nivel de confianza
   - Análisis detallado
   - Factores clave
   - Probabilidades de victoria
   - Predicción de marcador

## Despliegue en Vercel

Para instrucciones detalladas, consulta [DEPLOYMENT.md](./DEPLOYMENT.md)

### Resumen rápido:

1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno:
   - `RAPIDAPI_KEY`
   - `VITE_RAPIDAPI_KEY`
   - `ANTHROPIC_API_KEY`
3. Despliega

## Tecnologías

- **Frontend**: SvelteKit, Tailwind CSS, TypeScript
- **Package Manager**: pnpm (workspace)
- **API de Datos**: ESPN API (pública)
- **API de IA**: Anthropic Claude
- **Fallback API**: RapidAPI
- **Deployment**: Vercel

## Seguridad

Este proyecto sigue las guardrails y reglas de seguridad definidas en [CLAUDE.md](./CLAUDE.md). Algunos puntos clave:

- Las API keys nunca se incluyen en el repositorio
- Las variables de entorno se manejan de forma segura
- Hay fallbacks implementados cuando APIs fallan
- Los datos del usuario no se almacenan
- HTTPS es obligatorio en producción

## Notas

- El proyecto está configurado como monorepo usando pnpm workspaces
- Tailwind CSS v4 está configurado en el frontend
- Las llamadas a APIs se hacen a través de API routes de SvelteKit
- ESPN API es pública y no requiere autenticación
- Claude API requiere una API key válida de Anthropic
