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
        content: `오늘(${date}) 식사 기록이에요:\n${mealSummary}\n총 ${totalCalories}kcal\n\n루본간추(루틴식-본능식-간식-추가식) 식사법 관점에서 오늘 하루 식사를 2~3문장으로 따뜻하게 총평해줘. 칭찬과 간단한 조언 포함. 친근한 말투로.`,
      },
    ],
  })

  const summary = response.content[0].type === 'text' ? response.content[0].text : ''
  return NextResponse.json({ summary })
}
