# Training Planner — análisis post-entrenamiento Garmin

## Objetivo

Cuando una actividad se sincronice desde Garmin, debe aparecer automáticamente en la app como entrenamiento realizado y vincularse con el entrenamiento planificado del calendario.

El análisis debe servir para dos perfiles:

```text
Atleta → entender cómo fue el entreno y registrar sensaciones
Mister/Admin → revisar cumplimiento, carga y señales de riesgo
```

## Flujo ideal

```text
Entrenamiento planificado en calendario
↓
Atleta entrena con Garmin
↓
Garmin Connect recibe actividad
↓
Nuestra app importa actividad
↓
Se vincula por fecha/tipo/duración al entrenamiento planificado
↓
Se muestra análisis post-entreno
↓
IA/J.A.R.V.I.S. resume y sugiere ajustes si procede
```

## Vinculación planificado vs realizado

La app debe intentar enlazar actividad Garmin con sesión planificada usando:

```text
fecha
hora aproximada
tipo de deporte
duración esperada vs real
título si coincide
```

Estados posibles:

```text
PLANIFICADO
REALIZADO_VINCULADO
REALIZADO_NO_PLANIFICADO
PLANIFICADO_NO_REALIZADO
REALIZADO_PARCIAL
```

## Estadísticas para usuario atleta

Vista simple, clara y motivadora.

### Resumen principal

```text
duración real
distancia
desnivel positivo
potencia media
potencia normalizada si disponible
frecuencia cardíaca media
frecuencia cardíaca máxima
cadencia media
calorías
velocidad media
ritmo medio si carrera
```

### Comparación con el plan

```text
duración planificada vs real
zona objetivo vs zona real
tiempo en zonas de potencia
tiempo en zonas FC
cumplimiento %
RPE declarado
sensación final
```

### Mensaje IA para atleta

Ejemplo:

```text
Buen cumplimiento: completaste el 94% de la duración prevista y mantuviste la mayor parte del trabajo en Z2. La frecuencia cardíaca fue algo elevada para la potencia desarrollada, posible señal de fatiga, calor o falta de recuperación.
```

## Estadísticas para Mister/Admin

Vista más analítica.

### Métricas de carga

```text
TSS si disponible o estimado
IF - Intensity Factor
NP - Normalized Power
VI - Variability Index
Pw:HR / desacople cardíaco si se puede calcular
carga semanal acumulada
ratio carga completada vs planificada
```

### Señales relevantes

```text
cumplimiento de zonas
exceso de intensidad
fatiga acumulada
entrenamientos saltados
picos de FC anómalos
baja potencia con FC alta
alta potencia con RPE bajo
posible mejora
posible sobrecarga
```

### Mensaje IA para entrenador

Ejemplo:

```text
El atleta completó el fondo Z2 previsto, pero pasó un 18% del tiempo en Z3/Z4. La FC media fue alta respecto a potencia, y reportó fatiga 7/10. Recomiendo mantener volumen, evitar intensidad el martes y revisar sueño/recuperación.
```

## Métricas prioritarias por deporte

### Ciclismo

```text
potencia media
potencia normalizada
FTP usado
IF
TSS estimado
tiempo en zonas de potencia
tiempo en zonas FC
cadencia
desnivel
velocidad media
VI
Pw:HR / desacople
```

### Carrera

```text
ritmo medio
ritmo por km
FC media/máxima
tiempo en zonas FC
cadencia
desnivel
potencia running si existe
duración
distancia
```

### Fuerza

Inicialmente manual:

```text
ejercicios
series
repeticiones
peso
RPE
notas
```

## Datos necesarios de Garmin

Dependiendo de acceso API o archivo importado:

```text
activity_id
sport_type
start_time
duration
distance
elevation_gain
average_hr
max_hr
average_power
normalized_power
max_power
average_cadence
calories
samples/time_series si disponible
laps/splits
```

Para análisis avanzado de zonas hace falta serie temporal o laps:

```text
potencia por segundo
FC por segundo
cadencia por segundo
velocidad/ritmo
```

## Fase MVP sin Garmin real

Simular actividad importada con JSON:

```json
{
  "source": "garmin_demo",
  "sport": "cycling",
  "duration_min": 92,
  "distance_km": 43.2,
  "avg_power": 178,
  "normalized_power": 194,
  "avg_hr": 143,
  "max_hr": 169,
  "cadence_avg": 86,
  "elevation_gain": 520,
  "time_in_power_zones": {
    "Z1": 12,
    "Z2": 58,
    "Z3": 17,
    "Z4": 5
  }
}
```

## Fase con importación manual

Antes de API oficial:

- importar `.fit`, `.tcx`, `.gpx`, `.csv`,
- parsear métricas,
- vincular con calendario,
- generar análisis.

## Fase Garmin oficial

Con Garmin Activity API:

- recibir actividad tras sync,
- guardar actividad,
- calcular métricas,
- actualizar calendario,
- notificar atleta/coach,
- alimentar planificación del domingo.

## Principio de diseño

El atleta no necesita ver 40 métricas de golpe.

```text
Primero: qué hice, si cumplí y qué significa.
Después: métricas avanzadas desplegables.
```

El mister sí debe tener profundidad:

```text
cumplimiento, carga, zonas, fatiga, tendencia y recomendación.
```
