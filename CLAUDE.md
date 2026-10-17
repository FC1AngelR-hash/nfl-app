# Guardrails y Reglas de Seguridad - NFL App

Este documento define las reglas de seguridad y guardrails que deben seguirse al trabajar en este proyecto.

## 🔐 Seguridad de Variables de Entorno

### Reglas Obligatorias

1. **Nunca incluir variables de entorno en el repositorio**
   - Los archivos `.env` nunca deben hacerse commit
   - Solo los archivos `.env.example` con placeholders deben estar en el repositorio
   - El archivo `.gitignore` debe incluir `*.env` y `.env.local`

2. **Variables de entorno sensibles**
   - `RAPIDAPI_KEY`: Solo debe existir en producción (Vercel) y desarrollo local
   - Nunca imprimir logs con información sensible
   - Usar `process.env` en el servidor, no `import.meta.env.VITE_*` para secrets

3. **Validación de variables de entorno**
   - Verificar que las variables de entorno necesarias existan antes de usarlas
   - Implementar fallbacks seguros cuando variables no estén disponibles
   - Documentar todas las variables de entorno requeridas en `.env.example`

## 🌐 Seguridad de API

### Reglas de Obligatorias

1. **Validación de inputs**
   - Validar todos los parámetros de entrada antes de pasarlos a APIs externas
   - Sanitizar datos de respuesta de APIs externas
   - Implementar rate limiting para prevenir abusos

2. **Manejo de errores**
   - Nunca exponer información detallada de errores al cliente
   - Logs de errores deben ser genéricos en producción
   - Implementar try-catch en todas las llamadas a APIs externas

3. **Fallbacks**
   - Siempre tener datos de ejemplo/fallback cuando APIs externas fallen
   - Implementar timeouts para llamadas a APIs externas
   - Manejar casos de error gracefully en la UI

## 🛡️ Seguridad del Código

### Reglas Obligatorias

1. **Dependencias**
   - Revisar dependencias regularmente por vulnerabilidades
   - Usar `pnpm audit` para detectar problemas de seguridad
   - Mantener dependencias actualizadas
   - Evitar dependencias con versiones recientes (< 7 días)

2. **Código**
   - No hardcodear credenciales o API keys en el código
   - No incluir código de debugging en producción (console.log, debugger)
   - Usar TypeScript para tipado estricto
   - Implementar validación de tipos en interfaces

3. **Svelte/SvelteKit**
   - Usar `$state()` para variables reactivas en Svelte 5
   - Validar props en componentes
   - No usar datos del usuario directamente en el DOM sin sanitización
   - Implementar proper error boundaries

## 📊 Seguridad de Datos

### Reglas Obligatorias

1. **Manejo de datos del usuario**
   - No almacenar datos personales sin consentimiento explícito
   - Implementar política de privacidad clara
   - Minimizar la recolección de datos

2. **Logs y Monitoreo**
   - No loggear información sensible (API keys, tokens, datos personales)
   - Implementar monitoreo de errores sin exponer detalles sensibles
   - Usar niveles de logging apropiados (info, warn, error)

## 🚀 Seguridad de Despliegue

### Reglas Obligatorias

1. **Variables de entorno en producción**
   - Configurar todas las variables de entorno necesarias en Vercel
   - Usar diferentes API keys para desarrollo y producción si es posible
   - Rotar API keys comprometidas inmediatamente

2. **HTTPS**
   - Siempre usar HTTPS en producción
   - Vercel proporciona HTTPS automático
   - No aceptar conexiones HTTP

3. **Configuración de Vercel**
   - Habilitar protección contra DDoS
   - Configurar límites de rate
   - Revisar configuración de headers de seguridad

## 🧪 Testing y Validación

### Reglas Obligatorias

1. **Testing de seguridad**
   - Probar el manejo de errores en API routes
   - Verificar que los datos mock funcionen cuando APIs fallen
   - Validar que no se exponga información sensible en errores

2. **Validación de funcionalidad**
   - Probar que la aplicación funcione sin API key (usando mock data)
   - Verificar que la UI maneje errores gracefully
   - Testear loading states y estados de error

## 📝 Comunicación

### Reglas Obligatorias

1. **Documentación**
   - Documentar todos los cambios de seguridad
   - Mantener README actualizado con información de seguridad
   - Documentar procedimientos de emergencia (API key comprometida, etc.)

2. **Colaboración**
   - Revisar pull requests buscando problemas de seguridad
   - No compartir credenciales a través de canales inseguros
   - Usar el skill `upload-secrets` para gestionar secrets de forma segura

## ⚠️ Procedimientos de Emergencia

### Si una API key es comprometida:

1. Rotar la API key inmediatamente en RapidAPI
2. Actualizar la variable de entorno en Vercel
3. Notificar al equipo si el proyecto es colaborativo
4. Revisar logs para detectar uso malicioso
5. Implementar medidas adicionales de seguridad si es necesario

### Si hay una vulnerabilidad de seguridad:

1. Reportar inmediatamente
2. Implementar parche de seguridad
3. Desplegar fix de emergencia
4. Documentar el incidente
5. Revisar código similar por problemas relacionados

## 🎯 Checklist Antes de Deploy

- [ ] Variables de entorno configuradas en Vercel
- [ ] No hay datos sensibles en el código
- [ ] `.env` files están en `.gitignore`
- [ ] Dependencias actualizadas y sin vulnerabilidades
- [ ] Error handling implementado correctamente
- [ ] Mock data funciona como fallback
- [ ] No hay console.log o código de debugging
- [ ] HTTPS habilitado
- [ ] README actualizado con información de seguridad

## 📚 Recursos

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [SvelteKit Security](https://kit.svelte.dev/docs/security)
- [Vercel Security Best Practices](https://vercel.com/docs/security)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)

---

**Última actualización**: 2026-10-17
**Versión**: 1.0.0
