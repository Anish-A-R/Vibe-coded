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

const VALID_SIZES = ['1024x1024', '768x1344', '1344x768', '1440x720'] as const
type ImageSize = (typeof VALID_SIZES)[number]

interface ImageRequest {
  prompt: string
  size?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: ImageRequest = await request.json()
    const { prompt, size = '1024x1024' } = body

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: 'Prompt is required and must be a non-empty string' },
        { status: 400 }
      )
    }

    if (!VALID_SIZES.includes(size as ImageSize)) {
      return NextResponse.json(
        { error: `Invalid size. Supported sizes: ${VALID_SIZES.join(', ')}` },
        { status: 400 }
      )
    }

    const zai = await getZAI()

    const result = await zai.images.generations.create({
      prompt: prompt.trim(),
      size: size as ImageSize,
    })

    const base64 = result.data?.[0]?.base64

    if (!base64) {
      return NextResponse.json(
        { error: 'Failed to generate image' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      image: base64,
      prompt: prompt.trim(),
    })
  } catch (error) {
    console.error('Image generation API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate image' },
      { status: 500 }
    )
  }
}
