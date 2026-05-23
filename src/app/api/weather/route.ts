import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

// ===== In-Memory Cache =====
interface CachedWeather {
  data: WeatherResponse
  timestamp: number
  location: string
}

interface ForecastDay {
  day: string
  high: number
  low: number
  condition: string
}

interface WeatherResponse {
  temp: number
  condition: string
  humidity: number
  wind: number
  location: string
  forecast: ForecastDay[]
  updated: string
  source: 'live' | 'simulated'
}

const CACHE_TTL = 10 * 60 * 1000 // 10 minutes
const WEATHER_FETCH_TIMEOUT = 8000 // 8 seconds max for real weather fetch
let cachedWeather: CachedWeather | null = null

// Keep a cached ZAI instance
let zaiInstance: Awaited<ReturnType<typeof ZAI.create>> | null = null

async function getZAI() {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create()
  }
  return zaiInstance
}

/**
 * Fetch real weather data using web search with timeout
 */
async function fetchRealWeather(location: string): Promise<WeatherResponse | null> {
  try {
    const zai = await getZAI()

    // Race the fetch against a timeout
    const result = await Promise.race([
      (async () => {
        const searchResults = await zai.functions.invoke('web_search', {
          query: `current weather ${location} temperature humidity wind speed`,
          num: 5,
        })

        if (!searchResults || searchResults.length === 0) {
          return null
        }

        // Combine snippets from search results
        const combinedText = searchResults.map((r: { snippet: string; name: string }) => `${r.name}: ${r.snippet}`).join(' | ')

        // Use AI to parse weather data from search results
        const completion = await zai.chat.completions.create({
          messages: [
            {
              role: 'system',
              content: `You are a weather data parser. Extract current weather information from the given text. Return ONLY a JSON object with this exact format, no other text:
{
  "temp": <number in Celsius>,
  "condition": "<weather condition string like 'Partly Cloudy', 'Sunny', 'Rain', etc>",
  "humidity": <number percentage>,
  "wind": <number in km/h>,
  "forecast": [
    {"day": "Today", "high": <number>, "low": <number>, "condition": "<string>"},
    {"day": "Tomorrow", "high": <number>, "low": <number>, "condition": "<string>"},
    {"day": "Day 3", "high": <number>, "low": <number>, "condition": "<string>"}
  ]
}
If you cannot find exact values, make reasonable estimates based on the text. Always return valid JSON.`,
            },
            {
              role: 'user',
              content: `Extract weather data for "${location}" from these search results:\n\n${combinedText}`,
            },
          ],
          thinking: { type: 'disabled' },
        })

        const responseText = completion.choices[0]?.message?.content || ''
        const jsonMatch = responseText.match(/\{[\s\S]*\}/)
        if (!jsonMatch) return null

        const parsed = JSON.parse(jsonMatch[0])

        return {
          temp: Number(parsed.temp) || 20,
          condition: String(parsed.condition || 'Unknown'),
          humidity: Number(parsed.humidity) || 50,
          wind: Number(parsed.wind) || 10,
          location,
          forecast: Array.isArray(parsed.forecast)
            ? parsed.forecast.map((f: Record<string, unknown>) => ({
                day: String(f.day || 'Day'),
                high: Number(f.high) || 20,
                low: Number(f.low) || 10,
                condition: String(f.condition || 'Unknown'),
              }))
            : [],
          updated: new Date().toISOString(),
          source: 'live' as const,
        }
      })(),
      new Promise<null>((resolve) =>
        setTimeout(() => resolve(null), WEATHER_FETCH_TIMEOUT)
      ),
    ])

    return result
  } catch (error) {
    console.error('Real weather fetch failed:', error)
    return null
  }
}

/**
 * Generate simulated weather data as fallback
 */
function getSimulatedWeather(location: string): WeatherResponse {
  const conditions = ['Clear Sky', 'Partly Cloudy', 'Cloudy', 'Light Rain', 'Sunny', 'Overcast']
  const condition = conditions[Math.floor(Math.random() * conditions.length)]

  const baseTemp = 22
  const tempVariation = Math.sin(Date.now() / 86400000) * 8 + (Math.random() * 4 - 2)

  return {
    temp: Math.round(baseTemp + tempVariation),
    condition,
    humidity: Math.round(55 + Math.random() * 25),
    wind: Math.round(8 + Math.random() * 15),
    location,
    forecast: [
      { day: 'Today', high: Math.round(baseTemp + tempVariation + 3), low: Math.round(baseTemp + tempVariation - 5), condition },
      { day: 'Tomorrow', high: Math.round(baseTemp + tempVariation + 5), low: Math.round(baseTemp + tempVariation - 3), condition: conditions[Math.floor(Math.random() * conditions.length)] },
      { day: 'Day 3', high: Math.round(baseTemp + tempVariation + 2), low: Math.round(baseTemp + tempVariation - 4), condition: conditions[Math.floor(Math.random() * conditions.length)] },
    ],
    updated: new Date().toISOString(),
    source: 'simulated',
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const location = searchParams.get('location') || 'Stark Tower, New York'
  const forceRefresh = searchParams.get('refresh') === 'true'

  // Check cache first (unless forced refresh)
  if (!forceRefresh && cachedWeather && cachedWeather.location === location) {
    const age = Date.now() - cachedWeather.timestamp
    if (age < CACHE_TTL) {
      return NextResponse.json(cachedWeather.data)
    }
  }

  // Try real weather data first
  let weatherData: WeatherResponse | null = null

  try {
    weatherData = await fetchRealWeather(location)
  } catch {
    // Real fetch failed, use simulated
  }

  // Fall back to simulated data
  if (!weatherData) {
    weatherData = getSimulatedWeather(location)
  }

  // Update cache
  cachedWeather = {
    data: weatherData,
    timestamp: Date.now(),
    location,
  }

  return NextResponse.json(weatherData)
}
