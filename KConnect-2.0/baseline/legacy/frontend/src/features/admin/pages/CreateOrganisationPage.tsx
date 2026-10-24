import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { adminOrgsApi } from '@/api/adminOrgsApi'
import type { AdminOrgCreatePayload } from '@/types/admin'
import { OrgContactSection } from '../components/organisation/OrgContactSection'
import { OrgIdentitySection } from '../components/organisation/OrgIdentitySection'

type FormState = AdminOrgCreatePayload
type Errors = Partial<Record<keyof FormState, string>>

const EMPTY: FormState = {
  organization_name: '',
  industry: '',
  organization_type: '',
  website: null,
  email: null,
  mobile_number: null,
  city: null,
  state: null,
  country: null,
  address: null,
}

function validate(form: FormState): Errors {
  const errs: Errors = {}
  if (!form.organization_name.trim()) errs.organization_name = 'Required'
  if (!form.industry) errs.industry = 'Required'
  if (!form.organization_type) errs.organization_type = 'Required'
  if (form.website && !form.website.startsWith('http')) {
    errs.website = 'Must start with http:// or https://'
  }
  return errs
}

export function CreateOrganisationPage() {
  const { id } = useParams<{ id?: string }>()
  const isEdit = Boolean(id)
  const navigate = useNavigate()

  const [form, setForm] = useState<FormState>({ ...EMPTY })
  const [errors, setErrors] = useState<Errors>({})
  const [saving, setSaving] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [loadingEdit, setLoadingEdit] = useState(isEdit)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function showToast(msg: string, type: 'success' | 'error') {
    setToast({ msg, type })
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 4000)
  }

  useEffect(() => {
    if (!id) return
    adminOrgsApi.get(id).then(org => {
      setForm({
        organization_name: org.organization_name,
        industry: org.industry ?? '',
        organization_type: org.organization_type ?? '',
        website: org.website,
        email: org.email,
        mobile_number: org.mobile_number,
        city: org.city,
        state: org.state,
        country: org.country,
        address: org.address,
      })
      setLoadingEdit(false)
    }).catch(() => {
      showToast('Failed to load organisation', 'error')
      setLoadingEdit(false)
    })
  }, [id])

  function patch(update: Partial<FormState>) {
    setForm(f => ({ ...f, ...update }))
    setIsDirty(true)
  }

  function handleCancel() {
    if (isDirty && !window.confirm('Discard unsaved changes?')) return
    navigate('/admin/organisations')
  }

  async function handleSave() {
    const errs = validate(form)
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      showToast('Please fix the errors before saving', 'error')
      return
    }
    setErrors({})
    setSaving(true)
    try {
      if (isEdit && id) {
        await adminOrgsApi.update(id, form)
      } else {
        await adminOrgsApi.create(form)
      }
      setIsDirty(false)
      showToast(isEdit ? 'Organisation updated' : 'Organisation created', 'success')
      setTimeout(() => navigate('/admin/organisations'), 1200)
    } catch (err: any) {
      const detail = err?.response?.data?.detail ?? 'Save failed'
      showToast(typeof detail === 'string' ? detail : 'Validation error', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loadingEdit) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="bg-white rounded-xl h-16" />
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl h-64" />
          <div className="bg-white rounded-xl h-64" />
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 px-6 py-4
                        flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <nav className="flex items-center gap-1 text-xs text-slate-500 mb-1">
              <button
                type="button"
                onClick={() => navigate('/admin/organisations')}
                className="hover:text-slate-700 transition-colors"
              >
                Organisations
              </button>
              <ChevronRight size={12} />
              <span className="text-slate-700 font-medium">
                {isEdit ? 'Edit Organisation' : 'Add Organisation'}
              </span>
            </nav>
            <h1 className="text-lg font-semibold text-slate-800">
              {isEdit ? 'Edit Organisation' : 'Add Organisation'}
            </h1>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-sm text-slate-600 border border-slate-300
                         rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 text-sm font-medium bg-blue-600 text-white
                         rounded-lg hover:bg-blue-500 transition-colors disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Save Organisation'}
            </button>
          </div>
        </div>

        {/* Two-column form */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <OrgIdentitySection form={form} errors={errors} onChange={patch} />
          <OrgContactSection form={form} errors={errors} onChange={patch} />
        </div>

        {/* Footer */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 px-6 py-4
                        flex items-center justify-between">
          <button
            type="button"
            onClick={handleCancel}
            className="text-sm text-slate-500 hover:text-slate-700 px-4 py-2
                       border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 text-sm font-medium bg-blue-600 text-white
                       rounded-lg hover:bg-blue-500 transition-colors disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save Organisation'}
          </button>
        </div>
      </div>

      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-lg shadow-lg
                      text-white text-sm font-medium max-w-sm
                      ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}
        >
          {toast.msg}
        </div>
      )}
    </>
  )
}
