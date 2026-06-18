import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export type MealType = '루틴식' | '본능식' | '간식' | '추가식'

export interface MealLog {
  id: string
  date: string
  meal_type: MealType
  photo_url: string | null
  food_name: string | null
  calories: number | null
  is_representative: boolean
  note: string | null
  created_at: string
}
