import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'
import { getSystemPrompt } from '@/lib/personalities'
import type { PersonalityMode } from '@/hooks/useJarvisStore'

// Keep a cached ZAI instance
let zaiInstance: Awaited<ReturnType<typeof ZAI.create>> | null = null

async function getZAI() {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create()
  }
  return zaiInstance
}

// Language instructions for multilingual support
const LANGUAGE_INSTRUCTIONS: Record<string, string> = {
  'en-US': 'Respond in English.',
  'en-GB': 'Respond in British English.',
  'es-ES': 'Responde en español. Siempre usa español para todas las respuestas.',
  'fr-FR': 'Répondez en français. Utilisez toujours le français pour toutes les réponses.',
  'de-DE': 'Antworte auf Deutsch. Verwende immer Deutsch für alle Antworten.',
  'hi-IN': 'हिंदी में उत्तर दें। सभी उत्तरों के लिए हिंदी का उपयोग करें।',
  'ja-JP': '日本語で回答してください。すべての回答に日本語を使用してください。',
  'zh-CN': '请用中文回答。所有回答请使用中文。',
  'pt-BR': 'Responda em português brasileiro. Sempre use português para todas as respostas.',
  'ko-KR': '한국어로 답변하세요. 모든 답변에 한국어를 사용하세요.',
  'ar-SA': 'أجب باللغة العربية. استخدم العربية دائماً لجميع الإجابات.',
  'it-IT': 'Rispondi in italiano. Usa sempre l\'italiano per tutte le risposte.',
  'ru-RU': 'Отвечайте на русском языке. Всегда используйте русский для всех ответов.',
}

interface ChatRequest {
  message: string
  personality: PersonalityMode
  history: { role: string; content: string }[]
  stream?: boolean
  language?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json()
    const { message, personality = 'professional', history = [], stream = true, language = 'en-US' } = body

    if (!message || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    const zai = await getZAI()
    const systemPrompt = getSystemPrompt(personality)

    // Add language instruction to system prompt
    const langInstruction = LANGUAGE_INSTRUCTIONS[language] || LANGUAGE_INSTRUCTIONS['en-US']
    const fullSystemPrompt = `${systemPrompt}\n\n${langInstruction}`

    // Build messages array with history
    const messages: { role: string; content: string }[] = [
      { role: 'assistant', content: fullSystemPrompt },
    ]

    // Add conversation history (keep last 20 messages for context)
    const recentHistory = history.slice(-20)
    for (const msg of recentHistory) {
      messages.push({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content,
      })
    }

    // Add current message
    messages.push({ role: 'user', content: message })

    // Non-streaming fallback
    if (!stream) {
      const completion = await zai.chat.completions.create({
        messages,
        thinking: { type: 'disabled' },
      })

      const response = completion.choices[0]?.message?.content

      if (!response) {
        return NextResponse.json(
          { error: 'No response from AI' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        response,
        personality,
      })
    }

    // Streaming SSE response
    const encoder = new TextEncoder()

    // Get the full response first, then stream it in chunks
    const completion = await zai.chat.completions.create({
      messages,
      thinking: { type: 'disabled' },
    })

    const fullResponse = completion.choices[0]?.message?.content || ''

    const readable = new ReadableStream({
      async start(controller) {
        try {
          if (!fullResponse) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ error: 'No response from AI' })}\n\n`)
            )
            controller.enqueue(encoder.encode('data: [DONE]\n\n'))
            controller.close()
            return
          }

          // Simulate streaming by sending the response in word chunks
          const words = fullResponse.split(/(\s+)/)
          for (const word of words) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ content: word })}\n\n`)
            )
            // Small delay for natural streaming feel
            await new Promise((resolve) => setTimeout(resolve, 12))
          }

          // Send done signal
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        } catch (error) {
          console.error('Streaming error:', error)
          try {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ error: 'Streaming failed' })}\n\n`)
            )
            controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          } catch {
            // Controller already closed
          }
          try {
            controller.close()
          } catch {
            // Already closed
          }
        }
      },
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Failed to get AI response' },
      { status: 500 }
    )
  }
}
