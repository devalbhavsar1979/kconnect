interface Props {
  number: number
  title: string
  children: React.ReactNode
}

export function SectionCard({ number, title, children }: Props) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 h-full">
      <h2 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
        <span
          className="inline-flex items-center justify-center w-6 h-6 rounded-full
                     bg-blue-600 text-white text-xs font-bold shrink-0"
        >
          {number}
        </span>
        {title}
      </h2>
      {children}
    </div>
  )
}
