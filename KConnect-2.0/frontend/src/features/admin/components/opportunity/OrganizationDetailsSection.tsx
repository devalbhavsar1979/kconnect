import { useEffect, useState } from 'react'
import { ExternalLink, Search } from 'lucide-react'
import { adminOrgsApi } from '@/api/adminOrgsApi'
import type { AdminOrganisation } from '@/types/admin'
import type { OpportunityFormState } from '@/types/opportunity'
import { FormField, selectCls } from './FormField'
import { SectionCard } from './SectionCard'

interface Props {
  form: OpportunityFormState
  errors: Partial<Record<keyof OpportunityFormState, string>>
  onChange: (patch: Partial<OpportunityFormState>) => void
}

export function OrganizationDetailsSection({ form, errors, onChange }: Props) {
  const [orgs, setOrgs] = useState<AdminOrganisation[]>([])
  const [selectedOrg, setSelectedOrg] = useState<AdminOrganisation | null>(null)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminOrgsApi.list({ size: 200 }).then(r => {
      setOrgs(r.items)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  // When form has a pre-existing org_id (edit mode), populate selectedOrg
  useEffect(() => {
    if (form.organization_id && orgs.length > 0) {
      const found = orgs.find(o => o.id === form.organization_id)
      if (found) setSelectedOrg(found)
    }
  }, [form.organization_id, orgs])

  function handleSelect(e: React.ChangeEvent<HTMLSelectElement>) {
    const id = e.target.value || null
    onChange({ organization_id: id })
    const found = orgs.find(o => o.id === id) ?? null
    setSelectedOrg(found)
  }

  const filteredOrgs = search
    ? orgs.filter(o => o.organization_name.toLowerCase().includes(search.toLowerCase()))
    : orgs

  return (
    <SectionCard number={2} title="Organization Details">
      <div className="space-y-4">
        <FormField label="Organization" error={errors.organization_id}
          hint="Required to publish. Optional for draft.">
          {/* Search filter */}
          <div className="relative mb-2">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search organisations…"
              className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={form.organization_id ?? ''}
            onChange={handleSelect}
            disabled={loading}
            className={selectCls}
          >
            <option value="">— Select Organisation —</option>
            {filteredOrgs.map(o => (
              <option key={o.id} value={o.id}>{o.organization_name}</option>
            ))}
          </select>
        </FormField>

        {/* Read-only detail panel */}
        {selectedOrg && (
          <div className="bg-slate-50 rounded-lg border border-slate-200 p-4 space-y-2.5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
              Organisation Details
            </p>

            {selectedOrg.industry && <DetailRow label="Industry" value={selectedOrg.industry} />}
            <DetailRow label="Type" value={selectedOrg.organization_type ?? '—'} />
            <DetailRow label="City" value={selectedOrg.city ?? '—'} />
            <DetailRow label="State" value={selectedOrg.state ?? '—'} />

            {selectedOrg.website ? (
              <div className="flex items-start gap-2">
                <span className="text-xs text-slate-500 w-16 shrink-0">Website</span>
                <a
                  href={selectedOrg.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                >
                  {selectedOrg.website}
                  <ExternalLink size={10} />
                </a>
              </div>
            ) : (
              <DetailRow label="Website" value="—" />
            )}
          </div>
        )}
      </div>
    </SectionCard>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-xs text-slate-500 w-16 shrink-0">{label}</span>
      <span className="text-xs text-slate-700 font-medium">{value}</span>
    </div>
  )
}
