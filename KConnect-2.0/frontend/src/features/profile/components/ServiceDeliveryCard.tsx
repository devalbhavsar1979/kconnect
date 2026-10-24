import { Pencil } from 'lucide-react'
import type { UserServiceDelivery } from '@/types'

interface Props {
  data: UserServiceDelivery
  onEdit: () => void
}

function SectionPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">
        {title}
      </h3>
      {children}
    </div>
  )
}

function Pill({ label }: { label: string }) {
  return (
    <span className="px-2.5 py-1 text-xs font-medium bg-teal-50 text-teal-700
                     border border-teal-200 rounded-full">
      {label}
    </span>
  )
}

function ParentBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold
                     bg-teal-100 text-teal-800 border border-teal-300 rounded-full mb-2">
      ✓ {label}
    </span>
  )
}

function Empty() {
  return <p className="text-slate-400 text-sm italic">Not specified</p>
}

function SubGroupLabel({ label }: { label: string }) {
  return (
    <p className="text-xs font-semibold text-slate-500 mt-2 mb-1">{label}</p>
  )
}

export function ServiceDeliveryCard({ data, onEdit }: Props) {
  const lectureSubs = [
    { key: 'lecture_classroom',         label: 'Classroom / In-Person' },
    { key: 'lecture_online',            label: 'Online' },
    { key: 'lecture_offline_recording', label: 'Offline Recording / Screen Casting' },
    { key: 'lecture_blended_flipped',   label: 'Blended / Flipped' },
    { key: 'lecture_hybrid_hyflex',     label: 'Hybrid / HyFlex' },
    { key: 'lecture_hands_on_workshop', label: 'Hands-On / Workshop' },
    { key: 'lecture_mentoring',         label: 'Mentoring / Doubt-Clearing Sessions' },
  ] as const

  const contentSubs = [
    { key: 'content_creation',           label: 'Content Creation' },
    { key: 'content_explainer',          label: 'Explainer Creation' },
    { key: 'content_presentation',       label: 'Content Presentation' },
    { key: 'content_course_design',      label: 'Course Design' },
    { key: 'content_syllabus_design',    label: 'Syllabus Design' },
    { key: 'content_reference_material', label: 'Reference Material / PDCC' },
  ] as const

  const langFields = [
    { key: 'lang_translation',       label: 'Translation' },
    { key: 'lang_transcription',     label: 'Transcription' },
    { key: 'lang_transcript_review', label: 'Transcript Review' },
    { key: 'lang_proofreading',      label: 'Proofreading' },
    { key: 'lang_voiceover',         label: 'Voice-over / Narration' },
    { key: 'lang_localization',      label: 'Localization' },
    { key: 'lang_subtitling',        label: 'Subtitling' },
  ] as const

  const evalGroups = [
    {
      label: 'Case Study & Projects',
      fields: [
        { key: 'eval_case_study_creation',  label: 'Creation' },
        { key: 'eval_case_study_review',    label: 'Review' },
        { key: 'eval_case_study_mentoring', label: 'Mentoring' },
      ] as const,
    },
    {
      label: 'Assignments',
      fields: [
        { key: 'eval_assignment_creation',  label: 'Creation' },
        { key: 'eval_assignment_review',    label: 'Review' },
        { key: 'eval_assignment_mentoring', label: 'Mentoring' },
      ] as const,
    },
    {
      label: 'Assessments',
      fields: [
        { key: 'eval_qbank_creation',   label: 'Question Bank — Creation' },
        { key: 'eval_qbank_review',     label: 'Question Bank — Review' },
        { key: 'eval_qpaper_creation',  label: 'Question Paper — Creation' },
        { key: 'eval_qpaper_review',    label: 'Question Paper — Review' },
        { key: 'eval_qpaper_grading',   label: 'Question Paper — Grading / Evaluation' },
      ] as const,
    },
  ]

  const hasAnything =
    data.can_take_lecture || data.can_create_content ||
    lectureSubs.some(f => data[f.key]) ||
    contentSubs.some(f => data[f.key]) ||
    langFields.some(f => data[f.key]) ||
    evalGroups.some(g => g.fields.some(f => data[f.key]))

  const trueItems = (fields: readonly { key: keyof UserServiceDelivery; label: string }[]) =>
    fields.filter(f => data[f.key])

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-semibold text-slate-800">Service Delivery</h2>
        <button
          onClick={onEdit}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
                     text-slate-600 border border-slate-300 rounded-lg
                     hover:bg-slate-50 transition-colors"
        >
          <Pencil size={13} />
          Edit
        </button>
      </div>

      {/* Overall empty state */}
      {!hasAnything ? (
        <div className="text-center py-10">
          <p className="text-slate-500 text-sm mb-4">
            No service delivery capabilities specified yet.
          </p>
          <button
            onClick={onEdit}
            className="px-5 py-2 bg-blue-600 text-white text-sm font-medium
                       rounded-lg hover:bg-blue-500 transition-colors"
          >
            Edit Profile
          </button>
        </div>
      ) : (
        <div className="space-y-5 divide-y divide-slate-100">

          {/* Section 1 — Lecture Delivery */}
          <SectionPanel title="Lecture Delivery">
            {data.can_take_lecture && <ParentBadge label="Can Deliver Lectures" />}
            {trueItems(lectureSubs).length > 0 ? (
              <div className="flex flex-wrap gap-2 mt-1">
                {trueItems(lectureSubs).map(f => <Pill key={f.key} label={f.label} />)}
              </div>
            ) : !data.can_take_lecture ? (
              <Empty />
            ) : null}
          </SectionPanel>

          {/* Section 2 — Content & Course Development */}
          <div className="pt-5">
            <SectionPanel title="Content & Course Development">
              {data.can_create_content && <ParentBadge label="Can Create Content" />}
              {trueItems(contentSubs).length > 0 ? (
                <div className="flex flex-wrap gap-2 mt-1">
                  {trueItems(contentSubs).map(f => <Pill key={f.key} label={f.label} />)}
                </div>
              ) : !data.can_create_content ? (
                <Empty />
              ) : null}
            </SectionPanel>
          </div>

          {/* Section 3 — Language & Media */}
          <div className="pt-5">
            <SectionPanel title="Language & Media">
              {trueItems(langFields).length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {trueItems(langFields).map(f => <Pill key={f.key} label={f.label} />)}
                </div>
              ) : (
                <Empty />
              )}
            </SectionPanel>
          </div>

          {/* Section 4 — Learning Support & Evaluation */}
          <div className="pt-5">
            <SectionPanel title="Learning Support & Evaluation">
              {evalGroups.every(g => g.fields.every(f => !data[f.key])) ? (
                <Empty />
              ) : (
                <div className="space-y-1">
                  {evalGroups.map(group => {
                    const active = group.fields.filter(f => data[f.key])
                    if (active.length === 0) return null
                    return (
                      <div key={group.label}>
                        <SubGroupLabel label={group.label} />
                        <div className="flex flex-wrap gap-2">
                          {active.map(f => <Pill key={f.key} label={f.label} />)}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </SectionPanel>
          </div>

        </div>
      )}
    </div>
  )
}
