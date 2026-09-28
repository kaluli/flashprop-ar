function parsePrice(str) {
  if (!str) return null
  const cleaned = String(str).replace(/\./g, '').replace(/[€$]/g, '').replace(/,/, '.').trim()
  const n = parseFloat(cleaned)
  return isNaN(n) ? null : n
}

function parseCard(cardHtml) {
  const urlMatch = cardHtml.match(/data-to-posting="([^"]+)"/)
  if (!urlMatch) return null
  const link = 'https://www.zonaprop.com.ar' + urlMatch[1].split('?')[0]

  const priceSection = cardHtml.match(/POSTING_CARD_PRICE[^>]*>[\s\S]*?<\/h2>/)
  let price = 0
  if (priceSection) {
    const usdMatch = priceSection[0].match(/USD\s*([0-9.]+)/)
    if (usdMatch) {
      price = parseFloat(usdMatch[1].replace(/\./g, ''))
    } else {
      const arsMatch = priceSection[0].match(/\$\s*([0-9.]+)/)
      if (arsMatch) price = parseFloat(arsMatch[1].replace(/\./g, ''))
    }
  }

  const imgAltMatch = cardHtml.match(/<img[^>]*alt="([^"]+)"/)
  const title = imgAltMatch ? imgAltMatch[1].trim().slice(0, 255) : null

  const featureSpans = [...cardHtml.matchAll(/postingMainFeatures-module__posting-main-features-span[^>]*>([^<]+)</g)]
  let surface = null
  let rooms = null
  for (const span of featureSpans) {
    const text = span[1].trim()
    const m2Match = text.match(/(\d+)\s*m²/)
    if (m2Match) surface = parseInt(m2Match[1], 10)
    const ambMatch = text.match(/(\d+)\s*amb\.?/)
    if (ambMatch) rooms = parseInt(ambMatch[1], 10)
  }

  const locationMatch = cardHtml.match(/POSTING_CARD_LOCATION[^>]*>([^<]+)</)
  let neighborhood = null
  let city = 'Neuquén'
  let province = 'Neuquén'
  if (locationMatch) {
    const parts = locationMatch[1].split(',').map(s => s.trim())
    if (parts.length >= 2) {
      neighborhood = parts[0] || null
      city = parts[0] || null
      province = parts[parts.length - 1] || 'Neuquén'
    }
  }

  const altText = cardHtml.match(/alt="([^"]+)"/)?.[1] || ''
  const type = /\balquiler\b/i.test(altText) ? 'alquiler' : 'compra'
  const currency = type === 'alquiler' ? 'ARS' : 'USD'

  return {
    link,
    title: title || undefined,
    price: price > 0 ? price : 0,
    surface,
    rooms,
    neighborhood: neighborhood || undefined,
    city: city || undefined,
    province,
    type,
    currency,
    publishedAddress: undefined,
  }
}

function extractFromTitle(pageTitle) {
  let zone = null
  let province = 'Neuquén'
  const matchEn = pageTitle.match(/\ben\s+(?:alquiler\s+en\s+)?(.+?),\s*([^—]+?)\s*—/i)
  if (matchEn) {
    zone = matchEn[1].trim()
    province = matchEn[2].trim()
  } else {
    const matchSolo = pageTitle.match(/^(.+?)\s*—\s*zonaprop/i)
    if (matchSolo) zone = matchSolo[1].trim()
  }
  const isAlquiler = /\balquiler\b/i.test(pageTitle.toLowerCase())
  return { neighborhood: zone, city: zone, province, type: isAlquiler ? 'alquiler' : 'compra' }
}

