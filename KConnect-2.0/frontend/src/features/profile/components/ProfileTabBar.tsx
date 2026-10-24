interface Tab {
  id: string
  label: string
}

const TABS: Tab[] = [
  { id: 'overview',     label: 'Overview' },
  { id: 'academic',     label: 'Academic Details' },
  { id: 'experience',   label: 'Experience' },
  { id: 'expertise',    label: 'Expertise' },
  { id: 'documents',    label: 'Preferences' },
  { id: 'availability', label: 'Service Delivery' },
  { id: 'reviews',      label: 'Achievements' },
]

interface Props {
  activeTab: string
  onChange: (tab: string) => void
}

export function ProfileTabBar({ activeTab, onChange }: Props) {
  return (
    <div
      className="border-b border-slate-200 overflow-x-auto
                 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
    >
      <div className="flex">
        {TABS.map(tab => {
          const isActive = tab.id === activeTab
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={[
                'px-4 py-3 text-sm whitespace-nowrap transition-colors',
                isActive
                  ? 'text-blue-600 border-b-2 border-blue-600 font-semibold'
                  : 'text-slate-500 hover:text-slate-700',
              ].join(' ')}
            >
              {tab.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
