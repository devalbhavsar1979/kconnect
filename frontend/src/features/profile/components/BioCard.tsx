interface Props {
  bio: string | null
  onEdit: () => void
}

export function BioCard({ bio, onEdit }: Props) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-4">
        Bio
      </h2>

      {bio ? (
        <p className="text-slate-700 text-sm leading-relaxed">{bio}</p>
      ) : (
        <p className="text-slate-400 text-sm italic">
          No bio added yet. Tell organisations about yourself.
        </p>
      )}

      <button
        onClick={onEdit}
        className="mt-4 text-sm text-blue-600 underline hover:text-blue-500 transition-colors"
      >
        Edit Bio
      </button>
    </div>
  )
}