function extractListingsFromHtml(html) {
  const listings = []
  if (typeof html !== 'string') return { listings, defaults: { neighborhood: null, city: null, province: 'Neuquén', type: 'compra' } }

  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
  const pageTitle = titleMatch ? titleMatch[1].trim() : ''
  const defaults = extractFromTitle(pageTitle)

  const cardLayouts = html.match(/<div[^>]*class="[^"]*postingCardLayout-module__posting-card-layout[^"]*"[^>]*>[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*(?:<\/div>\s*)?<div[^>]*>/g)
  if (!cardLayouts || cardLayouts.length === 0) {
    const cardRegex = /<div[^>]*class="[^"]*postingCardLayout-module__posting-card-layout[^"]*"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*(?:<div\s|<script)/g
    const matches = html.match(cardRegex)
    if (matches) {
      for (const card of matches) {
        const parsed = parseCard(card)
        if (parsed) listings.push(parsed)
      }
    }
    return { listings, defaults }
  }

  for (const card of cardLayouts) {
    const parsed = parseCard(card)
    if (parsed && parsed.price > 0) listings.push(parsed)
  }

  return { listings, defaults }
}

function getDetailPageUrlFromHtml(html) {
  if (typeof html !== 'string' || html.length < 50) return null
  const canonicalMatch = html.match(/<link\s+rel="canonical"\s+href="(https:\/\/www\.zonaprop\.com\.ar[^"]+)"/i)
  if (canonicalMatch) return canonicalMatch[1].trim()
  const ogMatch = html.match(/<meta\s+property="og:url"\s+content="(https:\/\/www\.zonaprop\.com\.ar[^"]+)"/i)
  if (ogMatch) return ogMatch[1].trim()
  const savedMatch = html.match(/saved from url=\(\d+\)(https:\/\/www\.zonaprop\.com\.ar[^"]+)/i)
  if (savedMatch) return savedMatch[1].trim()
  return null
}

function extractSingleListingFromDetailHtml(html, url) {
  if (typeof html !== 'string' || html.length < 100) return null
  let link = typeof url === 'string' ? url.trim() : ''
  if (!link) link = getDetailPageUrlFromHtml(html) || ''
  link = link.replace(/#.*$/, '').replace(/\?.*$/, '')
  if (!link || !link.includes('zonaprop.com.ar')) return null

  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
  const pageTitle = titleMatch ? titleMatch[1].trim() : ''
  const defaults = extractFromTitle(pageTitle)

  const title = pageTitle.replace(/\s*—\s*zonaprop\s*$/i, '').trim().slice(0, 255) || null
  const publishedAddress = title && title.includes(',') ? title.split(',').slice(0, -1).join(',').trim().slice(0, 255) : title

  let price = null
  const priceMatch = html.match(/POSTING_CARD_PRICE[^>]*>\s*USD\s*([0-9.]+)/)
  if (priceMatch) price = parseFloat(priceMatch[1].replace(/\./g, ''))
  if (price == null || price <= 0) {
    const usdMatch = html.match(/USD\s*([0-9.]+)/)
    if (usdMatch) price = parseFloat(usdMatch[1].replace(/\./g, ''))
  }
  if (price == null || !Number.isFinite(price) || price <= 0) price = 0

  const roomsMatch = html.match(/([0-9,]+)\s*amb(?:ientes?)?|([0-9,]+)\s*hab?r\.?/i)
  const rooms = roomsMatch ? parseInt(roomsMatch[1] || roomsMatch[2], 10) : null
  const surfaceMatch = html.match(/([0-9,]+)\s*m2\s*[+-]/)
  const surface = surfaceMatch ? parseInt(surfaceMatch[1].replace(/,/g, ''), 10) : null

  return {
    link: link.length > 500 ? link.slice(0, 500) : link,
    title: title || undefined,
    price,
    surface: surface != null && Number.isFinite(surface) ? surface : undefined,
    rooms: rooms != null && Number.isFinite(rooms) ? rooms : undefined,
    neighborhood: defaults.neighborhood || undefined,
    city: defaults.city || undefined,
    province: defaults.province || 'Neuquén',
    type: defaults.type || 'compra',
    publishedAddress: publishedAddress || undefined,
  }
}

module.exports = { parsePrice, extractFromTitle, extractListingsFromHtml, extractSingleListingFromDetailHtml, getDetailPageUrlFromHtml }
