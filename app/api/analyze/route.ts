import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
  const { imageBase64, mimeType } = await req.json()

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 300,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: mimeType, data: imageBase64 },
          },
          {
            type: 'text',
            text: '이 음식 사진을 보고 음식명과 예상 칼로리를 알려주세요. 반드시 JSON 형식으로만 답하세요: {"food_name": "음식명 (쉼표로 구분)", "calories": 숫자}',
          },
        ],
      },
    ],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) return NextResponse.json({ food_name: '분석 실패', calories: 0 })

  try {
    const result = JSON.parse(match[0])
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ food_name: '분석 실패', calories: 0 })
  }
  } catch (err) {
    console.error('analyze error:', err)
    return NextResponse.json({ food_name: '분석 실패', calories: 0 }, { status: 500 })
  }
}
