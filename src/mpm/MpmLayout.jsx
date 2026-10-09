import { useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Activity, Bell, ChevronLeft, FileText, Mail, Search, Settings, X } from 'lucide-react'
import Navbar from '../components/Navbar'
import { MpmProvider, useMpm } from './MpmContext.jsx'

const nav = [
  { id: 'monitor', label: 'Live Monitor', icon: Activity, path: '/market-monitor' },
  { id: 'incident', label: 'Investigations', icon: Search, path: '/market-monitor/incidents' },
  { id: 'report', label: 'Reports', icon: FileText, path: '/market-monitor/reports' },
  { id: 'alerts', label: 'Alerts & E-mail Log', icon: Mail, path: '/market-monitor/alerts' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/market-monitor/settings' },
]

function MpmSidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const { pathname } = useLocation()
  const { incidents, emails } = useMpm()
  const activeId =
    pathname.startsWith('/market-monitor/incident') ? 'incident'
      : pathname.startsWith('/market-monitor/report') ? 'report'
        : nav.find((n) => n.path === pathname)?.id || 'monitor'
  const counts = { incident: incidents.length, alerts: emails.length }

  return (
    <aside className={`flex shrink-0 flex-col bg-white border-r border-neutral-200 transition-[width] duration-200 ${collapsed ? 'w-[72px]' : 'w-[220px]'}`}>
      <div className="flex h-12 items-center justify-end border-b px-2 border-neutral-100">
        <button type="button" onClick={() => setCollapsed((c) => !c)} className="rounded-lg p-2" aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
          <ChevronLeft className={`h-[15px] w-[15px] transition-transform ${collapsed ? 'rotate-180' : ''}`} />
        </button>
      </div>
      <nav className="flex flex-1 flex-col">
        {nav.map((item) => {
          const Icon = item.icon
          const active = item.id === activeId
          return (
            <Link
              key={item.id}
              to={item.path}
              title={collapsed ? item.label : undefined}
              className={`flex items-center w-full gap-3 px-4 py-[9px] text-left text-[12px] transition-colors ${active ? 'bg-neutral-900 text-white' : 'text-black hover:bg-neutral-100'} ${collapsed ? 'justify-center px-2' : ''}`}
            >
              <Icon className="h-[15px] w-[15px] shrink-0 opacity-90" />
              {!collapsed && <span className="flex-1">{item.label}</span>}
              {!collapsed && counts[item.id] > 0 && (
                <span className={`min-w-5 px-1.5 text-center text-[10px] font-semibold ${active ? 'bg-white text-neutral-900' : 'bg-[#86bc25] text-white'}`}>{counts[item.id]}</span>
              )}
            </Link>
          )
        })}
      </nav>
      {!collapsed && (
        <div className="border-t border-neutral-100 p-4 text-[11px] leading-relaxed text-neutral-500">
          Reference: NSE/SURV/62122<br />SEBI LODR Reg. 30(11)
        </div>
      )}
    </aside>
  )
}

function Toasts() {
  const { toasts, setToasts } = useMpm()
  const navigate = useNavigate()
  return (
    <div className="pointer-events-none fixed right-5 top-20 z-50 flex w-[340px] flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto border border-neutral-200 border-l-4 bg-white p-3 shadow-lg ${t.tone === 'alert' ? 'border-l-[#DA291C]' : 'border-l-[#86bc25]'}`}
        >
          <div className="flex items-start gap-2">
            <Bell className={`mt-0.5 size-4 shrink-0 ${t.tone === 'alert' ? 'text-[#DA291C]' : 'text-[#86bc25]'}`} />
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold text-neutral-900">{t.title}</p>
              <p className="text-[12px] text-neutral-600">{t.body}</p>
              {t.link && (
                <button onClick={() => navigate(t.link)} className="mt-1 text-[12px] font-medium text-[#86bc25] hover:underline">
                  Open
                </button>
              )}
            </div>
            <button aria-label="Dismiss" onClick={() => setToasts((ts) => ts.filter((x) => x.id !== t.id))}>
              <X className="size-3.5 text-neutral-400" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function MpmLayout() {
  return (
    <MpmProvider>
      <div className="flex h-screen flex-col bg-neutral-100 text-neutral-900">
        <Navbar name="Material Price Movement Analytics" />
        <div className="flex min-h-0 flex-1">
          <MpmSidebar />
          <div className="min-w-0 flex-1 overflow-auto">
            <Outlet />
          </div>
        </div>
        <Toasts />
      </div>
    </MpmProvider>
  )
}
