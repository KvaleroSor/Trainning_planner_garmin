# Proyecto: Training Planner Garmin

## Backend Next.js foundation

Rama de trabajo:

```text
feat/next-backend-foundation
```

Stack inicial:

```text
Next.js App Router + TypeScript + Tailwind CSS
Prisma + SQLite local / PostgreSQL producción
Auth.js / NextAuth Credentials preparado
Vitest para dominio/permisos
```

Comandos:

```bash
npm install
cp .env.example .env
npx prisma db push
npm run db:seed
npm run dev
```

Verificación:

```bash
npm run lint
npm test
npm run typecheck
npm run build
```

Rutas iniciales:

```text
/           landing pastel premium
/login      login demo/Auth-ready
/dashboard  dashboard seed desde Prisma
```

La demo estática pública sigue en `main`/GitHub Pages mientras la base real se trabaja en esta rama para no romper feedback móvil.

Feedback y arquitectura recogidos en:

```text
ARCHITECTURE.md
docs/coach-feedback-2026-07.md
docs/product-audit-claude-2026-07.md
```

Importante: la demo estática de GitHub Pages es solo prototipo/review. No debe usarse con datos reales de atletas hasta tener auth server-side, permisos coach-atleta y persistencia backend.


## Nombre provisional

```text
Training Planner
```

Alternativas:

- PulsePlan
- Endurance OS
- PlanFit Calendar
- FlowTraining
- Training Mix Calendar

## Tesis

Una app tipo TrainingPeaks, pero más sencilla, clara y minimalista: calendario como centro del producto, entrenamientos por día, lectura rápida de carga y posibilidad de conectar con Garmin para importar sesiones realizadas.

No queremos empezar con una superplataforma de alto rendimiento. Queremos una primera versión usable:

```text
Calendario + entrenamiento diario + estado + resumen semanal
```

## Público objetivo inicial

- Personas que entrenan carrera, bici, gimnasio o mezcla.
- Usuarios con reloj Garmin que quieren ver planificación simple.
- Deportistas amateur que no necesitan TrainingPeaks completo.
- Usuarios que quieren claridad antes que mil métricas.

## MVP funcional

### Pantallas

1. Dashboard semanal.
2. Calendario mensual/semanal.
3. Detalle de día.
4. Crear entrenamiento.
5. Estado de entrenamiento:
   - planificado,
   - completado,
   - saltado,
   - importado de Garmin.
6. Resumen semanal:
   - minutos planificados,
   - minutos completados,
   - carga subjetiva,
   - consistencia.

### Entrenamiento por día

Campos iniciales:

```text
fecha
tipo: carrera / bici / fuerza / movilidad / descanso
título
duración objetivo
intensidad
notas
estado
fuente: manual / garmin
```

## Garmin: realidad técnica

### Opción oficial

Garmin tiene APIs oficiales como Garmin Health API / Activity API, pero suelen requerir:

- registro de app,
- aprobación de Garmin,
- caso de uso válido,
- términos de uso,
- posible proceso business/partner.

Ventaja:

```text
estable, legal, presentable
```

Desventaja:

```text
más lenta de conseguir
```

### Opción práctica para prototipo

Para demo/MVP temprano:

1. Exportar actividades de Garmin como `.fit`, `.tcx`, `.gpx` o `.csv`.
2. Importarlas manualmente.
3. Simular conexión Garmin con JSON local.
4. Más adelante, integración real si hay validación.

### Opción no recomendada para producto serio

Librerías no oficiales tipo scraping de Garmin Connect.

Problemas:

- pueden romperse,
- pueden incumplir términos,
- pueden requerir credenciales de usuario,
- mala idea para app pública.

## Monetización candidata

### Freemium

Gratis:

- calendario básico,
- 7–14 días de planificación,
- entrenamientos manuales.

Pro 4,99–9,99 €/mes:

- planificación ilimitada,
- importación Garmin,
- resumen semanal avanzado,
- plantillas,
- IA sugerida para ajustar sesiones.

## Legal / salud

La app debe hablar en términos de sugerencias:

```text
Esto no sustituye asesoramiento profesional médico/deportivo.
```

Especialmente si en el futuro recomienda cargas, nutrición o ajustes de intensidad.

## Dirección visual

- Minimalista.
- Fondo claro.
- Calendario central.
- Tarjetas limpias.
- Colores por tipo de entrenamiento, no chillones.
- Mucho espacio blanco.
- Sensación premium/productividad, no gimnasio agresivo.

## Primer prototipo creado

```text
prototype.html
```

Objetivo:

- demostrar calendario,
- selección de día,
- entrenamiento por día,
- resumen semanal,
- idea de Garmin conectado/simulado.

## PWA funcional v2.3

Deploy móvil/demo público:

