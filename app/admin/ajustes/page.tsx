'use client'

import { useCallback, useEffect, useState } from 'react'
import styles from './page.module.css'

export default function AdminAjustesPage() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const load = useCallback(async () => {
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/admin/settings')
      const json = await res.json()
      if (!json.success) {
        setError(json.error || 'No se pudo cargar')
        return
      }
      setSettings(json.data || {})
    } catch {
      setError('Error de red')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleSave = async () => {
    setError('')
    setSuccess('')
    setSaving(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      const json = await res.json()
      if (!json.success) {
        setError(json.error || 'No se pudo guardar')
        return
      }
      setSuccess('Configuración guardada correctamente')
    } catch {
      setError('Error de red')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Ajustes</h1>
        <p className={styles.lead}>Configuración general de la aplicación. Solo visible para administradores.</p>
      </header>

      {error && <p className={styles.error}>{error}</p>}
      {success && <p className={styles.success}>{success}</p>}

      {loading ? (
        <p className={styles.loading}>Cargando…</p>
      ) : (
        <div className={styles.card}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="dollar_rate">
              Cotización del dólar (ARS/USD)
            </label>
            <p className={styles.hint}>
              Precio del dólar blue / informal en pesos argentinos. Se usa para mostrar precios de alquiler en ARS.
            </p>
            <input
              id="dollar_rate"
              className={styles.input}
              type="number"
              step="1"
              min="1"
              value={settings.dollar_rate ?? ''}
              onChange={(e) => setSettings((prev) => ({ ...prev, dollar_rate: e.target.value }))}
              placeholder="Ej: 1300"
            />
          </div>

          <button className={styles.submitBtn} onClick={handleSave} disabled={saving}>
            {saving ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </div>
      )}
    </div>
  )
}
