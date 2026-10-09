import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

// ── Inline Icons ──────────────────────────────────────────────────────────────

function IconChevronLeft({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  )
}

function IconUpload({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  )
}

function IconDashboard({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
    </svg>
  )
}

// ── Nav items ─────────────────────────────────────────────────────────────────

const nav = [
  {
    id: 'import',
    label: 'Agentic AI',
    icon: IconUpload,
    path: '/brand-perception',           // existing upload/analysis page
  },
  // {
  //   id: 'dashboard',
  //   label: 'Dashboard',
  //   icon: IconDashboard,
  //   path: '/brand-perception/dashboard', // GovernanceDashboard
  // },
]

// ── Sidebar ───────────────────────────────────────────────────────────────────

function BrandPerceptionSidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()

  // Determine active item — dashboard wins if path includes /dashboard
  const activeId = location.pathname.includes('/brand-perception/dashboard')
    ? 'dashboard'
    : location.pathname === '/brand-perception'
      ? 'import'
      : 'dashboard'   // default fallback

  return (
    <aside
      style={{ minHeight: '100%' }}
      className={`flex shrink-0 flex-col bg-white border-r border-neutral-200 transition-[width] duration-200 ${
        collapsed ? 'w-[72px]' : 'w-[220px]'
      }`}
    >
      {/* Collapse toggle */}
      <div className="flex h-12 items-center justify-end border-b border-neutral-100 px-2">
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <IconChevronLeft
            className={`h-[15px] w-[15px] transition-transform duration-200 ${
              collapsed ? 'rotate-180' : ''
            }`}
          />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-0 p-0">
        {nav.map((item) => {
          const Icon = item.icon
          const active = item.id === activeId

          return (
            <Link
              key={item.id}
              to={item.path}
              title={collapsed ? item.label : undefined}
              className={`flex items-center w-full gap-3 px-4 py-[10px] text-left text-[12px] font-medium
                cursor-pointer transition-colors no-underline
                ${active
                  ? 'bg-neutral-900 text-white'
                  : 'text-neutral-700 hover:bg-neutral-100 hover:text-black'
                }
                ${collapsed ? 'justify-center px-2' : ''}
              `}
            >
              <Icon className="h-[15px] w-[15px] shrink-0 opacity-90" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}

export default BrandPerceptionSidebar