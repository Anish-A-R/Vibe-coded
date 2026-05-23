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

interface SearchResult {
  url: string
  name: string
  snippet: string
  host_name: string
  date: string
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const numParam = searchParams.get('num')
    const num = Math.min(Math.max(Number(numParam) || 5, 1), 10)

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Query parameter "q" is required' },
        { status: 400 }
      )
    }

    const zai = await getZAI()

    const searchResults = await zai.functions.invoke('web_search', {
      query: query.trim(),
      num,
    })

    const results: SearchResult[] = Array.isArray(searchResults)
      ? searchResults.map((r: Record<string, string>) => ({
          url: String(r.url || ''),
          name: String(r.name || ''),
          snippet: String(r.snippet || ''),
          host_name: String(r.host_name || ''),
          date: String(r.date || ''),
        }))
      : []

    return NextResponse.json({
      success: true,
      query: query.trim(),
      results,
    })
  } catch (error) {
    console.error('Web Search API error:', error)
    return NextResponse.json(
      { error: 'Failed to perform web search' },
      { status: 500 }
    )
  }
}
