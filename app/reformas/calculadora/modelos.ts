/**
 * Modelos de referencia para la Calculadora de Reformas.
 *
 * Se derivan de la última edición del Diario de Arquitectura (sección Índices):
 * costo por m², superficie, variación mensual y desglose de rubros reales.
 */

import { reformasData } from '../data'

export type CalcRubro = {
  nombre: string
  precio: number
  /** Peso del rubro sobre el total (0..1). */
  incidencia: number
}

export type CalcModelo = {
  id: string
  num: number
  nombre: string
  tipo: string
  /** `m2` = se escala por superficie · `servicio` = se escala por cantidad. */
  unidad: 'm2' | 'servicio'
  costoM2: number
  superficie: number
  totalRef: number
  /** Variación mensual en % (según la publicación). */
  variacionMensual: number
  descripcion: string
  page: number
  rubros: CalcRubro[]
}

const TIPOS: Record<number, string> = {
  9: 'Obra nueva · Galpón industrial',
  10: 'Remodelación · Baño y cocina',
  11: 'Reciclaje · Casa chorizo',
  12: 'Reforma · Oficina',
}

export const NIVELES = [
  { id: 'economico', label: 'Económico', factor: 0.85, detalle: 'Materiales básicos, mano de obra estándar' },
  { id: 'estandar', label: 'Estándar', factor: 1, detalle: 'Primeras marcas, terminaciones medias' },
  { id: 'premium', label: 'Premium', factor: 1.25, detalle: 'Materiales importados, terminaciones finas' },
] as const

export type NivelId = (typeof NIVELES)[number]['id']

/** Convierte "1.737.473", "289,04", "+4,22 %" a número. */
export function parseAR(raw: string): number {
  if (!raw) return 0
  const clean = raw.replace(/[^\d.,]/g, '')
  if (!clean) return 0
  const normalized = clean.includes(',')
    ? clean.replace(/\./g, '').replace(',', '.')
    : clean.replace(/\./g, '')
  const value = parseFloat(normalized)
  return Number.isFinite(value) ? value : 0
}

/** Clave para agrupar rubros: sin acentos, sin puntuación, minúsculas. */
function canonicalRubro(nombre: string): string {
  return nombre
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

export const EDICION_BASE = reformasData[0]?.date ?? ''

/** "2026-09-01" → "01/09/2026". */
export function formatFecha(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso)
  return m ? `${m[3]}/${m[2]}/${m[1]}` : iso
}

export const EDICION_BASE_LABEL = formatFecha(EDICION_BASE)

export const MODELOS: CalcModelo[] = (reformasData[0]?.models ?? []).map((m) => {
  const fields = new Map(m.fields.map((f) => [f.label.toLowerCase(), f.value]))
  const costoM2Raw = parseAR(fields.get('costo por m2') ?? '')
  const superficie = parseAR(fields.get('superficie cubierta') ?? '')
  const variacionMensual = parseAR(fields.get('variación mensual') ?? '')
  const totalRef = m.totales.map(parseAR).reduce((a, b) => a + b, 0)

  // Agrupa rubros que el OCR trae con variantes (acentos/puntuación).
  const agrupados = new Map<string, { nombre: string; precio: number }>()
  for (const it of m.items) {
    const precio = parseAR(it.precio)
    if (precio <= 0) continue
    const key = canonicalRubro(it.rubro)
    const prev = agrupados.get(key)
    if (prev) {
      prev.precio += precio
    } else {
      agrupados.set(key, { nombre: it.rubro.trim(), precio })
    }
  }

  const rubrosRaw = Array.from(agrupados.values())
  const sumItems = rubrosRaw.reduce((a, r) => a + r.precio, 0) || 1
  const rubros: CalcRubro[] = rubrosRaw
    .map((r) => ({ nombre: r.nombre, precio: r.precio, incidencia: r.precio / sumItems }))
    .sort((a, b) => b.precio - a.precio)

  const unidad: CalcModelo['unidad'] =
    superficie > 0 && costoM2Raw > 0 ? 'm2' : 'servicio'
  const costoM2 =
    costoM2Raw > 0 ? costoM2Raw : unidad === 'm2' ? totalRef / superficie : totalRef

  return {
    id: String(m.num),
    num: m.num,
    nombre: m.nombre,
    tipo: TIPOS[m.num] ?? m.nombre,
    unidad,
    costoM2,
    superficie,
    totalRef,
    variacionMensual,
    descripcion: m.descripcion,
    page: m.page,
    rubros,
  }
})

/** Variación mensual promedio de los modelos (default de proyección). */
export const VARIACION_PROMEDIO =
  (() => {
    const vals = MODELOS.map((m) => m.variacionMensual).filter((v) => v > 0)
    if (!vals.length) return 1.5
    return vals.reduce((a, b) => a + b, 0) / vals.length
  })()
