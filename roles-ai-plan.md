# Training Planner — roles Coach/Admin, Atleta e IA

## Decisión de producto

El producto debería nacer con tres capas claras:

```text
Atleta       → ve, ejecuta y reporta sensaciones
Coach/Admin  → planifica y ajusta entrenamientos
IA/J.A.R.V.I.S. → propone, resume y ayuda, pero no reemplaza criterio humano
```

Esto permite empezar manual y añadir IA sin rehacer la arquitectura.

## Vista atleta

Objetivo: que el entrenado entienda qué toca hoy y qué ha hecho.

### Pantallas

- Hoy.
- Calendario semanal/mensual.
- Detalle de entrenamiento.
- Registro post-entreno.
- Progreso semanal.

### Acciones

- Ver entrenamiento del día.
- Marcar como completado/saltado.
- Añadir sensaciones:
  - RPE 1–10,
  - sueño,
  - fatiga,
  - dolor/molestias,
  - nota libre.
- Ver actividad importada de Garmin.
- Comparar planificado vs realizado.

## Vista Coach/Admin

Objetivo: crear, revisar y ajustar planes.

### Pantallas

- Panel de atletas.
- Calendario por atleta.
- Constructor de entrenamientos.
- Biblioteca de plantillas.
- Resumen de cumplimiento.
- Alertas:
  - fatiga alta,
  - entrenamientos saltados,
  - exceso de carga,
  - molestias reportadas.

### Acciones

- Crear entrenamiento manual.
- Duplicar semana.
- Mover sesiones.
- Crear bloques:
  - base,
  - carga,
  - descarga,
  - competición.
- Revisar feedback del atleta.
- Aprobar o modificar sugerencias de IA.

## Capa IA / J.A.R.V.I.S.

### Fase 1 — Asistente copiloto

La IA no crea planes automáticamente sin revisión. Propone.

Ejemplos:

```text
Crea una semana de base para carrera 10K, 4 días, nivel principiante.
```

```text
Ajusta la semana porque el atleta ha reportado fatiga 8/10 y se saltó el rodaje del martes.
```

```text
Resume la semana y dime si hay señales de sobrecarga.
```

### Fase 2 — Generador de microciclos

Inputs:

- objetivo,
- fecha de carrera,
- nivel,
- disponibilidad semanal,
- historial,
- lesiones/molestias,
- actividad Garmin.

Output:

- semana propuesta,
- explicación,
- riesgos,
- alternativas.

### Fase 3 — Ajuste adaptativo

La IA adapta sugerencias según:

- cumplimiento,
- RPE,
- sueño/fatiga,
- cargas Garmin,
- molestias,
- proximidad a objetivo.

## Regla de seguridad

La IA debe hablar como orientación deportiva, no diagnóstico médico.

```text
No sustituye a entrenador, médico o fisioterapeuta.
```

Para molestias, dolor o fatiga alta:

```text
reducir carga y consultar profesional si persiste
```

## Modelo MVP recomendado

### Sprint 1

- PWA local.
- Vista atleta.
- Vista coach/admin manual.
- Entrenamientos en localStorage.
- Cambio de rol desde UI.

### Sprint 2

- Biblioteca de plantillas.
- Duplicar semana.
- Registro RPE/fatiga.
- Garmin simulado/importación manual.

### Sprint 3

- IA copiloto:
  - generar semana,
  - ajustar entrenamiento,
  - resumir cumplimiento.

## Producto final aspiracional

```text
Training Planner = TrainingPeaks sencillo + coach dashboard + IA copiloto + Garmin
```

La clave es no vender “IA que entrena personas” sino:

```text
IA que ayuda a planificar y revisar, manteniendo control humano.
```
