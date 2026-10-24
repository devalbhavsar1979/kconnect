import { useCallback, useEffect, useState } from 'react'
import { CheckSquare } from 'lucide-react'
import type { UserServiceDelivery, UserServiceDeliveryPayload } from '@/types'
import { EMPTY_SERVICE_DELIVERY } from '@/types'
import { serviceDeliveryApi } from '@/api/serviceDeliveryApi'
import { ServiceDeliveryCard } from './ServiceDeliveryCard'

// ── Shared checkbox row ───────────────────────────────────────────────────────

function CheckRow({
  label,
  checked,
  onChange,
  indent = false,
}: {
  label: string
  checked: boolean
  onChange: () => void
  indent?: boolean
}) {
  return (
    <label className={`flex items-center gap-2 cursor-pointer ${indent ? 'pl-6' : ''}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
      />
      <span className="text-sm text-slate-700">{label}</span>
    </label>
  )
}

function SubGroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mt-3 mb-1.5">
      {children}
    </p>
  )
}

function SectionDivider({ title }: { title: string }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 pt-2 pb-1 border-t border-slate-100">
      {title}
    </p>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function ServiceDeliveryTab() {
  const [data,      setData]      = useState<UserServiceDelivery>(EMPTY_SERVICE_DELIVERY)
  const [loading,   setLoading]   = useState(true)
  const [fetchErr,  setFetchErr]  = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [form,      setForm]      = useState<UserServiceDeliveryPayload>({ ...EMPTY_SERVICE_DELIVERY })
  const [saving,    setSaving]    = useState(false)
  const [saveErr,   setSaveErr]   = useState<string | null>(null)

  const fetchData = useCallback(() => {
    setLoading(true)
    setFetchErr(null)
    serviceDeliveryApi.get()
      .then(setData)
      .catch(() => setFetchErr('Failed to load service delivery data.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  function startEdit() {
    const { id, user_id, created_at, updated_at, ...payload } = data
    void id; void user_id; void created_at; void updated_at
    setForm(payload)
    setSaveErr(null)
    setIsEditing(true)
  }

  const LECTURE_SUBS: (keyof UserServiceDeliveryPayload)[] = [
    'lecture_classroom', 'lecture_online', 'lecture_offline_recording',
    'lecture_blended_flipped', 'lecture_hybrid_hyflex', 'lecture_hands_on_workshop',
    'lecture_mentoring',
  ]
  const CONTENT_SUBS: (keyof UserServiceDeliveryPayload)[] = [
    'content_creation', 'content_explainer', 'content_presentation',
    'content_course_design', 'content_syllabus_design', 'content_reference_material',
  ]

  function toggle(field: keyof UserServiceDeliveryPayload) {
    setForm(f => {
      const next = { ...f, [field]: !f[field] }
      if (next[field] && LECTURE_SUBS.includes(field)) next.can_take_lecture = true
      if (next[field] && CONTENT_SUBS.includes(field)) next.can_create_content = true
      return next
    })
  }

  async function handleSave() {
    setSaving(true)
    setSaveErr(null)
    try {
      const saved = await serviceDeliveryApi.upsert(form)
      setData(saved)
      setIsEditing(false)
    } catch {
      setSaveErr('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  // ── Loading skeleton ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="bg-white rounded-xl shadow-sm h-40" />
        <div className="bg-white rounded-xl shadow-sm h-40" />
      </div>
    )
  }

  // ── Fetch error ──────────────────────────────────────────────────────────────
  if (fetchErr) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
        <p className="text-slate-500 text-sm">{fetchErr}</p>
        <button
          onClick={fetchData}
          className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg
                     hover:bg-blue-500 transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  // ── Inline form ──────────────────────────────────────────────────────────────
  if (isEditing) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h2 className="text-base font-semibold text-slate-800 flex items-center gap-2">
            <CheckSquare size={18} className="text-teal-600" />
            Service Delivery Capabilities
          </h2>
          <button
            onClick={() => setIsEditing(false)}
            className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
          >
            Cancel
          </button>
        </div>

        {saveErr && (
          <div className="px-4 py-3 rounded-lg text-sm bg-red-50 border border-red-200 text-red-700">
            {saveErr}
          </div>
        )}

        {/* FIELDSET 1 — Lecture Delivery */}
        <div className="space-y-2.5">
          <SectionDivider title="Lecture Delivery" />
          <CheckRow label="I can deliver lectures" checked={form.can_take_lecture} onChange={() => toggle('can_take_lecture')} />
          <CheckRow label="Classroom / In-Person"               checked={form.lecture_classroom}         onChange={() => toggle('lecture_classroom')}         indent />
          <CheckRow label="Online"                              checked={form.lecture_online}            onChange={() => toggle('lecture_online')}            indent />
          <CheckRow label="Offline Recording / Screen Casting"  checked={form.lecture_offline_recording} onChange={() => toggle('lecture_offline_recording')} indent />
          <CheckRow label="Blended / Flipped"                   checked={form.lecture_blended_flipped}   onChange={() => toggle('lecture_blended_flipped')}   indent />
          <CheckRow label="Hybrid / HyFlex"                     checked={form.lecture_hybrid_hyflex}     onChange={() => toggle('lecture_hybrid_hyflex')}     indent />
          <CheckRow label="Hands-On / Workshop"                 checked={form.lecture_hands_on_workshop} onChange={() => toggle('lecture_hands_on_workshop')} indent />
          <CheckRow label="Mentoring / Doubt-Clearing Sessions" checked={form.lecture_mentoring}         onChange={() => toggle('lecture_mentoring')}         indent />
        </div>

        {/* FIELDSET 2 — Content & Course Development */}
        <div className="space-y-2.5">
          <SectionDivider title="Content & Course Development" />
          <CheckRow label="I can create content & courses" checked={form.can_create_content} onChange={() => toggle('can_create_content')} />
          <CheckRow label="Content Creation"         checked={form.content_creation}           onChange={() => toggle('content_creation')}           indent />
          <CheckRow label="Explainer Creation"       checked={form.content_explainer}          onChange={() => toggle('content_explainer')}          indent />
          <CheckRow label="Content Presentation"     checked={form.content_presentation}       onChange={() => toggle('content_presentation')}       indent />
          <CheckRow label="Course Design"            checked={form.content_course_design}      onChange={() => toggle('content_course_design')}      indent />
          <CheckRow label="Syllabus Design"          checked={form.content_syllabus_design}    onChange={() => toggle('content_syllabus_design')}    indent />
          <CheckRow label="Reference Material / PDCC" checked={form.content_reference_material} onChange={() => toggle('content_reference_material')} indent />
        </div>

        {/* FIELDSET 3 — Language & Media */}
        <div>
          <SectionDivider title="Language & Media" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 mt-2">
            <CheckRow label="Translation"            checked={form.lang_translation}       onChange={() => toggle('lang_translation')} />
            <CheckRow label="Transcription"          checked={form.lang_transcription}     onChange={() => toggle('lang_transcription')} />
            <CheckRow label="Transcript Review"      checked={form.lang_transcript_review} onChange={() => toggle('lang_transcript_review')} />
            <CheckRow label="Proofreading"           checked={form.lang_proofreading}      onChange={() => toggle('lang_proofreading')} />
            <CheckRow label="Voice-over / Narration" checked={form.lang_voiceover}         onChange={() => toggle('lang_voiceover')} />
            <CheckRow label="Localization"           checked={form.lang_localization}      onChange={() => toggle('lang_localization')} />
            <CheckRow label="Subtitling"             checked={form.lang_subtitling}        onChange={() => toggle('lang_subtitling')} />
          </div>
        </div>

        {/* FIELDSET 4 — Learning Support & Evaluation */}
        <div>
          <SectionDivider title="Learning Support & Evaluation" />

          <SubGroupLabel>Case Study &amp; Projects</SubGroupLabel>
          <div className="space-y-2.5">
            <CheckRow label="Creation"  checked={form.eval_case_study_creation}  onChange={() => toggle('eval_case_study_creation')} />
            <CheckRow label="Review"    checked={form.eval_case_study_review}    onChange={() => toggle('eval_case_study_review')} />
            <CheckRow label="Mentoring" checked={form.eval_case_study_mentoring} onChange={() => toggle('eval_case_study_mentoring')} />
          </div>

          <SubGroupLabel>Assignments</SubGroupLabel>
          <div className="space-y-2.5">
            <CheckRow label="Creation"  checked={form.eval_assignment_creation}  onChange={() => toggle('eval_assignment_creation')} />
            <CheckRow label="Review"    checked={form.eval_assignment_review}    onChange={() => toggle('eval_assignment_review')} />
            <CheckRow label="Mentoring" checked={form.eval_assignment_mentoring} onChange={() => toggle('eval_assignment_mentoring')} />
          </div>

          <SubGroupLabel>Assessments</SubGroupLabel>
          <div className="space-y-2.5">
            <CheckRow label="Question Bank — Creation"              checked={form.eval_qbank_creation}   onChange={() => toggle('eval_qbank_creation')} />
            <CheckRow label="Question Bank — Review"                checked={form.eval_qbank_review}     onChange={() => toggle('eval_qbank_review')} />
            <CheckRow label="Question Paper — Creation"             checked={form.eval_qpaper_creation}  onChange={() => toggle('eval_qpaper_creation')} />
            <CheckRow label="Question Paper — Review"               checked={form.eval_qpaper_review}    onChange={() => toggle('eval_qpaper_review')} />
            <CheckRow label="Question Paper — Grading / Evaluation" checked={form.eval_qpaper_grading}   onChange={() => toggle('eval_qpaper_grading')} />
          </div>
        </div>

        {/* Form footer */}
        <div className="flex gap-3 pt-2 border-t border-slate-100">
          <button
            onClick={() => setIsEditing(false)}
            disabled={saving}
            className="flex-1 py-2.5 text-sm font-medium border border-slate-300 text-slate-600
                       rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2.5 text-sm font-medium bg-blue-600 text-white
                       rounded-lg hover:bg-blue-500 transition-colors disabled:opacity-70
                       flex items-center justify-center gap-2"
          >
            {saving && (
              <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            )}
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    )
  }

  // ── Card view ────────────────────────────────────────────────────────────────
  return <ServiceDeliveryCard data={data} onEdit={startEdit} />
}
