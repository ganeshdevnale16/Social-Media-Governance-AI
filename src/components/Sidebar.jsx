import { useState, useContext } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  IconChevronLeft,
  IconCog,
  IconGlobe,
  IconHome,
  IconPhone,
  IconReport,
  IconAlert,
} from './icons.jsx'

// import { ThemeContext } from './context/ThemeContext.jsx'

const nav = [
  { id: 'dashboard', label: 'Dashboard', icon: IconHome, path: '/brand_infridgement' },
  { id: 'web', label: 'Web/App', icon: IconGlobe, path: '/web-summary' },
  { id: 'incidents', label: 'Incidents', icon: IconAlert, path: '/web-incidents' },
]

function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)

  // const { darkMode } = useContext(ThemeContext)

  const location = useLocation()

  const activeId =
    nav.find((item) => item.path === location.pathname)?.id || 'dashboard'

  return (
    <aside
      className={`flex shrink-0 flex-col bg-white border-r border-neutral-200 transition-[width] duration-200 ${collapsed ? 'w-[72px]' : 'w-[220px]'
        }`}
    >
      {/* Collapse Button */}
      <div
        className={`flex h-12 items-center justify-end border-b px-2 border-neutral-100
          }`}
      >
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          className={`rounded-lg p-2 transition-colors 
            `}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <IconChevronLeft
            className={`h-[15px] w-[15px] transition-transform ${collapsed ? 'rotate-180' : ''
              }`}
          />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-0 p-0 ">
        {nav.map((item) => {
          const Icon = item.icon
          const active = item.id === activeId

          const Component = item.path ? Link : 'button'

          const props = item.path
            ? { to: item.path }
            : { type: 'button' }

          return (
            <Component
              key={item.id}
              title={collapsed ? item.label : undefined}
              {...props}
              className={`flex items-center w-full gap-3 px-4 py-[9px] text-left text-[12px] cursor-pointer transition-colors ${active
                ? 'bg-neutral-900 text-white'
                : 'text-black hover:bg-neutral-100 hover:text-black'
                } ${collapsed ? 'justify-center px-2' : ''}`}
            >
              <Icon className="h-[15px] w-[15px] shrink-0 opacity-90" />

              {!collapsed && <span>{item.label}</span>}
            </Component>
          )
        })}
      </nav>
    </aside>
  )
}


export default Sidebar;