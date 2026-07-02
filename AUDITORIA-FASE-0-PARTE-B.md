# AUDITORÍA FASE 0 — Parte B: el Google Sheet por dentro

**Fecha**: 2026-07-02
**Fuente**: Sheet `[DEV] Búnker de Inversión - Auditoría` (duplicado exacto de producción, creado 2026-07-02), exportado a xlsx y analizado fórmula a fórmula. El script del Sheet DEV se verificó idéntico al repo.
**Complementa a**: `AUDITORIA-FASE-0.md` (Parte A — código).
**Nota de método**: en el export las fórmulas GOOGLEFINANCE aparecen envueltas en `__xludf.DUMMYFUNCTION(...)` con el último valor cacheado — es un artefacto del export, no algo que exista en el Sheet. Aquí se documentan las fórmulas reales desenvueltas.

---

## 1. Inventario REAL de pestañas: 16 (no 8)

| Pestaña | Estado | Propósito real | ¿Conocida por el código? |
|---|---|---|---|
| `LÉEME` | visible | **Manual de usuario del libro escrito por Ale** (16 secciones: semáforo, modelos, márgenes, bot) | No |
| `Filtro de Calidad` | visible | Filtro 2 capas del búnker (calidad + balance → ANALIZAR/VIGILAR/DESCARTAR) | Indirectamente (col BO del Bunker la consulta por VLOOKUP) |
| `Bunker de inversion USA` | visible | Universo USA: filas 2-49 + motor de valoración (67 col usadas) | Sí |
| `Ranking USA` | visible | QUERY dinámica sobre el Bunker (8 columnas) | Sí |
| `Bunker de inversion exUSA` | visible | Ídem en EUR (conversión GBX/divisa a EUR) | Sí |
| `Ranking exUSA` | visible | Ídem | Sí |
| `Carteras Rubén y Ale` | visible | **La cartera real** — misma estructura que los búnkeres; fuente de `Alertas SMA200` | **No directamente** (el bot la lee a través de `Alertas SMA200`) |
| `Ranking Carteras Rubén y Ale` | visible | QUERY de la cartera (7 columnas) | No |
| `Alertas SMA200` | visible | Espejo de la cartera + SMA200/RSI/tramos para el bot | Sí |
| `Otras Empresas1` | visible | Mini búnker: tabla 1 (filtro, filas 5-21) + tabla 2 (valoración 7 modelos, filas 40-55) | No directamente |
| `Otras Empresas2` | visible | Espejo automático de las ANALIZAR/VIGILAR del mini búnker | Sí |
| `_scratchRSI` | **visible** (el código la crea oculta) | ~44 bloques de cierres GOOGLEFINANCE | Sí (la gestiona) |
| `Seguimiento en €` | oculta | **Sistema ANTERIOR** (PSAR/MACD, valor razonable) — archivo histórico | No |
| `EEUU` | oculta | Ídem, versión USA del sistema anterior | No |
| `Copia de Bunker de inversion US` | oculta | Backup congelado | No |
| `Copia de Bunker de inversion ex` | oculta | Backup congelado (349 filas) | No |

---

## 2. El motor de valoración (hojas Bunker, columnas Y-BO)

Confirmado: el "precio objetivo con 7 modelos" del README es real y vive en fórmulas. Cadena completa:

### 2.1. Del dato al semáforo

```
AY (Modelo: COMP/CICL/REIT/BANCO/SEGURO/UTIL/HOLDING, manual)
  └─> BK "VI AUTOMÁTICO" = SWITCH(AY): REIT→AE · BANCO/SEGURO→AR · CICL→BH · UTIL→BI · HOLDING→BJ · resto→AK
        └─> H (Valor intrínseco) = BL (override manual) si existe, si no BK
              └─> K (Precio Objetivo Combinado) = ponderación de H, I (InvestingPro), J (analistas) según AY:
                    COMP 45/35/20 · CICL 30/50/20 · REIT 35/45/20 · resto 40/40/20
                    (si falta H, I o J → K vacío: "no se decide con datos incompletos")
                    └─> L (Precio ganga) = K×(1−M)   [M = margen de seguridad manual, 10-35%]
                          └─> E (DECISIÓN) y N/O/P (descuentos/distancia)
```

### 2.2. Las fórmulas de cada modelo (verificadas)