```text
https://kvalerosor.github.io/Trainning_planner_garmin/
```

```text
app.html
styles.css
app.js
manifest.webmanifest
sw.js
icon.svg
```

Incluye:

- login local de demo,
- selector vista Atleta / Mister Admin,
- soporte multi-deporte: ciclismo, running, natación, fuerza, triatlón, movilidad,
- perfil físico editable,
- FTP y zonas de potencia para ciclismo,
- zonas de FC para running/natación/triatlón si hay FC máx,
- zonas RPE para fuerza,
- calendario mensual editable con días desplazables si hay varias sesiones,
- resumen inteligente semanal con plan/hecho/cumplimiento/pendientes,
- creación manual de entrenamientos desde Mister,
- gestión de entrenos del día: completar, saltar o borrar,
- actividad Garmin demo,
- análisis post-entreno para atleta y mister,
- botón “Generar semana IA demo” con reglas locales,
- selector de calendario Mes/Semana,
- feedback post-entreno por día: RPE, fatiga, sueño, molestias y comentario,
- panel de plan IA con explicación sesión a sesión,
- edición de entrenamientos existentes desde el panel Mister,
- plantillas rápidas por deporte,
- historial semanal agrupado por deporte con lectura diferente para atleta/mister,
- panel “Hoy” para el atleta con sesión principal, carga del día, RPE, sueño y fatiga,
- alertas para mister/admin: fatiga alta, sueño bajo, entrenos saltados, sobrecumplimiento y bajo cumplimiento,
- acción “Duplicar semana” para copiar entrenos planificados a la semana siguiente,
- microciclo semanal visual con días de descanso/base/intensidad/carga alta,
- plantillas por deporte ampliadas: ciclismo, running, natación, fuerza, triatlón y movilidad,
- análisis Garmin visual con semáforo de cumplimiento plan vs real, diferencia de minutos y lectura atleta/mister,
- refinado visual a paleta pastel suave, menos neón y más premium,
- menú interno para separar Dashboard, Perfil, Estadísticas y Garmin/Análisis,
- dashboard principal reducido a calendario, microciclo, panel Hoy y gestión del día,
- paleta pastel minimalista fresca sin degradados en botones,
- calendario sin scrollbars internas en los días: tarjetas más anchas, texto con puntos suspensivos,
- modal popup de detalle al pulsar un día concreto del calendario o microciclo,
- panel lateral de “Día seleccionado” eliminado del dashboard para evitar redundancia,
- botón “Ver detalle del día” en Panel Hoy y tarjeta compacta de acceso rápido,
- responsive v1.9: calendario horizontal cómodo en móvil/tablet, menú compacto y modal adaptado,
- sistema de sombras suaves en paneles, tarjetas, días, botones y modales para dar profundidad sin oscurecer la estética pastel,
- centro de mando Mister con selección de atletas, métricas por atleta y acciones rápidas de semana,
- alta rápida de atletas desde la vista Mister,
- guardia demo de acceso Mister con explicación del modelo real de verificación server-side,
- landing page pública con CTA hacia login,
- calendario móvil vertical sin scroll horizontal, con días más anchos que altos e indicadores sutiles de actividad,
- calendario móvil reorganizado con día de la semana, número alineado a la izquierda, resumen centrado y botón “Abrir” a la derecha,
- vista Mes en móvil recuperada como calendario 7 columnas con estilo propio y punto sutil en días con actividad,
- tarjeta semanal sustituye al microciclo: totales de carga y tira de días de la semana marcando el día seleccionado,
- estadísticas personales ampliadas/editables: peso, altura y FC reposo,
- panel “Conexión Garmin” con conexión demo y nota de integración OAuth/API real.

Notas:

- El login actual es local/demo con `localStorage`; no es seguridad real.
- La IA actual es simulada/reglada; preparada para sustituirse por agente/modelo real.
- Garmin actual es demo/importación simulada; preparada la lógica para actividad real.

## Siguiente paso técnico

Se ha añadido una propuesta de roles, capa IA, perfil físico del atleta y análisis post-entreno Garmin en:

```text
roles-ai-plan.md
athlete-profile-weekly-ai.md
garmin-post-workout-analysis.md
backend-plan.md
```

Decisión recomendada:

```text
Atleta → ve y registra
Coach/Admin → crea y ajusta manualmente
IA/J.A.R.V.I.S. → propone entrenamientos y ajustes, con aprobación humana
```

Si K aprueba dirección visual:

1. Convertir a PWA funcional.
2. Guardar entrenamientos en localStorage.
3. Permitir crear/editar entrenamiento.
4. Importar archivo `.fit/.tcx/.gpx` como primer paso antes de Garmin real.
5. Valorar Next.js/Expo si el producto merece continuar.
