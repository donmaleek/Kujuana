'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { buildApiUrl } from '@/lib/api-base'

const STORAGE_KEY = 'kujuana_onboarding_v1'

function readStore(): any {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}
function writeStore(patch: any) {
  const current = readStore()
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, ...patch }))
}

type PhotoItem = { publicId: string; previewUrl: string }

async function uploadPhoto(file: File): Promise<PhotoItem> {
  const formData = new FormData()
  formData.append('photo', file)
  const res = await fetch(buildApiUrl('/uploads/file'), {
    method: 'POST',
    body: formData,
    credentials: 'include',
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json?.error?.message || json?.message || `Upload failed (${res.status})`)
  return { publicId: json.publicId as string, previewUrl: URL.createObjectURL(file) }
}

export default function Step4PhotosPage() {
  const router = useRouter()
  const [photos, setPhotos] = useState<PhotoItem[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | undefined>(undefined)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const s = readStore()
    const existing = (s?.photos || []) as PhotoItem[]
    setPhotos(existing.filter((p: any) => p?.publicId))
  }, [])

  const canAdd = photos.length < 6

  const onPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(undefined)
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    const toUpload = files.slice(0, 6 - photos.length)
    setUploading(true)
    try {
      const results: PhotoItem[] = []
      for (const file of toUpload) {
        if (!file.type.startsWith('image/')) { setError('Only image files are allowed.'); continue }
        if (file.size > 10 * 1024 * 1024) { setError('Max 10 MB per photo.'); continue }
        results.push(await uploadPhoto(file))
      }
      setPhotos((prev) => [...prev, ...results].slice(0, 6))
    } catch (e: any) {
      setError(e?.message || 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const remove = (publicId: string) => setPhotos((p) => p.filter((x) => x.publicId !== publicId))

  const next = () => {
    setError(undefined)
    if (photos.length < 2) return setError('Please upload at least 2 photos.')
    writeStore({ photos })
    router.push('/step/5-relationship-vision')
  }

  const back = () => router.push('/step/3-background')

  return (
    <div>
      <div style={{ marginBottom: '18px' }}>
        <div style={{ fontFamily: 'var(--font-jost)', fontSize: '0.68rem', letterSpacing: '0.24em', textTransform: 'uppercase', color: 'var(--gold-champagne)' }}>
          Onboarding, Step 4 of 7
        </div>
        <h1 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', fontWeight: 400, color: 'var(--off-white)', marginTop: '10px' }}>
          Photos
        </h1>
        <p style={{ fontFamily: 'var(--font-jost)', color: 'var(--text-muted)', marginTop: '10px', lineHeight: 1.7, maxWidth: '720px' }}>
          Upload clear photos. We recommend one face photo and one full-body photo. Stored privately on our servers.
        </p>
      </div>

      {error && (
        <div style={{ background: 'rgba(232,128,128,0.08)', border: '1px solid rgba(232,128,128,0.25)', padding: '14px 18px', marginBottom: '18px', fontFamily: 'var(--font-jost)', fontSize: '0.84rem', color: '#e88080', lineHeight: 1.5 }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: '14px', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <label style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '10px', background: 'rgba(24, 2, 31, 0.55)', border: '1px dashed rgba(212,175,55,0.35)', padding: '14px 16px', cursor: uploading || !canAdd ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-jost)', color: 'rgba(232,210,124,0.85)', letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: '0.74rem', opacity: uploading || !canAdd ? 0.6 : 1 }}>
          {uploading ? 'Uploading…' : 'Upload photos'}
          <input ref={inputRef} type="file" accept="image/*" multiple onChange={onPick} disabled={uploading || !canAdd} style={{ display: 'none' }} />
        </label>
        <div style={{ fontFamily: 'var(--font-jost)', color: 'rgba(196,168,130,0.55)', fontSize: '0.82rem' }}>
          {photos.length}/6 uploaded
        </div>
      </div>

      <div style={{ marginTop: '18px', display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '12px' }} className="grid3">
        {photos.map((p) => (
          <div key={p.publicId} style={{ background: 'rgba(24, 2, 31, 0.55)', border: '1px solid rgba(212,175,55,0.15)', padding: '10px' }}>
            <div style={{ width: '100%', aspectRatio: '1/1', overflow: 'hidden', border: '1px solid rgba(212,175,55,0.1)' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.previewUrl} alt="Uploaded" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <button type="button" onClick={() => remove(p.publicId)} className="btn btn-outline" style={{ width: '100%', marginTop: '10px', padding: '10px 12px', fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              Remove
            </button>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginTop: '22px' }}>
        <button type="button" onClick={back} className="btn btn-outline" style={{ padding: '14px 18px', fontSize: '0.78rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          Back
        </button>
        <button type="button" onClick={next} disabled={uploading} className="btn btn-gold" style={{ padding: '14px 18px', fontSize: '0.78rem', letterSpacing: '0.12em', textTransform: 'uppercase', opacity: uploading ? 0.6 : 1 }}>
          Continue
        </button>
      </div>

      <style>{`
        @media (max-width: 980px) { .grid3 { grid-template-columns: 1fr 1fr !important; } }
        @media (max-width: 560px) { .grid3 { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  )
}
