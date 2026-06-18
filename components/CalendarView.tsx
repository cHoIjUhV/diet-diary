'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay } from 'date-fns'
import { ko } from 'date-fns/locale'

export default function CalendarView({ selectedDate, onSelectDate }: {
  selectedDate: string; onSelectDate: (d: string) => void
}) {
  const [viewMonth, setViewMonth] = useState(new Date(selectedDate + 'T00:00:00'))
  const [loggedDates, setLoggedDates] = useState<Set<string>>(new Set())

  useEffect(() => {
    const start = format(startOfMonth(viewMonth), 'yyyy-MM-dd')
    const end = format(endOfMonth(viewMonth), 'yyyy-MM-dd')
    supabase
      .from('meal_logs')
      .select('date')
      .gte('date', start)
      .lte('date', end)
      .then(({ data }) => {
        setLoggedDates(new Set((data ?? []).map(d => d.date)))
      })
  }, [viewMonth])

  const days = eachDayOfInterval({ start: startOfMonth(viewMonth), end: endOfMonth(viewMonth) })
  const firstDayOfWeek = getDay(startOfMonth(viewMonth))
  const today = format(new Date(), 'yyyy-MM-dd')

  return (
    <div style={{ padding: 16 }}>
      {/* 월 네비게이션 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <button onClick={() => setViewMonth(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
          style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#888' }}>‹</button>
        <div style={{ fontSize: 16, fontWeight: 700 }}>
          {format(viewMonth, 'yyyy년 M월', { locale: ko })}
        </div>
        <button onClick={() => setViewMonth(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
          style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#888' }}>›</button>
      </div>

      {/* 요일 헤더 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 4 }}>
        {['일', '월', '화', '수', '목', '금', '토'].map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: 11, color: '#aaa', padding: '4px 0' }}>{d}</div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
        {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`e${i}`} />)}
        {days.map(day => {
          const dateStr = format(day, 'yyyy-MM-dd')
          const isToday = dateStr === today
          const isSelected = dateStr === selectedDate
          const hasLog = loggedDates.has(dateStr)
          return (
            <button key={dateStr} onClick={() => onSelectDate(dateStr)} style={{
              padding: '8px 0', borderRadius: 10, border: 'none', cursor: 'pointer',
              background: isSelected ? '#1a1a1a' : isToday ? '#f0f0f0' : 'transparent',
              color: isSelected ? '#fff' : '#1a1a1a',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
            }}>
              <span style={{ fontSize: 13, fontWeight: isToday || isSelected ? 700 : 400 }}>
                {format(day, 'd')}
              </span>
              {hasLog && (
                <span style={{
                  width: 4, height: 4, borderRadius: '50%',
                  background: isSelected ? '#fff' : '#4CAF50', display: 'block',
                }} />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
