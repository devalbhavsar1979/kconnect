import { useRef, useState } from 'react'
import { FileText, Loader2, Trash2, Upload } from 'lucide-react'
import type { OpportunityAttachment } from '@/types/opportunity'
import { SectionCard } from './SectionCard'

const ALLOWED_EXTS = ['.pdf', '.doc', '.docx', '.ppt', '.pptx']
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB
const MAX_FILES = 5

interface Props {
  opportunityId: string | null
  attachments: OpportunityAttachment[]
  onUpload: (file: File) => Promise<void>
  onDelete: (attachmentId: string) => Promise<void>
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export function AttachmentsSection({ opportunityId, attachments, onUpload, onDelete }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    if (!opportunityId) {
      setError('Save the opportunity as a draft first before uploading attachments.')
      return
    }

    const file = files[0]
    const ext = '.' + file.name.split('.').pop()?.toLowerCase()

    if (!ALLOWED_EXTS.includes(ext)) {
      setError(`File type not allowed. Allowed: ${ALLOWED_EXTS.join(', ')}`)
      return
    }
    if (file.size > MAX_FILE_SIZE) {
      setError('File exceeds 10 MB limit.')
      return
    }
    if (attachments.length >= MAX_FILES) {
      setError(`Maximum ${MAX_FILES} attachments allowed.`)
      return
    }

    setError(null)
    setUploading(true)
    try {
      await onUpload(file)
    } catch {
      setError('Upload failed. Please try again.')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    try {
      await onDelete(id)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <SectionCard number={8} title="Attachments & Documents">
      <div className="space-y-3">
        {!opportunityId && (
          <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            Save as draft first to enable file uploads.
          </p>
        )}

        {/* Drop zone */}
        <div
          className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer
                      ${dragOver ? 'border-blue-400 bg-blue-50' : 'border-slate-300 hover:border-slate-400'}
                      ${!opportunityId ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={() => opportunityId && inputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => {
            e.preventDefault()
            setDragOver(false)
            handleFiles(e.dataTransfer.files)
          }}
        >
          {uploading ? (
            <Loader2 size={24} className="mx-auto text-blue-500 animate-spin mb-2" />
          ) : (
            <Upload size={24} className="mx-auto text-slate-400 mb-2" />
          )}
          <p className="text-sm text-slate-600 font-medium">
            {uploading ? 'Uploading…' : 'Drop files here or click to choose'}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            PDF, DOC, DOCX, PPT, PPTX · Max 10 MB · Up to {MAX_FILES} files
          </p>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept={ALLOWED_EXTS.join(',')}
          className="hidden"
          onChange={e => handleFiles(e.target.files)}
        />

        {error && (
          <p className="text-xs text-red-500">{error}</p>
        )}

        {/* Attachment list */}
        {attachments.length > 0 && (
          <ul className="space-y-2">
            {attachments.map(att => (
              <li key={att.id}
                className="flex items-center gap-3 px-3 py-2 bg-slate-50
                           border border-slate-200 rounded-lg">
                <FileText size={16} className="text-slate-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700 font-medium truncate">{att.file_name}</p>
                  <p className="text-xs text-slate-400">{formatBytes(att.file_size_bytes)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(att.id)}
                  disabled={deletingId === att.id}
                  className="p-1 text-slate-400 hover:text-red-500 transition-colors disabled:opacity-40"
                >
                  {deletingId === att.id
                    ? <Loader2 size={14} className="animate-spin" />
                    : <Trash2 size={14} />}
                </button>
              </li>
            ))}
          </ul>
        )}

        <p className="text-xs text-slate-400 text-right">
          {attachments.length}/{MAX_FILES} files
        </p>
      </div>
    </SectionCard>
  )
}
