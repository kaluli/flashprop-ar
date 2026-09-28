'use client'

import {
  useEffect,
  useId,
  useRef,
  useState,
} from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { MobileNavTrigger } from '@/components/MobileAppNav'
import { IconBuilding2 } from '@/components/icons/IconBuilding2'
import { cn } from '@/lib/utils'
import { HeaderDbPill } from '@/components/HeaderDbPill'
import styles from './AppTopHeader.module.css'

function IconContactos({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4" />
      <path d="M8 2v4" />
      <path d="M3 10h18" />
      <circle cx="12" cy="15" r="2" />
      <path d="M9 20h6" />
    </svg>
  )
}

function IconCalculadora({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
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

/** Rodillo de pintura — Reformas. */
function IconReformas({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect width="16" height="6" x="2" y="2" rx="2" />
      <path d="M10 16v-2a2 2 0 0 1 2-2h8a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
      <rect width="4" height="6" x="8" y="16" rx="1" />
    </svg>
  )
}

function IconAjustes({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

/** Silueta usuario (login / cuenta). */
function IconUser({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1" />
    </svg>
  )
}

function UserAccountMenu({ isPerfil }: { isPerfil: boolean }) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const menuId = useId()

  useEffect(() => {
    if (!open) return
    const onDocDown = (e: MouseEvent) => {
      const el = wrapRef.current
      if (el && !el.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDocDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className={styles.userMenu} ref={wrapRef}>
      <button
        type="button"
        className={cn(
          styles.headerIconLink,
          styles.userMenuTrigger,
          open && styles.userMenuTriggerOpen,
          isPerfil && styles.headerIconLinkActive
        )}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        aria-label="Menú de cuenta"
        onClick={() => setOpen((v) => !v)}
      >
        <IconUser />
      </button>
      {open ? (
        <div
          id={menuId}
          className={styles.userMenuPanel}
          role="menu"
          aria-orientation="vertical"
        >
          <Link
            href="/perfil"
            role="menuitem"
            className={styles.userMenuItem}
            aria-current={isPerfil ? 'page' : undefined}
            onClick={() => setOpen(false)}
          >
            Perfil
          </Link>
          <button
            type="button"
            role="menuitem"
            className={cn(styles.userMenuItem, styles.userMenuItemDanger)}
            onClick={() => {
              setOpen(false)
              void signOut({ callbackUrl: '/' })
            }}
          >
            Salir
          </button>
        </div>
      ) : null}
    </div>
  )
}

const ADMIN_MENU_ITEMS = [
  { href: '/admin/ajustes', label: 'Ajustes' },
  { href: '/admin/usuarios', label: 'Usuarios' },
  { href: '/recomendaciones', label: 'Importación' },
] as const

/** Ruedita de administración: Ajustes / Usuarios / Importación (solo admin). */
function AdminMenu() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const menuId = useId()

  useEffect(() => {
    if (!open) return
    const onDocDown = (e: MouseEvent) => {
      const el = wrapRef.current
      if (el && !el.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDocDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const isActive = ADMIN_MENU_ITEMS.some(
    (item) => pathname === item.href || pathname.startsWith(item.href + '/')
  )

  return (
    <div className={styles.userMenu} ref={wrapRef}>
      <button
        type="button"
        className={cn(
          styles.headerIconLink,
          styles.userMenuTrigger,
          open && styles.userMenuTriggerOpen,
          isActive && styles.headerIconLinkActive
        )}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        aria-label="Ajustes e importación"
        title="Ajustes e importación"
        onClick={() => setOpen((v) => !v)}
      >
        <IconAjustes />
      </button>
      {open ? (
        <div id={menuId} className={styles.userMenuPanel} role="menu" aria-orientation="vertical">
          {ADMIN_MENU_ITEMS.map((item) => {
            const current = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                role="menuitem"
                className={styles.userMenuItem}
                aria-current={current ? 'page' : undefined}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}

const REFORMAS_ITEMS = [
  { href: '/reformas', label: 'Reformas e Índices' },
  { href: '/reformas/calculadora', label: 'Calculadora de Reformas' },
] as const

/** Nav "Reformas" con submenú (índices + calculadora). */
function ReformasMenu() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const menuId = useId()

  useEffect(() => {
    if (!open) return
    const onDocDown = (e: MouseEvent) => {
      const el = wrapRef.current
      if (el && !el.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDocDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const isActive = pathname === '/reformas' || pathname.startsWith('/reformas/')

  return (
    <div className={styles.navMenuWrap} ref={wrapRef}>
      <button
        type="button"
        className={cn(styles.navPill, styles.navMenuTrigger, isActive && styles.navPillActive)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        onClick={() => setOpen((v) => !v)}
      >
        <span className={styles.navPillIcon}>
          <IconReformas />
        </span>
        Reformas
        <svg
          className={cn(styles.caret, open && styles.caretOpen)}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open ? (
        <div id={menuId} className={styles.userMenuPanel} role="menu" aria-orientation="vertical">
          {REFORMAS_ITEMS.map((item) => {
            const current =
              pathname === item.href ||
              (item.href !== '/reformas' && pathname.startsWith(item.href + '/'))
            return (
              <Link
                key={item.href}
                href={item.href}
                role="menuitem"
                className={styles.userMenuItem}
                aria-current={current ? 'page' : undefined}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}

export function AppTopHeader() {
  const pathname = usePathname()
  const { data: session, status: authStatus } = useSession()
  const isGestor = pathname === '/'
  const isContactos = pathname === '/contactos' || pathname.startsWith('/contactos/')
  const isCalculadora = pathname === '/calculadora' || pathname.startsWith('/calculadora/')
  const isPerfil = pathname === '/perfil' || pathname.startsWith('/perfil/')

  return (
    <header className={styles.root} role="banner">
      <div className={styles.inner}>
        <Link href="/" className={styles.brand} aria-label="Inicio — FlashProp">
          <span className={styles.brandMark} aria-hidden>
            <IconBuilding2 size={18} className={styles.brandMarkSvg} />
          </span>
          <span className={styles.brandText}>
            <span className={styles.brandNameLine}>
              <span className={styles.brandNameFlash}>Flash</span>
              <span className={styles.brandNameProp}>Prop</span>
            </span>
            <span className={styles.brandSub}>Real Estate Manager</span>
          </span>
        </Link>

        <nav className={styles.nav} aria-label="Secciones principales">
          <Link
            href="/"
            className={cn(styles.navPill, isGestor && styles.navPillActive)}
            aria-current={isGestor ? 'page' : undefined}
          >
            <span className={styles.navPillIcon}>
              <IconBuilding2 size={20} />
            </span>
            Gestor
          </Link>
          <Link
            href="/contactos"
            className={cn(styles.navPill, isContactos && styles.navPillActive)}
            aria-current={isContactos ? 'page' : undefined}
          >
            <span className={styles.navPillIcon}>
              <IconContactos />
            </span>
            Contactos
          </Link>
          <Link
            href="/calculadora"
            className={cn(styles.navPill, isCalculadora && styles.navPillActive)}
            aria-current={isCalculadora ? 'page' : undefined}
          >
            <span className={styles.navPillIcon}>
              <IconCalculadora />
            </span>
            Calculadora
          </Link>
          <ReformasMenu />
        </nav>

        <div className={styles.right}>
          <div className={styles.authMobile}>
            {authStatus === 'loading' ? null : session ? (
              <UserAccountMenu isPerfil={isPerfil} />
            ) : (
              <Link href="/login" className={cn(styles.authLink, styles.authLinkLogin)}>
                <IconUser className={styles.authLinkIcon} />
                Entrar
              </Link>
            )}
          </div>
          <div className={styles.burgerOnly} aria-label="Más secciones">
            <MobileNavTrigger />
          </div>
          <div className={styles.rightExtras}>
            {authStatus === 'loading' ? null : session ? (
              <UserAccountMenu isPerfil={isPerfil} />
            ) : (
              <Link href="/login" className={cn(styles.authLink, styles.authLinkLogin)}>
                <IconUser className={styles.authLinkIcon} />
                Entrar
              </Link>
            )}
            {session?.user?.role === 'admin' ? <AdminMenu /> : null}
            {session?.user?.role === 'admin' ? <HeaderDbPill /> : null}
          </div>
        </div>
      </div>
    </header>
  )
}
