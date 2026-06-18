'use client'

import { MealLog } from '@/lib/supabase'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'

export default function MealCard({ log, onDelete }: { log: MealLog; onDelete: () => void }) {
  async function handleDelete() {
    if (!confirm('삭제할까요?')) return
    await supabase.from('meal_logs').delete().eq('id', log.id)
    onDelete()
  }

  return (
    <div style={{
      background: '#fff', borderRadius: 12, overflow: 'hidden',
      border: '1px solid #eee', width: '100%', position: 'relative',
    }}>
      {log.photo_url ? (
        <div style={{ position: 'relative', width: '100%', paddingTop: '100%' }}>
          <img
            src={log.photo_url}
            alt={log.food_name ?? '식사'}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      ) : (
        <div style={{ paddingTop: '100%', background: '#f5f5f5', position: 'relative' }}>
          <div style={{
            position: 'absolute', inset: 0, display: 'flex',
            alignItems: 'center', justifyContent: 'center', fontSize: 32,
          }}>🍽️</div>
        </div>
      )}
      <div style={{ padding: '8px 10px 10px' }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#1a1a1a', marginBottom: 2 }}>
          {log.food_name ?? '음식'}
        </div>
        {log.calories != null && (
          <div style={{ fontSize: 11, color: '#888' }}>{log.calories} kcal</div>
        )}
        {log.note && (
          <div style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>{log.note}</div>
        )}
      </div>
      <button
        onClick={handleDelete}
        style={{
          position: 'absolute', top: 6, right: 6,
          background: 'rgba(0,0,0,0.45)', color: '#fff',
          border: 'none', borderRadius: '50%', width: 22, height: 22,
          fontSize: 12, cursor: 'pointer', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
        }}
      >×</button>
    </div>
  )
}
