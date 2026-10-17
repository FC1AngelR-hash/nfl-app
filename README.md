# NFL App - Monorepo

Aplicación web para mostrar información de juegos de NFL usando SvelteKit y Tailwind CSS. Los datos se obtienen de RapidAPI a través de API routes de SvelteKit.

## Estructura del Proyecto

```
.
├── packages/
│   ├── frontend/     # SvelteKit + Tailwind CSS + API Routes
│   └── backend/      # Node.js + Express (opcional, para referencia)
├── pnpm-workspace.yaml
├── package.json
└── vercel.json       # Configuración para Vercel
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

### Frontend
Crea el archivo `packages/frontend/.env` (a partir de `.env.example`):
```bash
cp packages/frontend/.env.example packages/frontend/.env
```

Luego edita `packages/frontend/.env` y añade tu API key de RapidAPI:
```
VITE_RAPIDAPI_KEY=30c925180emsh95a1d1659b75fcep1213d1jsnc739b956f923
```

**IMPORTANTE**: No commits el archivo `.env` al repositorio. Para producción, configura la variable de entorno en Vercel.

## Desarrollo

### Ejecutar el frontend:
```bash
pnpm dev:frontend
```

El frontend estará disponible en `http://localhost:5173`

## API Endpoints (SvelteKit Server Functions)

- `GET /api/nfl/games?season=2024&league=1` - Obtener juegos de NFL

## Despliegue en Vercel

### Paso 1: Preparar el Repositorio en GitHub

1. Crea un nuevo repositorio en GitHub
2. Sube tu código:

```bash
# Si no has inicializado git:
git init
git add .
git commit -m "Initial commit"

# Agrega el remoto (reemplaza con tu URL):
git remote add origin https://github.com/tu-usuario/nfl-app.git
git branch -M main
git push -u origin main
```

### Paso 2: Desplegar en Vercel

1. Ve a [vercel.com](https://vercel.com) e inicia sesión
2. Haz clic en "Add New Project"
3. Importa tu repositorio de GitHub
4. Configura el proyecto:
   - **Framework Preset**: SvelteKit
   - **Root Directory**: `packages/frontend`
   - **Build Command**: `pnpm install && pnpm build`
   - **Output Directory**: `.svelte-kit/output`

5. **Configura las variables de entorno**:
   - Ve a "Settings" → "Environment Variables"
   - Añade: `RAPIDAPI_KEY` con el valor: `30c925180emsh95a1d1659b75fcep1213d1jsnc739b956f923`
   - También puedes añadir `VITE_RAPIDAPI_KEY` con el mismo valor

6. Haz clic en "Deploy"

### Paso 3: Verificar el Despliegue

- Vercel te proporcionará una URL como `https://nfl-app.vercel.app`
- Visita la URL para verificar que la aplicación funciona

## Tecnologías

- **Frontend**: SvelteKit, Tailwind CSS, TypeScript
- **Package Manager**: pnpm (workspace)
- **API**: RapidAPI (API-Football)
- **Deployment**: Vercel

## Notas

- El proyecto está configurado como monorepo usando pnpm workspaces
- Tailwind CSS v4 está configurado en el frontend
- Las llamadas a RapidAPI se hacen a través de API routes de SvelteKit (server functions)
- No se requiere un backend Express separado para el despliegue en Vercel
