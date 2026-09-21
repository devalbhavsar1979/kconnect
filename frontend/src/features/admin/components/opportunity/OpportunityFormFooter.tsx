import { Send } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface Props {
  saving: boolean
  publishing: boolean
  isDirty: boolean
  onSaveDraft: () => void
  onPublish: () => void
}

export function OpportunityFormFooter({ saving, publishing, isDirty, onSaveDraft, onPublish }: Props) {
  const navigate = useNavigate()

  function handleCancel() {
    if (isDirty) {
      if (!window.confirm('Discard unsaved changes and leave?')) return
    }
    navigate('/admin/opportunities')
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 px-6 py-4
                    flex flex-col sm:flex-row items-center justify-between gap-3">
      <button
        type="button"
        onClick={handleCancel}
        className="text-sm text-slate-500 hover:text-slate-700 transition-colors
                   px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50"
      >
        Cancel
      </button>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onSaveDraft}
          disabled={saving || publishing}
          className="px-5 py-2 text-sm font-medium border border-slate-300 text-slate-600
                     rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save as Draft'}
        </button>
        <button
          type="button"
          onClick={onPublish}
          disabled={saving || publishing}
          className="flex items-center gap-1.5 px-6 py-2 text-sm font-medium
                     bg-blue-600 text-white rounded-lg hover:bg-blue-500
                     transition-colors disabled:opacity-60"
        >
          <Send size={15} />
          {publishing ? 'Publishing…' : 'Publish Opportunity'}
        </button>
      </div>
    </div>
  )
}
