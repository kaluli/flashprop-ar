import type { Metadata } from 'next'
import './globals.css'
import { MobileNavProvider } from '@/components/MobileAppNav'
import { AppTopHeader } from '@/components/AppTopHeader'
import { AppSiteFooter } from '@/components/AppSiteFooter'
import { Providers } from '@/components/Providers'

// Evitar que el build pre-renderice páginas que usan la API/DB (falla en Vercel si la DB no está disponible en build)
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'FlashProp',
  description: 'Real Estate Manager',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        {/* Fuentes por <link> (runtime) para no depender de next/font en build */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap"
        />
      </head>
      <body className="min-h-screen font-sans antialiased">
        <div className="app-root">
          <Providers>
            <MobileNavProvider>
              <AppTopHeader />
              <div className="main-pad">{children}</div>
              <AppSiteFooter />
            </MobileNavProvider>
          </Providers>
        </div>
      </body>
    </html>
  )
}
