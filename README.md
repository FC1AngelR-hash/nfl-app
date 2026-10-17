# NFL App - Monorepo

Aplicación web para mostrar información de juegos de NFL usando Node.js, SvelteKit y Tailwind CSS. Los datos se obtienen de RapidAPI.

## Estructura del Proyecto

```
.
├── packages/
│   ├── frontend/     # SvelteKit + Tailwind CSS
│   └── backend/      # Node.js + Express
├── pnpm-workspace.yaml
├── package.json
├── vercel.json       # Configuración para Vercel
└── render.yaml       # Configuración para Render
```

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

### Backend
El archivo `packages/backend/.env.example` contiene el formato requerido. Para desarrollo local, copia este archivo a `.env` y añade tu API key:
```bash
cp packages/backend/.env.example packages/backend/.env
```

Luego edita `packages/backend/.env` y añade tu API key de RapidAPI:
```
RAPIDAPI_KEY=30c925180emsh95a1d1659b75fcep1213d1jsnc739b956f923
```

**IMPORTANTE**: No commits el archivo `.env` al repositorio. Para producción, configura la variable `RAPIDAPI_KEY` en la plataforma de despliegue (Vercel/Render).

### Frontend
Crea el archivo `packages/frontend/.env` (a partir de `.env.example`):
```bash
VITE_API_URL=http://localhost:3001
```

Para producción, actualiza `VITE_API_URL` con la URL del backend desplegado.

## Desarrollo

### Ejecutar ambos servicios (frontend y backend):
```bash
pnpm dev
```

### Ejecutar solo el frontend:
```bash
pnpm dev:frontend
```

### Ejecutar solo el backend:
```bash
pnpm dev:backend
```

El frontend estará disponible en `http://localhost:5173`
El backend estará disponible en `http://localhost:3001`

## API Endpoints

### Backend (Express)

- `GET /api/health` - Verificar estado del backend
- `GET /api/nfl/games?season=2024&league=1` - Obtener juegos de NFL
- `GET /api/nfl/game/:id` - Obtener detalles de un juego específico
- `GET /api/nfl/teams?league=1` - Obtener equipos de NFL

## Despliegue

### Vercel

1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno en Vercel:
   - `RAPIDAPI_KEY` (para el backend)
3. Despliega

### Render

1. Conecta tu repositorio a Render
2. Render leerá el archivo `render.yaml` automáticamente
3. Configura las variables de entorno en Render:
   - `RAPIDAPI_KEY` (para el backend)
4. Despliega

## Tecnologías

- **Frontend**: SvelteKit, Tailwind CSS, TypeScript
- **Backend**: Node.js, Express
- **Package Manager**: pnpm (workspace)
- **API**: RapidAPI (API-Football)

## Notas

- El proyecto está configurado como monorepo usando pnpm workspaces
- Tailwind CSS v4 está configurado en el frontend
- El backend sirve como proxy para las peticiones a RapidAPI
