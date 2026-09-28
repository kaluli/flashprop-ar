const fs = require('fs')
const path = require('path')
const os = require('os')

try {
  const envPath = path.join(__dirname, '..', '.env.development.local')
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8')
    for (const line of envContent.split('\n')) {
      const trimmed = line.trim()
      if (trimmed && !trimmed.startsWith('#')) {
        const eqIdx = trimmed.indexOf('=')
        if (eqIdx > 0) {
          const key = trimmed.slice(0, eqIdx)
          let value = trimmed.slice(eqIdx + 1)
          if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1)
          }
          process.env[key] = value
        }
      }
    }
  } else {
    const altEnv = path.join(__dirname, '..', '.env')
    if (!fs.existsSync(altEnv)) {
      console.warn('⚠️  No se encontró .env.development.local ni .env')
    }
  }
} catch (e) {
  console.warn('⚠️  Error al leer .env.development.local:', e.message)
}

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const { extractListingsFromHtml } = require('../lib/parse-zonaprop-html')

async function importListings(data) {
  if (!data.link) return { skipped: true, reason: 'Sin link' }
  const existing = await prisma.listing.findFirst({ where: { link: data.link } })
  if (existing) return { skipped: true, link: data.link }

  const price = data.price || 0
  const type = (data.type === 'alquiler') ? 'alquiler' : 'compra'

  await prisma.listing.create({
    data: {
      link: data.link,
      title: data.title || null,
      price: Number(price),
      surface: data.surface != null ? Number(data.surface) : null,
      rooms: data.rooms != null ? parseInt(data.rooms, 10) : null,
      neighborhood: data.neighborhood || null,
      city: data.city || null,
      province: data.province || 'Neuquén',
      type,
      currency: data.currency || (type === 'alquiler' ? 'ARS' : 'USD'),
      publishedAddress: data.publishedAddress || null,
      profitabilityRate: null,
    },
  })
  return { imported: true, link: data.link }
}

function findAlcaloFile(downloadsDir) {
  try {
    const files = fs.readdirSync(downloadsDir)
    const lower = (s) => (s || '').toLowerCase()
    const sinAcentos = (s) => lower(s).normalize('NFD').replace(/\u0301/g, '')
    const match = files.find((f) => {
      if (!f.endsWith('.html') || f.includes('_files')) return false
      const n = sinAcentos(f)
      return n.includes('zonaprop') && n.includes('neuquen')
    })
    return match ? path.join(downloadsDir, match) : null
  } catch {
    return null
  }
}

async function main() {
  let filePath = process.argv[2]
  const downloadsDir = path.join(os.homedir(), 'Downloads')

  if (!filePath) {
    filePath = findAlcaloFile(downloadsDir)
    if (!filePath) {
      console.error('No se encontró en Downloads un archivo específico para Neuquén.')
      console.error('Uso: node scripts/import-zonaprop-html.js "ruta/archivo.html"')
      process.exit(1)
    }
    console.log('Usando archivo encontrado:', filePath)
  } else {
    filePath = path.resolve(filePath)
  }

  if (!fs.existsSync(filePath)) {
    console.error('No existe el archivo:', filePath)
    process.exit(1)
  }

  const html = fs.readFileSync(filePath, 'utf-8')
  const { listings, defaults } = extractListingsFromHtml(html)

  console.log('Zona detectada:', defaults.neighborhood || '(del título)', '| Provincia:', defaults.province, '| Tipo:', defaults.type)
  console.log('Anuncios encontrados:', listings.length)
  if (listings.length === 0) {
    console.log('No se encontraron anuncios en el HTML.')
    process.exit(0)
  }

  let imported = 0
  let skipped = 0
  for (const item of listings) {
    const result = await importListings(item)
    if (result.skipped) skipped++
    else imported++
    if (result.imported) console.log('  ✅', item.link)
  }

  console.log('')
  console.log('Resultado: importados', imported, '| omitidos (duplicados)', skipped, '| total', listings.length)
  await prisma.$disconnect()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
