import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/require-admin'

export const dynamic = 'force-dynamic'

export async function GET() {
  const auth = await requireAdminSession()
  if (!auth.ok) return auth.response

  try {
    const settings = await prisma.setting.findMany({ orderBy: { key: 'asc' } })
    const map: Record<string, string | null> = {}
    for (const s of settings) {
      map[s.key] = s.value
    }
    return NextResponse.json({ success: true, data: map })
  } catch (e) {
    console.error('[GET /api/admin/settings]', e)
    return NextResponse.json({ success: false, error: 'Error al leer configuración' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdminSession()
  if (!auth.ok) return auth.response

  let body: Record<string, string | null>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, error: 'JSON inválido' }, { status: 400 })
  }

  try {
    for (const [key, value] of Object.entries(body)) {
      const userId = typeof auth.session.user.id === 'number' ? auth.session.user.id : parseInt(String(auth.session.user.id), 10) || null
      await prisma.setting.upsert({
        where: { key },
        update: { value: value ?? null, updatedBy: userId },
        create: { key, value: value ?? null, updatedBy: userId },
      })
    }
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('[PUT /api/admin/settings]', e)
    return NextResponse.json({ success: false, error: 'Error al guardar configuración' }, { status: 500 })
  }
}
