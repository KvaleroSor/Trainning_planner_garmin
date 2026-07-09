# Training Planner — Agent Rules

## Producto

Training Planner es una app multisport para atletas y misteres/coach verificados. La demo estática validó el flujo; esta rama crea la base real Next.js + backend.

## Stack objetivo

- Next.js App Router + TypeScript
- Tailwind CSS
- Prisma + PostgreSQL en producción
- SQLite solo para desarrollo local/prototipo backend
- Auth.js / NextAuth
- Tests con Vitest para dominio/permisos

## Estilo visual obligatorio

Mantener el gusto ya validado con K:

- estética premium pastel, fresca y limpia;
- fondo blanco roto/crema;
- acentos sky, mint, butter, rose y lilac;
- sombras suaves y sistemáticas;
- tarjetas amplias, legibles y sin desbordes;
- móvil primero para Mister: roster de atletas y stats rápidas arriba;
- nada de neón, cyberpunk, gradientes agresivos ni paneles oscuros dominantes.

## Seguridad / permisos

- La vista Mister nunca se protege solo con frontend.
- Las rutas y acciones coach requieren `COACH_VERIFIED` en servidor.
- Los coach solo pueden ver/editar atletas vinculados por `CoachAthleteRelation`.
- Registrar auditoría para verificación de coaches, relaciones y edición de planes.
- Garmin real requiere OAuth/consentimiento y tokens cifrados; nada de credenciales Garmin del usuario en cliente.

## Desarrollo

- Preservar la demo estática en `prototype/static-v2/` si se mueve.
- Tests antes de lógica de dominio nueva.
- Ejecutar `npm test`, `npm run typecheck` y `npm run build` antes de declarar terminado.
- No commitear `.env`, bases locales ni `.next/`.
