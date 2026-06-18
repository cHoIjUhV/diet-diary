import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const { mealSummary, totalCalories, date } = await req.json()

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 200,
    messages: [
      {
        role: 'user',
        content: `오늘(${date}) 식사 기록이에요:\n${mealSummary}\n총 ${totalCalories}kcal\n\n[루본간추 기준]\n- 루틴식: 하루 첫 끼, 중간 양\n- 본능식: 먹고 싶은 것, 양 최대\n- 간식: 소량 디저트·군것질\n- 추가식: 하루 마지막 소량 식사\n- 감량기 3식, 유지기 4식이 이상적\n- 음식 종류 제한 없이 양만 조절\n\n위 루본간추 기준으로 오늘 하루 식사를 평가해줘. 잘한 점과 한 가지 조언을 2~3문장으로, 친근한 말투로.`,
      },
    ],
  })

  const summary = response.content[0].type === 'text' ? response.content[0].text : ''
  return NextResponse.json({ summary })
}
