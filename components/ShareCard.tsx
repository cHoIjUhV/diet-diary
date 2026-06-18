'use client'

import { useRef, useState } from 'react'
import { MealLog, MealType } from '@/lib/supabase'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

const MEAL_ORDER: MealType[] = ['루틴식', '본능식', '간식', '추가식']
const MEAL_EMOJI: Record<MealType, string> = {
  루틴식: '🌅', 본능식: '🍽️', 간식: '🍬', 추가식: '➕',
}

export default function ShareCard({ date, logs, onClose }: {
  date: string; logs: MealLog[]; onClose: () => void
}) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [summary, setSummary] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)

  const displayDate = format(new Date(date + 'T00:00:00'), 'yyyy년 M월 d일 (EEEEE)', { locale: ko })
  const totalCalories = logs.reduce((sum, l) => sum + (l.calories ?? 0), 0)

  const grouped = MEAL_ORDER.reduce<Record<MealType, MealLog[]>>((acc, t) => {
    acc[t] = logs.filter(l => l.meal_type === t)
    return acc
  }, { 루틴식: [], 본능식: [], 간식: [], 추가식: [] })

  async function generateSummary() {
    setGenerating(true)
    try {
      const mealSummary = MEAL_ORDER
        .filter(t => grouped[t].length > 0)
        .map(t => `${t}: ${grouped[t].map(l => l.food_name ?? '기록').join(', ')} (${grouped[t].reduce((s, l) => s + (l.calories ?? 0), 0)}kcal)`)
        .join('\n')

      const res = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mealSummary, totalCalories, date }),
      })
      const data = await res.json()
      setSummary(data.summary)
    } catch {
      setSummary('총평 생성에 실패했어요.')
    } finally {
      setGenerating(false)
    }
  }

  async function handleDownload() {
    const { default: html2canvas } = await import('html2canvas')
    if (!cardRef.current) return
    const canvas = await html2canvas(cardRef.current, { scale: 2, useCORS: true, backgroundColor: '#fff' })
    const link = document.createElement('a')
    link.download = `식사기록_${date}.jpg`
    link.href = canvas.toDataURL('image/jpeg', 0.92)
    link.click()
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 300,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: '#fff', borderRadius: 20, padding: 20, width: '100%', maxWidth: 440, maxHeight: '90dvh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 16, fontWeight: 700 }}>카드 저장</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#aaa' }}>✕</button>
        </div>

        {/* 저장될 카드 */}
        <div ref={cardRef} style={{ background: '#fff', borderRadius: 16, padding: 18, border: '1px solid #eee' }}>
          {/* 날짜 헤더 */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 13, color: '#999', marginBottom: 2 }}>{displayDate}</div>
          </div>

          {/* 사진 그리드 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: summary ? 14 : 0 }}>
            {MEAL_ORDER.map(type => {
              const meal = grouped[type][0]
              return (
                <div key={type} style={{
                  borderRadius: 10, overflow: 'hidden',
                  border: '1px solid #ebebeb', background: '#f8f8f8',
                }}>
                  {meal?.photo_url ? (
                    <img src={meal.photo_url} alt={type}
                      style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', display: 'block' }}
                      crossOrigin="anonymous"
                    />
                  ) : (
                    <div style={{
                      aspectRatio: '1', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: 30, color: '#ccc',
                    }}>{MEAL_EMOJI[type]}</div>
                  )}
                  <div style={{ padding: '7px 9px' }}>
                    <div style={{ fontSize: 10, color: '#aaa', marginBottom: 1 }}>{type}</div>
                    <div style={{ fontSize: 11, color: '#444', fontWeight: 500 }}>
                      {meal?.food_name ?? '기록 없음'}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* AI 총평 */}
          {summary && (
            <div style={{
              background: '#f8f8f8', borderRadius: 10, padding: '12px 14px',
              fontSize: 12, color: '#555', lineHeight: 1.7,
            }}>
              <div style={{ fontSize: 10, color: '#aaa', marginBottom: 4, fontWeight: 600, letterSpacing: 0.5 }}>AI 총평</div>
              {summary}
            </div>
          )}
        </div>

        {/* AI 총평 버튼 */}
        <button
          onClick={generateSummary}
          disabled={generating}
          style={{
            width: '100%', marginTop: 12, padding: '12px', borderRadius: 10,
            background: generating ? '#f0f0f0' : '#f4f4f4',
            color: generating ? '#bbb' : '#555',
            fontSize: 13, fontWeight: 600, border: '1px solid #e8e8e8', cursor: generating ? 'not-allowed' : 'pointer',
          }}
        >
          {generating ? '🤖 총평 생성 중...' : summary ? '🔄 총평 다시 생성' : '🤖 AI 총평 생성'}
        </button>

        <button onClick={handleDownload} style={{
          width: '100%', marginTop: 8, padding: 14, borderRadius: 12,
          background: '#1a1a1a', color: '#fff', fontSize: 15, fontWeight: 700,
          border: 'none', cursor: 'pointer',
        }}>
          📥 JPG로 저장
        </button>
      </div>
    </div>
  )
}
