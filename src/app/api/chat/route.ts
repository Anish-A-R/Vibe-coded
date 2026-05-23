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

// Languages that are NOT English - need translation
const NON_ENGLISH_LANGUAGES = new Set([
  'es-ES', 'fr-FR', 'de-DE', 'hi-IN', 'ja-JP', 'zh-CN',
  'pt-BR', 'ko-KR', 'ar-SA', 'it-IT', 'ru-RU',
])

interface ChatRequest {
  message: string
  personality: PersonalityMode
  history: { role: string; content: string }[]
  stream?: boolean
  language?: string
  translatedMessage?: string // Pre-translated message from client
}

/**
 * Translate non-English text to English for command processing
 */
async function translateToEnglish(text: string, sourceLanguage: string): Promise<string> {
  // If the language is English, no translation needed
  const langPrefix = sourceLanguage.split('-')[0]
  if (langPrefix === 'en') return text

  try {
    const zai = await getZAI()

    const translationPrompt = `You are a precise translator. Translate the following text from ${sourceLanguage} to English.

Rules:
1. Only output the translated text, nothing else.
2. Preserve the meaning and intent exactly.
3. For commands (like "यूटूब खोलो" → "open YouTube", "बताओ समय" → "what time is it"), translate them to natural English commands.
4. Do not add explanations, prefixes, quotes, or backticks.
5. If the text is already in English, output it unchanged.

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
    return translated
  } catch (error) {
    console.error('Translation error:', error)
    // Return original text if translation fails - the LLM can still handle it
    return text
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json()
    const {
      message,
      personality = 'professional',
      history = [],
      stream = true,
      language = 'en-US',
      translatedMessage,
    } = body

    if (!message || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    const zai = await getZAI()
    const systemPrompt = getSystemPrompt(personality)

    // Determine the English message for processing
    // If the client already translated it, use the translation
    // Otherwise, translate non-English messages for better command understanding
    let englishMessage = message
    if (translatedMessage) {
      englishMessage = translatedMessage
    } else if (NON_ENGLISH_LANGUAGES.has(language)) {
      englishMessage = await translateToEnglish(message, language)
    }

    // Add language instruction to system prompt
    const langInstruction = LANGUAGE_INSTRUCTIONS[language] || LANGUAGE_INSTRUCTIONS['en-US']

    // Add multilingual context to system prompt
    const multilingualContext = language.split('-')[0] !== 'en'
      ? `\n\nIMPORTANT: The user may speak in ${language}. They said: "${message}". The English translation is: "${englishMessage}". Process the English translation for understanding commands, but always respond in the user's language (${langInstruction}). If the user gave a command (like open website, search, etc.), execute it and respond in their language.`
      : ''

    const fullSystemPrompt = `${systemPrompt}\n\n${langInstruction}${multilingualContext}`

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

    // Add current message - use the original message for display but the system
    // prompt includes the English translation for command understanding
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
        translatedInput: englishMessage !== message ? englishMessage : undefined,
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
        let closed = false

        const safeEnqueue = (data: Uint8Array) => {
          if (closed) return false
          try {
            controller.enqueue(data)
            return true
          } catch {
            closed = true
            return false
          }
        }

        const safeClose = () => {
          if (closed) return
          closed = true
          try {
            controller.close()
          } catch {
            // Already closed - this is fine
          }
        }

        try {
          if (!fullResponse) {
            safeEnqueue(
              encoder.encode(`data: ${JSON.stringify({ error: 'No response from AI' })}\n\n`)
            )
            safeEnqueue(encoder.encode('data: [DONE]\n\n'))
            safeClose()
            return
          }

          // If input was translated, send the translation info first
          if (englishMessage !== message) {
            if (!safeEnqueue(
              encoder.encode(`data: ${JSON.stringify({ translatedInput: englishMessage, originalInput: message })}\n\n`)
            )) return
          }

          // Simulate streaming by sending the response in word chunks
          const words = fullResponse.split(/(\s+)/)
          for (const word of words) {
            if (!safeEnqueue(
              encoder.encode(`data: ${JSON.stringify({ content: word })}\n\n`)
            )) return
            // Small delay for natural streaming feel
            await new Promise((resolve) => setTimeout(resolve, 12))
          }

          // Send done signal
          safeEnqueue(encoder.encode('data: [DONE]\n\n'))
          safeClose()
        } catch (error) {
          console.error('Streaming error:', error)
          safeEnqueue(
            encoder.encode(`data: ${JSON.stringify({ error: 'Streaming failed' })}\n\n`)
          )
          safeEnqueue(encoder.encode('data: [DONE]\n\n'))
          safeClose()
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
