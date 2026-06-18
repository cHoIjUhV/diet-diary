'use client'

import { useRef, useState } from 'react'
import { supabase, MealType } from '@/lib/supabase'

const MEAL_TYPES: MealType[] = ['루틴식', '본능식', '간식', '추가식']
const MEAL_BG: Record<MealType, string> = {
  루틴식: '#FFF3CD', 본능식: '#D1ECF1', 간식: '#D4EDDA', 추가식: '#F8D7DA',
}
const MEAL_COLOR: Record<MealType, string> = {
  루틴식: '#856404', 본능식: '#0C5460', 간식: '#155724', 추가식: '#721C24',
}

export default function AddMealModal({ date, onClose, onSaved }: {
  date: string; onClose: () => void; onSaved: () => void
}) {
  const [mealType, setMealType] = useState<MealType>('루틴식')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [foodName, setFoodName] = useState('')
  const [calories, setCalories] = useState('')
  const [note, setNote] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [saving, setSaving] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const cameraRef = useRef<HTMLInputElement>(null)

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    const url = URL.createObjectURL(file)
    setPreview(url)
    analyzeImage(file)
  }

  async function analyzeImage(file: File) {
    setAnalyzing(true)
    try {
      const base64 = await fileToBase64(file)
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64, mimeType: file.type }),
      })
      const data = await res.json()
      setFoodName(data.food_name ?? '')
      setCalories(data.calories ? String(data.calories) : '')
    } catch (err) {
      console.error('AI 분석 실패:', err)
    } finally {
      setAnalyzing(false)
    }
  }

  function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        resolve(result.split(',')[1])
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  async function handleSave() {
    setSaving(true)
    let photoUrl: string | null = null

    if (imageFile) {
      const ext = imageFile.name.split('.').pop()
      const path = `${date}/${Date.now()}.${ext}`
      const { error } = await supabase.storage
        .from('meal-photos')
        .upload(path, imageFile, { upsert: true })
      if (!error) {
        const { data } = supabase.storage.from('meal-photos').getPublicUrl(path)
        photoUrl = data.publicUrl
      }
    }

    await supabase.from('meal_logs').insert({
      date,
      meal_type: mealType,
      photo_url: photoUrl,
      food_name: foodName || null,
      calories: calories ? parseInt(calories) : null,
      note: note || null,
    })

    setSaving(false)
    onSaved()
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200,
      display: 'flex', alignItems: 'flex-end',
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: '#fff', borderRadius: '20px 20px 0 0',
        width: '100%', padding: '20px 20px 36px', maxHeight: '90dvh', overflowY: 'auto',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 17, fontWeight: 700 }}>식사 추가</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#888' }}>✕</button>
        </div>

        {/* 식사 분류 */}
        <div style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>식사 분류</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {MEAL_TYPES.map(t => (
            <button key={t} onClick={() => setMealType(t)} style={{
              flex: 1, padding: '8px 4px', borderRadius: 10, fontSize: 12, fontWeight: 700,
              background: mealType === t ? MEAL_BG[t] : '#f5f5f5',
              color: mealType === t ? MEAL_COLOR[t] : '#aaa',
              border: mealType === t ? `1.5px solid ${MEAL_COLOR[t]}` : '1.5px solid transparent',
              cursor: 'pointer',
            }}>{t}</button>
          ))}
        </div>

        {/* 사진 업로드 */}
        <div style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>사진</div>

        {preview ? (
          <div style={{ position: 'relative', marginBottom: 10 }}>
            <img src={preview} alt="미리보기" style={{ width: '100%', borderRadius: 12, display: 'block' }} />
            <button
              onClick={() => { setPreview(null); setImageFile(null) }}
              style={{
                position: 'absolute', top: 8, right: 8,
                background: 'rgba(0,0,0,0.45)', color: '#fff',
                border: 'none', borderRadius: '50%', width: 26, height: 26,
                fontSize: 14, cursor: 'pointer',
              }}
            >×</button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <button
              onClick={() => cameraRef.current?.click()}
              style={{
                flex: 1, padding: '20px 0', background: '#f7f7f7', border: '1.5px dashed #ddd',
                borderRadius: 12, cursor: 'pointer', display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: 6, color: '#888', fontSize: 12,
              }}
            >
              <span style={{ fontSize: 28 }}>📷</span>카메라
            </button>
            <button
              onClick={() => fileRef.current?.click()}
              style={{
                flex: 1, padding: '20px 0', background: '#f7f7f7', border: '1.5px dashed #ddd',
                borderRadius: 12, cursor: 'pointer', display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: 6, color: '#888', fontSize: 12,
              }}
            >
              <span style={{ fontSize: 28 }}>🖼️</span>갤러리
            </button>
          </div>
        )}

        <input ref={cameraRef} type="file" accept="image/*" capture="environment" onChange={onFileChange} style={{ display: 'none' }} />
        <input ref={fileRef} type="file" accept="image/*" onChange={onFileChange} style={{ display: 'none' }} />

        {/* AI 분석 결과 */}
        {analyzing && (
          <div style={{ textAlign: 'center', color: '#888', fontSize: 13, marginBottom: 12 }}>
            🤖 AI가 음식을 분석하는 중...
          </div>
        )}

        {/* 음식명 */}
        <div style={{ fontSize: 12, color: '#888', marginBottom: 6 }}>음식명</div>
        <input
          value={foodName}
          onChange={e => setFoodName(e.target.value)}
          placeholder="예: 백미밥, 된장찌개"
          style={{
            width: '100%', padding: '12px 14px', borderRadius: 10, fontSize: 14,
            border: '1.5px solid #e8e8e8', marginBottom: 12, outline: 'none',
          }}
        />

        {/* 칼로리 */}
        <div style={{ fontSize: 12, color: '#888', marginBottom: 6 }}>칼로리 (kcal)</div>
        <input
          value={calories}
          onChange={e => setCalories(e.target.value)}
          placeholder="예: 500"
          type="number"
          inputMode="numeric"
          style={{
            width: '100%', padding: '12px 14px', borderRadius: 10, fontSize: 14,
            border: '1.5px solid #e8e8e8', marginBottom: 12, outline: 'none',
          }}
        />

        {/* 메모 */}
        <div style={{ fontSize: 12, color: '#888', marginBottom: 6 }}>메모 (선택)</div>
        <input
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="간단한 메모..."
          style={{
            width: '100%', padding: '12px 14px', borderRadius: 10, fontSize: 14,
            border: '1.5px solid #e8e8e8', marginBottom: 20, outline: 'none',
          }}
        />

        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            width: '100%', padding: 16, borderRadius: 12, fontSize: 15, fontWeight: 700,
            background: saving ? '#ccc' : '#1a1a1a', color: '#fff', border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
          }}
        >
          {saving ? '저장 중...' : '저장'}
        </button>
      </div>
    </div>
  )
}
