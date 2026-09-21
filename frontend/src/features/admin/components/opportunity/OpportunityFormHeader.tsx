import { ChevronRight, Eye, Save } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface Props {
  isEdit: boolean
  saving: boolean
  onSaveDraft: () => void
  onPreview: () => void
}

export function OpportunityFormHeader({ isEdit, saving, onSaveDraft, onPreview }: Props) {
  const navigate = useNavigate()

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 px-6 py-4
                    flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      {/* Breadcrumb + Title */}
      <div>
        <nav className="flex items-center gap-1 text-xs text-slate-500 mb-1">
          <button
            type="button"
            onClick={() => navigate('/admin/opportunities')}
            className="hover:text-slate-700 transition-colors"
          >
            Opportunities
          </button>
          <ChevronRight size={12} />
          <span className="text-slate-700 font-medium">
            {isEdit ? 'Edit Opportunity' : 'Create New Opportunity'}
          </span>
        </nav>
        <h1 className="text-lg font-semibold text-slate-800">
          {isEdit ? 'Edit Opportunity' : 'Create New Opportunity'}
        </h1>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={onPreview}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium
                     border border-slate-300 text-slate-600 rounded-lg
                     hover:bg-slate-50 transition-colors"
        >
          <Eye size={15} />
          Preview
        </button>
        <button
          type="button"
          onClick={onSaveDraft}
          disabled={saving}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium
                     bg-slate-700 text-white rounded-lg hover:bg-slate-600
                     transition-colors disabled:opacity-60"
        >
          <Save size={15} />
          {saving ? 'Saving…' : 'Save Draft'}
        </button>
      </div>
    </div>
  )
}