| Modelo | Columna | Fórmula (esencia) |
|---|---|---|
| DCF 2 fases (COMP) | AI | FCF/acc (AF) proyectado 5+5 años, g% cap. 15% y luego g/2 cap. 6%, descuento 9%, terminal 2,5% |
| Graham (COMP) | AJ | `EPS×(8.5+200×min(g,12%))×(4.4/4.5)` |
| H_final COMP | AK | Media de AI y AJ; si divergen >1.5× o uno ≤0, el más prudente |
| REIT | AE | `0.6×AFFO×P/AFFO(def. 20) + 0.4×NAV` |
| Banco/Seguro | AP→AR | P/BV justo = `(ROE−g)/(9%−g)`; H = BV/acc × P/BV justo |
| Cíclica | BH | `EBITDA/acc mid-cycle × EV/EBITDA objetivo − DeudaNeta/acc` |
| Utility | BI | DDM: `DPS×(1+min(g,5.5%))/(8.5%−min(g,5.5%))` |
| Holding | BJ | `NAV/acc × (1−descuento)` |

Constantes del motor **hardcodeadas en las fórmulas**: 9% exigido, 2,5% terminal, caps de crecimiento (15%/12%/6%/5,5%), ponderaciones K, pesos REIT 60/40. (Documentadas por Ale en LÉEME §6.)

### 2.3. El semáforo (col E) y el gate del filtro

```
E = "" si BO ∉ {ANALIZAR, VIGILAR}          ← gate del Filtro de Calidad
    🔥 COMPRA GANGA      si G ≤ L
    ✅ BUENA COMPRA      si potencial (K−G)/G ≥ 25%
    🟡 COMPRA RAZONABLE  si ≥ 10%
    ⏳ ESPERAR / CARO     resto
```

- `BN` = ticker normalizado (quita prefijo `BOLSA:`), `BO` = `VLOOKUP(BN, 'Filtro de Calidad'!A5:Q70, 17)` → el veredicto.
- ⚠️ Fragilidad documentada por el propio Ale (LÉEME §13): si se renombra la pestaña `Filtro de Calidad`, BO da `—` en todo y el Ranking se vacía.
- `Q` (Ranking) = COUNTIFS sobre O2:O49 **también gateado por el filtro**.
- El precio `G` convierte divisas (USA→USD, exUSA→EUR; caso especial GBX peniques) y lleva **precio de respaldo literal** incrustado en la fórmula por si GOOGLEFINANCE falla.

### 2.4. Filtro de Calidad (hoja propia; datos filas 5-21, cabeceras 3-4)

- **Capa 1 — Calidad**: 3 métricas por modelo (M1/M2/M3, p.ej. COMP: ROIC>12%, OpMgn>15%, RevCAGR>5%) con umbral editable por fila → ✓/✗ → PASS si 3✓.
- **Capa 2 — Balance**: ND/EBITDA ≤ umbral por modelo (<3x COMP, <2.5x CICL, <7x REIT, <6.5x UTIL, net cash HOLDING).
- **RESULTADO (col Q)**: DESCARTAR si balance FAIL o ≥2 fallos de calidad; ANALIZAR si 0 fallos; VIGILAR si 1. **Override manual en col S** (manda sobre la fórmula). Notas en R, fecha de datos en T.
- LÉEME §13 documenta que la antigua CAPA 3 (valoración) se eliminó por redundante con el motor.
- LÉEME §13 menciona una **automatización dominical (10:00)** que refresca datos desde stockanalysis.com comparando con la col T. ⚠️ Esa "tarea" NO está en Apps Script → **pregunta para Ale: ¿es una tarea programada de Claude, o un proceso manual?**

---

## 3. La cadena de la cartera (descubierta)

```
Bunker de inversion USA ──(algunas filas por referencia)──┐
                                                          ▼
                              Carteras Rubén y Ale  (fuente de verdad de la cartera)
                                │  · filas espejo del Bunker (=Bunker!B2, E2…)
                                │  · filas autónomas con su propio motor (p.ej. Micron)
                                │  · su DECISIÓN E ➜ SIN gate de Filtro de Calidad
                                ▼  (referencia fila a fila con OFFSET: Alertas fila N ← Carteras fila N−1)
                              Alertas SMA200   A=nombre · B=ticker · G=semáforo (=Carteras!E)
                                │  C precio vivo · D SMA200 (AVERAGE de QUERY GOOGLEFINANCE 300d limit 200)
                                │  E dist · F alerta (🔴 bajo SMA / 🟡 ≤2%) 
                                │  H tramos: solo si G contiene GANGA/BUENA → Tramo 1 (≤0%), 2 (≤−10%), 3 (≤−20%) vs SMA200
                                ▼
                              Bot (BLOQUES 1/3/4/5 + promediar)
```

**Corrección al README/memoria**: el paso `Otras Empresas1` → `Otras Empresas2` **NO es manual**: `Otras Empresas2` fila N referencia por fórmula `Otras Empresas1` fila N+38 (filas 41-55) con gate `BC=ANALIZAR/VIGILAR`. Es automático y con **capacidad máxima de 15 empresas**.

