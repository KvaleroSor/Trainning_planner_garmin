# Training Planner — perfil físico, zonas y planificación semanal IA

## Decisión de producto

El usuario/atleta debe poder introducir sus condiciones físicas y objetivos para que la IA genere o ajuste planes semanales con contexto real.

La planificación se plantea como un ciclo semanal:

```text
Domingo
↓
J.A.R.V.I.S. revisa semana anterior + Garmin + feedback subjetivo
↓
Propone semana siguiente
↓
Atleta/coach aprueba o ajusta
↓
Plan queda publicado en calendario
```

## Perfil físico del atleta

### Datos generales

```text
nombre
edad
peso opcional
altura opcional
deporte principal
nivel declarado
fecha de inicio
objetivo principal
fecha objetivo
```

### Ciclismo

Campos específicos:

```text
FTP actual
fecha de último test FTP
zonas de potencia
zonas de frecuencia cardíaca
horas disponibles por semana
días disponibles
días no disponibles
tipo de bici / rodillo / exterior
potenciómetro sí/no
pulsómetro sí/no
sensación de fatiga habitual
historial de lesiones/molestias
```

### Potencia: zonas típicas basadas en FTP

Estas zonas pueden calcularse automáticamente si el usuario mete FTP:

```text
Z1 Recuperación       <55% FTP
Z2 Resistencia        56–75% FTP
Z3 Tempo              76–90% FTP
Z4 Umbral             91–105% FTP
Z5 VO2max             106–120% FTP
Z6 Anaeróbica         121–150% FTP
Z7 Neuromuscular      >150% FTP
```

Debe permitirse editar manualmente porque cada entrenador puede usar modelos distintos.

### Frecuencia cardíaca

Opciones:

1. Zonas manuales.
2. Calcular por FC máxima.
3. Calcular por umbral/lactato si el usuario lo conoce.
4. Importar/estimar desde Garmin más adelante.

Campos:

```text
FC máxima
FC reposo
FC umbral opcional
Z1-Z5 personalizadas
```

## Objetivos

Ejemplos:

```text
Mejorar FTP
Preparar marcha cicloturista
Perder peso manteniendo rendimiento
Crear base aeróbica
Volver tras parón
Preparar carrera de 10K
Mantener forma general
```

Campos objetivo:

```text
tipo_objetivo
fecha_objetivo
prioridad: rendimiento / salud / consistencia / pérdida peso / competición
volumen semanal deseado
volumen máximo tolerable
restricciones
```

## Feedback post-entreno

Después de cada entrenamiento el usuario puede indicar:

```text
RPE 1–10
fatiga 1–10
sueño 1–10
dolor/molestias sí/no
descripción molestias
comentarios libres
```

Esto se combina con Garmin:

```text
duración real
potencia media/normalizada
FC media/máxima
cadencia
TSS/carga si disponible
calorías
altitud/desnivel
```

## Ciclo semanal de IA

### Cada domingo

La IA debe generar:

```text
Resumen de semana anterior
Cumplimiento planificado vs realizado
Alertas de fatiga/sobrecarga
Propuesta de semana siguiente
Explicación de por qué propone ese plan
Riesgos y alternativas
```

### Prompt base conceptual

```text
Eres un asistente de planificación deportiva. Usa el perfil del atleta, sus zonas, disponibilidad, objetivo y datos de la semana anterior para proponer una semana de entrenamiento conservadora y razonada. No des diagnóstico médico. Si hay dolor, fatiga alta o señales de sobrecarga, reduce carga y recomienda consultar a profesional si persiste.
```

## Ejemplo para K — ciclismo

Input:

```text
Deporte: ciclismo
FTP: 240 W
Potenciómetro: sí
Pulsómetro: sí
Disponibilidad: martes, jueves, sábado, domingo
Objetivo: mejorar FTP y fondo
Restricción: no más de 6h/semana
Semana anterior: 4h completadas, fatiga 5/10, sin molestias
```

Output esperado:

```text
Martes: Z2 60 min
Jueves: Sweet Spot 3x10 min al 88–92% FTP
Sábado: Fondo Z2 2h
Domingo: Recuperación activa 45 min o descanso si fatiga >7
```

Con explicación:

```text
Mantenemos volumen moderado, introducimos un estímulo de umbral bajo y priorizamos consistencia.
```

## Seguridad deportiva

Reglas:

- No aumentar volumen semanal más de forma agresiva.
- Si fatiga ≥8 o dolor reportado: reducir carga.
- Si sueño bajo varios días: evitar intensidad.
- Si el atleta no completó varias sesiones: no compensar acumulando todo.
- Si hay lesión/enfermedad: recomendar profesional.

## MVP recomendado

### Sprint IA 1

Sin conexión Garmin real:

- formulario de perfil físico,
- FTP y zonas calculadas,
- objetivos,
- disponibilidad semanal,
- botón “Generar semana demo”,
- salida explicada.

### Sprint IA 2

Con datos simulados/importados:

- actividad Garmin demo,
- comparación plan vs realizado,
- ajuste automático de semana siguiente.

### Sprint IA 3

Con Garmin real si API viable:

- ingestión semanal automática,
- revisión dominical,
- propuesta de calendario,
- aprobación del coach/atleta.

## Producto diferencial

```text
No es solo calendario.
Es un entrenador asistido por IA que entiende tus zonas, tu disponibilidad y lo que realmente hiciste.
```
