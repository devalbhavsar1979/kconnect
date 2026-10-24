import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { opportunityAdminApi } from '@/api/opportunityAdminApi'
import type { Opportunity, OpportunityAttachment, OpportunityFormState } from '@/types/opportunity'
import { EMPTY_OPPORTUNITY_FORM } from '@/types/opportunity'

import { AttachmentsSection } from '../components/opportunity/AttachmentsSection'
import { CompensationBenefitsSection } from '../components/opportunity/CompensationBenefitsSection'
import { EligibilityPreferencesSection } from '../components/opportunity/EligibilityPreferencesSection'
import { OpportunityBasicsSection } from '../components/opportunity/OpportunityBasicsSection'
import { OpportunityDetailsSection } from '../components/opportunity/OpportunityDetailsSection'
import { OpportunityFormFooter } from '../components/opportunity/OpportunityFormFooter'
import { OpportunityFormHeader } from '../components/opportunity/OpportunityFormHeader'
import { OpportunityPreviewModal } from '../components/opportunity/OpportunityPreviewModal'
import { OrganizationDetailsSection } from '../components/opportunity/OrganizationDetailsSection'
import { RequirementsSection } from '../components/opportunity/RequirementsSection'
import { ScheduleLocationSection } from '../components/opportunity/ScheduleLocationSection'
import { VisibilityStatusSection } from '../components/opportunity/VisibilityStatusSection'

type FormErrors = Partial<Record<keyof OpportunityFormState, string>>

function validateDraft(form: OpportunityFormState): FormErrors {
  const errs: FormErrors = {}
  if (!form.title.trim()) errs.title = 'Title is required'
  if (!form.opportunity_type) errs.opportunity_type = 'Type is required'
  return errs
}

function validatePublish(form: OpportunityFormState): FormErrors {
  const errs: FormErrors = {}
  if (!form.title.trim()) errs.title = 'Required'
  if (!form.opportunity_type) errs.opportunity_type = 'Required'
  if (!form.category.trim()) errs.category = 'Required'
  if (form.delivery_modes.length === 0) errs.delivery_modes = 'Select at least one mode'
  if (!form.session_structure) errs.session_structure = 'Required'
  if (!form.total_duration.trim()) errs.total_duration = 'Required'
  if (!form.duration_per_session.trim()) errs.duration_per_session = 'Required'
  if (!form.organization_id) errs.organization_id = 'Required for publish'
  if (!form.short_description.trim()) errs.short_description = 'Required'
  if (!form.detailed_description.trim()) errs.detailed_description = 'Required'
  if (form.tags.length === 0) errs.tags = 'Add at least one tag'
  if (!form.event_date) errs.event_date = 'Required'
  if (!form.venue_name?.trim()) errs.venue_name = 'Required'
  if (!form.venue_location_type) errs.venue_location_type = 'Required'
  if (!form.venue_address?.trim()) errs.venue_address = 'Required'
  if (form.target_audience.length === 0) errs.target_audience = 'Select at least one'
  if (form.skills_required.length === 0) errs.skills_required = 'Add at least one skill'
  if (!form.minimum_experience) errs.minimum_experience = 'Required'
  if (!form.expertise_level) errs.expertise_level = 'Required'
  if (!form.language_of_delivery) errs.language_of_delivery = 'Required'
  return errs
}

function Loading() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="bg-white rounded-xl h-20" />
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 bg-white rounded-xl h-72" />
        <div className="bg-white rounded-xl h-72" />
      </div>
    </div>
  )
}