**Mini búnker (`Otras Empresas1`)**: tabla 1 (filas 5-21) = réplica del Filtro de Calidad; tabla 2 (filas 40-55) = réplica compacta del motor de 7 modelos con **layout propio** (Modelo en AM, VI AUTO en AY, veredicto en BC, divisa en R…). Su DECISIÓN E **sí lleva los iconos** 🟢/🟡/❗ (p.ej. "🔥 COMPRA GANGA 🟢") y una regla extra: con margen M≥20% y G>L fuerza "⏳ ESPERAR / CARO ❗".

---

## 4. Los Ranking reales vs lo que el código espera — HALLAZGO CRÍTICO

`Ranking USA/exUSA` (fila 1 = array + QUERY sobre `Bunker!B2:BO49`, excluye ETF):

| Índice | Columna real | Lo que el código (`RCOLS`) cree |
|---|---|---|
| 0 (A) | Ranking | PUESTO ✔ |
| 1 (B) | Acción | NOMBRE ✔ |
| 2 (C) | Ticker | TICKER ✔ |
| 3 (D) | Pot. sin margen | POTENCIAL ✔ (no se usa) |
| 4 (E) | **Pot. con margen** | **DECISION ✘** |
| 5 (F) | **DECISIÓN** | — |
| 6 (G) | **Comentario** | **MARGEN ✘** (no se usa) |
| 7 (H) | Margen | — |

**Consecuencia** (bug latente, sin crash): `iconoFiltro(op.decision)` en el radar recibe un número (Pot. con margen), nunca encuentra 🟢/❗ → **el icono de filtro no aparece en el radar desde que se añadió la columna "Pot. con margen" al Ranking**. Además, si una empresa no tuviera precio, la línea de fallback imprimiría ese número en vez de la decisión. `Ranking Carteras` (7 columnas, sin "Pot. con margen") sí coincide con `RCOLS` — el layout antiguo.

**Segundo hallazgo relacionado**: en las hojas **Bunker**, la DECISIÓN (E) **no incluye** los iconos 🟢/❗ (solo el mini búnker los tiene). Por tanto `iconoFiltro()` también es inerte en las alertas de condición y recordatorios. La "señal de filtro en las alertas" (modificación jun 2026 documentada en el encabezado del código) hoy **no se manifiesta en ningún mensaje del canal**.

---

## 5. Celdas y columnas de control: estado real

- `AI4` (fecha radar) = 02/07/2026 · `AJ4` (contador) = 1 · `AK4` = 01/07/2026 · `AL4` (semanal) = 29/06/2026 → coinciden con el código. ✔
- **Etiquetas desalineadas**: los rótulos "Último aviso radar diario / Contador de alertas / Fecha de control" están en `AT4:AV4` (y LÉEME §11 dice "tabla del bot en AT3:AV5"), pero los VALORES que el bot escribe están en `AI4:AL4`. La tabla se movió en algún momento y las etiquetas (y el LÉEME) quedaron apuntando al sitio viejo.
- Columnas `S` ("Última Buena Compra") y `T` ("Última Compra Razonable"): el LÉEME dice "las pone el bot", pero el código actual **solo escribe R, U y V**. Tienen fechas de marzo 2026 → las escribía una versión anterior del bot. Legacy.
- `V` "Reloj de volatilidad" = el cooldown de 1 h de las alertas de condición (nombre histórico).
- `AT125:AT134` (Bunker USA): bloque "Fórmula Protegida / Uso" — copia de seguridad de las fórmulas maestras en formato antiguo (con `;` y decimales con coma). Archivo histórico dentro de la hoja.

## 6. Inconsistencias de datos entre hojas gemelas

1. **Var% semana/mes (L/M)**: en `Alertas SMA200` van **multiplicadas ×100** (−1.40 = −1.40%); en `Otras Empresas2` son **fracciones** (0.0238 = 2.38%). El BLOQUE 3 del bot solo lee `Alertas SMA200`, así que hoy no hay bug activo — pero si algún día se añadiera `Otras Empresas2` a las alertas semanales/mensuales, los umbrales (±10/±20) jamás se alcanzarían.
2. **SMA200 (col D)**: se calcula con `GOOGLEFINANCE 300 días → limit 200` mientras `_scratchRSI` descarga 365 días para RSI/mínimos → **dos descargas independientes del mismo histórico** por ticker.
3. **Referencias fila a fila con offset** (`Alertas SMA200` fila N ← `Carteras` fila N−1; `Otras Empresas2` fila N ← `OE1` fila N+38): insertar o borrar una fila en la hoja origen desalinea silenciosamente todo el espejo.
4. La fórmula de la cartera (`Carteras` E) **no pasa por el Filtro de Calidad**; la del Bunker sí. Mismo semáforo, dos niveles de exigencia.

