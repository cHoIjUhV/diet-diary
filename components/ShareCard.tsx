'use client'

import { useRef } from 'react'
import { MealLog, MealType } from '@/lib/supabase'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

const MEAL_ORDER: MealType[] = ['루틴식', '본능식', '간식', '추가식']
const MEAL_EMOJI: Record<MealType, string> = {
  루틴식: '🌅', 본능식: '🍽️', 간식: '🍬', 추가식: '➕',
}
const MEAL_BG: Record<MealType, string> = {
  루틴식: '#FFF3CD', 본능식: '#D1ECF1', 간식: '#D4EDDA', 추가식: '#F8D7DA',
}

export default function ShareCard({ date, logs, onClose }: {
  date: string; logs: MealLog[]; onClose: () => void
}) {
  const cardRef = useRef<HTMLDivElement>(null)
  const displayDate = format(new Date(date + 'T00:00:00'), 'yyyy년 M월 d일 (EEEEE)', { locale: ko })
  const totalCalories = logs.reduce((sum, l) => sum + (l.calories ?? 0), 0)

  const grouped = MEAL_ORDER.reduce<Record<MealType, MealLog[]>>((acc, t) => {
    acc[t] = logs.filter(l => l.meal_type === t)
    return acc
  }, { 루틴식: [], 본능식: [], 간식: [], 추가식: [] })

  async function handleDownload() {
    const { default: html2canvas } = await import('html2canvas')
    if (!cardRef.current) return
    const canvas = await html2canvas(cardRef.current, { scale: 2, useCORS: true, backgroundColor: '#fff' })
    const link = document.createElement('a')
    link.download = `루본간추_${date}.jpg`
    link.href = canvas.toDataURL('image/jpeg', 0.92)
    link.click()
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 300,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: '#fff', borderRadius: 20, padding: 20, width: '100%', maxWidth: 440 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 16, fontWeight: 700 }}>카드 저장</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#888' }}>✕</button>
        </div>

        {/* 카드 */}
        <div ref={cardRef} style={{ background: '#fff', borderRadius: 16, padding: 20, border: '1px solid #eee' }}>
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: '#888' }}>{displayDate}</div>
            <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.5px' }}>최주하 식사기록 🍴</div>
            <div style={{ fontSize: 13, color: '#555', marginTop: 4 }}>총 {totalCalories} kcal</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {MEAL_ORDER.map(type => {
              const meal = grouped[type][0]
              return (
                <div key={type} style={{
                  borderRadius: 12, overflow: 'hidden',
                  border: '1px solid #eee', background: MEAL_BG[type],
                }}>
                  {meal?.photo_url ? (
                    <img src={meal.photo_url} alt={type}
                      style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', display: 'block' }}
                      crossOrigin="anonymous"
                    />
                  ) : (
                    <div style={{
                      aspectRatio: '1', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: 36,
                    }}>{MEAL_EMOJI[type]}</div>
                  )}
                  <div style={{ padding: '8px 10px' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#555' }}>{type}</div>
                    <div style={{ fontSize: 11, color: '#333', marginTop: 1 }}>
                      {meal?.food_name ?? '기록 없음'}
                    </div>
                    {meal?.calories != null && (
                      <div style={{ fontSize: 10, color: '#888', marginTop: 1 }}>{meal.calories} kcal</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <button onClick={handleDownload} style={{
          width: '100%', marginTop: 16, padding: 14, borderRadius: 12,
          background: '#1a1a1a', color: '#fff', fontSize: 15, fontWeight: 700,
          border: 'none', cursor: 'pointer',
        }}>
          📥 JPG로 저장
        </button>
      </div>
    </div>
  )
}
