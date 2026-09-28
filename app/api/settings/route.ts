import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const settings = await prisma.setting.findMany({ orderBy: { key: 'asc' } })
    const map: Record<string, string | null> = {}
    for (const s of settings) {
      map[s.key] = s.value
    }
    return NextResponse.json({ success: true, data: map })
  } catch (e) {
    console.error('[GET /api/settings]', e)
    return NextResponse.json({ success: false, error: 'Error al leer configuración' }, { status: 500 })
  }
}