## 7. Hallazgos para los informes (ampliación de Parte A)

**Redundancias nuevas** (se suman a §9 de Parte A):
- R12. La lógica del semáforo existe en **4 variantes**: Bunker E (con gate), Carteras E (sin gate), OE1 E (con iconos y regla extra del margen), y además replicada como texto en `AT127` (backup).
- R13. El Filtro de Calidad existe **dos veces** (hoja `Filtro de Calidad` para el búnker, tabla 1 de `OE1` para el mini búnker) con fórmulas idénticas.
- R14. El motor de 7 modelos existe **tres veces** (Bunker USA/exUSA + Carteras + mini búnker OE1, con layouts distintos).
- R15. Doble descarga del histórico de cierres (col D SMA200 vs `_scratchRSI`).

**Deuda técnica nueva** (se suma a §10 de Parte A):
- D18. `RCOLS` desalineado con el Ranking real (ver §4) — icono de filtro inerte en el canal.
- D19. Etiquetas de control en `AT3:AV5` y LÉEME §11 apuntando a celdas antiguas; valores reales en `AI4:AL4`.
- D20. Columnas S/T huérfanas (las escribía un bot anterior).
- D21. LÉEME desactualizado en la parte del bot: menciona `GEMINI_API_KEY` (real: `GROQ_API_KEY1`), "cada hora" (real: 15 min), "intradía 14:30-18:30" (real: 9:00-21:00 con orquestación 8-23).
- D22. `_scratchRSI` está **visible** (el código la crea oculta; alguien la mostró y no se volvió a ocultar).
- D23. Hojas legacy acumuladas: `Seguimiento en €`, `EEUU` (sistema PSAR/MACD anterior), 2 copias de backup congeladas.
- D24. Capacidad máxima estructural: universo Bunker = filas 2-49 (48 empresas), mini búnker = 15 empresas, filtro = filas 5-21/70. Límites implícitos en rangos de fórmulas (`$O$2:$O$49`, `A5:Q70`…): añadir la fila 50 saldría del ranking sin aviso.
- D25. Flujo documental doble: existe un **Excel local maestro** que Ale copia "a mano al Sheet vivo" (LÉEME §15) + un doc externo `BUNKER_SISTEMA_VALORACION_COMPLETO.md` no presente en el repo.

**Correcciones candidatas** (el freeze permite "correcciones detectadas durante la auditoría"; ninguna aplicada — decide Ale):
1. `RCOLS.DECISION` 4→5 (y `MARGEN` 6→7) para que el icono de filtro vuelva al radar — **corrección de código, 2 líneas**. Alternativa: dejarlo para el Sprint de migración.
2. README/memoria: el paso OE1→OE2 es automático por fórmula, no manual (corrección documental — sin tocar código).
3. LÉEME §11/§15: actualizar celdas de control y credenciales (corrección documental en el Sheet — la haría Ale).

**Preguntas para Ale** (no bloqueantes):
- ¿Qué es la "tarea del domingo 10:00" que refresca el Filtro de Calidad desde stockanalysis? ¿Tarea programada de Claude, rutina manual?
- ¿El Excel local maestro sigue vivo? ¿Dónde está `BUNKER_SISTEMA_VALORACION_COMPLETO.md`? (Afecta a dónde debe vivir la documentación canónica en V3.)
- ¿Las hojas `Seguimiento en €` / `EEUU` / copias se conservan por valor histórico o se pueden archivar fuera del libro (en V3)?

---

## 8. Diccionario de datos — cierre

Con esta parte, el diccionario queda completo: las columnas de las hojas Bunker (A-W visibles + Y-BO motor), Filtro de Calidad (A-T), layout A-Q, mini búnker (A-BC), Rankings (QUERY), celdas de control y `_scratchRSI` están documentadas entre Parte A §3 y esta Parte B §§2-6. La fuente humana de referencia es el **LÉEME del propio libro** (secciones 1-16), que coincide con lo verificado salvo los puntos D19-D21.

## Estado de la Fase 0

- ✅ Parte A (código) — completada y verificada contra producción.
- ✅ Parte B (Sheet) — completada sobre el duplicado DEV.
- ⏳ **Pendiente: validación de Ale** (diccionario, mapa de dependencias, correcciones candidatas y preguntas abiertas) para dar por cerrada la Fase 0.