export function CreateOpportunityPage() {
  const { id } = useParams<{ id?: string }>()
  const isEdit = Boolean(id)
  const navigate = useNavigate()

  const [form, setForm] = useState<OpportunityFormState>({ ...EMPTY_OPPORTUNITY_FORM })
  const [savedId, setSavedId] = useState<string | null>(id ?? null)
  const [attachments, setAttachments] = useState<OpportunityAttachment[]>([])
  const [errors, setErrors] = useState<FormErrors>({})
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [loadingEdit, setLoadingEdit] = useState(isEdit)
  const [isDirty, setIsDirty] = useState(false)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function showToast(msg: string, type: 'success' | 'error') {
    setToast({ msg, type })
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 4000)
  }

  // Load existing opportunity for edit mode
  useEffect(() => {
    if (!id) return
    opportunityAdminApi.get(id)
      .then((opp: Opportunity) => {
        const { id: _id, created_by, created_at, updated_at, attachments: atts, ...rest } = opp
        setForm(rest)
        setAttachments(atts)
        setSavedId(_id)
        setLoadingEdit(false)
      })
      .catch(() => {
        showToast('Failed to load opportunity', 'error')
        setLoadingEdit(false)
      })
  }, [id])

  const patch = useCallback((update: Partial<OpportunityFormState>) => {
    setForm(f => ({ ...f, ...update }))
    setIsDirty(true)
  }, [])

  async function handleSaveDraft() {
    const errs = validateDraft(form)
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      showToast('Please fix the errors before saving', 'error')
      return
    }
    setErrors({})
    setSaving(true)
    try {
      let opp: Opportunity
      if (savedId) {
        opp = await opportunityAdminApi.update(savedId, { ...form, status: 'DRAFT' })
      } else {
        opp = await opportunityAdminApi.create({ ...form, status: 'DRAFT' })
        setSavedId(opp.id)
        navigate(`/admin/opportunities/${opp.id}/edit`, { replace: true })
      }
      setAttachments(opp.attachments)
      setIsDirty(false)
      showToast('Draft saved successfully', 'success')
    } catch {
      showToast('Failed to save draft', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handlePublish() {
    const errs = validatePublish(form)
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      showToast(`${Object.keys(errs).length} field(s) need attention before publishing`, 'error')
      return
    }
    if (!window.confirm('Publish this opportunity? It will be visible to eligible experts.')) return

    setErrors({})
    setPublishing(true)
    try {
      // Save latest data first, then publish
      let opp: Opportunity
      if (savedId) {
        await opportunityAdminApi.update(savedId, form)
        opp = await opportunityAdminApi.publish(savedId)
      } else {
        opp = await opportunityAdminApi.create(form)
        setSavedId(opp.id)
        opp = await opportunityAdminApi.publish(opp.id)
      }
      setAttachments(opp.attachments)
      setIsDirty(false)
      showToast('Opportunity published successfully!', 'success')
      setTimeout(() => navigate('/admin/opportunities'), 1500)
    } catch (err: any) {
      const detail = err?.response?.data?.detail ?? 'Publish failed'
      showToast(detail, 'error')
    } finally {
      setPublishing(false)
    }
  }

  async function handleUpload(file: File) {
    if (!savedId) return
    const att = await opportunityAdminApi.uploadAttachment(savedId, file)
    setAttachments(prev => [...prev, att])
  }

  async function handleDeleteAttachment(attachmentId: string) {
    if (!savedId) return
    await opportunityAdminApi.deleteAttachment(savedId, attachmentId)
    setAttachments(prev => prev.filter(a => a.id !== attachmentId))
  }

  if (loadingEdit) return <Loading />

  return (
    <>
      <div className="space-y-4">
        {/* Page Header */}
        <OpportunityFormHeader
          isEdit={isEdit}
          saving={saving}
          onSaveDraft={handleSaveDraft}
          onPreview={() => setShowPreview(true)}
        />

        {/* ROW 1: Basics (col-span-2) + Organization (col-span-1) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <OpportunityBasicsSection form={form} errors={errors} onChange={patch} />
          </div>
          <div className="lg:col-span-1">
            <OrganizationDetailsSection form={form} errors={errors} onChange={patch} />
          </div>
        </div>

        {/* ROW 2: Details + Schedule + Compensation */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <OpportunityDetailsSection form={form} errors={errors} onChange={patch} />
          <ScheduleLocationSection form={form} errors={errors} onChange={patch} />
          <CompensationBenefitsSection form={form} errors={errors} onChange={patch} />
        </div>

        {/* ROW 3: Requirements + Eligibility + Attachments+Visibility */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <RequirementsSection form={form} errors={errors} onChange={patch} />
          <EligibilityPreferencesSection form={form} errors={errors} onChange={patch} />
          <div className="space-y-4">
            <AttachmentsSection
              opportunityId={savedId}
              attachments={attachments}
              onUpload={handleUpload}
              onDelete={handleDeleteAttachment}
            />
            <VisibilityStatusSection form={form} errors={errors} onChange={patch} />
          </div>
        </div>

        {/* Page Footer */}
        <OpportunityFormFooter
          saving={saving}
          publishing={publishing}
          isDirty={isDirty}
          onSaveDraft={handleSaveDraft}
          onPublish={handlePublish}
        />
      </div>

      {/* Preview modal */}
      {showPreview && (
        <OpportunityPreviewModal
          form={form}
          onClose={() => setShowPreview(false)}
        />
      )}

      {/* Toast */}
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
