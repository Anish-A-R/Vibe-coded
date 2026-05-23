import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

// Keep a cached ZAI instance
let zaiInstance: Awaited<ReturnType<typeof ZAI.create>> | null = null

async function getZAI() {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create()
  }
  return zaiInstance
}

interface TranslateRequest {
  text: string
  sourceLanguage?: string
  targetLanguage?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: TranslateRequest = await request.json()
    const { text, sourceLanguage = 'auto', targetLanguage = 'en' } = body

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      )
    }

    const zai = await getZAI()

    const translationPrompt = `You are a precise translator. Translate the following text to ${targetLanguage === 'en' ? 'English' : targetLanguage}. 
${sourceLanguage !== 'auto' ? `The source language is ${sourceLanguage}.` : 'Detect the source language automatically.'}

Rules:
1. Only output the translated text, nothing else.
2. If the text is already in the target language, output it unchanged.
3. Preserve the meaning and intent exactly.
4. For commands (like "open YouTube", "search for X", "what time is it"), translate them to natural English commands.
5. Do not add explanations, prefixes, or quotes.

Text to translate:
${text}`

    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'assistant', content: translationPrompt },
        { role: 'user', content: text },
      ],
      thinking: { type: 'disabled' },
    })

    const translated = completion.choices[0]?.message?.content?.trim() || text

    return NextResponse.json({
      success: true,
      original: text,
      translated,
      sourceLanguage,
      targetLanguage,
    })
  } catch (error) {
    console.error('Translation API error:', error)
    return NextResponse.json(
      { error: 'Failed to translate text' },
      { status: 500 }
    )
  }
}
