'use client'

import { useEffect, useState } from 'react'
import { supabase, MealLog, MealType } from '@/lib/supabase'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import MealCard from '@/components/MealCard'
import AddMealModal from '@/components/AddMealModal'
import CalendarView from '@/components/CalendarView'
import ShareCard from '@/components/ShareCard'
import HelpButton from '@/components/HelpButton'

const MEAL_ORDER: MealType[] = ['루틴식', '본능식', '간식', '추가식']
const MEAL_COLOR: Record<MealType, string> = {
  루틴식: '#7a6a3a', 본능식: '#3a5a60', 간식: '#3a5a42', 추가식: '#6a3a3e',
}
const MEAL_BG: Record<MealType, string> = {
  루틴식: '#f7f3e8', 본능식: '#eaf3f5', 간식: '#eaf4ec', 추가식: '#f5eaeb',
}

export default function Home() {
  const [tab, setTab] = useState<'home' | 'calendar'>('home')
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [logs, setLogs] = useState<MealLog[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [loading, setLoading] = useState(true)

  const today = format(new Date(), 'yyyy-MM-dd')
  const isToday = selectedDate === today
  const displayDate = format(new Date(selectedDate + 'T00:00:00'), 'M월 d일 (EEEEE)', { locale: ko })
  const totalCalories = logs.reduce((sum, l) => sum + (l.calories ?? 0), 0)

  async function fetchLogs(date: string) {
    setLoading(true)
    const { data } = await supabase
      .from('meal_logs')
      .select('*')
      .eq('date', date)
      .order('created_at', { ascending: true })
    setLogs(data ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchLogs(selectedDate) }, [selectedDate])

  const grouped = MEAL_ORDER.reduce<Record<MealType, MealLog[]>>((acc, type) => {
    acc[type] = logs.filter(l => l.meal_type === type)
    return acc
  }, { 루틴식: [], 본능식: [], 간식: [], 추가식: [] })

  const mealCount = MEAL_ORDER.filter(t => grouped[t].length > 0).length

  return (
    <div style={{ background: '#f7f7f7', minHeight: '100dvh', paddingBottom: 80 }}>
      {/* 헤더 */}
      <div style={{ background: '#fff', borderBottom: '1px solid #eee', padding: '16px 20px 12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 13, color: '#888' }}>{displayDate}</div>
            <div style={{ fontSize: 22, fontWeight: 700, marginTop: 2 }}>최주하 식사기록 🍴</div>
          </div>
          <button
            onClick={() => setShowShare(true)}
            style={{ fontSize: 22, background: 'none', border: 'none', cursor: 'pointer', marginTop: 4 }}
          >📤</button>
        </div>
        {!isToday && (
          <button
            onClick={() => { setSelectedDate(today); setTab('home') }}
            style={{
              marginTop: 10, padding: '6px 14px', borderRadius: 20,
              background: '#f0f0f0', border: 'none', fontSize: 12,
              color: '#555', cursor: 'pointer', fontWeight: 600,
            }}
          >← 오늘로 이동</button>
        )}
        <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
          <div style={{ flex: 1, background: '#f7f7f7', borderRadius: 10, padding: '10px 14px' }}>
            <div style={{ fontSize: 11, color: '#888' }}>총 칼로리</div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{totalCalories} <span style={{ fontSize: 12, fontWeight: 400 }}>kcal</span></div>
          </div>
          <div style={{ flex: 1, background: '#f7f7f7', borderRadius: 10, padding: '10px 14px' }}>
            <div style={{ fontSize: 11, color: '#888' }}>식사 횟수</div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{mealCount} <span style={{ fontSize: 12, fontWeight: 400 }}>/ 3끼</span></div>
          </div>
        </div>
      </div>

      {/* 탭 */}
      <div style={{ display: 'flex', background: '#fff', borderBottom: '1px solid #eee' }}>
        {(['home', 'calendar'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, padding: 12, fontSize: 13, fontWeight: tab === t ? 700 : 400,
            color: tab === t ? '#1a1a1a' : '#aaa', background: 'none', border: 'none', cursor: 'pointer',
            borderBottom: tab === t ? '2px solid #1a1a1a' : '2px solid transparent',
          }}>
            {t === 'home' ? '오늘' : '달력'}
          </button>
        ))}
      </div>

      {tab === 'home' ? (
        <div style={{ padding: '16px 16px 0' }}>
          {loading ? (
            <div style={{ textAlign: 'center', color: '#aaa', padding: 40 }}>불러오는 중...</div>
          ) : (
            MEAL_ORDER.map(type => (
              <div key={type} style={{ marginBottom: 20 }}>
                <div style={{
                  display: 'inline-block', padding: '3px 10px', borderRadius: 20,
                  background: MEAL_BG[type], color: MEAL_COLOR[type], fontSize: 12, fontWeight: 700, marginBottom: 8,
                }}>{type}</div>
                {grouped[type].length === 0 ? (
                  <div style={{
                    background: '#fff', borderRadius: 12, padding: 20,
                    textAlign: 'center', color: '#ccc', fontSize: 13, border: '1.5px dashed #e8e8e8',
                  }}>아직 기록 없음</div>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {grouped[type].map(log => (
                      <MealCard key={log.id} log={log} onDelete={() => fetchLogs(selectedDate)} />
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      ) : (
        <CalendarView selectedDate={selectedDate} onSelectDate={d => { setSelectedDate(d); setTab('home') }} />
      )}

      {/* FAB */}
      <button onClick={() => setShowAdd(true)} style={{
        position: 'fixed', bottom: 24, right: 24,
        width: 56, height: 56, borderRadius: '50%',
        background: '#1a1a1a', color: '#fff', fontSize: 28,
        border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
      }}>+</button>

      {showAdd && (
        <AddMealModal
          date={selectedDate}
          onClose={() => setShowAdd(false)}
          onSaved={() => { setShowAdd(false); fetchLogs(selectedDate) }}
        />
      )}
      {showShare && (
        <ShareCard date={selectedDate} logs={logs} onClose={() => setShowShare(false)} />
      )}
      <HelpButton />
    </div>
  )
}
