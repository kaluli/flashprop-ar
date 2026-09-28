'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  EDICION_BASE_LABEL,
  MODELOS,
  NIVELES,
  VARIACION_PROMEDIO,
  type CalcModelo,
  type NivelId,
} from './modelos'
import styles from './page.module.css'

const fmtARS = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
})
const fmtNum = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 })
const fmtPct = new Intl.NumberFormat('es-AR', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 2,
})

function IconCalc({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <rect x="6" y="6" width="12" height="4" rx="1" fill="currentColor" fillOpacity="0.12" />
      <line x1="8" y1="14" x2="10" y2="14" />
      <line x1="14" y1="14" x2="16" y2="14" />
      <line x1="8" y1="18" x2="10" y2="18" />
      <line x1="14" y1="18" x2="16" y2="18" />
    </svg>
  )
}

export default function CalculadoraReformasPage() {
  const [modeloId, setModeloId] = useState<string>(MODELOS[1]?.id ?? MODELOS[0]?.id ?? '')
  const [superficie, setSuperficie] = useState<number>(MODELOS[1]?.superficie || 100)
  const [cantidad, setCantidad] = useState<number>(1)
  const [nivel, setNivel] = useState<NivelId>('estandar')
  const [contingencia, setContingencia] = useState<number>(5)
  const [tasaMensual, setTasaMensual] = useState<number>(
    MODELOS[1]?.variacionMensual || VARIACION_PROMEDIO
  )
  const [meses, setMeses] = useState<number>(0)
  const [excluidos, setExcluidos] = useState<Set<number>>(new Set())

  const modelo: CalcModelo = useMemo(
    () => MODELOS.find((m) => m.id === modeloId) ?? MODELOS[0],
    [modeloId]
  )
  const nivelInfo = NIVELES.find((n) => n.id === nivel) ?? NIVELES[1]

  const calc = useMemo(() => {
    const esM2 = modelo.unidad === 'm2'
    const cantidadBase = esM2 ? Math.max(0, superficie) : Math.max(0, cantidad)
    const refBase = esM2
      ? modelo.costoM2 * cantidadBase
      : modelo.totalRef * cantidadBase

    const seleccionados = modelo.rubros.filter((_, i) => !excluidos.has(i))
    const incidenciaTotal =
      seleccionados.reduce((acc, r) => acc + r.incidencia, 0) || 1

    const costoDirecto = refBase * nivelInfo.factor * incidenciaTotal
    const proyeccionFactor = Math.pow(1 + Math.max(-0.99, tasaMensual) / 100, meses)
    const costoProyectado = costoDirecto * proyeccionFactor
    const contingenciaMonto = costoProyectado * (contingencia / 100)
    const total = costoProyectado + contingenciaMonto
    const costoM2 = esM2 && cantidadBase > 0 ? total / cantidadBase : null

    const desglose = seleccionados
      .map((r) => ({
        nombre: r.nombre,
        incidencia: r.incidencia / incidenciaTotal,
        monto: (r.incidencia / incidenciaTotal) * costoProyectado,
      }))
      .sort((a, b) => b.monto - a.monto)

    return {
      esM2,
      cantidadBase,
      refBase,
      costoDirecto,
      proyeccionFactor,
      costoProyectado,
      contingenciaMonto,
      total,
      costoM2,
      desglose,
      incidenciaTotal,
    }
  }, [
    modelo,
    nivelInfo,
    superficie,
    cantidad,
    excluidos,
    tasaMensual,
    meses,
    contingencia,
  ])

  function selectModelo(id: string) {
    const next = MODELOS.find((m) => m.id === id)
    if (!next) return
    setModeloId(id)
    setSuperficie(next.superficie || (next.unidad === 'm2' ? 100 : 1))
    setCantidad(1)
    setTasaMensual(next.variacionMensual || VARIACION_PROMEDIO)
    setExcluidos(new Set())
  }

  function toggleRubro(index: number) {
    setExcluidos((prev) => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  function reset() {
    setNivel('estandar')
    setContingencia(5)
    setMeses(0)
    setExcluidos(new Set())
    setSuperficie(modelo.superficie || (modelo.unidad === 'm2' ? 100 : 1))
    setCantidad(1)
    setTasaMensual(modelo.variacionMensual || VARIACION_PROMEDIO)
  }

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.pageHeader}>
          <p className={styles.kicker}>
            <span className={styles.kickerDot} aria-hidden />
            <span>Herramienta de presupuesto</span>
          </p>
          <h1 className={styles.h1Row}>
            <span className={styles.h1IconBadge} aria-hidden>
              <IconCalc />
            </span>
            <span className={styles.h1TextBlock}>
              Calculadora de <span className={styles.h1Grad}>Reformas</span>
            </span>
          </h1>
          <p className={styles.subtitle}>
            Estimación de costo de obra a partir de modelos reales del Diario de
            Arquitectura (sección Índices). Base: edición{' '}
            <strong>{EDICION_BASE_LABEL}</strong>.
          </p>
          <Link href="/reformas" className={styles.backLink}>
            ← Volver a Reformas e Índices
          </Link>
        </header>

        <div className={styles.layout}>
          {/* ------------------------------------------------------- inputs */}
          <section className={styles.panel} aria-label="Datos del proyecto">
            <h2 className={styles.panelTitle}>1 · Proyecto</h2>

            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="tipo">
                Tipo de intervención
              </label>
              <select
                id="tipo"
                className={styles.select}
                value={modeloId}
                onChange={(e) => selectModelo(e.target.value)}
              >
                {MODELOS.map((m) => (
                  <option key={m.id} value={m.id}>
                    MODELO {m.num} · {m.tipo}
                  </option>
                ))}
              </select>
              <p className={styles.hint}>{modelo.descripcion}</p>
            </div>

            <div className={styles.fieldGroup}>
              {calc.esM2 ? (
                <>
                  <label className={styles.label} htmlFor="superficie">
                    Superficie a intervenir (m²)
                  </label>
                  <div className={styles.inputRow}>
                    <input
                      id="superficie"
                      className={styles.input}
                      type="number"
                      min={1}
                      step={1}
                      value={superficie}
                      onChange={(e) => setSuperficie(Number(e.target.value))}
                    />
                    <span className={styles.unit}>m²</span>
                  </div>
                </>
              ) : (
                <>
                  <label className={styles.label} htmlFor="cantidad">
                    Cantidad de unidades
                  </label>
                  <div className={styles.inputRow}>
                    <input
                      id="cantidad"
                      className={styles.input}
                      type="number"
                      min={1}
                      step={1}
                      value={cantidad}
                      onChange={(e) => setCantidad(Number(e.target.value))}
                    />
                    <span className={styles.unit}>juego(s) baño+cocina</span>
                  </div>
                </>
              )}
              <p className={styles.hint}>
                Referencia del MODELO {modelo.num}:{' '}
                {calc.esM2
                  ? `${fmtNum.format(modelo.superficie)} m² · ${fmtARS.format(modelo.costoM2)}/m²`
                  : `${fmtARS.format(modelo.totalRef)} por servicio`}
              </p>
            </div>

            <h2 className={styles.panelTitle}>2 · Calidad</h2>
            <div className={styles.radioGrid}>
              {NIVELES.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  className={`${styles.radio} ${nivel === n.id ? styles.radioActive : ''}`}
                  onClick={() => setNivel(n.id)}
                  aria-pressed={nivel === n.id}
                >
                  <span className={styles.radioLabel}>{n.label}</span>
                  <span className={styles.radioDetail}>
                    ×{n.factor.toString().replace('.', ',')} · {n.detalle}
                  </span>
                </button>
              ))}
            </div>

            <h2 className={styles.panelTitle}>3 · Ajustes de obra</h2>
            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="contingencia">
                Contingencia / imprevistos: <strong>{fmtPct.format(contingencia)}%</strong>
              </label>
              <input
                id="contingencia"
                type="range"
                min={0}
                max={20}
                step={1}
                value={contingencia}
                onChange={(e) => setContingencia(Number(e.target.value))}
                className={styles.range}
              />
            </div>
            <div className={styles.row2}>
              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="meses">
                  Proyección: {meses} mes{meses === 1 ? '' : 'es'}
                </label>
                <input
                  id="meses"
                  type="range"
                  min={0}
                  max={24}
                  step={1}
                  value={meses}
                  onChange={(e) => setMeses(Number(e.target.value))}
                  className={styles.range}
                />
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="tasa">
                  Inflación mensual (%)
                </label>
                <div className={styles.inputRow}>
                  <input
                    id="tasa"
                    className={styles.input}
                    type="number"
                    step={0.1}
                    value={tasaMensual}
                    onChange={(e) => setTasaMensual(Number(e.target.value))}
                  />
                  <span className={styles.unit}>%/mes</span>
                </div>
              </div>
            </div>

            <h2 className={styles.panelTitle}>4 · Alcance por rubros</h2>
            <p className={styles.hint}>
              Destildá lo que no forme parte de la obra. La incidencia es sobre el
              total del MODELO {modelo.num}.
            </p>
            <ul className={styles.rubros}>
              {modelo.rubros.map((r, i) => {
                const activo = !excluidos.has(i)
                return (
                  <li key={`${r.nombre}-${i}`} className={styles.rubroItem}>
                    <label className={styles.rubroCheck}>
                      <input
                        type="checkbox"
                        checked={activo}
                        onChange={() => toggleRubro(i)}
                      />
                      <span className={styles.rubroName}>{r.nombre}</span>
                    </label>
                    <span className={styles.rubroInc}>
                      {fmtPct.format(r.incidencia * 100)}%
                    </span>
                  </li>
                )
              })}
            </ul>
          </section>

          {/* ------------------------------------------------------ results */}
          <aside className={styles.results} aria-label="Resultado del presupuesto">
            <div className={styles.resultMain}>
              <p className={styles.resultKicker}>Presupuesto estimado</p>
              <p className={styles.resultTotal}>{fmtARS.format(calc.total)}</p>
              {calc.costoM2 !== null ? (
                <p className={styles.resultM2}>
                  {fmtARS.format(calc.costoM2)} <span>/ m²</span>
                </p>
              ) : (
                <p className={styles.resultM2}>
                  {fmtARS.format(calc.total / Math.max(1, calc.cantidadBase))}{' '}
                  <span>/ servicio</span>
                </p>
              )}
              <p className={styles.rangeNote}>
                Rango orientativo: {fmtARS.format(calc.total * 0.9)} –{' '}
                {fmtARS.format(calc.total * 1.1)} (±10%)
              </p>
            </div>

            <div className={styles.resultRows}>
              <div className={styles.resultRow}>
                <span>Costo directo</span>
                <span>{fmtARS.format(calc.costoDirecto)}</span>
              </div>
              <div className={styles.resultRow}>
                <span>Calidad {nivelInfo.label.toLowerCase()}</span>
                <span>×{nivelInfo.factor.toString().replace('.', ',')}</span>
              </div>
              {meses > 0 ? (
                <div className={styles.resultRow}>
                  <span>Proyección {meses} mes(es)</span>
                  <span>+{fmtPct.format((calc.proyeccionFactor - 1) * 100)}%</span>
                </div>
              ) : null}
              <div className={styles.resultRow}>
                <span>Contingencia</span>
                <span>{fmtARS.format(calc.contingenciaMonto)}</span>
              </div>
              <div className={`${styles.resultRow} ${styles.resultRowTotal}`}>
                <span>Total obra</span>
                <span>{fmtARS.format(calc.total)}</span>
              </div>
            </div>

            <h3 className={styles.breakdownTitle}>
              Incidencia por rubro
              <span className={styles.breakdownSub}>
                sobre el costo directo
              </span>
            </h3>
            <div className={styles.tableHead}>
              <span>Rubro</span>
              <span>%</span>
              <span>Monto</span>
            </div>
            <ul className={styles.table}>
              {calc.desglose.map((d) => (
                <li key={d.nombre} className={styles.tableRow}>
                  <span className={styles.tableName}>{d.nombre}</span>
                  <span className={styles.tablePct}>
                    {fmtPct.format(d.incidencia * 100)}%
                  </span>
                  <span className={styles.tableMonto}>{fmtARS.format(d.monto)}</span>
                </li>
              ))}
            </ul>

            <button type="button" className={styles.resetBtn} onClick={reset}>
              Reiniciar valores
            </button>

            <p className={styles.note}>
              Estimación paramétrica basada en los MODELOs de referencia del ARQ;
              no reemplaza un cómputo y presupuesto ejecutivo. Valores en pesos
              argentinos de la edición {EDICION_BASE_LABEL}.
            </p>
          </aside>
        </div>
      </div>
    </div>
  )
}
