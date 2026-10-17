# Guía de Despliegue en Vercel

## Paso 1: Crear Repositorio en GitHub

1. Ve a [github.com](https://github.com) e inicia sesión
2. Haz clic en el botón "+" en la esquina superior derecha
3. Selecciona "New repository"
4. Completa los campos:
   - **Repository name**: nfl-app (o el nombre que prefieras)
   - **Description**: NFL app with SvelteKit and RapidAPI
   - Marca "Public" o "Private" según tu preferencia
5. Haz clic en "Create repository"

## Paso 2: Subir tu Código a GitHub

En tu terminal, ejecuta los siguientes comandos (reemplaza `TU_USUARIO` con tu nombre de usuario de GitHub):

```bash
# Agrega el remoto (reemplaza con tu URL)
git remote add origin https://github.com/TU_USUARIO/nfl-app.git

# Cambia el nombre de la rama a main
git branch -M main

# Sube el código
git push -u origin main
```

Si te pide credenciales, inicia sesión en GitHub cuando el navegador se abra.

## Paso 3: Desplegar en Vercel

### 3.1 Conectar Cuenta

1. Ve a [vercel.com](https://vercel.com)
2. Haz clic en "Sign Up" o "Log In"
3. Elige "Continue with GitHub" para conectar tu cuenta de GitHub

### 3.2 Importar Repositorio

1. En el dashboard de Vercel, haz clic en "Add New Project"
2. En la sección "Import Git Repository", busca tu repositorio `nfl-app`
3. Haz clic en "Import"

### 3.3 Configurar el Proyecto

Vercel detectará automáticamente que es un proyecto SvelteKit. Configura lo siguiente:

**Framework Preset**: SvelteKit (debería detectarse automáticamente)

**Root Directory**: Deja el valor por defecto o asegúrate que sea `packages/frontend`

**Build Command**: `pnpm install && pnpm build`

**Output Directory**: `.svelte-kit/output`

**Install Command**: `pnpm install`

Haz clic en "Configure Project" o continúa con los valores por defecto.

### 3.4 Configurar Variables de Entorno

**IMPORTANTE**: Antes de desplegar, debes configurar la API key:

1. Después de configurar el proyecto, ve a la sección "Environment Variables"
2. Haz clic en "Add New"
3. Añade las siguientes variables:

   **Variable 1:**
   - **Name**: `RAPIDAPI_KEY`
   - **Value**: `30c925180emsh95a1d1659b75fcep1213d1jsnc739b956f923`
   - **Environment**: Selecciona "Production", "Preview" y "Development"

   **Variable 2:**
   - **Name**: `VITE_RAPIDAPI_KEY`
   - **Value**: `30c925180emsh95a1d1659b75fcep1213d1jsnc739b956f923`
   - **Environment**: Selecciona "Production", "Preview" y "Development"

4. Haz clic en "Add" para cada variable

### 3.5 Desplegar

1. Haz clic en el botón "Deploy"
2. Vercel comenzará a construir tu proyecto
3. Espera a que termine (puede tomar 1-3 minutos)
4. Cuando termine, verás un mensaje de éxito con una URL

## Paso 4: Verificar el Despliegue

1. Haz clic en la URL proporcionada (ej: `https://nfl-app.vercel.app`)
2. Deberías ver la aplicación de NFL funcionando
3. Verifica que los datos de los juegos se carguen correctamente

## Paso 5: Configurar Dominio Personal (Opcional)

Si quieres usar tu propio dominio:

1. En el dashboard de Vercel, selecciona tu proyecto
2. Ve a "Settings" → "Domains"
3. Haz clic en "Add Domain"
4. Ingresa tu dominio (ej: `nfl.tudominio.com`)
5. Sigue las instrucciones para configurar los DNS

## Troubleshooting

### Error: "RAPIAPI_KEY is not defined"

- Asegúrate de haber configurado las variables de entorno en Vercel
- Verifica que los nombres sean exactamente `RAPIDAPI_KEY` y `VITE_RAPIDAPI_KEY`
- Intenta redeployar después de configurar las variables

### Error: Build failed

- Verifica que el `Build Command` sea: `pnpm install && pnpm build`
- Asegúrate de que el `Root Directory` sea `packages/frontend`
- Revisa los logs de build en Vercel para más detalles

### Los datos no se cargan

- Verifica que la API key sea correcta
- Revisa los logs de la aplicación en Vercel (Functions tab)
- Asegúrate de que las variables de entorno estén configuradas en todos los entornos

## Actualizaciones Futuras

Para actualizar tu aplicación después de hacer cambios:

1. Haz commit de tus cambios:
   ```bash
   git add .
   git commit -m "Tu mensaje de commit"
   git push
   ```

2. Vercel detectará automáticamente el push y redeployará tu aplicación

## Links Útiles

- [Documentación de Vercel](https://vercel.com/docs)
- [Documentación de SvelteKit](https://kit.svelte.dev/docs)
- [Documentación de pnpm](https://pnpm.io)
