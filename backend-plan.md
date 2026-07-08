# Training Planner — plan de salto a backend real

## Cuándo migrar

Migrar desde PWA local a stack real cuando la experiencia Atleta/Mister esté suficientemente clara.

## Stack recomendado

```text
Next.js App Router
Tailwind CSS
TypeScript
Prisma
PostgreSQL
Auth.js / NextAuth
Vitest
```

## Modelos iniciales

```text
User
CoachProfile
AthleteProfile
CoachAthleteRelation
SportProfile
TrainingPlan
Workout
WorkoutActivity
GarminActivity
WorkoutAnalysis
WeeklyReview
AuditLog
```

## Roles

```text
ATHLETE
COACH_PENDING
COACH_VERIFIED
ADMIN
```

## Verificación de Mister

En producción la vista Mister **no debe depender del frontend**. Propuesta:

```text
CoachProfile
- id
- userId
- status: PENDING | VERIFIED | REJECTED
- verifiedAt
- verifiedByAdminId
- organizationName
- licenseOrCredentialUrl opcional
```

Flujo recomendado:

1. El usuario solicita perfil Mister.
2. Sube datos mínimos: nombre, organización/club, acreditación opcional.
3. Estado inicial `COACH_PENDING`.
4. Un admin revisa y pasa a `COACH_VERIFIED`.
5. Middleware server-side protege `/coach/*` y APIs de edición.
6. Las relaciones `CoachAthleteRelation` limitan qué atletas puede ver/editar cada mister.
7. `AuditLog` registra cambios de planes, atletas y permisos.

Regla práctica: ocultar botones en frontend ayuda a UX, pero **la seguridad real vive en servidor**.


## Permisos mínimos

- Atleta puede ver/editar su perfil y feedback.
- Atleta puede marcar entrenos completados/saltados.
- Coach puede crear/editar entrenos de sus atletas.
- Coach puede revisar análisis y aprobar propuestas IA.
- Admin gestiona usuarios/organización.

## Integraciones futuras

### Garmin

Fase 1:

```text
Importación manual .fit/.tcx/.gpx/.csv
```

Fase 2:

```text
Garmin Activity API oficial
```

### IA

Fase 1:

```text
Reglas locales + prompts mock
```

Fase 2:

```text
Generación de microciclo vía modelo IA
```

Fase 3:

```text
Revisión dominical automática con aprobación humana
```

## Primer hito backend

1. Login real.
2. Crear atleta.
3. Crear perfil deportivo.
4. Crear entrenamiento.
5. Ver calendario persistente.
6. Asociar coach-atleta.
7. Tests de permisos.

## Regla de seguridad

No construir recomendaciones automáticas sin:

- historial suficiente,
- límites de carga,
- aviso de no sustitución médica/deportiva,
- control humano para cambios importantes.
