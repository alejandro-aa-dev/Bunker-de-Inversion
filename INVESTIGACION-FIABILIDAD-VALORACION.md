# INVESTIGACIÓN — Fiabilidad del Fair Value de InvestingPro y del valor intrínseco del catálogo

*(Fase 2 — Modelo de Dominio. Investigación solicitada por Ale el 2026-07-16,
previa a la review del asesor. Complementa PLANTILLAS-ANALISIS.md §2
—ponderación 65/25/10— y MODELO-DOMINIO.md §2 Valoración.)*

## 0. Conclusión ejecutiva

**Ni el Fair Value de InvestingPro ni nuestro valor intrínseco son fiables como
predictor puntual del precio a 1 año.** La evidencia empírica dice que los
valores razonables funcionan como herramienta de **ranking relativo a largo
plazo** —exactamente el uso que les da el Búnker (Ranking + margen de seguridad
manual)—, no como pronóstico de precio a 12 meses.

Hallazgos accionables (registrados como observaciones, NO aplicados —
descubrir ≠ arreglar):

- **OBS-1 — Doble conteo parcial de analistas**: los modelos de InvestingPro
  usan estimaciones de consenso de analistas como insumo, así que una fracción
  del 25% de PESO_INVESTINGPRO "son" analistas otra vez (además del 10% de
  PESO_ANALISTAS). El 65/25/10 sigue siendo defendible (el promediado de 15+
  modelos diluye el sesgo), pero el asesor debería opinar.
- **OBS-2 — EV/Sales es el múltiplo menos fiable** según la evidencia (Liu,
  Nissim & Thomas). Correcto como *contraste* en la plantilla TECH; nunca
  debería entrar en la síntesis del intrínseco con peso propio.

## 1. Fair Value de InvestingPro

### 1.1 Qué es realmente

- Compuesto de **~15-17 modelos** promediados: variantes de DCF (p. ej. 5Y DCF
  Revenue Exit), múltiplos (EV/EBITDA, EV/EBIT, EV/Sales), DDM multi-etapa,
  EPV, comparables. Datos de S&P Global Market Intelligence.
- **Insumo clave: estimaciones de consenso de analistas** (crecimientos,
  beneficios futuros). No es independiente de los analistas.
- **No publican**: ponderaciones entre modelos, horizonte temporal explícito,
  ni metodología detallada de combinación.
- Ellos mismos reconocen que la fiabilidad **cae en small caps** y que el Fair
  Value es una "segunda opinión estructurada", no una predicción.

### 1.2 Evidencia de fiabilidad: prácticamente ninguna independiente

