# Feedback de entrenador — julio 2026

Fuente: revisión móvil del prototipo público Training Planner.

## Señales positivas

- El entrenador entiende qué toca entrenar, aunque el acceso al entrenamiento del día debe ser mucho más directo.
- El calendario mensual/semanal se percibe útil para planificación y revisión.
- La vista Mister tiene valor para gestionar varios atletas.
- Garmin/sincronización automática se considera imprescindible.
- Si es estable, rápida y aporta análisis real, hay disposición a pagar.

## Cambios UX prioritarios

### 1. Entrenamiento de hoy como entrada principal

Problema observado:

- Ahora el entrenamiento del día puede quedar demasiado abajo en el dashboard.

Decisión de producto:

- Añadir pestaña/sección específica `Entrenamiento de hoy`.
- Debe estar disponible nada más entrar.
- El dashboard queda como resumen general.

Contenido mínimo de `Entrenamiento de hoy`:

- objetivo de la sesión,
- estructura/bloques,
- zonas,
- duración,
- notas del coach,
- estado y feedback post-entreno.

### 2. Vista Mister como lista → ficha de atleta

Problema observado:

- No mezclar gestión (`Añadir atleta`) con seguimiento (`resumen de carga`, `panel del día`) en la misma pantalla.

Decisión de producto:

- Vista Mister principal = listado de atletas en formato lista.
- Al pulsar atleta → ficha individual del atleta.
- Dentro de ficha: seguimiento, comparación planificado vs realizado, calendario, acciones de planificación.

### 3. Comparación planificado vs realizado como valor central

Debe ser una funcionalidad core para el entrenador.

Métricas deseadas:

- duración planificada vs real,
- ritmo/km,
- frecuencia cardíaca,
- potencia,
- cadencia,
- mapa del recorrido,
- vueltas/splits,
- evolución de métricas principales.

### 4. Récords personales automáticos

Nueva sección candidata:

- kilómetro más rápido,
- 5K / 10K / media maratón / maratón más rápidas,
- marcas de ciclismo por potencia/tiempo,
- récords por deporte.

Deben actualizarse automáticamente con actividades sincronizadas.

### 5. Competiciones y estrategia de carrera

Permitir agendar competiciones en calendario.

Ficha de competición:

- ritmos objetivo,
- zonas FC/potencia,
- nutrición,
- hidratación,
- material recomendado,
- observaciones del entrenador.

## Implicaciones para backend

Añadir/planificar entidades:

```text
TodaySessionView / derived query
AthleteDashboard
Competition
RaceStrategy
PersonalRecord
ActivitySplit
ActivityRoute
ActivityMetricSample
PlannedVsActualAnalysis
```

Prioridad backend próxima:

1. Auth real + usuario actual.
2. Coach roster como lista.
3. Ficha de atleta protegida por relación coach-atleta.
4. Workouts + GarminActivity con comparación planificado vs realizado.
5. Today Session page.
6. Competitions/RaceStrategy.
7. PersonalRecords derivados de actividades.

## Criterio de producto

Mantener interfaz sencilla, limpia y rápida. Priorizar información importante y no acumular paneles mezclados.
