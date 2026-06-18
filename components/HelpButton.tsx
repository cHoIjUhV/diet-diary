'use client'

import { useState } from 'react'

const MEALS = [
  { name: '루틴식', desc: '하루를 시작하는 고정 식사. 양은 중간 정도.', emoji: '🌅', dots: '●●●○' },
  { name: '본능식', desc: '지금 가장 먹고 싶은 음식. 하루 중 양이 제일 많음.', emoji: '🍽️', dots: '●●●●' },
  { name: '간식', desc: '디저트·군것질. 하루의 결핍을 소량으로 채움.', emoji: '🍬', dots: '●●○○' },
  { name: '추가식', desc: '하루 마지막 소량 식사. 양이 제일 적음.', emoji: '➕', dots: '●○○○' },
]

export default function HelpButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* 플로팅 버튼 */}
      <button
        onClick={() => setOpen(true)}
        style={{
          position: 'fixed', bottom: 92, right: 24,
          width: 44, height: 44, borderRadius: '50%',
          background: '#e8e8e8', color: '#555',
          border: 'none', cursor: 'pointer',
          fontSize: 18, fontWeight: 700,
          boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 100,
        }}
        title="루본간추 설명"
      >?</button>

      {/* 모달 */}
      {open && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 200,
          display: 'flex', alignItems: 'flex-end',
        }} onClick={e => e.target === e.currentTarget && setOpen(false)}>
          <div style={{
            background: '#fff', borderRadius: '20px 20px 0 0',
            width: '100%', padding: '24px 20px 40px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 17, fontWeight: 700 }}>루본간추란?</div>
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#aaa' }}>✕</button>
            </div>

            <div style={{ fontSize: 13, color: '#666', marginBottom: 20, lineHeight: 1.6 }}>
              음식 종류 제한 없이 <strong>양만 조절</strong>하는 식사법.<br />
              감량기 3식, 유지기 4식이 기본.
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {MEALS.map((m, i) => (
                <div key={m.name} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 12,
                  padding: '12px 14px', background: '#f8f8f8', borderRadius: 12,
                }}>
                  <div style={{ fontSize: 22 }}>{m.emoji}</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>
                      {m.name}
                      <span style={{ fontSize: 11, color: '#aaa', fontWeight: 400, marginLeft: 6 }}>
                        {m.dots} 양
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: '#777', lineHeight: 1.5 }}>{m.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{
              marginTop: 16, padding: '12px 14px', background: '#f8f8f8',
              borderRadius: 12, fontSize: 12, color: '#888', lineHeight: 1.6,
            }}>
              💡 순서는 자유지만 <strong>루틴식이 첫 끼</strong>. 3일 양조절 → 4일째 먹고싶은 것으로 구성 반복.
            </div>
          </div>
        </div>
      )}
    </>
  )
}