- Lo único publicado son **casos de éxito del propio Investing.com** ("Fair
  Value predijo la caída del 43% de NextDecade", "68% de retorno en LiveRamp").
  Sesgo de selección puro: publican aciertos, nunca la tasa de acierto.
  **No existe backtest independiente publicado.** Esa ausencia es en sí un dato.
- El análogo mejor estudiado es **Morningstar** (mismo concepto: fair value
  compuesto por modelos): la evidencia disponible indica que sus estimaciones
  **ordenan bien grupos de acciones en términos relativos, pero no predicen el
  resultado absoluto de una acción concreta**, y la convergencia precio→fair
  value la esperan a **~3 años, no a 1**.
- La evidencia académica más sólida sobre valores intrínsecos compuestos
  (Frankel & Lee 1998: ratio V/P con renta residual + estimaciones de
  analistas) encuentra **predicción modesta de retornos relativos, sobre todo a
  horizontes largos**; a 12 meses su poder es comparable al simple
  book-to-price.
- Al alimentarse de consenso, InvestingPro **hereda parte del sesgo optimista
  (+9,4%)** ya documentado en PLANTILLAS-ANALISIS.md §2 → OBS-1.

### 1.3 Veredicto

Merece su 25% como segunda opinión diversificada (promediar 15+ modelos > un
número de consenso), pero sin evidencia independiente de precisión y con
contaminación parcial de analistas. **Nunca por encima del intrínseco.**

## 2. Valor intrínseco — los 8 modelos del catálogo

Contexto teórico: DDM, DCF y renta residual son **matemáticamente
equivalentes**; las diferencias empíricas vienen de la implementación, y el
**valor terminal domina el resultado** (Lundholm & O'Keefe; Courteau et al.).
Traducción al Búnker: los parámetros con nombre (TASA_EXIGIDA 9%,
CRECIMIENTO_TERMINAL 2,5%, caps) son los que realmente deciden el número.

| Modelo (plantilla) | Qué dice la evidencia | Lectura para el Búnker |
|---|---|---|
| P/BV justo = (ROE−g)/(r−g) (BANCO/SEGURO) | Es un modelo de renta residual: **el enfoque con mejor precisión empírica** (Penman & Sougiannis 1998; Francis, Olsson & Oswald 2000; Courteau 2001) | Nuestro modelo mejor respaldado |
| DCF 2 fases (COMP, TECH, FARMA) | Máxima sensibilidad a supuestos: ±1 pp en r o g terminal mueve el valor 20-40% | Parámetros fijos reducen ruido entre empresas pero introducen sesgo uniforme: cuando el 9% esté "mal" vs. el entorno de tipos, lo estará para todas a la vez |
| Fórmula de Graham (COMP) | El propio Graham advirtió que **no da el "valor verdadero"**, era ilustrativa, y "las proyecciones de crecimiento nunca son fiables" | El cap del 12% mitiga su mayor debilidad (hipersensibilidad a g). Correcta solo promediada con DCF + regla del prudente |
| Múltiplos: EV/EBITDA mid-cycle (CICL), P/AFFO (REIT), EV/EBITDA comparable (TELECOM) | Liu, Nissim & Thomas 2002: múltiplos sobre **beneficios forward** explican precios notablemente bien (error <15% en la mitad de la muestra). Ranking: forward > históricos > cash flow ≈ book value > **ventas (el peor)** | Razonables. Preferir métricas forward/normalizadas cuando existan |
| EV/Sales (contraste TECH) | El múltiplo **menos fiable** de todos según la misma evidencia | OBS-2: bien como contraste, jamás con peso en la síntesis |
| DDM (UTIL) | Equivalente en teoría; en la práctica depende críticamente de g y r | Cap 5,5% correcto; solo para dividenderas estables (como está diseñado) |
| NAV y NAV×(1−descuento) (REIT, HOLDING) | Sin estudio directo en lo revisado; ancla en activos, menos dependiente de proyecciones | Riesgo desplazado a la calidad del NAV reportado y del descuento histórico |

## 3. Implicaciones para el diseño (validadas por la evidencia)

1. **El diseño ya apunta en la dirección correcta**: la Valoración se usa para
   ordenar (Ranking) y fijar precios de entrada con margen de seguridad manual
   del 10-35% — la mitigación clásica contra la imprecisión del punto estimado.
   No se usa como predicción a 12 meses. Mantener así.
2. **PESO_INTRINSECO = 65% queda reforzado**: la fuente con mejor evidencia
   empírica es la interna (renta residual, múltiplos forward), no la externa.
3. **Pendiente para la review del asesor**: OBS-1 (doble conteo) y OBS-2
   (EV/Sales). Sin cambios en PLANTILLAS-ANALISIS.md hasta decisión de Ale.

## Fuentes

**InvestingPro / fair value compuesto**
- [Cómo calcula InvestingPro el fair value (Investing.com Academy)](https://www.investing.com/academy/analysis/fair-value-investing-stocks/)
- [Review independiente de InvestingPro (The Stock Dork)](https://www.thestockdork.com/investingpro-review/)
- [Ejemplo de caso de éxito auto-publicado (LiveRamp)](https://www.investing.com/news/investment-ideas/investingpro-fair-value-nails-68-return-on-liveramp-in-5-months-93CH-4792930)
- [Morningstar — metodología de equity research (convergencia ~3 años)](https://www.morningstar.com/content/dam/marketing/shared/research/methodology/705988Morningstar_Equity_Research_Methodology.pdf)

**Precisión de modelos de valoración**
- [Penman & Sougiannis — comparación empírica cash flow vs. accrual](https://business.columbia.edu/sites/default/files-efs/pubfiles/1068/Penman_On_comparing_Cash_Flow_and_Accrual_Accounting_Models.pdf)
- [Francis, Olsson & Oswald — precisión DDM/DCF/renta residual](https://www.researchgate.net/publication/275267264_Comparing_the_Accuracy_and_Explainability_of_Dividend_Free_Cash_Flow_and_Abnormal_Earnings_Equity_Value_Estimates)
- [Lundholm & O'Keefe — equivalencia teórica y errores de implementación](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=288959)
- [Liu, Nissim & Thomas — precisión de múltiplos](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=241266)
- [Fórmula de Graham — advertencias del propio Graham (GrahamValue)](https://www.grahamvalue.com/article/understanding-benjamin-graham-formula-correctly)
- [Benjamin Graham formula (Wikipedia)](https://en.wikipedia.org/wiki/Benjamin_Graham_formula)
- [Frankel & Lee — V/P y retornos a largo plazo](https://www.sciencedirect.com/science/article/pii/S0165410198000263)

**Ya citadas en PLANTILLAS-ANALISIS.md §2 (fiabilidad de price targets)**
- [Accuracy multi-dimensional de price targets](https://www.sciencedirect.com/science/article/abs/pii/S1059056024000960)
- [18 años de datos (Anachart)](https://anachart.com/how-accurate-are-analyst-price-targets/)
- [Habilidad diferencial de analistas](http://assets.csom.umn.edu/assets/37727.pdf)
